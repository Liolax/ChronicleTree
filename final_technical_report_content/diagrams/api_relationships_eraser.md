# ChronicleTree Relationships Management API - Eraser.io Sequence Diagram

```
// ChronicleTree Relationship Management Flow - Family Connection Logic
// For use with app.eraser.io

title ChronicleTree Relationship Management API Endpoints

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]

PostgreSQL [icon: database, color: blue]
Blood Relationship Detector [icon: shield, color: green]
Unified Relationship Calculator [icon: calculator, color: purple]
Sibling Relationship Manager [icon: users, color: teal]

activate React Client

// Create Relationship Flow
React Client > Rails API: POST /api/v1/relationships
note right of Rails API: Complex validation logic
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > Blood Relationship Detector: Check blood relations
activate Blood Relationship Detector
Blood Relationship Detector > PostgreSQL: Check existing relationships
activate PostgreSQL
PostgreSQL --> Blood Relationship Detector: Current relationship data
Blood Relationship Detector --> Rails API: Blood relation validation passed
deactivate Blood Relationship Detector
Rails API > Sibling Relationship Manager: Validate age differences
activate Sibling Relationship Manager
Sibling Relationship Manager --> Rails API: Age validation passed
deactivate Sibling Relationship Manager
Rails API > PostgreSQL: Create bidirectional relationship
PostgreSQL --> Rails API: Relationship created
deactivate PostgreSQL
Rails API > Unified Relationship Calculator: Recalculate family stats
activate Unified Relationship Calculator
Unified Relationship Calculator --> Rails API: Stats updated
deactivate Unified Relationship Calculator
Rails API --> React Client: New relationship data
deactivate Rails API

// Delete Relationship Flow
React Client > Rails API: DELETE /api/v1/relationships/:id
activate Rails API
Rails API > Rails API: Validate JWT token
Rails API > PostgreSQL: Remove bidirectional relationship
activate PostgreSQL
PostgreSQL --> Rails API: Relationship deleted
deactivate PostgreSQL
Rails API > Unified Relationship Calculator: Update family statistics
activate Unified Relationship Calculator
Unified Relationship Calculator --> Rails API: Stats recalculated
deactivate Unified Relationship Calculator
Rails API --> React Client: Deletion confirmed
deactivate Rails API

// Toggle Ex-Spouse Status
React Client > Rails API: PATCH /api/v1/relationships/:id/toggle_ex
note right of Rails API: Only for spouse relationships
activate Rails API
Rails API > PostgreSQL: Validate relationship type (spouse)
activate PostgreSQL
PostgreSQL --> Rails API: Spouse relationship confirmed
Rails API > PostgreSQL: Toggle is_ex status
PostgreSQL --> Rails API: Ex-spouse status updated
deactivate PostgreSQL
Rails API --> React Client: Updated relationship status
deactivate Rails API

// Toggle Deceased Spouse Status
React Client > Rails API: PATCH /api/v1/relationships/:id/toggle_deceased
activate Rails API
Rails API > PostgreSQL: Validate spouse relationship
activate PostgreSQL
PostgreSQL --> Rails API: Spouse confirmed
Rails API > PostgreSQL: Toggle is_deceased status
PostgreSQL --> Rails API: Deceased status updated
deactivate PostgreSQL
Rails API --> React Client: Deceased spouse marked
deactivate Rails API

// Get Person Relatives Flow
React Client > Rails API: GET /api/v1/people/:id/relatives
activate Rails API
Rails API > PostgreSQL: Query all family connections
activate PostgreSQL
PostgreSQL --> Rails API: Complete relative data
deactivate PostgreSQL
Rails API --> React Client: Family members with relationships
deactivate Rails API

// Get Relationship Statistics Flow
React Client > Rails API: GET /api/v1/people/:id/relationship_stats
activate Rails API
Rails API > Unified Relationship Calculator: Calculate family metrics
activate Unified Relationship Calculator
Unified Relationship Calculator > PostgreSQL: Count relationships by type
activate PostgreSQL
PostgreSQL --> Unified Relationship Calculator: Relationship counts
Unified Relationship Calculator > PostgreSQL: Include step-family connections
PostgreSQL --> Unified Relationship Calculator: Extended family data
deactivate PostgreSQL
Unified Relationship Calculator --> Rails API: Comprehensive family statistics
deactivate Unified Relationship Calculator
Rails API --> React Client: Family statistics overview
deactivate Rails API

deactivate React Client
```

## Relationship Management API Patterns

### Relationship Creation Rules
- **Bidirectional Logic**: All relationships created in both directions
- **Age Validation**: Sibling age difference limits enforced
- **Marriage Restrictions**: Blood relatives cannot marry
- **Single Spouse Rule**: Only one current spouse allowed per person

### Status Management
- **Ex-Spouse Tracking**: Historical relationship status preservation
- **Deceased Spouse Handling**: Special status for deceased partners
- **Relationship History**: Complete relationship timeline maintenance

### Family Statistics
- **Comprehensive Metrics**: Relationship counts by type
- **Step-Family Integration**: Extended family connections included
- **Real-time Updates**: Statistics recalculated on relationship changes

### Validation System
- **Complex Rule Engine**: Multi-layered relationship validation
- **Database Integrity**: Consistent bidirectional relationships
- **Business Logic Enforcement**: Family tree rules strictly maintained

### Data Access Patterns
- **Relative Queries**: Efficient family member retrieval
- **Statistics Calculation**: On-demand family metrics generation
- **Relationship Types**: Support for all family connection types
