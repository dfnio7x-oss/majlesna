import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { GameProps } from './GameShell';
import { TRUE_FALSE_BANK } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

export const GameTrueFalse: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const items = useMemo(() => {
    const copy = [...TRUE_FALSE_BANK];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 8);
  }, []);

  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<{ pick: boolean; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const item = items[idx];

  const handlePick = (val: boolean) => {
    if (answered) return;
    const correct = val === item.isTrue;
    setAnswered({ pick: val, correct });
    let nextScore = score;
    let nextCount = correctCount;

    if (correct) {
      soundEngine.playPoint();
      nextScore += 18;
      nextCount += 1;
      setScore(nextScore);
      setCorrectCount(nextCount);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }

    window.setTimeout(() => {
      if (idx + 1 >= items.length) {
        onFinish({
          outcome: nextCount >= 5 ? 'win' : 'loss',
          score: nextScore,
          summaryText:
            lang === 'ar'
              ? `أصبت في ${nextCount} من ${items.length} حقائق`
              : `Got ${nextCount} out of ${items.length} facts right`,
        });
      } else {
        setIdx((i) => i + 1);
        setAnswered(null);
      }
    }, 1500);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] font-mono-tabular">
        <span>{idx + 1} / {items.length}</span>
        <span className="text-[#2D6A4F]">{score} pts</span>
      </div>

      <div className="p-7 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] min-h-[150px] flex items-center justify-center">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB] leading-relaxed">
          {item.statement[lang]}
        </h2>
      </div>

      {answered && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border ${
            answered.correct
              ? 'bg-[#2D6A4F]/10 border-[#2D6A4F]/30 text-[#1F513B]'
              : 'bg-[#C84B31]/10 border-[#C84B31]/30 text-[#991B1B]'
          }`}
        >
          {item.explanation[lang]}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={Boolean(answered)}
          onClick={() => handlePick(true)}
          className="h-14 rounded-2xl bg-[#2D6A4F] hover:bg-[#23533D] text-white font-display font-bold text-base flex items-center justify-center gap-2 tactile-btn cursor-pointer disabled:opacity-60"
        >
          <Check className="w-5 h-5" />
          <span>{lang === 'ar' ? 'صحيح' : 'True'}</span>
        </button>
        <button
          type="button"
          disabled={Boolean(answered)}
          onClick={() => handlePick(false)}
          className="h-14 rounded-2xl bg-[#C84B31] hover:bg-[#B03E26] text-white font-display font-bold text-base flex items-center justify-center gap-2 tactile-btn cursor-pointer disabled:opacity-60"
        >
          <X className="w-5 h-5" />
          <span>{lang === 'ar' ? 'خطأ' : 'False'}</span>
        </button>
      </div>
    </div>
  );
};
