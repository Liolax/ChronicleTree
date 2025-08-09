# Eraser.io Diagram Specifications for ChronicleTree Final Report

## Instructions
1. Go to https://app.eraser.io/
2. Create a new diagram for each specification below
3. Copy the provided code into the Eraser editor
4. Export as PNG/SVG at high resolution
5. Insert into the Final Report at the indicated locations

---

## Figure 2.2.1: System Architecture Overview

```eraser
// ChronicleTree Actual System Architecture
// Real implementation with 18 people, 54 relationships, 80+ timeline events

title ChronicleTree System Architecture - Actual Implementation

// Frontend Layer (React 19)
Frontend [icon: monitor, color: blue] {
  React 19 App [icon: react, color: lightblue]
  ReactFlow Tree Viz [icon: tree, color: green]
  Tailwind CSS [icon: palette, color: purple]
  TanStack Query [icon: sync, color: orange]
  Vite Build System [icon: lightning, color: yellow]
}

// Security & API Layer
API Layer [icon: shield, color: red] {
  Rack Attack Throttling [icon: gauge, color: orange]
  JWT Auth with Denylist [icon: key, color: green]
  CORS Configuration [icon: lock, color: blue]
  42 Active Denylist Entries [icon: list, color: red]
}

// Rails Backend (Actual Services)
Backend [icon: server, color: darkblue] {
  Rails 8.0.2 API [icon: ruby, color: red]
  Devise JWT Auth [icon: shield, color: orange]
  BloodRelationshipDetector [icon: gear, color: gray]
  UnifiedRelationshipCalculator [icon: calculator, color: green]
  Active Storage [icon: folder, color: blue]
  TreeSnippetGenerator [icon: image, color: purple]
}

// Background Processing (Development Setup)
Jobs [icon: clock, color: teal] {
  Redis Disabled Dev [icon: x, color: red]
  Ruby VIPS Processing [icon: image, color: green]
  223ms Profile Cards [icon: timer, color: orange]
  334ms Tree Images [icon: tree, color: blue]
}

// Actual Data Layer
Database [icon: database, color: green] {
  PostgreSQL Development [icon: database, color: blue]
  18 People Records [icon: users, color: green]
  54 Relationships [icon: network, color: orange]
  80+ Timeline Events [icon: calendar, color: purple]
  144+ PaperTrail Audits [icon: list, color: gray]
}

// Real Performance Metrics
Performance [icon: chart, color: yellow] {
  204ms Complex Queries [icon: timer, color: green]
  156ms Relationship Calc [icon: calculator, color: blue]
  Local File Storage [icon: folder, color: orange]
  Student Development Env [icon: laptop, color: purple]
}

// Actual Connections
React 19 App > API Layer: HTTPS with JWT
API Layer > Rails 8.0.2 API: Authenticated Requests
Rails API > BloodRelationshipDetector: Validation
BloodRelationshipDetector > PostgreSQL Development: 54 Relationships
TreeSnippetGenerator > Ruby VIPS Processing: 334ms Images
PaperTrail Audits > PostgreSQL Development: 144+ Records
```

---

## Figure 2.2.2: Deployment Architecture Diagram

