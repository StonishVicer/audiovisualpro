FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@10.21.0 --activate && pnpm install --frozen-lockfile

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/server.js"]
