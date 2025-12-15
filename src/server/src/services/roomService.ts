import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import type { Room, Player, BingoCard, RoomStatus } from '../../shared/types.js';
import { generateBingoCard, generateInitialMarked, generatePin } from '../utils/random.js';

const prisma = new PrismaClient();

// DBモデルをAPIモデルに変換
function toRoom(dbRoom: {
  id: string;
  name: string;
  status: string;
  drawnNumbers: string;
  currentNumber: number | null;
  createdAt: Date;
}): Room {
  return {
    id: dbRoom.id,
    name: dbRoom.name,
    status: dbRoom.status as RoomStatus,
    drawnNumbers: JSON.parse(dbRoom.drawnNumbers),
    currentNumber: dbRoom.currentNumber,
    createdAt: dbRoom.createdAt,
  };
}

function toPlayer(dbPlayer: {
  id: string;
  name: string;
  roomId: string;
  isHost: boolean;
  createdAt: Date;
}): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    roomId: dbPlayer.roomId,
    isHost: dbPlayer.isHost,
    createdAt: dbPlayer.createdAt,
  };
}

function toBingoCard(dbCard: {
  id: string;
  playerId: string;
  numbers: string;
  marked: string;
  hasBingo: boolean;
}): BingoCard {
  return {
    id: dbCard.id,
    playerId: dbCard.playerId,
    numbers: JSON.parse(dbCard.numbers),
    marked: JSON.parse(dbCard.marked),
    hasBingo: dbCard.hasBingo,
  };
}

