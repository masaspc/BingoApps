import Constants from 'expo-constants';
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  Room,
  Player,
} from '../types';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/api`;
  }

  /**
   * API URLを設定
   */
  setBaseUrl(url: string) {
    this.baseUrl = `${url}/api`;
  }

  /**
   * ルームを作成
   */
  async createRoom(name: string, hostName: string): Promise<CreateRoomResponse> {
    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, hostName } as CreateRoomRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  }

  /**
   * ルーム情報を取得
   */
  async getRoom(roomId: string): Promise<{ room: Room }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`);

    if (!response.ok) {
      throw new Error('Room not found');
    }

    return response.json();
  }

  /**
   * ルームに参加
   */
  async joinRoom(roomId: string, playerName: string): Promise<JoinRoomResponse> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName } as JoinRoomRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to join room');
    }

    return response.json();
  }

  /**
   * 参加者一覧を取得
   */
  async getPlayers(roomId: string): Promise<{ players: Player[] }> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/players`);

    if (!response.ok) {
      throw new Error('Failed to get players');
    }

    return response.json();
  }
}

export const api = new ApiService();
