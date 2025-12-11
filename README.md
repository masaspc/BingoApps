# Bingo App

会社のビンゴ大会で使用するクロスプラットフォーム（iOS/Android/Web）対応のリアルタイムビンゴアプリケーション。

## 対応プラットフォーム

| プラットフォーム | 対応状況 | 備考 |
|----------------|---------|------|
| iOS | ✅ | Expo Go または ビルド済みアプリ |
| Android | ✅ | Expo Go または APK |
| Web (PC) | ✅ | Chrome, Firefox, Safari, Edge |
| Web (スマホブラウザ) | ✅ | モバイルブラウザ対応 |

## 技術スタック

- **クライアントアプリ**: React Native + Expo (TypeScript) - iOS/Android/Web対応
- **バックエンド**: Node.js + Express + Socket.io (TypeScript)
- **データベース**: SQLite + Prisma ORM
- **デプロイ**: Docker

## プロジェクト構造

```
BingoApps/
├── docs/                    # ドキュメント
│   ├── architecture.md      # アーキテクチャ設計書
│   ├── deployment-conoha.md # ConoHa VPS デプロイ手順
│   └── participant-guide.md # 参加者向けガイド
├── src/
│   ├── server/              # バックエンドサーバー
│   ├── mobile/              # React Native アプリ (iOS/Android/Web)
│   └── shared/              # 共有型定義
├── scripts/                 # セットアップスクリプト
├── docker-compose.yml
└── README.md
```

## セットアップ

### 前提条件

- Node.js 20+
- npm または yarn
- Docker (本番デプロイ用)

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

### クライアントアプリのセットアップ

```bash
cd src/mobile

# 依存関係インストール
npm install

# 開発サーバー起動（iOS/Android/Web 選択可能）
npx expo start
```

#### 起動オプション

```bash
# Web版を起動
npx expo start --web

# iOS シミュレーター
npx expo start --ios

# Android エミュレーター
npx expo start --android
```

### サーバーURLの設定

開発時、アプリがサーバーに接続するには `app.json` の `extra.apiUrl` を変更してください：

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

詳細は [docs/deployment-conoha.md](docs/deployment-conoha.md) を参照。

### Docker を使用

```bash
# ビルドと起動
docker-compose up -d --build

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### Web版のビルド

```bash
cd src/mobile

# 静的ファイルをビルド
npx expo export --platform web

# dist/ フォルダが生成される
```

### モバイルアプリのビルド

```bash
cd src/mobile

# Android APK ビルド
npx eas build --platform android --profile preview

# iOS ビルド (Mac + Apple Developer アカウント必要)
npx eas build --platform ios
```

## 使い方

### 1. ルーム作成（管理者）

1. アプリ/Webを開く
2. 「Create Room」をクリック/タップ
3. ルーム名と名前を入力
4. 作成されたルームコードを参加者に共有

### 2. ルーム参加（参加者）

1. アプリ/Webを開く
2. 「Join Room」をクリック/タップ
3. ルームコードと名前を入力
4. 「Join」をクリック/タップ

### 3. ゲームプレイ

- **管理者**: 「Draw Number」ボタンで番号を抽選
- **参加者**: 抽選された番号が自分のカードにあればクリック/タップしてマーク
- **ビンゴ達成**: 「BINGO!」ボタンをクリック/タップして宣言

## Web版の特徴

- **レスポンシブデザイン**: PC、タブレット、スマホブラウザに最適化
- **デスクトップ表示**: 2カラムレイアウトで見やすい
- **クリップボードコピー**: ルームコードをワンクリックでコピー
- **インストール不要**: ブラウザからそのまま参加可能

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
