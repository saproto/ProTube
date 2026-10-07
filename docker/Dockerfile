FROM node:24-alpine AS builder

WORKDIR /protube

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install
RUN cd client && npm install
RUN cd server && npm install

COPY . .

ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build


FROM node:24-alpine AS runner

WORKDIR /protube/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /protube/server ./

USER node

CMD ["node", "app.js"]