```eraser
// ChronicleTree Actual Development Environment
// Real student development setup with actual data

title ChronicleTree Development Environment - Actual Setup

// Local Development Environment (Windows)
Development [icon: laptop, color: green] {
  Windows Development [icon: windows, color: blue]
  Ruby 3.3.7 [icon: ruby, color: red]
  Rails 8.0.2 Server [icon: server, color: darkred]
  PostgreSQL Local [icon: database, color: blue]
  Redis Disabled [icon: x, color: red]
  Vite Dev Server [icon: lightning, color: yellow]
}

// Frontend Development Stack
Frontend Dev [icon: monitor, color: blue] {
  Node.js 18+ [icon: nodejs, color: green]
  React 19 Dev Mode [icon: react, color: lightblue]
  Vite HMR [icon: lightning, color: orange]
  Tailwind JIT [icon: palette, color: purple]
  ReactFlow Debugging [icon: tree, color: green]
}

// Backend Development Services
Backend Dev [icon: server, color: darkblue] {
  Rails Console [icon: terminal, color: black]
  Database Migrations [icon: database, color: blue]
  Seed Data Generator [icon: seedling, color: green]
  PaperTrail Logging [icon: list, color: orange]
  Active Storage Local [icon: folder, color: purple]
}

// Testing & Debugging Environment
Testing [icon: check, color: green] {
  Frontend Tests [icon: react, color: blue]
  Backend Tests [icon: ruby, color: red]
  Performance Monitoring [icon: chart, color: orange]
  Code Organization [icon: folder, color: gray]
}

// Actual Data Storage
Data Storage [icon: database, color: purple] {
  18 Family Members [icon: users, color: green]
  54 Relationships [icon: network, color: orange]
  80+ Timeline Events [icon: calendar, color: blue]
  144+ Audit Records [icon: list, color: gray]
  Local Media Files [icon: image, color: yellow]
}

// Development Tools & Configuration
Dev Tools [icon: gear, color: teal] {
  Claude Code CLI [icon: terminal, color: black]
  Git Version Control [icon: git, color: orange]
  Configuration Files [icon: settings, color: gray]
  Professional Code Style [icon: check, color: green]
}

// Student Development Flow
Development > Frontend Dev: Live Reload
Frontend Dev > Backend Dev: API Calls
Backend Dev > Data Storage: CRUD Operations  
Data Storage > Testing: Real Data Validation
Testing > Dev Tools: Code Quality
Dev Tools > Development: Continuous Improvement
```

---

## Figure 2.2.3: Technology Stack Integration

```eraser
// ChronicleTree Technology Stack Integration
// Shows how technologies work together

title Technology Stack Integration - ChronicleTree

// Frontend Stack
Frontend Stack [icon: layers, color: blue] {
  React 19 [icon: react, color: lightblue]
  Vite [icon: lightning, color: yellow]
  ReactFlow [icon: tree, color: green]
  Tailwind CSS [icon: palette, color: purple]
  React Router [icon: route, color: orange]
  React Hook Form [icon: form, color: red]
  TanStack Query [icon: sync, color: teal]
  Axios [icon: api, color: blue]
}

// Backend Stack  
Backend Stack [icon: layers, color: red] {
  Ruby on Rails 8.0.2 [icon: ruby, color: red]
  Devise + JWT [icon: key, color: green]
  Active Storage [icon: folder, color: orange]
  Active Model Serializers [icon: transform, color: purple]
  Sidekiq [icon: gear, color: red]
  Solid Queue [icon: queue, color: blue]
  Paper Trail [icon: history, color: gray]
  Rack CORS [icon: shield, color: yellow]
}

// Data Layer
Data Layer [icon: layers, color: green] {
  PostgreSQL 16 [icon: database, color: blue]
  Redis [icon: memory, color: red]
  Active Record [icon: database, color: green]
  Database Migrations [icon: sync, color: orange]
}

// Development Tools
Dev Tools [icon: tools, color: purple] {
  Git/GitHub [icon: git, color: orange]
  Docker [icon: docker, color: blue]
  Vitest [icon: test, color: green]
  Rails Minitest [icon: test, color: yellow]
  ESLint [icon: check, color: red]
  Rubocop [icon: check, color: purple]
  Brakeman [icon: shield, color: orange]
}

// Integration Points
React 19 > Axios: HTTP Client
Axios > Ruby on Rails 8.0.2: API Calls
TanStack Query > Axios: Cache Management
Ruby on Rails 8.0.2 > PostgreSQL 16: ORM
Ruby on Rails 8.0.2 > Redis: Caching
Active Storage > Local Storage: File Storage
Devise + JWT > React 19: Auth Tokens
ReactFlow > TanStack Query: Tree Data
```

---

## Figure 2.2.4: Database Entity Relationship Diagram

