import type { GameId, MatchOutcome, PlayerProfile } from '../types/game';

// --- XO (Tic Tac Toe) ---
export type XOCell = 'X' | 'O' | null;

export interface XOCheckResult {
  winner: 'X' | 'O' | 'draw' | null;
  line: number[] | null;
}

const XO_WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function checkXOWinner(board: XOCell[]): XOCheckResult {
  for (const line of XO_WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return { winner: null, line: null };
}

export function getBestXOMove(board: XOCell[], aiMark: 'X' | 'O'): number {
  const humanMark: 'X' | 'O' = aiMark === 'X' ? 'O' : 'X';
  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : -1))
    .filter((idx) => idx !== -1);

  if (emptyIndices.length === 0) return -1;

  // 1. Win immediately if possible
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = aiMark;
    if (checkXOWinner(copy).winner === aiMark) return idx;
  }

  // 2. Block human win
  for (const idx of emptyIndices) {
    const copy = [...board];
    copy[idx] = humanMark;
    if (checkXOWinner(copy).winner === humanMark) return idx;
  }

  // 3. Take center if free
  if (board[4] === null) return 4;

  // 4. Take a corner
  const corners = [0, 2, 6, 8].filter((c) => board[c] === null);
  if (corners.length > 0) return corners[0];

  return emptyIndices[0];
}

// --- Rock Paper Scissors ---
export type RPSChoice = 'rock' | 'paper' | 'scissors';

export function resolveRPS(p1: RPSChoice, p2: RPSChoice): 'p1' | 'p2' | 'draw' {
  if (p1 === p2) return 'draw';
  if (
    (p1 === 'rock' && p2 === 'scissors') ||
    (p1 === 'paper' && p2 === 'rock') ||
    (p1 === 'scissors' && p2 === 'paper')
  ) {
    return 'p1';
  }
  return 'p2';
}

// --- Number Guess ---
export interface NumberGuessFeedback {
  relation: 'exact' | 'higher' | 'lower';
  proximity: 'exact' | 'burning' | 'warm' | 'cool' | 'cold';
  distance: number;
}

export function evaluateNumberGuess(guess: number, target: number): NumberGuessFeedback {
  const distance = Math.abs(guess - target);
  if (distance === 0) {
    return { relation: 'exact', proximity: 'exact', distance: 0 };
  }
  const relation = guess < target ? 'higher' : 'lower';
  let proximity: NumberGuessFeedback['proximity'] = 'cold';
  if (distance <= 3) proximity = 'burning';
  else if (distance <= 10) proximity = 'warm';
  else if (distance <= 25) proximity = 'cool';
  return { relation, proximity, distance };
}

// --- Word Guess (Wordle-style accurate duplicate handling) ---
export type LetterStatus = 'correct' | 'present' | 'absent';

export function evaluateWordGuess(guess: string, target: string): LetterStatus[] {
  const gChars = Array.from(guess);
  const tChars = Array.from(target);
  const result: LetterStatus[] = new Array(tChars.length).fill('absent');
  const remainingCounts = new Map<string, number>();

  // Pass 1: exact matches
  for (let i = 0; i < tChars.length; i++) {
    if (gChars[i] === tChars[i]) {
      result[i] = 'correct';
    } else {
      const ch = tChars[i];
      remainingCounts.set(ch, (remainingCounts.get(ch) ?? 0) + 1);
    }
  }

  // Pass 2: present in wrong position
  for (let i = 0; i < tChars.length; i++) {
    if (result[i] === 'correct') continue;
    const ch = gChars[i];
    const count = remainingCounts.get(ch) ?? 0;
    if (count > 0) {
      result[i] = 'present';
      remainingCounts.set(ch, count - 1);
    }
  }

  return result;
}

// --- Math Sprint Generator ---
export interface MathQuestion {
  prompt: string;
  answer: number;
  options: number[];
}

