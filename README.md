# Bingo App

会社のビンゴ大会で使用するクロスプラットフォーム（iOS/Android）対応のリアルタイムビンゴアプリケーション。

## 技術スタック

- **モバイルアプリ**: React Native + Expo (TypeScript)
- **バックエンド**: Node.js + Express + Socket.io (TypeScript)
- **データベース**: SQLite + Prisma ORM
- **デプロイ**: Docker

## プロジェクト構造

```
BingoApps/
├── docs/                    # ドキュメント
├── src/
│   ├── server/              # バックエンドサーバー
│   ├── mobile/              # React Native アプリ
│   └── shared/              # 共有型定義
├── docker-compose.yml
└── README.md
```

## セットアップ

### 前提条件

- Node.js 20+
- npm または yarn
- Docker (本番デプロイ用)
- Expo CLI (`npm install -g expo-cli`)

### バックエンドのセットアップ

```bash
cd src/server

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env

# Prisma クライアント生成
npm run prisma:generate

# データベースマイグレーション
npm run prisma:migrate

# 開発サーバー起動
npm run dev
```

サーバーが `http://localhost:3000` で起動します。

### モバイルアプリのセットアップ

```bash
cd src/mobile

# 依存関係インストール
npm install

# Expo 開発サーバー起動
npx expo start
```

Expo Go アプリでQRコードをスキャンするか、シミュレーターで実行できます。

### サーバーURLの設定

開発時、モバイルアプリがサーバーに接続するには `app.json` の `extra.apiUrl` を変更してください：

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_LOCAL_IP:3000"
    }
  }
}
```

## 本番デプロイ

### Docker を使用

```bash
# ビルドと起動
docker-compose up -d --build

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### モバイルアプリのビルド

```bash
cd src/mobile

# iOS ビルド (Mac のみ)
npx expo build:ios

# Android ビルド
npx expo build:android

# または EAS Build を使用
npx eas build --platform all
```

## 使い方

### 1. ルーム作成（管理者）

1. アプリを開く
2. 「Create Room」をタップ
3. ルーム名と名前を入力
4. 作成されたルームコードを参加者に共有

### 2. ルーム参加（参加者）

1. アプリを開く
2. 「Join Room」をタップ
3. ルームコードと名前を入力
4. 「Join」をタップ

### 3. ゲームプレイ

- **管理者**: 「Draw Number」ボタンで番号を抽選
- **参加者**: 抽選された番号が自分のカードにあればタップしてマーク
- **ビンゴ達成**: 「BINGO!」ボタンをタップして宣言

## API エンドポイント

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/rooms` | ルーム作成 |
| GET | `/api/rooms/:id` | ルーム情報取得 |
| POST | `/api/rooms/:id/join` | ルーム参加 |
| GET | `/api/rooms/:id/players` | 参加者一覧 |

## Socket.io イベント

### クライアント → サーバー

- `join-room`: ルームに接続
- `draw-number`: 番号を抽選（管理者のみ）
- `mark-number`: 番号をマーク
- `declare-bingo`: ビンゴ宣言

### サーバー → クライアント

- `room-state`: ルーム状態更新
- `number-drawn`: 番号抽選結果
- `player-joined`: 参加者追加
- `bingo-winner`: ビンゴ当選者

## ライセンス

MIT