```eraser
// ChronicleTree Database ERD
// Complete entity relationships

title Database Entity Relationship Diagram

// Users table
users [icon: user, color: blue] {
  id: bigint PK
  email: string unique
  encrypted_password: string
  name: string
  created_at: datetime
  updated_at: datetime
  reset_password_token: string
  confirmation_token: string
  last_sign_in_at: datetime
}

// People table  
people [icon: users, color: green] {
  id: bigint PK
  user_id: bigint FK
  first_name: string
  last_name: string
  birth_date: date
  death_date: date
  gender: string
  is_living: boolean
  birth_place: string
  death_place: string
  biography: text
  created_at: datetime
  updated_at: datetime
}

// Relationships table
relationships [icon: link, color: orange] {
  id: bigint PK
  person_id: bigint FK
  relative_id: bigint FK
  relationship_type: string
  created_at: datetime
  updated_at: datetime
  start_date: date
  end_date: date
}

// Media table
media [icon: image, color: purple] {
  id: bigint PK
  person_id: bigint FK
  file_url: string
  file_type: string
  title: string
  description: text
  date_taken: date
  created_at: datetime
  updated_at: datetime
}

// Timeline Items table
timeline_items [icon: clock, color: teal] {
  id: bigint PK
  person_id: bigint FK
  title: string
  description: text
  event_date: date
  event_type: string
  location: string
  created_at: datetime
  updated_at: datetime
}

// Facts table (polymorphic)
facts [icon: list, color: red] {
  id: bigint PK
  factable_type: string
  factable_id: bigint
  fact_type: string
  value: text
  date: date
  location: string
  created_at: datetime
  updated_at: datetime
}

// Share Links table
share_links [icon: share, color: yellow] {
  id: bigint PK
  user_id: bigint FK
  shareable_type: string
  shareable_id: bigint
  token: string unique
  expires_at: datetime
  view_count: integer
  created_at: datetime
  updated_at: datetime
}

// Audit Logs table
audit_logs [icon: shield, color: gray] {
  id: bigint PK
  user_id: bigint FK
  action: string
  auditable_type: string
  auditable_id: bigint
  changes: jsonb
  ip_address: string
  user_agent: string
  created_at: datetime
}

// Relationships
users -- people: has_many
people -- relationships: has_many
people -- relationships: has_many (as relative)
people -- media: has_many
people -- timeline_items: has_many
people -- facts: has_many (polymorphic)
users -- share_links: has_many
users -- audit_logs: has_many
```

---

## Figure 2.2.5: API Architecture and Endpoints

```eraser
// ChronicleTree API Architecture
// RESTful endpoints organization

title API Architecture and Endpoints

// API Root
API v1 [icon: api, color: blue] {
  Base URL: /api/v1
  Format: JSON
  Auth: JWT Bearer
}

// Authentication Endpoints
Auth [icon: key, color: green] {
  POST /auth/signup
  POST /auth/login
  POST /auth/logout
  POST /auth/refresh
  POST /auth/forgot-password
  POST /auth/reset-password
  GET /auth/verify-email
}

// People Management
People [icon: users, color: orange] {
  GET /people (index)
  GET /people/:id (show)
  POST /people (create)
  PUT /people/:id (update)
  DELETE /people/:id (destroy)
  GET /people/:id/tree (family tree)
  GET /people/:id/ancestors
  GET /people/:id/descendants
}

// Relationships
Relationships [icon: link, color: purple] {
  GET /relationships
  POST /relationships
  PUT /relationships/:id
  DELETE /relationships/:id
  GET /relationships/calculate
  POST /relationships/validate
}

// Media Management
Media [icon: image, color: red] {
  GET /media
  POST /media/upload
  GET /media/:id
  PUT /media/:id
  DELETE /media/:id
  POST /media/batch-upload
  GET /media/gallery/:person_id
}

// Timeline & Facts
Timeline [icon: clock, color: teal] {
  GET /timeline/:person_id
  POST /timeline_items
  PUT /timeline_items/:id
  DELETE /timeline_items/:id
  GET /facts/:person_id
  POST /facts
  PUT /facts/:id
  DELETE /facts/:id
}

// Tree Operations
Trees [icon: tree, color: green] {
  GET /trees/:user_id
  GET /trees/:id/export
  POST /trees/import
  GET /trees/:id/statistics
  POST /trees/:id/center-on
  GET /trees/:id/3d-view
}

// Search & Discovery
Search [icon: search, color: yellow] {
  GET /search/people
  GET /search/relationships
  GET /search/advanced
  GET /suggestions/relationships
  GET /suggestions/missing-data
}

// Sharing
Sharing [icon: share, color: blue] {
  POST /share/create-link
  GET /share/:token
  DELETE /share/:token
  GET /share/stats/:token
}

// Flow
API v1 > Auth: Requires for all
Auth > People: Authenticated requests
Auth > Relationships: Authenticated requests
Auth > Media: Authenticated requests
Auth > Timeline: Authenticated requests
Auth > Trees: Authenticated requests
Auth > Search: Authenticated requests
Auth > Sharing: Authenticated requests
```

