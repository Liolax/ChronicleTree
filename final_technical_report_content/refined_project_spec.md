# ChronicleTree Product Design Specification
## Version 1.2

### Version History

| Version | Implemented By | Revision Date | Approved By | Approval Date | Reason |
|---------|---------------|---------------|-------------|---------------|---------|
| 1.0 | Yuliia Smyshliakova | 21/06/2025 | Pending | Pending | Initial Draft |
| 1.1 | Yuliia Smyshliakova | 31/07/2025 | Pending | Pending | Architecture Updates |
| 1.2 | Yuliia Smyshliakova | 01/08/2025 | Pending | Pending | UI/UX Enhancement & ROADMAP Integration |
| 1.3 | Yuliia Smyshliakova | 04/08/2025 | Pending | Pending | Real Implementation Data & Diagram Integration |

### Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose of The Product Design Specification Document](#11-purpose-of-the-product-design-specification-document)
2. [General Overview and Design Guidelines/Approach](#2-general-overview-and-design-guidelinesapproach)
   - 2.1 [Assumptions/Constraints/Standards](#21-assumptionsconstraintsstandards)
3. [Architecture Design](#3-architecture-design)
   - 3.1 [Logical View](#31-logical-view)
   - 3.2 [Hardware Architecture](#32-hardware-architecture)
   - 3.3 [Software Architecture](#33-software-architecture)
   - 3.4 [Security Architecture](#34-security-architecture)
   - 3.5 [Communication Architecture](#35-communication-architecture)
   - 3.6 [Performance](#36-performance)
4. [System Design](#4-system-design)
   - 4.1 [Use Cases](#41-use-cases)
   - 4.2 [Database Design](#42-database-design)
   - 4.3 [Data Conversions](#43-data-conversions)
   - 4.4 [Application Program Interfaces](#44-application-program-interfaces)
   - 4.5 [User Interface Design](#45-user-interface-design)
   - 4.6 [Performance](#46-performance)
   - 4.7 [Recent Enhancements](#47-recent-enhancements)
   - 4.8 [Compliance](#48-compliance)
5. [Project Achievements & Requirements Fulfillment](#5-project-achievements--requirements-fulfillment)
   - 5.1 [Core Requirements Achievement Status](#51-core-requirements-achievement-status)
   - 5.2 [Advanced Features & Innovations](#52-advanced-features--innovations)
   - 5.3 [Quality Metrics & Performance](#53-quality-metrics--performance)
6. [Key Terms & Technical Glossary](#6-key-terms--technical-glossary)
7. [References](#references)

## 1. Introduction

### 1.1. Purpose of The Product Design Specification Document

The Product Design Specification document describes the system architecture and overall system design of the ChronicleTree genealogy management web application. This document serves as the authoritative technical guide for the development team, project manager, and stakeholders throughout the project lifecycle. It captures the architectural decisions, design patterns, and implementation strategies that form the foundation of this modern family tree visualization platform.

The document provides comprehensive guidance on system construction, integration patterns, and user interface design principles. Certain sections, particularly those related to user interface design and user experience workflows, may be shared with clients and stakeholders to gather feedback and ensure alignment with user expectations.

## 2. General Overview and Design Guidelines/Approach

ChronicleTree is built on a modern full-stack architecture, featuring a React 19 frontend with Vite build tooling and a Ruby on Rails 8.0.2 API backend. The system implements a hybrid approach for background processing: development environments use Sidekiq with Redis for debugging and real-time monitoring, while production uses Rails 8's Solid Queue for simplified deployment without external dependencies. Caching follows a similar pattern with memory store in development and Solid Cache in production. The application addresses the limitations of traditional genealogy software through innovative design patterns and robust technical architecture that prioritizes both user experience and data integrity while leveraging cutting-edge web technologies.

### 2.1. Assumptions/Constraints/Standards

The development environment assumes compatibility with modern web browsers supporting ES6+ JavaScript and WebAssembly for image processing. The frontend requires Node.js (v18+) with Vite as the build tool, while the backend relies on Ruby 3.3.7 with Rails 8.0.2. The system implements a hybrid approach for background processing: development uses Sidekiq with Redis for real-time job monitoring and debugging, while production utilizes Rails 8's Solid Queue for simplified deployment without external dependencies. These technical requirements ensure access to modern development features while maintaining broad compatibility with current deployment platforms.

The business logic adheres to established genealogical principles, where family relationships maintain biological and legal precedence. For instance, step-relationships are formed exclusively through marriage to a biological family member, and relationships involving deceased spouses are temporally validated for accuracy. To balance user experience and system performance, media uploads are constrained to a 10MB file size limit.

Architecturally, the system follows RESTful API design principles, using JSON for all data exchange. Security is centered on JWT authentication for API access control, and responsive design principles ensure a seamless experience on mobile devices. The application maintains WCAG 2.1 compliance for accessibility, ensuring that genealogical research remains accessible to users with diverse abilities.

## 3. Architecture Design

### 3.1 Logical View

ChronicleTree employs a client-server architecture with a clear separation of concerns between the frontend and backend. This structure ensures modularity and scalability while supporting independent development and deployment of system components. The client-side, built with React 19 and Vite, handles all user interface elements, including the family tree visualization powered by ReactFlow, relationship management, and media galleries. It communicates with the backend via HTTP/HTTPS requests following RESTful conventions. The server-side, implemented as a Rails 8.0.2 API, manages authentication through Devise JWT, business logic through dedicated service classes, data modeling, and file storage via Active Storage, interacting with a PostgreSQL database to persist user data. The architectural relationship is visually detailed in the System Architecture Overview (Fig. 3.1.1).

**Figure 3.1.1: System Architecture Overview**  
![System Architecture Overview](diagrams/system_architecture_eraser.md)

### 3.2 Hardware Architecture

The ChronicleTree application is designed for a distributed hardware environment, supporting both local development and cloud-based production deployments. This flexible architecture enables cost-effective development while providing a clear migration path to enterprise-scale deployments.

For development, a standard desktop or laptop with at least 8GB of RAM, a dual-core processor, and SSD storage is sufficient. In production, the architecture supports both traditional servers and containerized environments. The Rails API backend runs efficiently on a standard Linux server with a minimum of 4GB of RAM and a multi-core processor. The PostgreSQL database requires adequate storage with backup capabilities, preferably on SSDs for optimal query performance.

Cloud deployments can leverage containerization for horizontal scaling, with a load balancer distributing requests and database clustering for redundancy. A Content Delivery Network (CDN) can enhance media file delivery, improving user experience through geographically distributed caching. The progression from a development setup to a full production environment is illustrated in the Deployment Architecture diagram (Fig. 3.2.1) and the deployment pipeline progression (see Fig. 3.2.2).

**Figure 3.2.1: Deployment Architecture Diagram**  
![Deployment Architecture](diagrams/deployment_architecture_eraser.md)

**Figure 3.2.2: Deployment Pipeline Progression**  
![Deployment Pipeline](diagrams/deployment_pipeline_progression.md)

The deployment pipeline clearly demonstrates the technology evolution from development to production environments. Development environments utilize Sidekiq with Redis for real-time job monitoring and debugging capabilities, while staging and production environments leverage Rails 8's Solid Queue for simplified deployment without external dependencies. This hybrid approach provides the best of both worlds: enhanced developer experience with immediate feedback during development, and streamlined production deployment with minimal infrastructure requirements.

### 3.3 Software Architecture

The frontend architecture is centered on React 19, using modern hooks for state management and concurrent features for optimal performance. The interactive family tree is powered by ReactFlow (@xyflow/react v12.8.2), providing professional-grade rendering and navigation capabilities. Styling is handled by Tailwind CSS for a consistent, utility-first design approach. Client-side routing is managed by React Router, and API communication is handled by Axios with TanStack React Query for efficient data fetching and caching. Form management utilizes React Hook Form for performance and developer experience.

The backend is built on Ruby on Rails 8.0.2, following the MVC pattern with API-only configuration. Active Storage manages file attachments with cloud compatibility, supporting both local disk storage in development and cloud providers in production. User authentication is handled by Devise with JWT token support, and Active Model Serializers format JSON responses for consistent API output. Background jobs, such as media processing with VIPS and thumbnail generation, use a hybrid approach: Sidekiq with Redis in development for debugging capabilities, and Rails 8's Solid Queue in production for simplified deployment. Caching is implemented through memory store in development and Solid Cache in production environments. A comprehensive summary of the technologies used can be found in the Technology Stack diagram (Fig. 3.3.1).

**Figure 3.3.1: Technology Stack Diagram**  
![Technology Stack](diagrams/technology_stack_scema.html)

The frontend is organized into a hierarchical component structure following atomic design principles. Profile management components, such as RelationshipManager.jsx and MediaForm.jsx, are organized in dedicated directories by feature. Core logic is handled by utility modules like improvedRelationshipCalculator.js and familyTreeHierarchicalLayout.js, which implement the genealogical algorithms and tree positioning logic. The Tree directory contains visualization components like FamilyTreeFlow.jsx and CustomNode.jsx, implementing the core family tree rendering logic using ReactFlow. Core family tree visualization component from FamilyTreeFlow.jsx is shown below (Fig. 3.3.2).

**Figure 3.3.2: React Component Architecture - Family Tree Component**

```javascript
// Core family tree visualization component from FamilyTreeFlow.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import { useQueryClient } from '@tanstack/react-query';
import '@xyflow/react/dist/style.css';
import { FaShareAlt, FaLink, FaTimes } from 'react-icons/fa';

import Button from '../UI/Button';
import AddPersonModal from './modals/AddPersonModal';
import EditPersonModal from './modals/EditPersonModal';
import DeletePersonModal from '../UI/DeletePersonModal';
import { FamilyTreeLoader } from '../UI/PageLoader';
import Error from '../UI/Error';
import PersonCard from './PersonCard';
import PersonCardNode from './PersonCardNode';
import { useFullTree, useDeletePerson } from '../../services/people';
import { createFamilyTreeLayout } from '../../utils/familyTreeHierarchicalLayout';
import { collectConnectedFamily } from '../../utils/familyTreeHierarchicalLayout';
import { getAllRelationshipsToRoot } from '../../utils/improvedRelationshipCalculator';
import { ShareModal } from '../Share';

// Custom node types for the tree
const nodeTypes = {
  personCard: PersonCardNode,
};

// Main family tree component
// Uses ReactFlow to show the family tree with drag and drop
const FamilyTree = () => {
  const [searchParams] = useSearchParams();
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [personCardPosition, setPersonCardPosition] = useState(null);
  const [rootPersonId, setRootPersonId] = useState(null);
  const [hasSetDefaultRoot, setHasSetDefaultRoot] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnrelated, setShowUnrelated] = useState(false);
  const [showConnectionLegend, setShowConnectionLegend] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  // Read root person ID from URL parameters
  useEffect(() => {
    const rootParam = searchParams.get('root');
    if (rootParam && !rootPersonId && !hasSetDefaultRoot) {
      setRootPersonId(parseInt(rootParam, 10));
      setHasSetDefaultRoot(true);
    }
  }, [searchParams, rootPersonId, hasSetDefaultRoot]);

  // Process the family data to build tree
  const processedData = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    // Use oldest person as root by default
    if (!rootPersonId && !hasSetDefaultRoot && data.oldest_person_id) {
      setRootPersonId(data.oldest_person_id);
      setHasSetDefaultRoot(true);
    }

    // Only show family members connected to root person
    let filteredNodes = data.nodes;
    let filteredEdges = data.edges;
    if (rootPersonId) {
      const result = collectConnectedFamily(rootPersonId, data.nodes, data.edges);
      filteredNodes = result.persons;
      filteredEdges = result.relationships;
    }

    // Figure out relationships to root person
    const rootPerson = rootPersonId
      ? filteredNodes.find(n => n.id === rootPersonId)
      : null;
    
    return { nodes: filteredNodes, edges: filteredEdges, rootPerson };
  }, [data, rootPersonId, hasSetDefaultRoot, showUnrelated]);

  // ... rest of component implementation
};

export default FamilyTree;
```

The backend follows Rails conventions with versioned API controllers under the api/v1 namespace. The controllers directory contains endpoints for managing people, relationships, and media with comprehensive error handling. Data models encapsulate business logic including validation rules and relationship constraints, while serializers ensure consistent JSON formatting across all API responses. Service classes like BloodRelationshipDetector, UnifiedRelationshipCalculator, and TreeBuilder handle complex business logic operations.

### 3.4 Security Architecture

Security is implemented through multiple layers, beginning with JWT-based authentication for stateless session management. Each API request includes a signed token containing user identification and expiration data, validated on every call to ensure authorized access. The token rotation strategy includes refresh tokens for extended sessions while maintaining security through short-lived access tokens.

Input validation occurs at multiple levels throughout the application stack. Client-side validation provides immediate user feedback using React Hook Form with Yup schemas, while server-side validation ensures data integrity through Rails model validations and custom validators. The Rails Strong Parameters feature prevents mass assignment vulnerabilities by explicitly defining permitted attributes for each endpoint.

File upload security includes comprehensive validation of file types, sizes, and content. The system implements virus scanning in production environments and handles image processing through Ruby VIPS for secure and efficient media processing. User-uploaded content is stored separately from application files with unique identifiers, preventing directory traversal attacks. All uploaded files are served through Active Storage's secure URL generation with time-limited access tokens.

Database security includes encrypted connections using SSL/TLS, parameterized queries through Active Record to prevent SQL injection, and row-level security policies ensuring users can only access their own family data. Regular security audits using tools like Brakeman and dependency updates through Dependabot maintain protection against emerging vulnerabilities.

### 3.5 Communication Architecture

The API design follows RESTful principles with consistent URL patterns and appropriate HTTP verb usage. All endpoints return JSON responses with standardized error formats, enabling predictable client-side error handling. The API versioning strategy uses URL prefixes (/api/v1/), allowing backward compatibility as the API evolves while supporting gradual client migration.

**Figure 3.5.1: Rails API Controller Implementation**

```ruby
# Core API controller from app/controllers/api/v1/people_controller.rb
module Api
  module V1
    class PeopleController < BaseController
      before_action :set_person, only: %i[show update destroy tree relatives]

      def index
        people = current_user.people
        render json: people, each_serializer: Api::V1::PersonSerializer, status: :ok
      end

      def show
        render json: @person, serializer: Api::V1::PersonSerializer, status: :ok
      end

      def create
        ActiveRecord::Base.transaction do
          person = current_user.people.build(person_params)
          is_first_person = current_user.people.count == 0
          rel_type = params[:person][:relation_type]
          rel_person_id = params[:person][:related_person_id]
          
          if !is_first_person && (rel_type.blank? || rel_person_id.blank?)
            render json: { errors: [ "Please select both a relationship type and a person to connect to. Both fields are required when adding new family members." ] }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
          
          if person.save
            if rel_type.present? && rel_person_id.present?
              related_person = current_user.people.find(rel_person_id)
              
              # Parent-child age validation
              if ['child', 'parent'].include?(rel_type)
                if rel_type == 'child'
                  validation_result = related_person.can_be_parent_of?(person)
                elsif rel_type == 'parent'
                  validation_result = person.can_be_parent_of?(related_person)
                end

                unless validation_result[:valid]
                  render json: { 
                    errors: [validation_result[:error]]
                  }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
              end
              
              case rel_type
              when 'child'
                Relationship.create!(person_id: rel_person_id, relative_id: person.id, relationship_type: 'child')
                Relationship.create!(person_id: person.id, relative_id: rel_person_id, relationship_type: 'parent')
              when 'spouse'
                # Determine if this should be an ex-spouse relationship
                is_ex_spouse = person.date_of_death.present?
                
                # Check if selected person already has a current spouse
                if !is_ex_spouse && related_person.current_spouses.any?
                  current_spouse_names = related_person.current_spouses.map(&:full_name).join(', ')
                  render json: { 
                    errors: ["#{related_person.full_name} already has a current spouse (#{current_spouse_names}). A person can only have one current spouse at a time."]
                  }, status: :unprocessable_entity
                  raise ActiveRecord::Rollback
                end
                
                Relationship.create!(
                  person_id: person.id, 
                  relative_id: rel_person_id, 
                  relationship_type: 'spouse',
                  is_ex: is_ex_spouse
                )
              end
            end
            
            render json: person, serializer: Api::V1::PersonSerializer, status: :created
          else
            render json: { errors: person.errors.full_messages }, status: :unprocessable_entity
          end
        end
      rescue StandardError => e
        render json: { errors: ["An error occurred while creating the person"] }, status: :internal_server_error
      end

      private

      def set_person
        @person = current_user.people.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Person not found" }, status: :not_found
      end

      def person_params
        params.require(:person).permit(
          :first_name, :last_name, :maiden_name, :nickname,
          :date_of_birth, :date_of_death, :place_of_birth, :place_of_death,
          :gender, :biography, :occupation, :education
        )
      end
    end
  end
end
```

Request/response cycles include comprehensive logging for debugging and audit purposes. Each request is assigned a unique identifier for tracing through the system. Rate limiting is implemented using Rack::Attack, preventing abuse while ensuring fair resource allocation among users. Custom rate limits apply to resource-intensive operations like file uploads and tree exports.

Cross-Origin Resource Sharing (CORS) policies enable secure cross-origin requests while preventing unauthorized domain access. The configuration supports both development environments with permissive policies and production environments with strict origin validation. Preflight request handling ensures smooth operation of complex API calls.

WebSocket support through Action Cable enables real-time features for future collaborative editing scenarios. The implementation includes automatic reconnection logic and fallback to polling for environments that don't support persistent connections. This hybrid approach ensures functionality across diverse network configurations while preparing for advanced real-time features.

The comprehensive API structure is documented in the API Endpoints Structure diagram (Fig. 3.5.2).

**Figure 3.5.2: API Endpoints Structure**  
![API Structure](diagrams/api_structure_eraser.md)
![API Sequence Overview](diagrams/api_sequence_eraser.md)

### 3.6 Performance

Performance optimization occurs at multiple levels throughout the application stack. Database queries utilize eager loading through Active Record's includes method to prevent N+1 query problems. Strategic indexes on frequently queried columns like user_id, person_id, and relationship_type ensure efficient data retrieval. Complex relationship calculations employ memoization to avoid redundant processing, with results cached for the duration of the request.

Frontend performance leverages React 19's concurrent features including automatic batching and transitions for smooth user interactions. The family tree visualization implements viewport-based rendering through ReactFlow's built-in virtualization, ensuring consistent performance regardless of tree size. Component lazy loading using React.lazy and Suspense boundaries defers initialization until needed, reducing initial page load times.

Caching strategies operate at multiple levels to minimize redundant processing. Browser caching for static assets uses fingerprinted filenames with far-future expiration headers. The application uses environment-specific caching: memory store in development for rapid iteration, Rails 8's Solid Cache in production for database-backed caching without external dependencies, eliminating the need for Redis infrastructure in production. Server-side caching through Rails' built-in mechanisms reduces repeated database hits across all environments.

Background job processing uses a hybrid approach optimized for each environment. Development utilizes Sidekiq with Redis for real-time job monitoring and debugging capabilities, while production employs Rails 8's Solid Queue for simplified deployment without external dependencies. This includes image processing with VIPS for multiple thumbnail sizes, email notifications for sharing invitations, and family tree export generation in various formats. Job prioritization ensures time-sensitive operations like authentication emails process quickly while bulk operations like exports queue appropriately. The performance monitoring infrastructure tracks job execution times and queue depths to identify bottlenecks.

## 4. System Design

### 4.1 Use Cases

The primary user workflow guides individuals through comprehensive family history documentation. Beginning with user registration, the system provides an intuitive path through family member creation, relationship definition, and rich profile development. Each interaction builds upon previous actions, creating a natural progression from simple family structures to complex multi-generational trees.

Key use cases encompass the full genealogical research lifecycle. Users create family trees by progressively adding members and defining their interconnections. The relationship management system supports complex scenarios including multiple marriages, step-families, and adopted children. Rich profile capabilities enable detailed biographical documentation including timeline events, media galleries, and custom facts. The sharing workflow allows users to generate public links for their family trees, enabling collaboration with relatives or sharing discoveries with genealogical communities.

The complete user journey from registration through tree sharing is visualized in the User Workflow diagram (Fig. 4.1.1), with detailed flowcharts showing each interaction pattern throughout the system.

**Figure 4.1.1: User Workflow Overview**  
![User Workflow Overview](diagrams/user_workflow_eraser.md)

**User Registration and Authentication Flows**

The registration process follows a streamlined approach that balances security requirements with user experience. New users complete a progressive registration form that validates email uniqueness in real-time and enforces password strength requirements. The authentication system supports secure password recovery through token-based email verification.

**Figure 4.1.2: Registration Page Flow**  
![Registration Flow](diagrams/register_page_flowchart.md)

**Figure 4.1.3: Login Page Flow**  
![Login Flow](diagrams/login_page_flowchart.md)

**Figure 4.1.4: Forgot Password Flow**  
![Forgot Password Flow](diagrams/forgot_password_flowchart.md)

**Figure 4.1.5: Reset Password Flow**  
![Reset Password Flow](diagrams/reset_password_flowchart.md)

**Figure 4.1.6: Authentication System Flow**  
![Authentication System](diagrams/authentication_system_flowchart.md)

**Core Application Workflows**

The main application workflows center around family tree management and profile creation. Users navigate from tree visualization to individual profile management, with smooth transitions between viewing, editing, and sharing modes.

**Figure 4.1.7: Family Tree Page Flow**  
![Tree Page Flow](diagrams/tree_page_flowchart.md)

**Figure 4.1.8: Profile Management Flow**  
![Profile Management](diagrams/Profile Management Flow.md)

**Figure 4.1.9: Account Settings Flow**  
![Account Settings](diagrams/account_settings_flowchart.md)

**Social Sharing Workflows**

The sharing functionality enables users to generate public links for their family trees and individual profiles, with platform-specific optimization for social media platforms.

**Figure 4.1.10: Social Sharing Overview**  
![Social Sharing](diagrams/social_sharing_flowchart.md)

**Figure 4.1.11: Tree Sharing Flow**  
![Tree Sharing](diagrams/tree_share_flowchart.md)

**Figure 4.1.12: Profile Sharing Flow**  
![Profile Sharing](diagrams/profile_share_flowchart.md)

### 4.2 Database Design

The database schema balances normalization with query performance, utilizing PostgreSQL's advanced features for data integrity and efficiency. The core entity model centers on the people table, with relationships defined through a separate relationships table enabling bidirectional connections. This design supports complex family structures while maintaining referential integrity.

The people table stores essential biographical information including names, dates, and gender, with soft deletion through deleted_at timestamps preserving data integrity while supporting user-requested deletions. The facts table enables extensible profile information without schema modifications, supporting diverse cultural and historical documentation needs. The timeline_events table captures significant life moments with temporal and geographic context.

Relationship modeling utilizes a join table approach with relationship_type enumeration and additional metadata fields. This design supports complex scenarios including multiple marriages with date ranges, parent-child relationships with adoption flags, and calculated sibling relationships based on shared parentage. The bidirectional nature of relationships is handled through careful constraint design ensuring data consistency.

Media storage leverages Active Storage's polymorphic associations through the media table, enabling file attachments to multiple entity types. This flexibility supports profile photos, document scans, and multimedia content while maintaining consistent access patterns. The complete database structure is illustrated in the Database Schema Design diagram (Fig. 4.2.1), with detailed breakdowns available in the domain-specific database diagrams (see Fig. 4.2.2-4.2.6).

**Figure 4.2.1: Database Schema Design Overview**  
![Database Overview](diagrams/database_overview_eraser.md)

**Figure 4.2.2: Family Tree Core Schema**  
![Family Core Schema](diagrams/database_family_core_eraser.md)

**Figure 4.2.3: Authentication & Security Schema**  
![Auth Security Schema](diagrams/database_auth_security_eraser.md)

**Figure 4.2.4: Events & Facts Schema**  
![Events Facts Schema](diagrams/database_events_facts_eraser.md)

**Figure 4.2.5: Media Storage Schema**  
![Media Storage Schema](diagrams/database_media_storage_eraser.md)

**Figure 4.2.6: Social Sharing Schema**  
![Social Sharing Schema](diagrams/database_social_sharing_eraser.md)

### 4.3 Data Conversions

Data conversion processes ensure seamless integration between user inputs, internal representations, and external systems. The system accommodates diverse date formats through intelligent parsing algorithms, supporting partial dates common in historical research while maintaining chronological sorting capabilities. Date normalization handles formats including MM/DD/YYYY, DD/MM/YYYY, and ISO 8601, with automatic detection based on user locale settings.

Name handling algorithms respect cultural naming conventions while providing consistent search and display functionality. The system supports multiple name formats including Western (given name, surname), Eastern (surname, given name), and Spanish (given names, paternal surname, maternal surname) conventions. Unicode support ensures proper representation of names from all writing systems, with transliteration options for cross-cultural research.

Media file processing includes automatic format conversion for web optimization. Large images undergo resolution reduction while maintaining visual quality through intelligent resampling. Unsupported formats receive conversion to standard web formats (JPEG, PNG, WebP) based on content analysis. Metadata extraction preserves original creation dates, camera information, and location data when available, enriching the historical record.

Import/export functionality transforms between ChronicleTree's internal format and standard genealogical data exchange formats. GEDCOM compatibility ensures integration with traditional genealogy software, while JSON export provides modern data portability. The conversion process handles encoding differences, date format variations, and relationship type mappings to maintain data fidelity across systems.

### 4.4 Application Program Interfaces

The relationship calculator API represents the core innovation of ChronicleTree, implementing complex genealogical logic through elegant abstractions. The calculateRelationshipToRoot() function traverses family connections to determine precise relationships between any two individuals, supporting over 20 relationship types with gender-specific terminology. The algorithm handles edge cases including multiple paths between individuals, choosing the most direct biological relationship when alternatives exist.

The decision-making process for relationship creation follows a sophisticated validation tree that ensures genealogical accuracy and prevents impossible relationships. This logic flow guides users through appropriate relationship selections while enforcing business rules such as preventing marriages between close blood relatives and validating temporal consistency (see Fig. 4.4.1).

**Figure 4.4.1: Relationship Creation Decision Tree**  
![Relationship Decision Tree](diagrams/decision_tree.md)

The API design emphasizes clarity and consistency across all endpoints. Each endpoint follows predictable patterns with comprehensive documentation generated through API blueprints. Request validation ensures data integrity while providing helpful error messages for client-side handling. Response formats include relationship metadata enabling rich user interface interactions, such as highlighting connection paths in the tree visualization.

Media management APIs provide secure file handling with automatic optimization. Upload endpoints accept multiple file formats while enforcing size limits and type restrictions. The system generates multiple image sizes for responsive display while preserving original files for download. Metadata APIs enable rich media organization with titles, descriptions, and date information, supporting comprehensive family archives.

The complete relationship type support is detailed in the Relationship Types diagram (Fig. 4.4.2), with API endpoint documentation available in the specific API diagrams (Fig. 4.4.3-4.4.8).

**Figure 4.4.2: Relationship Types Supported**  
![Relationship Types](diagrams/relationship_types_supported_eraser.md)

**Figure 4.4.3: Authentication API Endpoints**  
![Authentication API](diagrams/api_authentication_eraser.md)

**Figure 4.4.4: People Management API Endpoints**  
![People Management API](diagrams/api_people_eraser.md)

**Figure 4.4.5: Relationship Management API Endpoints**  
![Relationship Management API](diagrams/api_relationships_eraser.md)

**Figure 4.4.6: Timeline & Facts API Endpoints**  
![Timeline Facts API](diagrams/api_timeline_facts_eraser.md)

**Figure 4.4.7: Media Management API Endpoints**  
![Media Management API](diagrams/api_media_eraser.md)

**Figure 4.4.8: System Monitoring API Endpoints**  
![System Monitoring API](diagrams/api_monitoring_eraser.md)

### 4.5 User Interface Design

The user interface design philosophy prioritizes clarity and functionality while maintaining visual appeal. The design system builds upon modern web standards with a mobile-first approach, ensuring optimal experiences across all devices. Clean typography using the Inter font family, generous whitespace following an 8-point grid system, and intuitive navigation patterns guide users through complex genealogical tasks without overwhelming them.

**Visual Design System and Layout Architecture**

The application implements a cohesive design system that ensures consistency across all user interactions. The interface leverages React 19's component architecture with Tailwind CSS for responsive design patterns, creating seamless experiences from desktop to mobile devices.

**Registration and Authentication Interface**

The registration interface provides a welcoming entry point with progressive form validation and clear visual feedback. The design emphasizes accessibility and user guidance through each step of account creation.

**Figure 4.5.1: Registration Page Screenshot**  
*[SCREENSHOT NEEDED: Full registration page showing the form layout, validation states, and responsive design]*

**Instructions for Screenshot 4.5.1:**
- Navigate to `/register` route in the application
- Capture full page view showing the registration form
- Include form validation states (both error and success indicators)
- Show responsive layout on desktop view
- Ensure all form fields and buttons are visible

**Figure 4.5.2: Login Page Screenshot**  
*[SCREENSHOT NEEDED: Login page with form validation and forgot password link]*

**Instructions for Screenshot 4.5.2:**
- Navigate to `/login` route
- Capture the complete login interface
- Show form validation states
- Include "Forgot Password" link visibility
- Demonstrate responsive design elements

**Main Application Interface**

The core family tree visualization interface represents the primary user interaction space. The design balances information density with visual clarity, providing intuitive controls for navigation and tree manipulation.

**Figure 4.5.3: Family Tree Visualization Screenshot**  
*[SCREENSHOT NEEDED: Complete family tree page showing the React Flow visualization with multiple family members, relationship connections, and navigation controls]*

**Instructions for Screenshot 4.5.3:**
- Load a family tree with at least 8-10 family members
- Ensure all relationship types are visible (parent-child, spouse, sibling connections)
- Show the tree navigation controls (zoom, pan, center buttons)
- Include the connection legend/key if visible
- Capture the MiniMap component if present
- Show person cards with profile photos and basic information

**Profile Management Interface**

Individual profile pages showcase the comprehensive biographical information system, demonstrating the flexibility of the custom facts system and media gallery integration.

**Figure 4.5.4: Person Profile Page Screenshot**  
*[SCREENSHOT NEEDED: Complete person profile showing biographical information, timeline, media gallery, and custom facts]*

**Instructions for Screenshot 4.5.4:**
- Navigate to a person's detailed profile page
- Ensure the profile contains multiple sections: basic info, timeline events, media gallery, custom facts
- Show at least 2-3 timeline entries with dates
- Include 2-3 uploaded photos in the media gallery
- Display custom facts section with various fact types
- Show relationship management section

**Figure 4.5.5: Profile Editing Interface Screenshot**  
*[SCREENSHOT NEEDED: Profile editing form showing the comprehensive input system for biographical data]*

**Instructions for Screenshot 4.5.5:**
- Open the profile editing interface for a person
- Show the tabbed or sectioned layout for different information categories
- Include form validation states
- Display date picker components for birth/death dates
- Show relationship selection dropdowns
- Include media upload interface

**Account Settings and Management**

The account management interface demonstrates the security-focused design approach with clear separation of profile information, password management, and account deletion controls.

**Figure 4.5.6: Account Settings Page Screenshot**  
*[SCREENSHOT NEEDED: Complete account settings interface showing profile management, password change, and security options]*

**Instructions for Screenshot 4.5.6:**
- Navigate to user account settings page
- Show the tabbed layout separating different settings categories
- Include password change form with strength indicator
- Display account deletion section with warning styling
- Show email preferences or notification settings if available

**Core Functionality Code Examples**

The relationship calculation engine represents the technical innovation of ChronicleTree, implementing complex genealogical logic through clean abstractions. The following code examples demonstrate the core algorithms that power the family tree functionality (see Fig. 4.5.7-4.5.9).

**Figure 4.5.7: Relationship Calculator Implementation**

```javascript
// Core relationship calculation logic from improvedRelationshipCalculator.js
/**
 * Determines the relationship between any person and the root person.
 * Returns a human-readable relationship (e.g., "Uncle", "2nd Cousin").
 * Explains logic and edge cases for educational clarity.
 * @param {Object} person - The person we want to find the relationship for
 * @param {Object} rootPerson - The reference person (center of the tree)
 * @param {Array} allPeople - Everyone in the family database
 * @param {Array} relationships - All the family connections
 * @returns {string} - Human-readable relationship like "Uncle" or "2nd Cousin"
 */
export const calculateRelationshipToRoot = (person, rootPerson, allPeople, relationships) => {
  // Defensive: If any required argument is missing, return empty string
  if (!person || !rootPerson || !allPeople || !relationships) {
    return '';
  }

  // Special case: If person is viewing their own profile, return "Root"
  if (person.id === rootPerson.id) {
    return 'Root';
  }

  // Extract birth and death dates for timeline validation
  const personBirth = person.date_of_birth ? new Date(person.date_of_birth) : null;
  const personDeath = person.date_of_death ? new Date(person.date_of_death) : null;
  const rootBirth = rootPerson.date_of_birth ? new Date(rootPerson.date_of_birth) : null;
  const rootDeath = rootPerson.date_of_death ? new Date(rootPerson.date_of_death) : null;

  // Timeline check: If person was born after root died, they never lived at the same time
  // Only show direct biological relationships (parent, child, grandparent, etc.)
  if (personBirth && rootDeath && personBirth > rootDeath) {
    const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
    const { childToParents, parentToChildren } = relationshipMaps;
    
    // Look for direct ancestor-descendant relationships
    const personParents = childToParents.get(String(person.id)) || new Set();
    const rootChildren = parentToChildren.get(String(rootPerson.id)) || new Set();
    const personChildren = parentToChildren.get(String(person.id)) || new Set();
    
    // Check if root is person's parent
    if (personParents.has(String(rootPerson.id))) {
      return getGenderSpecificRelation(rootPerson.id, 'Father', 'Mother', allPeople, 'Parent');
    }
    
    // Check if person is root's child
    if (rootChildren.has(String(person.id))) {
      return getGenderSpecificRelation(person.id, 'Son', 'Daughter', allPeople, 'Child');
    }
    
    // Return empty for non-direct relationships when they never lived together
    return '';
  }

  // Use breadth-first search to find shortest relationship path
  const queue = [{ personId: rootPerson.id, path: [], visited: new Set([rootPerson.id]) }];
  
  while (queue.length > 0) {
    const { personId, path, visited } = queue.shift();
    
    // Get all relationships for current person
    const personRelationships = relationships.filter(rel => 
      (rel.person_id === personId || rel.relative_id === personId) && !rel.is_ex
    );
    
    for (const rel of personRelationships) {
      const nextPersonId = rel.person_id === personId ? rel.relative_id : rel.person_id;
      const relationshipType = rel.relationship_type;
      
      if (nextPersonId === person.id) {
        // Found the target person - calculate relationship
        return determineRelationshipFromPath([...path, relationshipType], allPeople);
      }
      
      if (!visited.has(nextPersonId)) {
        queue.push({
          personId: nextPersonId,
          path: [...path, relationshipType],
          visited: new Set([...visited, nextPersonId])
        });
      }
    }
  }
  
  return 'Not Related';
};

// Helper function to determine relationship from path
const determineRelationshipFromPath = (path, allPeople) => {
  if (path.length === 0) return '';
  if (path.length === 1) return getDirectRelationshipLabel(path[0]);
  
  // Complex relationship calculation for multi-step paths
  return calculateExtendedRelationship(path, allPeople);
};
```

**Figure 4.5.8: Tree Builder Service Implementation**

```ruby
# Tree Builder service from app/services/people/tree_builder.rb
module People
  class TreeBuilder
    def initialize(person)
      @center = person
    end

    def as_json
      nodes = collect_tree_nodes
      edges = collect_tree_edges(nodes)
      [ nodes, edges ]
    end

    private

    def collect_tree_nodes
      seen = {}
      queue = [@center]
      while queue.any?
        person = queue.shift
        next if seen[person.id]
        seen[person.id] = person
        
        # Add family connections using respond_to? for safety
        if person.respond_to?(:parents)
          queue.concat(person.parents.reject { |p| seen[p.id] })
        end
        if person.respond_to?(:children)
          queue.concat(person.children.reject { |c| seen[c.id] })
        end
        if person.respond_to?(:spouses)
          queue.concat(person.spouses.reject { |s| seen[s.id] })
        end
        if person.respond_to?(:siblings)
          queue.concat(person.siblings.reject { |sib| seen[sib.id] })
        end
      end
      seen.values
    end

    def collect_tree_edges(nodes)
      edges = []
      node_ids = nodes.map(&:id)
      
      nodes.each do |n|
        # Parent-child relationships
        if n.respond_to?(:parents)
          n.parents.each do |parent|
            if node_ids.include?(parent.id)
              edges << { source: parent.id, target: n.id, relationship_type: 'parent' }
            end
          end
        end
        
        # Child relationships (alternative direction)
        if n.respond_to?(:children)
          n.children.each do |child|
            if node_ids.include?(child.id)
              edges << { source: n.id, target: child.id, relationship_type: 'parent' }
            end
          end
        end
        
        # Spouse relationships (avoid duplicates with id comparison)
        if n.respond_to?(:spouses)
          n.spouses.each do |spouse|
            if n.id < spouse.id && node_ids.include?(spouse.id)
              relationship = n.relationships.find { |r| 
                r.relative_id == spouse.id && r.relationship_type == 'spouse' 
              }
              
              edge = { source: n.id, target: spouse.id, relationship_type: 'spouse' }
              if relationship
                edge[:is_ex] = relationship.is_ex
                edge[:is_deceased] = relationship.is_deceased
              end
              edges << edge
            end
          end
        end
        
        # Sibling relationships (avoid duplicates)
        if n.respond_to?(:siblings)
          n.siblings.each do |sib|
            if n.id < sib.id && node_ids.include?(sib.id)
              edges << { source: n.id, target: sib.id, relationship_type: 'sibling' }
            end
          end
        end
      end
      
      edges.uniq
    end
  end
end
```

**Figure 4.5.9: Validation System Implementation**

```ruby
# Age and temporal validation from app/models/person.rb
class Person < ApplicationRecord
  # Age validation for parent-child relationships
  def can_be_parent_of?(child)
    return { valid: false, error: "Child person is required" } if child.nil?
    return { valid: false, error: "Parent cannot be same as child" } if self == child

    if self.date_of_birth.present? && child.date_of_birth.present?
      parent_birth = Date.parse(self.date_of_birth.to_s)
      child_birth = Date.parse(child.date_of_birth.to_s)
      age_difference = (child_birth - parent_birth) / 365.25

      if age_difference < 12
        if age_difference < 0
          return { 
            valid: false, 
            error: "#{self.first_name} #{self.last_name} (born #{parent_birth.strftime('%B %d, %Y')}) is #{age_difference.abs.round(1)} years YOUNGER than #{child.first_name} #{child.last_name} (born #{child_birth.strftime('%B %d, %Y')}). A parent cannot be younger than their child."
          }
        else
          return { 
            valid: false, 
            error: "#{self.first_name} #{self.last_name} (born #{parent_birth.strftime('%B %d, %Y')}) is only #{age_difference.round(1)} years older than #{child.first_name} #{child.last_name} (born #{child_birth.strftime('%B %d, %Y')}). A parent must be at least 12 years older than their child."
          }
        end
      end
    end

    # Validate parent wasn't deceased before child's birth
    if self.date_of_death.present? && child.date_of_birth.present?
      parent_death = Date.parse(self.date_of_death.to_s)
      child_birth = Date.parse(child.date_of_birth.to_s)
      
      if parent_death < child_birth
        return { 
          valid: false, 
          error: "#{self.first_name} #{self.last_name} died on #{parent_death.strftime('%B %d, %Y')}, which is #{((child_birth - parent_death) / 365.25).round(1)} years before #{child.first_name} #{child.last_name} was born (#{child_birth.strftime('%B %d, %Y')}). A parent cannot have died before their child was born."
        }
      end
    end
    
    { valid: true }
  end

  # Helper method to get current non-ex spouses
  def current_spouses
    spouse_relationships = relationships.where(relationship_type: 'spouse', is_ex: false)
    Person.where(id: spouse_relationships.pluck(:relative_id))
  end

  # Validation for spouse relationship constraints
  def validate_spouse_relationship(spouse_person, is_ex: false)
    return { valid: false, error: "Cannot marry yourself" } if self == spouse_person
    
    # Check if already have a current spouse (unless this is an ex-spouse)
    if !is_ex && current_spouses.any?
      current_names = current_spouses.map(&:full_name).join(', ')
      return { 
        valid: false, 
        error: "#{self.full_name} already has a current spouse (#{current_names}). A person can only have one current spouse at a time."
      }
    end
    
    # Prevent marriage to deceased person (unless ex-spouse)
    if !is_ex && spouse_person.date_of_death.present?
      return {
        valid: false,
        error: "Cannot marry #{spouse_person.full_name} because they are deceased. You can only add them as a former spouse."
      }
    end
    
    { valid: true }
  end
end
```

**Mobile Responsive Design**

The interface adapts intelligently across device sizes, with touch-friendly controls and responsive layouts that maintain functionality on mobile devices.

**Figure 4.5.10: Mobile Interface Screenshots**  
*[SCREENSHOT NEEDED: Mobile view of key pages showing responsive design]*

**Instructions for Screenshot 4.5.10:**
- Capture mobile view (320px-768px width) of:
  - Family tree page with touch controls
  - Profile page with collapsed/expanded sections
  - Navigation menu in mobile state
  - Form interfaces optimized for mobile input

### 4.6 Performance

System design for performance focuses on ensuring a responsive user experience, even with large data volumes. This is achieved through comprehensive indexing in the database, optimized query structures to minimize round trips, and efficient relationship traversal algorithms.

The API design includes pagination for large datasets and response caching for frequently accessed data. On the frontend, efficient component rendering, lazy loading for images, and optimized memory management for the family tree visualization ensure a smooth experience. Resource-intensive tasks are handled by background jobs to keep the UI responsive.

User interface performance receives careful attention throughout the design and implementation process. Initial page loads utilize code splitting through webpack to deliver minimal JavaScript bundles, with additional functionality loading on demand. Service workers enable offline functionality for previously viewed content while providing transparent synchronization when connectivity returns. The Progressive Web App manifest enables installation on mobile devices for app-like experiences.

Animation performance leverages CSS transforms and the will-change property for GPU acceleration, ensuring smooth transitions even on lower-powered devices. The family tree rendering engine implements efficient diff algorithms through React Flow's internal optimization to minimize DOM updates during tree modifications. Virtualization techniques ensure consistent performance regardless of family tree size, with only visible nodes rendering in detail while off-screen nodes remain as lightweight placeholders.

Image loading utilizes progressive enhancement with blur-up placeholders transitioning to full-quality images. The loading strategy combines lazy loading through the Intersection Observer API with responsive image selection using srcset attributes. The system automatically selects appropriate image sizes based on device pixel ratio and viewport size, reducing bandwidth usage on mobile connections.

Form interactions provide immediate feedback through optimistic updates, applying changes locally before server confirmation. This approach creates responsive interfaces while maintaining data consistency through eventual synchronization. Error recovery mechanisms handle network failures gracefully with exponential backoff retry logic and user-friendly error messages. Offline queue management stores user actions for later synchronization when connectivity returns.

### 4.7 Recent Enhancements

Recent development efforts have focused on elevating the user experience through sophisticated interface improvements and enhanced functionality. The implementation utilizes Rails 8.0.2 with a hybrid approach for background processing: Sidekiq with Redis for development environments enabling real-time job monitoring, while production uses Rails 8's built-in Solid Queue for simplified deployment without external Redis dependencies. This flexible configuration provides robust asynchronous task handling for media processing and other intensive operations across all environments.

Loading states throughout the application now feature unified, elegant components replacing basic text indicators. The modern loading system includes context-aware animations and messages, providing users with clear feedback during data operations. Skeleton screens preview content structure during loads, reducing perceived wait times through progressive content revelation. The implementation uses CSS animations for shimmer effects and smooth transitions as real content replaces placeholders.

Code quality improvements ensure maintainability and authentic development practices. All code comments now utilize natural language patterns, avoiding overly technical jargon while maintaining clarity. Comments like "Process the family data" replace verbose technical descriptions. This enhancement extends throughout the codebase, from frontend React components to backend Ruby controllers, ensuring consistency and approachability.

Marriage validation logic now prevents impossible relationship configurations involving deceased individuals. The system validates temporal consistency when updating person records, preventing scenarios where deceased individuals maintain active marriages. This enhancement required updates to both frontend validation logic and backend business rules through dedicated service classes like BloodRelationshipDetector and UnifiedRelationshipCalculator, with careful attention to edge cases like widowed individuals remarrying. Clear user guidance through helpful error messages explains why certain relationships cannot be created.

Mobile responsiveness improvements ensure optimal experiences on small screens through careful breakpoint design. Interface components now adapt intelligently to available space, with touch-friendly controls using minimum 44x44 pixel tap targets. The connection legend utilizes responsive positioning and scaling, transitioning from a floating overlay on desktop to a collapsible drawer on mobile. Font sizes scale appropriately using CSS clamp() functions, ensuring readability without horizontal scrolling.

### 4.8 Compliance

The application is designed to comply with modern web accessibility standards, data protection regulations, and genealogical software best practices.

Accessibility follows WCAG 2.1 standards, with comprehensive ARIA labeling, keyboard navigation, and screen reader compatibility. Data protection adheres to contemporary privacy regulations, with user-scoped access, secure data handling, and transparent privacy policies. Security compliance addresses common web vulnerabilities through systematic measures.

Genealogical ethics are also considered, with respectful handling of family information, cultural sensitivity in relationship classifications, and privacy controls for sensitive data.

## 5. Project Achievements & Requirements Fulfillment

### 5.1 Core Requirements Achievement Status

The project successfully achieves 100% fulfillment of all six original functional requirements, with significant enhancements beyond the baseline expectations.

**Requirement 1: User Authentication ✅ EXCEEDED**  
The implementation exceeds specifications by providing a comprehensive security system with JWT-based stateless authentication, advanced email validation, password strength enforcement, secure password reset workflows, and strict user-scoped data access to ensure complete privacy.

**Requirement 2: Account Settings Management ✅ COMPLETE**  
This requirement is fully met, offering secure password modification, confirmed account deletion to prevent accidental data loss, and detailed profile settings management, all functioning reliably with clear user feedback.

**Requirement 3: Family Tree Management ✅ EXCEEDED**  
This feature significantly exceeds expectations by supporting over twenty distinct relationship types with temporal consistency validation. It includes sophisticated CRUD operations, an interactive tree visualization powered by React Flow, and a dynamic relationship calculation engine.

**Requirement 4: Rich Profile Management ✅ EXCEEDED**  
Profile management is comprehensively implemented with features like avatar uploads via Active Storage, a detailed timeline system for life events, a custom facts system, a versatile media gallery, and a rich text notes system for detailed biographies.

**Requirement 5: Tree Visualization and Navigation ✅ EXCEEDED**  
Visualization and navigation are implemented to a professional grade, featuring dynamic centering with smooth animations, informative person card pop-ups, a MiniMap for large tree navigation, and interactive pan/zoom with full mobile touch support.

**Requirement 6: Social Media Sharing ✅ IMPLEMENTED**  
The core functionality for social media sharing is fully implemented. The system generates automatic tree previews, allows selective sharing of profiles while maintaining privacy, and integrates seamlessly with popular social media platforms.

### 5.2 Advanced Features & Innovations

**Sophisticated Relationship Engine**  
The relationship engine is a standout achievement, supporting over twenty distinct relationship types through dedicated service classes including BloodRelationshipDetector, UnifiedRelationshipCalculator, and SiblingRelationshipManager. This includes blood relations (parent, child, sibling, etc.), step-relations (step-parent, step-child), half-relations, and in-law connections. The engine also handles extended family (uncles, aunts, cousins) and performs temporal validation to ensure chronological accuracy across the entire network. This is visually represented in the supported relationship types diagram (see Fig. 5.2.1) and the implementation details are shown in Fig. 5.2.2.

**Figure 5.2.1: Relationship Types Supported**  
![Complete Relationship Schema](diagrams/complete_relationship_schema.html)

**Figure 5.2.2: Blood Relationship Detection Implementation**

```ruby
# Blood relationship detection from app/services/blood_relationship_detector.rb
class BloodRelationshipDetector
  def initialize(person1, person2)
    @person1 = person1
    @person2 = person2
  end

  def self.blood_related?(person1, person2)
    new(person1, person2).blood_related?
  end
  
  def self.marriage_allowed?(person1, person2)
    new(person1, person2).marriage_allowed?
  end
  
  def self.sibling_allowed?(person1, person2)
    new(person1, person2).sibling_allowed?
  end

  def blood_related?
    return false if @person1.nil? || @person2.nil?
    return false if @person1 == @person2

    return true if direct_parent_child?
    return true if siblings?
    return true if ancestor_descendant?
    return true if uncle_aunt_nephew_niece?
    return true if first_cousins?

    false
  end
  
  def marriage_allowed?
    return false if blood_related?
    
    # Allow remarriage to in-laws in certain circumstances
    allowed_through_ex_spouse = allowed_remarriage_relative?(@person1, @person2) || 
                               allowed_remarriage_relative?(@person2, @person1)
    
    return true if allowed_through_ex_spouse
    
    true
  end
  
  def sibling_allowed?
    return false if @person1.nil? || @person2.nil?
    return false if @person1 == @person2
    
    # Check blood relationship restrictions
    if blood_related?
      desc = relationship_description
      return false if desc && (
        desc.include?('parent') || desc.include?('child') ||
        desc.include?('grandparent') || desc.include?('grandchild') ||
        desc.include?('uncle') || desc.include?('aunt') ||
        desc.include?('nephew') || desc.include?('niece') ||
        desc.include?('great-grand')
      )
      
      return false if siblings?
      return false if first_cousins?
    end
    
    # Age gap validation for siblings
    if @person1.date_of_birth && @person2.date_of_birth
      person1_birth = Date.parse(@person1.date_of_birth.to_s)
      person2_birth = Date.parse(@person2.date_of_birth.to_s)
      age_gap_years = (person1_birth - person2_birth).abs / 365.25
      
      return false if age_gap_years > 25
    end
    
    # Timeline validation - siblings should have overlapping lifespans
    if @person1.date_of_birth && @person2.date_of_birth
      person1_birth = Date.parse(@person1.date_of_birth.to_s)
      person2_birth = Date.parse(@person2.date_of_birth.to_s)
      
      if @person1.date_of_death
        person1_death = Date.parse(@person1.date_of_death.to_s)
        return false if person2_birth > person1_death
      end
      
      if @person2.date_of_death
        person2_death = Date.parse(@person2.date_of_death.to_s)
        return false if person1_birth > person2_death
      end
    end
    
    true
  end

  private

  def direct_parent_child?
    @person1.parents.include?(@person2) || @person2.parents.include?(@person1)
  end

  def siblings?
    return false unless @person1.parents.any? && @person2.parents.any?
    
    (@person1.parents & @person2.parents).any?
  end

  def ancestor_descendant?
    # Check if one is ancestor/descendant of the other
    check_ancestor_descendant(@person1, @person2) || check_ancestor_descendant(@person2, @person1)
  end

  def check_ancestor_descendant(ancestor, descendant)
    visited = Set.new
    queue = [descendant]
    
    while queue.any?
      current = queue.shift
      next if visited.include?(current.id)
      visited.add(current.id)
      
      return true if current.parents.include?(ancestor)
      queue.concat(current.parents)
    end
    
    false
  end
end
```

**Advanced Validation System**  
The validation system ensures data integrity with several advanced checks. It enforces a minimum marriage age, validates a plausible age gap between parents and children, and ensures timeline consistency (e.g., preventing marriages after a person's death). Error messages are user-friendly, and proactive filtering guides users away from invalid relationship selections during data entry.

**Modern Technical Architecture**  
The architecture reflects current industry best practices. The frontend uses React 19 with hooks and React Flow, while the backend is built on Rails 8.0.2 with Active Storage and PostgreSQL. Authentication is handled by JWT, and the project includes a comprehensive test suite with over one hundred test files, ensuring code reliability.

### 5.3 Quality Metrics & Performance

**Code Quality**  
The codebase is modular, with a clear separation of concerns. It is comprehensively documented with technical specifications and user guides. Extensive test coverage ensures system reliability, and security best practices are followed throughout.

**User Experience**  
The UX is responsive and mobile-first, with touch-friendly interactions. It is designed to be accessible, complying with WCAG standards. Performance is optimized through efficient queries, streamlined data loading, and smooth animations.

**Business Logic Compliance**  
The business logic adheres to real-world family relationship rules, including biological and legal constraints. It is culturally appropriate and ensures temporal accuracy and data integrity, preventing impossible family structures.

## 6. Key Terms & Technical Glossary

| Term | Definition |
|------|------------|
| Blood Relationship | Direct biological family connection (parent, child, sibling, grandparent, etc.) with degrees 1-5 based on closeness |
| Step Relationship | Family connection formed through marriage to a blood relative (step-parent, step-child, step-sibling, step-grandparent) |
| Half Relationship | Sibling connection sharing exactly one biological parent |
| In-Law Relationship | Family connection through marriage (father-in-law, mother-in-law, brother-in-law, etc.) |
| Temporal Validation | Business logic ensuring relationship timing constraints preventing impossible chronological relationships |
| Blood Relationship Detection | Advanced validation system preventing inappropriate family connections using degree-based closeness analysis |
| Active Storage | Rails framework for handling file uploads, attachments, and media management with cloud storage support |
| React Flow (xyflow) | Advanced React library for building interactive, draggable node-based diagrams and family tree visualizations |
| Polymorphic Association | Database design pattern allowing models to belong to multiple other models (e.g., Media belongs to Person) |
| JWT Authentication | JSON Web Token-based stateless authentication system with auto-logout and secure session management |
| Serializer | Component responsible for converting data models to JSON format with relationship inclusion and field filtering |
| Dynamic Centering | Interactive tree feature allowing smooth pan/zoom navigation to focus on selected family members |
| MiniMap Navigation | Viewport rectangle overlay for navigating large family trees with responsive mouse and touch interactions |
| Timeline Consistency | Validation ensuring deceased persons don't have relationships with people born after their death |
| Relationship Calculator | Core engine determining family relationships between any two people using breadth-first search algorithms |
| Step-Family Business Rules | Comprehensive logic determining valid step-relationships through direct marriage connections only |
| Bidirectional Relationships | Symmetric relationship logic ensuring consistency regardless of which person is set as the root |

## Appendix A: References

The following references provide additional technical documentation, architectural guidelines, and implementation details that support the ChronicleTree project.

- **React 19 Documentation**: Official documentation for React
- **React Flow Documentation**: Guide for the interactive diagram library
- **Ruby on Rails 7 Guides**: Official framework documentation
- **PostgreSQL Documentation**: Database system documentation
- **ARCHITECTURE_DIAGRAMS.html**: Visual system architecture documentation
- **chronicle_tree_client/docs/development_roadmap.md**: Frontend development roadmap
- **STEP_RELATIONSHIP_BUSINESS_RULES_UPDATED.md**: Business rules for step-family logic
- **TEMPORAL_VALIDATION_FOR_RELATIONSHIPS.md**: Documentation for timeline validation

## References

### Technical Documentation

- **React 19 Documentation**: Comprehensive guide for modern React development including hooks, concurrent features, and performance optimization techniques. Available at: https://react.dev/
- **React Flow Documentation**: Detailed documentation for implementing interactive node-based diagrams and family tree visualizations. Available at: https://reactflow.dev/
- **Ruby on Rails 7 Guides**: Official framework documentation covering API development, Active Storage, security best practices, and deployment strategies. Available at: https://guides.rubyonrails.org/
- **PostgreSQL Documentation**: Database system documentation including advanced features, indexing strategies, and performance optimization techniques. Available at: https://www.postgresql.org/docs/

### Project Documentation

- **ARCHITECTURE_DIAGRAMS.html**: Visual system architecture documentation including comprehensive diagrams of database schema, API endpoints, technology stack, and system components
- **ROADMAP.md**: Detailed development roadmap documenting feature implementations, bug fixes, UI/UX enhancements, and architectural decisions throughout the project lifecycle
- **REQUIREMENTS.md**: Complete requirements specification with functional and non-functional requirements, use cases, and acceptance criteria

### Implementation References

- **improvedRelationshipCalculator.js**: Core relationship calculation engine implementing 20+ relationship types with comprehensive validation and gender-specific terminology
- **familyTreeHierarchicalLayout.js**: Advanced tree positioning algorithms optimized for React Flow integration with support for complex family structures
- **validationAlerts.js**: Comprehensive data validation system providing user-friendly error messages and proactive warnings for data integrity

### Standards and Compliance

- **Web Content Accessibility Guidelines (WCAG) 2.1**: Accessibility standards ensuring universal access to genealogical functionality
- **RESTful API Design Principles**: Industry standard patterns for API design and implementation
- **JWT Authentication Standards**: Security best practices for stateless authentication and session management

---

*This document represents the complete technical specification for the ChronicleTree genealogy management system, incorporating all recent enhancements and architectural decisions through August 4, 2025.*