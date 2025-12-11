import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import type {
  Room,
  Player,
  BingoCard,
  RoomStatePayload,
  NumberDrawnPayload,
  PlayerJoinedPayload,
  BingoWinnerPayload,
} from '../types';

interface UseSocketOptions {
  roomId: string;
  playerId: string;
  onBingoWinner?: (player: Player, card: BingoCard) => void;
}

interface UseSocketReturn {
  room: Room | null;
  players: Player[];
  isConnected: boolean;
  drawnNumbers: number[];
  currentNumber: number | null;
  error: string | null;
  drawNumber: (hostPin: string) => void;
  markNumber: (number: number) => void;
  declareBingo: () => void;
}

export function useSocket({
  roomId,
  playerId,
  onBingoWinner,
}: UseSocketOptions): UseSocketReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Socket.io接続
    socketService.connect();

    // イベントハンドラ設定
    socketService.setHandlers({
      onConnect: () => {
        setIsConnected(true);
        setError(null);
        // ルームに参加
        socketService.joinRoom(roomId, playerId);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onRoomState: (payload: RoomStatePayload) => {
        setRoom(payload.room);
        setPlayers(payload.players);
        setDrawnNumbers(payload.room.drawnNumbers);
        setCurrentNumber(payload.room.currentNumber);
      },
      onNumberDrawn: (payload: NumberDrawnPayload) => {
        setDrawnNumbers(payload.drawnNumbers);
        setCurrentNumber(payload.number);
      },
      onPlayerJoined: (payload: PlayerJoinedPayload) => {
        setPlayers(prev => [...prev, payload.player]);
      },
      onBingoWinner: (payload: BingoWinnerPayload) => {
        onBingoWinner?.(payload.player, payload.card);
      },
      onError: (err) => {
        setError(err.message);
      },
    });

    // クリーンアップ
    return () => {
      socketService.disconnect();
    };
  }, [roomId, playerId, onBingoWinner]);

  const drawNumber = useCallback(
    (hostPin: string) => {
      socketService.drawNumber(roomId, hostPin);
    },
    [roomId]
  );

  const markNumber = useCallback(
    (number: number) => {
      socketService.markNumber(roomId, playerId, number);
    },
    [roomId, playerId]
  );

  const declareBingo = useCallback(() => {
    socketService.declareBingo(roomId, playerId);
  }, [roomId, playerId]);

  return {
    room,
    players,
    isConnected,
    drawnNumbers,
    currentNumber,
    error,
    drawNumber,
    markNumber,
    declareBingo,
  };
}
