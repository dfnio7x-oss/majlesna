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
];

const SymbolArt: React.FC<{ id: number; color: string }> = ({ id, color }) => (
  <svg viewBox="0 0 36 36" className="w-8 h-8" fill="none">
    {id === 0 && <circle cx="18" cy="18" r="8" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" />}
    {id === 1 && <path d="M10 26C10 15 19 10 26 10C26 17 21 26 10 26Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" />}
    {id === 2 && <path d="M22 10C15 11 11 16 12 22C13 26 18 28 23 26C19 25 17 21 18 17C19 14 20 12 22 10Z" fill={color} />}
    {id === 3 && <path d="M8 25L11 13L18 19L25 13L28 25H8Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />}
    {id === 4 && <path d="M18 8L28 18L18 28L8 18L18 8Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.4" />}
    {id === 5 && <path d="M18 9V27M12 15H24M10 22C10 26 14 28 18 28C22 28 26 26 26 22" stroke={color} strokeWidth="2.4" strokeLinecap="round" />}
    {id === 6 && <path d="M18 8L21 15H28L22.5 19.5L24.5 27L18 22.5L11.5 27L13.5 19.5L8 15H15L18 8Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" strokeLinejoin="round" />}
    {id === 7 && <rect x="10" y="10" width="16" height="16" rx="4" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2.4" />}
  </svg>
);

export const GameMemory: React.FC<GameProps> = ({ lang, mode, onFinish, onScoreProgress }) => {
  const [cards] = useState(() => {
    const deck = [...SYMBOLS, ...SYMBOLS].map((s, idx) => ({ ...s, uid: idx }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [localScores, setLocalScores] = useState({ p1: 0, p2: 0 });

  useEffect(() => {
    if (matched.length === cards.length) {
      const finalScore = Math.max(40, score + Math.max(0, 24 - moves) * 4);
      onScoreProgress?.(finalScore);
      onFinish({
        outcome: 'win',
        score: finalScore,
        summaryText:
          mode === 'local'
            ? lang === 'ar'
              ? `اللاعب ١: ${localScores.p1} · اللاعب ٢: ${localScores.p2}`
              : `P1: ${localScores.p1} · P2: ${localScores.p2}`
            : undefined,
      });
    }
  }, [matched.length]);

  const handleCardClick = (uid: number) => {
    if (flipped.length >= 2 || flipped.includes(uid) || matched.includes(uid)) return;
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
          const next = s + 20;
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
        }, 650);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span className="font-mono-tabular">
          {lang === 'ar' ? `الحركات: ${moves}` : `Moves: ${moves}`}
        </span>
        {mode === 'local' && (
          <span className="text-[#C84B31]">
            {lang === 'ar' ? `دور اللاعب ${turn}` : `Player ${turn} Turn`}
          </span>
        )}
        <span className="font-mono-tabular text-[#2D6A4F]">
          {matched.length / 2} / 8
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
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
