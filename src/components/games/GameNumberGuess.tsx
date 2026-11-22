import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import type { GameProps } from './GameShell';
import { evaluateNumberGuess, type NumberGuessFeedback } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

interface LocalGuess {
  value: number;
  feedback: NumberGuessFeedback;
}

const NUMBER_STAGES = [
  { max: 50, maxAttempts: 7, reward: 50 },
  { max: 100, maxAttempts: 8, reward: 70 },
  { max: 250, maxAttempts: 9, reward: 95 },
  { max: 500, maxAttempts: 10, reward: 120 },
  { max: 1000, maxAttempts: 12, reward: 160 },
];

export const GameNumberGuess: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  onFinish,
  onScoreProgress,
  onRoomAction,
}) => {
  const [stageIdx, setStageIdx] = useState(0);
  const currentMax = mode === 'online' ? 100 : NUMBER_STAGES[stageIdx].max;
  const maxAttempts = NUMBER_STAGES[stageIdx].maxAttempts;

  const [target, setTarget] = useState(() => Math.floor(Math.random() * currentMax) + 1);
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState<LocalGuess[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [stageMsg, setStageMsg] = useState<string | null>(null);

  const onlineState = mode === 'online' && room
    ? (room.gameState as {
        guesses?: { playerId: string; playerName: string; value: number; relation: string; proximity: string }[];
        winnerId?: string | null;
        winnerName?: string | null;
      })
    : null;

  useEffect(() => {
    if (onlineState?.winnerId) {
      const won = onlineState.winnerId === playerId;
      onFinish({
        outcome: won ? 'win' : 'loss',
        score: won ? 110 : 25,
        summaryText:
          lang === 'ar'
            ? `البطل ${onlineState.winnerName} خمن الرقم الصحيح!`
            : `${onlineState.winnerName} cracked the secret number!`,
      });
    }
  }, [onlineState?.winnerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageMsg) return;
    const val = Math.round(Number(input));
    if (!Number.isFinite(val) || val < 1 || val > currentMax) {
      soundEngine.playError();
      return;
    }
    setInput('');

    if (mode === 'online' && onRoomAction) {
      soundEngine.playClick();
      onRoomAction({ action: 'number_guess', value: val });
      return;
    }

    const fb = evaluateNumberGuess(val, target);
    const nextGuesses = [{ value: val, feedback: fb }, ...guesses];
    setGuesses(nextGuesses);

    if (fb.relation === 'exact') {
      soundEngine.playPoint();
      const stageConfig = NUMBER_STAGES[stageIdx];
      const stageScore = Math.max(30, stageConfig.reward - (nextGuesses.length - 1) * 6);
      const nextTotal = totalScore + stageScore;
      setTotalScore(nextTotal);
      onScoreProgress?.(nextTotal);

      if (mode === 'solo' && stageIdx + 1 < NUMBER_STAGES.length) {
        const nextStage = stageIdx + 1;
        setStageMsg(
          lang === 'ar'
            ? `أحسنت! الرقم كان ${target} · جاري الانتقال للمرحلة ${nextStage + 1} (1–${NUMBER_STAGES[nextStage].max})`
            : `Spot on! Number was ${target} · Advancing to Stage ${nextStage + 1} (1–${NUMBER_STAGES[nextStage].max})`
        );
        window.setTimeout(() => {
          setStageIdx(nextStage);
          setTarget(Math.floor(Math.random() * NUMBER_STAGES[nextStage].max) + 1);
          setGuesses([]);
          setStageMsg(null);
        }, 900);
      } else {
        onFinish({
          outcome: 'win',
          score: nextTotal,
          summaryText:
            mode === 'solo'
              ? lang === 'ar'
                ? `أنهيت جميع مراحل التخمين الخمس!`
                : `Completed all 5 Number Guess stages!`
              : undefined,
        });
      }
    } else if (nextGuesses.length >= maxAttempts && mode === 'solo') {
      onFinish({
        outcome: stageIdx >= 2 ? 'draw' : 'loss',
        score: Math.max(20, totalScore),
        summaryText:
          lang === 'ar'
            ? `توقفت عند المرحلة ${stageIdx + 1}/${NUMBER_STAGES.length} · الرقم السري كان ${target}`
            : `Stopped at Stage ${stageIdx + 1}/${NUMBER_STAGES.length} · Secret number was ${target}`,
      });
    } else {
      soundEngine.playClick();
    }
  };

  const proximityLabel = (prox: string) => {
    if (lang === 'ar') {
      if (prox === 'burning') return 'ساخن جداً';
      if (prox === 'warm') return 'دافئ';
      if (prox === 'cool') return 'مائل للبرودة';
      return 'بارد بعيد';
    }
    if (prox === 'burning') return 'Burning Hot';
    if (prox === 'warm') return 'Warm';
    if (prox === 'cool') return 'Cool';
    return 'Cold';
  };

  const displayList = onlineState?.guesses
    ? [...onlineState.guesses].reverse()
    : guesses.map((g) => ({
        playerName: '',
        value: g.value,
        relation: g.feedback.relation,
        proximity: g.feedback.proximity,
      }));

  return (
    <div className="max-w-lg mx-auto space-y-6 py-2">
      <div className="text-center space-y-1.5">
        {mode !== 'online' && (
          <div className="flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
            <span className="text-[#57534E] dark:text-[#B8AFA3]">
              {lang === 'ar'
                ? `المرحلة ${stageIdx + 1} / ${NUMBER_STAGES.length}`
                : `Stage ${stageIdx + 1} / ${NUMBER_STAGES.length}`}
            </span>
            <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">
              {totalScore} pts
            </span>
          </div>
        )}
        <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar'
            ? `خمن رقماً بين ١ و ${currentMax}`
            : `Guess a secret number between 1 and ${currentMax}`}
        </p>
        {mode !== 'online' && (
          <p className="font-mono-tabular text-sm font-bold text-[#2B4C7E]">
            {lang === 'ar'
              ? `المحاولات: ${guesses.length} / ${maxAttempts}`
              : `Attempts: ${guesses.length} / ${maxAttempts}`}
          </p>
        )}
      </div>

      {stageMsg && (
        <div className="p-3 rounded-xl bg-[#2D6A4F]/12 border border-[#2D6A4F]/30 text-center text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
          {stageMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="number"
          min={1}
          max={currentMax}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`1 — ${currentMax}`}
          aria-label="Number guess"
          className="flex-1 h-12 px-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border-2 border-[#E5DEC9] dark:border-[#342E28] text-xl font-mono-tabular font-bold text-center text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
        />
        <button
          type="submit"
          className="h-12 px-6 rounded-2xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold tactile-btn cursor-pointer"
        >
          {lang === 'ar' ? 'تخمين' : 'Guess'}
        </button>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayList.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono-tabular text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">{item.value}</span>
              {item.playerName && (
                <span className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{item.playerName}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              {item.relation === 'exact' ? (
                <span className="text-[#2D6A4F] flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {lang === 'ar' ? 'صحيح!' : 'Exact!'}
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-[#2B4C7E]">
                    {item.relation === 'higher' ? (
                      <>
                        <ArrowUp className="w-3.5 h-3.5" />
                        {lang === 'ar' ? 'أعلى' : 'Higher'}
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-3.5 h-3.5" />
                        {lang === 'ar' ? 'أقل' : 'Lower'}
                      </>
                    )}
                  </span>
                  <span className="text-[#8C8478]">·</span>
                  <span
                    className={
                      item.proximity === 'burning'
                        ? 'text-[#C84B31]'
                        : item.proximity === 'warm'
                        ? 'text-[#D97706]'
                        : 'text-[#57534E] dark:text-[#B8AFA3]'
                    }
                  >
                    {proximityLabel(item.proximity)}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
