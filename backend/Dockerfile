FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY knexfile.js ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx knex migrate:latest && node src/server.js"]
