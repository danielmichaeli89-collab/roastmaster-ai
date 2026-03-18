# RoastMaster AI - Architecture Documentation

**Project**: AI-Powered Coffee Roasting Control System for ROEST L200 Ultra
**Last Updated**: 2026-03-18
**Version**: 1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [AI Pipeline Design](#ai-pipeline-design)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [API Specifications](#api-specifications)
9. [WebSocket Events](#websocket-events)
10. [Integration Points](#integration-points)
11. [Data Storage Strategy](#data-storage-strategy)
12. [Security & Authentication](#security--authentication)
13. [Scalability & Performance](#scalability--performance)
14. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ROASTMASTER AI SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         HARDWARE LAYER (ROEST L200 Ultra)               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Temperature    │  │  Pressure        │  │  AI Microphone   │       │
│  │  Sensors (6x)   │  │  Sensor          │  │  (1st Crack      │       │
│  │  - Bean Temp(2) │  │                  │  │   Detection)     │       │
│  │  - Air Temp     │  │  - Drum Pressure │  │                  │       │
│  │  - Inlet Temp   │  │                  │  │                  │       │
│  │  - Drum Temp    │  │                  │  │                  │       │
│  │  - Exhaust Temp │  │                  │  │                  │       │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘       │
│           ▲                    ▲                     ▲                    │
│           └────────────────────┴─────────────────────┘                   │
│                          (USB/Serial)                                    │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Drum Motor     │  │  Air/Fan Control │  │  Heating Element │       │
│  │  (RPM Control)  │  │  (Airflow %)     │  │  (Power %)       │       │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘       │
│           ▲                    ▲                     ▲                    │
│           └────────────────────┴─────────────────────┘                   │
│                    (WiFi 5GHz + Bluetooth)                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                     DATA INGESTION LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  ROEST Connect Portal (front.roestcoffee.com)                │     │
│  │  - CSV Export (Real-time data logs)                          │     │
│  │  - PDF Reports                                               │     │
│  │  - Manual Web Interface for monitoring                       │     │
│  └────────┬───────────────────────────────────────────────────────┘     │
│           │                                                             │
│  ┌────────▼───────────────────────────────────────────────────────┐     │
│  │  Backend Data Collector Service                              │     │
│  │  - CSV Parser + Importer                                     │     │
│  │  - ROEST Connect API Wrapper                                 │     │
│  │  - Data Validation & Normalization                           │     │
│  │  - Scheduled pulls + Manual uploads                          │     │
│  └────────┬───────────────────────────────────────────────────────┘     │
│           │                                                             │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            │ (REST API + CSV Uploads)
            ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER (Railway)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Node.js/Express Application                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  REST API Routes                                             │     │
│  │  - /api/roasts (CRUD operations)                             │     │
│  │  - /api/profiles (Profile management)                        │     │
│  │  - /api/inventory (Green coffee management)                  │     │
│  │  - /api/analytics (Historical analysis)                      │     │
│  │  - /api/ai (AI generation & analysis)                        │     │
│  │  - /api/auth (Authentication)                                │     │
│  └──────────────────┬────────────────────────────────────────────┘     │
│                     │                                                  │
│  ┌──────────────────▼────────────────────────────────────────────┐     │
│  │  WebSocket Server                                            │     │
│  │  - Real-time roast data streaming                            │     │
│  │  - Live temperature & control parameter updates              │     │
│  │  - Anomaly alerts                                            │     │
│  │  - AI recommendations                                        │     │
│  └──────────────────┬────────────────────────────────────────────┘     │
│                     │                                                  │
│  ┌──────────────────▼────────────────────────────────────────────┐     │
│  │  AI Pipeline Service                                         │     │
│  │  - Claude API Integration                                    │     │
│  │  - Profile Generation Engine                                 │     │
│  │  - Real-time Monitoring & Anomaly Detection                  │     │
│  │  - Post-roast Analysis                                       │     │
│  │  - Learning & Optimization                                   │     │
│  └──────────────────┬────────────────────────────────────────────┘     │
│                     │                                                  │
│  ┌──────────────────▼────────────────────────────────────────────┐     │
│  │  Background Job Queue (Bull/RabbitMQ)                        │     │
│  │  - Scheduled data pulls from ROEST Connect                   │     │
│  │  - AI analysis jobs                                          │     │
│  │  - Data aggregation & reporting                              │     │
│  │  - Maintenance tasks                                         │     │
│  └──────────────────┬────────────────────────────────────────────┘     │
│                     │                                                  │
└─────────────────────┼──────────────────────────────────────────────────┘
                      │
                      │ (SQL Queries + Transactions)
                      ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER (PostgreSQL)                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  • Roasts (Historical roast data)                                       │
│  • Roast Profiles (Target roasting profiles)                            │
│  • Temperature Logs (Granular sensor data)                              │
│  • Control Logs (Motor/Fan/Power adjustments)                           │
│  • Green Coffee Inventory                                               │
│  • Cupping Notes                                                        │
│  • AI Analysis Results                                                  │
│  • Anomaly Records                                                      │
│  • User Settings & Preferences                                          │
│  • System Configuration                                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

            ▲                      ▲                      ▲
            │ (HTTP/WebSocket)     │ (WebSocket)          │ (HTTP)
            │                      │                      │
┌───────────┴──────┐  ┌──────────┴────────┐  ┌──────────┴────────────┐
│                  │  │                   │  │                       │
│  FRONTEND LAYER  │  │  MOBILE APP       │  │  EXTERNAL SYSTEMS    │
│  (React/Netlify) │  │  (Future)         │  │  (ROEST Connect API) │
│                  │  │                   │  │                       │
└──────────────────┘  └───────────────────┘  └───────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES & INTEGRATIONS                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  Claude API      │  │  Authentication  │  │  Email/Alerting  │     │
│  │  (Anthropic)     │  │  (Auth0/JWT)     │  │  (SendGrid/SMS)   │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js 4.x
- **TypeScript**: 5.x (for type safety)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma or Sequelize
- **API Documentation**: Swagger/OpenAPI 3.0
- **Real-time Communication**: Socket.io
- **Job Queue**: Bull (Redis-backed) or RabbitMQ
- **AI Integration**: Anthropic Claude API (Claude 3.5 Sonnet or later)
- **HTTP Client**: Axios or node-fetch
- **Validation**: Zod or Joi
- **Logging**: Winston or Pino
- **Monitoring**: Sentry or New Relic
- **Testing**: Jest, Supertest
- **Hosting**: Railway.app

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **UI Components**: Material-UI (MUI) v5 or Shadcn/ui
- **State Management**: Redux Toolkit or Zustand
- **Real-time Client**: Socket.io-client
- **Charting**: Chart.js or Recharts
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios or TanStack Query
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library
- **Date/Time**: date-fns or Day.js
- **Hosting**: Netlify
- **Analytics**: Plausible or Custom events

### Infrastructure
- **Database Hosting**: Railway PostgreSQL
- **Backend Hosting**: Railway Node.js
- **Frontend Hosting**: Netlify
- **File Storage**: Netlify or AWS S3 (for CSV imports/exports)
- **CDN**: Netlify Edge or Cloudflare
- **DNS**: Custom domain or Railway default

---

## Database Schema

### Entity-Relationship Overview

```
users
  │
  ├── roasts (1:N) ─────┬─── temperature_logs (1:N)
  │                      ├─── control_logs (1:N)
  │                      └─── roast_anomalies (1:N)
  │
  ├── roast_profiles (1:N) ─── profile_phases (1:N)
  │
  ├── green_coffee_inventory (1:N)
  │                      │
  │                      └─── cupping_notes (1:N)
  │
  ├── ai_analysis_results (1:N)
  │
  └── user_preferences (1:1)
```

### Detailed Table Schemas

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin', 'roaster', 'viewer') DEFAULT 'roaster',
  organization_name VARCHAR(255),
  roester_serial_number VARCHAR(100),
  roester_api_token VARCHAR(255) NULLABLE, -- encrypted
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULLABLE
);
```

#### Roasts Table
```sql
CREATE TABLE roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  batch_number VARCHAR(100) NOT NULL,

  -- Green Coffee Details
  green_coffee_id UUID NULLABLE REFERENCES green_coffee_inventory(id),
  coffee_origin VARCHAR(255),
  coffee_processing_method VARCHAR(100), -- Washed, Natural, Pulped Natural, Honey
  coffee_density_score DECIMAL(3,1), -- 1-10 scale
  coffee_moisture_percent DECIMAL(4,2),
  coffee_altitude_meters INTEGER,

  -- Target Roast Profile
  roast_profile_id UUID NULLABLE REFERENCES roast_profiles(id),
  target_development_time_seconds INTEGER,
  target_first_crack_seconds INTEGER,
  target_second_crack_seconds INTEGER NULLABLE,
  target_drop_temperature DECIMAL(5,2),

  -- Actual Roast Data
  roast_start_time TIMESTAMP NOT NULL,
  roast_end_time TIMESTAMP NULLABLE,
  roast_duration_seconds INTEGER NULLABLE,

  first_crack_detected_at TIMESTAMP NULLABLE,
  first_crack_detected_by ENUM('microphone', 'manual', 'ai_prediction') NULLABLE,
  second_crack_detected_at TIMESTAMP NULLABLE,

  actual_drop_temperature DECIMAL(5,2) NULLABLE,
  actual_drop_time TIMESTAMP NULLABLE,

  -- Environmental Conditions
  ambient_temperature DECIMAL(5,2),
  ambient_humidity_percent DECIMAL(5,2),

  -- Outcome
  roast_level ENUM('light', 'medium_light', 'medium', 'medium_dark', 'dark') NULLABLE,
  outcome_notes TEXT,
  is_success BOOLEAN DEFAULT NULL, -- null = not yet evaluated
  quality_rating INTEGER NULLABLE, -- 1-10 scale

  -- Metadata
  csv_source_file VARCHAR(255) NULLABLE, -- filename from ROEST Connect export
  roest_connect_id VARCHAR(100) NULLABLE, -- external roast ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(batch_number, user_id)
);

CREATE INDEX idx_roasts_user_id ON roasts(user_id);
CREATE INDEX idx_roasts_start_time ON roasts(roast_start_time);
CREATE INDEX idx_roasts_profile_id ON roasts(roast_profile_id);
```

#### Temperature Logs Table
```sql
CREATE TABLE temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id UUID NOT NULL REFERENCES roasts(id) ON DELETE CASCADE,

  -- Timestamp
  timestamp TIMESTAMP NOT NULL,
  elapsed_seconds INTEGER NOT NULL, -- seconds since roast start

  -- Temperature Readings (Celsius)
  bean_temperature_1 DECIMAL(5,2),
  bean_temperature_2 DECIMAL(5,2),
  bean_temperature_avg DECIMAL(5,2),
  air_temperature DECIMAL(5,2),
  inlet_temperature DECIMAL(5,2),
  drum_temperature DECIMAL(5,2),
  exhaust_temperature DECIMAL(5,2),

  -- Pressure Reading (Bar)
  drum_pressure DECIMAL(6,3),

  -- Sampling info
  sampling_interval_ms INTEGER, -- milliseconds between readings
  sensor_health_status ENUM('nominal', 'warning', 'error') DEFAULT 'nominal',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_temp_logs_roast_id ON temperature_logs(roast_id);
CREATE INDEX idx_temp_logs_timestamp ON temperature_logs(timestamp);
CREATE INDEX idx_temp_logs_roast_time ON temperature_logs(roast_id, elapsed_seconds);
```

#### Control Logs Table
```sql
CREATE TABLE control_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id UUID NOT NULL REFERENCES roasts(id) ON DELETE CASCADE,

  -- Timestamp
  timestamp TIMESTAMP NOT NULL,
  elapsed_seconds INTEGER NOT NULL,

  -- Control Parameters
  power_percent DECIMAL(5,2),
  airflow_percent DECIMAL(5,2),
  fan_speed_rpm INTEGER,
  motor_rpm INTEGER,

  -- Control Type
  control_source ENUM('manual', 'auto_profile', 'ai_recommendation', 'system_default'),

  -- Change Details
  changed_parameter VARCHAR(100), -- power, airflow, fan_speed, motor_rpm
  old_value DECIMAL(8,2),
  new_value DECIMAL(8,2),
  reason_notes TEXT, -- why was this change made?

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_control_logs_roast_id ON control_logs(roast_id);
CREATE INDEX idx_control_logs_timestamp ON control_logs(timestamp);
```

#### Roast Anomalies Table
```sql
CREATE TABLE roast_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id UUID NOT NULL REFERENCES roasts(id) ON DELETE CASCADE,

  -- Anomaly Details
  timestamp TIMESTAMP NOT NULL,
  elapsed_seconds INTEGER NOT NULL,
  anomaly_type ENUM(
    'temp_spike',
    'temp_drop',
    'pressure_anomaly',
    'drum_stall',
    'heating_element_failure',
    'cooling_lag',
    'sensor_malfunction',
    'uneven_development',
    'thermal_shock',
    'control_lag'
  ),

  -- Severity
  severity ENUM('low', 'medium', 'high', 'critical'),

  -- Details
  affected_sensor VARCHAR(100),
  expected_value DECIMAL(8,2),
  actual_value DECIMAL(8,2),
  deviation_percent DECIMAL(6,2),

  -- Response
  ai_suggestion TEXT,
  user_action TEXT NULLABLE,
  action_taken_at TIMESTAMP NULLABLE,

  -- Resolution
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP NULLABLE,
  resolution_notes TEXT NULLABLE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anomalies_roast_id ON roast_anomalies(roast_id);
CREATE INDEX idx_anomalies_timestamp ON roast_anomalies(timestamp);
CREATE INDEX idx_anomalies_severity ON roast_anomalies(severity);
```

#### Roast Profiles Table
```sql
CREATE TABLE roast_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Profile Identity
  profile_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Target Coffee Characteristics
  target_coffee_origin VARCHAR(255),
  target_processing_method VARCHAR(100),
  target_density_score DECIMAL(3,1),
  target_flavor_notes TEXT, -- e.g., "chocolate, walnut, balanced acidity"

  -- Roast Parameters
  target_first_crack_seconds INTEGER,
  target_second_crack_seconds INTEGER NULLABLE,
  target_development_time_percent DECIMAL(5,2), -- DT% = (drop_time - FC_time) / FC_time * 100
  target_drop_temperature DECIMAL(5,2),

  -- Overall Strategy
  roast_strategy ENUM('light', 'medium', 'dark', 'filter', 'espresso', 'mouthfeel', 'clarity'),

  -- Generation Info
  ai_generated BOOLEAN DEFAULT false,
  ai_generation_prompt TEXT NULLABLE,
  generated_at TIMESTAMP NULLABLE,

  is_template BOOLEAN DEFAULT false, -- Shared template vs personal
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON roast_profiles(user_id);
CREATE INDEX idx_profiles_name ON roast_profiles(profile_name);
```

#### Profile Phases Table
```sql
CREATE TABLE profile_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_profile_id UUID NOT NULL REFERENCES roast_profiles(id) ON DELETE CASCADE,

  -- Phase Definition
  phase_number INTEGER NOT NULL,
  phase_name VARCHAR(100), -- "Drying", "Browning", "Development", "Cooling"
  phase_description TEXT,

  -- Timing
  start_seconds INTEGER NOT NULL,
  end_seconds INTEGER NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS (end_seconds - start_seconds) STORED,

  -- Temperature Targets
  target_bean_temp_start DECIMAL(5,2),
  target_bean_temp_end DECIMAL(5,2),
  target_ramp_rate DECIMAL(5,2), -- degrees C per second

  -- Control Parameters
  power_percent_start DECIMAL(5,2),
  power_percent_end DECIMAL(5,2),
  airflow_percent_start DECIMAL(5,2),
  airflow_percent_end DECIMAL(5,2),

  -- Tolerance
  temperature_tolerance_celsius DECIMAL(3,1),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_phases_profile_id ON profile_phases(roast_profile_id);
```

#### Green Coffee Inventory Table
```sql
CREATE TABLE green_coffee_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Coffee Identity
  origin_country VARCHAR(100) NOT NULL,
  origin_region VARCHAR(100),
  coffee_name VARCHAR(255) NOT NULL,
  producer_name VARCHAR(255),

  -- Processing & Quality
  processing_method VARCHAR(100), -- Washed, Natural, Pulped Natural, Honey, etc.
  altitude_meters INTEGER,
  density_score DECIMAL(3,1), -- 1-10: how dense/hard the beans are
  moisture_percent DECIMAL(4,2),

  -- Flavor Profile
  expected_flavor_notes TEXT, -- from supplier or cupping notes
  intended_roast_profile_id UUID NULLABLE REFERENCES roast_profiles(id),

  -- Inventory Management
  quantity_kg DECIMAL(8,2) NOT NULL,
  quantity_bags INTEGER,
  bag_size_kg DECIMAL(5,2),

  -- Sourcing Info
  supplier_name VARCHAR(255),
  purchase_date DATE,
  harvest_date DATE,
  lot_number VARCHAR(100),
  cost_per_kg DECIMAL(8,2),

  -- Status
  received_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  storage_location VARCHAR(100),
  storage_condition VARCHAR(100), -- "sealed bag", "opened", "in use", etc.

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_user_id ON green_coffee_inventory(user_id);
CREATE INDEX idx_inventory_origin ON green_coffee_inventory(origin_country, origin_region);
```

#### Cupping Notes Table
```sql
CREATE TABLE cupping_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  green_coffee_id UUID NOT NULL REFERENCES green_coffee_inventory(id) ON DELETE CASCADE,
  roast_id UUID NULLABLE REFERENCES roasts(id), -- Optional link to specific roast

  -- Cupping Session
  cupping_date DATE NOT NULL,
  cupper_name VARCHAR(255),
  cupping_method ENUM('weasel', 'manual', 'hybrid') DEFAULT 'manual',

  -- SCA Cupping Scores (0-10 scale for each)
  aroma DECIMAL(3,1),
  flavor DECIMAL(3,1),
  aftertaste DECIMAL(3,1),
  acidity DECIMAL(3,1),
  body DECIMAL(3,1),
  balance DECIMAL(3,1),
  uniformity DECIMAL(3,1),
  clean_cup DECIMAL(3,1),
  sweetness DECIMAL(3,1),
  overall DECIMAL(3,1),
  defects DECIMAL(3,1),

  total_score DECIMAL(5,2) GENERATED ALWAYS AS (
    aroma + flavor + aftertaste + acidity + body +
    balance + uniformity + clean_cup + sweetness + overall - defects
  ) STORED,

  -- Detailed Notes
  dominant_flavors TEXT[], -- array: ['chocolate', 'walnut', 'caramel']
  tasting_notes TEXT,
  mouth_feel VARCHAR(100), -- light, medium, full, syrupy
  finish_quality VARCHAR(100), -- short, medium, long
  defects_description TEXT, -- quaker, earthy, musty, etc.

  -- Comparisons & Recommendations
  suitable_brew_methods TEXT[], -- ['espresso', 'pour_over', 'french_press']
  roast_level_recommendation ENUM('light', 'medium_light', 'medium', 'medium_dark', 'dark'),

  overall_recommendation TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cupping_coffee_id ON cupping_notes(green_coffee_id);
CREATE INDEX idx_cupping_roast_id ON cupping_notes(roast_id);
```

#### AI Analysis Results Table
```sql
CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id UUID NOT NULL REFERENCES roasts(id) ON DELETE CASCADE,

  -- Analysis Type
  analysis_type ENUM(
    'roast_profile_generation',
    'real_time_monitoring',
    'post_roast_analysis',
    'anomaly_detection',
    'flavor_prediction',
    'optimization_suggestion'
  ),

  -- Analysis Context
  input_data JSONB NOT NULL, -- full input sent to Claude API
  claude_model_used VARCHAR(100) DEFAULT 'claude-3-5-sonnet',

  -- Analysis Output
  analysis_output JSONB NOT NULL, -- full structured response from Claude
  summary TEXT,
  key_recommendations TEXT[],

  -- Confidence & Quality
  confidence_score DECIMAL(3,2), -- 0-1.0
  processing_time_ms INTEGER,
  tokens_used INTEGER,

  -- User Action
  user_feedback ENUM('helpful', 'not_helpful', 'needs_adjustment') NULLABLE,
  user_feedback_notes TEXT NULLABLE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_roast_id ON ai_analysis_results(roast_id);
CREATE INDEX idx_analysis_type ON ai_analysis_results(analysis_type);
CREATE INDEX idx_analysis_created ON ai_analysis_results(created_at);
```

#### User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Temperature Unit
  temperature_unit ENUM('celsius', 'fahrenheit') DEFAULT 'celsius',

  -- Notification Preferences
  enable_anomaly_alerts BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT false,
  enable_desktop_notifications BOOLEAN DEFAULT true,
  anomaly_alert_severity_threshold ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',

  -- AI Preferences
  enable_ai_recommendations BOOLEAN DEFAULT true,
  ai_recommendation_aggressiveness ENUM('conservative', 'balanced', 'aggressive') DEFAULT 'balanced',

  -- Display Preferences
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  chart_update_interval_ms INTEGER DEFAULT 1000,
  graph_data_retention_roasts INTEGER DEFAULT 50, -- how many past roasts to load for comparison

  -- Roast Defaults
  default_roast_strategy VARCHAR(100),
  default_airflow_percent DECIMAL(5,2),
  default_power_percent DECIMAL(5,2),

  -- Integration Preferences
  roest_connect_auto_sync BOOLEAN DEFAULT false,
  roest_connect_sync_interval_minutes INTEGER DEFAULT 30,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prefs_user_id ON user_preferences(user_id);
```

#### System Configuration Table
```sql
CREATE TABLE system_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- AI Configuration
  claude_api_key VARCHAR(255) NOT NULL, -- encrypted in production
  claude_model_version VARCHAR(100) DEFAULT 'claude-3-5-sonnet',
  max_tokens_per_request INTEGER DEFAULT 2000,

  -- Data Collection
  temperature_log_interval_ms INTEGER DEFAULT 500,
  control_log_interval_ms INTEGER DEFAULT 1000,

  -- Anomaly Detection Thresholds
  max_temp_ramp_rate_celsius_per_sec DECIMAL(5,2) DEFAULT 5.0,
  min_temp_ramp_rate_celsius_per_sec DECIMAL(5,2) DEFAULT 1.0,
  pressure_deviation_threshold_percent DECIMAL(5,2) DEFAULT 10.0,

  -- ROEST Connect Integration
  roest_connect_api_endpoint VARCHAR(500),
  roest_connect_csv_parser_version VARCHAR(100),

  -- Feature Flags
  feature_ai_profile_generation BOOLEAN DEFAULT true,
  feature_real_time_monitoring BOOLEAN DEFAULT true,
  feature_anomaly_detection BOOLEAN DEFAULT true,
  feature_post_roast_analysis BOOLEAN DEFAULT true,

  -- Maintenance
  last_data_cleanup TIMESTAMP,
  data_retention_months INTEGER DEFAULT 24,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── server.ts                   # Express/Socket.io setup
│   ├── config/
│   │   ├── database.ts             # PostgreSQL connection
│   │   ├── redis.ts                # Redis for Bull queue & caching
│   │   ├── env.ts                  # Environment variables
│   │   └── logger.ts               # Winston logger setup
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # JWT authentication
│   │   ├── errorHandler.ts         # Global error handling
│   │   ├── validation.ts           # Request validation (Zod)
│   │   ├── cors.ts                 # CORS configuration
│   │   └── rateLimiter.ts          # Rate limiting
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Roast.ts
│   │   ├── RoastProfile.ts
│   │   ├── TemperatureLog.ts
│   │   ├── ControlLog.ts
│   │   ├── GreenCoffee.ts
│   │   ├── CuppingNotes.ts
│   │   ├── AIAnalysis.ts
│   │   └── RoastAnomaly.ts
│   │
│   ├── routes/
│   │   ├── auth.ts                 # Authentication routes
│   │   ├── roasts.ts               # Roast CRUD operations
│   │   ├── profiles.ts             # Profile management
│   │   ├── inventory.ts            # Green coffee inventory
│   │   ├── analytics.ts            # Historical analytics
│   │   ├── ai.ts                   # AI-related endpoints
│   │   └── import.ts               # CSV import from ROEST Connect
│   │
│   ├── controllers/
│   │   ├── roastController.ts
│   │   ├── profileController.ts
│   │   ├── inventoryController.ts
│   │   ├── analyticsController.ts
│   │   ├── aiController.ts
│   │   ├── importController.ts
│   │   └── authController.ts
│   │
│   ├── services/
│   │   ├── RoastService.ts         # Roast business logic
│   │   ├── ProfileService.ts       # Profile generation & management
│   │   ├── AIService.ts            # Claude API integration
│   │   ├── AnomalyDetectionService.ts
│   │   ├── RealtimeMonitoringService.ts
│   │   ├── CSVImportService.ts     # ROEST Connect CSV parsing
│   │   ├── AnalyticsService.ts     # Data aggregation & insights
│   │   ├── EmailService.ts         # Email notifications
│   │   └── CachingService.ts       # Redis caching
│   │
│   ├── ai/
│   │   ├── claudeClient.ts         # Claude API wrapper
│   │   ├── prompts/
│   │   │   ├── profileGeneration.ts
│   │   │   ├── realtimeMonitoring.ts
│   │   │   ├── postRoastAnalysis.ts
│   │   │   └── anomalyAnalysis.ts
│   │   └── responseParser.ts       # Parse Claude responses
│   │
│   ├── jobs/
│   │   ├── roestConnectSync.ts     # Scheduled CSV pulls
│   │   ├── aiAnalysisJob.ts        # Async AI analysis
│   │   ├── dataCleanup.ts          # Data retention
│   │   ├── aggregationJob.ts       # Analytics aggregation
│   │   └── jobQueue.ts             # Bull queue setup
│   │
│   ├── websocket/
│   │   ├── events.ts               # WebSocket event handlers
│   │   ├── namespace.ts            # Socket.io namespace setup
│   │   └── connectionManager.ts    # Connection lifecycle
│   │
│   ├── utils/
│   │   ├── validators.ts           # Custom validation functions
│   │   ├── formatters.ts           # Data formatting
│   │   ├── csvParser.ts            # CSV parsing utilities
│   │   ├── calculations.ts         # Math functions (ramp rates, etc)
│   │   └── helpers.ts
│   │
│   ├── types/
│   │   ├── index.ts                # Global types
│   │   ├── roast.ts
│   │   ├── profile.ts
│   │   ├── ai.ts
│   │   └── websocket.ts
│   │
│   └── errors/
│       ├── AppError.ts             # Custom error class
│       └── errorCodes.ts           # Error constants
│
├── prisma/
│   ├── schema.prisma               # Database schema definition
│   └── migrations/                 # Database migrations
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── docker-compose.yml (optional local dev)
```

### Core Service Layer Architecture

#### AIService (Claude Integration)

```typescript
class AIService {
  // Profile Generation
  generateRoastProfile(input: ProfileGenerationInput): Promise<RoastProfile>
  generateMultipleProfiles(inputs: ProfileGenerationInput[]): Promise<RoastProfile[]>
  refineProfile(profileId: string, feedback: string): Promise<RoastProfile>

  // Real-time Monitoring
  analyzeRoastInProgress(roastId: string, currentData: RoastDataSnapshot): Promise<MonitoringAnalysis>
  detectAnomalies(roastId: string, sensorData: TemperatureSensorData): Promise<AnomalyAlert[]>
  getRecommendations(roastId: string, context: RoastContext): Promise<Recommendation[]>

  // Post-roast Analysis
  analyzeCompletedRoast(roastId: string): Promise<PostRoastAnalysis>
  compareToPredictions(roastId: string): Promise<ComparisonAnalysis>
  extractLearnings(roastId: string): Promise<Learning[]>

  // Big Data Learning
  generateInsights(roastBatch: Roast[]): Promise<Insights>
  identifyPatterns(filters: AnalyticsFilter): Promise<Pattern[]>
  recommendOptimizations(userId: string): Promise<Optimization[]>
}
```

#### RealtimeMonitoringService

```typescript
class RealtimeMonitoringService {
  startMonitoring(roastId: string): void
  stopMonitoring(roastId: string): void

  // Core monitoring
  recordTemperatureData(roastId: string, data: TemperatureSensorData): Promise<void>
  recordControlChange(roastId: string, data: ControlChange): Promise<void>

  // Anomaly detection
  checkForAnomalies(roastId: string): Promise<Anomaly[]>
  notifyAnomalies(anomalies: Anomaly[], connection: WebSocket): void

  // First crack detection
  processAudioData(roastId: string, audioBuffer: Buffer): Promise<FirstCrackDetection | null>
  validateFirstCrackDetection(roastId: string, detectedAt: Date): Promise<boolean>

  // Real-time recommendations
  generateRecommendations(roastId: string): Promise<Recommendation[]>

  // Cleanup
  archiveRoastData(roastId: string): Promise<void>
}
```

#### AnomalyDetectionService

```typescript
class AnomalyDetectionService {
  // Real-time detection during roast
  detectTemperatureSpike(prev: number, current: number): boolean
  detectTemperatureDrop(prev: number, current: number): boolean
  detectPressureAnomaly(expected: number, actual: number): boolean
  detectThermalShock(): boolean
  detectUnevenDevelopment(temps: Temperature[]): boolean

  // Statistical anomalies
  detectOutlier(value: number, history: number[]): boolean
  getAnomalyScore(roastData: RoastData): number

  // Configure thresholds
  setThresholds(config: AnomalyThresholds): void
  getThresholds(): AnomalyThresholds
}
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Navigation (Top bar)
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── MainMenu
│   │   │   ├── Dashboard
│   │   │   ├── Roast Control
│   │   │   ├── Profile Builder
│   │   │   ├── Inventory
│   │   │   ├── Analytics
│   │   │   └── Settings
│   │   └── UserProfile
│   └── MainContent
│
├── Pages
│   ├── DashboardPage
│   │   ├── RoastStatusCard
│   │   ├── QuickStatsPanel
│   │   ├── RecentRoastsTable
│   │   └── AlertsWidget
│   │
│   ├── RoastControlPage
│   │   ├── RoastHeader (batch info, start time)
│   │   ├── MonitoringDashboard
│   │   │   ├── TemperatureChart (real-time graph)
│   │   │   │   ├── LineChart (Chart.js/Recharts)
│   │   │   │   └── LegendControls
│   │   │   ├── PressureGauge
│   │   │   ├── ControlParametersDisplay
│   │   │   │   ├── PowerSlider
│   │   │   │   ├── AirflowSlider
│   │   │   │   └── MotorRPMDisplay
│   │   │   └── StatusIndicators
│   │   │       ├── FirstCrackDetection
│   │   │       ├── PhaseIndicator
│   │   │       └── RampRateDisplay
│   │   │
│   │   ├── ControlPanel
│   │   │   ├── ManualControlSection
│   │   │   │   ├── PowerControl
│   │   │   │   ├── AirflowControl
│   │   │   │   └── MotorControl
│   │   │   ├── AutomationToggle
│   │   │   ├── ProfileSelector
│   │   │   └── DropButton
│   │   │
│   │   ├── AnomalyAlertsPanel
│   │   │   ├── AnomalyList
│   │   │   ├── AnomalyDetails
│   │   │   └── SuggestedActions
│   │   │
│   │   └── AIRecommendationsPanel
│   │       ├── RecommendationCard (map each)
│   │       ├── ImplementButton
│   │       └── FeedbackButtons
│   │
│   ├── ProfileBuilderPage
│   │   ├── ProfileSelector
│   │   ├── AIGenerationForm
│   │   │   ├── CoffeeOriginInput
│   │   │   ├── ProcessingMethodSelect
│   │   │   ├── DensityScoreInput
│   │   │   ├── FlavorProfileInput
│   │   │   └── GenerateButton
│   │   │
│   │   ├── ProfileEditor
│   │   │   ├── GeneralInfo
│   │   │   ├── TargetParameters
│   │   │   ├── PhaseBuilder
│   │   │   │   ├── PhaseTimeline
│   │   │   │   ├── PhaseForm
│   │   │   │   └── PhaseChart
│   │   │   └── SaveButton
│   │   │
│   │   └── ProfilePreview
│   │       ├── TargetTemperatureChart
│   │       ├── ExpectedPhases
│   │       └── EstimatedMetrics
│   │
│   ├── InventoryPage
│   │   ├── InventoryTable
│   │   │   ├── SearchBar
│   │   │   ├── FilterOptions
│   │   │   └── InventoryRows
│   │   │
│   │   ├── AddCoffeeForm
│   │   │   ├── OriginInput
│   │   │   ├── ProcessingMethodSelect
│   │   │   ├── QuantityInput
│   │   │   ├── SupplierInput
│   │   │   └── SubmitButton
│   │   │
│   │   └── CoffeeDetails (Modal/Drawer)
│   │       ├── GeneralInfo
│   │       ├── CuppingNotesSection
│   │       │   ├── CuppingScoresDisplay
│   │       │   ├── FlavorNotesDisplay
│   │       │   └── RecommendedRoastLevel
│   │       └── RoastHistory
│   │
│   ├── AnalyticsPage
│   │   ├── DateRangeSelector
│   │   ├── FilterPanel
│   │   │   ├── OriginFilter
│   │   │   ├── ProcessingMethodFilter
│   │   │   ├── RoastLevelFilter
│   │   │   └── ProfileFilter
│   │   │
│   │   ├── OverviewSection
│   │   │   ├── TotalRoastsCard
│   │   │   ├── AverageScoreCard
│   │   │   ├── SuccessRateCard
│   │   │   └── QualityTrendCard
│   │   │
│   │   ├── ChartsSection
│   │   │   ├── TemperatureTrendChart
│   │   │   ├── RoastLevelDistribution
│   │   │   ├── OriginComparison
│   │   │   ├── QualityScoresOverTime
│   │   │   ├── FirstCrackTimingAnalysis
│   │   │   └── DevelopmentTimeAnalysis
│   │   │
│   │   ├── ComparativeAnalysis
│   │   │   ├── ProfileComparison
│   │   │   ├── CoffeeOriginComparison
│   │   │   └── RoasterSkillProgression
│   │   │
│   │   └── InsightsPanel
│   │       ├── KeyFindingsCards
│   │       ├── PatternIdentification
│   │       └── AIRecommendations
│   │
│   ├── HistoricalRoastsPage
│   │   ├── RoastsList
│   │   │   ├── SearchBar
│   │   │   ├── SortOptions
│   │   │   └── RoastRows
│   │   │
│   │   └── RoastDetailModal
│   │       ├── RoastMetadata
│   │       ├── TemperatureChart (full replay)
│   │       ├── ControlSequence
│   │       ├── AnomaliesLog
│   │       ├── AIAnalysisResults
│   │       └── CuppingNotesLink
│   │
│   └── SettingsPage
│       ├── UserProfile
│       ├── Preferences
│       │   ├── TemperatureUnit
│       │   ├── NotificationSettings
│       │   ├── AIRecommendationLevel
│       │   └── ThemeSelector
│       │
│       ├── ROESTConnectIntegration
│       │   ├── APITokenInput
│       │   ├── AutoSyncToggle
│       │   ├── SyncIntervalInput
│       │   └── TestConnection
│       │
│       └── DataManagement
│           ├── ExportData
│           ├── BackupSettings
│           └── DataRetentionPolicy

├── Common Components
│   ├── Navigation
│   │   ├── Navbar
│   │   ├── Sidebar
│   │   └── Breadcrumbs
│   ├── Charts
│   │   ├── TemperatureChart
│   │   ├── PressureGauge
│   │   ├── TrendChart
│   │   └── ComparisonChart
│   ├── Forms
│   │   ├── FormField
│   │   ├── Select
│   │   ├── DatePicker
│   │   └── RangeSlider
│   ├── Tables
│   │   ├── DataTable
│   │   ├── Pagination
│   │   └── FilterBar
│   ├── Modals
│   │   ├── Modal
│   │   ├── AlertDialog
│   │   └── ConfirmDialog
│   ├── Cards
│   │   ├── Card
│   │   ├── StatCard
│   │   └── AlertCard
│   ├── Feedback
│   │   ├── Toast
│   │   ├── Spinner
│   │   ├── SkeletonLoader
│   │   └── EmptyState
│   └── Utilities
│       ├── ErrorBoundary
│       ├── ProtectedRoute
│       └── LazyLoader

├── Hooks
│   ├── useAuth()
│   ├── useRoast()
│   ├── useWebSocket()
│   ├── useAnalytics()
│   ├── useLocalStorage()
│   └── useFetch()

└── State Management
    ├── slices/
    │   ├── authSlice.ts
    │   ├── roastSlice.ts
    │   ├── profileSlice.ts
    │   ├── inventorySlice.ts
    │   ├── analyticsSlice.ts
    │   └── uiSlice.ts
    │
    └── store.ts (Redux setup)
```

### Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── main.tsx (Vite entry)
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── RoastControl.tsx
│   │   ├── ProfileBuilder.tsx
│   │   ├── Inventory.tsx
│   │   ├── Analytics.tsx
│   │   ├── HistoricalRoasts.tsx
│   │   └── Settings.tsx
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── RoastControl/
│   │   │   ├── MonitoringDashboard.tsx
│   │   │   ├── TemperatureChart.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── AnomalyAlertsPanel.tsx
│   │   │   └── AIRecommendationsPanel.tsx
│   │   │
│   │   ├── ProfileBuilder/
│   │   │   ├── AIGenerationForm.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── PhaseBuilder.tsx
│   │   │   └── ProfilePreview.tsx
│   │   │
│   │   ├── Inventory/
│   │   │   ├── InventoryTable.tsx
│   │   │   ├── AddCoffeeForm.tsx
│   │   │   └── CoffeeDetails.tsx
│   │   │
│   │   ├── Analytics/
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── InsightsPanel.tsx
│   │   │
│   │   ├── Common/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   └── Charts/
│   │       ├── TemperatureChart.tsx
│   │       ├── PressureGauge.tsx
│   │       └── TrendChart.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRoast.ts
│   │   ├── useWebSocket.ts
│   │   ├── useAnalytics.ts
│   │   └── useFetch.ts
│   │
│   ├── store/
│   │   ├── store.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── roastSlice.ts
│   │       ├── profileSlice.ts
│   │       ├── inventorySlice.ts
│   │       └── analyticsSlice.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── localStorage.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── roast.ts
│   │   ├── profile.ts
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── calculations.ts
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── tailwind.config.js
│   │
│   └── constants/
│       ├── api.ts
│       ├── colors.ts
│       └── messages.ts
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── netlify.toml
```

---

## AI Pipeline Design

### AI Prompt Templates & Processing Flow

#### 1. Roast Profile Generation Pipeline

```
┌─────────────────────────────────────────────────────────┐
│         ROAST PROFILE GENERATION PIPELINE                │
└─────────────────────────────────────────────────────────┘

USER INPUT
  │
  ├─ Coffee Origin (e.g., "Ethiopian Yirgacheffe")
  ├─ Processing Method (Washed, Natural, Pulped Natural, Honey)
  ├─ Density Score (1-10: how hard/dense are the beans)
  ├─ Moisture Percentage (Historical average)
  ├─ Altitude (meters)
  ├─ Desired Flavor Profile ("chocolate, walnut, caramel")
  ├─ Brew Method Preference (Espresso, Pour-over, Moka Pot)
  ├─ Roast Level Goal (Light, Medium, Dark)
  └─ Equipment Constraints (ROEST L200 Ultra specs)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│           PROFILE GENERATION PROMPT                      │
│                                                         │
│  "You are an expert specialty coffee roaster with      │
│   decades of experience roasting on ROEST machines.    │
│   Generate a detailed roast profile based on:          │
│   [INPUT DATA]                                         │
│                                                         │
│   Output format: JSON with these fields:               │
│   {                                                     │
│     profileName: string,                               │
│     description: string,                               │
│     phases: [                                          │
│       {                                                 │
│         name: "Drying" | "Browning" | "Development",  │
│         startSeconds: number,                          │
│         endSeconds: number,                            │
│         targetBeanTempStart: number,                   │
│         targetBeanTempEnd: number,                     │
│         powerPercentStart: number,                     │
│         powerPercentEnd: number,                       │
│         airflowPercentStart: number,                   │
│         airflowPercentEnd: number,                     │
│         targetRampRate: number,                        │
│         rationale: string                              │
│       }                                                 │
│     ],                                                  │
│     expectedFirstCrackSeconds: number,                 │
│     expectedDevelopmentPercent: number,                │
│     flavorExpectations: string[],                      │
│     notes: string                                      │
│   }"                                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│         CLAUDE API PROCESSING (3.5 Sonnet)              │
│                                                         │
│  - Tokens Used: ~1500-2000                            │
│  - Temperature: 0.7 (balanced creativity/precision)    │
│  - Max Tokens: 2500                                    │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│         RESPONSE PARSING & VALIDATION                   │
│                                                         │
│  - Parse JSON response                                 │
│  - Validate phase timing (start < end)                 │
│  - Validate temperature ranges (150-250°C)             │
│  - Validate control parameters (0-100%)                │
│  - Validate ramp rates (physics-based)                 │
│  - Check for gaps in phases                            │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│         PROFILE STORAGE & PRESENTATION                  │
│                                                         │
│  - Save to roast_profiles table                        │
│  - Generate visual preview chart                       │
│  - Show expected metrics & rationale                   │
│  - Allow user refinement/feedback                      │
│  - Option to load as template for next roast           │
└─────────────────────────────────────────────────────────┘
```

#### 2. Real-Time Monitoring & Anomaly Detection Pipeline

```
┌─────────────────────────────────────────────────────────┐
│     REAL-TIME MONITORING & ANOMALY DETECTION            │
└─────────────────────────────────────────────────────────┘

ROAST IN PROGRESS
  │
  ├─ Temperature Sensor Data (every 500ms)
  │  ├─ Bean Temp (1 & 2)
  │  ├─ Air Temp
  │  ├─ Inlet Temp
  │  ├─ Drum Temp
  │  └─ Exhaust Temp
  │
  ├─ Pressure Sensor Data
  │  └─ Drum Pressure
  │
  ├─ Control Parameters (every 1000ms)
  │  ├─ Power %
  │  ├─ Airflow %
  │  ├─ Motor RPM
  │  └─ Fan Speed
  │
  └─ Audio Data (for first crack detection)
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│        LOCAL ANOMALY DETECTION (Rule-based)              │
│                                                          │
│  Every 2-5 seconds, check:                              │
│  ├─ Temperature Ramp Rate Anomalies                     │
│  │  └─ If rate > 5°C/sec → "Temp Spike" alert          │
│  │  └─ If rate < 1°C/sec → "Sluggish heating" alert    │
│  │                                                       │
│  ├─ Temperature Synchronization                         │
│  │  └─ If bean_temp1 - bean_temp2 > 20°C → Uneven      │
│  │                                                       │
│  ├─ Pressure Anomalies                                  │
│  │  └─ If pressure changes > 10% unexpectedly           │
│  │                                                       │
│  ├─ Control Lag Detection                               │
│  │  └─ If power changes but temp doesn't respond        │
│  │                                                       │
│  └─ Thermal Shock Detection                             │
│     └─ If temp drops > 20°C in 5 seconds                │
│                                                          │
│  ACTION: Store anomalies in roast_anomalies table       │
└──────────────────────────────────────────────────────────┘
    │ (Every 10-30 seconds or 5+ anomalies)
    ▼
┌──────────────────────────────────────────────────────────┐
│      CLAUDE REAL-TIME ANALYSIS PROMPT                    │
│                                                          │
│  "Current roast status:                                 │
│   - Time: 4:30 into roast                               │
│   - Bean Temp: 165°C (avg of 2 sensors)                 │
│   - Recent Anomalies:                                   │
│     * Temperature spiked 8°C in 20 seconds              │
│     * Drum pressure dropped 0.2 bar                     │
│   - Current Controls: Power 90%, Airflow 70%            │
│   - Target Phase: Browning (expected 150-190°C)         │
│                                                          │
│   Analyze these anomalies and provide:                  │
│   1. Root cause assessment                              │
│   2. Severity level (low/medium/high/critical)          │
│   3. Recommended immediate action                       │
│   4. Should we continue or abort?                       │
│                                                          │
│   Return JSON format:                                   │
│   {                                                      │
│     rootCauses: string[],                               │
│     severity: 'low' | 'medium' | 'high' | 'critical',  │
│     recommendation: string,                             │
│     suggestedAction: string,                            │
│     suggestedPowerAdjust: number,                       │
│     suggestedAirflowAdjust: number,                     │
│     immediateAlert: boolean,                            │
│     canContinue: boolean                                │
│   }"                                                     │
└──────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│    REAL-TIME RECOMMENDATION GENERATION                   │
│                                                          │
│  - Parse Claude response                                │
│  - Validate recommended control adjustments             │
│  - Send to frontend via WebSocket (immediate)           │
│  - Log suggestion to database                           │
│  - If critical: trigger immediate alert to user         │
│  - Option to auto-implement with user confirmation      │
└──────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│    USER INTERACTION & FEEDBACK LOOP                      │
│                                                          │
│  ├─ User reads recommendation on screen                 │
│  ├─ User chooses: "Accept", "Modify", "Ignore"         │
│  ├─ If "Accept": Send control command to ROEST         │
│  ├─ If "Modify": User adjusts values, re-submit        │
│  ├─ If "Ignore": Log for post-roast analysis           │
│  └─ Store user feedback for AI learning                 │
└──────────────────────────────────────────────────────────┘
```

#### 3. Post-Roast Analysis Pipeline

```
┌──────────────────────────────────────────────────────────┐
│          POST-ROAST ANALYSIS PIPELINE                    │
└──────────────────────────────────────────────────────────┘

ROAST COMPLETE
  │
  └─ Collect Final Data:
     ├─ Full temperature log (all 5 sensors)
     ├─ Control sequence (all adjustments)
     ├─ Anomalies experienced
     ├─ First/second crack detection data
     ├─ Actual drop time & temperature
     ├─ Roast level assessment
     └─ Cupping notes (if performed)
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│     POST-ROAST ANALYSIS PROMPT (Comprehensive)           │
│                                                          │
│  "Provide a detailed post-roast analysis for this      │
│   specialty coffee roast:                               │
│                                                          │
│   ROAST METADATA:                                       │
│   - Coffee: Ethiopian Yirgacheffe Natural                │
│   - Target Profile: Light Roast, Clarity Focus         │
│                                                          │
│   TIMELINE:                                             │
│   - Total Duration: 14:32                               │
│   - First Crack: 8:45 (detected by microphone)         │
│   - Development Time: 5:47 (40% DT%)                    │
│   - Drop: 14:32 at 218°C                                │
│                                                          │
│   EXECUTION ANALYSIS:                                   │
│   [Full temperature data chart data]                    │
│   [Control sequence]                                    │
│   [Anomalies: 3 temperature spikes, 1 pressure dip]    │
│                                                          │
│   CUPPING RESULTS (if available):                       │
│   - Overall Score: 86/100                               │
│   - Dominant Notes: Floral, Blueberry, Tea-like        │
│   - Mouth Feel: Light, Crisp                            │
│                                                          │
│   Provide analysis including:                           │
│   1. How well did we execute the target profile?        │
│   2. Impact of anomalies on final cup?                  │
│   3. Flavor achievement vs. goals?                      │
│   4. What went well?                                    │
│   5. What could be improved?                            │
│   6. Specific adjustments for next roast?               │
│   7. Temperature curve optimization tips?               │
│   8. Control parameter refinements?                     │
│                                                          │
│   Return JSON:                                          │
│   {                                                      │
│     executionScore: number (0-100),                    │
│     targetAchievement: {                                │
│       firstCrackTiming: {                               │
│         target: number,                                 │
│         actual: number,                                 │
│         variancePercent: number,                        │
│         assessment: string                              │
│       },                                                 │
│       developmentTime: { ... },                         │
│       temperatureCurve: { ... },                        │
│       controlPrecision: { ... }                         │
│     },                                                   │
│     flavorAnalysis: {                                   │
│       expectedNotes: string[],                          │
│       actualNotes: string[],                            │
│       alignment: string,                                │
│       scoreAchieved: number,                            │
│       reasoning: string                                 │
│     },                                                   │
│     anomalyImpact: {                                    │
│       anomalies: [...],                                 │
│       cumulativeImpact: string,                         │
│       recoveryQuality: string                           │
│     },                                                   │
│     improvements: [                                     │
│       {                                                  │
│         area: string,                                   │
│         issue: string,                                  │
│         suggestion: string,                             │
│         expectedImpact: string,                         │
│         priority: 'high' | 'medium' | 'low'             │
│       }                                                  │
│     ],                                                   │
│     nextRoastRecommendations: [                         │
│       {                                                  │
│         adjustment: string,                             │
│         reason: string,                                 │
│         expectedOutcome: string                         │
│       }                                                  │
│     ],                                                   │
│     learnings: string[]                                 │
│   }"                                                     │
└──────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│    AI ANALYSIS STORAGE & PRESENTATION                    │
│                                                          │
│  - Save full Claude response to ai_analysis_results     │
│  - Present summary on roast detail page                 │
│  - Highlight key learnings                              │
│  - Store recommendations for future reference           │
│  - Link to next roast generation                        │
└──────────────────────────────────────────────────────────┘
```

#### 4. Big Data Learning Pipeline

```
┌──────────────────────────────────────────────────────────┐
│         BIG DATA LEARNING & OPTIMIZATION                 │
└──────────────────────────────────────────────────────────┘

Triggered: Weekly or when 20+ new roasts completed
  │
  └─ Aggregate data:
     ├─ All roasts from past 3-12 months
     ├─ Grouped by: Origin, Processing, Density
     ├─ Compare success rates, scores
     ├─ Pattern analysis in temperature curves
     ├─ Control parameter effectiveness
     └─ Flavor outcome distributions
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│      INSIGHTS & PATTERN DISCOVERY PROMPT                 │
│                                                          │
│  "Analyze our roasting database of 150 roasts from      │
│   the past 6 months across 25 different coffee          │
│   origins/processings.                                  │
│                                                          │
│   DATA SUMMARY:                                         │
│   [Aggregated statistics for each origin]               │
│   - Avg success rate: 78%                               │
│   - Avg quality score: 84/100                           │
│   - Most common anomalies by type                       │
│   - Temperature curve patterns                          │
│                                                          │
│   SPECIFIC ANALYSES NEEDED:                             │
│   1. Which coffee origins are we best/worst at?        │
│   2. What temperature curve patterns = high scores?    │
│   3. Which control strategies work best?               │
│   4. Any processing method patterns?                   │
│   5. Do we have skill gaps we should address?          │
│   6. Predicted performance for similar future roasts?  │
│   7. Recommended focus areas for improvement?          │
│   8. Best practices to document?                       │
│                                                          │
│   Return JSON with insights..."                         │
└──────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│     INSIGHTS STORAGE & ACTIONABLE RECOMMENDATIONS        │
│                                                          │
│  - Save insights to analytics tables                    │
│  - Present on Analytics page for user review            │
│  - Generate custom recommendations:                     │
│    * "You excel with Kenyan washed - roast more!"       │
│    * "Your temp curves are improving - keep up!"        │
│    * "Practice with naturals - lower success rate"      │
│  - Use for profile generation suggestions               │
│  - Update ML models for better AI predictions           │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Roast Lifecycle Data Flow

```
┌────────────────────────────────────────────────────────────┐
│              ROAST LIFECYCLE DATA FLOW                      │
└────────────────────────────────────────────────────────────┘

PREPARATION PHASE
─────────────────
1. User selects green coffee from inventory
   └─→ GET /api/inventory/:id
       └─→ Returns: OriginCountry, Processing, Density, Moisture

2. User chooses/generates roast profile
   └─→ POST /api/profiles/generate
       ├─ Input: Coffee metadata, Flavor goals
       ├─ Process: Claude API (Profile Generation)
       └─ Returns: Profile with phases & targets

3. User starts new roast in system
   └─→ POST /api/roasts
       ├─ Create Roast record
       ├─ Associate Profile & Green Coffee
       └─ Returns: Roast ID, Start Timestamp

REAL-TIME MONITORING PHASE
───────────────────────────
4. ROEST machine sends data via WebSocket (every 500ms)
   └─→ WS: /roasts/:id/telemetry
       ├─ Sends: Temperature readings, Pressure
       ├─ Receives: Control confirmations

5. Backend processes incoming telemetry
   ├─→ POST /api/roasts/:id/temperature-logs
   │   └─ Save to temperature_logs table
   │
   └─→ Anomaly detection check (every 2-5 sec)
       ├─ Rule-based: Temp ramps, pressure changes
       └─ If anomalies: POST /api/roasts/:id/anomalies
           └─ Save to roast_anomalies table

6. Every 10-30 seconds or 5+ anomalies:
   └─→ POST /api/ai/analyze-realtime
       ├─ Input: Latest roast data + anomalies
       ├─ Process: Claude Real-Time Analysis
       └─ Returns: Recommendations & severity
           └─ WS emit: roast-recommendations
               └─ Frontend displays live recommendations

7. User takes manual action (adjust power/airflow)
   └─→ POST /api/roasts/:id/control-adjust
       ├─ Log control change
       ├─ Send command to ROEST (via ROEST Connect API)
       └─ Confirmation back to frontend via WS

8. First crack detected (microphone + manual confirmation)
   └─→ POST /api/roasts/:id/first-crack
       ├─ Save timestamp
       └─ WS emit: first-crack-detected

9. User drops roast (end of cycle)
   └─→ POST /api/roasts/:id/drop
       ├─ Record drop time & temp
       ├─ Finalize roast record
       └─ Transition to analysis phase

POST-ROAST ANALYSIS PHASE
──────────────────────────
10. User enters roast notes and cupping scores
    └─→ POST /api/roasts/:id/cupping-notes
        └─ Save quality rating, notes, flavor scores

11. Generate comprehensive post-roast analysis
    └─→ POST /api/ai/analyze-post-roast
        ├─ Input: Complete roast data + cupping notes
        ├─ Process: Claude Post-Roast Analysis
        └─ Returns: Execution scores, improvements, learnings
            └─ POST /api/roasts/:id/ai-analysis
                └─ Save to ai_analysis_results table

12. Update profile based on learnings
    └─→ POST /api/profiles/:id/refinements
        ├─ Store feedback for future roasts
        └─ Suggest profile adjustments

HISTORICAL & LEARNING PHASE
────────────────────────────
13. Big data analysis (weekly or on-demand)
    └─→ POST /api/ai/analyze-trends
        ├─ Input: All roasts + metadata (aggregated)
        ├─ Process: Claude Insights Analysis
        └─ Returns: Patterns, recommendations, skill insights
            └─ Stored for analytics dashboard

14. Archive & Export
    └─→ GET /api/roasts/export
        └─ CSV export of all roast data for backup
```

### WebSocket Real-Time Data Flow

```
┌────────────────────────────────────────────────────────────┐
│          WEBSOCKET REAL-TIME DATA FLOW                     │
└────────────────────────────────────────────────────────────┘

HARDWARE → ROEST CONNECT → BACKEND → FRONTEND

Hardware Sensors (every 500ms)
  │ (Temperature, Pressure)
  ▼
ROEST Connect Portal
  │ (WiFi/Bluetooth bridge)
  ▼
RoastMaster Backend WebSocket Server
  │
  ├─ Namespace: /roasts/:id
  │
  ├─ CLIENT EVENTS (Hardware/User → Backend)
  │  ├─ temperature-data
  │  │  └─ { temp_bean_1, temp_bean_2, air_temp, ... }
  │  │
  │  ├─ control-change
  │  │  └─ { parameter: 'power', value: 85 }
  │  │
  │  ├─ first-crack-detected
  │  │  └─ { timestamp, method: 'microphone|manual' }
  │  │
  │  ├─ roast-drop
  │  │  └─ { drop_temp, drop_time, notes }
  │  │
  │  └─ user-action
  │     └─ { action: 'accept-recommendation', ... }
  │
  ├─ SERVER EVENTS (Backend → Frontend)
  │  ├─ temp-log-saved
  │  │  └─ Confirmation of stored data
  │  │
  │  ├─ anomaly-detected
  │  │  └─ { type, severity, details, ai_suggestion }
  │  │
  │  ├─ roast-recommendations
  │  │  └─ { recommendations: [], source: 'ai|system' }
  │  │
  │  ├─ phase-change
  │  │  └─ { phase_name, expected_temps, eta_seconds }
  │  │
  │  ├─ first-crack-confirmed
  │  │  └─ { timestamp, time_to_fc_seconds }
  │  │
  │  ├─ control-command
  │  │  └─ { parameter, target_value, reason }
  │  │
  │  ├─ roast-status
  │  │  └─ { status: 'in_progress|completed', ... }
  │  │
  │  └─ error
  │     └─ { error_code, message, severity }
  │
  └─ BROADCAST EVENTS (For multi-user scenarios)
     └─ If multiple users viewing same roast
        ├─ user-joined
        └─ user-left
```

---

## API Specifications

### Authentication Endpoints

```
POST /api/auth/register
  Input: { email, password, username, full_name }
  Output: { user_id, email, token, refresh_token }
  Status: 201

POST /api/auth/login
  Input: { email, password }
  Output: { user_id, token, refresh_token, user }
  Status: 200

POST /api/auth/refresh
  Input: { refresh_token }
  Output: { token, refresh_token }
  Status: 200

POST /api/auth/logout
  Output: { message: "Logged out" }
  Status: 200

GET /api/auth/me
  Output: { user: User }
  Status: 200
```

### Roast Endpoints

```
GET /api/roasts
  Query: { limit, offset, origin, status, profile_id, date_from, date_to }
  Output: { roasts: Roast[], total, page, pages }
  Status: 200

GET /api/roasts/:id
  Output: Roast (with full logs)
  Status: 200

POST /api/roasts
  Input: { green_coffee_id, roast_profile_id, ambient_temp, ambient_humidity }
  Output: Roast
  Status: 201

PUT /api/roasts/:id
  Input: { outcome_notes, quality_rating, roast_level }
  Output: Roast
  Status: 200

DELETE /api/roasts/:id
  Status: 204

POST /api/roasts/:id/first-crack
  Input: { detected_at, detected_by: 'microphone|manual' }
  Output: Roast
  Status: 200

POST /api/roasts/:id/drop
  Input: { drop_temperature, drop_time, notes }
  Output: Roast
  Status: 200

GET /api/roasts/:id/temperature-logs
  Output: { logs: TemperatureLog[] }
  Status: 200

POST /api/roasts/:id/temperature-logs
  Input: { timestamp, bean_temp_1, bean_temp_2, air_temp, ... }
  Output: TemperatureLog
  Status: 201

GET /api/roasts/:id/control-logs
  Output: { logs: ControlLog[] }
  Status: 200

POST /api/roasts/:id/control-logs
  Input: { timestamp, power_percent, airflow_percent, motor_rpm }
  Output: ControlLog
  Status: 201

GET /api/roasts/:id/anomalies
  Output: { anomalies: RoastAnomaly[] }
  Status: 200

GET /api/roasts/export
  Query: { format: 'csv|json', date_from, date_to }
  Output: CSV/JSON file
  Status: 200
```

### Profile Endpoints

```
GET /api/profiles
  Query: { user_only: boolean, limit, offset }
  Output: { profiles: RoastProfile[], total }
  Status: 200

GET /api/profiles/:id
  Output: RoastProfile (with phases)
  Status: 200

POST /api/profiles
  Input: { profile_name, target_origin, target_processing, roast_strategy }
  Output: RoastProfile
  Status: 201

PUT /api/profiles/:id
  Input: { profile_name, description, roast_strategy }
  Output: RoastProfile
  Status: 200

DELETE /api/profiles/:id
  Status: 204

POST /api/profiles/generate
  Input: {
    coffee_origin,
    processing_method,
    density_score,
    moisture_percent,
    flavor_profile,
    desired_roast_level,
    brew_method
  }
  Output: RoastProfile (AI-generated)
  Status: 201

POST /api/profiles/:id/refine
  Input: { feedback, adjustments }
  Output: RoastProfile (refined)
  Status: 200

GET /api/profiles/:id/phases
  Output: { phases: ProfilePhase[] }
  Status: 200

POST /api/profiles/:id/phases
  Input: { phase_name, start_seconds, end_seconds, ... }
  Output: ProfilePhase
  Status: 201

PUT /api/profiles/:id/phases/:phaseId
  Input: { phase_name, start_seconds, end_seconds, ... }
  Output: ProfilePhase
  Status: 200

DELETE /api/profiles/:id/phases/:phaseId
  Status: 204
```

### Inventory Endpoints

```
GET /api/inventory
  Query: { status: 'active|all', origin, limit, offset }
  Output: { inventory: GreenCoffee[], total }
  Status: 200

GET /api/inventory/:id
  Output: GreenCoffee (with cupping notes)
  Status: 200

POST /api/inventory
  Input: {
    origin_country,
    origin_region,
    coffee_name,
    processing_method,
    density_score,
    moisture_percent,
    quantity_kg,
    supplier_name,
    purchase_date
  }
  Output: GreenCoffee
  Status: 201

PUT /api/inventory/:id
  Input: { quantity_kg, storage_location, storage_condition }
  Output: GreenCoffee
  Status: 200

DELETE /api/inventory/:id
  Status: 204

GET /api/inventory/:id/cupping-notes
  Output: { notes: CuppingNote[] }
  Status: 200

POST /api/inventory/:id/cupping-notes
  Input: {
    cupping_date,
    cupper_name,
    aroma, flavor, aftertaste, acidity, body, balance,
    uniformity, clean_cup, sweetness, overall, defects,
    dominant_flavors, tasting_notes, mouth_feel
  }
  Output: CuppingNote
  Status: 201
```

### Analytics Endpoints

```
GET /api/analytics/overview
  Query: { date_from, date_to }
  Output: {
    total_roasts,
    avg_quality_score,
    success_rate,
    trend_indicators
  }
  Status: 200

GET /api/analytics/trends
  Query: { metric, date_from, date_to, groupby: 'origin|profile|week' }
  Output: { data_points: any[] }
  Status: 200

GET /api/analytics/origin-comparison
  Query: { origins: ['origin1', 'origin2'], metric }
  Output: { comparisons: any[] }
  Status: 200

GET /api/analytics/profile-performance
  Output: { profiles: { id, name, success_rate, avg_score }[] }
  Status: 200

GET /api/analytics/insights
  Query: { lookback_days: 30 }
  Output: {
    strengths: string[],
    weaknesses: string[],
    patterns: string[],
    recommendations: string[]
  }
  Status: 200
```

### AI Endpoints

```
POST /api/ai/generate-profile
  Input: {
    coffee_origin,
    processing_method,
    density_score,
    moisture_percent,
    flavor_goals,
    brew_method,
    roast_level_goal
  }
  Output: { profile: RoastProfile, reasoning: string }
  Status: 201

POST /api/ai/analyze-realtime
  Input: {
    roast_id,
    current_data: {...},
    recent_anomalies: [...]
  }
  Output: {
    root_causes: string[],
    severity: 'low|medium|high|critical',
    recommendation: string,
    suggested_actions: { parameter, value, reason }[],
    confidence: number
  }
  Status: 200

POST /api/ai/analyze-post-roast
  Input: { roast_id }
  Output: {
    execution_score: number,
    target_achievement: {...},
    flavor_analysis: {...},
    improvements: Improvement[],
    learnings: string[]
  }
  Status: 200

POST /api/ai/analyze-trends
  Input: {
    lookback_days: 90,
    filters: { origins?: string[], processing_methods?: string[] }
  }
  Output: {
    patterns: Pattern[],
    insights: string[],
    recommendations: string[],
    skill_assessment: string
  }
  Status: 200

GET /api/ai/analysis/:id
  Output: AIAnalysisResult
  Status: 200

POST /api/ai/analysis/:id/feedback
  Input: { feedback: 'helpful|not_helpful|needs_adjustment', notes }
  Output: { message: "Feedback recorded" }
  Status: 200
```

### Import/Integration Endpoints

```
POST /api/import/csv
  Input: FormData (CSV file from ROEST Connect)
  Output: { imported_roasts: number, errors: string[] }
  Status: 200

POST /api/roest-connect/sync
  Input: { auto_sync: boolean, sync_interval_minutes: 30 }
  Output: { status: 'synced', roasts_imported: number }
  Status: 200

POST /api/import/validate-csv
  Input: FormData (CSV file)
  Output: { valid: boolean, warnings: string[], row_count: number }
  Status: 200
```

### Settings Endpoints

```
GET /api/settings/user-preferences
  Output: UserPreferences
  Status: 200

PUT /api/settings/user-preferences
  Input: { theme, temperature_unit, notifications, ... }
  Output: UserPreferences
  Status: 200

POST /api/settings/roest-connect-token
  Input: { token, serial_number }
  Output: { message: "Token saved" }
  Status: 200

GET /api/settings/system-config
  Output: SystemConfiguration (admin only)
  Status: 200
```

---

## WebSocket Events

### Event Format

All WebSocket events follow this structure:

```typescript
{
  type: 'event-name',
  timestamp: ISO8601,
  data: { ... },
  namespace: '/roasts/:roastId'
}
```

### Events During Active Roast

```
CLIENT → SERVER:
─────────────────

roast:temperature-data
  {
    elapsed_seconds: number,
    bean_temperature_1: number,
    bean_temperature_2: number,
    air_temperature: number,
    inlet_temperature: number,
    drum_temperature: number,
    exhaust_temperature: number,
    drum_pressure: number,
    sampling_interval_ms: number
  }

roast:control-change
  {
    parameter: 'power' | 'airflow' | 'motor_rpm' | 'fan_speed',
    previous_value: number,
    new_value: number,
    source: 'manual' | 'auto_profile' | 'ai_recommendation',
    reason: string
  }

roast:first-crack-detected
  {
    detected_at: ISO8601,
    method: 'microphone' | 'manual' | 'ai_prediction',
    confidence: number (0-1),
    elapsed_seconds: number
  }

roast:second-crack-detected
  {
    detected_at: ISO8601,
    elapsed_seconds: number
  }

roast:drop
  {
    drop_temperature: number,
    drop_time: ISO8601,
    elapsed_seconds: number,
    user_notes: string
  }

roast:user-feedback
  {
    recommendation_id: string,
    action: 'accepted' | 'rejected' | 'modified',
    reason: string
  }

roast:disconnect
  { reason: string }


SERVER → CLIENT:
────────────────

roast:temperature-log-saved
  {
    log_id: string,
    elapsed_seconds: number,
    average_bean_temp: number
  }

roast:anomaly-detected
  {
    anomaly_id: string,
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: {
      affected_sensor: string,
      expected_value: number,
      actual_value: number,
      deviation_percent: number
    },
    ai_suggestion: string,
    timestamp: ISO8601
  }

roast:recommendations
  {
    recommendations: [
      {
        id: string,
        type: 'control_adjustment' | 'monitoring' | 'continuation',
        title: string,
        description: string,
        suggested_action: {
          parameter: string,
          value: number,
          reason: string
        },
        confidence: number (0-1),
        severity: 'low' | 'medium' | 'high'
      }
    ],
    source: 'ai' | 'system',
    requires_action: boolean
  }

roast:phase-change
  {
    new_phase: string,
    expected_temperature_start: number,
    expected_temperature_end: number,
    eta_seconds: number,
    elapsed_seconds: number
  }

roast:control-command
  {
    command_id: string,
    parameter: string,
    target_value: number,
    reason: string,
    estimated_effect: string
  }

roast:roast-summary
  {
    status: 'completed' | 'aborted',
    total_duration_seconds: number,
    first_crack_at: number,
    drop_temperature: number,
    quality_estimate: number,
    summary_notes: string
  }

roast:error
  {
    error_code: string,
    message: string,
    severity: 'warning' | 'error' | 'critical',
    suggested_action: string,
    timestamp: ISO8601
  }
```

---

## Integration Points

### ROEST Connect Integration

```
ROEST Connect → RoastMaster AI

Data Source: ROEST Connect Portal (front.roestcoffee.com)
Method: CSV Export + Manual Sync

Scheduled Job (every 30 minutes or on-demand):
1. Query ROEST Connect for new roast logs
2. Download CSV export
3. Parse CSV format (temperature, pressure, time data)
4. Validate data integrity
5. Map to RoastMaster schema
6. Insert into temperature_logs & control_logs tables
7. Trigger anomaly detection on imported data
8. Notify user of new roasts

CSV Column Mapping:
  ROEST Column        → RoastMaster Field
  ──────────────────────────────────────
  Time                → timestamp, elapsed_seconds
  Sensor_BeanTemp1    → bean_temperature_1
  Sensor_BeanTemp2    → bean_temperature_2
  Sensor_AirTemp      → air_temperature
  Sensor_InletTemp    → inlet_temperature
  Sensor_DrumTemp     → drum_temperature
  Sensor_ExhaustTemp  → exhaust_temperature
  Sensor_Pressure     → drum_pressure
  Control_Power       → power_percent
  Control_Airflow     → airflow_percent
  Control_MotorRPM    → motor_rpm
```

### Claude API Integration

```
Integration Points:
──────────────────

1. Profile Generation
   Endpoint: https://api.anthropic.com/v1/messages
   Model: claude-3-5-sonnet-20241022
   Max Tokens: 2500
   Temperature: 0.7

   Input: Coffee metadata + User preferences
   Output: Roast profile with phases

2. Real-Time Monitoring
   Model: claude-3-5-sonnet-20241022
   Max Tokens: 1500
   Temperature: 0.3 (more deterministic)

   Input: Current roast data + anomalies
   Output: Analysis + recommendations

3. Post-Roast Analysis
   Model: claude-3-5-sonnet-20241022
   Max Tokens: 3000
   Temperature: 0.5

   Input: Complete roast data + cupping notes
   Output: Detailed analysis + learnings

4. Trend Analysis
   Model: claude-3-5-sonnet-20241022
   Max Tokens: 2000
   Temperature: 0.7

   Input: Aggregated roast database
   Output: Insights + recommendations

Error Handling:
  - Timeout (>30s): Retry with fallback
  - Rate limit: Queue and retry
  - API error: Return partial response or cached insight
```

---

## Data Storage Strategy

### PostgreSQL Optimization

```
Indexing Strategy:
─────────────────

High-Priority Indexes (created immediately):
  - users(email, username)
  - roasts(user_id, roast_start_time)
  - roasts(roast_profile_id)
  - temperature_logs(roast_id, elapsed_seconds)
  - temperature_logs(roast_id, timestamp)
  - control_logs(roast_id, timestamp)
  - roast_anomalies(roast_id, severity)
  - green_coffee_inventory(user_id)
  - roast_profiles(user_id)
  - ai_analysis_results(roast_id, analysis_type)

Composite Indexes:
  - roasts(user_id, roast_start_time DESC)
  - temperature_logs(roast_id, elapsed_seconds)
  - roast_anomalies(roast_id, resolved, timestamp DESC)

Full-Text Indexes (for search):
  - coffee_name, origin_region in green_coffee_inventory
  - profile_name in roast_profiles
  - tasting_notes in cupping_notes

Partitioning Strategy:
─────────────────────
- Partition temperature_logs by roast_id (hash partition)
  - Improves query performance for large roasts

- Partition roasts by year
  - temperature_logs_2024, temperature_logs_2025, etc.

Data Retention:
───────────────
- Keep all roast records: indefinite (user can delete manually)
- Temperature logs: 2+ years (24 months default)
- Control logs: 2+ years
- Anomaly records: 2+ years
- AI analysis results: 2+ years
- Cleanup job: Monthly (remove records older than retention period)

Backup Strategy:
────────────────
- Automated backups: Daily (Railway PostgreSQL)
- Point-in-time recovery: 7 days
- Manual export: Available to users (CSV, JSON)
```

### Caching Strategy

```
Redis Cache Layers:
───────────────────

1. User Session Cache (expires: 30 days)
   Key: user:{user_id}:session
   Value: { user_id, email, roles, preferences }

2. User Preferences Cache (expires: 24 hours)
   Key: user:{user_id}:preferences
   Value: UserPreferences object

3. Active Roast Cache (expires: 5 minutes)
   Key: roast:{roast_id}:current
   Value: Latest temperature & control data

4. Profile Cache (expires: 7 days)
   Key: profile:{profile_id}
   Value: Complete RoastProfile with phases

5. Analytics Cache (expires: 1 hour)
   Key: analytics:{user_id}:{metric}
   Value: Aggregated analytics data

6. AI Analysis Cache (expires: 30 days)
   Key: ai_analysis:{roast_id}
   Value: Claude API response

Cache Invalidation:
  - Roast data: Invalidate on new temperature log
  - Profile: Invalidate on update
  - Analytics: Invalidate hourly or on roast completion
  - User data: Invalidate on settings update
```

---

## Security & Authentication

### Authentication Flow

```
JWT-Based Authentication:
─────────────────────────

1. User Registration/Login
   POST /api/auth/login
   ├─ Email + Password → hash comparison
   ├─ Generate JWT token (expires: 24 hours)
   └─ Generate Refresh token (expires: 30 days)

2. Token Storage (Frontend)
   - Access Token: Memory (cleared on logout)
   - Refresh Token: HttpOnly cookie (secure, SameSite=Strict)

3. API Requests
   Authorization header: "Bearer {JWT_TOKEN}"
   Middleware: validateToken() → extracts user_id

4. Token Refresh
   POST /api/auth/refresh (with refresh token)
   └─ Returns: New access token

5. Logout
   POST /api/auth/logout
   └─ Invalidate refresh token in database

Password Security:
  - Hash: bcrypt (rounds: 12)
  - Min length: 12 characters
  - Complexity: Require uppercase, numbers, special chars
  - No common passwords (check against library)
```

### Data Security

```
Sensitive Data Encryption:
──────────────────────────

Fields requiring encryption at rest:
  - Passwords: bcrypt hash (never store plaintext)
  - ROEST API tokens: AES-256-GCM
  - Claude API key: AES-256-GCM
  - User phone numbers: Optional encryption

Fields with PII:
  - Email, username: Indexed, not encrypted (needed for queries)
  - Full name: Not encrypted
  - Organization: Not encrypted

Encryption Key Management:
  - Master key: Environment variable (Railway secrets)
  - Key rotation: Annually
  - Key derivation: PBKDF2 for passwords
```

### Authorization & Access Control

```
Role-Based Access Control (RBAC):
──────────────────────────────────

Roles:
  1. Admin: Full system access
     - View all users
     - Configure system
     - Export analytics
     - Manage AI settings

  2. Roaster: Full data access for their roasts
     - Create/view/edit roasts
     - View own analytics
     - Use AI services
     - Manage inventory
     - Access settings

  3. Viewer: Read-only access
     - View roasts
     - View analytics
     - No editing/creation

Resource Ownership:
  - Users can only access their own data
  - Shared profiles/templates available to all
  - Admin override with audit logging

API Protection:
  - Rate limiting: 100 requests/minute per user
  - API key validation on import/sync endpoints
  - CORS: Allow only authorized frontend domains
```

---

## Scalability & Performance

### Backend Performance

```
Optimization Strategies:
────────────────────────

1. Database Query Optimization
   - Connection pooling: 20 connections (Railway default)
   - Query caching: Redis for frequently accessed data
   - Batch inserts: Temperature logs (every 5 seconds)
   - Lazy loading: Relations only when needed

2. Real-Time Data Handling
   - WebSocket for low-latency updates
   - Message queuing: Bull queue for async tasks
   - In-memory temperature buffer: Last 100 readings
   - Compression: gzip on HTTP responses

3. AI API Efficiency
   - Batch requests: Multiple anomalies in one Claude call
   - Response caching: 24 hours for identical inputs
   - Token optimization: Structured prompts, concise output
   - Fallback responses: Pre-computed suggestions

4. Async Processing
   - CSV imports: Background job (Bull queue)
   - Email notifications: Async with retry
   - AI analysis: Queued if > 10 seconds
   - Data aggregation: Nightly batch job

Expected Performance:
  - API response time: < 200ms (p95)
  - WebSocket latency: < 50ms
  - Database query: < 100ms (p95)
  - AI response: 2-5 seconds
```

### Frontend Performance

```
Optimization Strategies:
────────────────────────

1. Code Splitting
   - Route-based: Each page lazy-loaded
   - Component-based: Charts, modals loaded on demand
   - Vendor bundles: Separate chart library, date-fns

2. State Management
   - Redux: Normalized state structure
   - Memoization: useMemo, useCallback
   - Selector optimization: Reselect library

3. Data Fetching
   - React Query: Automatic caching & background sync
   - Pagination: 50 items per page
   - Progressive loading: Skeleton screens

4. Rendering Optimization
   - Virtual scrolling: For large tables/lists
   - Canvas rendering: Temperature charts
   - Debounced updates: 1-second frequency

5. Build Optimization
   - Minification: Terser + CSS minimization
   - Asset optimization: AVIF/WebP images
   - CDN delivery: Netlify global CDN

Expected Metrics:
  - Initial load: < 3 seconds (3G)
  - First Contentful Paint: < 1.5 seconds
  - Time to Interactive: < 3 seconds
  - Lighthouse score: > 85
```

### Horizontal Scalability

```
Scaling Strategy:
─────────────────

Backend (Node.js):
  - Stateless design (session data in Redis)
  - Load balancer: Railway automatic
  - Multiple instances: Scale up to 10+ for high load
  - WebSocket: Sticky sessions or Redis pub/sub

Database (PostgreSQL):
  - Read replicas: For analytics queries
  - Connection pooling: PgBouncer
  - Vertical scaling first: Increase RAM for Railway
  - Partitioning: By roast_id or date

Frontend (Netlify):
  - Edge functions: Cloudflare for global delivery
  - Static generation: Pre-build analytics pages
  - CDN: Automatic global caching

Monitoring & Alerts:
  - Response time: Alert if > 500ms
  - Error rate: Alert if > 1%
  - Database connections: Alert if > 18/20
  - WebSocket connections: Alert if > 1000
```

---

## Deployment Architecture

### Environment Configuration

```
Development:
  - Backend: localhost:3000
  - Frontend: localhost:5173 (Vite)
  - Database: Local PostgreSQL
  - Redis: Local instance
  - AI: Claude API (test/dev key)

Staging:
  - Backend: Railway (staging app)
  - Frontend: Netlify (staging branch)
  - Database: PostgreSQL staging instance
  - AI: Claude API (test limit: $5/month)

Production:
  - Backend: Railway (main app, 2+ instances)
  - Frontend: Netlify (main branch, CDN)
  - Database: PostgreSQL production (backups enabled)
  - Redis: Production cluster
  - AI: Claude API (production key, monitored spend)
  - Monitoring: Sentry + New Relic
```

### CI/CD Pipeline

```
GitHub Workflow:

1. Pull Request
   ├─ Run linter (ESLint, Prettier)
   ├─ Run tests (Jest, 80%+ coverage)
   ├─ Build check (no errors)
   ├─ Type check (TypeScript strict)
   └─ Security scan (Dependabot)

2. Merge to Main
   ├─ Deploy to staging (automatic)
   ├─ Run integration tests
   ├─ Manual approval for production
   └─ Deploy to production (blue/green)

3. Post-Deploy
   ├─ Smoke tests (critical paths)
   ├─ Health checks
   ├─ Performance benchmarks
   └─ Sentry/monitoring setup
```

### Containerization (Optional Docker)

```dockerfile
# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

---

## Summary

This comprehensive architecture document defines:

✓ **System Overview**: 7-layer architecture with clear separation of concerns
✓ **Database Design**: 11 main tables with optimized indexing strategy
✓ **Backend Services**: AI integration, real-time monitoring, anomaly detection
✓ **Frontend Components**: 50+ React components organized by feature
✓ **API Specification**: 50+ endpoints across 7 resource groups
✓ **WebSocket Events**: Real-time bidirectional communication
✓ **AI Pipeline**: 4 Claude integration scenarios with prompt templates
✓ **Data Flow**: Complete lifecycle from roast start to analysis
✓ **Integration Points**: ROEST Connect + Claude API
✓ **Security**: JWT auth, RBAC, encryption strategy
✓ **Performance**: Caching, indexing, async processing
✓ **Scalability**: Horizontal scaling approach for all layers
✓ **Deployment**: CI/CD pipeline, environment configuration

This architecture supports:
- **Real-time precision roasting** with sub-second anomaly detection
- **AI-powered insights** for coffee roasting optimization
- **Big data learning** from 1000+ roasts over time
- **Multi-user scalability** with proper access controls
- **Historical analysis** with comprehensive audit trails
- **Integration** with ROEST hardware and Claude AI

The system is designed for **specialty coffee micro-lots** where precision, consistency, and data-driven improvement are essential.
