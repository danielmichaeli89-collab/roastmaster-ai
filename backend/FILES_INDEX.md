# RoastMaster AI Backend - Files Index

## Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | NPM dependencies and scripts |
| `knexfile.js` | Database migration configuration |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore patterns |
| `Dockerfile` | Production Docker image |
| `docker-compose.yml` | Local development environment |
| `README.md` | Project documentation |
| `API_GUIDE.md` | Complete API reference |
| `BUILD_SUMMARY.md` | Build completion summary |

## Source Code Structure

### `/src/config`
- `database.js` - Database connection initialization

### `/src/middleware`
- `auth.js` - JWT authentication and authorization
- `errorHandler.js` - Central error handling middleware

### `/src/migrations` (Database)
1. `001_create_users_table.js` - Users for authentication
2. `002_create_green_coffees_table.js` - Coffee inventory
3. `003_create_roast_profiles_table.js` - Roasting profiles
4. `004_create_roasts_table.js` - Roast execution records
5. `005_create_temperature_logs_table.js` - Sensor data (per-second)
6. `006_create_roast_events_table.js` - Roast events (first crack, drop, etc.)
7. `007_create_anomaly_logs_table.js` - AI-detected anomalies
8. `008_create_ai_analyses_table.js` - Claude AI analysis results
9. `009_create_cupping_notes_table.js` - Cupping scores and notes

### `/src/services` (Business Logic)
- `ai.service.js` - Claude API integration
  * `generateRoastProfile()` - AI-powered profile creation
  * `analyzeRoastRealTime()` - Real-time anomaly detection
  * `analyzeRoastPost()` - Post-roast comprehensive analysis
  * `comparativeAnalysis()` - Multi-roast learning

- `roast-monitor.service.js` - Real-time monitoring
  * `RoastMonitor` class for anomaly detection
  * RoR crash, stalling, deviation detection
  * Pressure monitoring

- `csv-parser.service.js` - ROEST CSV import
  * CSV parsing and validation
  * RoR calculation
  * Event auto-detection

- `analytics.service.js` - Data aggregation
  * Dashboard metrics
  * Trend analysis
  * Comparative analysis

### `/src/controllers` (Request Handlers)
- `auth.controller.js` - Authentication endpoints
  * `register()` - New user registration
  * `login()` - User login
  * `getCurrentUser()` - Fetch current user

- `coffees.controller.js` - Green coffee management
  * `listCoffees()` - GET all coffees
  * `getCoffee()` - GET specific coffee
  * `createCoffee()` - POST new coffee
  * `updateCoffee()` - PUT update coffee
  * `deleteCoffee()` - DELETE coffee

- `profiles.controller.js` - Roast profile management
  * `listProfiles()` - GET all profiles
  * `getProfile()` - GET specific profile
  * `createProfile()` - POST new profile
  * `updateProfile()` - PUT update profile
  * `deleteProfile()` - DELETE profile
  * `generateProfileAI()` - POST AI-generated profile

- `roasts.controller.js` - Roast lifecycle
  * `listRoasts()` - GET all roasts with filtering
  * `getRoast()` - GET complete roast data
  * `createRoast()` - POST new roast
  * `startRoast()` - POST start roasting
  * `stopRoast()` - POST stop roasting
  * `recordDataPoint()` - POST temperature/sensor data
  * `recordEvent()` - POST roast event
  * `analyzeRoast()` - POST AI analysis
  * `updateRoast()` - PUT update roast
  * `deleteRoast()` - DELETE roast (cascade)

- `import.controller.js` - Data import
  * `importRoestCSV()` - POST CSV file import

- `analytics.controller.js` - Analytics endpoints
  * `getDashboard()` - GET dashboard data
  * `getTrends()` - GET roast trends
  * `getComparison()` - GET comparative analysis

- `ai.controller.js` - AI service endpoints
  * `analyzeRoast()` - POST roast analysis
  * `generateProfile()` - POST profile generation
  * `checkRealTime()` - POST real-time analysis
  * `compareRoasts()` - POST multi-roast comparison

