# ConoHa VPS デプロイ手順書

ビンゴ大会で使用する際の、ConoHa VPS セットアップから終了までの完全ガイドです。

## 目次

1. [事前準備（大会1週間前）](#1-事前準備大会1週間前)
2. [サーバー作成（大会前日〜当日朝）](#2-サーバー作成大会前日当日朝)
3. [アプリのデプロイ（約15分）](#3-アプリのデプロイ約15分)
4. [動作確認](#4-動作確認)
5. [大会当日の運用](#5-大会当日の運用)
6. [大会終了後（サーバー削除）](#6-大会終了後サーバー削除)

---

## 費用の目安

| 使用時間 | 費用（1GB プラン） |
|---------|------------------|
| 1時間 | ¥1.1 |
| 8時間 | ¥8.8 |
| 24時間 | ¥26.4 |
| 48時間（2日間） | ¥52.8 |

※ 月額上限 ¥682（それ以上は課金されない）

---

## 1. 事前準備（大会1週間前）

### 1.1 ConoHa アカウント作成

1. https://www.conoha.jp/ にアクセス
2. 「お申し込み」をクリック
3. メールアドレス、パスワードを入力
4. SMS認証を完了
5. 支払い方法を登録（クレジットカード推奨）

### 1.2 SSH キーの作成（推奨）

#### Windows（PowerShell）の場合

```powershell
# SSHキー生成
ssh-keygen -t ed25519 -C "bingo-server"

# 公開鍵を表示（後でConoHaに登録）
cat ~/.ssh/id_ed25519.pub
```

#### Mac/Linux の場合

```bash
# SSHキー生成
ssh-keygen -t ed25519 -C "bingo-server"

# 公開鍵を表示
cat ~/.ssh/id_ed25519.pub
```

### 1.3 ConoHa に SSH キーを登録

1. ConoHa コントロールパネルにログイン
2. 左メニュー「セキュリティ」→「SSH Key」
3. 「+ SSH Key」をクリック
4. 「SSH Key を登録」を選択
5. 公開鍵を貼り付けて保存

---

## 2. サーバー作成（大会前日〜当日朝）

### 2.1 VPS を作成

1. ConoHa コントロールパネルにログイン
2. 左メニュー「サーバー追加」をクリック
3. 以下の設定を選択：

| 項目 | 設定値 |
|-----|-------|
| サービス | VPS |
| 料金タイプ | **時間課金** |
| プラン | **1GB** |
| イメージタイプ | OS → **Ubuntu 22.04** |
| rootパスワード | 強力なパスワードを設定（メモしておく） |
| SSH Key | 事前に登録したキーを選択 |
| オプション | そのまま |

4. 「追加」をクリック
5. サーバーが「起動中」になるまで待つ（1〜2分）

### 2.2 IPアドレスを確認

サーバー一覧で作成したサーバーをクリックし、**IPアドレス**をメモ。

例: `123.456.789.012`

---

## 3. アプリのデプロイ（約15分）

### 3.1 サーバーに接続

#### Windows（PowerShell）

```powershell
ssh root@123.456.789.012
```

#### Mac/Linux

```bash
ssh root@123.456.789.012
```

初回接続時に「Are you sure...」と聞かれたら `yes` を入力。

### 3.2 自動セットアップスクリプトを実行

以下のコマンドを**1行ずつ**コピーして実行：

```bash
# システム更新
apt update && apt upgrade -y

# Docker インストール
curl -fsSL https://get.docker.com | sh

# アプリをダウンロード
cd /opt
git clone https://github.com/YOUR_USERNAME/BingoApps.git
cd BingoApps

# アプリを起動
docker compose up -d --build

# 起動確認（少し待ってから実行）
sleep 10
docker compose ps
curl http://localhost:3000/health
```

### 3.3 ファイアウォール設定

```bash
# ファイアウォールを有効化
ufw allow 22
ufw allow 3000
ufw --force enable

# 確認
ufw status
```

### 3.4 動作確認

ブラウザで以下にアクセス：

```
http://123.456.789.012:3000/health
```

`{"status":"ok",...}` と表示されれば成功！

---

## 4. 動作確認

### 4.1 モバイルアプリの設定

アプリのサーバーURLを設定する必要があります。

#### 開発用（Expo Go で確認する場合）

`src/mobile/app.json` を編集：

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://123.456.789.012:3000"
    }
  }
}
```

その後、開発PCで：

```bash
cd src/mobile
npm install
npx expo start
```

スマホの Expo Go アプリでQRコードをスキャン。

#### 本番用（APKビルド）

`src/mobile/app.json` のURLを本番サーバーに設定してからビルド：

```bash
npx eas build --platform android --profile preview
```

### 4.2 テストプレイ

1. アプリを起動
2. 「Create Room」でルームを作成
3. 別のスマホから「Join Room」で参加
4. 抽選が動作するか確認

---

## 5. 大会当日の運用

### 5.1 事前チェックリスト

| チェック | 項目 |
|---------|------|
| [ ] | サーバーが起動している |
| [ ] | http://IPアドレス:3000/health にアクセスできる |
| [ ] | 管理者のスマホでルームを作成できる |
| [ ] | 参加者用のルームコードを準備 |
| [ ] | Wi-Fi環境が安定している |

### 5.2 参加者への案内

```
【ビンゴ大会 参加方法】

1. スマホに「Expo Go」アプリをインストール
   - iPhone: App Store で「Expo Go」を検索
   - Android: Google Play で「Expo Go」を検索

2. 以下のQRコードをスキャン
   （QRコードを表示）

3. アプリが開いたら「Join Room」をタップ

4. ルームコード: XXXXXX
   名前を入力して参加！
```

### 5.3 トラブルシューティング

#### アプリが接続できない

```bash
# サーバーにSSH接続して確認
ssh root@123.456.789.012

# コンテナの状態確認
docker compose ps

# ログ確認
docker compose logs -f

# 再起動
docker compose restart
```

#### 参加者が入れない

- Wi-Fiが同じネットワークか確認
- ルームコードが正しいか確認
- サーバーのファイアウォールを確認

---

## 6. 大会終了後（サーバー削除）

**重要: サーバーを削除しないと課金が続きます！**

### 6.1 サーバーを削除

1. ConoHa コントロールパネルにログイン
2. 左メニュー「サーバー」
3. 対象サーバーをクリック
4. 右上の「サーバー削除」をクリック
5. 確認画面で「はい」をクリック

### 6.2 削除確認

- サーバー一覧から消えていることを確認
- 翌日、ConoHaから課金メールが来ていないか確認

---

## クイックリファレンス

### よく使うコマンド

```bash
# サーバー接続
ssh root@YOUR_IP

# アプリ起動
cd /opt/BingoApps && docker compose up -d

# アプリ停止
docker compose down

# ログ確認
docker compose logs -f

# 再起動
docker compose restart

# ヘルスチェック
curl http://localhost:3000/health
```

### 重要な情報（メモしておく）

| 項目 | 値 |
|-----|---|
| ConoHa ログインID | |
| ConoHa パスワード | |
| サーバー IP アドレス | |
| サーバー root パスワード | |
| ルームコード（当日作成） | |
| 管理者 PIN（当日作成） | |

---

## 次回の大会に向けて

1. このドキュメントを保存しておく
2. SSH キーは削除せず保管
3. アプリのコードは GitHub に保存済み
4. 次回は「2. サーバー作成」から開始すればOK
