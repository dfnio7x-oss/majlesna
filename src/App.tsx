import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { AudioSettings, GameId, Language, PlayMode, ThemeMode } from './types/game';
import { t } from './i18n/translations';
import { soundEngine } from './utils/soundEngine';
import { useProfile } from './hooks/useProfile';
import { useMultiplayerSocket } from './hooks/useMultiplayerSocket';
import { useSocial } from './hooks/useSocial';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingView } from './components/OnboardingView';
import { SettingsView } from './components/SettingsView';
import { TopNav, type AppView } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { GamesLibraryView } from './components/GamesLibraryView';
import { FriendsGroupsView } from './components/FriendsGroupsView';
import { RoomHubView } from './components/RoomHubView';
import { ProfileView } from './components/ProfileView';
import { GameShell, type GameResultPayload } from './components/games/GameShell';
import { ActiveGameRenderer } from './components/games/GameRegistry';
import { ToastStack, type ToastNotice } from './components/EffectsOverlay';
import { GamePatternBackground } from './components/GamePatternBackground';
import { OfflineIndicator } from './components/PWAInstallButton';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('diwan_lang');
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'ar';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('diwan_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // ignore
    }
    return 'system';
  });

  const [audio, setAudio] = useState<AudioSettings>(() => soundEngine.getSettings());
  const preferences = useMemo(() => ({ lang, theme, audio }), [lang, theme, audio]);

  const {
    profile,
    firebaseUser,
    getBearerHeaders,
    updateProfile,
    registerWithPassword,
    loginWithPassword,
    claimUsername,
    changeUsername,
    setSecurityPin,
    linkGoogleAccount,
    signOutAccount,
    recordMatch,
  } = useProfile(preferences);

  const isAutostart =
    typeof window !== 'undefined' && window.location.search.includes('autostart=1');

  const [activeView, setActiveView] = useState<AppView>(() =>
    isAutostart ? 'playing' : 'home'
  );

  const [activeGameId, setActiveGameId] = useState<GameId>('xo');
  const [activeMode, setActiveMode] = useState<PlayMode>('solo');
  const [gameInstanceKey, setGameInstanceKey] = useState(1);
  const [gameResult, setGameResult] = useState<(GameResultPayload & { pointsEarned: number }) | null>(null);
  const [roomPreselectedGame, setRoomPreselectedGame] = useState<GameId>('xo');
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const pushToast = useCallback((kind: ToastNotice['kind'], text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, kind, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const copy = t(lang);

  const handlePlayerJoined = useCallback(
    (name: string) => {
      pushToast('join', `${name} ${copy.room.playerJoinedToast}`);
    },
    [pushToast, copy.room.playerJoinedToast]
  );

  const {
    wsStatus,
    room,
    roomError,
    secrets,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    selectGame,
    sendChat,
    startGame,
    playAgain,
    returnToLobby,
    sendGameAction,
    subscribeStrokes,
    subscribeSocialEvents,
  } = useMultiplayerSocket(profile, handlePlayerJoined);

  const handleIncomingRequestToast = useCallback(
    (fromUsername: string) => {
      pushToast('join', `${copy.social.newFriendRequestToast} @${fromUsername}`);
    },
    [pushToast, copy.social.newFriendRequestToast]
  );

  const handleGroupRoomInviteToast = useCallback(() => {
    pushToast('info', copy.social.roomInviteToast);
  }, [pushToast, copy.social.roomInviteToast]);

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    groups,
    livePresenceMap,
    searchUsers,
    sendFriendRequest,
    respondFriendRequest,
    removeFriend,
    createGroup,
    addGroupMembers,
    leaveGroup,
    sendGroupMessage,
    inviteGroupToRoom,
  } = useSocial({
    playerId: profile.id,
    enabled: profile.onboardingCompleted && !isAutostart,
    getAuthHeaders: getBearerHeaders,
    subscribeSocialEvents,
    onIncomingRequest: handleIncomingRequestToast,
    onRoomInvite: handleGroupRoomInviteToast,
  });

  // Sync HTML lang & dir
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('diwan_lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Sync instant Light / Dark / System theme class on <html>
  useEffect(() => {
    try {
      localStorage.setItem('diwan_theme', theme);
    } catch {
      // ignore
    }

    const applyTheme = () => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    applyTheme();
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    document.body.dataset.state = activeView === 'playing' ? 'playing' : 'title';
  }, [activeView]);

  // Auto-enter playing stage when room transitions to playing
  useEffect(() => {
    if (!room) return;
    if (room.status === 'playing') {
      setActiveGameId(room.selectedGame);
      setActiveMode('online');
      setGameResult(null);
      setGameInstanceKey((k) => k + 1);
      setActiveView('playing');
    } else if (room.status === 'lobby' && activeView === 'playing' && activeMode === 'online') {
      setGameResult(null);
      setActiveView('rooms');
    }
  }, [room?.status, room?.selectedGame, room?.roundNumber]);

  const handleUpdateAudio = (patch: Partial<AudioSettings>) => {
    const next = soundEngine.updateSettings(patch);
    setAudio(next);
  };

  const handlePlayGame = (gameId: GameId, mode: 'solo' | 'local') => {
    setActiveGameId(gameId);
    setActiveMode(mode);
    setGameResult(null);
    setGameInstanceKey((k) => k + 1);
    setActiveView('playing');
  };

  const handleHostInRoom = (gameId: GameId) => {
    setRoomPreselectedGame(gameId);
    if (room) {
      selectGame(gameId);
    }
    setActiveView('rooms');
  };

  const handleQuickJoin = (code: string) => {
    joinRoom(code);
    setActiveView('rooms');
  };

  const handleGameFinish = useCallback(
    (payload: GameResultPayload) => {
      if (gameResult) return;
      if (payload.outcome === 'win') soundEngine.playWin();
      else if (payload.outcome === 'loss') soundEngine.playLose();
      else soundEngine.playDraw();

      const earned = recordMatch(activeGameId, payload.outcome, payload.score, activeMode);
      setGameResult({ ...payload, pointsEarned: earned });
      pushToast('points', `+${earned} ${copy.room.pointsToast}`);

      if (activeMode === 'online') {
        sendGameAction({
          action: 'round_complete',
          roundScore: payload.score,
        });
      }
    },
    [gameResult, activeGameId, activeMode, recordMatch, pushToast, copy.room.pointsToast, sendGameAction]
  );

  const handleScoreProgress = useCallback(
    (score: number) => {
      if (activeMode === 'online') {
        sendGameAction({ action: 'score_update', roundScore: score });
      }
    },
    [activeMode, sendGameAction]
  );

  const handlePlayAgain = () => {
    setGameResult(null);
    if (activeMode === 'online' && room) {
      playAgain();
    } else {
      setGameInstanceKey((k) => k + 1);
    }
  };

  const handleExitGame = () => {
    setGameResult(null);
    if (activeMode === 'online' && room) {
      if (room.hostId === profile.id) {
        returnToLobby();
      }
      setActiveView('rooms');
    } else {
      setActiveView('games');
    }
  };

  const showOnboarding = !profile.onboardingCompleted && !isAutostart;

  return (
    <ErrorBoundary lang={lang}>
      {showOnboarding ? (
        <OnboardingView
          lang={lang}
          onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
          playerId={profile.id}
          firebaseUser={firebaseUser}
          onLinkGoogle={linkGoogleAccount}
          onSignOut={signOutAccount}
          onClaimUsername={claimUsername}
          onRegisterWithPassword={registerWithPassword}
          onLoginWithPassword={loginWithPassword}
        />
      ) : (
        <div className="relative min-h-screen bg-[#FAF8F4] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] flex flex-col transition-colors duration-200">
          <GamePatternBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <OfflineIndicator lang={lang} />
            <TopNav
              lang={lang}
              onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
              activeView={activeView}
              onNavigate={(view) => {
                setGameResult(null);
                setActiveView(view);
              }}
              audio={audio}
              onUpdateAudio={handleUpdateAudio}
            />

            <div className={activeView !== 'playing' ? 'flex-1 pb-24 sm:pb-28' : 'flex-1'}>
            <AnimatePresence mode="wait">
              {activeView === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <HomeView
                    lang={lang}
                    profile={profile}
                    onPlayGame={handlePlayGame}
                    onExploreGames={() => setActiveView('games')}
                    onGoRooms={() => setActiveView('rooms')}
                    onQuickJoin={handleQuickJoin}
                    onGoProfile={() => setActiveView('profile')}
                  />
                </motion.div>
              )}

              {activeView === 'games' && (
                <motion.div
                  key="games"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <GamesLibraryView
                    lang={lang}
                    profile={profile}
                    onPlayGame={handlePlayGame}
                    onHostInRoom={handleHostInRoom}
                  />
                </motion.div>
              )}

              {activeView === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <FriendsGroupsView
                    lang={lang}
                    profile={profile}
                    friends={friends}
                    incomingRequests={incomingRequests}
                    outgoingRequests={outgoingRequests}
                    groups={groups}
                    livePresenceMap={livePresenceMap}
                    activeRoom={room}
                    onSearchUsers={searchUsers}
                    onSendFriendRequest={sendFriendRequest}
                    onRespondRequest={respondFriendRequest}
                    onRemoveFriend={removeFriend}
                    onCreateGroup={createGroup}
                    onAddGroupMembers={addGroupMembers}
                    onLeaveGroup={leaveGroup}
                    onSendGroupMessage={sendGroupMessage}
                    onInviteGroupToRoom={inviteGroupToRoom}
                    onJoinRoomCode={handleQuickJoin}
                    onNotify={pushToast}
                  />
                </motion.div>
              )}

              {activeView === 'rooms' && (
                <motion.div
                  key="rooms"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <RoomHubView
                    lang={lang}
                    profile={profile}
                    wsStatus={wsStatus}
                    room={room}
                    roomError={roomError}
                    initialGame={roomPreselectedGame}
                    onCreateRoom={createRoom}
                    onJoinRoom={joinRoom}
                    onLeaveRoom={leaveRoom}
                    onToggleReady={toggleReady}
                    onSelectGame={selectGame}
                    onSendChat={sendChat}
                    onStartGame={startGame}
                  />
                </motion.div>
              )}

              {activeView === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <ProfileView
                    lang={lang}
                    profile={profile}
                    firebaseUser={firebaseUser}
                    onUpdateProfile={updateProfile}
                    onChangeUsername={changeUsername}
                    onSetPin={setSecurityPin}
                    onLinkGoogle={linkGoogleAccount}
                    onSignOut={signOutAccount}
                  />
                </motion.div>
              )}

              {activeView === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <SettingsView
                    lang={lang}
                    onChangeLang={setLang}
                    theme={theme}
                    onChangeTheme={setTheme}
                    audio={audio}
                    onUpdateAudio={handleUpdateAudio}
                  />
                </motion.div>
              )}

              {activeView === 'playing' && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <GameShell
                    gameId={activeGameId}
                    lang={lang}
                    mode={activeMode}
                    room={room}
                    playerId={profile.id}
                    result={gameResult}
                    onPlayAgain={handlePlayAgain}
                    onExit={handleExitGame}
                  >
                    <ActiveGameRenderer
                      key={`${activeGameId}-${gameInstanceKey}`}
                      gameId={activeGameId}
                      lang={lang}
                      mode={activeMode}
                      playerId={profile.id}
                      playerName={profile.username || profile.name}
                      room={room}
                      secrets={secrets}
                      onFinish={handleGameFinish}
                      onScoreProgress={handleScoreProgress}
                      onRoomAction={sendGameAction}
                      subscribeStrokes={subscribeStrokes}
                    />
                  </GameShell>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeView !== 'playing' && (
            <BottomNav
              lang={lang}
              activeView={activeView}
              onNavigate={(view) => {
                setGameResult(null);
                setActiveView(view);
              }}
              profile={profile}
              pendingRequestsCount={incomingRequests.length}
            />
          )}

          <ToastStack toasts={toasts} />
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
