import React, { useMemo, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import type { GameProps } from './GameShell';
import { RIDDLES_BANK } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

export const GameRiddles: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const riddles = useMemo(() => {
    const copy = [...RIDDLES_BANK];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 6);
  }, []);

  const [idx, setIdx] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);

  const item = riddles[idx];

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === item.correctIndex;
    let nextScore = score;
    let nextSolved = solved;

    if (correct) {
      soundEngine.playPoint();
      nextScore += hintUsed ? 15 : 25;
      nextSolved += 1;
      setScore(nextScore);
      setSolved(nextSolved);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }

    window.setTimeout(() => {
      if (idx + 1 >= riddles.length) {
        onFinish({
          outcome: nextSolved >= 3 ? 'win' : 'loss',
          score: nextScore,
          summaryText:
            lang === 'ar'
              ? `حللت ${nextSolved} من ${riddles.length} ألغاز`
              : `Solved ${nextSolved} of ${riddles.length} riddles`,
        });
      } else {
        setIdx((i) => i + 1);
        setHintUsed(false);
        setSelected(null);
      }
    }, 900);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span className="font-mono-tabular">
          {lang === 'ar' ? `اللغز ${idx + 1} / ${riddles.length}` : `Riddle ${idx + 1} / ${riddles.length}`}
        </span>
        <span className="font-mono-tabular text-[#4338CA]">{score} pts</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-3">
        <p className="font-display text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB] leading-relaxed">
          {item.question[lang]}
        </p>
        {!hintUsed ? (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setHintUsed(true);
            }}
            className="text-xs font-semibold text-[#4338CA] flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'أظهر التلميح' : 'Show Hint'}</span>
          </button>
        ) : (
          <p className="text-xs font-medium text-[#4338CA] bg-[#4338CA]/8 px-3 py-2 rounded-lg">
            {item.hint[lang]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {item.options[lang].map((opt, oIdx) => {
          let cls = 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#4338CA] text-[#1C1917] dark:text-[#F5F2EB]';
          if (selected !== null) {
            if (oIdx === item.correctIndex) cls = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
            else if (oIdx === selected) cls = 'bg-[#C84B31] border-[#C84B31] text-white';
          }
          return (
            <button
              key={oIdx}
              type="button"
              disabled={selected !== null}
              onClick={() => handleSelect(oIdx)}
              className={`p-4 rounded-xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
