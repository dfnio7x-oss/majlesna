import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Play, Plus, Users, Compass, Trophy } from 'lucide-react';
import type { GameId, Language, PlayerProfile } from '../types/game';
import { t } from '../i18n/translations';
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { AvatarSvg, GameIcon } from './icons/GameIcons';
import { GameStatusBadge } from './GameStatusBadge';
import { soundEngine } from '../utils/soundEngine';

interface HomeViewProps {
  lang: Language;
  profile: PlayerProfile;
  onPlayGame: (gameId: GameId, mode: 'solo' | 'local') => void;
  onExploreGames: () => void;
  onGoRooms: () => void;
  onQuickJoin: (code: string) => void;
  onGoProfile: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  profile,
  onPlayGame,
  onExploreGames,
  onGoRooms,
  onQuickJoin,
  onGoProfile,
}) => {
  const copy = t(lang);
  const [joinCode, setJoinCode] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const popularGames = GAMES_CATALOG.filter((g) => g.popular).slice(0, 6);
  const totalMatches = profile.wins + profile.losses + profile.draws;
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    soundEngine.playSelect();
    onQuickJoin(joinCode.trim().toUpperCase());
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-3xl p-6 sm:p-9">
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onGoProfile();
              }}
              className="inline-flex items-center gap-3 text-start group cursor-pointer"
            >
              <AvatarSvg
                avatarId={profile.avatarId}
                customAvatarUrl={profile.customAvatarUrl}
                accentColor={profile.accentColor}
                size={42}
              />
              <div>
                <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] font-medium">
                  {copy.home.welcomePrefix}
                </p>
                <p dir="ltr" className="text-base font-bold text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#C84B31] transition-colors">
                  @{profile.username || profile.name}
                </p>
              </div>
            </button>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.16] text-[#1C1917] dark:text-[#F5F2EB]">
              {copy.home.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-[#57534E] dark:text-[#B8AFA3] leading-relaxed max-w-xl">
              {copy.home.heroSubtitle}
            </p>
          </div>

          <div className="pt-7 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  soundEngine.playSelect();
                  onPlayGame('xo', 'solo');
                }}
                className="h-11 px-6 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold flex items-center gap-2 tactile-btn cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{copy.actions.playNow}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onGoRooms();
                }}
                className="h-11 px-5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] hover:bg-[#2E2926] dark:hover:bg-[#E5DEC9] text-white dark:text-[#1C1917] text-sm font-semibold flex items-center gap-2 tactile-btn cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{copy.actions.createRoom}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onExploreGames();
                }}
                className="h-11 px-5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] text-sm font-semibold flex items-center gap-2 tactile-btn cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>{copy.actions.exploreGames}</span>
              </button>
            </div>

            {/* Inline Quick Join Room by Code */}
            <form onSubmit={handleJoinSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={copy.home.quickJoinPlaceholder}
                maxLength={8}
                aria-label={copy.home.quickJoinTitle}
                className="flex-1 h-10 px-3.5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-sm font-mono-tabular text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#8C8478] focus:outline-none focus:border-[#C84B31]"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center gap-1.5 tactile-btn cursor-pointer whitespace-nowrap"
              >
                <Users className="w-4 h-4 text-[#2B4C7E] dark:text-[#60A5FA]" />
                <span>{copy.actions.joinRoom}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Hero Tabletop Visual */}
        <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-[#E5DEC9] dark:border-[#342E28] bg-[#F1ECE2] dark:bg-[#1E1B18] min-h-[280px] relative flex items-center justify-center">
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/hub_tabletop_hero_1794980373646.jpg"
              alt={lang === 'ar' ? 'طاولة ألعاب مجلسنا' : 'Majlisna Tabletop Parlor'}
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-8 text-center space-y-3">
              <GameIcon gameId="memory" className="w-16 h-16 mx-auto" />
              <p className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {copy.brand}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Player Stats Strip (Clean 4-column tabular numerals) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#57534E] dark:text-[#B8AFA3]">{copy.home.statsWins}</p>
          <p className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#2D6A4F] dark:text-[#52B788]">
            {profile.wins}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#57534E] dark:text-[#B8AFA3]">{copy.home.statsPoints}</p>
          <p className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#C84B31]">
            {profile.totalPoints}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#57534E] dark:text-[#B8AFA3]">{copy.home.statsPlayed}</p>
          <p className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
            {totalMatches}
          </p>
        </div>
        <div className="space-y-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#57534E] dark:text-[#B8AFA3]">{copy.home.statsBadges}</p>
            <p className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#D97706] dark:text-[#FBBF24]">
              {profile.unlockedAchievements.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onGoProfile();
            }}
            aria-label={copy.nav.profile}
            className="w-10 h-10 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] flex items-center justify-center text-[#57534E] cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />
          </button>
        </div>
      </section>

      {/* Popular Games Showcase (Balanced 3x2 grid) */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {copy.home.popularTitle}
            </h2>
            <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-1">{copy.home.popularSub}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onExploreGames();
            }}
            className="text-sm font-semibold text-[#C84B31] hover:text-[#B03E26] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>{copy.home.viewAllGames}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularGames.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#C84B31]/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <GameIcon gameId={game.id} accent={game.accentColor} className="w-12 h-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <h3 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                      {game.title[lang]}
                    </h3>
                    <GameStatusBadge
                      playedCount={profile.gamesPlayed[game.id] ?? 0}
                      lang={lang}
                      compact
                    />
                  </div>
                  <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] mt-0.5 tabular-nums">
                    {game.minPlayers}–{game.maxPlayers} {copy.games.playersLabel} · {game.durationMinutes} {copy.games.minLabel}
                  </p>
                  <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-2 line-clamp-2 leading-relaxed">
                    {game.description[lang]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#F1ECE2] dark:border-[#2E2822]">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelect();
                    onPlayGame(game.id, 'solo');
                  }}
                  className="flex-1 h-9 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#C84B31] dark:hover:bg-[#C84B31] text-[#1C1917] dark:text-[#F5F2EB] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] hover:border-[#C84B31] text-xs font-semibold tactile-btn cursor-pointer whitespace-nowrap"
                >
                  {copy.actions.playNow}
                </button>
                {game.supportsLocal && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSelect();
                      onPlayGame(game.id, 'local');
                    }}
                    className="h-9 px-3 rounded-lg bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] tactile-btn cursor-pointer whitespace-nowrap"
                  >
                    {copy.actions.localMode}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
