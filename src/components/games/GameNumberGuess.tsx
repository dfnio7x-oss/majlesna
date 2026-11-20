import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import type { GameProps } from './GameShell';
import { evaluateNumberGuess, type NumberGuessFeedback } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

interface LocalGuess {
  value: number;
  feedback: NumberGuessFeedback;
}

export const GameNumberGuess: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [target] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState<LocalGuess[]>([]);

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
    const val = Math.round(Number(input));
    if (!Number.isFinite(val) || val < 1 || val > 100) {
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
      const score = Math.max(40, 140 - nextGuesses.length * 10);
      onFinish({ outcome: 'win', score });
    } else if (nextGuesses.length >= 10 && mode === 'solo') {
      onFinish({
        outcome: 'loss',
        score: 20,
        summaryText: lang === 'ar' ? `الرقم السري كان ${target}` : `The secret number was ${target}`,
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
      <div className="text-center space-y-1">
        <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'خمن رقماً بين ١ و ١٠٠' : 'Guess a secret number between 1 and 100'}
        </p>
        {mode !== 'online' && (
          <p className="font-mono-tabular text-sm font-bold text-[#2B4C7E]">
            {lang === 'ar' ? `المحاولات: ${guesses.length} / 10` : `Attempts: ${guesses.length} / 10`}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="number"
          min={1}
          max={100}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1 — 100"
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
