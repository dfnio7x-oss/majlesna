import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { GameProps } from './GameShell';
import { soundEngine } from '../../utils/soundEngine';

const SYMBOLS = [
  { id: 0, color: '#C84B31', label: 'Sun' },
  { id: 1, color: '#2D6A4F', label: 'Leaf' },
  { id: 2, color: '#2B4C7E', label: 'Moon' },
  { id: 3, color: '#D97706', label: 'Crown' },
  { id: 4, color: '#7C3AED', label: 'Gem' },
  { id: 5, color: '#0F766E', label: 'Anchor' },
  { id: 6, color: '#BE185D', label: 'Star' },
  { id: 7, color: '#374151', label: 'Compass' },
  { id: 8, color: '#EA580C', label: 'Flame' },
  { id: 9, color: '#0284C7', label: 'Bolt' },
  { id: 10, color: '#4F46E5', label: 'Hourglass' },
  { id: 11, color: '#B45309', label: 'Trophy' },
];

const MEMORY_STAGES = [
  { pairs: 6, colsClass: 'grid-cols-4' },
  { pairs: 8, colsClass: 'grid-cols-4' },
  { pairs: 10, colsClass: 'grid-cols-5' },
  { pairs: 12, colsClass: 'grid-cols-4 sm:grid-cols-6' },
];

