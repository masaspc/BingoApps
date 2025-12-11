FROM node:20-alpine

WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./
COPY prisma ./prisma/

# 依存関係インストール
RUN npm ci --only=production

# Prisma クライアント生成
RUN npx prisma generate

# ソースコードをコピー
COPY . .

# TypeScript ビルド
RUN npm run build

# データディレクトリ作成
RUN mkdir -p /app/data

# 環境変数
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/bingo.db"
ENV PORT=3000

EXPOSE 3000

# マイグレーション実行後にサーバー起動
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