---

## Figure 2.3.3: Authentication Flow Sequence

```eraser
// ChronicleTree Authentication Flow
// Sequence diagram for auth process

sequence Authentication Flow

// Actors
User [icon: user, color: blue]
Frontend [icon: monitor, color: green]
API Gateway [icon: shield, color: red]
Auth Service [icon: key, color: orange]
Database [icon: database, color: purple]
Token Store [icon: memory, color: teal]

// Login Flow
User -> Frontend: Enter credentials
Frontend -> API Gateway: POST /auth/login
API Gateway -> Auth Service: Validate request
Auth Service -> Database: Check credentials
Database -> Auth Service: User record
Auth Service -> Auth Service: Generate JWT
Auth Service -> Token Store: Store refresh token
Auth Service -> API Gateway: JWT + Refresh token
API Gateway -> Frontend: Auth response
Frontend -> Frontend: Store tokens
Frontend -> User: Login success

// Authenticated Request
User -> Frontend: Access protected page
Frontend -> Frontend: Get JWT from storage
Frontend -> API Gateway: GET /api/v1/people\n(Bearer token)
API Gateway -> API Gateway: Validate JWT
API Gateway -> Auth Service: Verify token
Auth Service -> Token Store: Check blacklist
Token Store -> Auth Service: Token valid
Auth Service -> API Gateway: Authorized
API Gateway -> Database: Fetch data
Database -> API Gateway: People data
API Gateway -> Frontend: JSON response
Frontend -> User: Display data

// Token Refresh
Frontend -> API Gateway: Token expired
API Gateway -> Frontend: 401 Unauthorized
Frontend -> API Gateway: POST /auth/refresh
API Gateway -> Auth Service: Refresh token
Auth Service -> Token Store: Validate refresh
Token Store -> Auth Service: Valid
Auth Service -> Auth Service: Generate new JWT
Auth Service -> API Gateway: New tokens
API Gateway -> Frontend: Updated tokens
Frontend -> Frontend: Store new tokens
Frontend -> API Gateway: Retry request

// Logout
User -> Frontend: Click logout
Frontend -> API Gateway: POST /auth/logout
API Gateway -> Auth Service: Logout request
Auth Service -> Token Store: Blacklist tokens
Token Store -> Auth Service: Confirmed
Auth Service -> API Gateway: Success
API Gateway -> Frontend: Logged out
Frontend -> Frontend: Clear storage
Frontend -> User: Redirect to login
```

---

## Figure 2.3.2: Blood Relationship Detection Service

```eraser
// ChronicleTree Blood Relationship Detection Algorithm
// Real implementation from BloodRelationshipDetector service

title Blood Relationship Detection Service - ChronicleTree

// Main Detection Service
Blood Relationship Detector [icon: shield, color: red] {
  Person 1 Input [icon: user, color: blue]
  Person 2 Input [icon: user, color: green]
  Validation Engine [icon: gear, color: orange]
  Relationship Analysis [icon: network, color: purple]
  Marriage Permission [icon: check, color: green]
}

// Validation Rules (Real Implementation)
Validation Rules [icon: list, color: orange] {
  Direct Parent-Child [icon: x, color: red]
  Siblings Detection [icon: users, color: orange]
  Ancestor-Descendant [icon: tree, color: green]
  Uncle/Aunt-Nephew/Niece [icon: family, color: blue]
  First Cousins [icon: network, color: purple]
}

// Algorithm Flow
Algorithm Flow [icon: workflow, color: blue] {
  Check Nil Values [icon: check, color: gray]
  Same Person Check [icon: equals, color: gray]
  Direct Relationships [icon: link, color: red]
  Ancestor Traversal [icon: search, color: orange]
  BFS Queue Processing [icon: queue, color: green]
  Relationship Validation [icon: shield, color: blue]
}

// Output Results
Detection Results [icon: chart, color: green] {
  Blood Related True/False [icon: boolean, color: blue]
  Marriage Allowed [icon: heart, color: green]
  Sibling Allowed [icon: users, color: orange]
  Validation Errors [icon: warning, color: red]
}

// Real Data Processing
Real Family Data [icon: database, color: purple] {
  18 People Records [icon: users, color: green]
  54 Relationships [icon: network, color: orange]
  Complex Family Trees [icon: tree, color: blue]
  Multi-Generation Data [icon: layers, color: gray]
}

// Flow connections
Blood Relationship Detector > Validation Rules: Apply Rules
Validation Rules > Algorithm Flow: Process Logic
Algorithm Flow > Detection Results: Return Status
Real Family Data > Blood Relationship Detector: Input Data
Detection Results > Real Family Data: Update Permissions
```