function buildStageDeck(pairsCount: number) {
  const pool = SYMBOLS.slice(0, pairsCount);
  const deck = [...pool, ...pool].map((s, idx) => ({ ...s, uid: idx }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const SymbolArt: React.FC<{ id: number; color: string }> = ({ id, color }) => (
  <svg viewBox="0 0 36 36" className="w-7 h-7 sm:w-8 sm:h-8" fill="none">
    {id === 0 && <circle cx="18" cy="18" r="8" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" />}
    {id === 1 && <path d="M10 26C10 15 19 10 26 10C26 17 21 26 10 26Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" />}
    {id === 2 && <path d="M22 10C15 11 11 16 12 22C13 26 18 28 23 26C19 25 17 21 18 17C19 14 20 12 22 10Z" fill={color} />}
    {id === 3 && <path d="M8 25L11 13L18 19L25 13L28 25H8Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />}
    {id === 4 && <path d="M18 8L28 18L18 28L8 18L18 8Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" />}
    {id === 5 && <path d="M18 9V27M12 15H24M10 22C10 26 14 28 18 28C22 28 26 26 26 22" stroke={color} strokeWidth="2.4" strokeLinecap="round" />}
    {id === 6 && <path d="M18 8L21 15H28L22.5 19.5L24.5 27L18 22.5L11.5 27L13.5 19.5L8 15H15L18 8Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" strokeLinejoin="round" />}
    {id === 7 && <rect x="10" y="10" width="16" height="16" rx="4" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2.4" />}
    {id === 8 && <path d="M18 7C22 13 26 17 25 22C24 27 20 29 18 29C15 29 11 26 11 21C11 17 15 14 16 11C17 10 18 7 18 7Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />}
    {id === 9 && <path d="M20 7L11 20H18L16 29L25 16H18L20 7Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />}
    {id === 10 && <path d="M11 9H25L18 18L25 27H11L18 18L11 9Z" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2.3" strokeLinejoin="round" />}
    {id === 11 && <path d="M11 9H25V15C25 19 22 22 18 22C14 22 11 19 11 15V9ZM18 22V27M13 27H23" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2.3" strokeLinecap="round" />}
  </svg>
);

export const GameMemory: React.FC<GameProps> = ({ lang, mode, onFinish, onScoreProgress }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const stageCfg = MEMORY_STAGES[stageIdx];
  const [cards, setCards] = useState(() => buildStageDeck(stageCfg.pairs));

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [localScores, setLocalScores] = useState({ p1: 0, p2: 0 });
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (matched.length === 0 || matched.length !== cards.length || advancing) return;
    setAdvancing(true);
    const efficiencyBonus = Math.max(0, stageCfg.pairs * 3 - moves) * 3;
    const stageTotal = score + 30 + efficiencyBonus;
    setScore(stageTotal);
    onScoreProgress?.(stageTotal);

    window.setTimeout(() => {
      if (stageIdx + 1 < MEMORY_STAGES.length) {
        const nextStage = stageIdx + 1;
        setStageIdx(nextStage);
        setCards(buildStageDeck(MEMORY_STAGES[nextStage].pairs));
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setAdvancing(false);
      } else {
        onFinish({
          outcome: 'win',
          score: stageTotal,
          summaryText:
            mode === 'local'
              ? lang === 'ar'
                ? `اللاعب ١: ${localScores.p1} · اللاعب ٢: ${localScores.p2} (٤ مراحل)`
                : `P1: ${localScores.p1} · P2: ${localScores.p2} (4 stages)`
              : lang === 'ar'
              ? 'أتممت جميع مراحل الذاكرة الأربعة!'
              : 'Cleared all 4 escalating memory stages!',
        });
      }
    }, 650);
  }, [matched.length, cards.length]);

  const handleCardClick = (uid: number) => {
    if (advancing || flipped.length >= 2 || flipped.includes(uid) || matched.includes(uid)) return;
    soundEngine.playClick();
    const nextFlipped = [...flipped, uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [aUid, bUid] = nextFlipped;
      const cardA = cards.find((c) => c.uid === aUid)!;
      const cardB = cards.find((c) => c.uid === bUid)!;

      if (cardA.id === cardB.id) {
        soundEngine.playPoint();
        setMatched((prev) => [...prev, aUid, bUid]);
        setScore((s) => {
          const next = s + 15;
          onScoreProgress?.(next);
          return next;
        });
        if (mode === 'local') {
          setLocalScores((prev) => ({
            p1: prev.p1 + (turn === 1 ? 1 : 0),
            p2: prev.p2 + (turn === 2 ? 1 : 0),
          }));
        }
        setFlipped([]);
      } else {
        window.setTimeout(() => {
          setFlipped([]);
          if (mode === 'local') setTurn((t) => (t === 1 ? 2 : 1));
        }, 620);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#57534E] dark:text-[#B8AFA3] px-3 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <span>
          {lang === 'ar'
            ? `المرحلة ${stageIdx + 1}/${MEMORY_STAGES.length}`
            : `Stage ${stageIdx + 1}/${MEMORY_STAGES.length}`}
        </span>
        {mode === 'local' ? (
          <span className="text-[#C84B31]">
            {lang === 'ar' ? `دور اللاعب ${turn}` : `Player ${turn} Turn`}
          </span>
        ) : (
          <span className="font-mono-tabular">
            {lang === 'ar' ? `الحركات: ${moves}` : `Moves: ${moves}`}
          </span>
        )}
        <span className="font-mono-tabular text-[#2D6A4F]">
          {matched.length / 2} / {stageCfg.pairs} · {score} pts
        </span>
      </div>

      <div className={`grid ${stageCfg.colsClass} gap-2.5`}>
        {cards.map((card) => {
          const isOpen = flipped.includes(card.uid) || matched.includes(card.uid);
          const isMatched = matched.includes(card.uid);
          return (
            <motion.button
              key={card.uid}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.uid)}
              aria-label={isOpen ? card.label : `Card ${card.uid + 1}`}
              className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-colors cursor-pointer ${
                isMatched
                  ? 'bg-[#2D6A4F]/10 border-[#2D6A4F]/40'
                  : isOpen
                  ? 'bg-white dark:bg-[#1E1B18] border-[#C84B31]'
                  : 'bg-[#F1ECE2] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#C84B31]/50'
              }`}
            >
              {isOpen ? (
                <SymbolArt id={card.id} color={card.color} />
              ) : (
                <span className="w-3 h-3 rounded-full bg-[#D6CEBF]" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
