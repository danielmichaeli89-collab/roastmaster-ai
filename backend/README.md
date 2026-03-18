# RoastMaster AI Backend

An AI-powered coffee roasting control system backend built with Node.js, Express, PostgreSQL, and Claude AI.

## Features

- **Authentication**: JWT-based user authentication with bcryptjs password hashing
- **Green Coffee Management**: Inventory tracking with detailed origin and processing data
- **Roast Profiles**: Create and manage roasting profiles with multi-phase control
- **Real-time Monitoring**: WebSocket-based live roasting data with anomaly detection
- **AI Integration**: Claude API for profile generation and roast analysis
- **Analytics**: Dashboard, trends, and comparative analysis of roasts
- **CSV Import**: ROEST Connect CSV export parsing and import
- **Comprehensive Database**: PostgreSQL with 9 tables tracking all roasting data

## Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── migrations/      # Database migrations
├── routes/          # API route definitions
├── services/        # Business logic services
├── socket-handlers.js    # WebSocket event handlers
└── server.js            # Express server setup
```

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Anthropic API Key

### Setup

1. Clone and install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/roastmaster_ai
JWT_SECRET=your_secret_key_here
ANTHROPIC_API_KEY=sk-ant-...
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Green Coffees
- `GET /api/coffees` - List all coffees
- `GET /api/coffees/:id` - Get specific coffee
- `POST /api/coffees` - Create new coffee
- `PUT /api/coffees/:id` - Update coffee
- `DELETE /api/coffees/:id` - Delete coffee

### Roast Profiles
- `GET /api/profiles` - List all profiles
- `GET /api/profiles/:id` - Get specific profile
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile
- `POST /api/profiles/generate` - Generate AI profile

### Roasts
- `GET /api/roasts` - List all roasts
- `GET /api/roasts/:id` - Get specific roast with data
- `POST /api/roasts` - Create new roast
- `PUT /api/roasts/:id` - Update roast
- `DELETE /api/roasts/:id` - Delete roast
- `POST /api/roasts/:id/start` - Start roasting
- `POST /api/roasts/:id/stop` - Stop roasting
- `POST /api/roasts/:id/data-point` - Record temperature/sensor data
- `POST /api/roasts/:id/event` - Record roast event
- `POST /api/roasts/:id/analyze` - AI analysis of completed roast

### Import
- `POST /api/import/csv` - Import ROEST CSV export

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/trends` - Roast trends (configurable days)
- `GET /api/analytics/comparison` - Compare multiple roasts

### AI Services
- `POST /api/ai/analyze-roast` - Post-roast AI analysis
- `POST /api/ai/generate-profile` - Generate roast profile from coffee
- `POST /api/ai/real-time-check` - Real-time anomaly detection
- `POST /api/ai/compare-roasts` - Comparative analysis of multiple roasts

## WebSocket Events

### Client to Server
- `roast:join` - Join a roast monitoring session
- `roast:data-point` - Send temperature/control data
- `roast:event` - Record a roast event (1st crack, drop, etc.)
- `roast:ai-recommendation` - Request AI recommendation
- `roast:control-change` - Broadcast control adjustment
- `roast:leave` - Leave roast session

### Server to Client
- `roast:joined` - Confirmation of joined roast
- `roast:data-update` - Temperature/sensor data broadcast
- `roast:anomaly` - Anomaly detected
- `roast:recommendation` - AI recommendation response
- `roast:control-update` - Control change broadcast
- `roast:event-recorded` - Event confirmation
- `error` - Error message

## Database Schema

### Users
- id, email, password_hash, name, role, timestamps

### Green Coffees
- Full origin/processing data, altitude, moisture, density, flavor notes

### Roast Profiles
- Multi-phase roasting profiles stored as JSONB
- AI-generated flag and reasoning

### Roasts
- Complete roast execution data
- Temperature metrics and development time
- Status tracking (planned/in_progress/completed/failed)

### Temperature Logs
- Per-second granular roasting data
- All sensor readings: bean, air, inlet, drum, exhaust temps
- RoR calculations

### Roast Events
- First crack, second crack, yellowing, drop, anomalies
- Auto-detected or manual

### Anomaly Logs
- RoR crashes, stalling, temperature deviations
- AI-generated analysis with severity levels
- Suggested corrective actions

### AI Analyses
- Pre-roast, real-time, post-roast, comparative analyses
- Claude API responses with recommendations

### Cupping Notes
- SCA cupping scores and flavor descriptors

## AI Integration

The system integrates Claude 3.5 Sonnet for:

1. **Profile Generation**: Creates optimized roasting profiles based on coffee characteristics
2. **Real-time Monitoring**: Detects anomalies during roasting with corrective suggestions
3. **Post-roast Analysis**: Comprehensive roast evaluation and improvement recommendations
4. **Comparative Analysis**: Identifies patterns across multiple roasts

## Anomaly Detection

Built-in anomaly detection monitors:
- RoR crashes (sudden drops >2°C/min)
- Stalling (RoR approaching 0)
- Temperature deviations (>5°C warning, >10°C critical)
- Development time concerns (>25%)
- Drum pressure issues

## Authentication

All endpoints except `/health` require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token obtained from `/api/auth/login` or `/api/auth/register`.

## Deployment

### Docker Build
```bash
docker build -t roastmaster-backend .
```

### Railway Deployment
1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

## Environment Variables

```
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=5000
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CORS_ORIGIN=https://yourdomain.com
SOCKET_IO_CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp
LOG_LEVEL=info
```

## Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

### Database Commands
```bash
npm run migrate          # Run pending migrations
npm run migrate:rollback # Rollback last migration
npm run seed            # Run seeders
```

## Performance Optimization

- Indexed database queries on frequently filtered columns
- JSON response caching for analytics
- Efficient WebSocket broadcasting with rooms
- Connection pooling via knex
- Gzip compression enabled

## Security

- JWT token authentication
- bcryptjs password hashing
- Input validation on all endpoints
- CORS configuration
- SQL injection protection via parameterized queries
- XSS protection via JSON content-type

## Monitoring

- Health check endpoint at `/health`
- Error logging with full stack traces
- WebSocket connection logging
- Database query logging in development

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

Proprietary - RoastMaster AI System
