# ベースイメージとしてNode.jsを使用
FROM node:22-slim

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json ./

# 開発用サーバの起動前にnpm installを実行
CMD npm install && npm run dev
