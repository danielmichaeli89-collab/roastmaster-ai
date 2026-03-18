FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/knexfile.js ./

RUN npm ci --omit=dev

COPY backend/src ./src

EXPOSE 3000

CMD ["sh", "-c", "npx knex migrate:latest && node src/server.js"]
