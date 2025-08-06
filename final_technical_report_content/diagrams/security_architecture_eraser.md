# ChronicleTree Security Architecture - Eraser.io Diagram

```
// ChronicleTree Comprehensive Security Architecture
// Multi-layered security with Rack::Attack, Paper Trail, and monitoring
// For use with app.eraser.io

title ChronicleTree Security Architecture - Multi-Layer Protection

Client Layer [icon: laptop, label: "Client Layer"] {
  React Client [icon: react]
  Public Access [icon: globe]
  Mobile App [icon: mobile]
}

Security Gateway [icon: shield, label: "Security Gateway"] {
  Rate Limiting [label: "Rate Limiting"] {
    Rack Attack [icon: block]
    Redis Cache [icon: memory]
  }
  
  Request Monitoring [label: "Request Monitoring"] {
    Security Middleware [icon: security]
    Request Logger [icon: file-text]
  }
}

Application Layer [icon: server, label: "Application Layer"] {
  API Services [label: "API Services"] {
    Rails API [icon: ruby]
    Authentication [icon: key]
    Authorization [icon: lock]
  }
  
  Background Jobs [label: "Background Jobs"] {
    Sidekiq Worker [icon: clock]
    Job Queue [icon: queue]
  }
}

Audit & Monitoring [icon: monitor, label: "Audit & Monitoring"] {
  Activity Tracking [label: "Activity Tracking"] {
    Audit Logger [icon: file-text]
    Paper Trail [icon: history]
  }
  
  Security Events [label: "Security Events"] {
    Violation Logger [icon: alert]
    Threat Detection [icon: radar]
  }
}

Data Layer [icon: database, label: "Data Layer"] {
  Primary Storage [label: "Primary Storage"] {
    PostgreSQL [icon: database]
    User Data [icon: users]
  }
  
  Cache & Logs [label: "Cache & Logs"] {
    Redis Cache [icon: memory]
    Log Storage [icon: file]
  }
}

// Security Flow Connections
React Client > Rack Attack > Security Middleware > Rails API > PostgreSQL
Rack Attack > Redis Cache
Security Middleware > Audit Logger > Log Storage
Rails API > Paper Trail > PostgreSQL
Threat Detection > Violation Logger > Log Storage

// Rate Limiting Flow
Public Access > Rack Attack
Mobile App > Rack Attack

// Background Processing
Rails API > Sidekiq Worker > Job Queue
Sidekiq Worker > PostgreSQL

// Audit Trail Flow
Authentication > Paper Trail
Authorization > Audit Logger
```

## Security Architecture Overview

### Multi-Layer Protection Strategy

**Client Layer Protection**
- Universal rate limiting for all client types (React, Public, Mobile)
- Consistent security policies across access methods
- Client-agnostic security enforcement

**Security Gateway**
- **Rack::Attack Rate Limiting**: IP-based (300/5min), User-based (1000/hour), Authentication endpoint protection
- **Security Middleware**: Request/response logging, suspicious activity detection, performance monitoring
- **Redis Integration**: Real-time rate limit counters and distributed caching

**Application Layer Security**
- **API Services**: Secure REST endpoints with JWT authentication and role-based authorization
- **Background Jobs**: Secure job processing with audit trail integration
- **Authentication Flow**: JWT tokens with blacklist support and secure session management

**Audit & Monitoring**
- **Activity Tracking**: Comprehensive user action logging through Paper Trail integration
- **Security Events**: Real-time threat detection and violation logging
- **Audit Logger**: Structured JSON logging for security analysis and compliance

**Data Layer Protection**
- **Primary Storage**: PostgreSQL with user-scoped data access and SSL connections
- **Cache Security**: Redis-based rate limiting with secure counter management
- **Log Storage**: Centralized security event and audit log storage

### Key Security Features

- **Multi-layer Rate Limiting**: Protection at gateway level with Redis-backed counters
- **Comprehensive Auditing**: Complete data change tracking with user attribution
- **Threat Detection**: Real-time monitoring for suspicious activity patterns
- **Secure Data Access**: User-scoped queries preventing unauthorized data access
- **Background Security**: Audit trail integration for all background job processing
```
