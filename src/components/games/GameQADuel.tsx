import React, { useState } from 'react';
import type { GameProps } from './GameShell';
import { QUIZ_QUESTIONS, type QuizQuestion } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

const CATEGORIES: { id: QuizQuestion['category']; ar: string; en: string; color: string }[] = [
  { id: 'science', ar: 'العلوم', en: 'Science', color: '#2D6A4F' },
  { id: 'history', ar: 'التاريخ', en: 'History', color: '#D97706' },
  { id: 'geography', ar: 'الجغرافيا', en: 'Geography', color: '#2B4C7E' },
  { id: 'culture', ar: 'الثقافة والفنون', en: 'Culture', color: '#C84B31' },
  { id: 'tech', ar: 'التقنية', en: 'Technology', color: '#0F766E' },
  { id: 'sports', ar: 'الرياضة', en: 'Sports', color: '#7C3AED' },
];

export const GameQADuel: React.FC<GameProps> = ({
  lang,
  mode,
  onFinish,
  onScoreProgress,
}) => {
  const [round, setRound] = useState(1);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [activeQ, setActiveQ] = useState<QuizQuestion | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [turn, setTurn] = useState<1 | 2>(1);

  const pickCategory = (cat: QuizQuestion['category']) => {
    soundEngine.playSelect();
    const pool = QUIZ_QUESTIONS.filter((q) => q.category === cat && !usedIds.includes(q.id));
    const fallback = QUIZ_QUESTIONS.filter((q) => !usedIds.includes(q.id));
    const chosen = (pool.length > 0 ? pool : fallback)[0] ?? QUIZ_QUESTIONS[0];
    setUsedIds((prev) => [...prev, chosen.id]);
    setActiveQ(chosen);
    setSelectedIdx(null);
  };

  const handleAnswer = (idx: number) => {
    if (!activeQ || selectedIdx !== null) return;
    setSelectedIdx(idx);
    const correct = idx === activeQ.correctIndex;
    const pts = correct ? 25 : 0;
    if (correct) soundEngine.playPoint();
    else soundEngine.playError();

    const nextScores = {
      p1: scores.p1 + (turn === 1 ? pts : 0),
      p2: scores.p2 + (turn === 2 ? pts : 0),
    };
    setScores(nextScores);
    onScoreProgress?.(nextScores.p1);

    window.setTimeout(() => {
      if (round >= 12) {
        const outcome =
          mode === 'local'
            ? nextScores.p1 === nextScores.p2
              ? 'draw'
              : 'win'
            : nextScores.p1 >= 150
            ? 'win'
            : 'loss';
        onFinish({
          outcome,
          score: Math.max(nextScores.p1, nextScores.p2),
          summaryText:
            mode === 'local'
              ? lang === 'ar'
                ? `اللاعب ١: ${nextScores.p1} · اللاعب ٢: ${nextScores.p2}`
                : `P1: ${nextScores.p1} · P2: ${nextScores.p2}`
              : undefined,
        });
      } else {
        setRound((r) => r + 1);
        setActiveQ(null);
        setSelectedIdx(null);
        if (mode === 'local') setTurn((t) => (t === 1 ? 2 : 1));
      }
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span className="font-mono-tabular text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? `الجولة ${round} / 12` : `Round ${round} / 12`}
        </span>
        {mode === 'local' ? (
          <span className="text-[#C84B31]">
            {lang === 'ar' ? `دور اللاعب ${turn}` : `Player ${turn} Turn`} · {scores.p1} - {scores.p2}
          </span>
        ) : (
          <span className="font-mono-tabular text-[#2D6A4F]">{scores.p1} pts</span>
        )}
      </div>

      {!activeQ ? (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB] text-center">
            {lang === 'ar' ? 'اختر تصنيف السؤال' : 'Choose a Topic Category'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => pickCategory(cat.id)}
                className="p-4 rounded-2xl border-2 border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] hover:border-[#C84B31] text-center font-display font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
              >
                <span
                  className="block w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: cat.color }}
                />
                {cat[lang]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <h2 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
            {activeQ.question[lang]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeQ.options[lang].map((opt, idx) => {
              let cls = 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#0F766E] text-[#1C1917] dark:text-[#F5F2EB]';
              if (selectedIdx !== null) {
                if (idx === activeQ.correctIndex) cls = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
                else if (idx === selectedIdx) cls = 'bg-[#C84B31] border-[#C84B31] text-white';
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={selectedIdx !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
