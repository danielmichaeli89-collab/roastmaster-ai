# RoastMaster AI - API Guide

Complete API reference for the RoastMaster AI backend system.

## Base URL

Development: `http://localhost:5000/api`
Production: `https://api.roastmaster.com/api`

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are JSON with the following structure:

### Success (200, 201)
```json
{
  "id": "uuid",
  "field": "value",
  ...
}
```

### Error (400, 401, 404, 500)
```json
{
  "error": "Error message description"
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Roaster"
}
```

**Response:** (201 Created)
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Roaster",
    "role": "roaster"
  },
  "token": "eyJhbGc..."
}
```

### POST /auth/login

Authenticate user and get token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:** (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Roaster",
    "role": "roaster"
  },
  "token": "eyJhbGc..."
}
```

### GET /auth/me

Get current authenticated user.

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Roaster",
  "role": "roaster"
}
```

---

## Green Coffee Endpoints

### GET /coffees

List all green coffees for the user.

**Query Parameters:**
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:** (200 OK) - Array of coffee objects

### GET /coffees/:id

Get specific green coffee details.

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Ethiopian Yirgacheffe",
  "origin_country": "Ethiopia",
  "region": "Yirgacheffe",
  "farm": "Bedere Farm",
  "variety": "Heirloom",
  "processing_method": "Washed",
  "altitude": 2000,
  "moisture_content": 11.5,
  "density": 7.8,
  "screen_size": 17,
  "harvest_year": 2023,
  "flavor_notes": "Blueberry, tea, floral",
  "quantity_kg": 50.0,
  "notes": "Excellent clarity",
  "created_at": "2026-03-18T...",
  "roast_count": 12
}
```

### POST /coffees

Create new green coffee inventory entry.

**Request:**
```json
{
  "name": "Colombian Huila",
  "origin_country": "Colombia",
  "region": "Huila",
  "farm": "La Foresta",
  "variety": "Bourbon",
  "processing_method": "Washed",
  "altitude": 1800,
  "moisture_content": 10.8,
  "density": 7.5,
  "screen_size": 16,
  "harvest_year": 2023,
  "flavor_notes": "Chocolate, caramel, mild acidity",
  "quantity_kg": 100.0,
  "notes": "Premium lot"
}
```

**Response:** (201 Created) - Created coffee object

### PUT /coffees/:id

Update green coffee.

**Request:** (any/all fields)
```json
{
  "quantity_kg": 45.0,
  "notes": "Updated notes"
}
```

**Response:** (200 OK) - Updated coffee object

### DELETE /coffees/:id

Delete green coffee (only if no roasts exist).

**Response:** (200 OK)
```json
{
  "message": "Coffee deleted"
}
```

---

## Roast Profile Endpoints

### GET /profiles

List all roast profiles.

**Response:** (200 OK) - Array of profile objects

### GET /profiles/:id

