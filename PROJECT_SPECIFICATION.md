# ChronicleTree - Product Design Specification
**Version 1.0**  
**Date: January 28, 2025**

## VERSION HISTORY

| Version | Implemented By | Revision Date | Approved By | Approval Date | Reason |
|---------|---------------|---------------|-------------|---------------|---------|
| 1.0 | Claude Code Assistant | 01/28/25 | Project Team | 01/28/25 | Initial Design Definition |

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
2. [General Overview](#2-general-overview)
   - 2.1 [Assumptions / Constraints / Standards](#21-assumptions--constraints--standards)
3. [Architecture Design](#3-architecture-design)
   - 3.1 [Logical View](#31-logical-view)
   - 3.2 [Software Architecture](#32-software-architecture)
   - 3.3 [Security Architecture](#33-security-architecture)
   - 3.4 [Communication Architecture](#34-communication-architecture)
4. [System Design](#4-system-design)
   - 4.1 [Use Cases](#41-use-cases)
   - 4.2 [Database Design](#42-database-design)
   - 4.3 [Application Program Interfaces](#43-application-program-interfaces)
   - 4.4 [User Interface Design](#44-user-interface-design)
5. [Key Terms](#5-key-terms)

---

## 1. Introduction

### 1.1 Purpose

ChronicleTree is a comprehensive family tree and genealogy management application designed to help users create, visualize, and share their family histories. The application provides interactive family tree visualization, relationship calculation, media management, and social sharing capabilities.

**Target Audience:**
- Project managers and development team
- Genealogy enthusiasts and family historians
- Users seeking to document and share family relationships

**Key Features:**
- Interactive family tree visualization with React Flow
- Complex relationship calculation (blood, step, half, in-law relationships)
- Media and avatar management with Active Storage
- Timeline and fact management for individuals
- Social sharing with auto-generated family tree images
- Comprehensive relationship validation and business rules

---

## 2. General Overview

ChronicleTree follows a modern full-stack architecture with React frontend and Ruby on Rails API backend. The system emphasizes accurate relationship modeling, intuitive visualization, and comprehensive family data management.

### 2.1 Assumptions / Constraints / Standards

**Technical Assumptions:**
- Modern web browsers with ES6+ support
- Node.js 18+ for frontend development
- Ruby 3.0+ and Rails 7+ for backend
- PostgreSQL database for production deployment
- Active Storage for file management

**Business Constraints:**
- Family relationships must follow biological and legal precedence
- Step-relationships only form through direct marriage connections
- Deceased spouse relationships require temporal validation
- Media files limited to 10MB per upload

**Standards:**
- RESTful API design principles
- JSON serialization for data exchange
- JWT authentication for API security
- Responsive design for mobile compatibility

---

## 3. Architecture Design

### 3.1 Logical View

ChronicleTree implements a client-server architecture with clear separation of concerns:

```
┌─────────────────┐    HTTP/HTTPS    ┌──────────────────┐
│   React Client  │ ◄─────────────► │   Rails API      │
│                 │    JSON/JWT      │                  │
│ • Family Tree   │                  │ • Authentication │
│ • Relationships │                  │ • Business Logic │
│ • Media Gallery │                  │ • Data Models    │
│ • User Interface│                  │ • File Storage   │
└─────────────────┘                  └──────────────────┘
                                             │
                                             ▼
                                     ┌──────────────────┐
                                     │   PostgreSQL     │
                                     │   Database       │
                                     │                  │
                                     │ • People         │
                                     │ • Relationships  │
                                     │ • Media          │
                                     │ • Timelines      │
                                     └──────────────────┘
```

### 3.2 Software Architecture

**Frontend Stack:**
- **React 18** - Component-based UI framework
- **React Flow** - Interactive tree visualization
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

**Backend Stack:**
- **Ruby on Rails 7** - RESTful API framework
- **Active Storage** - File attachment management
- **Devise** - Authentication system
- **Active Model Serializers** - JSON response formatting
- **Sidekiq** - Background job processing

**Key Components:**

#### Frontend Architecture
```
src/
├── components/
│   ├── Tree/                 # Family tree visualization
│   │   ├── FamilyTreeFlow.jsx
│   │   ├── PersonCardNode.jsx
│   │   └── CustomNode.jsx
│   ├── Profile/              # Person management
│   │   ├── RelationshipManager.jsx
│   │   └── MediaForm.jsx
│   └── Forms/                # Data input forms
├── utils/
│   ├── improvedRelationshipCalculator.js  # Core relationship logic
│   ├── familyTreeHierarchicalLayout.js    # Tree positioning
│   └── validationAlerts.js                # Data validation
└── services/
    └── api.js                # API communication layer
```

#### Backend Architecture
```
app/
├── controllers/api/v1/       # RESTful API endpoints
│   ├── people_controller.rb
│   ├── relationships_controller.rb
│   └── media_controller.rb
├── models/                   # Data models and business logic
│   ├── person.rb
│   ├── relationship.rb
│   └── medium.rb
├── serializers/              # JSON response formatting
├── services/                 # Business logic services
│   └── unified_relationship_calculator.rb
└── jobs/                     # Background processing
```

### 3.3 Security Architecture

**Authentication & Authorization:**
- JWT-based stateless authentication
- User-scoped data access (users can only access their own family data)
- Secure password handling with bcrypt
- CORS configuration for cross-origin requests

**Data Protection:**
- Input validation and sanitization
- SQL injection prevention through ActiveRecord
- File upload security with content type validation
- Secure file serving through Rails Active Storage

### 3.4 Communication Architecture

**API Design:**
- RESTful endpoints following Rails conventions
- JSON request/response format
- HTTP status codes for operation results
- Consistent error response structure

**Key API Endpoints:**
```
GET    /api/v1/people              # List family members
POST   /api/v1/people              # Create person
GET    /api/v1/people/:id          # Get person details
PUT    /api/v1/people/:id          # Update person
DELETE /api/v1/people/:id          # Delete person

GET    /api/v1/relationships       # List relationships
POST   /api/v1/relationships       # Create relationship
DELETE /api/v1/relationships/:id   # Delete relationship

GET    /api/v1/people/:id/media    # Get person's media
POST   /api/v1/people/:id/media    # Upload media
DELETE /api/v1/media/:id           # Delete media file
```

---

## 4. System Design

### 4.1 Use Cases

**Primary Use Cases:**

1. **Family Tree Creation**
   - Actor: Family Historian
   - Goal: Create and populate family tree with relatives
   - Flow: Register → Add family members → Define relationships → Visualize tree

2. **Relationship Management**
   - Actor: User
   - Goal: Define complex family relationships accurately
   - Flow: Select persons → Choose relationship type → Validate temporal constraints → Save

3. **Media Management**
   - Actor: User
   - Goal: Attach photos and documents to family members
   - Flow: Select person → Upload media → Add descriptions → View in gallery

4. **Family Tree Sharing**
   - Actor: User
   - Goal: Share family tree visualizations
   - Flow: Generate tree image → Create share link → Distribute to family

### 4.2 Database Design

**Core Entities:**

```sql
-- People table - Core family member data
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  gender VARCHAR(50),
  date_of_birth DATE,
  date_of_death DATE,
  is_deceased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Relationships table - Family connections
CREATE TABLE relationships (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL,
  relative_id INTEGER NOT NULL,
  relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'child', 'spouse', 'sibling'
  is_ex BOOLEAN DEFAULT FALSE,
  is_deceased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Media table - File attachments
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  attachable_id INTEGER NOT NULL,
  attachable_type VARCHAR(255) NOT NULL, -- 'Person'
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Relationship Types:**
- `parent/child` - Parent-child relationships
- `spouse` - Marriage relationships (with ex-spouse and deceased flags)
- `sibling` - Sibling relationships (calculated as full/half/step)

### 4.3 Application Program Interfaces

**Relationship Calculator API:**
The core relationship calculation engine provides complex relationship determination:

```javascript
// Main calculation function
calculateRelationshipToRoot(person, root, allPeople, relationships)

// Key relationship types supported:
// - Blood relationships: Parent, Child, Grandparent, Great-Grandparent, etc.
// - Step relationships: Step-Parent, Step-Child, Step-Grandparent
// - Half relationships: Half-Sibling
// - In-law relationships: Father-in-Law, Mother-in-Law, etc.
// - Extended relationships: Uncle, Aunt, Cousin, Nephew, Niece
```

**Media Management API:**
File upload and management through Active Storage:

```ruby
# Media Controller API
class Api::V1::MediaController < BaseController
  def create
    media = @person.media.build(media_params)
    media.file.attach(params[:media][:file])
    # Returns JSON with file URL and metadata
  end
end
```

### 4.4 User Interface Design

**Design Principles:**
- Clean, intuitive interface prioritizing family tree visualization
- Responsive design for desktop and mobile devices
- Interactive elements with hover states and smooth transitions
- Accessibility compliance with proper ARIA labels

**Key UI Components:**

1. **Family Tree Visualization**
   - Interactive React Flow canvas
   - Draggable and zoomable tree layout
   - Person cards with avatars, names, and key details
   - Relationship lines connecting family members

2. **Person Profile Management**
   - Comprehensive person editing forms
   - Timeline and fact management
   - Media gallery with upload capabilities
   - Relationship management interface

3. **Navigation and Layout**
   - Sidebar navigation for main sections
   - Breadcrumb navigation for deep interactions
   - Modal dialogs for focused tasks
   - Toast notifications for user feedback

---

## 5. Key Terms

| Term | Definition |
|------|------------|
| **Blood Relationship** | Direct biological family connection (parent, child, sibling, grandparent, etc.) |
| **Step Relationship** | Family connection formed through marriage to a blood relative (step-parent, step-child, step-sibling) |
| **Half Relationship** | Sibling connection sharing one biological parent |
| **In-Law Relationship** | Family connection through marriage (father-in-law, mother-in-law, etc.) |
| **Active Storage** | Rails framework for handling file uploads and attachments |
| **React Flow** | React library for building interactive node-based diagrams and graphs |
| **Temporal Validation** | Business logic ensuring relationship timing constraints (e.g., deceased spouses) |
| **Polymorphic Association** | Database design pattern allowing models to belong to multiple other models |
| **JWT Authentication** | JSON Web Token-based stateless authentication system |
| **Serializer** | Component responsible for converting data models to JSON format |

---

**Document Status:** Active  
**Last Updated:** January 28, 2025  
**Next Review:** March 28, 2025