### `/src/routes` (API Routes)
- `auth.routes.js` - Auth endpoints
  * POST /register
  * POST /login
  * GET /me

- `coffees.routes.js` - Coffee endpoints
  * GET / - list
  * GET /:id - specific
  * POST / - create
  * PUT /:id - update
  * DELETE /:id - delete

- `profiles.routes.js` - Profile endpoints
  * GET / - list
  * GET /:id - specific
  * POST / - create
  * POST /generate - AI generate
  * PUT /:id - update
  * DELETE /:id - delete

- `roasts.routes.js` - Roast endpoints
  * GET / - list with filters
  * POST / - create
  * GET /:id - specific with all data
  * PUT /:id - update
  * DELETE /:id - delete
  * POST /:id/start - start roast
  * POST /:id/stop - stop roast
  * POST /:id/data-point - record data
  * POST /:id/event - record event
  * POST /:id/analyze - AI analysis

- `import.routes.js` - Import endpoints
  * POST /csv - CSV import

- `analytics.routes.js` - Analytics endpoints
  * GET /dashboard - dashboard
  * GET /trends - trends
  * GET /comparison - comparative

- `ai.routes.js` - AI endpoints
  * POST /analyze-roast - roast analysis
  * POST /generate-profile - profile generation
  * POST /real-time-check - real-time analysis
  * POST /compare-roasts - roast comparison

### Root Level
- `server.js` - Express/Socket.io server setup
- `socket-handlers.js` - WebSocket event handlers
  * `roast:join` - Join roast session
  * `roast:leave` - Leave roast session
  * `roast:data-point` - Receive sensor data
  * `roast:event` - Record roast event
  * `roast:ai-recommendation` - Get AI recommendation
  * `roast:control-change` - Control adjustment

## File Statistics

| Category | Count | Files |
|----------|-------|-------|
| Migrations | 9 | Database tables |
| Controllers | 8 | Request handlers |
| Routes | 7 | API endpoints |
| Services | 4 | Business logic |
| Middleware | 2 | Express middleware |
| Config | 1 | Database config |
| Handlers | 1 | WebSocket |
| Server | 1 | Express setup |
| Documentation | 4 | README, API, Build, Index |
| Config Files | 6 | package.json, Dockerfile, etc. |

**Total: 47 files**

## Code Organization

### By Feature
- **Authentication**: auth.controller, auth.routes, auth middleware
- **Inventory**: coffees.controller, coffees.routes
- **Profiles**: profiles.controller, profiles.routes, ai.service (generation)
- **Roasting**: roasts.controller, roasts.routes, roast-monitor.service, socket-handlers
- **Analytics**: analytics.controller, analytics.routes, analytics.service
- **Import**: import.controller, import.routes, csv-parser.service
- **AI**: ai.controller, ai.routes, ai.service

### By Layer
- **Presentation**: routes/ (7 files)
- **Business Logic**: controllers/ (8 files) + services/ (4 files)
- **Data Access**: migrations/ (9 files) + config/database.js
- **Infrastructure**: middleware/ (2 files) + server.js + socket-handlers.js

## Key Integration Points

1. **Database**: All controllers/services use knex.js through config/database.js
2. **Authentication**: All protected routes use middleware/auth.js
3. **Real-time**: Socket.io integrated in server.js + socket-handlers.js
4. **AI**: Multiple services call ai.service.js functions
5. **Error Handling**: middleware/errorHandler.js catches all errors

## API Coverage

- **32+ REST endpoints** across 7 route files
- **6 WebSocket events** in socket-handlers.js
- **4 AI functions** in ai.service.js
- **4 monitoring functions** in roast-monitor.service.js
- **3 analytics functions** in analytics.service.js

## Production Deployment

For Railway deployment:
1. Dockerfile (provided)
2. Environment variables via Railway dashboard
3. PostgreSQL database (Railway managed)
4. All code is production-ready
