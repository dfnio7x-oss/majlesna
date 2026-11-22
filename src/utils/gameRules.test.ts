import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  checkXOWinner,
  getBestXOMove,
  resolveRPS,
  evaluateNumberGuess,
  evaluateWordGuess,
  generateMathQuestion,
  scrambleChars,
  assignMafiaRoles,
  checkMafiaWin,
  computeMatchRewards,
  evaluateAchievements,
  hasSudokuConflict,
  isSudokuSolved,
  evaluateMastermindGuess,
  isSlidingPuzzleSolved,
  canSlideTile,
  validateWordChainMove,
} from './gameRules';
import {
  encryptSensitive,
  decryptSensitive,
  computeUsernameBlindIndex,
  hashSecretArgon2id,
  verifySecretArgon2id,
  validateUsernameFormat,
} from '../../server/securityCrypto';
import { FIVE_LETTER_WORDS, MILLIONAIRE_TIERS } from '../data/questionBank';
import { CROSSWORD_PUZZLES, WORD_SEARCH_BOARDS } from '../data/phase2Bank';
import {
  changeRegisteredUsername,
  checkUsernameAvailability,
  claimInitialUsername,
  registerWithUsernamePassword,
  resetProfileStoreCacheForTests,
} from '../../server/profileStore';
import type { PlayerProfile } from '../types/game';

test('XO winner detection and AI move selection', () => {
  assert.deepEqual(checkXOWinner(['X', 'X', 'X', null, 'O', 'O', null, null, null]), {
    winner: 'X',
    line: [0, 1, 2],
  });
  assert.deepEqual(checkXOWinner(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']), {
    winner: 'draw',
    line: null,
  });
  assert.equal(getBestXOMove(['X', 'X', null, null, 'O', null, null, null, null], 'O'), 2);
  assert.equal(getBestXOMove(['O', 'O', null, 'X', 'X', null, null, null, null], 'O'), 2);
});

test('RPS resolution covers win, loss, and draw', () => {
  assert.equal(resolveRPS('rock', 'scissors'), 'p1');
  assert.equal(resolveRPS('rock', 'paper'), 'p2');
  assert.equal(resolveRPS('paper', 'paper'), 'draw');
});

test('Number guess proximity feedback', () => {
  assert.equal(evaluateNumberGuess(42, 42).proximity, 'exact');
  assert.equal(evaluateNumberGuess(40, 42).relation, 'higher');
  assert.equal(evaluateNumberGuess(40, 42).proximity, 'burning');
  assert.equal(evaluateNumberGuess(90, 42).proximity, 'cold');
});

test('Word guess handles duplicate letters accurately', () => {
  assert.deepEqual(evaluateWordGuess('ALLEY', 'APPLE'), [
    'correct',
    'present',
    'absent',
    'present',
    'absent',
  ]);
  assert.deepEqual(evaluateWordGuess('قلمون', 'قلمون'), [
    'correct',
    'correct',
    'correct',
    'correct',
    'correct',
  ]);
});

test('Math question generator produces valid answer and 4 unique options', () => {
  const q = generateMathQuestion(5, () => 0.42);
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4);
  assert.ok(q.options.includes(q.answer));
});

test('Word scramble preserves multiset of characters', () => {
  const scrambled = scrambleChars('شطرنج');
  assert.equal(scrambled.length, 5);
  assert.deepEqual([...scrambled].sort(), Array.from('شطرنج').sort());
});

test('Mafia role assignment and win conditions', () => {
  const roles = assignMafiaRoles(['p1', 'p2', 'p3', 'p4', 'p5']);
  const counts = Object.values(roles).reduce<Record<string, number>>((acc, role) => {
    acc[role] = (acc[role] ?? 0) + 1;
    return acc;
  }, {});
  assert.equal(counts.mafia, 1);
  assert.equal(counts.detective, 1);
  assert.equal(counts.doctor, 1);
  assert.equal(counts.citizen, 2);

  assert.equal(
    checkMafiaWin([
      { id: '1', name: 'A', role: 'mafia', alive: false },
      { id: '2', name: 'B', role: 'citizen', alive: true },
      { id: '3', name: 'C', role: 'doctor', alive: true },
    ]),
    'citizens'
  );
  assert.equal(
    checkMafiaWin([
      { id: '1', name: 'A', role: 'mafia', alive: true },
      { id: '2', name: 'B', role: 'citizen', alive: true },
      { id: '3', name: 'C', role: 'doctor', alive: false },
    ]),
    'mafia'
  );
});

test('Score rewards and achievements unlock deterministically', () => {
  assert.equal(computeMatchRewards('win', 80), 80);
  assert.equal(computeMatchRewards('draw', 80), 40);
  assert.equal(computeMatchRewards('loss', 80), 20);

  const profile: PlayerProfile = {
    id: 'u1',
    name: 'Test',
    avatarId: 0,
    accentColor: '#C84B31',
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    wins: 5,
    losses: 1,
    draws: 0,
    totalPoints: 550,
    gamesPlayed: { xo: 2, rps: 1, trivia: 1, memory: 1, mafia: 1 },
    unlockedAchievements: [],
    matchHistory: [],
  };
  const unlocked = evaluateAchievements(profile);
  assert.ok(unlocked.includes('first-match'));
  assert.ok(unlocked.includes('first-win'));
  assert.ok(unlocked.includes('five-wins'));
  assert.ok(unlocked.includes('points-500'));
  assert.ok(unlocked.includes('explorer-5'));
  assert.ok(unlocked.includes('social-strategist'));
});

