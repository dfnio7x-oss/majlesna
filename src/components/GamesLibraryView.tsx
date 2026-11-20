import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import type { GameCategory, GameId, Language, PlayerProfile } from '../types/game';
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { t } from '../i18n/translations';
import { GameIcon } from './icons/GameIcons';
import { GameStatusBadge } from './GameStatusBadge';
import { soundEngine } from '../utils/soundEngine';

interface GamesLibraryViewProps {
  lang: Language;
  profile: PlayerProfile;
  onPlayGame: (gameId: GameId, mode: 'solo' | 'local') => void;
  onHostInRoom: (gameId: GameId) => void;
}

export const GamesLibraryView: React.FC<GamesLibraryViewProps> = ({
  lang,
  profile,
  onPlayGame,
  onHostInRoom,
}) => {
  const copy = t(lang);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | GameCategory>('all');
  const [playStatus, setPlayStatus] = useState<'all' | 'played' | 'unplayed'>('all');

  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      intelligence: 0,
      speed: 0,
      social: 0,
      creative: 0,
      trivia: 0,
    };
    GAMES_CATALOG.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, []);

  const playedTotalCount = useMemo(
    () => GAMES_CATALOG.filter((g) => (profile.gamesPlayed[g.id] ?? 0) > 0).length,
    [profile.gamesPlayed]
  );

  const categories: { id: 'all' | GameCategory; label: string; count: number }[] = [
    { id: 'all', label: copy.games.all, count: GAMES_CATALOG.length },
    { id: 'intelligence', label: copy.games.intelligence, count: categoryCounts.intelligence },
    { id: 'speed', label: copy.games.speed, count: categoryCounts.speed },
    { id: 'social', label: copy.games.social, count: categoryCounts.social },
    { id: 'creative', label: copy.games.creative, count: categoryCounts.creative },
    { id: 'trivia', label: copy.games.trivia, count: categoryCounts.trivia },
  ];

  const statusFilters: { id: 'all' | 'played' | 'unplayed'; label: string; count: number }[] = [
    { id: 'all', label: copy.games.filterAll, count: GAMES_CATALOG.length },
    { id: 'played', label: copy.games.filterPlayed, count: playedTotalCount },
    { id: 'unplayed', label: copy.games.filterUnplayed, count: GAMES_CATALOG.length - playedTotalCount },
  ];

  const categoryLabel = (cat: GameCategory): string => copy.games[cat];

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES_CATALOG.filter((g) => {
      if (category !== 'all' && g.category !== category) return false;
      const playedCount = profile.gamesPlayed[g.id] ?? 0;
      if (playStatus === 'played' && playedCount === 0) return false;
      if (playStatus === 'unplayed' && playedCount > 0) return false;
      if (!q) return true;
      return (
        g.title.ar.toLowerCase().includes(q) ||
        g.title.en.toLowerCase().includes(q) ||
        g.description.ar.toLowerCase().includes(q) ||
        g.description.en.toLowerCase().includes(q)
      );
    });
  }, [query, category, playStatus, profile.gamesPlayed]);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
            {copy.games.title}
          </h1>
          <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-1">{copy.games.subtitle}</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8C8478] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.games.searchPlaceholder}
            aria-label={copy.games.searchPlaceholder}
            className="w-full h-10 ps-10 pe-3.5 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#8C8478] focus:outline-none focus:border-[#C84B31]"
          />
        </div>
      </div>

      {/* Category & Played Status Filter Bars */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F1ECE2] dark:bg-[#1E1B18] border border-transparent dark:border-[#342E28] rounded-xl overflow-x-auto">
          {categories.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setCategory(cat.id);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-white dark:bg-[#2C2722] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                    : 'text-[#57534E] dark:text-[#B8AFA3] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
                }`}
              >
                <span>{cat.label}</span>
                <span className="font-mono-tabular text-[11px] opacity-65">({cat.count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#F1ECE2] dark:bg-[#1E1B18] border border-transparent dark:border-[#342E28] rounded-xl shrink-0 self-start lg:self-auto">
          {statusFilters.map((st) => {
            const active = playStatus === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPlayStatus(st.id);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-white dark:bg-[#2C2722] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                    : 'text-[#57534E] dark:text-[#B8AFA3] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
                }`}
              >
                <span>{st.label}</span>
                <span className="font-mono-tabular text-[11px] opacity-65">({st.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-12 text-center text-[#57534E] dark:text-[#B8AFA3] text-sm">
          {copy.games.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <article
              key={game.id}
              className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#C84B31]/55 transition-colors"
            >
              <div className="flex items-start gap-4">
                <GameIcon gameId={game.id} accent={game.accentColor} className="w-12 h-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                      {game.title[lang]}
                    </h2>
                    <GameStatusBadge playedCount={profile.gamesPlayed[game.id] ?? 0} lang={lang} />
                  </div>
                  <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] mt-0.5 tabular-nums">
                    {categoryLabel(game.category)} · {game.minPlayers}–{game.maxPlayers} {copy.games.playersLabel} ·{' '}
                    {game.durationMinutes} {copy.games.minLabel}
                    {game.isNew ? ` · ${copy.games.newTag}` : ''}
                  </p>
                  <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-2 leading-relaxed">
                    {game.description[lang]}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F1ECE2] dark:border-[#2E2822]">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelect();
                    onPlayGame(game.id, 'solo');
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-semibold tactile-btn cursor-pointer whitespace-nowrap"
                >
                  {copy.actions.soloMode}
                </button>
                {game.supportsLocal && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSelect();
                      onPlayGame(game.id, 'local');
                    }}
                    className="h-9 px-3 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer whitespace-nowrap"
                  >
                    {copy.actions.localMode}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelect();
                    onHostInRoom(game.id);
                  }}
                  aria-label={`${copy.actions.onlineMode}: ${game.title[lang]}`}
                  title={copy.actions.onlineMode}
                  className="h-9 w-9 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#2B4C7E] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-[#2B4C7E] dark:text-[#60A5FA] flex items-center justify-center tactile-btn cursor-pointer shrink-0"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};
