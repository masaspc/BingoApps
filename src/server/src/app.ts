import express from 'express';
import cors from 'cors';
import { roomRouter } from './routes/rooms.js';

export const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API ルート
app.use('/api/rooms', roomRouter);

// 404 ハンドラ
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
