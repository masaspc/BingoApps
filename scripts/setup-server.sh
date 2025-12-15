#!/bin/bash
#
# Bingo App サーバーセットアップスクリプト
# ConoHa VPS (Ubuntu 22.04) 用
#
# 使い方:
#   curl -fsSL https://raw.githubusercontent.com/masaspc/BingoApps/main/scripts/setup-server.sh | bash
#
# または:
#   wget -qO- https://raw.githubusercontent.com/masaspc/BingoApps/main/scripts/setup-server.sh | bash
#

set -e

echo "============================================"
echo "  Bingo App サーバーセットアップ"
echo "  ドメイン: t-bingo.com"
echo "============================================"
echo ""

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# root 確認
if [ "$EUID" -ne 0 ]; then
    log_error "root ユーザーで実行してください"
    log_info "実行コマンド: sudo bash setup-server.sh"
    exit 1
fi

# Step 1: システム更新
log_info "Step 1/5: システムを更新中..."
apt update -qq
apt upgrade -y -qq
log_info "システム更新完了"

# Step 2: Docker インストール
log_info "Step 2/5: Docker をインストール中..."
if command -v docker &> /dev/null; then
    log_warn "Docker は既にインストールされています"
else
    curl -fsSL https://get.docker.com | sh
    log_info "Docker インストール完了"
fi

# Step 3: アプリをダウンロード
log_info "Step 3/5: アプリをダウンロード中..."
cd /opt

if [ -d "BingoApps" ]; then
    log_warn "BingoApps ディレクトリが既に存在します。更新します..."
    cd BingoApps
    git pull
else
    git clone https://github.com/masaspc/BingoApps.git
    cd BingoApps
fi
log_info "ダウンロード完了"

# Step 4: アプリを起動
log_info "Step 4/5: アプリを起動中..."
docker compose up -d --build

# 起動待ち
log_info "起動を待っています..."
sleep 15

# ヘルスチェック
if curl -s http://localhost:3000/health | grep -q "ok"; then
    log_info "アプリ起動完了"
else
    log_error "アプリの起動に失敗した可能性があります"
    log_info "ログを確認してください: docker compose logs"
fi

# Step 5: ファイアウォール設定
log_info "Step 5/5: ファイアウォールを設定中..."
ufw allow 22 > /dev/null 2>&1
ufw allow 80 > /dev/null 2>&1
ufw allow 443 > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
log_info "ファイアウォール設定完了"

# 完了メッセージ
echo ""
echo "============================================"
echo -e "${GREEN}  セットアップ完了！${NC}"
echo "============================================"
echo ""

# IPアドレスを取得
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo "サーバー情報:"
echo "  IP アドレス: ${SERVER_IP}"
echo "  ドメイン: t-bingo.com"
echo ""
echo "次のステップ:"
echo "  1. DNSのAレコードを ${SERVER_IP} に設定"
echo "  2. Nginx + SSL の設定（docs/deployment-conoha.md 参照）"
echo "  3. https://t-bingo.com でアクセス確認"
echo ""
echo "管理コマンド:"
echo "  ログ確認:   cd /opt/BingoApps && docker compose logs -f"
echo "  再起動:     cd /opt/BingoApps && docker compose restart"
echo "  停止:       cd /opt/BingoApps && docker compose down"
echo ""
echo -e "${YELLOW}注意: 大会終了後は ConoHa でサーバーを削除してください！${NC}"
echo ""
