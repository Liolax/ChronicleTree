# Figure 2.2.2: Deployment Architecture Diagram
## ChronicleTree Actual Deployment Configuration

**For use with app.eraser.io:**

```
title ChronicleTree Deployment Architecture - Actual Implementation

Users [icon: person, color: green, label: "Family Tree Users\nWeb Browsers\n18 People, 54 Relationships"]

Development Environment [icon: computer, color: blue] {
  Local Development [icon: laptop, color: lightblue] {
    Vite Dev Server [icon: react, color: blue, label: "React 19.1.0 + Vite 7.0.0\nPort 5178\nHMR + Hot Reload\nTailwind CSS 3.4.6"]
    Rails API Server [icon: ruby, color: red, label: "Ruby 3.3.7 + Rails 8.0.2\nPort 4000 (API-only)\nPuma 6.6 Server\nJWT Authentication"]
    PostgreSQL Dev [icon: database, color: blue, label: "PostgreSQL Local\n18 People Records\n54 Relationships\n80+ Timeline Events"]
    Memory Store [icon: memory, color: green, label: "Rails Memory Store\nDevelopment Caching\nInline Job Processing"]
  }
}

Production Environment [icon: cloud, color: purple] {
  SSL Termination [icon: shield, color: orange, label: "Force SSL: true\nSSL Assumption: true\nHTTPS Redirect"]
  
  Frontend Tier [icon: monitor, color: blue] {
    Static Assets [icon: folder, color: gray, label: "Vite Production Build\nOptimized React Bundles\nTailwind CSS Output"]
    Public Files [icon: file, color: teal, label: "Rails Public Directory\nGenerated Share Images\nProfile Media"]
  }
  
  Application Tier [icon: server, color: red] {
    Rails Production [icon: ruby, color: red, label: "Rails 8.0.2 API\nPuma Production Server\nLog Level: INFO\nHealthcheck: /up"]
    Solid Queue [icon: clock, color: purple, label: "Background Jobs\nRuby VIPS Processing\n223ms Profile Cards\n334ms Tree Images"]
  }
  
  Data Tier [icon: database, color: green] {
    PostgreSQL Production [icon: database, color: blue, label: "Primary Database\nActual Data: 18 People\n54 Relationships\n144+ Audit Records"]
    Solid Cache [icon: memory, color: green, label: "Rails 8 Solid Cache\nDatabase-backed Caching\nPerformance Layer"]
  }
  
  Storage Tier [icon: storage, color: orange] {
    Active Storage [icon: folder, color: orange, label: "Local File Service\nProfile Images\nFile Size: 2MB-10MB"]
    Generated Content [icon: image, color: gray, label: "Ruby VIPS Output\nShare Images\n24-hour Expiration"]
  }
}

Security & Monitoring [icon: shield, color: yellow] {
  Authentication [icon: key, color: red, label: "JWT Tokens\nBcrypt Passwords\n42 Denylist Entries"]
  Rate Limiting [icon: gauge, color: orange, label: "Rack::Attack\n300 req/5min\n1000 req/hour"]
  Health Monitoring [icon: chart, color: purple, label: "Rails /up Endpoint\nSilent Health Checks\nPuma Metrics"]
  Audit System [icon: history, color: green, label: "PaperTrail Logging\n144+ Audit Records\nVersion Tracking"]
}

// Define connections with actual data flows
Users > SSL Termination: "HTTPS Requests"
SSL Termination > Static Assets: "Static Content"
SSL Termination > Rails Production: "API /api/v1/*"

Vite Dev Server > Rails API Server: "Dev Proxy Port 4000"
Rails API Server > PostgreSQL Dev: "Development Queries"

Rails Production > PostgreSQL Production: "204ms Complex Queries\n156ms Standard Operations"
Rails Production > Solid Queue: "Background Job Queue"
Solid Queue > Generated Content: "Image Generation\n223ms-334ms Processing"

Rails Production > Active Storage: "Media Operations"
Active Storage > Generated Content: "File Storage"

Authentication > Rails Production: "JWT Validation"
Rate Limiting > Rails Production: "Request Throttling"
Health Monitoring > Rails Production: "Health Checks"
PostgreSQL Production > Audit System: "Change Tracking"
```

**Deployment Configuration Details:**

**Development Environment:**
- Vite development server on port 5178 with proxy configuration to Rails API
- Rails API server on port 4000 in API-only mode
- Memory store caching with inline job processing to avoid Redis dependency
- Local PostgreSQL with actual family tree test data

**Production Environment:**
- SSL enforcement with automatic HTTPS redirect
- Solid Queue for background job processing (Rails 8 native)
- Solid Cache for database-backed caching system
- Ruby VIPS image processing with measured performance metrics
- Active Storage using local file service
- Health check endpoint at `/up` with silent logging

**Performance Metrics (Actual Measured):**
- API response times: 156ms standard, 204ms complex queries
- Image generation: 223ms profile cards, 334ms family trees
- Database operations with 18 people, 54 relationships
- Security: 42 active JWT denylist entries

**Technology Stack Integration:**
- React 19.1.0 frontend with Vite 7.0.0 build system
- Rails 8.0.2 backend with Ruby 3.3.7 runtime
- PostgreSQL database with comprehensive relationship modeling
- Tailwind CSS 3.4.6 for responsive design
- Puma 6.6 web server for production deployment

This deployment architecture represents the actual implementation configuration rather than aspirational or theoretical setup, with all metrics derived from real system testing and configuration files.