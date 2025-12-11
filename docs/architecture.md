# Bingo App アーキテクチャ設計書

## 概要

会社のビンゴ大会で使用するクロスプラットフォーム（iOS/Android）対応のリアルタイムビンゴアプリケーション。

### 要件

- **同時接続数**: 100人程度
- **用途**: 会社のビンゴ大会（複数人同時参加）
- **予算**: 月2,000円程度 または 自社サーバー（単一サーバー構成）

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| **モバイルアプリ** | React Native + Expo | Expo SDK 50+ |
| **言語（共通）** | TypeScript | 5.x |
| **バックエンド** | Node.js + Express | Node 20 LTS |
| **リアルタイム通信** | Socket.io | 4.x |
| **データベース** | SQLite | 3.x |
| **ORM** | Prisma | 5.x |
| **コンテナ** | Docker | 24.x |

---

## システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│              単一サーバー (自社 or VPS)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Docker Container                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │        Node.js + TypeScript + Express            │  │ │
│  │  │                                                  │  │ │
│  │  │  ┌─────────────────┐   ┌─────────────────────┐   │  │ │
│  │  │  │    REST API     │   │     Socket.io       │   │  │ │
│  │  │  │                 │   │                     │   │  │ │
│  │  │  │ POST /rooms     │   │ join-room           │   │  │ │
│  │  │  │ GET  /rooms/:id │   │ draw-number         │   │  │ │
│  │  │  │ POST /auth      │   │ mark-number         │   │  │ │
│  │  │  │                 │   │ bingo-declared      │   │  │ │
│  │  │  └─────────────────┘   └─────────────────────┘   │  │ │
│  │  │            │                     │               │  │ │
│  │  │            └──────────┬──────────┘               │  │ │
│  │  │                       ▼                          │  │ │
│  │  │            ┌─────────────────────┐               │  │ │
│  │  │            │   Prisma ORM        │               │  │ │
│  │  │            └──────────┬──────────┘               │  │ │
│  │  │                       ▼                          │  │ │
│  │  │            ┌─────────────────────┐               │  │ │
│  │  │            │   SQLite Database   │               │  │ │
│  │  │            │   (bingo.db)        │               │  │ │
│  │  │            └─────────────────────┘               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                         Port 3000                           │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTPS / WSS
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────┴─────┐    ┌──────┴──────┐    ┌─────┴─────┐
    │  iOS App  │    │ Android App │    │ Web Admin │
    │   Expo    │    │    Expo     │    │  (React)  │
    └───────────┘    └─────────────┘    └───────────┘
```

---

## プロジェクト構造

```
BingoApps/
├── docs/
│   └── architecture.md          # 本ドキュメント
│
├── src/
│   ├── server/                  # バックエンド
│   │   ├── src/
│   │   │   ├── index.ts         # エントリーポイント
│   │   │   ├── app.ts           # Express アプリ設定
│   │   │   ├── socket/          # Socket.io ハンドラ
│   │   │   │   ├── index.ts
│   │   │   │   └── bingoHandler.ts
│   │   │   ├── routes/          # REST API ルート
│   │   │   │   ├── index.ts
│   │   │   │   ├── rooms.ts
│   │   │   │   └── auth.ts
│   │   │   ├── services/        # ビジネスロジック
│   │   │   │   ├── roomService.ts
│   │   │   │   ├── bingoService.ts
│   │   │   │   └── cardService.ts
│   │   │   ├── models/          # 型定義
│   │   │   │   └── types.ts
│   │   │   └── utils/           # ユーティリティ
│   │   │       └── random.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma    # DBスキーマ
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── mobile/                  # React Native (Expo) アプリ
│   │   ├── app/                 # Expo Router (画面)
│   │   │   ├── index.tsx        # ホーム画面
│   │   │   ├── join.tsx         # ルーム参加画面
│   │   │   ├── game.tsx         # ゲーム画面
│   │   │   └── admin.tsx        # 管理者画面
│   │   ├── components/          # UIコンポーネント
│   │   │   ├── BingoCard.tsx
│   │   │   ├── NumberBall.tsx
│   │   │   └── PlayerList.tsx
│   │   ├── hooks/               # カスタムフック
│   │   │   └── useSocket.ts
│   │   ├── services/            # API/Socket通信
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── types/               # 型定義（共有）
│   │   │   └── index.ts
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                  # 共有型定義
│       └── types.ts
│
├── docker-compose.yml           # 開発・本番デプロイ用
├── .gitignore
└── README.md
```

---

## データモデル

### ER図

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Room     │       │   Player    │       │  BingoCard  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │◄──┐   │ id (PK)     │
│ name        │   │   │ name        │   │   │ numbers[]   │
│ hostPin     │   └───│ roomId (FK) │   └───│ playerId(FK)│
│ status      │       │ isHost      │       │ marked[]    │
│ drawnNums[] │       │ createdAt   │       │ hasBingo    │
│ currentNum  │       └─────────────┘       └─────────────┘
│ createdAt   │
└─────────────┘
```

