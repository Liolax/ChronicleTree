// ChronicleTree System Architecture Overview
// For use with app.eraser.io

title ChronicleTree System Architecture Overview

// Define cloud/group styles
Client Side [icon: monitor, color: blue] {
  React Frontend [icon: react, color: lightblue]
  Family Tree Viz [icon: tree, color: green]
  Profile Management [icon: user, color: purple]
  Media Gallery [icon: image, color: orange]
  Authentication [icon: lock, color: red]
  State Management [icon: database, color: gray]
}

Server Side [icon: server, color: darkblue] {
  Rails API [icon: ruby, color: red]
  Auth Service [icon: shield, color: orange]
  Business Logic [icon: gear, color: gray]
  Relationship Calculator [icon: network, color: green]
  Media Processing [icon: image, color: purple]
  Background Jobs [icon: clock, color: yellow]
}

Database Layer [icon: database, color: green] {
  PostgreSQL [icon: database, color: blue]
  People Table [icon: users, color: lightblue]
  Relationships Table [icon: network, color: green]
  Media Table [icon: image, color: orange]
  Timeline Events [icon: calendar, color: purple]
}

External Services [icon: cloud, color: gray] {
  Redis Cache [icon: memory, color: red]
  Active Storage [icon: folder, color: orange]
  Sidekiq Queue [icon: list, color: yellow]
  Email Service [icon: mail, color: blue]
}

// Define connections
React Frontend > Rails API: HTTP/HTTPS Requests
Family Tree Viz > Rails API: REST API Calls
Profile Management > Rails API: CRUD Operations
Media Gallery > Rails API: File Upload/Download
Authentication > Auth Service: JWT Token Exchange

Rails API > Business Logic: Process Requests
Business Logic > Relationship Calculator: Calculate Relationships
Rails API > Auth Service: Validate Tokens
Rails API > Media Processing: Handle Media
Media Processing > Background Jobs: Queue Processing

Business Logic > People Table: Store/Retrieve People
Business Logic > Relationships Table: Manage Relationships
Media Processing > Media Table: Media Metadata
Auth Service > PostgreSQL: User Authentication
Business Logic > Timeline Events: Timeline Events

Media Processing > Active Storage: Store Files
Background Jobs > Sidekiq Queue: Background Processing
Rails API > Redis Cache: Cache Data
Auth Service > Email Service: Send Notifications
