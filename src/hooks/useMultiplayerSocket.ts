import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DrawStroke,
  GameId,
  GroupMessageItem,
  GroupRoomInvitePayload,
  PlayerProfile,
  RoomState,
} from '../types/game';
import { soundEngine } from '../utils/soundEngine';

export type WsStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export type SocialWsEvent =
  | { type: 'social_update'; event: string; fromUsername?: string; targetPlayerId?: string; groupId?: string }
  | { type: 'group_message'; groupId: string; groupName?: string; message: GroupMessageItem }
  | { type: 'group_room_invite'; groupId: string; groupName?: string; invite: GroupRoomInvitePayload }
  | { type: 'presence_changed'; playerId: string; online: boolean; activeRoomCode: string | null };

export interface PrivateSecrets {
  drawWordAr?: string;
  drawWordEn?: string;
  mafiaRole?: 'mafia' | 'detective' | 'doctor' | 'citizen';
  mafiaInspections: Record<string, boolean>;
  isImpostor?: boolean;
  impostorSeed?: number;
}

export function useMultiplayerSocket(
  profile: PlayerProfile,
  onPlayerJoined?: (name: string) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const activeRoomCodeRef = useRef<string | null>(null);
  const strokeListenersRef = useRef<Set<(stroke: DrawStroke) => void>>(new Set());
  const socialListenersRef = useRef<Set<(ev: SocialWsEvent) => void>>(new Set());

  const [wsStatus, setWsStatus] = useState<WsStatus>('idle');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<PrivateSecrets>({ mafiaInspections: {} });

  const profileRef = useRef(profile);
  profileRef.current = profile;

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws`;
    setWsStatus((prev) => (prev === 'connected' ? 'reconnecting' : 'connecting'));

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      setRoomError(null);
      const p = profileRef.current;
      if (p.id) {
        ws.send(JSON.stringify({ type: 'presence_hello', playerId: p.id }));
      }
      // Re-join room automatically on reconnect
      if (activeRoomCodeRef.current) {
        ws.send(
          JSON.stringify({
            type: 'join_room',
            code: activeRoomCodeRef.current,
            player: {
              id: p.id,
              name: p.username || p.name,
              username: p.username,
              avatarId: p.avatarId,
              customAvatarUrl: p.customAvatarUrl,
              accentColor: p.accentColor,
            },
          })
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === 'room_joined') {
          setRoom(msg.room);
          activeRoomCodeRef.current = msg.room.code;
          setRoomError(null);
        } else if (msg.type === 'room_state') {
          setRoom(msg.room);
        } else if (msg.type === 'player_joined') {
          setRoom(msg.room);
          soundEngine.playPlayerJoin();
          if (msg.playerName && onPlayerJoined) {
            onPlayerJoined(msg.playerName);
          }
        } else if (msg.type === 'room_error') {
          setRoomError(msg.message || 'Room error');
          soundEngine.playError();
        } else if (
          msg.type === 'social_update' ||
          msg.type === 'group_message' ||
          msg.type === 'group_room_invite' ||
          msg.type === 'presence_changed'
        ) {
          socialListenersRef.current.forEach((cb) => cb(msg as SocialWsEvent));
        } else if (msg.type === 'private_data') {
          if (msg.game === 'draw-guess' || msg.game === 'sketch-relay') {
            setSecrets((prev) => ({
              ...prev,
              drawWordAr: msg.drawWordAr,
              drawWordEn: msg.drawWordEn,
            }));
          } else if (msg.game === 'mafia') {
            setSecrets((prev) => ({
              ...prev,
              mafiaRole: msg.role,
              mafiaInspections: {},
            }));
          } else if (msg.game === 'mafia_inspect') {
            setSecrets((prev) => ({
              ...prev,
              mafiaInspections: {
                ...prev.mafiaInspections,
                [msg.targetId]: Boolean(msg.isMafia),
              },
            }));
          } else if (msg.game === 'secret-agent' || msg.game === 'whos-liar') {
            setSecrets((prev) => ({
              ...prev,
              isImpostor: Boolean(msg.isImpostor),
              impostorSeed: typeof msg.seed === 'number' ? msg.seed : undefined,
            }));
          }
        } else if (msg.type === 'draw_stroke') {
          strokeListenersRef.current.forEach((cb) => cb(msg.stroke));
        }
      } catch {
        // Ignore malformed packets
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (activeRoomCodeRef.current || profileRef.current.onboardingCompleted) {
        setWsStatus('reconnecting');
        reconnectTimerRef.current = window.setTimeout(connect, 2200);
      } else {
        setWsStatus('idle');
      }
    };

    ws.onerror = () => {
      setWsStatus('error');
    };
  }, [onPlayerJoined]);

  // Keep presence socket alive once user completes onboarding
  useEffect(() => {
    if (!profile.onboardingCompleted || !profile.id) return;
    connect();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'presence_hello', playerId: profile.id }));
    }
  }, [profile.onboardingCompleted, profile.id, connect]);

  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendPacket = useCallback(
    (payload: Record<string, unknown>) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
        window.setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
          }
        }, 350);
        return;
      }
      wsRef.current.send(JSON.stringify(payload));
    },
    [connect]
  );

  const createRoom = useCallback(
    (roomName: string, maxPlayers: number, selectedGame: GameId = 'xo') => {
      setRoomError(null);
      connect();
      sendPacket({
        type: 'create_room',
        roomName,
        maxPlayers,
        selectedGame,
        player: {
          id: profile.id,
          name: profile.username || profile.name,
          avatarId: profile.avatarId,
          customAvatarUrl: profile.customAvatarUrl,
          accentColor: profile.accentColor,
        },
      });
    },
    [connect, sendPacket, profile]
  );

  const joinRoom = useCallback(
    (code: string) => {
      setRoomError(null);
      connect();
      sendPacket({
        type: 'join_room',
        code: code.trim().toUpperCase(),
        player: {
          id: profile.id,
          name: profile.username || profile.name,
          avatarId: profile.avatarId,
          customAvatarUrl: profile.customAvatarUrl,
          accentColor: profile.accentColor,
        },
      });
    },
    [connect, sendPacket, profile]
  );

  const leaveRoom = useCallback(() => {
    if (room) {
      sendPacket({ type: 'leave_room', code: room.code, playerId: profile.id });
    }
    activeRoomCodeRef.current = null;
    setRoom(null);
    setSecrets({ mafiaInspections: {} });
  }, [room, sendPacket, profile.id]);

  const toggleReady = useCallback(() => {
    if (!room) return;
    sendPacket({ type: 'toggle_ready', code: room.code, playerId: profile.id });
  }, [room, sendPacket, profile.id]);

  const selectGame = useCallback(
    (gameId: GameId) => {
      if (!room) return;
      sendPacket({ type: 'select_game', code: room.code, playerId: profile.id, gameId });
    },
    [room, sendPacket, profile.id]
  );

  const sendChat = useCallback(
    (text: string) => {
      if (!room || !text.trim()) return;
      sendPacket({ type: 'send_chat', code: room.code, playerId: profile.id, text });
    },
    [room, sendPacket, profile.id]
  );

  const startGame = useCallback(() => {
    if (!room) return;
    setSecrets({ mafiaInspections: {} });
    sendPacket({ type: 'start_game', code: room.code, playerId: profile.id });
  }, [room, sendPacket, profile.id]);

  const playAgain = useCallback(() => {
    if (!room) return;
    setSecrets({ mafiaInspections: {} });
    sendPacket({ type: 'play_again', code: room.code, playerId: profile.id });
  }, [room, sendPacket, profile.id]);

  const returnToLobby = useCallback(() => {
    if (!room) return;
    sendPacket({ type: 'return_to_lobby', code: room.code, playerId: profile.id });
  }, [room, sendPacket, profile.id]);

  const sendGameAction = useCallback(
    (payload: Record<string, unknown>) => {
      if (!room) return;
      sendPacket({
        type: 'game_action',
        code: room.code,
        playerId: profile.id,
        payload,
      });
    },
    [room, sendPacket, profile.id]
  );

  const subscribeStrokes = useCallback((cb: (stroke: DrawStroke) => void) => {
    strokeListenersRef.current.add(cb);
    return () => {
      strokeListenersRef.current.delete(cb);
    };
  }, []);

  const subscribeSocialEvents = useCallback((cb: (ev: SocialWsEvent) => void) => {
    socialListenersRef.current.add(cb);
    return () => {
      socialListenersRef.current.delete(cb);
    };
  }, []);

  return {
    wsStatus,
    room,
    roomError,
    secrets,
    connect,
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
    clearError: () => setRoomError(null),
  };
}

