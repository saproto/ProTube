FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install
RUN cd client && npm install

COPY . .
RUN cd client && npm run build --if-present


FROM node:24-alpine AS runner

WORKDIR /app
COPY enums.json ./enums.json

WORKDIR /app/server

COPY server/package*.json ./

RUN npm ci --omit=dev

COPY server/ .

COPY --from=builder /app/server/public ./public

USER node

CMD ["node", "app.js"]
