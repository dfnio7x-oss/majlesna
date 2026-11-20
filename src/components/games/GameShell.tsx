import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, HelpCircle, RotateCcw, Users } from 'lucide-react';
import type { DrawStroke, GameId, Language, MatchOutcome, PlayMode, RoomState } from '../../types/game';
import { getGameById } from '../../data/gamesCatalog';
import { t } from '../../i18n/translations';
import { GameIcon, AvatarSvg } from '../icons/GameIcons';
import { OutcomeCelebration } from '../EffectsOverlay';
import { soundEngine } from '../../utils/soundEngine';
import type { PrivateSecrets } from '../../hooks/useMultiplayerSocket';

export interface GameResultPayload {
  outcome: MatchOutcome;
  score: number;
  summaryText?: string;
}

export interface GameProps {
  lang: Language;
  mode: PlayMode;
  playerId: string;
  playerName: string;
  room: RoomState | null;
  secrets: PrivateSecrets;
  onFinish: (result: GameResultPayload) => void;
  onScoreProgress?: (score: number) => void;
  onRoomAction?: (payload: Record<string, unknown>) => void;
  subscribeStrokes?: (cb: (stroke: DrawStroke) => void) => () => void;
}

interface GameShellProps {
  gameId: GameId;
  lang: Language;
  mode: PlayMode;
  room: RoomState | null;
  playerId: string;
  result: (GameResultPayload & { pointsEarned: number }) | null;
  onPlayAgain: () => void;
  onExit: () => void;
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
  gameId,
  lang,
  mode,
  room,
  playerId,
  result,
  onPlayAgain,
  onExit,
  children,
}) => {
  const copy = t(lang);
  const meta = getGameById(gameId);
  const [showRules, setShowRules] = useState(false);
  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;
  const isHost = !room || room.hostId === playerId;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Compact Game Stage Header */}
      <div className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onExit();
            }}
            aria-label={copy.actions.back}
            className="h-9 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1.5 tactile-btn cursor-pointer shrink-0"
          >
            <BackIcon className="w-4 h-4" />
            <span>{copy.actions.back}</span>
          </button>

          <GameIcon gameId={gameId} accent={meta.accentColor} className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
              {meta.title[lang]}
            </h1>
            <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
              {mode === 'online'
                ? `${copy.actions.onlineMode} · ${room?.code ?? ''}`
                : mode === 'local'
                ? copy.actions.localMode
                : copy.actions.soloMode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShowRules((v) => !v);
            }}
            className="h-9 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{copy.actions.rules}</span>
          </button>
        </div>

        <AnimatePresence>
          {showRules && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-16 end-4 w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] shadow-xl z-30"
            >
              <h2 className="font-display text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
                {copy.actions.rules} — {meta.title[lang]}
              </h2>
              <ul className="space-y-1.5 text-xs text-[#57534E] dark:text-[#B8AFA3] list-disc ps-4">
                {meta.rules[lang].map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Online Room Players Strip */}
      {room && (
        <div className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl px-4 py-2.5 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5" />
            {copy.room.leaderboardTitle}:
          </span>
          {[...room.players]
            .sort((a, b) => b.score - a.score)
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] shrink-0"
              >
                <AvatarSvg avatarId={p.avatarId} accentColor={p.accentColor} size={22} />
                <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] max-w-[90px] truncate">
                  {p.name}
                </span>
                <span className="font-mono-tabular text-xs font-bold text-[#C84B31]">{p.score}</span>
              </div>
            ))}
        </div>
      )}

      {/* Active Game Playfield */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-3xl p-5 sm:p-8 min-h-[440px] relative"
      >
        {children}

        {/* End of Round Result Overlay Modal */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#1C1917]/55 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-[#FAF8F4] dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-3xl p-7 text-center shadow-2xl space-y-5"
              >
                <OutcomeCelebration outcome={result.outcome} />

                <div className="space-y-1.5">
                  <h2 className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                    {result.outcome === 'win'
                      ? copy.results.winTitle
                      : result.outcome === 'draw'
                      ? copy.results.drawTitle
                      : copy.results.lossTitle}
                  </h2>
                  <p className="text-sm text-[#57534E] dark:text-[#B8AFA3]">
                    {result.summaryText ||
                      (result.outcome === 'win'
                        ? copy.results.winSub
                        : result.outcome === 'draw'
                        ? copy.results.drawSub
                        : copy.results.lossSub)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-4">
                  <div>
                    <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{copy.results.scoreLabel}</p>
                    <p className="font-mono-tabular text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                      {result.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{copy.results.pointsEarned}</p>
                    <p className="font-mono-tabular text-2xl font-bold text-[#2D6A4F] dark:text-[#52B788] mt-0.5">
                      +{result.pointsEarned}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {isHost && (
                    <button
                      type="button"
                      data-start="true"
                      onClick={() => {
                        soundEngine.playSelect();
                        onPlayAgain();
                      }}
                      className="flex-1 h-11 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold flex items-center justify-center gap-2 tactile-btn cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{copy.actions.playAgain}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onExit();
                    }}
                    className="flex-1 h-11 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] border border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB] text-sm font-semibold tactile-btn cursor-pointer"
                  >
                    {copy.actions.switchGame}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
