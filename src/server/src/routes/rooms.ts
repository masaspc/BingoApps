import { Router } from 'express';
import { roomService } from '../services/roomService.js';
import type { CreateRoomRequest, JoinRoomRequest } from '../../shared/types.js';

export const roomRouter = Router();

/**
 * POST /api/rooms - ルーム作成
 */
roomRouter.post('/', async (req, res) => {
  try {
    const { name, hostName } = req.body as CreateRoomRequest;

    if (!name || !hostName) {
      res.status(400).json({ error: 'name and hostName are required' });
      return;
    }

    const result = await roomService.createRoom(name, hostName);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rooms/:id - ルーム情報取得
 */
roomRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomService.getRoom(id);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({ room });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rooms/:id/join - ルーム参加
 */
roomRouter.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { playerName } = req.body as JoinRoomRequest;

    if (!playerName) {
      res.status(400).json({ error: 'playerName is required' });
      return;
    }

    const result = await roomService.joinRoom(id, playerName);

    if (!result) {
      res.status(404).json({ error: 'Room not found or not accepting players' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rooms/:id/players - 参加者一覧
 */
roomRouter.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;
    const players = await roomService.getPlayers(id);
    res.json({ players });
  } catch (error) {
    console.error('Error getting players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
