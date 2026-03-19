# RoastMaster AI - Backend API Response Formats

## Authentication Endpoints

### POST /auth/register
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "jsmith",
  "fullName": "John Smith",
  "organizationName": "Smith Coffee Co",
  "roesterSerialNumber": "L200-12345"
}
```

**Response (201 Created)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "jsmith",
    "fullName": "John Smith",
    "role": "roaster",
    "organizationName": "Smith Coffee Co",
    "roesterSerialNumber": "L200-12345",
    "isActive": true,
    "lastLoginAt": null,
    "createdAt": "2026-03-19T10:30:00Z",
    "updatedAt": "2026-03-19T10:30:00Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

---

### POST /auth/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "jsmith",
    "fullName": "John Smith",
    "role": "roaster",
    "organizationName": "Smith Coffee Co",
    "roesterSerialNumber": "L200-12345",
    "isActive": true,
    "lastLoginAt": "2026-03-19T10:35:00Z",
    "createdAt": "2026-03-19T10:30:00Z",
    "updatedAt": "2026-03-19T10:35:00Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

---

### GET /auth/me
**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "jsmith",
  "fullName": "John Smith",
  "role": "roaster",
  "organizationName": "Smith Coffee Co",
  "roesterSerialNumber": "L200-12345",
  "isActive": true,
  "lastLoginAt": "2026-03-19T10:35:00Z",
  "createdAt": "2026-03-19T10:30:00Z",
  "updatedAt": "2026-03-19T10:35:00Z"
}
```

---

### PUT /auth/profile
**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "fullName": "John Q Smith",
  "organizationName": "Updated Coffee Co",
  "roesterSerialNumber": "L200-54321"
}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "jsmith",
  "fullName": "John Q Smith",
  "role": "roaster",
  "organizationName": "Updated Coffee Co",
  "roesterSerialNumber": "L200-54321",
  "isActive": true,
  "lastLoginAt": "2026-03-19T10:35:00Z",
  "createdAt": "2026-03-19T10:30:00Z",
  "updatedAt": "2026-03-19T11:00:00Z"
}
```

---

### POST /auth/refresh
**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

---

### POST /auth/change-password
**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password changed successfully"
}
```

---

### POST /auth/logout
**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## Coffee Endpoints

### GET /api/coffees
**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ethiopian Yirgacheffe",
    "origin_country": "Ethiopia",
    "region": "Yirgacheffe",
    "farm": "Gedeo Zone",
    "variety": "Heirloom",
    "processing_method": "Washed",
    "altitude": 2000,
    "moisture_content": 11.5,
    "density": 750,
    "screen_size": 18,
    "harvest_year": 2025,
    "flavor_notes": "Floral, tea-like, bright acidity",
    "quantity_kg": 50.0,
    "notes": "Limited edition micro-lot",
    "created_at": "2026-03-19T10:30:00Z",
    "updated_at": "2026-03-19T10:30:00Z"
  }
]
```

---

### POST /api/coffees
**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "name": "Ethiopian Yirgacheffe",
  "origin_country": "Ethiopia",
  "region": "Yirgacheffe",
  "farm": "Gedeo Zone",
  "variety": "Heirloom",
  "processing_method": "Washed",
  "altitude": 2000,
  "moisture_content": 11.5,
  "density": 750,
  "screen_size": 18,
  "harvest_year": 2025,
  "flavor_notes": "Floral, tea-like, bright acidity",
  "quantity_kg": 50.0,
  "notes": "Limited edition micro-lot"
}
```

**Response (201 Created)**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ethiopian Yirgacheffe",
  "origin_country": "Ethiopia",
  "region": "Yirgacheffe",
  "farm": "Gedeo Zone",
  "variety": "Heirloom",
  "processing_method": "Washed",
  "altitude": 2000,
  "moisture_content": 11.5,
  "density": 750,
  "screen_size": 18,
  "harvest_year": 2025,
  "flavor_notes": "Floral, tea-like, bright acidity",
  "quantity_kg": 50.0,
  "notes": "Limited edition micro-lot",
  "created_at": "2026-03-19T10:30:00Z",
  "updated_at": "2026-03-19T10:30:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Registration failed"
}
```

---

## Token Information

**accessToken**:
- Expires: 7 days (604800 seconds)
- Used for: All protected API requests
- Header format: `Authorization: Bearer {accessToken}`

**refreshToken**:
- Expires: 30 days
- Used for: Obtaining new access token
- Sent to: POST /auth/refresh endpoint

**JWT Payload (accessToken)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "roaster",
  "iat": 1710835200,
  "exp": 1711440000
}
```

**JWT Payload (refreshToken)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "roaster",
  "type": "refresh",
  "iat": 1710835200,
  "exp": 1713427200
}
```
