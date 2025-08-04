# ChronicleTree People Management API - Eraser.io Sequence Diagram

```
// ChronicleTree People Management Flow - RESTful CRUD Operations
// For use with app.eraser.io

title ChronicleTree People Management API Endpoints

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]
PostgreSQL [icon: database, color: blue]
Solid Cache [icon: memory, color: green]
Tree Builder [icon: tree, color: purple]

activate React Client

// Tree Operations First - Natural Starting Point
// Get Family Tree Flow - Primary Entry Point
React Client > Rails API: GET /api/v1/people/full_tree
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > Solid Cache: Check tree cache
activate Solid Cache
Solid Cache --> Rails API: Cache hit
deactivate Solid Cache
Rails API --> React Client: Complete family tree data
deactivate Rails API

// Get Person Tree Flow - Individual Focus
React Client > Rails API: GET /api/v1/people/:id/tree
activate Rails API
Rails API > Tree Builder: Build person-centered tree
activate Tree Builder
Tree Builder > PostgreSQL: Query person's family connections
activate PostgreSQL
PostgreSQL --> Tree Builder: Person-centered tree data
deactivate PostgreSQL
Tree Builder --> Rails API: Structured tree data
deactivate Tree Builder
Rails API --> React Client: Person's family tree
deactivate Rails API

// Get Relationship Stats Flow - Tree Analytics
React Client > Rails API: GET /api/v1/people/:id/relationship_stats
activate Rails API
Rails API > PostgreSQL: Calculate family statistics
activate PostgreSQL
PostgreSQL --> Rails API: Relationship counts & stats
deactivate PostgreSQL
Rails API --> React Client: Statistics data
deactivate Rails API

// Profile Operations - After Tree Navigation
// Get All People Flow - Directory View
React Client > Rails API: GET /api/v1/people
activate Rails API
Rails API > Solid Cache: Check cached data
activate Solid Cache
Solid Cache --> Rails API: Cache miss
deactivate Solid Cache
Rails API > PostgreSQL: Query all people + relationships
activate PostgreSQL
PostgreSQL --> Rails API: People data with family tree
deactivate PostgreSQL
Rails API > Solid Cache: Cache results
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: JSON people array
deactivate Rails API

// Get Person Details Flow - Individual Profile
React Client > Rails API: GET /api/v1/people/:id
activate Rails API
Rails API > PostgreSQL: Query person + nested data
activate PostgreSQL
PostgreSQL --> Rails API: Person with facts/timeline/media
deactivate PostgreSQL
Rails API --> React Client: Complete person profile
deactivate Rails API

// Create Person Flow - Profile Management
React Client > Rails API: POST /api/v1/people
activate Rails API
Rails API > PostgreSQL: Create person record
activate PostgreSQL
PostgreSQL --> Rails API: Person created
Rails API > PostgreSQL: Create parent/child relationships
PostgreSQL --> Rails API: Relationships established
deactivate PostgreSQL
Rails API > Solid Cache: Invalidate people cache
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: New person + relationships
deactivate Rails API

// Update Person Flow - Profile Editing
React Client > Rails API: PUT /api/v1/people/:id
activate Rails API
Rails API > PostgreSQL: Update person details
activate PostgreSQL
PostgreSQL --> Rails API: Person updated
deactivate PostgreSQL
Rails API > Solid Cache: Invalidate cached data
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: Updated person data
deactivate Rails API

// Delete Person Flow - Profile Management
React Client > Rails API: DELETE /api/v1/people/:id
activate Rails API
Rails API > PostgreSQL: Soft delete person
activate PostgreSQL
Rails API > PostgreSQL: Update relationship statuses
PostgreSQL --> Rails API: Person deleted
deactivate PostgreSQL
Rails API > Solid Cache: Clear related caches
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: Deletion confirmed
deactivate Rails API

// Extended Profile Operations
// Add Person Fact Flow - Profile Enhancement
React Client > Rails API: POST /api/v1/people/:id/facts
activate Rails API
Rails API > PostgreSQL: Create custom fact
activate PostgreSQL
PostgreSQL --> Rails API: Fact created
deactivate PostgreSQL
Rails API --> React Client: Fact data
deactivate Rails API

// Add Timeline Item Flow - Life Events
React Client > Rails API: POST /api/v1/people/:id/timeline_items
activate Rails API
Rails API > PostgreSQL: Create timeline event
activate PostgreSQL
PostgreSQL --> Rails API: Timeline item created
deactivate PostgreSQL
Rails API > Rails API: Recalculate timeline order
Rails API --> React Client: Timeline item data
deactivate Rails API

deactivate React Client
```

## People Management API Patterns

### Natural User Flow Design
- **Tree First**: Users start with family tree exploration
- **Profile Navigation**: Tree leads naturally to individual profiles
- **Relationship Analytics**: Stats provide family insights
- **Profile Management**: CRUD operations follow tree discovery

### Tree Operations (Primary Entry Points)
- **Full Tree Access**: Complete family tree data retrieval
- **Person-Centered Views**: Individual family member perspectives  
- **Relationship Statistics**: Family connection analytics

### Profile Operations (Secondary Management)
- **Individual Details**: Complete person profile access
- **Directory Listing**: All people with relationship data
- **CRUD Management**: Create, update, delete person records
- **Extended Data**: Facts, timeline, media organized under people

### Performance Optimization
- **Solid Cache**: Frequently accessed family data cached
- **Smart Invalidation**: Cache updates on data modifications
- **Efficient Queries**: Optimized database queries with eager loading

### Data Management
- **Soft Deletion**: People marked as deleted, relationships preserved
- **Timeline Ordering**: Automatic chronological event organization
- **Custom Facts**: Flexible user-defined data fields
- **Media Integration**: Photo and document attachment support
