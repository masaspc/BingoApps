FROM node:20-alpine

# Prisma に必要な OpenSSL ライブラリをインストール
RUN apk add --no-cache openssl

WORKDIR /app

# 依存関係ファイルをコピー（コンテキストは ./src）
COPY server/package*.json ./
COPY server/prisma ./prisma/

# 依存関係インストール（ビルドに必要なdevDependenciesも含む）
RUN npm install

# Prisma クライアント生成
RUN npx prisma generate

# ソースコードをコピー
COPY server/src ./src/
COPY server/tsconfig.json ./
COPY shared ./shared/

# TypeScript ビルド
RUN npm run build

# 本番用に再インストール（devDependenciesを除外）
RUN rm -rf node_modules && npm install --omit=dev

# Prisma クライアント再生成（node_modules削除後）
RUN npx prisma generate

# データディレクトリ作成
RUN mkdir -p /app/data

# 環境変数
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/bingo.db"
ENV PORT=3000

EXPOSE 3000

# マイグレーション実行後にサーバー起動
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
