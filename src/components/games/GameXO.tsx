import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { GameProps } from './GameShell';
import { checkXOWinner, getBestXOMove, type XOCell } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

export const GameXO: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [localBoard, setLocalBoard] = useState<XOCell[]>(Array(9).fill(null));
  const [localTurn, setLocalTurn] = useState<'X' | 'O'>('X');
  const [locked, setLocked] = useState(false);

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
    : !check.winner && (mode === 'local' || localTurn === 'X');

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

  // AI turn in solo mode
  useEffect(() => {
    if (mode !== 'solo' || localTurn !== 'O' || check.winner) return;
    setLocked(true);
    const timer = window.setTimeout(() => {
      const move = getBestXOMove(localBoard, 'O');
      if (move >= 0) {
        const next = [...localBoard];
        next[move] = 'O';
        soundEngine.playClick();
        setLocalBoard(next);
        const res = checkXOWinner(next);
        if (res.winner) {
          const outcome = res.winner === 'X' ? 'win' : res.winner === 'O' ? 'loss' : 'draw';
          onFinish({
            outcome,
            score: outcome === 'win' ? 100 : outcome === 'draw' ? 40 : 20,
          });
        } else {
          setLocalTurn('X');
        }
      }
      setLocked(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [mode, localTurn, localBoard, check.winner]);

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
      if (mode === 'local') {
        onFinish({
          outcome: res.winner === 'draw' ? 'draw' : 'win',
          score: res.winner === 'draw' ? 40 : 90,
          summaryText:
            res.winner === 'draw'
              ? lang === 'ar'
                ? 'تعادل رائع بين اللاعبين!'
                : 'Evenly matched draw!'
              : lang === 'ar'
              ? `فاز اللاعب ${res.winner}!`
              : `Player ${res.winner} wins!`,
        });
      } else {
        const outcome = res.winner === 'X' ? 'win' : res.winner === 'O' ? 'loss' : 'draw';
        onFinish({
          outcome,
          score: outcome === 'win' ? 100 : outcome === 'draw' ? 40 : 20,
        });
      }
    } else {
      setLocalTurn(localTurn === 'X' ? 'O' : 'X');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-2">
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
              ? 'الكمبيوتر'
              : 'AI Bot'
            : lang === 'ar'
            ? 'اللاعب الثاني'
            : 'Player O'}
        </span>
      </div>

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
