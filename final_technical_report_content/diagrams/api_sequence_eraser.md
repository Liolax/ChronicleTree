# ChronicleTree API Architecture - Eraser.io Sequence Diagram

```
// ChronicleTree API Flow - Hybrid Implementation (Dev: Sidekiq+Redis, Prod: Solid Queue+Cache)
// For use with app.eraser.io

title ChronicleTree API Request Flow (Current: Development Mode)

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]
PostgreSQL [icon: database, color: blue]
Active Storage [icon: folder, color: orange]
Sidekiq Worker [icon: clock, color: purple]
Redis Queue [icon: memory, color: red]

activate React Client

// Authentication Flow
React Client > Rails API: POST /api/v1/auth/sign_in
activate Rails API
Rails API > PostgreSQL: Validate user credentials
activate PostgreSQL
PostgreSQL --> Rails API: User data
deactivate PostgreSQL
Rails API > Rails API: Store session in memory store
Rails API --> React Client: JWT token + user data
deactivate Rails API

// Family Tree Data Request
React Client > Rails API: GET /api/v1/people (with JWT)
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Query family members
activate PostgreSQL
PostgreSQL --> Rails API: People data with relationships
deactivate PostgreSQL
Rails API --> React Client: JSON response
deactivate Rails API

// Add Person Flow
React Client > Rails API: POST /api/v1/people
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Create person record
activate PostgreSQL
PostgreSQL --> Rails API: Person created
Rails API > PostgreSQL: Create relationships
PostgreSQL --> Rails API: Relationships created
deactivate PostgreSQL
Rails API --> React Client: Person + relationships data
deactivate Rails API

// Media Upload Flow (Background Job Processing)
React Client > Rails API: POST /api/v1/people/:id/media
activate Rails API
Rails API > Active Storage: Store uploaded file
activate Active Storage
Active Storage > Redis Queue: Queue image processing job (Sidekiq)
activate Redis Queue
Redis Queue > Sidekiq Worker: Process ImageGenerationJob
activate Sidekiq Worker
Sidekiq Worker > Active Storage: Generate thumbnails via Ruby VIPS
Sidekiq Worker > Active Storage: Store processed images
Active Storage --> Rails API: File metadata
deactivate Active Storage
Rails API > PostgreSQL: Save media record
activate PostgreSQL
PostgreSQL --> Rails API: Media saved
deactivate PostgreSQL
Rails API --> React Client: Media data with URLs
deactivate Rails API
deactivate Sidekiq Worker
deactivate Redis Queue

// Social Sharing Flow (Background Job Processing)
React Client > Rails API: POST /api/v1/shares
activate Rails API
Rails API > Redis Queue: Queue share image generation (Sidekiq)
activate Redis Queue
Redis Queue > Sidekiq Worker: Process ShareImageJob
activate Sidekiq Worker
Sidekiq Worker > Active Storage: Generate OG image via Ruby VIPS
activate Active Storage
Active Storage --> Sidekiq Worker: Share image created
deactivate Active Storage
Sidekiq Worker > Rails API: Cache share data in memory store
deactivate Sidekiq Worker
deactivate Redis Queue
Rails API --> React Client: Share URL + metadata
deactivate Rails API

// Timeline Event Flow
React Client > Rails API: POST /api/v1/people/:id/timeline_items
activate Rails API
Rails API > PostgreSQL: Create timeline event
activate PostgreSQL
PostgreSQL --> Rails API: Event created
deactivate PostgreSQL
Rails API > Rails API: Invalidate person cache (memory store)
Rails API --> React Client: Timeline event data
deactivate Rails API

// Background Job Processing (Development Mode with Sidekiq)
loop [label: continuous processing, color: purple] {
  Redis Queue > Sidekiq Worker: Process queued jobs
  Sidekiq Worker > Active Storage: Image processing via Ruby VIPS
  Sidekiq Worker > PostgreSQL: Update job status
}

// Health Check Flow
React Client > Rails API: GET /up
activate Rails API
Rails API > PostgreSQL: Database health check
activate PostgreSQL
PostgreSQL --> Rails API: DB status
deactivate PostgreSQL
Rails API > Rails API: Memory store health check
Rails API --> React Client: System health OK
deactivate Rails API

deactivate React Client
```

## API Flow Patterns

### Development Environment (Current Implementation)
- **Background Jobs**: Sidekiq with Redis queue for real-time monitoring and debugging
- **Caching**: Memory store for rapid development iteration and testing
- **Job Processing**: ImageGenerationJob and ShareImageCleanupJob via Sidekiq workers
- **Monitoring**: Sidekiq Web UI available at `/sidekiq` for job monitoring

### Production Environment (Deployment Configuration)
- **Background Jobs**: Rails 8's Solid Queue for simplified deployment without Redis
- **Caching**: Solid Cache for database-backed persistence and scalability
- **Job Processing**: Same job classes with different queue adapter
- **Monitoring**: Built-in Rails health checks and job status tracking

### Authentication Pattern
- **JWT Token Exchange**: Stateless authentication with environment-specific session storage
- **Token Validation**: Every API request validates JWT token within Rails API
- **Secure Sessions**: Development uses memory store, production uses Solid Cache

### CRUD Operations Pattern
- **RESTful Endpoints**: Standard HTTP methods for all operations
- **Nested Resources**: Timeline, facts, media nested under people
- **Relationship Management**: Automatic relationship creation and updates

### File Upload Pattern
- **Active Storage Integration**: Rails handles file uploads seamlessly
- **Background Processing**: Image processing via Sidekiq (dev) or Solid Queue (prod)
- **Multiple Variants**: Thumbnails and optimized versions generated via Ruby VIPS

### Hybrid Caching Strategy
- **Development**: Memory store for rapid iteration and testing
- **Production**: Solid Cache for database-backed persistence and performance
- **Real-time Updates**: Cache invalidation on data changes across all environments

### Background Jobs
- **Development**: Sidekiq with Redis for real-time monitoring and debugging
- **Production**: Rails 8's Solid Queue for simplified deployment
- **Image Processing**: Ruby VIPS-based thumbnail generation and optimization
- **Email Notifications**: User notifications and system alerts