export function generateMathQuestion(level: number, rng: () => number = Math.random): MathQuestion {
  const ops = level >= 6 ? ['+', '-', '×', '÷'] : level >= 4 ? ['+', '-', '×'] : ['+', '-'];
  const op = ops[Math.floor(rng() * ops.length)];
  const maxNum = Math.min(12 + level * 7, 85);
  let a = Math.floor(rng() * maxNum) + 2;
  let b = Math.floor(rng() * maxNum) + 2;
  let answer = 0;

  if (op === '+') {
    answer = a + b;
  } else if (op === '-') {
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  } else if (op === '÷') {
    b = Math.floor(rng() * 10) + 2;
    answer = Math.floor(rng() * (8 + level * 2)) + 2;
    a = b * answer;
  } else {
    a = Math.floor(rng() * (10 + Math.min(6, level))) + 2;
    b = Math.floor(rng() * 11) + 2;
    answer = a * b;
  }

  const distractors = new Set<number>([answer]);
  let guard = 0;
  while (distractors.size < 4 && guard < 40) {
    guard++;
    const delta = (Math.floor(rng() * 7) + 1) * (rng() < 0.5 ? 1 : -1);
    const candidate = answer + delta;
    if (candidate >= 0 && candidate !== answer) {
      distractors.add(candidate);
    }
  }

  // Fallback if guard tripped
  let offset = 1;
  while (distractors.size < 4) {
    distractors.add(answer + offset);
    offset++;
  }

  const options = Array.from(distractors).sort(() => rng() - 0.5);
  return {
    prompt: `${a} ${op} ${b} = ?`,
    answer,
    options,
  };
}

// --- Word Scramble ---
export function scrambleChars(word: string, rng: () => number = Math.random): string[] {
  const chars = Array.from(word);
  if (chars.length <= 1) return chars;
  const copy = [...chars];
  for (let attempt = 0; attempt < 6; attempt++) {
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    if (copy.join('') !== word) break;
  }
  return copy;
}

// --- Mafia Roles & Win Condition ---
export type MafiaRole = 'mafia' | 'detective' | 'doctor' | 'citizen';

export interface MafiaPlayerState {
  id: string;
  name: string;
  role: MafiaRole;
  alive: boolean;
  isBot?: boolean;
}

export function assignMafiaRoles(playerIds: string[], rng: () => number = Math.random): Record<string, MafiaRole> {
  const shuffled = [...playerIds].sort(() => rng() - 0.5);
  const mafiaCount = shuffled.length >= 9 ? 3 : shuffled.length >= 7 ? 2 : 1;
  const assignments: Record<string, MafiaRole> = {};

  shuffled.forEach((id, idx) => {
    if (idx < mafiaCount) assignments[id] = 'mafia';
    else if (idx === mafiaCount) assignments[id] = 'detective';
    else if (idx === mafiaCount + 1) assignments[id] = 'doctor';
    else assignments[id] = 'citizen';
  });

  return assignments;
}

export function checkMafiaWin(players: MafiaPlayerState[]): 'mafia' | 'citizens' | null {
  const aliveMafia = players.filter((p) => p.alive && p.role === 'mafia').length;
  const aliveCitizens = players.filter((p) => p.alive && p.role !== 'mafia').length;

  if (aliveMafia === 0) return 'citizens';
  if (aliveMafia >= aliveCitizens) return 'mafia';
  return null;
}

// --- Profile Scoring & Achievements ---
export function computeMatchRewards(outcome: MatchOutcome, basePoints: number): number {
  const safeBase = Math.max(0, Math.round(basePoints));
  if (outcome === 'win') return Math.max(25, safeBase);
  if (outcome === 'draw') return Math.max(10, Math.round(safeBase * 0.5));
  return Math.max(5, Math.round(safeBase * 0.25));
}

export function evaluateAchievements(profile: PlayerProfile): string[] {
  const unlocked = new Set<string>(profile.unlockedAchievements);
  const totalMatches = profile.wins + profile.losses + profile.draws;
  const distinctGamesPlayed = Object.values(profile.gamesPlayed).filter((n) => (n ?? 0) > 0).length;

  if (totalMatches >= 1) unlocked.add('first-match');
  if (profile.wins >= 1) unlocked.add('first-win');
  if (profile.wins >= 5) unlocked.add('five-wins');
  if (profile.wins >= 15) unlocked.add('champion');
  if (profile.totalPoints >= 500) unlocked.add('points-500');
  if (profile.totalPoints >= 2000) unlocked.add('points-2000');
  if (distinctGamesPlayed >= 5) unlocked.add('explorer-5');
  if (distinctGamesPlayed >= 12) unlocked.add('explorer-12');
  if ((profile.gamesPlayed['millionaire'] ?? 0) >= 1) unlocked.add('quiz-master');
  if ((profile.gamesPlayed['mafia'] ?? 0) >= 1) unlocked.add('social-strategist');

  return Array.from(unlocked);
}

