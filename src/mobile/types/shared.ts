// 共有型定義 - サーバーとクライアントで共通使用

// ルームの状態
export type RoomStatus = 'waiting' | 'playing' | 'finished';

// ルーム情報
export interface Room {
  id: string;
  name: string;
  status: RoomStatus;
  drawnNumbers: number[];
  currentNumber: number | null;
  createdAt: Date;
}

// プレイヤー情報
export interface Player {
  id: string;
  name: string;
  roomId: string;
  isHost: boolean;
  createdAt: Date;
  bingoRank?: number; // ビンゴ達成順位
}

// ビンゴカード（5x5）
export interface BingoCard {
  id: string;
  playerId: string;
  numbers: number[][]; // 5x5 配列
  marked: boolean[][]; // 5x5 配列
  hasBingo: boolean;
  bingoRank?: number; // ビンゴ達成順位
}

// ルーム作成リクエスト
export interface CreateRoomRequest {
  name: string;
  hostName: string;
}

// ルーム作成レスポンス
export interface CreateRoomResponse {
  room: Room;
  hostPin: string;
  player: Player;
  card: BingoCard;
}

// ルーム参加リクエスト
export interface JoinRoomRequest {
  playerName: string;
}

// ルーム参加レスポンス
export interface JoinRoomResponse {
  room: Room;
  player: Player;
  card: BingoCard;
  players: Player[];
}

// Socket.io イベントペイロード

// クライアント → サーバー
export interface JoinRoomPayload {
  roomId: string;
  playerId: string;
}

export interface DrawNumberPayload {
  roomId: string;
  hostPin: string;
}

export interface MarkNumberPayload {
  roomId: string;
  playerId: string;
  number: number;
}

export interface DeclareBingoPayload {
  roomId: string;
  playerId: string;
}

// サーバー → クライアント
export interface RoomStatePayload {
  room: Room;
  players: Player[];
}

export interface NumberDrawnPayload {
  number: number;
  drawnNumbers: number[];
}

export interface PlayerJoinedPayload {
  player: Player;
}

export interface PlayerMarkedPayload {
  playerId: string;
  number: number;
}

export interface BingoWinnerPayload {
  player: Player;
  card: BingoCard;
  rank: number; // ビンゴ達成順位
}

// プレイヤー更新ペイロード（ランク付き）
export interface PlayersUpdatedPayload {
  players: Player[];
}

// Socket.io イベント名
export const SOCKET_EVENTS = {
  // クライアント → サーバー
  JOIN_ROOM: 'join-room',
  DRAW_NUMBER: 'draw-number',
  MARK_NUMBER: 'mark-number',
  DECLARE_BINGO: 'declare-bingo',

  // サーバー → クライアント
  ROOM_STATE: 'room-state',
  NUMBER_DRAWN: 'number-drawn',
  PLAYER_JOINED: 'player-joined',
  PLAYER_MARKED: 'player-marked',
  BINGO_WINNER: 'bingo-winner',
  PLAYERS_UPDATED: 'players-updated',
  ERROR: 'error',
} as const;

// ビンゴの設定
export const BINGO_CONFIG = {
  CARD_SIZE: 5,
  MIN_NUMBER: 1,
  MAX_NUMBER: 75,
  FREE_SPACE_INDEX: 2, // 中央のフリースペース位置
} as const;
