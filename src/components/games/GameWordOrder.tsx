import React, { useMemo, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';
import type { GameProps } from './GameShell';
import { SCRAMBLE_WORDS } from '../../data/questionBank';
import { scrambleChars } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

export const GameWordOrder: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const items = useMemo(() => {
    const copy = [...SCRAMBLE_WORDS[lang]];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 12);
  }, [lang]);

  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState<string[]>(() => scrambleChars(items[0].word));
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  const currentItem = items[round];
  const assembled = pickedIndices.map((i) => tiles[i]).join('');

  const handleTilePick = (tileIdx: number) => {
    if (pickedIndices.includes(tileIdx)) return;
    soundEngine.playClick();
    const nextPicked = [...pickedIndices, tileIdx];
    setPickedIndices(nextPicked);

    const candidate = nextPicked.map((i) => tiles[i]).join('');
    if (nextPicked.length === tiles.length) {
      if (candidate === currentItem.word) {
        soundEngine.playPoint();
        const gained = showHint ? 15 : 25;
        const nextScore = score + gained;
        setScore(nextScore);
        onScoreProgress?.(nextScore);

        window.setTimeout(() => {
          if (round + 1 >= items.length) {
            onFinish({
              outcome: 'win',
              score: nextScore,
              summaryText:
                lang === 'ar'
                  ? `رتّبت جميع الكلمات الـ ${items.length} بنجاح!`
                  : `All ${items.length} words unscrambled!`,
            });
          } else {
            const nextR = round + 1;
            setRound(nextR);
            setTiles(scrambleChars(items[nextR].word));
            setPickedIndices([]);
            setShowHint(false);
          }
        }, 500);
      } else {
        soundEngine.playError();
        window.setTimeout(() => setPickedIndices([]), 450);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center py-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] font-mono-tabular">
        <span>{round + 1} / {items.length}</span>
        <span className="text-[#D97706]">{score} pts</span>
      </div>

      {/* Assembled Word Slots */}
      <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
        {tiles.map((_, slotIdx) => {
          const pickedTileIdx = pickedIndices[slotIdx];
          const ch = pickedTileIdx !== undefined ? tiles[pickedTileIdx] : '';
          return (
            <div
              key={slotIdx}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center font-display text-xl font-bold ${
                assembled === currentItem.word
                  ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                  : ch
                  ? 'bg-white dark:bg-[#1E1B18] border-[#1C1917] text-[#1C1917] dark:text-[#F5F2EB]'
                  : 'bg-[#FAF8F4] dark:bg-[#25211D] border-dashed border-[#D6CEBF]'
              }`}
            >
              {ch}
            </div>
          );
        })}
      </div>

      {showHint && (
        <p className="text-xs font-medium text-[#92400E] bg-[#FEF3C7] px-3 py-2 rounded-xl inline-block">
          {currentItem.hint}
        </p>
      )}

      {/* Scrambled Pool */}
      <div className="flex flex-wrap justify-center gap-2.5 pt-2">
        {tiles.map((ch, idx) => {
          const used = pickedIndices.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={used}
              onClick={() => handleTilePick(idx)}
              className={`w-12 h-12 rounded-xl border-2 font-display text-lg font-bold tactile-btn cursor-pointer ${
                used
                  ? 'opacity-25 bg-[#F1ECE2] border-[#E5DEC9] dark:border-[#342E28] cursor-default'
                  : 'bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] border-[#D97706]/50 text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              {ch}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setPickedIndices([]);
          }}
          className="h-9 px-3.5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'مسح' : 'Reset'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setShowHint(true);
          }}
          className="h-9 px-3.5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-xs font-semibold text-[#D97706] flex items-center gap-1.5 cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تلميح' : 'Hint'}</span>
        </button>
      </div>
    </div>
  );
};
