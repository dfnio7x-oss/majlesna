import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Delete, Eye, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import type { GameProps } from './GameShell';
import {
  CROSSWORD_PUZZLES,
  LOGIC_GRID_SCENARIOS,
  PATTERN_BANK,
  WORD_SEARCH_BANK,
} from '../../data/phase2Bank';
import {
  canSlideTile,
  evaluateMastermindGuess,
  hasSudokuConflict,
  isSlidingPuzzleSolved,
  isSudokuSolved,
} from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

/* ============================================================================
 * 1. SUDOKU PARTY (4x4 Multi-board Speed Sudoku)
 * ============================================================================ */
const SUDOKU_PUZZLES: { given: number[]; solution: number[] }[] = [
  {
    given: [1, 0, 0, 4, 0, 4, 1, 0, 0, 1, 4, 0, 4, 0, 0, 1],
    solution: [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1],
  },
  {
    given: [0, 3, 0, 1, 1, 0, 3, 0, 0, 4, 0, 3, 3, 0, 1, 0],
    solution: [2, 3, 4, 1, 1, 4, 3, 2, 4, 1, 2, 3, 3, 2, 1, 4],
  },
  {
    given: [4, 0, 2, 0, 0, 2, 0, 4, 2, 0, 4, 0, 0, 4, 0, 2],
    solution: [4, 1, 2, 3, 3, 2, 1, 4, 2, 3, 4, 1, 1, 4, 3, 2],
  },
];