test('Phase 2 Sudoku 4x4 conflict & solve detection', () => {
  const solved = [
    1, 2, 3, 4,
    3, 4, 1, 2,
    2, 1, 4, 3,
    4, 3, 2, 1,
  ];
  assert.equal(isSudokuSolved(solved), true);
  assert.equal(hasSudokuConflict(solved, 0, 1), false);
  const broken = [...solved];
  broken[1] = 1;
  assert.equal(isSudokuSolved(broken), false);
  assert.equal(hasSudokuConflict(broken, 0, 1), true);
});

test('Phase 2 Crack the Code (Mastermind) evaluates exact and misplaced pegs', () => {
  assert.deepEqual(evaluateMastermindGuess(['R', 'R', 'G', 'B'], ['R', 'G', 'Y', 'R']), {
    exact: 1,
    misplaced: 2,
  });
  assert.deepEqual(evaluateMastermindGuess(['R', 'G', 'Y', 'R'], ['R', 'G', 'Y', 'R']), {
    exact: 4,
    misplaced: 0,
  });
});

test('Phase 2 Sliding puzzle & Word chain helpers', () => {
  assert.equal(isSlidingPuzzleSolved([1, 2, 3, 4, 5, 6, 7, 8, 0]), true);
  assert.equal(isSlidingPuzzleSolved([1, 2, 3, 4, 5, 6, 8, 7, 0]), false);
  assert.equal(canSlideTile(5, 8, 3), true);
  assert.equal(canSlideTile(0, 8, 3), false);

  assert.equal(validateWordChainMove('قمر', 'رمال', ['قمر']).ok, true);
  assert.equal(validateWordChainMove('قمر', 'قمر', ['قمر']).reason, 'duplicate');
  assert.equal(validateWordChainMove('apple', 'elephant', ['apple']).ok, true);
  assert.equal(validateWordChainMove('apple', 'banana', ['apple']).reason, 'wrong_start');
});

test('Server security: username validation, AES-256-GCM, HMAC blind index, Argon2id PIN', async () => {
  assert.equal(validateUsernameFormat('ab').reason, 'too_short');
  assert.equal(validateUsernameFormat('admin').reason, 'reserved');
  assert.equal(validateUsernameFormat('أسد_99').valid, true);
  assert.equal(validateUsernameFormat('DiwanHero_7').reason, 'reserved');
  assert.equal(validateUsernameFormat('Majlisna_1').reason, 'reserved');
  assert.equal(validateUsernameFormat('مجلسنا_١').reason, 'reserved');
  assert.equal(validateUsernameFormat('NovaHero_7').valid, true);

  const secretPayload = JSON.stringify({ pinHash: 'test', uid: 'u_123' });
  const encrypted = encryptSensitive(secretPayload);
  assert.notEqual(encrypted, secretPayload);
  assert.equal(decryptSensitive(encrypted), secretPayload);

  const idx1 = computeUsernameBlindIndex('hero_1');
  const idx2 = computeUsernameBlindIndex('hero_1');
  assert.equal(idx1, idx2);
  assert.equal(idx1.length, 64);

  const hash = await hashSecretArgon2id('4829');
  assert.ok(hash.startsWith('$argon2id$'));
  assert.equal(await verifySecretArgon2id(hash, '4829'), true);
  assert.equal(await verifySecretArgon2id(hash, '0000'), false);
});

