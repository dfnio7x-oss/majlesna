import React, { useEffect, useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import type { GameProps } from './GameShell';
import { QUIZ_QUESTIONS } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

export const GameTrivia: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const questions = useMemo(() => {
    const copy = [...QUIZ_QUESTIONS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 8);
  }, []);

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[index];

  useEffect(() => {
    if (selected !== null) return;
    if (timeLeft <= 0) {
      handleSelect(-1);
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [timeLeft, selected, index]);

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const isCorrect = optIdx === q.correctIndex;
    let nextScore = score;
    let nextCorrect = correctCount;

    if (isCorrect) {
      soundEngine.playPoint();
      const gained = 15 + timeLeft + streak * 5;
      nextScore += gained;
      nextCorrect += 1;
      setScore(nextScore);
      setStreak((s) => s + 1);
      setCorrectCount(nextCorrect);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
      setStreak(0);
    }

    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        onFinish({
          outcome: nextCorrect >= 4 ? 'win' : 'loss',
          score: nextScore,
          summaryText:
            lang === 'ar'
              ? `أجبت إجابة صحيحة على ${nextCorrect} من أصل ${questions.length}`
              : `Answered ${nextCorrect} out of ${questions.length} correctly`,
        });
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
        setTimeLeft(15);
      }
    }, 850);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="font-mono-tabular text-[#57534E] dark:text-[#B8AFA3]">
          {index + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <span className="flex items-center gap-1 text-[#D97706]">
              <Flame className="w-4 h-4" />
              {streak}×
            </span>
          )}
          <span className="font-mono-tabular text-[#2B4C7E]">{timeLeft}s</span>
          <span className="font-mono-tabular text-[#2D6A4F]">{score} pts</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-2 rounded-full bg-[#F1ECE2] overflow-hidden">
        <div
          className="h-full bg-[#C84B31] transition-all duration-500"
          style={{ width: `${(timeLeft / 15) * 100}%` }}
        />
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB] leading-snug">
        {q.question[lang]}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options[lang].map((opt, idx) => {
          let cls = 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#2B4C7E] text-[#1C1917] dark:text-[#F5F2EB]';
          if (selected !== null) {
            if (idx === q.correctIndex) cls = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
            else if (idx === selected) cls = 'bg-[#C84B31] border-[#C84B31] text-white';
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={selected !== null}
              onClick={() => handleSelect(idx)}
              className={`p-4 rounded-2xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
