import React from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';
import type { Language } from '../types/game';
import { t } from '../i18n/translations';

interface GameStatusBadgeProps {
  playedCount: number;
  lang: Language;
  compact?: boolean;
}

export const GameStatusBadge: React.FC<GameStatusBadgeProps> = ({
  playedCount,
  lang,
  compact = false,
}) => {
  const copy = t(lang);
  const hasPlayed = playedCount > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-semibold whitespace-nowrap shrink-0 ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      } ${
        hasPlayed
          ? 'bg-[#2D6A4F]/10 border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] dark:border-[#52B788]/30'
          : 'bg-[#C84B31]/10 border-[#C84B31]/30 text-[#C84B31] dark:text-[#F87171] dark:border-[#F87171]/30'
      }`}
    >
      {hasPlayed ? (
        <CheckCircle2 className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      ) : (
        <CircleDashed className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      )}
      <span>{hasPlayed ? copy.games.playedBadge : copy.games.notPlayedBadge}</span>
    </span>
  );
};
