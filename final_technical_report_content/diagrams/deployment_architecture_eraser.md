// ChronicleTree Deployment Architecture - Hybrid Implementation
// Dev: Sidekiq+Redis+memory_store, Prod: Solid Queue+Solid Cache
// For use with app.eraser.io

title ChronicleTree Deployment Architecture - Hybrid Implementation

Users [icon: person, color: green, label: "Family Tree Users\nWeb Browsers (Chrome, Firefox, Safari)\nMobile Devices"]

Development Environment [icon: computer, color: blue] {
  Developer Machine [icon: laptop, color: lightblue] {
    Vite Dev Server [icon: react, color: blue, label: "React 19 + Vite\nPort 5178\nHMR + Hot Reload"]
    Rails API Server [icon: ruby, color: red, label: "Ruby 3.3.7 + Rails 8\nPort 4000\nAPI-only Mode"]
    PostgreSQL Development [icon: database, color: blue, label: "PostgreSQL 15+\nLocal Database\nDevelopment Data"]
    Memory Cache [icon: memory, color: green, label: "Rails Memory Store\nDevelopment Caching"]
    Sidekiq Worker [icon: clock, color: purple, label: "Sidekiq Background Jobs\nRedis Queue\nDevelopment Processing"]
    Redis Queue [icon: memory, color: red, label: "Redis In-Memory\nJob Queue Storage\nDevelopment Mode"]
  }
}

Production Environment [icon: cloud, color: purple] {
  Load Balancer [icon: balance, color: orange, label: "Kamal Proxy\nSSL via Let's Encrypt\nHealth Checks"]
  
  Frontend Tier [icon: monitor, color: blue] {
    Static Assets [icon: folder, color: gray, label: "Vite Build Output\nOptimized Bundles\nTailwind CSS"]
    CDN Distribution [icon: network, color: teal, label: "Static Asset CDN\nMedia Distribution\nGlobal Caching"]
  }
  
  Application Tier [icon: server, color: red] {
    Web Server [icon: server, color: red, label: "Kamal Deploy"] {
      Rails API Instance [icon: ruby, color: red, label: "ChronicleTree API\nPuma Web Server\nJWT Authentication"]
      Solid Queue Worker [icon: clock, color: purple, label: "Background Jobs\nImage Processing\nEmail Notifications"]
    }
  }
  
  Data Tier [icon: database, color: green] {
    PostgreSQL Production [icon: database, color: blue, label: "Primary Database\nFamily Tree Data\nUser Profiles"]
    Solid Cache [icon: memory, color: green, label: "Database-backed Cache\nRails 8 Solid Cache\nPerformance Layer"]
  }
  
  Storage Tier [icon: storage, color: orange] {
    Active Storage [icon: folder, color: orange, label: "Rails Active Storage\nProfile Photos\nFamily Media"]
    File System Storage [icon: database, color: gray, label: "Local File Storage\nRuby VIPS Processing\nGenerated Shares"]
  }
}

Monitoring & Security [icon: shield, color: yellow] {
  Application Health [icon: chart, color: purple, label: "Rails Health Check\n/up Endpoint\nPuma Metrics"]
  Security Features [icon: shield, color: red, label: "JWT Authentication\nBcrypt Passwords\nCORS Protection"]
  Backup Strategy [icon: storage, color: green, label: "Database Backups\nFile System Backups\nVersion Control"]
}

// Define connections
Users > Load Balancer: "HTTPS Requests"
Load Balancer > Static Assets: "Static Content Delivery"
Load Balancer > Rails API Instance: "API Requests /api/v1/*"

Vite Dev Server > Rails API Server: "Development API Calls"
Rails API Server > PostgreSQL Development: "Database Operations"


Rails API Instance > PostgreSQL Production: "Family Tree Data"


Rails API Instance > Active Storage: "File Upload/Download"
Active Storage > File System Storage: "Media Storage"
Static Assets > CDN Distribution: "Asset Distribution"

Application Health > Rails API Instance: "Health Monitoring"
Security Features > Rails API Instance: "Authentication"
PostgreSQL Production > Backup Strategy: "Database Backup"
Active Storage > Backup Strategy: "File Backup"
