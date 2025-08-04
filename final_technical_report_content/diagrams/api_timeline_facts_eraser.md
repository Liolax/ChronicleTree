# ChronicleTree Timeline & Facts API - Eraser.io Sequence Diagram

```
// ChronicleTree Timeline & Facts Management Flow - Life Events & Custom Data
// For use with app.eraser.io

title ChronicleTree Timeline & Facts Management API Endpoints

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]

PostgreSQL [icon: database, color: blue]
Solid Cache [icon: memory, color: green]

activate React Client

// Get Person Timeline Flow
React Client > Rails API: GET /api/v1/people/:id/timeline_items
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Query timeline events
activate PostgreSQL
PostgreSQL --> Rails API: Chronological timeline data
deactivate PostgreSQL
Rails API --> React Client: Timeline events array
deactivate Rails API

// Create Timeline Item Flow
React Client > Rails API: POST /api/v1/people/:id/timeline_items
note right of Rails API: Life events and milestones
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Create timeline event
activate PostgreSQL
PostgreSQL --> Rails API: Timeline item created
Rails API > PostgreSQL: Update chronological ordering
PostgreSQL --> Rails API: Timeline reordered
deactivate PostgreSQL
Rails API > Solid Cache: Invalidate timeline cache
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: New timeline item data
deactivate Rails API

// Update Timeline Item Flow
React Client > Rails API: PUT /api/v1/timeline_items/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Update timeline event
activate PostgreSQL
PostgreSQL --> Rails API: Timeline item updated
PostgreSQL --> Rails API: Recalculate order if date changed
deactivate PostgreSQL
Rails API > Solid Cache: Invalidate timeline cache
activate Solid Cache
deactivate Solid Cache
Rails API --> React Client: Updated timeline item
deactivate Rails API

// Delete Timeline Item Flow
React Client > Rails API: DELETE /api/v1/timeline_items/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Delete timeline event
activate PostgreSQL
PostgreSQL --> Rails API: Timeline item deleted
deactivate PostgreSQL
Rails API --> React Client: Deletion confirmed
deactivate Rails API

// Get Person Facts Flow
React Client > Rails API: GET /api/v1/people/:id/facts
activate Rails API
Rails API > PostgreSQL: Query custom facts
activate PostgreSQL
PostgreSQL --> Rails API: Person's custom facts
deactivate PostgreSQL
Rails API --> React Client: Facts array
deactivate Rails API

// Create Custom Fact Flow
React Client > Rails API: POST /api/v1/people/:id/facts
note right of Rails API: User-defined data fields
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Create custom fact
activate PostgreSQL
PostgreSQL --> Rails API: Fact created
deactivate PostgreSQL
Rails API --> React Client: New fact data
deactivate Rails API

// Update Custom Fact Flow
React Client > Rails API: PUT /api/v1/facts/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Update fact details
activate PostgreSQL
PostgreSQL --> Rails API: Fact updated
deactivate PostgreSQL
Rails API --> React Client: Updated fact data
deactivate Rails API

// Delete Custom Fact Flow
React Client > Rails API: DELETE /api/v1/facts/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Delete custom fact
activate PostgreSQL
PostgreSQL --> Rails API: Fact deleted
deactivate PostgreSQL
Rails API --> React Client: Deletion confirmed
deactivate Rails API

deactivate React Client
```

## Timeline & Facts API Patterns

### Timeline Management
- **Chronological Organization**: Automatic timeline ordering by date
- **Life Event Tracking**: Birth, marriage, death, and custom milestones
- **Dynamic Reordering**: Timeline updates when dates are modified

### Custom Facts System
- **Flexible Data Fields**: User-defined information categories
- **Structured Storage**: Key-value fact organization
- **Person-Specific Data**: Facts linked to individual family members

### Nested Resource Design
- **People-Centric Organization**: Timeline and facts organized under people
- **Direct Management**: Update/delete operations on individual items
- **Ownership Validation**: User permissions enforced at all levels

### Data Validation
- **Event Consistency**: Timeline events validated for logical consistency
- **Fact Structure**: Custom facts validated for proper format
- **Ownership Security**: User access control for all operations

### Performance Features
- **Efficient Queries**: Optimized database queries for timeline data
- **Automatic Ordering**: Database-level chronological sorting
- **Scalable Design**: Timeline system supports extensive life event data
