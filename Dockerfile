# ベースイメージとしてNode.jsを使用
FROM node:22-slim

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json ./

# パッケージをインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# 開発用サーバを起動
CMD ["npm", "run", "dev"]
