# ChronicleTree API Architecture - Eraser.io Sequence Diagram

```
// ChronicleTree API Flow - Real Implementation Sequence
// For use with app.eraser.io

title ChronicleTree API Request Flow

React Client [icon: react, color: blue]
JWT Service [icon: key, color: orange] 
Rails API [icon: ruby, color: red]
PostgreSQL [icon: database, color: blue]
Active Storage [icon: folder, color: orange]
Solid Queue [icon: clock, color: purple]
Redis Cache [icon: memory, color: red]

activate React Client

// Authentication Flow
React Client > JWT Service: POST /api/v1/auth/sign_in
activate JWT Service
JWT Service > PostgreSQL: Validate user credentials
activate PostgreSQL
PostgreSQL --> JWT Service: User data
deactivate PostgreSQL
JWT Service > Redis Cache: Store session
activate Redis Cache
deactivate Redis Cache
JWT Service --> React Client: JWT token + user data
deactivate JWT Service

// Family Tree Data Request
React Client > Rails API: GET /api/v1/people (with JWT)
activate Rails API
Rails API > JWT Service: Validate token
activate JWT Service
JWT Service --> Rails API: Token valid
deactivate JWT Service
Rails API > PostgreSQL: Query family members
activate PostgreSQL
PostgreSQL --> Rails API: People data with relationships
deactivate PostgreSQL
Rails API --> React Client: JSON response
deactivate Rails API

// Add Person Flow
React Client > Rails API: POST /api/v1/people
activate Rails API
Rails API > JWT Service: Validate token
activate JWT Service
deactivate JWT Service
Rails API > PostgreSQL: Create person record
activate PostgreSQL
PostgreSQL --> Rails API: Person created
Rails API > PostgreSQL: Create relationships
PostgreSQL --> Rails API: Relationships created
deactivate PostgreSQL
Rails API --> React Client: Person + relationships data
deactivate Rails API

// Media Upload Flow
React Client > Rails API: POST /api/v1/people/:id/media
activate Rails API
Rails API > Active Storage: Store uploaded file
activate Active Storage
Active Storage > Solid Queue: Queue image processing job
activate Solid Queue
Solid Queue > Solid Queue: Generate thumbnails
Solid Queue > Active Storage: Store processed images
Active Storage --> Rails API: File metadata
deactivate Active Storage
Rails API > PostgreSQL: Save media record
activate PostgreSQL
PostgreSQL --> Rails API: Media saved
deactivate PostgreSQL
Rails API --> React Client: Media data with URLs
deactivate Rails API
deactivate Solid Queue

// Social Sharing Flow
React Client > Rails API: POST /api/v1/shares
activate Rails API
Rails API > Solid Queue: Queue share image generation
activate Solid Queue
Solid Queue > Active Storage: Generate OG image
activate Active Storage
Active Storage --> Solid Queue: Share image created
deactivate Active Storage
Solid Queue > Redis Cache: Cache share data
activate Redis Cache
deactivate Redis Cache
deactivate Solid Queue
Rails API --> React Client: Share URL + metadata
deactivate Rails API

// Timeline Event Flow
React Client > Rails API: POST /api/v1/people/:id/timeline_items
activate Rails API
Rails API > PostgreSQL: Create timeline event
activate PostgreSQL
PostgreSQL --> Rails API: Event created
deactivate PostgreSQL
Rails API > Redis Cache: Invalidate person cache
activate Redis Cache
deactivate Redis Cache
Rails API --> React Client: Timeline event data
deactivate Rails API

// Background Job Processing
loop [label: continuous processing, color: purple] {
  Solid Queue > Solid Queue: Process queued jobs
  Solid Queue > Active Storage: Image processing
  Solid Queue > PostgreSQL: Update job status
}

// Health Check Flow
React Client > Rails API: GET /up
activate Rails API
Rails API > PostgreSQL: Database health check
activate PostgreSQL
PostgreSQL --> Rails API: DB status
deactivate PostgreSQL
Rails API > Redis Cache: Cache health check
activate Redis Cache
Redis Cache --> Rails API: Cache status
deactivate Redis Cache
Rails API --> React Client: System health OK
deactivate Rails API

deactivate React Client
```

## API Flow Patterns

### Authentication Pattern
- **JWT Token Exchange**: Stateless authentication with Redis session storage
- **Token Validation**: Every API request validates JWT token
- **Secure Sessions**: User sessions cached in Redis for performance

### CRUD Operations Pattern
- **RESTful Endpoints**: Standard HTTP methods for all operations
- **Nested Resources**: Timeline, facts, media nested under people
- **Relationship Management**: Automatic relationship creation and updates

### File Upload Pattern
- **Active Storage Integration**: Rails handles file uploads seamlessly
- **Background Processing**: Image processing happens asynchronously
- **Multiple Variants**: Thumbnails and optimized versions generated

### Caching Strategy
- **Redis Integration**: Session storage and cache invalidation
- **Performance Optimization**: Frequently accessed data cached
- **Real-time Updates**: Cache invalidation on data changes

### Background Jobs
- **Solid Queue Processing**: Rails 8 built-in job processing
- **Image Processing**: Thumbnail generation and optimization
- **Email Notifications**: User notifications and system alerts