test('Expanded Math level 8 division/high-operand questions & 9-player Mafia roles', () => {
  let sawDivision = false;
  for (let i = 0; i < 40; i += 1) {
    const seed = (i * 0.0249 + 0.01) % 1;
    let calls = 0;
    const rng = () => {
      calls += 1;
      // Cover operator index 3 (÷) on high seeds and vary operands
      return ((seed + calls * 0.17) % 1);
    };
    const q = generateMathQuestion(8, rng);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
    if (q.prompt.includes('÷')) {
      sawDivision = true;
      assert.equal(Number.isInteger(q.answer), true);
    }
  }
  assert.equal(sawDivision, true);

  const nineRoles = assignMafiaRoles(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9']);
  const nineMafiaCount = Object.values(nineRoles).filter((r) => r === 'mafia').length;
  assert.equal(nineMafiaCount, 3);
});

test('QuestionBank & Phase2Bank integrity: 5-letter words, 20 Millionaire tiers, Crosswords, Word Search', () => {
  assert.equal(MILLIONAIRE_TIERS.length, 20);

  for (const lang of ['ar', 'en'] as const) {
    for (const w of FIVE_LETTER_WORDS[lang]) {
      assert.equal(Array.from(w).length, 5, `Expected 5-letter word for ${lang}: ${w}`);
    }

    for (const [pIdx, puzzle] of CROSSWORD_PUZZLES[lang].entries()) {
      for (const [dir, list] of [
        ['across', puzzle.clues.across],
        ['down', puzzle.clues.down],
      ] as const) {
        for (const clue of list) {
          const chars = Array.from(clue.answer);
          assert.ok(chars.length > 0, `Empty clue answer in ${lang} crossword #${pIdx}`);
          for (let i = 0; i < chars.length; i += 1) {
            const r = dir === 'across' ? clue.row : clue.row + i;
            const c = dir === 'across' ? clue.col + i : clue.col;
            const cell = puzzle.grid[r]?.[c];
            assert.equal(
              cell,
              chars[i],
              `Crossword ${lang}/#${pIdx} (${dir}) "${clue.clue[lang]}" mismatch at (${r},${c}): expected "${chars[i]}", got "${cell}"`
            );
          }
        }
      }
    }

    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    for (const board of WORD_SEARCH_BOARDS[lang]) {
      const rows = board.grid.length;
      const cols = board.grid[0]?.length ?? 0;
      for (const word of board.words) {
        const chars = Array.from(word);
        let found = false;
        for (let r = 0; r < rows && !found; r += 1) {
          for (let c = 0; c < cols && !found; c += 1) {
            for (const [dr, dc] of dirs) {
              let match = true;
              for (let k = 0; k < chars.length; k += 1) {
                const nr = r + dr * k;
                const nc = c + dc * k;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || board.grid[nr][nc] !== chars[k]) {
                  match = false;
                  break;
                }
              }
              if (match) {
                found = true;
                break;
              }
            }
          }
        }
        assert.equal(found, true, `Word "${word}" not found on ${lang} word-search board`);
      }
    }
  }
});

test('Username permanent lock prevents reuse of active and retired usernames across restarts', async () => {
  const dataDir = path.resolve(process.cwd(), 'data');
  const profilesFile = path.join(dataDir, 'profiles.json');
  const hadProfilesFile = fs.existsSync(profilesFile);
  const originalContent = hadProfilesFile ? fs.readFileSync(profilesFile, 'utf-8') : null;

  try {
    resetProfileStoreCacheForTests();
    const u1 = `ut_alpha_${Date.now().toString(36).slice(-5)}`;
    const u2 = `ut_beta_${Date.now().toString(36).slice(-5)}`;

    const reg = await registerWithUsernamePassword({
      rawUsername: u1,
      password: 'SecretPassword123',
      avatarId: 0,
      accentColor: '#C84B31',
    });
    assert.equal(reg.ok, true);
    assert.ok(reg.profile?.id);

    // Active username cannot be reused
    const dup = await registerWithUsernamePassword({
      rawUsername: u1,
      password: 'AnotherPassword123',
      avatarId: 1,
      accentColor: '#2D6A4F',
    });
    assert.equal(dup.ok, false);
    assert.equal(dup.reason, 'taken');

    // Cooldown must reject immediate rename before expiring
    const blockedRename = await changeRegisteredUsername({
      playerId: reg.profile!.id,
      rawUsername: u2,
    });
    assert.equal(blockedRename.ok, false);
    assert.equal(blockedRename.reason, 'cooldown_active');

    // Simulate 7 days passing on persisted store
    const parsed = JSON.parse(fs.readFileSync(profilesFile, 'utf-8')) as {
      records: Record<string, { profile: PlayerProfile }>;
    };
    parsed.records[reg.profile!.id].profile.nextUsernameChangeAt = new Date(Date.now() - 60_000).toISOString();
    fs.writeFileSync(profilesFile, JSON.stringify(parsed, null, 2), 'utf-8');
    resetProfileStoreCacheForTests();

    const renamed = await changeRegisteredUsername({
      playerId: reg.profile!.id,
      rawUsername: u2,
    });
    assert.equal(renamed.ok, true);
    assert.equal(renamed.profile?.usernameLower, u2.toLowerCase());

    // Simulate server restart by clearing in-memory cache
    resetProfileStoreCacheForTests();

    const oldCheck = checkUsernameAvailability(u1, undefined, 'register');
    assert.equal(oldCheck.available, false);
    assert.equal(oldCheck.reason, 'retired');

    const claimRetired = await claimInitialUsername({
      playerId: `temp_claim_${Date.now()}`,
      rawUsername: u1,
    });
    assert.equal(claimRetired.ok, false);
    assert.equal(claimRetired.reason, 'retired');

    const regRetired = await registerWithUsernamePassword({
      rawUsername: u1,
      password: 'AnotherPassword123',
    });
    assert.equal(regRetired.ok, false);
    assert.equal(regRetired.reason, 'retired');
  } finally {
    resetProfileStoreCacheForTests();
    if (hadProfilesFile && originalContent !== null) {
      fs.writeFileSync(profilesFile, originalContent, 'utf-8');
    } else if (!hadProfilesFile && fs.existsSync(profilesFile)) {
      fs.unlinkSync(profilesFile);
    }
    resetProfileStoreCacheForTests();
  }
});

