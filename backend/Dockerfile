FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/knexfile.js ./

RUN npm ci --omit=dev

COPY backend/src ./src

# Expose the port the server runs on (default 5000, configurable via PORT env var)
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npx knex migrate:latest || echo 'Migration warning (continuing)'; node src/server.js"]