export function getMostPlayedGames(profile: PlayerProfile, limit = 3): { gameId: GameId; count: number }[] {
  return (Object.entries(profile.gamesPlayed) as [GameId, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([gameId, count]) => ({ gameId, count }));
}

// --- Phase 2 Helpers: Mini 4x4 Sudoku ---
export function hasSudokuConflict(board: number[], index: number, value: number): boolean {
  if (value <= 0) return false;
  const row = Math.floor(index / 4);
  const col = index % 4;
  for (let i = 0; i < 4; i++) {
    const rIdx = row * 4 + i;
    if (rIdx !== index && board[rIdx] === value) return true;
    const cIdx = i * 4 + col;
    if (cIdx !== index && board[cIdx] === value) return true;
  }
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 2) * 2;
  for (let r = boxRow; r < boxRow + 2; r++) {
    for (let c = boxCol; c < boxCol + 2; c++) {
      const bIdx = r * 4 + c;
      if (bIdx !== index && board[bIdx] === value) return true;
    }
  }
  return false;
}

export function isSudokuSolved(board: number[]): boolean {
  if (board.length !== 16) return false;
  for (let i = 0; i < 16; i++) {
    if (board[i] < 1 || board[i] > 4) return false;
    if (hasSudokuConflict(board, i, board[i])) return false;
  }
  return true;
}

// --- Phase 2 Helpers: Mastermind / Crack the Code ---
export interface MastermindFeedback {
  exact: number; // right color & right slot
  misplaced: number; // right color & wrong slot
}

export function evaluateMastermindGuess(guess: string[], secret: string[]): MastermindFeedback {
  let exact = 0;
  let misplaced = 0;
  const remainingSecret: Record<string, number> = {};
  const remainingGuess: string[] = [];

  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      exact++;
    } else {
      remainingSecret[secret[i]] = (remainingSecret[secret[i]] ?? 0) + 1;
      remainingGuess.push(guess[i]);
    }
  }

  for (const ch of remainingGuess) {
    if ((remainingSecret[ch] ?? 0) > 0) {
      misplaced++;
      remainingSecret[ch] -= 1;
    }
  }

  return { exact, misplaced };
}

// --- Phase 2 Helpers: Number Ordering (Sliding Grid) ---
export function isSlidingPuzzleSolved(tiles: number[]): boolean {
  if (tiles.length < 4) return false;
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
}

export function canSlideTile(tileIdx: number, emptyIdx: number, size: number): boolean {
  const r1 = Math.floor(tileIdx / size);
  const c1 = tileIdx % size;
  const r2 = Math.floor(emptyIdx / size);
  const c2 = emptyIdx % size;
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

// --- Phase 2 Helpers: Word Chain ---
export function normalizeChainChar(ch: string): string {
  if (!ch) return '';
  if (ch === 'أ' || ch === 'إ' || ch === 'آ') return 'ا';
  if (ch === 'ة') return 'ت';
  if (ch === 'ى') return 'ي';
  return ch.toLowerCase();
}

export function validateWordChainMove(
  prevWord: string,
  nextWord: string,
  usedWords: string[]
): { ok: boolean; reason?: 'empty' | 'too_short' | 'duplicate' | 'wrong_start' } {
  const clean = nextWord.trim();
  if (!clean) return { ok: false, reason: 'empty' };
  const chars = Array.from(clean);
  if (chars.length < 2) return { ok: false, reason: 'too_short' };
  const lowerUsed = usedWords.map((w) => w.trim().toLowerCase());
  if (lowerUsed.includes(clean.toLowerCase())) return { ok: false, reason: 'duplicate' };
  const prevChars = Array.from(prevWord.trim());
  const required = normalizeChainChar(prevChars[prevChars.length - 1] ?? '');
  const actual = normalizeChainChar(chars[0] ?? '');
  if (required && actual !== required) {
    return { ok: false, reason: 'wrong_start' };
  }
  return { ok: true };
}

