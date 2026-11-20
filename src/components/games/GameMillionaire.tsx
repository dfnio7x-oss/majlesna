import React, { useMemo, useState } from 'react';
import { Lightbulb, Scissors, Users, Wallet } from 'lucide-react';
import type { GameProps } from './GameShell';
import { MILLIONAIRE_TIERS, QUIZ_QUESTIONS } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

export const GameMillionaire: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const questions = useMemo(() => {
    const easy = QUIZ_QUESTIONS.filter((q) => q.difficulty === 1);
    const med = QUIZ_QUESTIONS.filter((q) => q.difficulty === 2);
    const hard = QUIZ_QUESTIONS.filter((q) => q.difficulty === 3);
    const combined = [...easy, ...med, ...hard];
    // Pad cleanly up to 15 unique cycling tiers
    while (combined.length < 15) {
      combined.push(QUIZ_QUESTIONS[combined.length % QUIZ_QUESTIONS.length]);
    }
    return combined.slice(0, 15);
  }, []);

  const [step, setStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [audiencePoll, setAudiencePoll] = useState<number[] | null>(null);
  const [showHint, setShowHint] = useState(false);

  const [used5050, setUsed5050] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  const currentQ = questions[step];
  const currentPrize = step > 0 ? MILLIONAIRE_TIERS[step - 1] : 0;
  const targetPrize = MILLIONAIRE_TIERS[step];

  const handleAnswer = (idx: number) => {
    if (selectedIdx !== null || eliminated.includes(idx)) return;
    setSelectedIdx(idx);
    const isCorrect = idx === currentQ.correctIndex;

    window.setTimeout(() => {
      if (isCorrect) {
        soundEngine.playPoint();
        const points = Math.round((step + 1) * 15);
        onScoreProgress?.(points);

        if (step >= 14) {
          onFinish({
            outcome: 'win',
            score: 250,
            summaryText: lang === 'ar' ? 'مبارك! وصلت إلى المليون!' : 'You won the 1,000,000 grand prize!',
          });
        } else {
          setStep((s) => s + 1);
          setSelectedIdx(null);
          setEliminated([]);
          setAudiencePoll(null);
          setShowHint(false);
        }
      } else {
        soundEngine.playLose();
        const safeNet = step >= 10 ? 32000 : step >= 5 ? 1000 : 0;
        onFinish({
          outcome: step >= 5 ? 'draw' : 'loss',
          score: Math.max(15, step * 12),
          summaryText:
            lang === 'ar'
              ? `انتهى المشوار عند المرحلة ${step + 1} · الرصيد المضمون: ${safeNet.toLocaleString()}`
              : `Stopped at tier ${step + 1} · Safe prize: ${safeNet.toLocaleString()}`,
        });
      }
    }, 650);
  };

  const handle5050 = () => {
    if (used5050) return;
    soundEngine.playClick();
    setUsed5050(true);
    const wrong = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
    setEliminated([wrong[0], wrong[1]]);
  };

  const handleAudience = () => {
    if (usedAudience) return;
    soundEngine.playClick();
    setUsedAudience(true);
    const base = [10, 12, 14, 10];
    base[currentQ.correctIndex] = 64;
    setAudiencePoll(base);
  };

  const handleHint = () => {
    if (usedHint) return;
    soundEngine.playClick();
    setUsedHint(true);
    setShowHint(true);
  };

  const handleWalkAway = () => {
    soundEngine.playSelect();
    onFinish({
      outcome: step >= 3 ? 'win' : 'draw',
      score: Math.max(25, step * 18),
      summaryText:
        lang === 'ar'
          ? `انسحبت بذكاء ومعك ${currentPrize.toLocaleString()}`
          : `Walked away safely with ${currentPrize.toLocaleString()}`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Question Stage */}
      <div className="lg:col-span-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={used5050}
              onClick={handle5050}
              className="h-9 px-3 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-[#C84B31]" />
              <span>50:50</span>
            </button>
            <button
              type="button"
              disabled={usedAudience}
              onClick={handleAudience}
              className="h-9 px-3 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#2B4C7E]" />
              <span>{lang === 'ar' ? 'الجمهور' : 'Audience'}</span>
            </button>
            <button
              type="button"
              disabled={usedHint}
              onClick={handleHint}
              className="h-9 px-3 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{lang === 'ar' ? 'تلميح' : 'Hint'}</span>
            </button>
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={handleWalkAway}
              className="h-9 px-3.5 rounded-xl bg-[#D97706]/12 border border-[#D97706]/35 text-xs font-semibold text-[#92400E] flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar' ? `انسحاب (${currentPrize.toLocaleString()})` : `Walk (${currentPrize.toLocaleString()})`}
              </span>
            </button>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-[#1C1917] text-[#FAF8F4] space-y-3">
          <p className="font-mono-tabular text-xs text-[#FBBF24] font-semibold">
            {lang === 'ar' ? `السؤال ${step + 1} · قيمة ${targetPrize.toLocaleString()}` : `Question ${step + 1} · For ${targetPrize.toLocaleString()}`}
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold leading-snug">
            {currentQ.question[lang]}
          </h2>
        </div>

        {showHint && (
          <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/40 text-xs font-medium text-[#92400E]">
            {currentQ.hint[lang]}
          </div>
        )}

        {audiencePoll && (
          <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
            {audiencePoll.map((pct, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-14 flex items-end justify-center">
                  <div
                    className="w-6 rounded-t bg-[#2B4C7E]"
                    style={{ height: `${Math.max(12, pct)}%` }}
                  />
                </div>
                <span className="font-mono-tabular text-xs font-bold text-[#1C1917] dark:text-[#F5F2EB]">{pct}%</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options[lang].map((opt, idx) => {
            const isElim = eliminated.includes(idx);
            const isChosen = selectedIdx === idx;
            const isCorrect = idx === currentQ.correctIndex;
            let style = 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#C84B31] text-[#1C1917] dark:text-[#F5F2EB]';
            if (isElim) style = 'bg-[#F1ECE2] border-[#E5DEC9] dark:border-[#342E28] text-[#A89F91] opacity-40';
            else if (selectedIdx !== null && isCorrect) style = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
            else if (isChosen && !isCorrect) style = 'bg-[#C84B31] border-[#C84B31] text-white';

            return (
              <button
                key={idx}
                type="button"
                disabled={isElim || selectedIdx !== null}
                onClick={() => handleAnswer(idx)}
                className={`p-4 rounded-xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 15-Step Prize Ladder */}
      <aside className="lg:col-span-4 bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-4">
        <div className="space-y-1">
          {[...MILLIONAIRE_TIERS]
            .map((val, idx) => ({ val, idx }))
            .reverse()
            .map(({ val, idx }) => {
              const isCurrent = idx === step;
              const isPassed = idx < step;
              const isMilestone = idx === 4 || idx === 9 || idx === 14;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-1 rounded-lg text-xs font-mono-tabular ${
                    isCurrent
                      ? 'bg-[#D97706] text-white font-bold'
                      : isPassed
                      ? 'text-[#2D6A4F] font-semibold'
                      : isMilestone
                      ? 'text-[#1C1917] dark:text-[#F5F2EB] font-bold'
                      : 'text-[#8C8478]'
                  }`}
                >
                  <span>{idx + 1}</span>
                  <span>{val.toLocaleString()}</span>
                </div>
              );
            })}
        </div>
      </aside>
    </div>
  );
};