export const roomService = {
  /**
   * ルームを作成
   */
  async createRoom(name: string, hostName: string): Promise<{
    room: Room;
    hostPin: string;
    player: Player;
    card: BingoCard;
  }> {
    const hostPin = generatePin();
    const numbers = generateBingoCard();
    const marked = generateInitialMarked();

    const dbRoom = await prisma.room.create({
      data: {
        name,
        hostPin,
        players: {
          create: {
            name: hostName,
            isHost: true,
            card: {
              create: {
                numbers: JSON.stringify(numbers),
                marked: JSON.stringify(marked),
              },
            },
          },
        },
      },
      include: {
        players: {
          include: {
            card: true,
          },
        },
      },
    });

    const dbPlayer = dbRoom.players[0];
    const dbCard = dbPlayer.card!;

    return {
      room: toRoom(dbRoom),
      hostPin,
      player: toPlayer(dbPlayer),
      card: toBingoCard(dbCard),
    };
  },

  /**
   * ルームを取得
   */
  async getRoom(roomId: string): Promise<Room | null> {
    const dbRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    return dbRoom ? toRoom(dbRoom) : null;
  },

  /**
   * ルームに参加
   */
  async joinRoom(roomId: string, playerName: string): Promise<{
    room: Room;
    player: Player;
    card: BingoCard;
    players: Player[];
  } | null> {
    const dbRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!dbRoom || dbRoom.status !== 'waiting') {
      return null;
    }

    const numbers = generateBingoCard();
    const marked = generateInitialMarked();

    const dbPlayer = await prisma.player.create({
      data: {
        name: playerName,
        roomId,
        card: {
          create: {
            numbers: JSON.stringify(numbers),
            marked: JSON.stringify(marked),
          },
        },
      },
      include: {
        card: true,
      },
    });

    const allPlayers = await prisma.player.findMany({
      where: { roomId },
    });

    return {
      room: toRoom(dbRoom),
      player: toPlayer(dbPlayer),
      card: toBingoCard(dbPlayer.card!),
      players: allPlayers.map(toPlayer),
    };
  },

  /**
   * ルームの参加者一覧を取得
   */
  async getPlayers(roomId: string): Promise<Player[]> {
    const dbPlayers = await prisma.player.findMany({
      where: { roomId },
    });

    return dbPlayers.map(toPlayer);
  },

  /**
   * ホストPINを検証
   */
  async verifyHostPin(roomId: string, pin: string): Promise<boolean> {
    const dbRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    return dbRoom?.hostPin === pin;
  },

  /**
   * ゲームを開始
   */
  async startGame(roomId: string): Promise<Room | null> {
    const dbRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status: 'playing' },
    });

    return toRoom(dbRoom);
  },

  /**
   * 番号を抽選
   */
  async drawNumber(roomId: string): Promise<{ number: number; drawnNumbers: number[] } | null> {
    const dbRoom = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!dbRoom || dbRoom.status !== 'playing') {
      return null;
    }

    const drawnNumbers: number[] = JSON.parse(dbRoom.drawnNumbers);

    // 未抽選の番号を取得
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(n => !drawnNumbers.includes(n));

    if (availableNumbers.length === 0) {
      return null;
    }

    // ランダムに1つ選択
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const drawnNumber = availableNumbers[randomIndex];

    drawnNumbers.push(drawnNumber);

    await prisma.room.update({
      where: { id: roomId },
      data: {
        drawnNumbers: JSON.stringify(drawnNumbers),
        currentNumber: drawnNumber,
      },
    });

    return { number: drawnNumber, drawnNumbers };
  },

  /**
   * プレイヤーのカードを取得
   */
  async getPlayerCard(playerId: string): Promise<BingoCard | null> {
    const dbCard = await prisma.bingoCard.findUnique({
      where: { playerId },
    });

    return dbCard ? toBingoCard(dbCard) : null;
  },

  /**
   * 番号をマーク
   */
  async markNumber(playerId: string, number: number): Promise<BingoCard | null> {
    const dbCard = await prisma.bingoCard.findUnique({
      where: { playerId },
    });

    if (!dbCard) {
      return null;
    }

    const numbers: number[][] = JSON.parse(dbCard.numbers);
    const marked: boolean[][] = JSON.parse(dbCard.marked);

    // 番号の位置を探す
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (numbers[row][col] === number) {
          marked[row][col] = true;
        }
      }
    }

    const updatedCard = await prisma.bingoCard.update({
      where: { playerId },
      data: { marked: JSON.stringify(marked) },
    });

    return toBingoCard(updatedCard);
  },

  /**
   * ビンゴを宣言
   */
  async declareBingo(playerId: string): Promise<{ valid: boolean; card: BingoCard; player: Player } | null> {
    const dbCard = await prisma.bingoCard.findUnique({
      where: { playerId },
      include: { player: { include: { room: true } } },
    });

    if (!dbCard) {
      return null;
    }

    const player = toPlayer(dbCard.player);
    const numbers: number[][] = JSON.parse(dbCard.numbers);
    const marked: boolean[][] = JSON.parse(dbCard.marked);

    // ルームの抽選済み番号を取得して、カード上の該当番号を自動マーク
    const drawnNumbers: number[] = JSON.parse(dbCard.player.room.drawnNumbers);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const num = numbers[row][col];
        if (num !== 0 && drawnNumbers.includes(num)) {
          marked[row][col] = true;
        }
      }
    }

    // 更新されたマーク状態をDBに保存
    await prisma.bingoCard.update({
      where: { playerId },
      data: { marked: JSON.stringify(marked) },
    });

    // ビンゴ判定
    const { checkBingo } = await import('../utils/random.js');
    const valid = checkBingo(marked);

    const card: BingoCard = {
      id: dbCard.id,
      playerId: dbCard.playerId,
      numbers,
      marked,
      hasBingo: valid,
    };

    if (valid) {
      await prisma.bingoCard.update({
        where: { playerId },
        data: { hasBingo: true },
      });
    }

    return { valid, card, player };
  },

  /**
   * ゲームを終了
   */
  async endGame(roomId: string): Promise<Room | null> {
    const dbRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status: 'finished' },
    });

    return toRoom(dbRoom);
  },
};
