import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { GameProps } from './GameShell';
import { resolveRPS, type RPSChoice } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

const CHOICES: { id: RPSChoice; ar: string; en: string }[] = [
  { id: 'rock', ar: 'حجر', en: 'Rock' },
  { id: 'paper', ar: 'ورقة', en: 'Paper' },
  { id: 'scissors', ar: 'مقص', en: 'Scissors' },
];

const RPSSvg: React.FC<{ choice: RPSChoice }> = ({ choice }) => {
  if (choice === 'rock') {
    return (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <path
          d="M14 26C14 19 18 14 24 14C30 14 35 19 35 26C35 32 30 35 24 35C18 35 14 32 14 26Z"
          fill="#C84B31"
          fillOpacity="0.18"
          stroke="#1C1917"
          strokeWidth="2.4"
        />
        <path d="M19 22H29" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (choice === 'paper') {
    return (
      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
        <rect x="13" y="10" width="22" height="28" rx="4" fill="#2D6A4F" fillOpacity="0.15" stroke="#1C1917" strokeWidth="2.4" />
        <path d="M18 18H30M18 24H30M18 30H25" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
      <circle cx="16" cy="32" r="5" stroke="#2B4C7E" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="5" stroke="#2B4C7E" strokeWidth="2.4" />
      <path d="M19 28L32 12M29 28L16 12" stroke="#1C1917" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

export const GameRPS: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [p1Pick, setP1Pick] = useState<RPSChoice | null>(null);
  const [p2Pick, setP2Pick] = useState<RPSChoice | null>(null);
  const [localTurn, setLocalTurn] = useState<1 | 2>(1);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const onlineState = mode === 'online' && room
    ? (room.gameState as {
        round?: number;
        maxRounds?: number;
        submittedIds?: string[];
        lastReveal?: { round: number; picks: Record<string, RPSChoice>; winnerId: string } | null;
      })
    : null;

  useEffect(() => {
    if (mode === 'online' && room?.status === 'results') {
      const me = room.players.find((p) => p.id === playerId);
      const topScore = Math.max(...room.players.map((p) => p.roundScore));
      const won = (me?.roundScore ?? 0) >= topScore;
      onFinish({ outcome: won ? 'win' : 'loss', score: me?.roundScore ?? 0 });
    }
  }, [room?.status]);

  const totalRounds = mode === 'online' ? (onlineState?.maxRounds ?? 5) : 10;

  const handlePick = (choice: RPSChoice) => {
    soundEngine.playClick();

    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'rps_pick', choice });
      return;
    }

    if (mode === 'local') {
      if (localTurn === 1) {
        setP1Pick(choice);
        setLocalTurn(2);
        return;
      }
      const c1 = p1Pick!;
      const c2 = choice;
      const res = resolveRPS(c1, c2);
      const nextScores = {
        p1: scores.p1 + (res === 'p1' ? 1 : 0),
        p2: scores.p2 + (res === 'p2' ? 1 : 0),
      };
      setScores(nextScores);
      setP2Pick(c2);
      setLastResult(
        res === 'draw'
          ? lang === 'ar' ? 'تعادل!' : 'Draw!'
          : res === 'p1'
          ? lang === 'ar' ? 'نقطة للاعب ١!' : 'Point for Player 1!'
          : lang === 'ar' ? 'نقطة للاعب ٢!' : 'Point for Player 2!'
      );
      if (round >= totalRounds) {
        onFinish({
          outcome: nextScores.p1 === nextScores.p2 ? 'draw' : 'win',
          score: Math.max(nextScores.p1, nextScores.p2) * 25 + 20,
        });
      } else {
        window.setTimeout(() => {
          setRound((r) => r + 1);
          setP1Pick(null);
          setP2Pick(null);
          setLocalTurn(1);
        }, 1000);
      }
      return;
    }

    // Solo vs AI
    const botPick = CHOICES[Math.floor(Math.random() * 3)].id;
    const res = resolveRPS(choice, botPick);
    setP1Pick(choice);
    setP2Pick(botPick);
    const nextScores = {
      p1: scores.p1 + (res === 'p1' ? 1 : 0),
      p2: scores.p2 + (res === 'p2' ? 1 : 0),
    };
    setScores(nextScores);
    setLastResult(
      res === 'draw'
        ? lang === 'ar' ? 'تعادل في هذه الجولة' : 'Round Draw'
        : res === 'p1'
        ? lang === 'ar' ? 'فزت بهذه الجولة!' : 'You won this round!'
        : lang === 'ar' ? 'حسم الكمبيوتر الجولة' : 'Bot took this round'
    );
    if (res === 'p1') soundEngine.playPoint();

    if (round >= totalRounds) {
      window.setTimeout(() => {
        const outcome =
          nextScores.p1 > nextScores.p2 ? 'win' : nextScores.p1 < nextScores.p2 ? 'loss' : 'draw';
        onFinish({ outcome, score: nextScores.p1 * 25 + 25 });
      }, 950);
    } else {
      window.setTimeout(() => {
        setRound((r) => r + 1);
        setP1Pick(null);
        setP2Pick(null);
        setLastResult(null);
      }, 950);
    }
  };

  const hasSubmittedOnline = onlineState?.submittedIds?.includes(playerId) ?? false;

  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-4">
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <div>
          <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{lang === 'ar' ? 'الجولة' : 'Round'}</p>
          <p className="font-mono-tabular text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
            {onlineState?.round ?? round} / {totalRounds}
          </p>
        </div>
        {mode !== 'online' && (
          <div className="flex items-center gap-6 font-mono-tabular text-xl font-bold">
            <span className="text-[#C84B31]">{scores.p1}</span>
            <span className="text-xs text-[#8C8478]">VS</span>
            <span className="text-[#2D6A4F]">{scores.p2}</span>
          </div>
        )}
      </div>

      {mode === 'local' && localTurn === 2 && !p2Pick && (
        <p className="text-sm font-semibold text-[#C84B31]">
          {lang === 'ar'
            ? 'دور اللاعب ٢ — اختر سراً دون أن يرى اللاعب ١'
            : 'Player 2 Turn — Pick secretly'}
        </p>
      )}

      {p1Pick && p2Pick && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-8 py-2"
        >
          <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] flex flex-col items-center gap-2">
            <RPSSvg choice={p1Pick} />
            <span className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {lang === 'ar' ? 'أنت' : 'You'}
            </span>
          </div>
          <span className="font-display font-bold text-[#1C1917] dark:text-[#F5F2EB]">VS</span>
          <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] flex flex-col items-center gap-2">
            <RPSSvg choice={p2Pick} />
            <span className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {mode === 'local' ? (lang === 'ar' ? 'اللاعب ٢' : 'Player 2') : lang === 'ar' ? 'الخصم' : 'Bot'}
            </span>
          </div>
        </motion.div>
      )}

      {lastResult && <p className="font-display text-lg font-bold text-[#2D6A4F]">{lastResult}</p>}

      {hasSubmittedOnline ? (
        <p className="text-sm font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'تم إرسال اختيارك — بانتظار الخصم...' : 'Choice locked — waiting for opponent...'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {CHOICES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handlePick(c.id)}
              disabled={mode === 'solo' && Boolean(p2Pick)}
              className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] border-2 border-[#E5DEC9] dark:border-[#342E28] hover:border-[#C84B31] flex flex-col items-center gap-3 tactile-btn cursor-pointer"
            >
              <RPSSvg choice={c.id} />
              <span className="font-display text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {c[lang]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