---

## Figure 2.3.3: Profile Card Generator with Adaptive Layout

```eraser
// ChronicleTree Dynamic Image Generation System
// Ruby VIPS powered profile card generation

title Profile Card Generator - Dynamic Image Generation

// Profile Card Generator
Profile Generator [icon: image, color: blue] {
  Person Data Input [icon: user, color: green]
  Content Analysis [icon: search, color: orange]
  Dynamic Height Calc [icon: ruler, color: purple]
  SVG Canvas Creation [icon: canvas, color: blue]
  VIPS Image Processing [icon: gear, color: red]
}

// Content Sections (Real Implementation)
Content Sections [icon: layers, color: green] {
  Basic Information [icon: card, color: blue]
  Timeline Events [icon: clock, color: orange]
  Relationships [icon: network, color: purple]
  Custom Facts [icon: list, color: gray]
  Media Attachments [icon: image, color: yellow]
}

// Dynamic Layout Engine
Layout Engine [icon: grid, color: purple] {
  Two-Column Layout [icon: columns, color: blue]
  Adaptive Height 750-1200px [icon: resize, color: orange]
  Content-Based Sizing [icon: expand, color: green]
  Step-Relationship Detection [icon: step, color: red]
  Relationship Status Logic [icon: status, color: gray]
}

// VIPS Processing Pipeline
VIPS Pipeline [icon: workflow, color: red] {
  SVG to Buffer [icon: transform, color: blue]
  High-Quality JPEG [icon: image, color: green]
  Q90 Optimization [icon: compress, color: orange]
  Strip Metadata [icon: clean, color: gray]
  223ms Average Generation [icon: timer, color: yellow]
}

// File Management
File Management [icon: folder, color: orange] {
  Unique Filename Generation [icon: tag, color: blue]
  ShareImage Database [icon: database, color: green]
  Expiration Management [icon: clock, color: red]
  Storage Integration [icon: storage, color: purple]
}

// Performance Metrics (Real Data)
Performance Data [icon: chart, color: yellow] {
  223ms Profile Cards [icon: timer, color: green]
  334ms Tree Images [icon: tree, color: blue]
  Ruby VIPS Processing [icon: ruby, color: red]
  File Size Optimization [icon: compress, color: orange]
}

// Flow connections
Profile Generator > Content Sections: Analyze Data
Content Sections > Layout Engine: Calculate Layout
Layout Engine > VIPS Pipeline: Generate Image
VIPS Pipeline > File Management: Save File
Performance Data > Profile Generator: Optimize Process
File Management > Performance Data: Track Metrics
```

---

## Figure 2.3.4: ReactFlow Family Tree Implementation

