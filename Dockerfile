# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates tzdata \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV TZ=America/Edmonton
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "scripts/start.sh"]
