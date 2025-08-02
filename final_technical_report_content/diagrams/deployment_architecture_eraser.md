// ChronicleTree Deployment Architecture
// For use with app.eraser.io

title ChronicleTree Deployment Architecture

Users [icon: person, color: green, label: "Application Users\nWeb Browsers\nMobile Clients"]

Development Environment [icon: computer, color: blue] {
  Developer Machine [icon: laptop, color: lightblue] {
    React Dev Server [icon: react, color: blue]
    Rails Server [icon: ruby, color: red]
    PostgreSQL Local [icon: database, color: blue]
    Redis Local [icon: memory, color: red]
  }
}

Production Environment [icon: cloud, color: purple] {
  Load Balancer [icon: balance, color: orange, label: "SSL Termination\nHealth Checks\nAuto Scaling"]
  
  Frontend Tier [icon: monitor, color: blue] {
    CDN Distribution [icon: network, color: teal]
    React Build [icon: react, color: lightblue]
    Static Assets [icon: folder, color: gray]
  }
  
  Application Tier [icon: server, color: red] {
    Web Server 1 [icon: server, color: red] {
      Rails API Instance 1 [icon: ruby, color: red]
      Sidekiq Worker 1 [icon: clock, color: purple]
    }
    Web Server 2 [icon: server, color: red] {
      Rails API Instance 2 [icon: ruby, color: red]
      Sidekiq Worker 2 [icon: clock, color: purple]
    }
  }
  
  Data Tier [icon: database, color: green] {
    PostgreSQL Master [icon: database, color: blue, label: "Primary Database\nRead/Write Operations"]
    PostgreSQL Replica [icon: database, color: lightblue, label: "Read Replica\nQuery Distribution"]
    Redis Cluster [icon: memory, color: red, label: "Cache Layer\nSession Storage\nJob Queue"]
  }
  
  Storage Tier [icon: storage, color: orange] {
    Object Storage [icon: folder, color: orange, label: "S3/Cloud Storage\nMedia Files"]
    CDN Edge [icon: network, color: blue, label: "Global Distribution\nMedia Delivery"]
  }
}

Monitoring & Security [icon: shield, color: yellow] {
  Application Monitoring [icon: chart, color: purple]
  Log Aggregation [icon: list, color: gray]
  Security Scanning [icon: shield, color: red]
  Backup Service [icon: storage, color: green]
}

// Define connections
Users > Load Balancer: HTTPS Requests
Load Balancer > React Build: Static Content
Load Balancer > Rails API Instance 1: API Requests
Load Balancer > Rails API Instance 2: API Requests

Rails API Instance 1 > PostgreSQL Master: Read/Write
Rails API Instance 2 > PostgreSQL Master: Read/Write
Rails API Instance 1 > PostgreSQL Replica: Read Only
Rails API Instance 2 > PostgreSQL Replica: Read Only
Rails API Instance 1 > Redis Cluster: Cache Operations
Rails API Instance 2 > Redis Cluster: Cache Operations

Rails API Instance 1 > Object Storage: File Operations
Rails API Instance 2 > Object Storage: File Operations
Sidekiq Worker 1 > Redis Cluster: Job Processing
Sidekiq Worker 2 > Redis Cluster: Job Processing

React Build > CDN Distribution: Asset Distribution
Object Storage > CDN Edge: Media Distribution
PostgreSQL Master > PostgreSQL Replica: Data Replication

Application Monitoring > Rails API Instance 1: Metrics Collection
Application Monitoring > Rails API Instance 2: Metrics Collection
Application Monitoring > PostgreSQL Master: Database Metrics
Application Monitoring > Redis Cluster: Cache Metrics

PostgreSQL Master > Backup Service: Database Backup
Object Storage > Backup Service: File Backup
