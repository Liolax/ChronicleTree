# ChronicleTree Media Management API - Eraser.io Sequence Diagram

```
// ChronicleTree Media Management Flow - Active Storage Integration
// For use with app.eraser.io

title ChronicleTree Media Management API Endpoints

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]

Active Storage [icon: folder, color: orange]
PostgreSQL [icon: database, color: blue]
Solid Queue [icon: clock, color: purple]
Solid Cache [icon: memory, color: green]

activate React Client

// 1. Create Profile Flow (First Step)
React Client > Rails API: POST /api/v1/profiles
note right of Rails API: ProfilesController#create
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Create profile record
activate PostgreSQL
PostgreSQL --> Rails API: Profile created & linked to person
deactivate PostgreSQL
Rails API --> React Client: New profile data
deactivate Rails API

// 2. Upload Profile Avatar Flow (Second Step)
React Client > Rails API: PUT /api/v1/profiles/:id
note right of Rails API: Avatar via has_one_attached
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > Active Storage: Store avatar image
activate Active Storage
Active Storage > Solid Queue: Queue avatar processing
activate Solid Queue
Solid Queue > Active Storage: Generate avatar thumbnails
Solid Queue > Active Storage: Create avatar variants
Active Storage --> Rails API: Avatar processed
deactivate Active Storage
Rails API > PostgreSQL: Update profile with avatar attachment
activate PostgreSQL
PostgreSQL --> Rails API: Profile updated with avatar
deactivate PostgreSQL
Rails API --> React Client: Profile with avatar URLs
deactivate Rails API
deactivate Solid Queue

// 3. Get Profile Data Flow
React Client > Rails API: GET /api/v1/profiles
activate Rails API
Rails API > Solid Cache: Check cached profiles
activate Solid Cache
Solid Cache --> Rails API: Cache miss
deactivate Solid Cache
Rails API > PostgreSQL: Query user's profiles with avatars
activate PostgreSQL
PostgreSQL --> Rails API: Profile data with avatar attachments
deactivate PostgreSQL
Rails API > Solid Cache: Cache profile data
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: Profiles array with avatars
deactivate Rails API

// 4. Upload Person Media Flow (Main Media)
React Client > Rails API: POST /api/v1/people/:id/media
note right of Rails API: Multipart file upload for person
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > Active Storage: Store uploaded media file
activate Active Storage
Active Storage > Solid Queue: Queue media processing
activate Solid Queue
Solid Queue > Active Storage: Generate thumbnails
Solid Queue > Active Storage: Create optimized variants
Active Storage --> Rails API: Media file stored & processed
deactivate Active Storage
Rails API > PostgreSQL: Save media record
activate PostgreSQL
PostgreSQL --> Rails API: Media metadata saved
deactivate PostgreSQL
Rails API > Solid Cache: Invalidate person media cache
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: Media data with URLs
deactivate Rails API
deactivate Solid Queue

// 5. Get Person Media Flow
React Client > Rails API: GET /api/v1/people/:id/media
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > Solid Cache: Check cached media data
activate Solid Cache
Solid Cache --> Rails API: Cache miss
deactivate Solid Cache
Rails API > PostgreSQL: Query person's media attachments
activate PostgreSQL
PostgreSQL --> Rails API: Media records with metadata
deactivate PostgreSQL
Rails API > Active Storage: Generate signed URLs
activate Active Storage
Active Storage --> Rails API: Secure media URLs
deactivate Active Storage
Rails API > Solid Cache: Cache media URLs & metadata
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: Media array with URLs
deactivate Rails API

// 6. Update Media Metadata Flow
React Client > Rails API: PUT /api/v1/media/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Update title & description
activate PostgreSQL
PostgreSQL --> Rails API: Metadata updated
deactivate PostgreSQL
Rails API --> React Client: Updated media data
deactivate Rails API

// 7. Delete Media Flow
React Client > Rails API: DELETE /api/v1/media/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > Active Storage: Remove file & variants
activate Active Storage
Active Storage --> Rails API: File deleted
deactivate Active Storage
Rails API > PostgreSQL: Delete media record
activate PostgreSQL
PostgreSQL --> Rails API: Record deleted
deactivate PostgreSQL
Rails API --> React Client: Deletion confirmed
deactivate Rails API

// Background Processing Flow
loop [label: continuous processing, color: purple] {
  Solid Queue > Active Storage: Process image variants
  Solid Queue > Active Storage: Generate thumbnails
  Solid Queue > PostgreSQL: Update processing status
}

deactivate React Client
```

## Media Management API Patterns

### Realistic User Flow Sequence
1. **Profile Creation**: User creates profile for family member
2. **Avatar Upload**: Profile avatar uploaded and processed
3. **Profile Retrieval**: View profiles with avatar URLs
4. **Media Upload**: Additional photos/documents for person
5. **Media Management**: View, update, and delete media files

### Profile Management
- **Direct ActiveRecord**: ProfilesController handles creation without service layer
- **Avatar System**: has_one_attached :avatar for profile avatar handling
- **Person Association**: belongs_to :person relationship in Profile model
- **Simple Architecture**: Standard Rails controller/model pattern without service abstraction

### File Upload Pattern
- **Active Storage Integration**: Rails-native file handling system
- **Polymorphic Attachments**: Media files linked to people or profiles
- **Background Processing**: Asynchronous image processing with Solid Queue
- **Prioritized Processing**: Avatar processing takes priority over general media

### Media Processing
- **Multiple Variants**: Thumbnails and optimized versions generated
- **File Type Support**: Images, documents, and other media types
- **Secure URLs**: Signed URLs for protected file access
- **Processing Queue**: Solid Queue handles all background processing

### Security & Ownership
- **User Validation**: JWT-based ownership verification at every step
- **Secure File Access**: Active Storage signed URL protection
- **Metadata Control**: User-controlled file descriptions and titles
- **Permission Hierarchy**: Profile owners control all associated media

### Performance Features
- **Solid Cache Integration**: Rails 8 database-backed caching in production
- **Environment-Specific Caching**: Memory store (dev), Solid Cache (prod), null store (test)
- **Cache Invalidation**: Media cache cleared on uploads and updates
- **Signed URL Caching**: Active Storage URLs cached for performance
- **Asynchronous Processing**: Non-blocking file upload experience
- **Optimized Storage**: Multiple file variants for different use cases
- **Efficient Queries**: Eager loading of attachments and metadata
- **Progressive Enhancement**: Profile setup enables enhanced media features
