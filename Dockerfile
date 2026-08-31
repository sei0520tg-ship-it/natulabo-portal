# NatuLabo Portal — どのホスティングでも動く標準的なNodeイメージ。
# Railway / Render / Fly.io / Cloud Run いずれもこのままビルドできる。

FROM node:22-slim AS build
WORKDIR /app

# pnpm を package.json の packageManager 指定どおりに用意する
RUN corepack enable

# 依存だけ先に入れてレイヤーキャッシュを効かせる
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ── 実行用の軽量イメージ ──
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
# 本番に不要な開発依存は入れない
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

# ホスティング側が割り当てるポートを尊重する（未指定なら3000）
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
