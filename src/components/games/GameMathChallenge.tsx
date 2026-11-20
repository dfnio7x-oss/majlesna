import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import type { GameProps } from './GameShell';
import { generateMathQuestion } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

export const GameMathChallenge: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => generateMathQuestion(1));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      onFinish({
        outcome: solved >= 6 ? 'win' : 'loss',
        score,
        summaryText:
          lang === 'ar'
            ? `حللت ${solved} مسألة حسابية بنجاح`
            : `Solved ${solved} equations in time`,
      });
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft, finished]);

  const handleOption = (val: number) => {
    if (finished) return;
    if (val === question.answer) {
      soundEngine.playPoint();
      const nextStreak = streak + 1;
      const gained = 10 + Math.min(20, nextStreak * 3);
      const nextScore = score + gained;
      const nextSolved = solved + 1;
      const nextLevel = 1 + Math.floor(nextSolved / 3);
      setStreak(nextStreak);
      setScore(nextScore);
      setSolved(nextSolved);
      setLevel(nextLevel);
      onScoreProgress?.(nextScore);
      setQuestion(generateMathQuestion(nextLevel));
    } else {
      soundEngine.playError();
      setStreak(0);
      setQuestion(generateMathQuestion(level));
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center py-4">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="font-mono-tabular text-[#C84B31]">{timeLeft}s</span>
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <span className="flex items-center gap-1 text-[#D97706]">
              <Flame className="w-4 h-4" />
              {streak}×
            </span>
          )}
          <span className="font-mono-tabular text-[#2D6A4F]">{score} pts</span>
        </div>
      </div>

      <div className="h-2 rounded-full bg-[#F1ECE2] overflow-hidden">
        <div
          className="h-full bg-[#2B4C7E] transition-all duration-500"
          style={{ width: `${(timeLeft / 45) * 100}%` }}
        />
      </div>

      <div className="p-8 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <p dir="ltr" className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {question.prompt}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleOption(opt)}
            className="h-14 rounded-2xl bg-white dark:bg-[#1E1B18] hover:bg-[#FAF8F4] dark:bg-[#25211D] border-2 border-[#E5DEC9] dark:border-[#342E28] hover:border-[#2B4C7E] font-mono-tabular text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