Get specific roast profile.

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Ethiopian Bright",
  "coffee_type": "Ethiopia - Heirloom",
  "target_flavor": "Fruity with bright acidity",
  "charge_temp": 195,
  "phases": [
    {
      "name": "Drying",
      "target_temp": 160,
      "power": 100,
      "airflow": 40,
      "rpm": 50,
      "duration": 180,
      "description": "Remove surface moisture..."
    },
    {
      "name": "Maillard",
      "target_temp": 185,
      "power": 85,
      "airflow": 50,
      "rpm": 55,
      "duration": 120
    },
    {
      "name": "Development",
      "target_temp": 210,
      "power": 70,
      "airflow": 60,
      "rpm": 60,
      "duration": 90
    }
  ],
  "total_duration_target": 600,
  "development_time_pct": 20.0,
  "ai_generated": true,
  "ai_reasoning": "This profile emphasizes...",
  "created_at": "2026-03-18T...",
  "roast_count": 5
}
```

### POST /profiles

Create manual roast profile.

**Request:**
```json
{
  "name": "Test Profile",
  "coffee_type": "Brazilian",
  "target_flavor": "Balanced",
  "charge_temp": 200,
  "phases": [
    {
      "name": "Drying",
      "target_temp": 160,
      "power": 100,
      "airflow": 40,
      "rpm": 50,
      "duration": 180
    }
  ],
  "total_duration_target": 600,
  "development_time_pct": 20,
  "notes": "Testing profile"
}
```

**Response:** (201 Created) - Created profile object

### POST /profiles/generate

Generate AI-powered roast profile.

**Request:**
```json
{
  "green_coffee_id": "uuid",
  "target_flavor": "Bright and fruity with clean finish"
}
```

**Response:** (201 Created) - AI-generated profile with reasoning

### PUT /profiles/:id

Update roast profile.

**Response:** (200 OK) - Updated profile object

### DELETE /profiles/:id

Delete roast profile (only if no roasts exist).

**Response:** (200 OK)

---

## Roast Endpoints

### GET /roasts

List all roasts.

**Query Parameters:**
- `status`: planned|in_progress|completed|failed
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:** (200 OK) - Array of roast objects

### GET /roasts/:id

Get complete roast data with all logs and events.

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "profile_id": "uuid",
  "green_coffee_id": "uuid",
  "status": "completed",
  "batch_weight_g": 500,
  "charge_temp": 195,
  "start_time": "2026-03-18T...",
  "end_time": "2026-03-18T...",
  "total_duration": 630,
  "first_crack_time": "2026-03-18T...",
  "drop_time": "2026-03-18T...",
  "development_time": 120,
  "development_pct": 19.0,
  "weight_loss_pct": 18.5,
  "final_color": "medium",
  "notes": "Good roast",
  "temperatureLogs": [
    {
      "id": "uuid",
      "roast_id": "uuid",
      "timestamp": "2026-03-18T...",
      "elapsed_seconds": 1,
      "bean_temp_1": 150.5,
      "bean_temp_2": 151.0,
      "air_temp": 180,
      "drum_pressure": 0.85,
      "ror_bt": 2.5,
      "phase": "drying"
    }
  ],
  "events": [
    {
      "id": "uuid",
      "event_type": "first_crack",
      "elapsed_seconds": 420,
      "temperature": 196.0,
      "auto_detected": true
    }
  ],
  "anomalies": [
    {
      "id": "uuid",
      "anomaly_type": "ror_crash",
      "severity": "warning",
      "elapsed_seconds": 300,
      "description": "RoR dropped by 2.5°C/min"
    }
  ]
}
```

### POST /roasts

Create new roast (plan).

**Request:**
```json
{
  "profile_id": "uuid",
  "green_coffee_id": "uuid",
  "batch_weight_g": 500,
  "charge_temp": 195,
  "ambient_temperature": 22,
  "ambient_humidity_percent": 45
}
```

**Response:** (201 Created) - Created roast object

### POST /roasts/:id/start

Start a planned roast.

**Response:** (200 OK)
```json
{
  "status": "in_progress",
  "start_time": "2026-03-18T..."
}
```

### POST /roasts/:id/stop

Stop an in-progress roast.

**Response:** (200 OK)
```json
{
  "status": "completed",
  "end_time": "2026-03-18T...",
  "total_duration": 630
}
```

### POST /roasts/:id/data-point

Record temperature/sensor data point.

**Request:**
```json
{
  "elapsed_seconds": 120,
  "bean_temp_1": 155.0,
  "bean_temp_2": 154.8,
  "air_temp": 185,
  "inlet_temp": 200,
  "drum_temp": 175,
  "exhaust_temp": 95,
  "drum_pressure": 0.85,
  "ror_bt": 2.3,
  "ror_et": 1.5,
  "power_pct": 95,
  "airflow_pct": 40,
  "rpm": 50,
  "phase": "drying"
}
```

**Response:** (201 Created) - Recorded data point

### POST /roasts/:id/event

Record roast event (first crack, second crack, drop, etc.).

**Request:**
```json
{
  "event_type": "first_crack",
  "elapsed_seconds": 420,
  "temperature": 196.0,
  "description": "First crack heard clearly",
  "auto_detected": false
}
```

**Response:** (201 Created) - Recorded event

### POST /roasts/:id/analyze

AI analysis of completed roast.

**Response:** (201 Created)
```json
{
  "overall_assessment": "Well-executed roast...",
  "maillard_development": {
    "assessment": "Adequate Maillard reaction",
    "indicators": "..."
  },
  "first_crack_analysis": {
    "timing": "Within expected range",
    "quality": "Smooth progression"
  },
  "flavor_trajectory": {
    "predicted_flavor": "Balanced with subtle fruit notes",
    "expected_notes": ["caramel", "chocolate", "apple"]
  },
  "next_roast_guidance": {
    "temperature_adjustment": 0,
    "development_time_adjustment": -10,
    "rationale": "Development was slightly long",
    "expected_impact": "More acidity preservation"
  }
}
```

