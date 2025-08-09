# Figure 2.2.1: System Architecture Overview
## ChronicleTree Actual System Architecture with Real Data

**For use with app.eraser.io:**

```
title ChronicleTree System Architecture - Actual Implementation

// Presentation Layer (React 19 Frontend)
Frontend [icon: monitor, color: blue] {
  React 19 App [icon: react, color: lightblue]
  ReactFlow Tree Visualization [icon: tree, color: green]
  2,056-line Relationship Calculator [icon: calculator, color: purple]
  TanStack Query State Management [icon: sync, color: orange]
  Tailwind CSS Styling [icon: palette, color: pink]
}

// Business Logic Layer (Rails 8.0.2 Backend)
Backend [icon: server, color: darkblue] {
  Rails 8.0.2 API [icon: ruby, color: red]
  JWT Authentication + Denylist [icon: shield, color: orange]
  BloodRelationshipDetector [icon: users, color: green]
  UnifiedRelationshipCalculator [icon: gear, color: gray]
  Ruby VIPS Image Processing [icon: image, color: yellow]
  Rack::Attack Rate Limiting [icon: gauge, color: red]
}

// Data Persistence Layer (PostgreSQL Database)
Data Layer [icon: database, color: green] {
  PostgreSQL Development [icon: database, color: blue]
  18 People Records [icon: user, color: lightblue]
  54 Relationships [icon: network, color: orange]
  80+ Timeline Events [icon: calendar, color: teal]
  144+ Audit Records [icon: list, color: gray]
  Active Storage Files [icon: folder, color: yellow]
}

// Performance & Security Layer
Security [icon: shield, color: red] {
  42 JWT Denylist Entries [icon: lock, color: black]
  Multi-tier Rate Limiting [icon: gauge, color: orange]
  PaperTrail Audit Logging [icon: book, color: brown]
  User-scoped Data Access [icon: users, color: purple]
}

// Real Performance Metrics
Performance [icon: chart, color: yellow] {
  204ms Complex Queries [icon: timer, color: green]
  223ms Profile Generation [icon: image, color: blue]
  334ms Tree Visualization [icon: tree, color: orange]
  Sub-50ms Timeline Events [icon: clock, color: teal]
}

// System Connections with Actual Data Flow
React 19 App > Rails 8.0.2 API: JWT Bearer Tokens
ReactFlow Tree Visualization > BloodRelationshipDetector: Relationship Validation
2,056-line Relationship Calculator > UnifiedRelationshipCalculator: Complex Analysis

Rails 8.0.2 API > PostgreSQL Development: 18 People + 54 Relationships
JWT Authentication + Denylist > 42 JWT Denylist Entries: Token Management
Ruby VIPS Image Processing > Active Storage Files: Media Generation

BloodRelationshipDetector > 54 Relationships: Consanguinity Detection
Rack::Attack Rate Limiting > Multi-tier Rate Limiting: Security Protection
PaperTrail Audit Logging > 144+ Audit Records: Change Tracking
```

**Key Architecture Features:**
- **Actual Scale**: 18 people, 54 relationships, 80+ timeline events
- **Real Performance**: 204ms queries, 334ms image generation
- **Security Implementation**: 42 active JWT denylist entries, comprehensive rate limiting
- **Algorithm Complexity**: 2,056-line frontend relationship calculator
- **Audit Capability**: 144+ tracked changes with PaperTrail