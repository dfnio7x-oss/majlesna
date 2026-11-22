import React, { useEffect, useMemo, useState } from 'react';
import { Delete, Eye, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import type { GameProps } from './GameShell';
import {
  CROSSWORD_PUZZLES,
  LOGIC_GRID_SCENARIOS,
  PATTERN_BANK,
  WORD_SEARCH_BOARDS,
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
 * 1. SUDOKU PARTY (10 Progressive 4x4 Boards)
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
  {
    given: [0, 2, 0, 3, 3, 0, 2, 0, 2, 0, 3, 0, 0, 3, 0, 2],
    solution: [1, 2, 4, 3, 3, 4, 2, 1, 2, 1, 3, 4, 4, 3, 1, 2],
  },
  {
    given: [0, 0, 3, 2, 2, 3, 0, 0, 0, 2, 1, 0, 1, 0, 0, 3],
    solution: [4, 1, 3, 2, 2, 3, 4, 1, 3, 2, 1, 4, 1, 4, 2, 3],
  },
  {
    given: [3, 0, 0, 2, 0, 2, 3, 0, 2, 0, 0, 4, 0, 4, 1, 0],
    solution: [3, 1, 4, 2, 4, 2, 3, 1, 2, 3, 1, 4, 1, 4, 2, 3],
  },
  {
    given: [0, 4, 1, 0, 1, 0, 0, 4, 4, 0, 0, 1, 0, 1, 4, 0],
    solution: [2, 4, 1, 3, 1, 3, 2, 4, 4, 2, 3, 1, 3, 1, 4, 2],
  },
  {
    given: [2, 0, 0, 1, 0, 1, 2, 0, 0, 2, 4, 0, 4, 0, 0, 2],
    solution: [2, 3, 1, 4, 4, 1, 2, 3, 1, 2, 4, 3, 3, 4, 2, 1],
  },
  {
    given: [0, 1, 0, 4, 4, 0, 1, 0, 0, 3, 0, 2, 2, 0, 3, 0],
    solution: [3, 1, 2, 4, 4, 2, 1, 3, 1, 3, 4, 2, 2, 4, 3, 1],
  },
  {
    given: [0, 0, 2, 0, 2, 4, 0, 1, 0, 2, 0, 3, 3, 0, 1, 0],
    solution: [1, 3, 2, 4, 2, 4, 3, 1, 4, 2, 1, 3, 3, 1, 4, 2],
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
      const roundPts = Math.max(35, 90 - Math.floor(elapsed / 4));
      const total = score + roundPts;
      setScore(total);
      onScoreProgress?.(total);
      if (puzzleIdx < SUDOKU_PUZZLES.length - 1) {
        window.setTimeout(() => selectPuzzle(puzzleIdx + 1), 600);
      } else {
        setDone(true);
        onFinish({
          outcome: 'win',
          score: total,
          summaryText:
            lang === 'ar'
              ? `أنهيت جميع لوحات السودوكو العشر في ${elapsed}ث`
              : `Solved all 10 Sudoku boards in ${elapsed}s`,
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
 * 2. SOLVE PUZZLE (10 Logic Deduction Grid Stages)
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
      const nextScore = score + 35;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (scenarioIdx + 1 < LOGIC_GRID_SCENARIOS.length) {
        setFeedback(lang === 'ar' ? 'استنتاج صحيح! ننتقل للغز التالي...' : 'Spot on! Next deduction...');
        window.setTimeout(() => {
          setScenarioIdx((i) => i + 1);
          setPicks([0, 1, 2]);
          setFeedback(null);
        }, 650);
      } else {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText: lang === 'ar' ? `حللت جميع ألغاز الاستنتاج الـ ${LOGIC_GRID_SCENARIOS.length}!` : `Solved all ${LOGIC_GRID_SCENARIOS.length} logic deduction puzzles!`,
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
 * 3. SPOT THE DIFFERENCES (8 Handcrafted SVG Visual Scenes)
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
        <circle cx="185" cy="38" r={mod ? 16 : 12} fill={mod ? '#FDE68A' : '#FBBF24'} />
        <polygon points="62,132 100,72 138,132" fill="#C84B31" />
        <polygon points="88,132 100,98 112,132" fill="#7C2D12" />
        <path d="M100 72 L100 54 L118 60 L100 66" fill={mod ? '#60A5FA' : '#34D399'} />
        <rect x="30" y="96" width="10" height="36" rx="5" fill="#2D6A4F" />
        {!mod && <rect x="20" y="106" width="12" height="6" rx="3" fill="#2D6A4F" />}
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
        <circle cx="48" cy="36" r="12" fill={mod ? '#FDE047' : '#FFFFFF'} />
        <circle cx="60" cy="36" r="10" fill={mod ? '#FDE047' : '#FFFFFF'} />
        <polygon points="88,118 152,118 142,134 98,134" fill="#92400E" />
        <polygon points="116,56 116,112 146,112" fill={mod ? '#C84B31' : '#FFFFFF'} />
        {!mod && <path d="M164 42 Q170 34 176 42 Q182 34 188 42" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />}
        <circle cx="48" cy="136" r={mod ? 9 : 6} fill={mod ? '#10B981' : '#EF4444'} />
      </svg>
    ),
  },
  {
    title: { ar: 'أفق المدينة', en: 'City Skyline' },
    hotspots: [
      { id: 'sun', x: 38, y: 34, r: 20 },
      { id: 'roof', x: 96, y: 46, r: 22 },
      { id: 'win', x: 148, y: 92, r: 22 },
      { id: 'car', x: 64, y: 146, r: 22 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#0F172A" />
        <circle cx="38" cy="34" r="14" fill={mod ? '#F97316' : '#FACC15'} />
        <rect x="74" y="54" width="44" height="84" fill="#334155" />
        {!mod && <polygon points="74,54 96,34 118,54" fill="#C84B31" />}
        <rect x="130" y="72" width="42" height="66" fill="#475569" />
        <rect x="142" y="84" width="12" height="14" fill={mod ? '#38BDF8' : '#FDE047'} />
        <rect y="138" width="220" height="32" fill="#1E293B" />
        <rect x="44" y="138" width="38" height="14" rx="4" fill={mod ? '#22C55E' : '#EF4444'} />
        <circle cx="54" cy="153" r="5" fill="#94A3B8" />
        <circle cx="72" cy="153" r="5" fill="#94A3B8" />
      </svg>
    ),
  },
  {
    title: { ar: 'غرفة القراءة', en: 'Cozy Library' },
    hotspots: [
      { id: 'clock', x: 110, y: 36, r: 20 },
      { id: 'lamp', x: 40, y: 74, r: 22 },
      { id: 'book', x: 170, y: 92, r: 22 },
      { id: 'rug', x: 110, y: 146, r: 24 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#F5EBE0" />
        <rect y="128" width="220" height="42" fill="#D5BDAF" />
        <circle cx="110" cy="36" r="16" fill="#FFFFFF" stroke={mod ? '#C84B31' : '#1C1917'} strokeWidth="3" />
        <line x1="110" y1="36" x2="110" y2="26" stroke="#1C1917" strokeWidth="2" />
        <line x1="110" y1="36" x2={mod ? '102' : '118'} y2="36" stroke="#1C1917" strokeWidth="2" />
        <polygon points="26,78 54,78 46,58 34,58" fill={mod ? '#2B4C7E' : '#F59E0B'} />
        <rect x="38" y="78" width="4" height="50" fill="#78350F" />
        <rect x="148" y="70" width="46" height="58" fill="#8D6E63" />
        <rect x="164" y="78" width="12" height="24" fill={mod ? '#22C55E' : '#EF4444'} />
        <ellipse cx="110" cy="148" rx={mod ? 42 : 56} ry="12" fill={mod ? '#7C3AED' : '#C84B31'} />
      </svg>
    ),
  },
  {
    title: { ar: 'بستان الربيع', en: 'Orchard Garden' },
    hotspots: [
      { id: 'crown', x: 56, y: 66, r: 24 },
      { id: 'apple', x: 162, y: 64, r: 20 },
      { id: 'fence', x: 108, y: 120, r: 22 },
      { id: 'flower', x: 176, y: 142, r: 20 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#E0F2FE" />
        <rect y="122" width="220" height="48" fill="#4ADE80" />
        <rect x="48" y="92" width="14" height="36" fill="#78350F" />
        <circle cx="55" cy="68" r="26" fill={mod ? '#15803D' : '#22C55E'} />
        <rect x="155" y="92" width="14" height="36" fill="#78350F" />
        <circle cx="162" cy="68" r="24" fill="#22C55E" />
        {!mod && <circle cx="162" cy="64" r="6" fill="#EF4444" />}
        <rect x="86" y="106" width="46" height="24" fill="#FFFFFF" stroke="#94A3B8" />
        {mod && <rect x="104" y="106" width="10" height="24" fill="#C84B31" />}
        <circle cx="176" cy="142" r="8" fill={mod ? '#A855F7' : '#FACC15'} />
      </svg>
    ),
  },
  {
    title: { ar: 'محطة الفضاء', en: 'Orbit Station' },
    hotspots: [
      { id: 'planet', x: 48, y: 46, r: 24 },
      { id: 'wing', x: 162, y: 58, r: 22 },
      { id: 'window', x: 112, y: 92, r: 20 },
      { id: 'star', x: 178, y: 136, r: 20 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#090D16" />
        <circle cx="48" cy="46" r="20" fill={mod ? '#EC4899' : '#38BDF8'} />
        <ellipse cx="48" cy="46" rx="30" ry="6" fill="none" stroke="#FDE047" strokeWidth="2.5" />
        <rect x="82" y="76" width="60" height="32" rx="12" fill="#E2E8F0" />
        <circle cx="112" cy="92" r="10" fill={mod ? '#EF4444' : '#2563EB'} />
        <rect x="148" y="42" width="28" height="34" fill={mod ? '#F59E0B' : '#3B82F6'} />
        {!mod && <polygon points="178,124 182,134 192,136 182,140 178,150 174,140 164,136 174,134" fill="#FACC15" />}
      </svg>
    ),
  },
  {
    title: { ar: 'القطب المتجمد', en: 'Arctic Igloo' },
    hotspots: [
      { id: 'aurora', x: 70, y: 28, r: 22 },
      { id: 'door', x: 110, y: 112, r: 22 },
      { id: 'fish', x: 42, y: 138, r: 20 },
      { id: 'flag', x: 176, y: 84, r: 22 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#0F172A" />
        <path d="M20 34 Q70 10 140 34" fill="none" stroke={mod ? '#A855F7' : '#34D399'} strokeWidth="7" strokeLinecap="round" />
        <rect y="122" width="220" height="48" fill="#E0F2FE" />
        <path d="M64 126 A46 46 0 0 1 156 126 Z" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
        <path d="M96 126 A14 14 0 0 1 124 126 Z" fill={mod ? '#C84B31' : '#1E293B'} />
        <ellipse cx="42" cy="142" rx="14" ry="7" fill={mod ? '#F97316' : '#38BDF8'} />
        <rect x="172" y="72" width="4" height="50" fill="#64748B" />
        {!mod && <polygon points="176,72 198,80 176,88" fill="#EF4444" />}
      </svg>
    ),
  },
  {
    title: { ar: 'أهرامات الوادي', en: 'Ancient Pyramids' },
    hotspots: [
      { id: 'disc', x: 176, y: 34, r: 20 },
      { id: 'peak', x: 86, y: 54, r: 22 },
      { id: 'palm', x: 34, y: 108, r: 22 },
      { id: 'oasis', x: 158, y: 146, r: 22 },
    ],
    renderScene: (mod) => (
      <svg viewBox="0 0 220 170" className="w-full h-auto rounded-xl border border-[#E5DEC9] dark:border-[#342E28]">
        <rect width="220" height="170" fill="#FEF3C7" />
        <circle cx="176" cy="34" r={mod ? 17 : 12} fill={mod ? '#C84B31' : '#F59E0B'} />
        <rect y="128" width="220" height="42" fill="#FDE68A" />
        <polygon points="36,130 86,52 136,130" fill="#D97706" />
        {mod && <polygon points="75,69 86,52 97,69" fill="#FFFFFF" />}
        <rect x="30" y="96" width="6" height="34" fill="#78350F" />
        <circle cx="33" cy="92" r="12" fill={mod ? '#0D9488' : '#16A34A'} />
        <ellipse cx="158" cy="148" rx="34" ry="10" fill={mod ? '#16A34A' : '#0284C7'} />
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
      const nextScore = score + 20;
      setFoundIds(nextFound);
      setScore(nextScore);
      onScoreProgress?.(nextScore);

      if (nextFound.length >= scene.hotspots.length) {
        if (sceneIdx + 1 < DIFFERENCE_SCENES.length) {
          window.setTimeout(() => {
            setSceneIdx((i) => i + 1);
            setFoundIds([]);
          }, 650);
        } else {
          window.setTimeout(() => {
            onFinish({
              outcome: 'win',
              score: nextScore,
              summaryText:
                lang === 'ar'
                  ? `اكتشفت كل الاختلافات في جميع المشاهد الثمانية!`
                  : `Spotted every difference across all 8 scenes!`,
            });
          }, 450);
        }
      }
    } else {
      soundEngine.playError();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>{scene.title[lang]} ({sceneIdx + 1}/{DIFFERENCE_SCENES.length})</span>
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
 * 4. COMPLETE PATTERN (18 Stages)
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
    const nextScore = correct ? score + 22 : score;
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
          outcome: nextScore >= 180 ? 'win' : 'draw',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, 850);
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
 * 5. NUMBER ORDERING (5-Stage Escalating 3x3 -> 4x4 Sliding Puzzle Ladder)
 * ============================================================================ */
const SLIDING_STAGES = [
  { size: 3, shuffles: 20, reward: 60 },
  { size: 3, shuffles: 42, reward: 80 },
  { size: 4, shuffles: 24, reward: 100 },
  { size: 4, shuffles: 44, reward: 125 },
  { size: 4, shuffles: 68, reward: 160 },
];

function makeShuffledTiles(size: number, steps: number): number[] {
  const total = size * size;
  const arr = Array.from({ length: total }, (_, i) => (i + 1) % total);
  let empty = total - 1;
  for (let step = 0; step < steps; step++) {
    const r = Math.floor(empty / size);
    const c = empty % size;
    const neighbors: number[] = [];
    if (r > 0) neighbors.push((r - 1) * size + c);
    if (r < size - 1) neighbors.push((r + 1) * size + c);
    if (c > 0) neighbors.push(r * size + (c - 1));
    if (c < size - 1) neighbors.push(r * size + (c + 1));
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [arr[empty], arr[pick]] = [arr[pick], arr[empty]];
    empty = pick;
  }
  return isSlidingPuzzleSolved(arr) ? makeShuffledTiles(size, steps + 2) : arr;
}

export const GameNumberOrdering: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const cfg = SLIDING_STAGES[stageIdx];
  const [tiles, setTiles] = useState<number[]>(() => makeShuffledTiles(cfg.size, cfg.shuffles));
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  const handleTileClick = (idx: number) => {
    const emptyIdx = tiles.indexOf(0);
    if (!canSlideTile(idx, emptyIdx, cfg.size)) return;
    soundEngine.playClick();
    const next = [...tiles];
    [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
    const nextMoves = moves + 1;
    setTiles(next);
    setMoves(nextMoves);

    if (isSlidingPuzzleSolved(next)) {
      soundEngine.playPoint();
      const stagePts = Math.max(30, cfg.reward - Math.floor(nextMoves / 2));
      const nextScore = score + stagePts;
      setScore(nextScore);
      onScoreProgress?.(nextScore);

      if (stageIdx + 1 < SLIDING_STAGES.length) {
        const nextStageIdx = stageIdx + 1;
        const nextCfg = SLIDING_STAGES[nextStageIdx];
        window.setTimeout(() => {
          setStageIdx(nextStageIdx);
          setTiles(makeShuffledTiles(nextCfg.size, nextCfg.shuffles));
          setMoves(0);
        }, 550);
      } else {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText:
            lang === 'ar'
              ? `أنهيت جميع مراحل الترتيب الخمس (3x3 إلى 4x4)!`
              : `Cleared all 5 sliding stages (3x3 to 4x4)!`,
        });
      }
    }
  };

  return (
    <div className="max-w-xs mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>
          {lang === 'ar'
            ? `المرحلة ${stageIdx + 1}/${SLIDING_STAGES.length} (${cfg.size}×${cfg.size})`
            : `Stage ${stageIdx + 1}/${SLIDING_STAGES.length} (${cfg.size}×${cfg.size})`}
        </span>
        <span>
          <strong className="font-mono-tabular text-[#C84B31]">{moves}</strong>{' '}
          {lang === 'ar' ? 'حركة' : 'moves'}
        </span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setTiles(makeShuffledTiles(cfg.size, cfg.shuffles));
            setMoves(0);
          }}
          className="flex items-center gap-1 text-[#2B4C7E] dark:text-[#60A5FA] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'خلط' : 'Shuffle'}</span>
        </button>
      </div>

      <div
        className="grid gap-2 p-3 rounded-2xl bg-[#E5DEC9] dark:bg-[#342E28]"
        style={{ gridTemplateColumns: `repeat(${cfg.size}, minmax(0, 1fr))` }}
        dir="ltr"
      >
        {tiles.map((num, idx) => (
          <button
            key={idx}
            type="button"
            disabled={num === 0}
            onClick={() => handleTileClick(idx)}
            className={`aspect-square rounded-xl font-mono-tabular font-bold flex items-center justify-center transition-all ${
              cfg.size === 4 ? 'text-lg' : 'text-2xl'
            } ${
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
 * 6. CRACK CODE (4-Stage Mastermind Ladder: 3 -> 4 -> 4 -> 5 Pegs)
 * ============================================================================ */
const CODE_COLORS = [
  { id: 'R', hex: '#C84B31' },
  { id: 'G', hex: '#2D6A4F' },
  { id: 'B', hex: '#2B4C7E' },
  { id: 'Y', hex: '#D97706' },
  { id: 'P', hex: '#7C3AED' },
  { id: 'T', hex: '#0F766E' },
];

const MASTERMIND_STAGES = [
  { len: 3, maxAttempts: 7 },
  { len: 4, maxAttempts: 8 },
  { len: 4, maxAttempts: 8 },
  { len: 5, maxAttempts: 10 },
];

function makeSecretCode(len: number): string[] {
  return Array.from({ length: len }, () => CODE_COLORS[Math.floor(Math.random() * CODE_COLORS.length)].id);
}

export const GameCrackCode: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const stageCfg = MASTERMIND_STAGES[stageIdx];
  const [secret, setSecret] = useState<string[]>(() => makeSecretCode(stageCfg.len));
  const [currentGuess, setCurrentGuess] = useState<string[]>(() =>
    CODE_COLORS.slice(0, stageCfg.len).map((c) => c.id)
  );
  const [history, setHistory] = useState<{ guess: string[]; exact: number; misplaced: number }[]>([]);
  const [totalScore, setTotalScore] = useState(0);

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

    if (fb.exact === stageCfg.len) {
      soundEngine.playPoint();
      const stageScore = Math.max(30, 90 - (nextHistory.length - 1) * 8);
      const nextTotal = totalScore + stageScore;
      setTotalScore(nextTotal);
      onScoreProgress?.(nextTotal);

      if (stageIdx + 1 < MASTERMIND_STAGES.length) {
        const nextIdx = stageIdx + 1;
        const nextCfg = MASTERMIND_STAGES[nextIdx];
        window.setTimeout(() => {
          setStageIdx(nextIdx);
          setSecret(makeSecretCode(nextCfg.len));
          setCurrentGuess(CODE_COLORS.slice(0, nextCfg.len).map((c) => c.id));
          setHistory([]);
        }, 650);
      } else {
        onFinish({
          outcome: 'win',
          score: nextTotal,
          summaryText:
            lang === 'ar'
              ? `كسرت جميع الشفرات الأربع (حتى ٥ ألوان)!`
              : `Cracked all 4 cipher stages up to 5 pegs!`,
        });
      }
    } else if (nextHistory.length >= stageCfg.maxAttempts) {
      soundEngine.playError();
      onFinish({
        outcome: stageIdx >= 2 ? 'draw' : 'loss',
        score: Math.max(20, totalScore),
        summaryText:
          lang === 'ar'
            ? `توقفت عند الشفرة ${stageIdx + 1}/${MASTERMIND_STAGES.length}`
            : `Stopped at Stage ${stageIdx + 1}/${MASTERMIND_STAGES.length}`,
      });
    } else {
      soundEngine.playClick();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2.5">
        <span>
          {lang === 'ar'
            ? `المرحلة ${stageIdx + 1}/${MASTERMIND_STAGES.length} (${stageCfg.len} ألوان)`
            : `Stage ${stageIdx + 1}/${MASTERMIND_STAGES.length} (${stageCfg.len} pegs)`}
        </span>
        <span className="font-mono-tabular text-[#C84B31]">
          {history.length}/{stageCfg.maxAttempts}
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{totalScore} pts</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5" dir="ltr">
        {currentGuess.map((cid, idx) => {
          const hex = CODE_COLORS.find((c) => c.id === cid)?.hex ?? '#C84B31';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => cycleSlot(idx)}
              className="w-11 h-11 rounded-full border-2 border-white dark:border-[#1E1B18] shadow-md cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: hex }}
            />
          );
        })}
        <button
          type="button"
          onClick={submitGuess}
          className="h-11 px-4 rounded-xl bg-[#1C1917] dark:bg-[#C84B31] text-white text-xs font-semibold tactile-btn cursor-pointer"
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
 * 7. STRONGEST MEMORY (15 Accelerating Simon Musical Levels)
 * ============================================================================ */
const SIMON_PADS = [
  { id: 0, color: '#C84B31', label: { ar: 'أحمر', en: 'Ruby' } },
  { id: 1, color: '#2D6A4F', label: { ar: 'زمردي', en: 'Emerald' } },
  { id: 2, color: '#2B4C7E', label: { ar: 'أزرق', en: 'Sapphire' } },
  { id: 3, color: '#D97706', label: { ar: 'ذهبي', en: 'Amber' } },
];

const MAX_SIMON_LEVELS = 15;

export const GameStrongestMemory: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [sequence, setSequence] = useState<number[]>(() => [Math.floor(Math.random() * 4)]);
  const [userStep, setUserStep] = useState(0);
  const [litPad, setLitPad] = useState<number | null>(null);
  const [playingDemo, setPlayingDemo] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPlayingDemo(true);
    const stepMs = Math.max(250, 520 - sequence.length * 18);
    const holdMs = Math.max(180, 350 - sequence.length * 10);
    sequence.forEach((pad, idx) => {
      window.setTimeout(() => {
        if (cancelled) return;
        setLitPad(pad);
        soundEngine.playClick();
      }, idx * stepMs + 220);
      window.setTimeout(() => {
        if (cancelled) return;
        setLitPad(null);
        if (idx === sequence.length - 1) setPlayingDemo(false);
      }, idx * stepMs + 220 + holdMs);
    });
    return () => {
      cancelled = true;
    };
  }, [sequence]);

  const handlePadTap = (padId: number) => {
    if (playingDemo) return;
    setLitPad(padId);
    window.setTimeout(() => setLitPad(null), 160);

    if (padId !== sequence[userStep]) {
      soundEngine.playError();
      onFinish({
        outcome: sequence.length - 1 >= 6 ? 'win' : 'draw',
        score,
        summaryText:
          lang === 'ar'
            ? `حفظت سلسلة من ${sequence.length - 1} خطوات من أصل ${MAX_SIMON_LEVELS}!`
            : `Memorized a sequence of ${sequence.length - 1} / ${MAX_SIMON_LEVELS}!`,
      });
      return;
    }

    soundEngine.playPoint();
    if (userStep + 1 >= sequence.length) {
      const nextScore = score + 18 + sequence.length * 2;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (sequence.length >= MAX_SIMON_LEVELS) {
        onFinish({
          outcome: 'win',
          score: nextScore + 40,
          summaryText:
            lang === 'ar'
              ? `ذاكرة خارقة! أكملت جميع الـ ${MAX_SIMON_LEVELS} مستوى!`
              : `Unbreakable memory across all ${MAX_SIMON_LEVELS} levels!`,
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
        <span>{lang === 'ar' ? `المستوى: ${sequence.length}/${MAX_SIMON_LEVELS}` : `Level: ${sequence.length}/${MAX_SIMON_LEVELS}`}</span>
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
 * 8. CROSSWORD CHALLENGE (All 6 Bilingual Mini Crosswords Campaign)
 * ============================================================================ */
export const GameCrosswordChallenge: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const puzzles = useMemo(() => [...CROSSWORD_PUZZLES[lang]], [lang]);
  const [pIdx, setPIdx] = useState(0);
  const puzzle = puzzles[pIdx];
  const [entries, setEntries] = useState<string[][]>(() =>
    puzzle.grid.map((row) => row.map((ch) => (ch === '#' ? '#' : '')))
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [score, setScore] = useState(0);

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
      const nextScore = score + 50;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (pIdx + 1 < puzzles.length) {
        const nextPuzzle = puzzles[pIdx + 1];
        setStatusMsg(lang === 'ar' ? 'أحسنت! جاري الانتقال للشبكة التالية...' : 'Great! Advancing to next crossword...');
        window.setTimeout(() => {
          setPIdx((i) => i + 1);
          setEntries(nextPuzzle.grid.map((row) => row.map((ch) => (ch === '#' ? '#' : ''))));
          setStatusMsg(null);
        }, 650);
      } else {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText:
            lang === 'ar'
              ? `أكملت جميع شبكات الكلمات المتقاطعة (${puzzles.length})!`
              : `Completed all ${puzzles.length} mini crosswords!`,
        });
      }
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
        <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2">
          <span>{lang === 'ar' ? `الشبكة ${pIdx + 1}/${puzzles.length}` : `Grid ${pIdx + 1}/${puzzles.length}`}</span>
          <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
        </div>

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
 * 9. HIDDEN WORD (6-Board Word Search Expedition)
 * ============================================================================ */
export const GameHiddenWord: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const boards = WORD_SEARCH_BOARDS[lang];
  const [boardIdx, setBoardIdx] = useState(0);
  const bank = boards[boardIdx];
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number; ch: string }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundKeys, setFoundKeys] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const toggleCell = (r: number, c: number, ch: string) => {
    soundEngine.playClick();
    const exists = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);
    const next = [...selectedCells];
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
      const nextScore = score + 15;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (updatedWords.length >= bank.words.length) {
        if (boardIdx + 1 < boards.length) {
          window.setTimeout(() => {
            setBoardIdx((b) => b + 1);
            setFoundWords([]);
            setFoundKeys([]);
            setSelectedCells([]);
          }, 600);
        } else {
          onFinish({
            outcome: 'win',
            score: nextScore + 40,
            summaryText:
              lang === 'ar'
                ? `وجدت جميع الكلمات المخفية عبر ${boards.length} لوحات!`
                : `Found every hidden word across all ${boards.length} boards!`,
          });
        }
      }
    } else {
      setSelectedCells(next);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-xl px-4 py-2">
        <span>{lang === 'ar' ? `اللوحة ${boardIdx + 1}/${boards.length}` : `Board ${boardIdx + 1}/${boards.length}`}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

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
 * 10. IMAGE PUZZLE (10 Custom SVG Tile-Reveal Visual Riddles)
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
  {
    options: { ar: ['سفينة شراعية', 'صاروخ فضائي', 'قطار سريع', 'برج إيفل'], en: ['Sailboat', 'Space Rocket', 'Express Train', 'Eiffel Tower'] },
    answerIndex: 1,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#090D16" />
        <polygon points="110,22 132,68 88,68" fill="#EF4444" />
        <rect x="88" y="68" width="44" height="58" fill="#F8FAFC" />
        <circle cx="110" cy="92" r="12" fill="#38BDF8" stroke="#1E293B" strokeWidth="3" />
        <polygon points="88,108 66,132 88,126" fill="#EF4444" />
        <polygon points="132,108 154,132 132,126" fill="#EF4444" />
        <polygon points="96,126 110,164 124,126" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    options: { ar: ['قلعة حصينة', 'مسجد', 'محطة قطار', 'مصنع'], en: ['Stone Castle', 'Mosque', 'Train Station', 'Factory'] },
    answerIndex: 0,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#DDD6FE" />
        <rect y="138" width="220" height="42" fill="#22C55E" />
        <rect x="58" y="72" width="104" height="68" fill="#94A3B8" />
        <rect x="44" y="54" width="26" height="86" fill="#64748B" />
        <rect x="150" y="54" width="26" height="86" fill="#64748B" />
        <polygon points="40,54 57,30 74,54" fill="#C84B31" />
        <polygon points="146,54 163,30 180,54" fill="#C84B31" />
        <path d="M94 140 V106 A16 16 0 0 1 126 106 V140 Z" fill="#451A03" />
      </svg>
    ),
  },
  {
    options: { ar: ['ساعة رملية', 'كأس ذهبي', 'مصباح يدوي', 'آلة تصوير'], en: ['Hourglass', 'Golden Trophy', 'Flashlight', 'Camera'] },
    answerIndex: 3,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#FEF3C7" />
        <rect x="52" y="58" width="116" height="74" rx="14" fill="#1E293B" />
        <rect x="86" y="42" width="48" height="18" rx="4" fill="#334155" />
        <circle cx="110" cy="95" r="26" fill="#94A3B8" />
        <circle cx="110" cy="95" r="17" fill="#0F172A" />
        <circle cx="104" cy="89" r="5" fill="#38BDF8" />
        <circle cx="148" cy="72" r="5" fill="#FACC15" />
      </svg>
    ),
  },
  {
    options: { ar: ['خيمة برية', 'سفينة قرصان', 'هرم', 'قوس قزح'], en: ['Camping Tent', 'Pirate Ship', 'Pyramid', 'Rainbow'] },
    answerIndex: 0,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#1E293B" />
        <circle cx="172" cy="40" r="14" fill="#FDE68A" />
        <rect y="132" width="220" height="48" fill="#14532D" />
        <polygon points="48,136 110,54 172,136" fill="#D97706" />
        <polygon points="90,136 110,88 130,136" fill="#451A03" />
      </svg>
    ),
  },
  {
    options: { ar: ['روبوت آلي', 'تلفاز قديم', 'إشارة مرور', 'غسالة'], en: ['Friendly Robot', 'Retro TV', 'Traffic Light', 'Arcade Box'] },
    answerIndex: 0,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#ECFEFF" />
        <line x1="110" y1="24" x2="110" y2="48" stroke="#475569" strokeWidth="4" />
        <circle cx="110" cy="22" r="7" fill="#EF4444" />
        <rect x="68" y="48" width="84" height="62" rx="14" fill="#64748B" />
        <circle cx="92" cy="76" r="9" fill="#FACC15" />
        <circle cx="128" cy="76" r="9" fill="#FACC15" />
        <rect x="88" y="94" width="44" height="7" rx="3" fill="#E2E8F0" />
        <rect x="76" y="114" width="68" height="46" rx="10" fill="#475569" />
      </svg>
    ),
  },
  {
    options: { ar: ['فنجان قهوة', 'دلو طلاء', 'زهرة دوار الشمس', 'كعكة عيد ميلاد'], en: ['Coffee Mug', 'Paint Bucket', 'Sunflower', 'Birthday Cake'] },
    answerIndex: 3,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#FFF1F2" />
        <rect x="56" y="96" width="108" height="46" rx="8" fill="#F472B6" />
        <rect x="70" y="66" width="80" height="32" rx="8" fill="#FBCFE8" />
        <rect x="106" y="38" width="8" height="28" fill="#60A5FA" />
        <ellipse cx="110" cy="30" rx="6" ry="10" fill="#F59E0B" />
        <rect x="44" y="142" width="132" height="10" rx="5" fill="#94A3B8" />
      </svg>
    ),
  },
  {
    options: { ar: ['بوصلة ملاحية', 'غواصة بحرية', 'طائرة هليكوبتر', 'مركبة قمرية'], en: ['Submarine', 'Compass', 'Helicopter', 'Lunar Rover'] },
    answerIndex: 0,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#0369A1" />
        <rect x="96" y="42" width="16" height="30" fill="#FACC15" />
        <rect x="86" y="42" width="26" height="8" fill="#FDE047" />
        <ellipse cx="110" cy="96" rx="68" ry="30" fill="#F59E0B" />
        <circle cx="84" cy="96" r="10" fill="#E0F2FE" />
        <circle cx="112" cy="96" r="10" fill="#E0F2FE" />
        <circle cx="140" cy="96" r="10" fill="#E0F2FE" />
        <rect x="30" y="88" width="14" height="16" fill="#B45309" />
      </svg>
    ),
  },
  {
    options: { ar: ['بطيخة طازجة', 'كرة سلة', 'قمر مكتمل', 'قرص بيتزا'], en: ['Fresh Watermelon', 'Basketball', 'Full Moon', 'Pizza Slice'] },
    answerIndex: 0,
    svg: (
      <svg viewBox="0 0 220 180" className="w-full h-full">
        <rect width="220" height="180" fill="#ECFDF5" />
        <path d="M40 72 A70 70 0 0 0 180 72 Z" fill="#16A34A" />
        <path d="M50 72 A60 60 0 0 0 170 72 Z" fill="#EF4444" />
        <circle cx="92" cy="94" r="3.5" fill="#1C1917" />
        <circle cx="112" cy="108" r="3.5" fill="#1C1917" />
        <circle cx="132" cy="92" r="3.5" fill="#1C1917" />
        <circle cx="106" cy="84" r="3.5" fill="#1C1917" />
      </svg>
    ),
  },
];

export const GameImagePuzzle: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
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
    const pts = correct ? Math.max(20, 60 - revealed.length * 5) : 0;
    const nextScore = score + pts;
    if (correct) {
      soundEngine.playPoint();
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }

    if (round + 1 < VISUAL_MYSTERIES.length) {
      setScore(nextScore);
      setRound((r) => r + 1);
      setRevealed([4]);
    } else {
      onFinish({
        outcome: nextScore >= 220 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts (${VISUAL_MYSTERIES.length} stages)`,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-[#C84B31]" />
          {round + 1}/{VISUAL_MYSTERIES.length} · {lang === 'ar' ? 'اكشف أقل مربعات' : 'Reveal fewer tiles'}
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