### Prisma スキーマ

```prisma
model Room {
  id           String   @id @default(uuid())
  name         String
  hostPin      String   // 管理者用PIN
  status       String   @default("waiting") // waiting, playing, finished
  drawnNumbers String   @default("[]") // JSON array
  currentNumber Int?
  createdAt    DateTime @default(now())
  players      Player[]
}

model Player {
  id        String     @id @default(uuid())
  name      String
  roomId    String
  room      Room       @relation(fields: [roomId], references: [id])
  isHost    Boolean    @default(false)
  createdAt DateTime   @default(now())
  card      BingoCard?
}

model BingoCard {
  id        String  @id @default(uuid())
  playerId  String  @unique
  player    Player  @relation(fields: [playerId], references: [id])
  numbers   String  // JSON: 5x5 array
  marked    String  @default("[]") // JSON: marked positions
  hasBingo  Boolean @default(false)
}
```

---

## API 設計

### REST API

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/rooms` | ルーム作成 |
| GET | `/api/rooms/:id` | ルーム情報取得 |
| POST | `/api/rooms/:id/join` | ルーム参加 |
| GET | `/api/rooms/:id/players` | 参加者一覧 |

### Socket.io イベント

#### クライアント → サーバー

| イベント | ペイロード | 説明 |
|---------|-----------|------|
| `join-room` | `{ roomId, playerId }` | ルームに接続 |
| `draw-number` | `{ roomId, hostPin }` | 番号を抽選（管理者のみ） |
| `mark-number` | `{ roomId, playerId, number }` | 番号をマーク |
| `declare-bingo` | `{ roomId, playerId }` | ビンゴ宣言 |

#### サーバー → クライアント

| イベント | ペイロード | 説明 |
|---------|-----------|------|
| `room-state` | `{ room, players }` | ルーム状態更新 |
| `number-drawn` | `{ number, drawnNumbers }` | 番号抽選結果 |
| `player-joined` | `{ player }` | 参加者追加 |
| `player-marked` | `{ playerId, number }` | マーク通知 |
| `bingo-winner` | `{ player, card }` | ビンゴ当選者 |

---

## 画面構成

### 1. ホーム画面 (`/`)
- ルーム作成ボタン
- ルーム参加（コード入力）

### 2. ルーム参加画面 (`/join`)
- 名前入力
- ルームコード入力
- 参加ボタン

### 3. ゲーム画面 (`/game`)
- 5x5 ビンゴカード表示
- 抽選された番号表示
- 抽選履歴
- 参加者リスト
- ビンゴ宣言ボタン

### 4. 管理者画面 (`/admin`)
- 抽選ボタン
- 参加者管理
- ゲームリセット

---

## デプロイ構成

### 開発環境

```bash
# サーバー起動
cd src/server && npm run dev

# モバイルアプリ起動
cd src/mobile && npx expo start
```

### 本番環境（Docker）

```yaml
# docker-compose.yml
services:
  server:
    build: ./src/server
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data  # SQLite永続化
    environment:
      - NODE_ENV=production
```

### VPS 推奨スペック

- **CPU**: 1 vCPU
- **メモリ**: 1GB
- **ストレージ**: 10GB SSD
- **推奨サービス**: ConoHa VPS, さくらVPS, Vultr

---

## セキュリティ考慮事項

1. **管理者認証**: ルーム作成時に生成されるPINで管理者を認証
2. **HTTPS**: 本番環境では必須（Let's Encrypt推奨）
3. **レート制限**: Socket.io接続数の制限
4. **入力検証**: 全APIエンドポイントで入力値を検証

---

## 今後の拡張案

- [ ] 景品管理機能
- [ ] 複数ビンゴパターン対応（縦・横・斜め以外）
- [ ] 抽選演出のカスタマイズ
- [ ] 参加者へのプッシュ通知
- [ ] ゲーム履歴・統計機能
