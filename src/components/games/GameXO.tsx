import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { GameProps } from './GameShell';
import { checkXOWinner, getBestXOMove, type XOCell } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

const MAX_STAGES = 5;
const TARGET_WINS = 3;

export const GameXO: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  onFinish,
  onScoreProgress,
  onRoomAction,
}) => {
  const [localBoard, setLocalBoard] = useState<XOCell[]>(Array(9).fill(null));
  const [localTurn, setLocalTurn] = useState<'X' | 'O'>('X');
  const [locked, setLocked] = useState(false);

  // Multi-stage championship state for Solo / Local
  const [stage, setStage] = useState(1);
  const [tally, setTally] = useState({ x: 0, o: 0, draws: 0 });
  const [stageBanner, setStageBanner] = useState<string | null>(null);

  const onlineState = mode === 'online' && room
    ? (room.gameState as {
        board?: XOCell[];
        turnPlayerId?: string;
        xPlayerId?: string;
        oPlayerId?: string;
        winner?: string | null;
        winLine?: number[] | null;
      })
    : null;

  const board = onlineState?.board ?? localBoard;
  const check = checkXOWinner(board);
  const winLine = onlineState?.winLine ?? check.line;

  const myMark: 'X' | 'O' =
    onlineState && onlineState.oPlayerId === playerId ? 'O' : 'X';

  const isMyTurn = onlineState
    ? !onlineState.winner && onlineState.turnPlayerId === playerId
    : !check.winner && !stageBanner && (mode === 'local' || localTurn === 'X');

  // Online completion detection
  useEffect(() => {
    if (!onlineState?.winner) return;
    if (onlineState.winner === 'draw') {
      onFinish({ outcome: 'draw', score: 40 });
    } else {
      const won = onlineState.winner === myMark;
      onFinish({ outcome: won ? 'win' : 'loss', score: won ? 100 : 25 });
    }
  }, [onlineState?.winner]);

  const handleStageComplete = (winner: 'X' | 'O' | 'draw') => {
    const nextTally = {
      x: tally.x + (winner === 'X' ? 1 : 0),
      o: tally.o + (winner === 'O' ? 1 : 0),
      draws: tally.draws + (winner === 'draw' ? 1 : 0),
    };
    setTally(nextTally);
    const liveScore = nextTally.x * 35 + nextTally.draws * 12;
    onScoreProgress?.(liveScore);

    if (winner === 'X') soundEngine.playPoint();
    else if (winner === 'O') soundEngine.playError();

    const reachedTarget = nextTally.x >= TARGET_WINS || nextTally.o >= TARGET_WINS;
    const reachedMax = stage >= MAX_STAGES;

    const msg =
      winner === 'draw'
        ? lang === 'ar'
          ? `انتهت المرحلة ${stage} بالتعادل!`
          : `Stage ${stage} ended in a draw!`
        : lang === 'ar'
        ? `حسم ${winner} المرحلة ${stage}!`
        : `${winner} took Stage ${stage}!`;
    setStageBanner(msg);
    setLocked(true);

    window.setTimeout(() => {
      if (reachedTarget || reachedMax) {
        if (mode === 'local') {
          const outcome = nextTally.x === nextTally.o ? 'draw' : 'win';
          onFinish({
            outcome,
            score: Math.max(nextTally.x, nextTally.o) * 40 + nextTally.draws * 10,
            summaryText:
              nextTally.x === nextTally.o
                ? lang === 'ar'
                  ? `تعادل بعد ${stage} مراحل (${nextTally.x}-${nextTally.o})`
                  : `Tied after ${stage} stages (${nextTally.x}-${nextTally.o})`
                : lang === 'ar'
                ? `بطل السلسلة: ${nextTally.x > nextTally.o ? 'X' : 'O'} (${nextTally.x}-${nextTally.o})`
                : `Series Champion: ${nextTally.x > nextTally.o ? 'X' : 'O'} (${nextTally.x}-${nextTally.o})`,
          });
        } else {
          const outcome =
            nextTally.x > nextTally.o
              ? 'win'
              : nextTally.x < nextTally.o
              ? 'loss'
              : 'draw';
          onFinish({
            outcome,
            score: Math.max(25, nextTally.x * 40 + nextTally.draws * 15),
            summaryText:
              lang === 'ar'
                ? `النتيجة النهائية بعد ${stage} مراحل: X ${nextTally.x} - ${nextTally.o} O`
                : `Final score after ${stage} stages: X ${nextTally.x} - ${nextTally.o} O`,
          });
        }
      } else {
        const nextStage = stage + 1;
        setStage(nextStage);
        setLocalBoard(Array(9).fill(null));
        setLocalTurn(nextStage % 2 === 0 ? 'O' : 'X');
        setStageBanner(null);
        setLocked(false);
      }
    }, 850);
  };

  // AI turn in solo mode (escalates after Stage 2)
  useEffect(() => {
    if (mode !== 'solo' || localTurn !== 'O' || check.winner || stageBanner) return;
    setLocked(true);
    const timer = window.setTimeout(() => {
      const empties = localBoard
        .map((v, i) => (v === null ? i : -1))
        .filter((i) => i !== -1);
      // Stages 1-2 occasionally let an opening slip; Stages 3-5 play full optimal AI
      const playRandomOpen = stage === 1 && empties.length >= 6 && Math.random() < 0.35;
      const move = playRandomOpen
        ? empties[Math.floor(Math.random() * empties.length)]
        : getBestXOMove(localBoard, 'O');

      if (move >= 0) {
        const next = [...localBoard];
        next[move] = 'O';
        soundEngine.playClick();
        setLocalBoard(next);
        const res = checkXOWinner(next);
        if (res.winner) {
          handleStageComplete(res.winner);
        } else {
          setLocalTurn('X');
          setLocked(false);
        }
      } else {
        setLocked(false);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [mode, localTurn, localBoard, check.winner, stageBanner, stage]);

  const handleCellClick = (idx: number) => {
    if (board[idx] !== null || locked) return;

    if (mode === 'online' && onRoomAction) {
      if (!isMyTurn) return;
      soundEngine.playClick();
      onRoomAction({ action: 'xo_move', index: idx });
      return;
    }

    if (check.winner) return;
    const next = [...localBoard];
    next[idx] = localTurn;
    soundEngine.playClick();
    setLocalBoard(next);

    const res = checkXOWinner(next);
    if (res.winner) {
      handleStageComplete(res.winner);
    } else {
      setLocalTurn(localTurn === 'X' ? 'O' : 'X');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-5 py-2">
      {mode !== 'online' && (
        <div className="w-full max-w-md flex items-center justify-between px-4 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold">
          <span className="text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar'
              ? `المرحلة ${stage} / ${MAX_STAGES} (الأفضل من ٥)`
              : `Stage ${stage} / ${MAX_STAGES} (Best of 5)`}
          </span>
          <span className="font-mono-tabular text-[#1C1917] dark:text-[#F5F2EB]">
            X {tally.x} · D {tally.draws} · O {tally.o}
          </span>
        </div>
      )}

      <div className="flex items-center gap-6 text-sm font-semibold">
        <span
          className={`px-4 py-1.5 rounded-xl border ${
            (onlineState ? onlineState.turnPlayerId === onlineState.xPlayerId : localTurn === 'X')
              ? 'bg-[#C84B31]/12 border-[#C84B31] text-[#C84B31]'
              : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#57534E] dark:text-[#B8AFA3]'
          }`}
        >
          X · {mode === 'online' ? room?.players.find((p) => p.id === onlineState?.xPlayerId)?.name ?? 'P1' : lang === 'ar' ? 'أنت' : 'Player X'}
        </span>
        <span className="text-[#8C8478]">VS</span>
        <span
          className={`px-4 py-1.5 rounded-xl border ${
            (onlineState ? onlineState.turnPlayerId === onlineState.oPlayerId : localTurn === 'O')
              ? 'bg-[#2D6A4F]/12 border-[#2D6A4F] text-[#2D6A4F]'
              : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#57534E] dark:text-[#B8AFA3]'
          }`}
        >
          O · {mode === 'online'
            ? room?.players.find((p) => p.id === onlineState?.oPlayerId)?.name ?? 'P2'
            : mode === 'solo'
            ? lang === 'ar'
              ? `الكمبيوتر (${lang === 'ar' && stage >= 3 ? 'ذكي' : 'متوسط'})`
              : `AI Bot (${stage >= 3 ? 'Pro' : 'Casual'})`
            : lang === 'ar'
            ? 'اللاعب الثاني'
            : 'Player O'}
        </span>
      </div>

      {stageBanner && (
        <p className="font-display text-sm font-bold text-[#C84B31]">{stageBanner}</p>
      )}

      <div className="grid grid-cols-3 gap-3 bg-[#F1ECE2] p-4 rounded-3xl border border-[#E5DEC9] dark:border-[#342E28]">
        {board.map((cell, idx) => {
          const isWinningCell = winLine?.includes(idx) ?? false;
          return (
            <button
              key={idx}
              type="button"
              disabled={cell !== null || !isMyTurn}
              onClick={() => handleCellClick(idx)}
              aria-label={`Cell ${idx + 1}${cell ? `: ${cell}` : ''}`}
              className={`w-22 h-22 sm:w-26 sm:h-26 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer disabled:cursor-default ${
                isWinningCell
                  ? 'bg-[#FEF3C7] border-[#D97706]'
                  : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#C84B31]/50'
              }`}
            >
              {cell === 'X' && (
                <motion.svg
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.16 }}
                  viewBox="0 0 40 40"
                  className="w-12 h-12"
                >
                  <path
                    d="M10 10L30 30M30 10L10 30"
                    stroke="#C84B31"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                </motion.svg>
              )}
              {cell === 'O' && (
                <motion.svg
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.16 }}
                  viewBox="0 0 40 40"
                  className="w-12 h-12"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="11"
                    fill="none"
                    stroke="#2D6A4F"
                    strokeWidth="4.5"
                  />
                </motion.svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