### PUT /roasts/:id

Update roast details.

**Request:**
```json
{
  "notes": "Updated notes",
  "final_color": "dark"
}
```

**Response:** (200 OK) - Updated roast object

### DELETE /roasts/:id

Delete roast and all related data.

**Response:** (200 OK)

---

## Import Endpoints

### POST /import/csv

Import ROEST CSV export file.

**Request:** (multipart/form-data)
- `file`: CSV file from ROEST Connect

**Response:** (201 Created)
```json
{
  "message": "CSV imported successfully",
  "roast": { ... },
  "recordCount": 450
}
```

---

## Analytics Endpoints

### GET /analytics/dashboard

Get dashboard overview data.

**Response:** (200 OK)
```json
{
  "totalRoasts": 42,
  "completedRoasts": 40,
  "failedRoasts": 2,
  "successRate": "95.2",
  "avgDevelopmentPct": "19.8",
  "recentRoasts": [...],
  "coffeeInventory": [...],
  "recentAnomalies": [...]
}
```

### GET /analytics/trends

Get roasting trends over time.

**Query Parameters:**
- `days`: number (default: 30)

**Response:** (200 OK)
```json
{
  "timeline": [
    { "date": "2026-02-16", "roast_count": 2 }
  ],
  "developmentTrend": [
    { "date": "2026-02-16", "value": "19.5" }
  ],
  "temperatureTrend": [...],
  "weightLossTrend": [...],
  "averageRoastDuration": "630",
  "consistencyScore": 87
}
```

### GET /analytics/comparison

Compare roasts by coffee.

**Query Parameters:**
- `coffee_ids`: comma-separated UUIDs
- `days`: number (default: 90)

**Response:** (200 OK)
```json
{
  "analysis_period_days": 90,
  "coffees_analyzed": 3,
  "total_roasts_analyzed": 15,
  "comparison": {
    "Ethiopian Yirgacheffe": {
      "roast_count": 5,
      "avg_development": "20.2",
      "avg_charge_temp": "195.0",
      "avg_weight_loss": "18.2",
      "development_consistency": "1.25",
      "optimal_development": "20.5",
      "improvement_trend": "improving"
    }
  }
}
```

---

## AI Endpoints

### POST /ai/analyze-roast

Deep AI analysis of a completed roast.

**Request:**
```json
{
  "roast_id": "uuid"
}
```

**Response:** (201 Created) - Comprehensive analysis

### POST /ai/generate-profile

Generate roast profile from coffee characteristics.

**Request:**
```json
{
  "green_coffee_id": "uuid",
  "target_flavor": "Bright and fruity"
}
```

**Response:** (201 Created) - AI-generated profile

### POST /ai/real-time-check

Check for anomalies during active roast.

**Request:**
```json
{
  "roast_id": "uuid",
  "current_data": {
    "elapsed_seconds": 120,
    "bean_temp_1": 155.0,
    "ror_bt": 2.3,
    "phase": "drying"
  },
  "profile_target": {
    "target_temp": 160,
    "target_ror": 2.5
  }
}
```

**Response:** (200 OK)
```json
{
  "is_anomaly": false,
  "severity": "info",
  "anomaly_type": null,
  "description": "Roast progressing normally",
  "immediate_action": null,
  "confidence": 0.95
}
```

### POST /ai/compare-roasts

AI comparison of multiple roasts.

**Request:**
```json
{
  "roast_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** (200 OK)
```json
{
  "roast_count": 3,
  "coffee_consistency": "High consistency across roasts",
  "improvement_trend": "Steady improvement in technique",
  "key_findings": [
    "Development time is consistently stable",
    "Charge temperature shows optimal control"
  ],
  "consistency_score": 92
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

---

## WebSocket Events

See `/backend/src/socket-handlers.js` for complete WebSocket documentation.

### Common Pattern

1. Connect with token: `io('http://localhost:5000', { auth: { token: '...' } })`
2. Join roast: `socket.emit('roast:join', { roast_id: '...' })`
3. Listen for updates: `socket.on('roast:data-update', (data) => {...})`

---

## Rate Limiting

- No official rate limiting implemented
- Recommended: Implement via reverse proxy (nginx, Cloudflare)

## CORS

CORS is enabled for configured origins. Configure via `CORS_ORIGIN` environment variable.

## SSL/TLS

Use HTTP/2 with TLS in production. Configure at reverse proxy level.