```eraser
// ChronicleTree ReactFlow Tree Visualization Engine
// Real implementation with actual layout utilities

title ReactFlow Family Tree Engine - Actual Implementation

// ReactFlow Components
ReactFlow Engine [icon: tree, color: green] {
  FamilyTreeFlow Component [icon: react, color: blue]
  Person Card Nodes [icon: card, color: orange]
  Relationship Edges [icon: link, color: purple]
  Layout Utilities [icon: grid, color: gray]
  Navigation Controls [icon: controls, color: yellow]
}

// Layout Utilities (Real Files)
Layout Utilities [icon: tools, color: blue] {
  familyTreeHierarchicalLayout.js [icon: file, color: green]
  antiOverlapLayout.js [icon: prevent, color: orange]
  visualConfiguration.js [icon: palette, color: purple]
  improvedRelationshipCalculator.js [icon: calculator, color: red]
}

// Relationship Logic (Real Implementation)
Relationship Logic [icon: network, color: purple] {
  shouldMarkAsLateSpouse [icon: heart-broken, color: gray]
  Deceased Status Tracking [icon: cross, color: red]
  Marriage in Heaven Logic [icon: heaven, color: blue]
  Step-Relationship Detection [icon: step, color: orange]
  Bidirectional Connections [icon: arrows, color: green]
}

// Tree Navigation Features
Navigation Features [icon: navigation, color: yellow] {
  Dynamic Root Selection [icon: root, color: green]
  Full Tree Toggle [icon: expand, color: blue]
  Show/Hide Unrelated [icon: filter, color: orange]
  Auto-Fit Functionality [icon: fit, color: purple]
  Pan and Zoom Controls [icon: zoom, color: gray]
}

// Visual Styling System
Visual Styling [icon: palette, color: orange] {
  Gender Color Coding [icon: colors, color: blue]
  Relationship Line Types [icon: lines, color: green]
  Node Border Styles [icon: border, color: purple]
  Hover State Effects [icon: cursor, color: gray]
  Mobile Responsive Design [icon: mobile, color: yellow]
}

// Real Data Integration
Data Integration [icon: database, color: green] {
  18 People Nodes [icon: users, color: blue]
  54 Relationship Edges [icon: network, color: orange]
  URL Parameter Support [icon: link, color: purple]
  Query Invalidation [icon: refresh, color: red]
  Performance Optimization [icon: speed, color: yellow]
}

// Flow connections
ReactFlow Engine > Layout Utilities: Generate Layout
Layout Utilities > Relationship Logic: Apply Rules
Relationship Logic > Navigation Features: Enable Controls
Navigation Features > Visual Styling: Apply Styles
Visual Styling > Data Integration: Render Data
Data Integration > ReactFlow Engine: Update Display
```

---

## Figure 2.4.1: Actual Test File Distribution

```eraser
// ChronicleTree Real Testing Infrastructure
// Actual test files and frameworks implemented

title Actual Testing Infrastructure - ChronicleTree

// Frontend Testing Stack (Real)
Frontend Testing [icon: test, color: blue] {
  Vitest 3.2.4 Framework [icon: vitest, color: green]
  Testing Library React [icon: react, color: blue]
  33+ Test Files [icon: files, color: orange]
  improvedRelationshipCalculator.test.js [icon: file, color: purple]
  Login.test.jsx [icon: file, color: yellow]
}

// Backend Testing Stack (Real)
Backend Testing [icon: test, color: red] {
  Rails Minitest Framework [icon: ruby, color: red]
  32+ Test Scripts [icon: files, color: orange]
  test_extended_family.rb [icon: file, color: green]
  PostgreSQL Test Database [icon: database, color: blue]
  Image Generation Tests [icon: image, color: purple]
}

// Test Categories (Actual Count)
Test Categories [icon: category, color: green] {
  Unit Tests 23+ files [icon: gear, color: blue]
  Integration Tests 22+ files [icon: network, color: orange]
  Manual Tests 15+ files [icon: hand, color: purple]
  Performance Tests 5 files [icon: speed, color: yellow]
  Total 65+ Test Files [icon: sum, color: red]
}

// Testing Frameworks (Real Implementation)
Real Frameworks [icon: framework, color: purple] {
  Vitest Configuration [icon: config, color: blue]
  jsdom Environment [icon: browser, color: green]
  Rails Test Suite [icon: rails, color: red]
  Brakeman Security Scan [icon: shield, color: orange]
  ESLint Code Quality [icon: check, color: yellow]
}

// Test Execution (Actual Commands)
Test Execution [icon: play, color: yellow] {
  npm test (Frontend) [icon: npm, color: green]
  Rails Test Suite [icon: rails, color: red]
  Vitest Runner [icon: runner, color: blue]
  Security Scanning [icon: scan, color: orange]
  Performance Monitoring [icon: monitor, color: purple]
}

// Real Performance Data
Performance Results [icon: chart, color: orange] {
  204ms Query Times [icon: timer, color: green]
  334ms Image Generation [icon: image, color: blue]
  0 Security Vulnerabilities [icon: shield, color: green]
  65+ Test Files Maintained [icon: maintenance, color: purple]
}

// Flow connections
Frontend Testing > Test Categories: Organize Tests
Backend Testing > Test Categories: Organize Tests
Test Categories > Real Frameworks: Execute With
Real Frameworks > Test Execution: Run Commands
Test Execution > Performance Results: Measure Results
Performance Results > Frontend Testing: Validate Performance
```

