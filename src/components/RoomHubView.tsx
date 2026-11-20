import React, { useMemo, useState } from 'react';
import { Check, Copy, Crown, LogOut, Play, Search, Send, Users, Wifi, WifiOff } from 'lucide-react';
import type { GameCategory, GameId, Language, PlayerProfile, RoomState } from '../types/game';
import { t } from '../i18n/translations';
import { GAMES_CATALOG, getGameById } from '../data/gamesCatalog';
import { AvatarSvg, GameIcon } from './icons/GameIcons';
import { GameStatusBadge } from './GameStatusBadge';
import { soundEngine } from '../utils/soundEngine';
import type { WsStatus } from '../hooks/useMultiplayerSocket';

interface RoomHubViewProps {
  lang: Language;
  profile: PlayerProfile;
  wsStatus: WsStatus;
  room: RoomState | null;
  roomError: string | null;
  initialGame?: GameId;
  onCreateRoom: (name: string, maxPlayers: number, gameId: GameId) => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onToggleReady: () => void;
  onSelectGame: (gameId: GameId) => void;
  onSendChat: (text: string) => void;
  onStartGame: () => void;
}

export const RoomHubView: React.FC<RoomHubViewProps> = ({
  lang,
  profile,
  wsStatus,
  room,
  roomError,
  initialGame = 'xo',
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onToggleReady,
  onSelectGame,
  onSendChat,
  onStartGame,
}) => {
  const copy = t(lang);
  const [roomName, setRoomName] = useState<string>(copy.room.roomNameDefault);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [selectedInitialGame, setSelectedInitialGame] = useState<GameId>(initialGame);
  const [joinCode, setJoinCode] = useState('');
  const [chatText, setChatText] = useState('');
  const [copied, setCopied] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<'all' | GameCategory>('all');
  const [pickerSearch, setPickerSearch] = useState('');

  const filteredRoomGames = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return GAMES_CATALOG.filter((g) => {
      if (pickerCategory !== 'all' && g.category !== pickerCategory) return false;
      if (!q) return true;
      return g.title.ar.toLowerCase().includes(q) || g.title.en.toLowerCase().includes(q);
    });
  }, [pickerCategory, pickerSearch]);

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.code).catch(() => {});
    setCopied(true);
    soundEngine.playClick();
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSelect();
    onCreateRoom(roomName.trim() || copy.room.roomNameDefault, maxPlayers, selectedInitialGame);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    soundEngine.playSelect();
    onJoinRoom(joinCode.trim().toUpperCase());
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    soundEngine.playClick();
    onSendChat(chatText);
    setChatText('');
  };

  if (room) {
    const isHost = room.hostId === profile.id;
    const me = room.players.find((p) => p.id === profile.id);
    const activeGameMeta = getGameById(room.selectedGame);
    const sortedLeaderboard = [...room.players].sort((a, b) => b.score - a.score);

    return (
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {(wsStatus === 'reconnecting' || wsStatus === 'error') && (
          <div className="p-3 rounded-xl bg-[#D97706]/10 border border-[#D97706]/30 text-sm text-[#92400E] dark:text-[#FBBF24] flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{copy.room.wsDisconnected}</span>
          </div>
        )}

        {/* Room Header */}
        <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {room.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2D6A4F] dark:text-[#52B788]">
                <Wifi className="w-3.5 h-3.5" />
                {copy.room.connected}
              </span>
            </div>
            <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] tabular-nums">
              {copy.room.playersCount}: {room.players.length} / {room.maxPlayers} · {activeGameMeta.title[lang]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
              <span className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{copy.room.roomCodeTag}:</span>
              <span className="font-mono-tabular text-base font-bold tracking-widest text-[#C84B31]" data-testid="room-code">
                {room.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                aria-label={copy.actions.copyCode}
                className="p-1.5 rounded-lg hover:bg-[#E5DEC9]/50 dark:hover:bg-[#342E28] text-[#57534E] dark:text-[#B8AFA3] cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#2D6A4F]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onLeaveRoom();
              }}
              className="h-10 px-4 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] hover:bg-[#FEE2E2] dark:hover:bg-[#3F1D1D] text-xs font-semibold text-[#991B1B] dark:text-[#FCA5A5] flex items-center gap-1.5 tactile-btn cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{copy.actions.leaveRoom}</span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Players List */}
            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                  {copy.room.playersCount} ({room.players.length}/{room.maxPlayers})
                </h2>
                {!isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onToggleReady();
                    }}
                    className={`h-9 px-4 rounded-xl text-xs font-semibold tactile-btn cursor-pointer ${
                      me?.isReady
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
                    }`}
                  >
                    {me?.isReady ? copy.actions.ready : copy.actions.notReady}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.players.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarSvg
                        avatarId={pl.avatarId}
                        customAvatarUrl={pl.customAvatarUrl}
                        accentColor={pl.accentColor}
                        size={40}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-[#1C1917] dark:text-[#F5F2EB] truncate">
                            {pl.name}
                          </span>
                          {pl.isHost && (
                            <Crown className="w-3.5 h-3.5 text-[#D97706] shrink-0" aria-label={copy.room.hostLabel} />
                          )}
                        </div>
                        <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
                          {pl.isConnected ? copy.room.connected : copy.room.disconnected} ·{' '}
                          <span className={pl.isReady || pl.isHost ? 'text-[#2D6A4F] dark:text-[#52B788] font-medium' : 'text-[#8C8478]'}>
                            {pl.isReady || pl.isHost ? copy.actions.ready : copy.actions.notReady}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] shrink-0">
                      {pl.score}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Select Game Inside Room (57 Games with Filter) */}
            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                  {copy.room.selectGameTitle}
                </h2>
                {isHost ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSelect();
                      onStartGame();
                    }}
                    className="h-10 px-5 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold flex items-center justify-center gap-2 tactile-btn cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{copy.room.startRound}</span>
                  </button>
                ) : (
                  <span className="text-xs font-medium text-[#57534E] dark:text-[#B8AFA3]">
                    {copy.room.waitingForHost}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8C8478] absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                  <input
                    type="search"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder={copy.games.searchPlaceholder}
                    className="w-full h-9 ps-9 pe-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                  />
                </div>
                <select
                  value={pickerCategory}
                  onChange={(e) => setPickerCategory(e.target.value as 'all' | GameCategory)}
                  className="h-9 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]"
                >
                  <option value="all">{copy.games.all}</option>
                  <option value="intelligence">{copy.games.intelligence}</option>
                  <option value="speed">{copy.games.speed}</option>
                  <option value="social">{copy.games.social}</option>
                  <option value="creative">{copy.games.creative}</option>
                  <option value="trivia">{copy.games.trivia}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto pe-1">
                {filteredRoomGames.map((g) => {
                  const selected = room.selectedGame === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={!isHost}
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectGame(g.id);
                      }}
                      className={`p-3 rounded-xl border text-start flex flex-col items-start gap-2 transition-colors ${
                        selected
                          ? 'bg-[#C84B31]/10 border-[#C84B31] text-[#1C1917] dark:text-[#F5F2EB]'
                          : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#57534E] dark:text-[#B8AFA3] hover:border-[#C84B31]/40'
                      } ${isHost ? 'cursor-pointer' : 'cursor-default opacity-85'}`}
                    >
                      <div className="flex items-start justify-between w-full gap-1">
                        <GameIcon gameId={g.id} accent={g.accentColor} className="w-8 h-8 shrink-0" />
                        <GameStatusBadge
                          playedCount={profile.gamesPlayed[g.id] ?? 0}
                          lang={lang}
                          compact
                        />
                      </div>
                      <span className="text-xs font-bold text-[#1C1917] dark:text-[#F5F2EB] line-clamp-1">
                        {g.title[lang]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Live Leaderboard + Chat */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {copy.room.leaderboardTitle}
              </h2>
              <div className="space-y-2">
                {sortedLeaderboard.map((pl, idx) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between py-2 border-b border-[#F1ECE2] dark:border-[#2E2822] last:border-0 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono-tabular text-xs font-bold text-[#8C8478] w-4">
                        #{idx + 1}
                      </span>
                      <AvatarSvg
                        avatarId={pl.avatarId}
                        customAvatarUrl={pl.customAvatarUrl}
                        accentColor={pl.accentColor}
                        size={28}
                      />
                      <span className="font-medium text-[#1C1917] dark:text-[#F5F2EB] truncate">
                        {pl.name}
                      </span>
                    </div>
                    <span className="font-mono-tabular font-bold text-[#C84B31]">{pl.score}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 flex flex-col h-80">
              <h2 className="font-display text-base font-bold text-[#1C1917] dark:text-[#F5F2EB] mb-3">
                {copy.room.chatTitle}
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 pe-1 text-xs">
                {room.chat.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.isSystem
                        ? 'text-center text-[#8C8478] py-1'
                        : 'bg-[#FAF8F4] dark:bg-[#25211D] rounded-lg px-3 py-2 border border-[#F1ECE2] dark:border-[#342E28]'
                    }
                  >
                    {!m.isSystem && (
                      <span className="font-bold text-[#C84B31] me-1.5">{m.playerName}:</span>
                    )}
                    <span className="text-[#1C1917] dark:text-[#F5F2EB]">{m.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder={copy.room.chatPlaceholder}
                  aria-label={copy.room.chatPlaceholder}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                />
                <button
                  type="submit"
                  aria-label={copy.actions.send}
                  className="h-9 w-9 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] flex items-center justify-center tactile-btn cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {copy.room.title}
        </h1>
        <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-1">{copy.room.subtitle}</p>
      </div>

      {roomError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3F1D1D] border border-[#FCA5A5] dark:border-[#7F1D1D] text-sm font-medium text-[#991B1B] dark:text-[#FCA5A5]"
        >
          {roomError} — {copy.room.joiningError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C84B31]/12 text-[#C84B31] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {copy.room.createCardTitle}
            </h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="room-name-input" className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {copy.room.roomNameLabel}
            </label>
            <input
              id="room-name-input"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={40}
              className="w-full h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="max-players-select" className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {copy.room.maxPlayersLabel}
            </label>
            <select
              id="max-players-select"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {copy.games.playersLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="initial-game-select" className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {copy.room.selectGameTitle}
            </label>
            <select
              id="initial-game-select"
              value={selectedInitialGame}
              onChange={(e) => setSelectedInitialGame(e.target.value as GameId)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
            >
              {GAMES_CATALOG.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title[lang]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold tactile-btn cursor-pointer"
          >
            {copy.actions.createRoom}
          </button>
        </form>

        <form
          onSubmit={handleJoinSubmit}
          className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-6 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B4C7E]/12 text-[#2B4C7E] dark:text-[#60A5FA] flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {copy.room.joinCardTitle}
              </h2>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="join-code-input" className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
                {copy.room.codeLabel}
              </label>
              <input
                id="join-code-input"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="D4K8M2"
                maxLength={8}
                className="w-full h-12 px-4 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-lg font-mono-tabular tracking-widest text-center text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#2B4C7E]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] hover:bg-[#2E2926] dark:hover:bg-[#E5DEC9] text-white dark:text-[#1C1917] text-sm font-semibold tactile-btn cursor-pointer"
          >
            {copy.actions.joinRoom}
          </button>
        </form>
      </div>
    </main>
  );
};
