# Figure 2.2.5: API Architecture and Endpoints
## ChronicleTree RESTful API Design with Actual Implementation

**For use with app.eraser.io:**

```
title ChronicleTree API Architecture - RESTful Design

// API Gateway & Authentication
API Gateway [icon: shield, color: red] {
  Base URL: /api/v1 [icon: api, color: blue]
  JWT Authentication [icon: key, color: green]
  Rack::Attack Rate Limiting [icon: gauge, color: orange]
  CORS Configuration [icon: globe, color: purple]
}

// Core Resource Endpoints
People Management [icon: users, color: green] {
  GET /people [icon: list, color: blue]
  GET /people/:id [icon: user, color: blue]
  POST /people [icon: plus, color: green]
  PUT /people/:id [icon: edit, color: orange]
  DELETE /people/:id [icon: trash, color: red]
  GET /people/:id/tree [icon: tree, color: green]
  GET /people/full_tree [icon: network, color: purple]
}

Relationship Management [icon: link, color: orange] {
  GET /relationships [icon: list, color: blue]
  POST /relationships [icon: plus, color: green]
  PUT /relationships/:id [icon: edit, color: orange]
  DELETE /relationships/:id [icon: trash, color: red]
  POST /relationships/validate [icon: check, color: green]
  GET /relationships/calculate [icon: calculator, color: purple]
}

Authentication System [icon: key, color: green] {
  POST /auth/signup [icon: user-plus, color: green]
  POST /auth/login [icon: log-in, color: blue]
  POST /auth/logout [icon: log-out, color: red]
  POST /auth/refresh [icon: refresh, color: orange]
  POST /auth/password/reset [icon: lock, color: purple]
}

Media Management [icon: image, color: red] {
  GET /media [icon: list, color: blue]
  POST /media/upload [icon: upload, color: green]
  GET /media/:id [icon: image, color: blue]
  PUT /media/:id [icon: edit, color: orange]
  DELETE /media/:id [icon: trash, color: red]
  GET /media/gallery/:person_id [icon: camera, color: purple]
}

Timeline & Facts [icon: calendar, color: teal] {
  GET /timeline/:person_id [icon: list, color: blue]
  POST /timeline_items [icon: plus, color: green]
  PUT /timeline_items/:id [icon: edit, color: orange]
  DELETE /timeline_items/:id [icon: trash, color: red]
  GET /facts/:person_id [icon: list, color: blue]
  POST /facts [icon: plus, color: green]
  PUT /facts/:id [icon: edit, color: orange]
  DELETE /facts/:id [icon: trash, color: red]
}

Social Sharing [icon: share, color: yellow] {
  POST /shares/create [icon: plus, color: green]
  GET /shares/:token [icon: eye, color: blue]
  DELETE /shares/:token [icon: trash, color: red]
  GET /share/profile/:token [icon: user, color: blue]
  GET /share/tree/:token [icon: tree, color: green]
}

// API Flow Connections
API Gateway >> People Management: JWT Validation
API Gateway >> Relationship Management: Rate Limited Access
API Gateway >> Authentication System: Token Management
API Gateway >> Media Management: File Upload Security
API Gateway >> Timeline & Facts: Data Validation
API Gateway >> Social Sharing: Public Access Control

People Management >> Relationship Management: Family Connections
People Management >> Media Management: Profile Images
People Management >> Timeline & Facts: Life Events
Relationship Management >> People Management: Member Validation
Social Sharing >> People Management: Profile Access
Social Sharing >> Relationship Management: Tree Generation
```

**API Implementation Details:**

**Authentication Flow:**
- JWT tokens with 24-hour expiration
- Refresh token mechanism for seamless sessions
- Comprehensive denylist with 42+ blocked tokens
- User-scoped data access ensuring privacy

**Rate Limiting Strategy:**
- General API: 300 requests per 5 minutes per IP
- User-specific: 1000 requests per hour per authenticated user
- Authentication endpoints: 5 login attempts per 20 seconds
- Media uploads: 20 files per hour per user

**Performance Characteristics:**
- Average API response: 156ms for standard operations
- Complex relationship queries: 204ms average
- Image generation endpoints: 223-334ms processing time
- Database optimization with proper indexing

**Data Validation:**
- Comprehensive input sanitization
- Temporal consistency checking for life events
- Relationship validation via BloodRelationshipDetector
- File type and size validation for media uploads

**Error Handling:**
- Standardized JSON error responses
- HTTP status codes following REST conventions
- Detailed validation error messages
- Request ID tracking for debugging