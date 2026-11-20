import test from 'node:test';
import assert from 'node:assert/strict';
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

