export type Language = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export type GameId =
  // Phase 1 Original 17
  | 'xo'
  | 'rps'
  | 'number-guess'
  | 'millionaire'
  | 'trivia'
  | 'guess-character'
  | 'guess-word'
  | 'memory'
  | 'speed-challenge'
  | 'qa-duel'
  | 'math-challenge'
  | 'word-order'
  | 'true-false'
  | 'draw-guess'
  | 'letter-challenge'
  | 'mafia'
  | 'riddles'
  // Phase 2: Intelligence & Thinking (1-10)
  | 'sudoku-party'
  | 'solve-puzzle'
  | 'spot-differences'
  | 'complete-pattern'
  | 'number-ordering'
  | 'crack-code'
  | 'strongest-memory'
  | 'crossword-challenge'
  | 'hidden-word'
  | 'image-puzzle'
  // Phase 2: Challenge & Speed (11-20)
  | 'fastest-answer'
  | 'perfect-timing'
  | 'reaction-duel'
  | 'typing-race'
  | 'focus-challenge'
  | 'fast-counting'
  | 'odd-one-out'
  | 'mental-math'
  | 'letter-arrange'
  | 'rapid-questions'
  // Phase 2: Party & Social (21-30)
  | 'secret-agent'
  | 'whos-liar'
  | 'forbidden-word'
  | 'who-am-i'
  | 'two-truths-lie'
  | 'guess-author'
  | 'weird-translator'
  | 'finish-story'
  | 'would-you-rather'
  | 'secret-vote'
  // Phase 2: Creative & Entertainment (31-40)
  | 'sketch-relay'
  | 'guess-song'
  | 'movie-emoji'
  | 'emoji-challenge'
  | 'random-story'
  | 'acting-challenge'
  | 'shadow-guess'
  | 'sound-imitation'
  | 'jigsaw-assembly'
  | 'word-chain';

export type GameCategory = 'intelligence' | 'speed' | 'social' | 'creative' | 'trivia';

export type PlayMode = 'solo' | 'local' | 'online';

export type MatchOutcome = 'win' | 'loss' | 'draw';

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface GameMeta {
  id: GameId;
  category: GameCategory;
  title: LocalizedText;
  description: LocalizedText;
  rules: {
    ar: string[];
    en: string[];
  };
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: number;
  popular?: boolean;
  isNew?: boolean;
  accentColor: string;
  supportsSolo: boolean;
  supportsLocal: boolean;
  supportsOnline: boolean;
}

export interface MatchRecord {
  id: string;
  gameId: GameId;
  mode: PlayMode;
  outcome: MatchOutcome;
  pointsEarned: number;
  opponentLabel?: string;
  playedAt: string;
}

export interface AchievementDef {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  iconKey: string;
  target: number;
}

export interface AudioSettings {
  muted: boolean;
  sfxVolume: number; // 0 to 1
  musicEnabled: boolean;
  musicVolume: number; // 0 to 1
}

export interface UserPreferences {
  lang: Language;
  theme: ThemeMode;
  audio: AudioSettings;
}

export interface PlayerProfile {
  id: string;
  uid?: string;
  name: string;
  username?: string;
  usernameLower?: string;
  avatarId: number;
  customAvatarUrl?: string;
  accentColor: string;
  authMethod?: 'google' | 'password' | 'local';
  createdAt: string;
  usernameUpdatedAt?: string | null;
  nextUsernameChangeAt?: string | null;
  onboardingCompleted: boolean;
  isFirebaseLinked?: boolean;
  hasPin?: boolean;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
  gamesPlayed: Partial<Record<GameId, number>>;
  unlockedAchievements: string[];
  matchHistory: MatchRecord[];
  preferences?: UserPreferences;
}

export interface RoomPlayer {
  id: string;
  name: string;
  username?: string;
  avatarId: number;
  customAvatarUrl?: string;
  accentColor: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  roundScore: number;
}

export interface PublicPlayerSummary {
  id: string;
  username: string;
  avatarId: number;
  customAvatarUrl?: string;
  accentColor: string;
  online?: boolean;
  activeRoomCode?: string | null;
}

export interface FriendRequestItem {
  id: string;
  fromPlayerId: string;
  fromUser?: PublicPlayerSummary;
  toPlayerId: string;
  toUser?: PublicPlayerSummary;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface GroupRoomInvitePayload {
  roomCode: string;
  roomName: string;
  gameId: GameId;
  hostName: string;
}

export interface GroupMessageItem {
  id: string;
  groupId: string;
  senderId: string;
  senderUsername: string;
  senderAvatarId: number;
  senderCustomAvatarUrl?: string;
  senderAccentColor: string;
  type: 'text' | 'room_invite';
  text: string;
  roomInvite?: GroupRoomInvitePayload;
  createdAt: string;
}

export interface SocialGroup {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  members: PublicPlayerSummary[];
  accentColor: string;
  createdAt: string;
  messages: GroupMessageItem[];
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  isEraser?: boolean;
}

export type RoomStatus = 'lobby' | 'playing' | 'results';

export interface RoomState {
  code: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  status: RoomStatus;
  selectedGame: GameId;
  players: RoomPlayer[];
  chat: ChatMessage[];
  roundNumber: number;
  gameState: Record<string, unknown>;
}
