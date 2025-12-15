// 共有型をre-export
export * from './shared';

// モバイル固有の型定義

export interface GameState {
  room: import('./shared').Room | null;
  player: import('./shared').Player | null;
  card: import('./shared').BingoCard | null;
  players: import('./shared').Player[];
  hostPin: string | null;
  isConnected: boolean;
}

export interface AppConfig {
  apiUrl: string;
}
