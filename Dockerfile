FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/

COPY enums.json .
COPY eslint.config.mjs .

RUN npm ci --ignore-scripts
RUN cd client && npm ci

COPY client/ ./client

ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN cd client && npm run build --if-present


FROM node:24-alpine AS runner

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY enums.json .

WORKDIR /app/server

COPY server/package*.json ./

RUN npm ci --omit=dev

COPY server/ .

COPY --from=builder /app/server/public ./public

USER appuser

EXPOSE 3000

CMD ["node", "app.js"]