---

## Figure 2.6.1: Quality Assurance Architecture

```eraser
// ChronicleTree Quality Assurance Architecture
// Testing, CI/CD, and code quality systems

title Quality Assurance Architecture - ChronicleTree

// Frontend Testing Stack
Frontend Testing [icon: test, color: blue] {
  Vitest 3.2.4 [icon: test, color: green]
  Testing Library [icon: check, color: blue]
  20+ Test Files [icon: files, color: orange]
  Integration Tests [icon: network, color: purple]
  Manual Accessibility Testing [icon: eye, color: teal]
}

// Backend Testing Stack
Backend Testing [icon: test, color: red] {
  Rails Minitest [icon: ruby, color: red]
  30+ Test Scripts [icon: files, color: orange]
  PostgreSQL Test DB [icon: database, color: blue]
  Unit Tests [icon: gear, color: green]
  Integration Tests [icon: network, color: purple]
}

// Code Quality Enforcement
Code Quality [icon: check, color: green] {
  ESLint 8.57.0 [icon: check, color: blue]
  React Plugins [icon: react, color: lightblue]
  Rubocop Rails Omakase [icon: ruby, color: red]
  0 Violations [icon: shield, color: green]
  Component Architecture [icon: layers, color: purple]
}

// Security & Vulnerability Scanning
Security Scanning [icon: shield, color: red] {
  Brakeman Static Analysis [icon: shield, color: orange]
  0 High-Risk Issues [icon: check, color: green]
  Vulnerability Detection [icon: search, color: red]
  Security Best Practices [icon: lock, color: blue]
}

// CI/CD Pipeline
CI/CD Pipeline [icon: sync, color: purple] {
  GitHub Actions [icon: github, color: orange]
  Automated Testing [icon: robot, color: green]
  Ruby & Node.js Setup [icon: gear, color: blue]
  PostgreSQL Test DB [icon: database, color: teal]
  Deployment Validation [icon: check, color: red]
}

// Automated Maintenance
Maintenance [icon: gear, color: teal] {
  Dependabot [icon: robot, color: orange]
  Daily Dependency Updates [icon: sync, color: blue]
  Security Patches [icon: shield, color: red]
  Version Management [icon: tag, color: green]
}

// Development Workflow
Dev Workflow [icon: workflow, color: yellow] {
  Docker Containers [icon: docker, color: blue]
  Multi-stage Builds [icon: layers, color: purple]
  SSL Configuration [icon: lock, color: green]
  Environment Validation [icon: check, color: orange]
}

// Quality Metrics
Quality Metrics [icon: chart, color: orange] {
  Test Coverage Tracking [icon: percentage, color: green]
  Performance Monitoring [icon: speed, color: blue]
  Code Documentation [icon: book, color: purple]
  Architecture Standards [icon: building, color: red]
}

// Flow connections
Frontend Testing > Code Quality: Standards Enforcement
Backend Testing > Security Scanning: Vulnerability Check
Code Quality > CI/CD Pipeline: Automated Validation
Security Scanning > CI/CD Pipeline: Security Gates
CI/CD Pipeline > Maintenance: Automated Updates
Maintenance > Dev Workflow: Dependency Management
Dev Workflow > Quality Metrics: Performance Tracking
Quality Metrics > Frontend Testing: Feedback Loop
```

---

## Tips for Creating Diagrams:

1. **Color Coding**: Use consistent colors across diagrams
   - Blue for frontend/user-facing
   - Red/Orange for backend/server
   - Green for database/storage
   - Purple for specialized services

2. **Icons**: Choose meaningful icons that represent each component

3. **Layout**: Arrange components logically
   - Top-to-bottom for layers
   - Left-to-right for flow
   - Group related components

4. **Export Settings**:
   - Use high resolution (300 DPI)
   - PNG for documents
   - SVG for web/scalable

5. **Naming**: Save with exact figure numbers for easy reference

Remember to export each diagram and insert into the Final Report at the placeholder locations marked with [PLACEHOLDER FOR ERASER DIAGRAM].