export const GameSudokuParty: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = SUDOKU_PUZZLES[puzzleIdx];
  const [board, setBoard] = useState<number[]>(() => [...puzzle.given]);
  const [selected, setSelected] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [done]);

  const selectPuzzle = (idx: number) => {
    setPuzzleIdx(idx);
    setBoard([...SUDOKU_PUZZLES[idx].given]);
    setSelected(null);
  };

  const setCell = (val: number) => {
    if (selected === null || puzzle.given[selected] !== 0 || done) return;
    const next = [...board];
    next[selected] = val;
    setBoard(next);
    if (val > 0 && hasSudokuConflict(next, selected, val)) {
      soundEngine.playError();
    } else {
      soundEngine.playClick();
    }
    if (isSudokuSolved(next)) {
      soundEngine.playPoint();
      const roundPts = Math.max(40, 100 - Math.floor(elapsed / 2));
      const total = score + roundPts;
      setScore(total);
      onScoreProgress?.(total);
      if (puzzleIdx < SUDOKU_PUZZLES.length - 1) {
        window.setTimeout(() => selectPuzzle(puzzleIdx + 1), 650);
      } else {
        setDone(true);
        onFinish({
          outcome: 'win',
          score: total,
          summaryText: lang === 'ar' ? `أنهيت جميع لوحات السودوكو في ${elapsed}ث` : `Solved all Sudoku boards in ${elapsed}s`,
        });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>{lang === 'ar' ? `اللوحة ${puzzleIdx + 1}/${SUDOKU_PUZZLES.length}` : `Board ${puzzleIdx + 1}/${SUDOKU_PUZZLES.length}`}</span>
        <span className="font-mono-tabular text-[#C84B31]">{elapsed}s</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 max-w-[280px] mx-auto bg-[#E5DEC9] dark:bg-[#342E28] p-2 rounded-2xl" dir="ltr">
        {board.map((val, idx) => {
          const isFixed = puzzle.given[idx] !== 0;
          const isSelected = selected === idx;
          const conflict = val > 0 && hasSudokuConflict(board, idx, val);
          const row = Math.floor(idx / 4);
          const col = idx % 4;
          const rightSep = col === 1 ? 'me-1' : '';
          const bottomSep = row === 1 ? 'mb-1' : '';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!isFixed) {
                  soundEngine.playClick();
                  setSelected(idx);
                }
              }}
              className={`aspect-square rounded-xl font-mono-tabular text-xl font-bold flex items-center justify-center border-2 transition-all ${rightSep} ${bottomSep} ${
                isFixed
                  ? 'bg-[#F1ECE2] dark:bg-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] border-transparent cursor-default'
                  : isSelected
                  ? 'bg-[#FFF5F2] dark:bg-[#3A241E] border-[#C84B31] text-[#C84B31] cursor-pointer'
                  : conflict
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-400 text-red-600 cursor-pointer'
                  : 'bg-white dark:bg-[#1E1B18] border-transparent text-[#2B4C7E] dark:text-[#93C5FD] cursor-pointer hover:border-[#C84B31]/50'
              }`}
            >
              {val || ''}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-2" dir="ltr">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setCell(num)}
            className="w-12 h-12 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] font-mono-tabular text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCell(0)}
          aria-label="Clear cell"
          className="w-12 h-12 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] border border-[#E5DEC9] dark:border-[#342E28] flex items-center justify-center text-[#57534E] dark:text-[#B8AFA3] cursor-pointer"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. SOLVE PUZZLE (Logic Deduction Grid)
 * ============================================================================ */
export const GameSolvePuzzle: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = LOGIC_GRID_SCENARIOS[scenarioIdx];
  const [picks, setPicks] = useState<number[]>([0, 1, 2]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const cyclePick = (personIdx: number, itemIdx: number) => {
    soundEngine.playClick();
    setFeedback(null);
    setPicks((prev) => {
      const next = [...prev];
      next[personIdx] = itemIdx;
      return next;
    });
  };

  const checkSolution = () => {
    const correct = picks.every((val, i) => val === scenario.solution[i]);
    if (correct) {
      soundEngine.playPoint();
      const nextScore = score + 40;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (scenarioIdx + 1 < LOGIC_GRID_SCENARIOS.length) {
        setFeedback(lang === 'ar' ? 'استنتاج صحيح! ننتقل للغز التالي...' : 'Spot on! Next deduction...');
        window.setTimeout(() => {
          setScenarioIdx((i) => i + 1);
          setPicks([0, 1, 2]);
          setFeedback(null);
        }, 700);
      } else {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText: lang === 'ar' ? 'حللت جميع ألغاز الاستنتاج المنطقي!' : 'Solved every logic deduction puzzle!',
        });
      }
    } else {
      soundEngine.playError();
      setFeedback(lang === 'ar' ? 'تحقق من الدلائل مجدداً — هناك تعارض!' : 'Check the clues again — mismatch detected!');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{scenario.title[lang]} ({scenarioIdx + 1}/{LOGIC_GRID_SCENARIOS.length})</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#C84B31]">
          <Lightbulb className="w-4 h-4" />
          <span>{lang === 'ar' ? 'الدلائل' : 'Clues'}</span>
        </div>
        <ul className="list-disc ps-5 space-y-1 text-sm text-[#1C1917] dark:text-[#F5F2EB]">
          {scenario.clues[lang].map((clue, idx) => (
            <li key={idx}>{clue}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {scenario.people.map((person, pIdx) => (
          <div
            key={pIdx}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] flex flex-wrap items-center justify-between gap-2"
          >
            <span className="font-display font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
              {person[lang]}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {scenario.items.map((item, iIdx) => {
                const active = picks[pIdx] === iIdx;
                return (
                  <button
                    key={iIdx}
                    type="button"
                    onClick={() => cyclePick(pIdx, iIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#C84B31] text-white border-[#C84B31]'
                        : 'bg-[#FAF8F4] dark:bg-[#25211D] text-[#57534E] dark:text-[#B8AFA3] border-[#E5DEC9] dark:border-[#342E28]'
                    }`}
                  >
                    {item[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <p className="text-center text-xs font-semibold text-[#C84B31]">{feedback}</p>
      )}

      <button
        type="button"
        onClick={checkSolution}
        className="w-full h-11 rounded-xl bg-[#2D6A4F] hover:bg-[#23533D] text-white text-sm font-semibold tactile-btn cursor-pointer"
      >
        {lang === 'ar' ? 'تحقق من الحل' : 'Verify Deduction'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 3. SPOT THE DIFFERENCES (Dual SVG Visual Scenes)
 * ============================================================================ */
interface DiffHotspot {
  id: string;
  x: number;
  y: number;
  r: number;
}

const DIFFERENCE_SCENES: {
  title: { ar: string; en: string };
  hotspots: DiffHotspot[];
  renderScene: (isModified: boolean) => React.ReactNode;
}[] = [
  {
    title: { ar: 'مخيم الصحراء', en: 'Desert Camp' },
    hotspots: [
      { id: 'moon', x: 185, y: 38, r: 22 },
      { id: 'flag', x: 100, y: 66, r: 20 },
      { id: 'cactus', x: 35, y: 120, r: 22 },
      { id: 'fire', x: 150, y: 142, r: 22 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#1F2937" />
        <path d="M0 130 Q60 110 120 128 T220 122 L220 170 L0 170 Z" fill="#D97706" opacity="0.85" />
        {/* Moon / Sun difference */}
        <circle cx="185" cy="38" r={mod ? 16 : 12} fill={mod ? '#FDE68A' : '#FBBF24'} />
        {/* Tent */}
        <polygon points="62,132 100,72 138,132" fill="#C84B31" />
        <polygon points="88,132 100,98 112,132" fill="#7C2D12" />
        {/* Flag difference */}
        {!mod ? (
          <path d="M100 72 L100 54 L118 60 L100 66" fill="#34D399" />
        ) : (
          <path d="M100 72 L100 54 L118 60 L100 66" fill="#60A5FA" />
        )}
        {/* Cactus difference */}
        <rect x="30" y="96" width="10" height="36" rx="5" fill="#2D6A4F" />
        {!mod && <rect x="20" y="106" width="12" height="6" rx="3" fill="#2D6A4F" />}
        {/* Campfire difference */}
        <polygon points="142,148 150,126 158,148" fill={mod ? '#60A5FA' : '#F97316'} />
        <rect x="138" y="146" width="24" height="5" rx="2" fill="#78350F" />
      </svg>
    ),
  },
  {
    title: { ar: 'ميناء القوارب', en: 'Sunny Harbor' },
    hotspots: [
      { id: 'cloud', x: 52, y: 36, r: 22 },
      { id: 'sail', x: 118, y: 82, r: 24 },
      { id: 'bird', x: 174, y: 42, r: 20 },
      { id: 'buoy', x: 48, y: 136, r: 20 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#DBEAFE" />
        <rect y="112" width="220" height="58" fill="#2563EB" opacity="0.82" />
        {/* Cloud difference */}
        <circle cx="48" cy="36" r="12" fill={mod ? '#FDE047' : '#FFFFFF'} />
        <circle cx="60" cy="36" r="10" fill={mod ? '#FDE047' : '#FFFFFF'} />
        {/* Boat & sail difference */}
        <polygon points="88,118 152,118 142,134 98,134" fill="#92400E" />
        <polygon points="116,56 116,112 146,112" fill={mod ? '#C84B31' : '#FFFFFF'} />
        {/* Bird difference */}
        {!mod && (
          <path d="M164 42 Q170 34 176 42 Q182 34 188 42" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* Buoy difference */}
        <circle cx="48" cy="136" r={mod ? 9 : 6} fill={mod ? '#10B981' : '#EF4444'} />
      </svg>
    ),
  },
];

export const GameSpotDifferences: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const scene = DIFFERENCE_SCENES[sceneIdx];

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 220;
    const y = ((e.clientY - rect.top) / rect.height) * 170;

    const hit = scene.hotspots.find(
      (h) => !foundIds.includes(h.id) && Math.hypot(h.x - x, h.y - y) <= h.r
    );

    if (hit) {
      soundEngine.playPoint();
      const nextFound = [...foundIds, hit.id];
      const nextScore = score + 25;
      setFoundIds(nextFound);
      setScore(nextScore);
      onScoreProgress?.(nextScore);

      if (nextFound.length >= scene.hotspots.length) {
        if (sceneIdx + 1 < DIFFERENCE_SCENES.length) {
          window.setTimeout(() => {
            setSceneIdx((i) => i + 1);
            setFoundIds([]);
          }, 700);
        } else {
          window.setTimeout(() => {
            onFinish({
              outcome: 'win',
              score: nextScore,
              summaryText: lang === 'ar' ? 'اكتشفت كل الاختلافات بدقة!' : 'Spotted every visual difference!',
            });
          }, 500);
        }
      }
    } else {
      soundEngine.playError();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>{scene.title[lang]}</span>
        <span className="font-mono-tabular text-[#C84B31]">
          {foundIds.length}/{scene.hotspots.length}
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar'
          ? 'اضغط على الاختلافات في الصورة المعدّلة (الثانية)'
          : 'Tap the differences on the modified scene (second panel)'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'الأصلية' : 'Original'}
          </span>
          {scene.renderScene(false)}
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#C84B31]">
            {lang === 'ar' ? 'اضغط هنا على الاختلافات' : 'Tap differences here'}
          </span>
          <div onClick={handleSceneClick} className="relative cursor-crosshair">
            {scene.renderScene(true)}
            <svg viewBox="0 0 220 170" className="absolute inset-0 w-full h-full pointer-events-none">
              {scene.hotspots
                .filter((h) => foundIds.includes(h.id))
                .map((h) => (
                  <circle
                    key={h.id}
                    cx={h.x}
                    cy={h.y}
                    r={16}
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="3"
                  />
                ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. COMPLETE PATTERN
 * ============================================================================ */
export const GameCompletePattern: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = PATTERN_BANK[idx];

  const handlePick = (optIdx: number) => {
    if (picked !== null) return;
    setPicked(optIdx);
    const correct = optIdx === q.answerIndex;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    window.setTimeout(() => {
      if (idx + 1 >= PATTERN_BANK.length) {
        onFinish({
          outcome: nextScore >= 75 ? 'win' : 'draw',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, 1000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1} / {PATTERN_BANK.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 py-4" dir="ltr">
        {q.sequence.map((item, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-xl font-mono-tabular text-lg font-bold flex items-center justify-center border ${
              item === '?'
                ? 'bg-[#C84B31]/10 border-[#C84B31] text-[#C84B31]'
                : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3" dir="ltr">
        {q.options.map((opt, optIdx) => {
          let cls = 'bg-white dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]';
          if (picked !== null) {
            if (optIdx === q.answerIndex) cls = 'bg-[#2D6A4F] text-white border-[#2D6A4F]';
            else if (optIdx === picked) cls = 'bg-red-600 text-white border-red-600';
          }
          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => handlePick(optIdx)}
              className={`h-14 rounded-2xl border-2 font-mono-tabular text-lg font-bold tactile-btn cursor-pointer ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className="text-xs font-medium text-[#57534E] dark:text-[#B8AFA3]">{q.rule[lang]}</p>
      )}
    </div>
  );
};

/* ============================================================================
 * 5. NUMBER ORDERING (Solvable 3x3 Sliding Puzzle)
 * ============================================================================ */
function makeShuffledTiles(): number[] {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let empty = 8;
  for (let step = 0; step < 36; step++) {
    const r = Math.floor(empty / 3);
    const c = empty % 3;
    const neighbors: number[] = [];
    if (r > 0) neighbors.push((r - 1) * 3 + c);
    if (r < 2) neighbors.push((r + 1) * 3 + c);
    if (c > 0) neighbors.push(r * 3 + (c - 1));
    if (c < 2) neighbors.push(r * 3 + (c + 1));
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [arr[empty], arr[pick]] = [arr[pick], arr[empty]];
    empty = pick;
  }
  return isSlidingPuzzleSolved(arr) ? makeShuffledTiles() : arr;
}

export const GameNumberOrdering: React.FC<GameProps> = ({ lang, onFinish }) => {
  const [tiles, setTiles] = useState<number[]>(() => makeShuffledTiles());
  const [moves, setMoves] = useState(0);

  const handleTileClick = (idx: number) => {
    const emptyIdx = tiles.indexOf(0);
    if (!canSlideTile(idx, emptyIdx, 3)) return;
    soundEngine.playClick();
    const next = [...tiles];
    [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
    const nextMoves = moves + 1;
    setTiles(next);
    setMoves(nextMoves);

    if (isSlidingPuzzleSolved(next)) {
      soundEngine.playPoint();
      const score = Math.max(40, 120 - nextMoves);
      onFinish({
        outcome: 'win',
        score,
        summaryText: lang === 'ar' ? `رتّبت الشبكة خلال ${nextMoves} حركة!` : `Ordered the grid in ${nextMoves} moves!`,
      });
    }
  };

  return (
    <div className="max-w-xs mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>{lang === 'ar' ? 'الحركات:' : 'Moves:'} <strong className="font-mono-tabular text-[#C84B31]">{moves}</strong></span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setTiles(makeShuffledTiles());
            setMoves(0);
          }}
          className="flex items-center gap-1 text-[#2B4C7E] dark:text-[#60A5FA] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'خلط' : 'Shuffle'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#E5DEC9] dark:bg-[#342E28]" dir="ltr">
        {tiles.map((num, idx) => (
          <button
            key={idx}
            type="button"
            disabled={num === 0}
            onClick={() => handleTileClick(idx)}
            className={`aspect-square rounded-xl font-mono-tabular text-2xl font-bold flex items-center justify-center transition-all ${
              num === 0
                ? 'bg-transparent cursor-default'
                : 'bg-white dark:bg-[#1E1B18] text-[#1C1917] dark:text-[#F5F2EB] border border-[#D4CBB3] dark:border-[#443D35] hover:border-[#C84B31] tactile-btn cursor-pointer shadow-xs'
            }`}
          >
            {num === 0 ? '' : num}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 6. CRACK CODE (Mastermind 4-Peg Deduction)
 * ============================================================================ */
const CODE_COLORS = [
  { id: 'R', hex: '#C84B31' },
  { id: 'G', hex: '#2D6A4F' },
  { id: 'B', hex: '#2B4C7E' },
  { id: 'Y', hex: '#D97706' },
  { id: 'P', hex: '#7C3AED' },
  { id: 'T', hex: '#0F766E' },
];

export const GameCrackCode: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [secret] = useState<string[]>(() =>
    Array.from({ length: 4 }, () => CODE_COLORS[Math.floor(Math.random() * CODE_COLORS.length)].id)
  );
  const [currentGuess, setCurrentGuess] = useState<string[]>(['R', 'G', 'B', 'Y']);
  const [history, setHistory] = useState<{ guess: string[]; exact: number; misplaced: number }[]>([]);

  const cycleSlot = (slotIdx: number) => {
    soundEngine.playClick();
    setCurrentGuess((prev) => {
      const next = [...prev];
      const curColorIdx = CODE_COLORS.findIndex((c) => c.id === next[slotIdx]);
      next[slotIdx] = CODE_COLORS[(curColorIdx + 1) % CODE_COLORS.length].id;
      return next;
    });
  };

  const submitGuess = () => {
    const fb = evaluateMastermindGuess(currentGuess, secret);
    const nextHistory = [{ guess: [...currentGuess], ...fb }, ...history];
    setHistory(nextHistory);

    if (fb.exact === 4) {
      soundEngine.playPoint();
      const score = Math.max(40, 130 - nextHistory.length * 10);
      onScoreProgress?.(score);
      onFinish({
        outcome: 'win',
        score,
        summaryText: lang === 'ar' ? `كسرت الشفرة في ${nextHistory.length} محاولة!` : `Cracked the code in ${nextHistory.length} attempts!`,
      });
    } else if (nextHistory.length >= 8) {
      soundEngine.playError();
      onFinish({
        outcome: 'loss',
        score: 20,
        summaryText: lang === 'ar' ? `نفدت المحاولات الثماني!` : `Out of 8 attempts!`,
      });
    } else {
      soundEngine.playClick();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>{lang === 'ar' ? 'اضغط على الدوائر لتغيير اللون' : 'Tap pegs to cycle colors'}</span>
        <span className="font-mono-tabular text-[#C84B31]">{history.length}/8</span>
      </div>

      <div className="flex items-center justify-center gap-3" dir="ltr">
        {currentGuess.map((cid, idx) => {
          const hex = CODE_COLORS.find((c) => c.id === cid)?.hex ?? '#C84B31';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => cycleSlot(idx)}
              className="w-12 h-12 rounded-full border-2 border-white dark:border-[#1E1B18] shadow-md cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: hex }}
            />
          );
        })}
        <button
          type="button"
          onClick={submitGuess}
          className="h-12 px-4 rounded-xl bg-[#1C1917] dark:bg-[#C84B31] text-white text-xs font-semibold tactile-btn cursor-pointer"
        >
          {lang === 'ar' ? 'اختبر' : 'Check'}
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {history.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
            dir="ltr"
          >
            <div className="flex gap-2">
              {row.guess.map((cid, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded-full inline-block"
                  style={{ backgroundColor: CODE_COLORS.find((c) => c.id === cid)?.hex }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-tabular font-bold">
              <span className="text-[#2D6A4F] dark:text-[#52B788]">● {row.exact}</span>
              <span className="text-[#D97706]">◐ {row.misplaced}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 7. STRONGEST MEMORY (Simon Musical Sequence)
 * ============================================================================ */
const SIMON_PADS = [
  { id: 0, color: '#C84B31', label: { ar: 'أحمر', en: 'Ruby' } },
  { id: 1, color: '#2D6A4F', label: { ar: 'زمردي', en: 'Emerald' } },
  { id: 2, color: '#2B4C7E', label: { ar: 'أزرق', en: 'Sapphire' } },
  { id: 3, color: '#D97706', label: { ar: 'ذهبي', en: 'Amber' } },
];

export const GameStrongestMemory: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [sequence, setSequence] = useState<number[]>(() => [Math.floor(Math.random() * 4)]);
  const [userStep, setUserStep] = useState(0);
  const [litPad, setLitPad] = useState<number | null>(null);
  const [playingDemo, setPlayingDemo] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPlayingDemo(true);
    sequence.forEach((pad, idx) => {
      window.setTimeout(() => {
        if (cancelled) return;
        setLitPad(pad);
        soundEngine.playClick();
      }, idx * 520 + 250);
      window.setTimeout(() => {
        if (cancelled) return;
        setLitPad(null);
        if (idx === sequence.length - 1) setPlayingDemo(false);
      }, idx * 520 + 620);
    });
    return () => {
      cancelled = true;
    };
  }, [sequence]);

  const handlePadTap = (padId: number) => {
    if (playingDemo) return;
    setLitPad(padId);
    window.setTimeout(() => setLitPad(null), 180);

    if (padId !== sequence[userStep]) {
      soundEngine.playError();
      onFinish({
        outcome: score >= 60 ? 'win' : 'draw',
        score,
        summaryText: lang === 'ar' ? `حفظت سلسلة من ${sequence.length - 1} خطوات!` : `Memorized a sequence of ${sequence.length - 1}!`,
      });
      return;
    }

    soundEngine.playPoint();
    if (userStep + 1 >= sequence.length) {
      const nextScore = score + 20;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (sequence.length >= 6) {
        onFinish({
          outcome: 'win',
          score: nextScore + 30,
          summaryText: lang === 'ar' ? 'ذاكرة فولاذية! أكملت 6 مستويات!' : 'Unbreakable memory across all 6 stages!',
        });
      } else {
        setUserStep(0);
        setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
      }
    } else {
      setUserStep((s) => s + 1);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>{lang === 'ar' ? `السلسلة: ${sequence.length}` : `Length: ${sequence.length}`}</span>
        <span>{playingDemo ? (lang === 'ar' ? 'شاهد النمط...' : 'Watch...') : (lang === 'ar' ? 'دورك الآن!' : 'Your turn!')}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {SIMON_PADS.map((pad) => {
          const active = litPad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              disabled={playingDemo}
              onClick={() => handlePadTap(pad.id)}
              style={{ backgroundColor: pad.color }}
              className={`h-28 rounded-2xl text-white font-display font-bold text-base transition-all cursor-pointer ${
                active ? 'scale-105 ring-4 ring-white shadow-xl brightness-125' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {pad.label[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 8. CROSSWORD CHALLENGE (4x4 Interactive Bilingual Mini Crossword)
 * ============================================================================ */
export const GameCrosswordChallenge: React.FC<GameProps> = ({ lang, onFinish }) => {
  const puzzles = CROSSWORD_PUZZLES[lang];
  const [pIdx] = useState(() => Math.floor(Math.random() * puzzles.length));
  const puzzle = puzzles[pIdx];
  const [entries, setEntries] = useState<string[][]>(() =>
    puzzle.grid.map((row) => row.map((ch) => (ch === '#' ? '#' : '')))
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const updateCell = (r: number, c: number, raw: string) => {
    const char = Array.from(raw.trim().toUpperCase()).slice(-1)[0] ?? '';
    setEntries((prev) =>
      prev.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? char : val)))
    );
  };

  const verifyCrossword = () => {
    let correctCells = 0;
    let totalCells = 0;
    puzzle.grid.forEach((row, r) =>
      row.forEach((ch, c) => {
        if (ch !== '#') {
          totalCells++;
          if ((entries[r]?.[c] ?? '').toUpperCase() === ch.toUpperCase()) correctCells++;
        }
      })
    );
    if (correctCells === totalCells) {
      soundEngine.playPoint();
      onFinish({
        outcome: 'win',
        score: 110,
        summaryText: lang === 'ar' ? 'أكملت الكلمات المتقاطعة بنجاح!' : 'Completed the mini crossword!',
      });
    } else {
      soundEngine.playError();
      setStatusMsg(
        lang === 'ar'
          ? `تطابقت ${correctCells} من ${totalCells} خانة — أكمل البقية!`
          : `${correctCells}/${totalCells} letters match so far.`
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div
          className="grid gap-1.5 max-w-[260px] mx-auto bg-[#E5DEC9] dark:bg-[#342E28] p-2 rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {puzzle.grid.map((row, r) =>
            row.map((ch, c) =>
              ch === '#' ? (
                <div key={`${r}-${c}`} className="aspect-square rounded-lg bg-[#1C1917] dark:bg-[#0F0E0C]" />
              ) : (
                <input
                  key={`${r}-${c}`}
                  type="text"
                  maxLength={2}
                  value={entries[r][c]}
                  onChange={(e) => updateCell(r, c, e.target.value)}
                  className="aspect-square w-full rounded-lg bg-white dark:bg-[#1E1B18] border border-[#D4CBB3] dark:border-[#443D35] text-center font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                />
              )
            )
          )}
        </div>
        {statusMsg && <p className="text-center text-xs font-semibold text-[#C84B31]">{statusMsg}</p>}
        <button
          type="button"
          onClick={verifyCrossword}
          className="w-full h-11 rounded-xl bg-[#2D6A4F] hover:bg-[#23533D] text-white text-sm font-semibold tactile-btn cursor-pointer"
        >
          {lang === 'ar' ? 'تحقق من الحل' : 'Verify Crossword'}
        </button>
      </div>

      <div className="space-y-4 bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-4 text-sm">
        <div>
          <h3 className="font-display font-bold text-[#C84B31] mb-1.5">
            {lang === 'ar' ? 'أفقي' : 'Across'}
          </h3>
          <ul className="space-y-1 text-xs text-[#1C1917] dark:text-[#F5F2EB]">
            {puzzle.clues.across.map((cl) => (
              <li key={cl.num}>
                <strong>{cl.num}.</strong> {cl.clue[lang]}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display font-bold text-[#2B4C7E] dark:text-[#60A5FA] mb-1.5">
            {lang === 'ar' ? 'عمودي' : 'Down'}
          </h3>
          <ul className="space-y-1 text-xs text-[#1C1917] dark:text-[#F5F2EB]">
            {puzzle.clues.down.map((cl) => (
              <li key={cl.num}>
                <strong>{cl.num}.</strong> {cl.clue[lang]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 9. HIDDEN WORD (6x6 Interactive Word Search Grid)
 * ============================================================================ */
export const GameHiddenWord: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const bank = WORD_SEARCH_BANK[lang];
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number; ch: string }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundKeys, setFoundKeys] = useState<string[]>([]);

  const toggleCell = (r: number, c: number, ch: string) => {
    soundEngine.playClick();
    const exists = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);
    let next = [...selectedCells];
    if (exists !== -1) {
      next.splice(exists, 1);
    } else {
      next.push({ r, c, ch });
    }
    const formed = next.map((x) => x.ch).join('');
    const matchedWord = bank.words.find((w) => w === formed && !foundWords.includes(w));
    if (matchedWord) {
      soundEngine.playPoint();
      const updatedWords = [...foundWords, matchedWord];
      setFoundWords(updatedWords);
      setFoundKeys((prev) => [...prev, ...next.map((x) => `${x.r}-${x.c}`)]);
      setSelectedCells([]);
      const pts = updatedWords.length * 20;
      onScoreProgress?.(pts);
      if (updatedWords.length >= bank.words.length) {
        onFinish({
          outcome: 'win',
          score: pts + 20,
          summaryText: lang === 'ar' ? 'وجدت جميع الكلمات المخفية!' : 'Found every hidden word on the grid!',
        });
      }
    } else {
      setSelectedCells(next);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex flex-wrap justify-center gap-2">
        {bank.words.map((word) => {
          const found = foundWords.includes(word);
          return (
            <span
              key={word}
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                found
                  ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] line-through'
                  : 'bg-[#FAF8F4] dark:bg-[#25211D] text-[#1C1917] dark:text-[#F5F2EB] border-[#E5DEC9] dark:border-[#342E28]'
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-6 gap-1.5 max-w-[330px] mx-auto bg-[#E5DEC9] dark:bg-[#342E28] p-2 rounded-2xl" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {bank.grid.map((row, r) =>
          row.map((ch, c) => {
            const key = `${r}-${c}`;
            const isSel = selectedCells.some((s) => s.r === r && s.c === c);
            const isFound = foundKeys.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCell(r, c, ch)}
                className={`aspect-square rounded-lg font-display font-bold text-base flex items-center justify-center cursor-pointer transition-colors ${
                  isSel
                    ? 'bg-[#C84B31] text-white'
                    : isFound
                    ? 'bg-[#2D6A4F]/20 dark:bg-[#52B788]/25 text-[#2D6A4F] dark:text-[#52B788]'
                    : 'bg-white dark:bg-[#1E1B18] text-[#1C1917] dark:text-[#F5F2EB] hover:bg-[#FAF8F4]'
                }`}
              >
                {ch}
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#B8AFA3]">
        <span>
          {lang === 'ar' ? 'الحروف المختارة:' : 'Selected:'}{' '}
          <strong className="text-[#C84B31]">{selectedCells.map((s) => s.ch).join('') || '—'}</strong>
        </span>
        <button
          type="button"
          onClick={() => setSelectedCells([])}
          className="text-xs font-semibold text-[#2B4C7E] dark:text-[#60A5FA] cursor-pointer"
        >
          {lang === 'ar' ? 'مسح الاختيار' : 'Clear selection'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 10. IMAGE PUZZLE (Progressive Tile Reveal Visual Riddle)
 * ============================================================================ */
const VISUAL_MYSTERIES = [
  {
    options: { ar: ['منارة ساحلية', 'برج ساعة', 'صاروخ فضائي', 'طاحونة هواء'], en: ['Coastal Lighthouse', 'Clock Tower', 'Space Rocket', 'Windmill'] },
    answerIndex: 0,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#0F172A" />
        <rect y="130" width="220" height="50" fill="#1D4ED8" />
        <polygon points="94,132 126,132 120,52 100,52" fill="#F8FAFC" />
        <polygon points="96,108 124,108 122,88 98,88" fill="#C84B31" />
        <rect x="98" y="40" width="24" height="14" fill="#FBBF24" />
        <polygon points="122,47 210,20 210,74" fill="#FDE68A" opacity="0.4" />
      </svg>
    ),
  },
  {
    options: { ar: ['طائرة شراعية', 'منطاد هوائي', 'مظلة بحرية', 'فانوس'], en: ['Glider Plane', 'Hot Air Balloon', 'Beach Umbrella', 'Paper Lantern'] },
    answerIndex: 1,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#BAE6FD" />
        <ellipse cx="110" cy="70" rx="48" ry="52" fill="#C84B31" />
        <ellipse cx="110" cy="70" rx="26" ry="52" fill="#FBBF24" />
        <rect x="98" y="134" width="24" height="18" rx="4" fill="#78350F" />
        <line x1="94" y1="115" x2="100" y2="134" stroke="#451A03" strokeWidth="2" />
        <line x1="126" y1="115" x2="120" y2="134" stroke="#451A03" strokeWidth="2" />
      </svg>
    ),
  },
];

export const GameImagePuzzle: React.FC<GameProps> = ({ lang, onFinish }) => {
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([4]);
  const [score, setScore] = useState(0);
  const item = VISUAL_MYSTERIES[round];

  const openTile = (idx: number) => {
    if (revealed.includes(idx)) return;
    soundEngine.playClick();
    setRevealed((prev) => [...prev, idx]);
  };

  const handleGuess = (optIdx: number) => {
    const correct = optIdx === item.answerIndex;
    const pts = correct ? Math.max(25, 70 - revealed.length * 6) : 0;
    const nextScore = score + pts;
    if (correct) soundEngine.playPoint();
    else soundEngine.playError();

    if (round + 1 < VISUAL_MYSTERIES.length) {
      setScore(nextScore);
      setRound((r) => r + 1);
      setRevealed([4]);
    } else {
      onFinish({
        outcome: nextScore >= 60 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-[#C84B31]" />
          {lang === 'ar' ? 'اكشف أقل عدد من المربعات' : 'Reveal fewer tiles for more points'}
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="relative max-w-[260px] mx-auto aspect-[220/180] rounded-2xl overflow-hidden border border-[#E5DEC9] dark:border-[#342E28]">
        {item.svg}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }, (_, idx) => {
            const isOpen = revealed.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => openTile(idx)}
                className={`border border-white/15 transition-opacity cursor-pointer flex items-center justify-center text-xs font-bold ${
                  isOpen
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-[#1C1917]/92 text-white/75 hover:bg-[#2B4C7E]/90'
                }`}
              >
                <Sparkles className="w-4 h-4 opacity-50" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {item.options[lang].map((opt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleGuess(idx)}
            className="h-11 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
