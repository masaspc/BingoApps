import { createServer } from 'http';
import { app } from './app.js';
import { initializeSocket } from './socket/index.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Socket.io の初期化
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
