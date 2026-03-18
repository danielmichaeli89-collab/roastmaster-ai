FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY knexfile.js .

EXPOSE 3000

CMD ["sh", "-c", "npx knex migrate:latest && node src/server.js"]
