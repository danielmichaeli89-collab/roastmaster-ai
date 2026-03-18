# RoastMaster AI Backend - Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Anthropic API Key

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Using Docker Compose (Recommended)

```bash
docker-compose up
```

This starts:
- PostgreSQL database on port 5432
- PgAdmin on port 5050
- Node.js backend on port 5000

PgAdmin credentials: admin@roastmaster.local / admin

## Production Deployment (Railway)

### Prerequisites
- GitHub account with repository
- Railway.app account
- PostgreSQL database (Railway managed)
- Anthropic API key

### Deployment Steps

1. **Create GitHub Repository**
   - Push your code to GitHub
   - Ensure `.env.example` is in repo (not `.env`)

2. **Connect to Railway**
   - Sign in to railway.app
   - Click "New Project"
   - Select "GitHub Repo"
   - Authorize and select your repository

3. **Configure Services**
   - Railway will detect Node.js project
   - Create PostgreSQL database in same project

4. **Set Environment Variables**
   In Railway dashboard, add:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<generate-long-random-string>
   ANTHROPIC_API_KEY=sk-ant-...
   CLAUDE_MODEL=claude-3-5-sonnet-20241022
   CORS_ORIGIN=https://yourdomain.com
   SOCKET_IO_CORS_ORIGIN=https://yourdomain.com
   ```

5. **Database Connection**
   - Railway automatically creates `DATABASE_URL`
   - Migrations run automatically on first deploy

6. **Deploy**
   - Push to main/master branch
   - Railway automatically deploys
   - Check logs in Railway dashboard

### Database Migrations on Deploy

Add to `package.json` scripts:
```json
"postinstall": "npm run migrate"
```

Or manually run in Railway bash:
```bash
npm run migrate
```

## Environment Variables

### Required
```
ANTHROPIC_API_KEY=sk-ant-...      # Claude API key
DATABASE_URL=postgresql://...     # Database connection
JWT_SECRET=<long-random-string>   # JWT signing key
```

### Recommended
```
NODE_ENV=production
PORT=5000
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
SOCKET_IO_CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Optional
```
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=/tmp
```

## Database Setup

### PostgreSQL Connection

For Railway:
```
postgresql://user:password@host:5432/database
```

For local:
```
postgresql://postgres:password@localhost:5432/roastmaster_ai
```

### Run Migrations

```bash
# Apply pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Run seeders (if available)
npm run seed
```

## SSL/TLS Configuration

### Using Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.roastmaster.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Railway SSL

Railway automatically provides SSL for custom domains:
1. Add domain in Railway settings
2. Configure DNS records
3. SSL automatically provisioned via Let's Encrypt

## Performance Optimization

### Database Connection Pooling
Configured in knexfile.js - uses default pool of 2-10 connections

### Enable Compression
Add nginx gzip compression:
```nginx
gzip on;
gzip_types application/json;
gzip_min_length 1000;
```

### Caching Headers
```nginx
add_header Cache-Control "public, max-age=3600";
```

## Monitoring & Logging

### Health Check Endpoint
```
GET /health
GET /api/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-03-18T..."
}
```

### Logs

Development: Printed to console
Production: Should be configured with:
- Winston
- Sentry
- DataDog
- CloudWatch

### Error Tracking

Set up Sentry for error tracking:

```bash
npm install @sentry/node
```

In server.js:
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Backup Strategy

### Database Backups
Railway automatically handles backups.

For manual backups:
```bash
pg_dump postgresql://user:pass@host:5432/db > backup.sql
```

### File Upload Backups
CSV uploads stored in `/uploads` directory.
For production, use S3 or similar:

```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

// Upload CSV to S3
```

## Scaling Considerations

### Current Architecture
- Single Node.js process
- PostgreSQL single instance
- Socket.io uses default in-memory adapter

### For Production Scaling

1. **Horizontal Scaling**
   - Use Socket.io with Redis adapter for multiple instances
   - Load balance with nginx/HAProxy

2. **Database Scaling**
   - Read replicas for analytics queries
   - Connection pooling with PgBouncer

3. **Caching**
   - Redis for session storage
   - Cache dashboard queries

4. **Job Queue**
   - Bull/RabbitMQ for AI analysis jobs
   - Background processing

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql postgresql://user:pass@host:5432/db -c "SELECT 1"

# Check migrations status
knex migrate:list
```

### Socket.io Issues
- Check CORS settings match frontend domain
- Verify WebSocket support in reverse proxy
- Check browser console for connection errors

### Claude API Errors
- Verify ANTHROPIC_API_KEY is correct
- Check API quota/limits
- Test with curl:
```bash
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/models
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific domains
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Monitor error logs
- [ ] Rate limit sensitive endpoints
- [ ] Enable audit logging

## Cost Optimization

### Railway Pricing
- PostgreSQL: ~$15/month starter
- Node.js: Pay per usage (~$0.000925/hour)
- Estimate: $20-50/month for small deployment

### Optimization Tips
- Use railway's built-in PostgreSQL
- Deploy only main branch
- Use horizontal auto-scaling sparingly
- Monitor usage in Railway dashboard

## Support & Documentation

- Railway Docs: https://railway.app/docs
- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/docs/
- Socket.io: https://socket.io/docs/
- Anthropic: https://docs.anthropic.com/

## Rollback Plan

If deployment fails:

1. **Check logs in Railway dashboard**
2. **Rollback to previous deployment:**
   - Railway: Click "Revert" on previous deployment
3. **Database rollback (if migrations failed):**
   ```bash
   npm run migrate:rollback
   ```
4. **Contact support with error details**
