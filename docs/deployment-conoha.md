# ConoHa VPS デプロイ手順書

ビンゴ大会で使用する際の、ConoHa VPS セットアップから終了までの完全ガイドです。

**ドメイン: t-bingo.com**

## 目次

1. [事前準備（大会1週間前）](#1-事前準備大会1週間前)
2. [サーバー作成（大会前日〜当日朝）](#2-サーバー作成大会前日当日朝)
3. [アプリのデプロイ（約20分）](#3-アプリのデプロイ約20分)
4. [ドメイン・SSL設定](#4-ドメインssl設定)
5. [動作確認](#5-動作確認)
6. [大会当日の運用](#6-大会当日の運用)
7. [大会終了後（サーバー削除）](#7-大会終了後サーバー削除)

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

### 1.4 ドメイン設定の準備

ドメイン `t-bingo.com` のDNS設定画面を開けるようにしておく。

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

### 2.2 IPアドレスを確認・DNS設定

1. サーバー一覧で作成したサーバーをクリックし、**IPアドレス**をメモ
2. ドメインのDNS設定画面で以下を設定：

| タイプ | ホスト | 値 |
|-------|-------|-----|
| A | @ | （サーバーのIPアドレス） |
| A | www | （サーバーのIPアドレス） |

**注意**: DNS反映には数分〜数時間かかる場合があります。

---

## 3. アプリのデプロイ（約20分）

### 3.1 サーバーに接続

```bash
ssh root@（IPアドレス）
```

初回接続時に「Are you sure...」と聞かれたら `yes` を入力。

### 3.2 システム更新と必要パッケージのインストール

```bash
# システム更新
apt update && apt upgrade -y

# 必要なパッケージをインストール
apt install -y curl git nginx certbot python3-certbot-nginx

# Docker インストール
curl -fsSL https://get.docker.com | sh
```

### 3.3 アプリをダウンロード

```bash
cd /opt
git clone https://github.com/masaspc/BingoApps.git
cd BingoApps
```

### 3.4 アプリをビルド・起動

```bash
# アプリをビルド・起動（初回は5〜10分かかります）
docker compose up -d --build
```

**注意**: 初回ビルドは npm パッケージのダウンロードなどで時間がかかります。
途中でエラーが出なければ、完了まで待ってください。

### 3.5 起動確認

```bash
# コンテナの状態を確認
docker compose ps
```

「STATUS」が「Up」になっていれば成功です。

```bash
# ヘルスチェック
curl http://localhost:3000/health
```

`{"status":"ok",...}` と表示されればOK！

### 3.6 ファイアウォール設定

```bash
# ファイアウォールを有効化
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw --force enable

# 確認
ufw status
```

---

## 4. ドメイン・SSL設定

### 4.1 Nginx 設定

```bash
# 一時的にHTTPのみの設定を作成（SSL取得前）
cat > /etc/nginx/sites-available/t-bingo.com << 'EOF'
server {
    listen 80;
    server_name t-bingo.com www.t-bingo.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 有効化
ln -sf /etc/nginx/sites-available/t-bingo.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 設定テスト
nginx -t

# Nginx 再起動
systemctl restart nginx
```

### 4.2 SSL 証明書取得（Let's Encrypt）

**注意**: この手順の前にDNSが反映されている必要があります。

```bash
# SSL証明書を取得（メールアドレスは自分のものに変更）
certbot --nginx -d t-bingo.com -d www.t-bingo.com --non-interactive --agree-tos -m your-email@example.com
```

エラーが出た場合は、DNSの反映を待ってから再実行してください。

```bash
# 自動更新の確認
certbot renew --dry-run
```

### 4.3 最終的な Nginx 設定確認

certbot が自動でSSL設定を追加します。

```bash
# 設定確認
cat /etc/nginx/sites-available/t-bingo.com

# Nginx 再起動
systemctl restart nginx
```

---

## 5. 動作確認

### 5.1 ヘルスチェック

ブラウザで以下にアクセス：

```
https://t-bingo.com/health
```

`{"status":"ok",...}` と表示されれば成功！

### 5.2 Web版テスト

1. PC のブラウザで `https://t-bingo.com` にアクセス
2. 「Create Room」でルームを作成
3. スマホのブラウザで `https://t-bingo.com` にアクセス
4. 「Join Room」でルームに参加

---

## 6. 大会当日の運用

### 6.1 事前チェックリスト

| チェック | 項目 |
|---------|------|
| [ ] | サーバーが起動している |
| [ ] | https://t-bingo.com/health にアクセスできる |
| [ ] | 管理者PCでルームを作成できる |
| [ ] | 参加者用のルームコードを準備 |
| [ ] | Wi-Fi環境が安定している |

### 6.2 参加者への案内

```
【ビンゴ大会 参加方法】

1. スマホまたはPCのブラウザで以下にアクセス

   https://t-bingo.com

2. 「Join Room」をタップ/クリック

3. ルームコード: XXXXXX
   名前を入力して参加！

※ アプリのインストールは不要です
```

### 6.3 QRコード用URL

```
https://t-bingo.com
```

このURLのQRコードを作成して会場に表示すると便利です。

### 6.4 トラブルシューティング

#### アプリが接続できない

```bash
# サーバーにSSH接続して確認
ssh root@（IPアドレス）

# コンテナの状態確認
cd /opt/BingoApps
docker compose ps

# ログ確認
docker compose logs -f

# 再起動
docker compose restart

# Nginx 確認
systemctl status nginx
nginx -t
```

#### コンテナが起動していない場合

```bash
# 再ビルド
cd /opt/BingoApps
docker compose down
docker compose up -d --build

# ログを確認
docker compose logs -f
```

#### 参加者が入れない

- https://t-bingo.com にアクセスできるか確認
- ルームコードが正しいか確認
- 別のブラウザで試す

#### 最新のコードに更新したい場合

```bash
cd /opt/BingoApps
git pull
docker compose down
docker compose up -d --build
```

---

## 7. 大会終了後（サーバー削除）

**重要: サーバーを削除しないと課金が続きます！**

### 7.1 サーバーを削除

1. ConoHa コントロールパネルにログイン
2. 左メニュー「サーバー」
3. 対象サーバーをクリック
4. 右上の「サーバー削除」をクリック
5. 確認画面で「はい」をクリック

### 7.2 DNS設定を元に戻す（任意）

次回使用するまでDNSのAレコードを削除しておくこともできます。

### 7.3 削除確認

- サーバー一覧から消えていることを確認
- 翌日、ConoHaから課金メールが来ていないか確認

---

## クイックリファレンス

### よく使うコマンド

```bash
# サーバー接続
ssh root@（IPアドレス）

# アプリ起動
cd /opt/BingoApps && docker compose up -d

# アプリ停止
cd /opt/BingoApps && docker compose down

# ログ確認
cd /opt/BingoApps && docker compose logs -f

# 再起動
cd /opt/BingoApps && docker compose restart

# 再ビルド（コード更新後）
cd /opt/BingoApps && git pull && docker compose up -d --build

# Nginx 再起動
systemctl restart nginx

# ヘルスチェック
curl https://t-bingo.com/health
```

### 重要な情報（メモしておく）

| 項目 | 値 |
|-----|---|
| ドメイン | t-bingo.com |
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
4. 次回は「2. サーバー作成」から開始
5. DNSのAレコードを新しいIPアドレスに更新
