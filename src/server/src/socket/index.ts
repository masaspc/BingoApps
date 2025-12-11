import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { roomService } from '../services/roomService.js';
import {
  SOCKET_EVENTS,
  type JoinRoomPayload,
  type DrawNumberPayload,
  type MarkNumberPayload,
  type DeclareBingoPayload,
} from '../../shared/types.js';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ルームに参加
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload: JoinRoomPayload) => {
      try {
        const { roomId, playerId } = payload;

        // Socket.ioのルームに参加
        socket.join(roomId);

        // 現在のルーム状態を送信
        const room = await roomService.getRoom(roomId);
        const players = await roomService.getPlayers(roomId);

        if (room) {
          socket.emit(SOCKET_EVENTS.ROOM_STATE, { room, players });

          // 他の参加者に通知
          const player = players.find(p => p.id === playerId);
          if (player) {
            socket.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, { player });
          }
        }
      } catch (error) {
        console.error('Error in join-room:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
      }
    });

    // 番号を抽選（管理者のみ）
    socket.on(SOCKET_EVENTS.DRAW_NUMBER, async (payload: DrawNumberPayload) => {
      try {
        const { roomId, hostPin } = payload;

        // ホストPIN検証
        const isValid = await roomService.verifyHostPin(roomId, hostPin);
        if (!isValid) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid host PIN' });
          return;
        }

        // ゲーム開始（まだの場合）
        const room = await roomService.getRoom(roomId);
        if (room?.status === 'waiting') {
          await roomService.startGame(roomId);
        }

        // 番号抽選
        const result = await roomService.drawNumber(roomId);
        if (result) {
          io.to(roomId).emit(SOCKET_EVENTS.NUMBER_DRAWN, result);
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'No more numbers to draw' });
        }
      } catch (error) {
        console.error('Error in draw-number:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to draw number' });
      }
    });

    // 番号をマーク
    socket.on(SOCKET_EVENTS.MARK_NUMBER, async (payload: MarkNumberPayload) => {
      try {
        const { roomId, playerId, number } = payload;

        const card = await roomService.markNumber(playerId, number);
        if (card) {
          // 他のプレイヤーに通知
          socket.to(roomId).emit(SOCKET_EVENTS.PLAYER_MARKED, { playerId, number });
        }
      } catch (error) {
        console.error('Error in mark-number:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to mark number' });
      }
    });

    // ビンゴ宣言
    socket.on(SOCKET_EVENTS.DECLARE_BINGO, async (payload: DeclareBingoPayload) => {
      try {
        const { roomId, playerId } = payload;

        const result = await roomService.declareBingo(playerId);
        if (result && result.valid) {
          // ビンゴ当選者を全員に通知
          io.to(roomId).emit(SOCKET_EVENTS.BINGO_WINNER, {
            player: result.player,
            card: result.card,
          });
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid bingo declaration' });
        }
      } catch (error) {
        console.error('Error in declare-bingo:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to declare bingo' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  return io;
}
