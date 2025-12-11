// 共有型をre-export
export * from '../../shared/types';

// モバイル固有の型定義

export interface GameState {
  room: import('../../shared/types').Room | null;
  player: import('../../shared/types').Player | null;
  card: import('../../shared/types').BingoCard | null;
  players: import('../../shared/types').Player[];
  hostPin: string | null;
  isConnected: boolean;
}

export interface AppConfig {
  apiUrl: string;
}
