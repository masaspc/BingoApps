import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import {
  SOCKET_EVENTS,
  type JoinRoomPayload,
  type DrawNumberPayload,
  type MarkNumberPayload,
  type DeclareBingoPayload,
  type RoomStatePayload,
  type NumberDrawnPayload,
  type PlayerJoinedPayload,
  type PlayerMarkedPayload,
  type BingoWinnerPayload,
  type PlayersUpdatedPayload,
} from '../types';

// API URL を取得（Web は現在のオリジン、それ以外は設定値）
const getApiUrl = (): string => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  // モバイルアプリ用: 本番環境のURL
  return 'https://t-bingo.com';
};

const API_URL = getApiUrl();

type SocketEventHandlers = {
  onRoomState?: (payload: RoomStatePayload) => void;
  onNumberDrawn?: (payload: NumberDrawnPayload) => void;
  onPlayerJoined?: (payload: PlayerJoinedPayload) => void;
  onPlayerMarked?: (payload: PlayerMarkedPayload) => void;
  onBingoWinner?: (payload: BingoWinnerPayload) => void;
  onPlayersUpdated?: (payload: PlayersUpdatedPayload) => void;
  onError?: (error: { message: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

class SocketService {
  private socket: Socket | null = null;
  private handlers: SocketEventHandlers = {};

  /**
   * サーバーに接続
   */
  connect(url?: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(url || API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupListeners();
  }

  /**
   * イベントリスナーを設定
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.handlers.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.handlers.onDisconnect?.();
    });

    this.socket.on(SOCKET_EVENTS.ROOM_STATE, (payload: RoomStatePayload) => {
      this.handlers.onRoomState?.(payload);
    });

    this.socket.on(SOCKET_EVENTS.NUMBER_DRAWN, (payload: NumberDrawnPayload) => {
      this.handlers.onNumberDrawn?.(payload);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, (payload: PlayerJoinedPayload) => {
      this.handlers.onPlayerJoined?.(payload);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_MARKED, (payload: PlayerMarkedPayload) => {
      this.handlers.onPlayerMarked?.(payload);
    });

    this.socket.on(SOCKET_EVENTS.BINGO_WINNER, (payload: BingoWinnerPayload) => {
      this.handlers.onBingoWinner?.(payload);
    });

    this.socket.on(SOCKET_EVENTS.PLAYERS_UPDATED, (payload: PlayersUpdatedPayload) => {
      this.handlers.onPlayersUpdated?.(payload);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error: { message: string }) => {
      console.error('Socket error:', error);
      this.handlers.onError?.(error);
    });
  }

  /**
   * イベントハンドラを設定
   */
  setHandlers(handlers: SocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * ルームに参加
   */
  joinRoom(roomId: string, playerId: string): void {
    this.socket?.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId,
      playerId,
    } as JoinRoomPayload);
  }

  /**
   * 番号を抽選（管理者のみ）
   */
  drawNumber(roomId: string, hostPin: string): void {
    this.socket?.emit(SOCKET_EVENTS.DRAW_NUMBER, {
      roomId,
      hostPin,
    } as DrawNumberPayload);
  }

  /**
   * 番号をマーク
   */
  markNumber(roomId: string, playerId: string, number: number): void {
    this.socket?.emit(SOCKET_EVENTS.MARK_NUMBER, {
      roomId,
      playerId,
      number,
    } as MarkNumberPayload);
  }

  /**
   * ビンゴを宣言
   */
  declareBingo(roomId: string, playerId: string): void {
    this.socket?.emit(SOCKET_EVENTS.DECLARE_BINGO, {
      roomId,
      playerId,
    } as DeclareBingoPayload);
  }

  /**
   * 接続を切断
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  /**
   * 接続状態を取得
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
