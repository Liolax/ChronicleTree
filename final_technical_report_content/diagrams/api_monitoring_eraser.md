# ChronicleTree System Monitoring API - Eraser.io Sequence Diagram

```
// ChronicleTree System Health & Public Access Flow
// For use with app.eraser.io

title ChronicleTree System Monitoring & Public API Endpoints

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]
PostgreSQL [icon: database, color: blue]
Solid Queue [icon: clock, color: purple]
Public Access [icon: globe, color: green]
Image Generator [icon: image, color: orange]

activate React Client

// Health Check Flow
React Client > Rails API: GET /up
note right of Rails API: Rails built-in health check
activate Rails API
Rails API > PostgreSQL: Database connectivity test
activate PostgreSQL
PostgreSQL --> Rails API: DB status OK
deactivate PostgreSQL
Rails API > Solid Queue: Background jobs health
activate Solid Queue
Solid Queue --> Rails API: Queue status OK
deactivate Solid Queue
Rails API --> React Client: System health OK
deactivate Rails API

// Ping Endpoint Flow
React Client > Rails API: GET /ping
activate Rails API
Rails API --> React Client: pong
deactivate Rails API

// Public Profile Access Flow
Public Access > Rails API: GET /profile/:id
note right of Rails API: Social media crawlers
activate Rails API
Rails API > PostgreSQL: Query public profile data
activate PostgreSQL
PostgreSQL --> Rails API: Profile data
deactivate PostgreSQL
Rails API --> Public Access: HTML with OG meta tags
deactivate Rails API

// Public Tree Access Flow
Public Access > Rails API: GET /tree
activate Rails API
Rails API > PostgreSQL: Query tree data
activate PostgreSQL
PostgreSQL --> Rails API: Family tree structure
deactivate PostgreSQL
Rails API --> Public Access: Tree visualization page
deactivate Rails API

// Share Image Serving Flow
Public Access > Rails API: GET /generated_shares/*path
activate Rails API
Rails API > Image Generator: Validate & serve share image
activate Image Generator
Image Generator --> Rails API: Generated share image
deactivate Image Generator
Rails API --> Public Access: Share image (VIPS processed)
deactivate Rails API

// Development Monitoring Flow (Development Only)
React Client > Rails API: GET /sidekiq
note right of Rails API: Development environment only
activate Rails API
Rails API > Solid Queue: Queue statistics
activate Solid Queue
Solid Queue --> Rails API: Job processing stats
deactivate Solid Queue
Rails API --> React Client: Background job web interface
deactivate Rails API

// Background Health Monitoring
loop [label: continuous monitoring, color: purple] {
  Solid Queue > PostgreSQL: Check job processing
  Solid Queue > Solid Queue: Process queued jobs
  PostgreSQL > Rails API: Health status updates
}

deactivate React Client
```

## System Monitoring API Patterns

### Health Check System
- **Rails Built-in**: Standard `/up` endpoint for system health
- **Database Connectivity**: PostgreSQL connection verification
- **Background Jobs**: Solid Queue processing status monitoring

### Public Access Patterns
- **Social Media Integration**: Open Graph meta tags for sharing
- **Public Profiles**: SEO-friendly profile pages for external access
- **Share Image Generation**: Dynamic social media share images

### Development Tools
- **Sidekiq Interface**: Background job monitoring (development only)
- **Queue Statistics**: Real-time job processing metrics
- **System Diagnostics**: Comprehensive system status overview

### Performance Monitoring
- **Continuous Health Checks**: Automated system monitoring
- **Background Job Processing**: Queue health and performance tracking
- **Database Performance**: Connection and query health monitoring

### Security Considerations
- **Public Endpoint Validation**: Secure public access controls
- **Development-only Features**: Environment-specific tool access
- **Share Image Security**: Validated path access for generated images

Note: ChronicleTree focuses on family tree browsing rather than search functionality. Family data is accessed through the people and relationships APIs with efficient filtering and navigation patterns.
