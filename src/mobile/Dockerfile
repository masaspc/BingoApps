# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# ソースコードをコピー
COPY . .

# Expo Web ビルド
RUN npm run build:web

# Production stage
FROM nginx:alpine

# ビルド成果物をコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
