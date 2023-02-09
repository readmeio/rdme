FROM node:16

COPY . .

RUN npm ci && npm run build
