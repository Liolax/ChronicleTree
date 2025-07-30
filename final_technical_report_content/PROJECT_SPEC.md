ChronicleTree - Product Design Specification
Version 1.1 Date: July 28, 2025
VERSION HISTORY
Version	Implemented By	Revision Date	Approved By	Approval Date	Reason
1.0	Yuliia Smyshliakova	07/28/25	Solo Project	07/28/25	Initial Design Definition
1.1		07/28/25	Solo Project	07/28/25	Refined structure and enhanced descriptions
TABLE OF CONTENTS
1.Introduction
○1.1 Purpose
2.General Overview
○2.1 Assumptions / Constraints / Standards
3.Architecture Design
○3.1 Logical View
○3.2 Hardware Architecture
○3.3 Software Architecture
○3.4 Security Architecture
○3.5 Communication Architecture
○3.6 Performance
4.System Design
○4.1 Use Cases
○4.2 Database Design
○4.3 Data Conversions
○4.4 Application Program Interfaces
○4.5 User Interface Design
○4.6 Performance
○4.7 Compliance
5.Project Achievements & Requirements Fulfillment
6.Key Terms
7.Appendix A: References
1. Introduction
1.1 Purpose
ChronicleTree is a comprehensive full-stack web application for family tree and genealogy management, designed to address gaps in existing genealogical software by prioritizing rich, user-centric experiences alongside robust data management. The primary goal of this project is to deliver a secure and intuitive platform for creating, visualizing, and managing detailed family histories. Success is measured by the complete implementation of all core functional requirements, with a particular focus on an innovative relationship engine that supports over twenty distinct relationship types with full temporal validation.
The application's target audience includes individuals interested in documenting their family history, from casual enthusiasts to dedicated genealogists, as well as families seeking a collaborative tool for heritage preservation.
The ChronicleTree project represents a significant achievement in modern genealogy software. It successfully delivers an interactive tree visualization system using React Flow, complete with advanced navigation like a MiniMap for large family structures. The sophisticated relationship engine is a cornerstone, supporting a wide array of connections from blood relations to step-family and in-law relationships, all validated for temporal consistency. Profile management is extensive, offering media galleries, detailed timelines, and customizable facts. The architecture is built on modern technologies, including React 18, Rails 7, and PostgreSQL, with security handled through JWT-based authentication and user-scoped data protection.
2. General Overview
ChronicleTree is built on a modern full-stack architecture, featuring a React frontend and a Ruby on Rails API backend. The system is designed to provide accurate relationship modeling, intuitive data visualization, and comprehensive management of family information.
2.1 Assumptions / Constraints / Standards
The development environment assumes compatibility with modern web browsers supporting ES6+ JavaScript. The frontend requires Node.js (v18+) and the backend relies on Ruby (v3.0+) with Rails (v7+). The production environment is designed for a PostgreSQL database with Active Storage for file management.
The business logic adheres to established genealogical principles, where family relationships maintain biological and legal precedence. For instance, step-relationships are formed exclusively through marriage to a biological family member, and relationships involving deceased spouses are temporally validated for accuracy. To balance user experience and system performance, media uploads are constrained to a 10MB file size limit.
Architecturally, the system follows RESTful API design principles, using JSON for all data exchange. Security is centered on JWT authentication for API access control, and responsive design principles ensure a seamless experience on mobile devices.
3. Architecture Design
3.1 Logical View
ChronicleTree employs a client-server architecture with a clear separation of concerns between the frontend and backend. This structure ensures modularity and scalability. The client-side, built with React, handles all user interface elements, including the family tree visualization, relationship management, and media galleries. It communicates with the backend via HTTP/HTTPS requests. The server-side, a Rails API, manages authentication, business logic, data modeling, and file storage, interacting with a PostgreSQL database to persist user data.
This relationship is visually detailed in the System Architecture Overview.
Figure 3.1.1: System Architecture Overview Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "System Architecture Overview" section here.
3.2 Hardware Architecture
The ChronicleTree application is designed for a distributed hardware environment, supporting both local development and cloud-based production deployments.
For development, a standard desktop or laptop with at least 8GB of RAM, a dual-core processor, and SSD storage is sufficient. In production, the architecture supports both traditional servers and containerized environments. The Rails API backend runs efficiently on a standard Linux server with a minimum of 4GB of RAM and a multi-core processor. The PostgreSQL database requires adequate storage with backup capabilities, preferably on SSDs for performance.
Cloud deployments can leverage containerization for horizontal scaling, with a load balancer distributing requests and database clustering for redundancy. A Content Delivery Network (CDN) can enhance media file delivery, improving user experience.
The progression from a development setup to a full production environment is illustrated in the Deployment Architecture diagram.
Figure 3.2.1: Deployment Architecture Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Deployment Architecture" section here.
3.3 Software Architecture
The frontend architecture is centered on React 18, using modern hooks for state management. The interactive family tree is powered by React Flow (xyflow), providing professional-grade rendering and navigation. Styling is handled by Tailwind CSS for a consistent, utility-first design. Client-side routing is managed by React Router, and API communication is handled by Axios.
The backend is built on Ruby on Rails 7, following the MVC pattern. Active Storage manages file attachments with cloud compatibility. User authentication is handled by Devise, and Active Model Serializers format JSON responses. Background jobs, such as media processing, are managed by Sidekiq to avoid impacting user experience.
A summary of the technologies used can be found in the Technology Stack diagram.
Figure 3.3.1: Technology Stack Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Technology Stack" section here.
Key Components:
The frontend is organized into a hierarchical component structure. The Tree directory contains visualization components like FamilyTreeFlow.jsx and CustomNode.jsx. Profile management components, such as RelationshipManager.jsx and MediaForm.jsx, are in dedicated directories. Core logic is handled by utility modules like improvedRelationshipCalculator.js and familyTreeHierarchicalLayout.js.
The backend follows Rails conventions with versioned API controllers. The controllers directory contains endpoints for managing people, relationships, and media. Data models encapsulate business logic, and serializers ensure consistent JSON formatting.
Examples of these key architectural components are provided in the code implementation samples, featuring current production code including:
●Advanced CustomNode.jsx with @xyflow/react integration, Avatar support, and interactive features
●People Controller with transaction handling, temporal validation, and relationship logic
●Relationship Calculator with genealogical algorithms and multi-generational support
Figure 3.3.2: Key Code Implementation Samples Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Key Code Implementation Samples" section here.
3.4 Security Architecture
The application's security architecture is built on a foundation of JWT-based stateless authentication, ensuring scalable and secure session management. Access control is strictly enforced through user-scoped data restrictions, guaranteeing that users can only interact with their own family data. Passwords are protected using the industry-standard bcrypt hashing algorithm. To enable flexible deployment, CORS is configured to allow secure cross-origin requests.
Data protection is further enhanced through comprehensive input validation and sanitization to prevent malicious injections. ActiveRecord's built-in parameter binding mitigates SQL injection risks. File uploads are secured with rigorous content-type validation, and secure file serving is managed through Active Storage's integrated features.
3.5 Communication Architecture
The API design adheres to RESTful conventions, following standard Rails patterns for a predictable developer experience. All data is exchanged in a standardized JSON format, and HTTP status codes provide clear communication of operational results for robust error handling.
The system implements a comprehensive set of RESTful API endpoints for all family tree management operations. These endpoints, which cover creating, reading, updating, and deleting people, relationships, and media, are detailed in the API Endpoints Structure diagram.
Figure 3.5.1: API Endpoints Structure Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "API Endpoints Structure" section here.
3.6 Performance
The performance architecture is designed for a responsive user experience. This is achieved through multi-layered optimizations, including database query optimization, strategic caching, and efficient data loading.
Database performance is enhanced with advanced PostgreSQL indexing on frequently queried fields. Eager loading is used for relationship data to reduce N+1 query scenarios, and connection pooling ensures efficient resource use during peak times.
On the frontend, React 18's concurrent rendering and React Flow's optimized, viewport-based rendering handle large family trees without performance loss. Images are automatically optimized by Active Storage. Caching is implemented at multiple levels: browser-based for static assets, API response caching, and database query caching. Resource-intensive tasks are offloaded to background jobs using Sidekiq, ensuring the UI remains responsive.
4. System Design
4.1 Use Cases
The primary user workflow guides a user through the complete process of family tree management, from registration to sharing. Key use cases include creating a family tree by adding members and defining their relationships, managing rich profiles with media and timelines, and sharing the final visualization with others.
This entire flow is mapped out in the User Workflow diagram.
Figure 4.1.1: User Workflow Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "User Workflow" section here.
4.2 Database Design
The database schema is designed to support complex family relationships and rich profile data. The core tables include people for storing individual family member data, relationships for defining connections between them, and media for handling file attachments. This structure is normalized to ensure data integrity and efficiency.
A visual representation of the tables and their fields is available in the Database Schema Design diagram.
Figure 4.2.1: Database Schema Design Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Database Schema Design" section here.
The system supports a variety of relationship types, including parent/child, spouse (with flags for ex-spouses and deceased status), and sibling (which is calculated as full, half, or step).
4.3 Data Conversions
Data conversion processes are essential for ensuring seamless integration between different data formats within the application. The system handles various input formats while maintaining data integrity.
Date format conversion algorithms accommodate multiple patterns (e.g., MM/DD/YYYY, YYYY-MM-DD), with automatic detection and chronological validation. The system also supports partial dates. Name data is standardized to handle various cultural conventions, and character encoding conversion ensures proper handling of international characters.
Media files are converted using Active Storage, with automatic optimization for web delivery. Relationship data from various input methods is transformed into a consistent internal format, maintaining bidirectional integrity. JSON serialization and deserialization ensure consistent data exchange between the frontend and backend, with comprehensive validation to prevent malformed data.
4.4 Application Program Interfaces
Relationship Calculator API:
The core of the application's logic lies in the relationship calculation engine, which determines the connection between any two family members. The main function, calculateRelationshipToRoot(), processes the family tree data to identify relationships such as parent, child, grandparent, step-parent, half-sibling, and various in-law and extended family connections.
The implementation details of this calculator can be seen in the code samples.
Figure 4.4.1: Relationship Calculator Implementation Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Key Code Implementation Samples" section (Relationship Calculator sample) here.
Media Management API:
File management is handled through Active Storage, with a Media Controller API providing secure uploads, validation, and metadata extraction. The system supports diverse file types and includes comprehensive error handling and user-scoped access controls.
The implementation of the API controller is detailed in the code samples.
Figure 4.4.2: Rails API Controller Implementation Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Key Code Implementation Samples" section (Rails API Controller sample) here.
4.5 User Interface Design
Design Principles:
The UI design philosophy focuses on a clean, intuitive interface that prioritizes the family tree visualization. A mobile-first, responsive design ensures an optimal experience on all devices. Interactive elements feature clear feedback through hover states and smooth transitions. Accessibility is a key consideration, with proper ARIA labels and keyboard navigation support.
The component architecture follows modern React patterns, promoting reusability and consistency.
Figure 4.5.1: React Component Architecture Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Key Code Implementation Samples" section (React Component sample) here.
Key UI Components:
The Advanced Family Tree Visualization uses a React Flow-based canvas with hierarchical layout algorithms. Custom nodes display comprehensive person information, and a MiniMap aids navigation of large trees. The interface is touch-friendly and optimized for mobile devices.
Comprehensive Profile Management features rich profile pages with a tabbed interface, avatar uploads, a timeline for milestones, a custom facts system, and a media gallery. A notes system with rich text editing allows for detailed biographical information.
The Advanced Form System uses React Hook Form with Yup for robust validation. It provides real-time feedback, proactive warnings for blood relationship conflicts, and temporal validation to prevent impossible relationship configurations.
The complete UI implementation and interaction patterns are demonstrated in the application's models.
Figure 4.5.2: Database Model Implementation Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Key Code Implementation Samples" section (Rails Model sample) here.
4.6 Performance
System design for performance focuses on ensuring a responsive user experience, even with large data volumes. This is achieved through comprehensive indexing in the database, optimized query structures to minimize round trips, and efficient relationship traversal algorithms.
The API design includes pagination for large datasets and response caching for frequently accessed data. On the frontend, efficient component rendering, lazy loading for images, and optimized memory management for the family tree visualization ensure a smooth experience. Resource-intensive tasks are handled by background jobs to keep the UI responsive.
4.7 Compliance
The application is designed to comply with modern web accessibility standards, data protection regulations, and genealogical software best practices.
Accessibility follows WCAG 2.1 standards, with comprehensive ARIA labeling, keyboard navigation, and screen reader compatibility. Data protection adheres to contemporary privacy regulations, with user-scoped access, secure data handling, and transparent privacy policies. Security compliance addresses common web vulnerabilities through systematic measures.
Genealogical ethics are also considered, with respectful handling of family information, cultural sensitivity in relationship classifications, and privacy controls for sensitive data.
5. Project Achievements & Requirements Fulfillment
5.1 Core Requirements Achievement Status
The project successfully achieves 100% fulfillment of all six original functional requirements, with significant enhancements beyond the baseline expectations.
Requirement 1: User Authentication ✅ EXCEEDED
The implementation exceeds specifications by providing a comprehensive security system with JWT-based stateless authentication, advanced email validation, password strength enforcement, secure password reset workflows, and strict user-scoped data access to ensure complete privacy.
Requirement 2: Account Settings Management ✅ COMPLETE
This requirement is fully met, offering secure password modification, confirmed account deletion to prevent accidental data loss, and detailed profile settings management, all functioning reliably with clear user feedback.
Requirement 3: Family Tree Management ✅ EXCEEDED
This feature significantly exceeds expectations by supporting over twenty distinct relationship types with temporal consistency validation. It includes sophisticated CRUD operations, an interactive tree visualization powered by React Flow, and a dynamic relationship calculation engine.
Requirement 4: Rich Profile Management ✅ EXCEEDED
Profile management is comprehensively implemented with features like avatar uploads via Active Storage, a detailed timeline system for life events, a custom facts system, a versatile media gallery, and a rich text notes system for detailed biographies.
Requirement 5: Tree Visualization and Navigation ✅ EXCEEDED
Visualization and navigation are implemented to a professional grade, featuring dynamic centering with smooth animations, informative person card pop-ups, a MiniMap for large tree navigation, and interactive pan/zoom with full mobile touch support.
Requirement 6: Social Media Sharing ✅ IMPLEMENTED
The core functionality for social media sharing is fully implemented. The system generates automatic tree previews, allows selective sharing of profiles while maintaining privacy, and integrates seamlessly with popular social media platforms.
5.2 Advanced Features & Innovations
Sophisticated Relationship Engine 🏆
The relationship engine is a standout achievement, supporting over twenty distinct relationship types. This includes blood relations (parent, child, sibling, etc.), step-relations (step-parent, step-child), half-relations, and in-law connections. The engine also handles extended family (uncles, aunts, cousins) and performs temporal validation to ensure chronological accuracy across the entire network. This is visually represented in the supported relationship types diagram.
Figure 5.2.1: Relationship Types Supported Hint: Place a screenshot from ARCHITECTURE_DIAGRAMS.html → "Relationship Types Supported" section here.
Advanced Validation System 🏆
The validation system ensures data integrity with several advanced checks. It enforces a minimum marriage age, validates a plausible age gap between parents and children, and ensures timeline consistency (e.g., preventing marriages after a person's death). Error messages are user-friendly, and proactive filtering guides users away from invalid relationship selections during data entry.
Modern Technical Architecture 🏆
The architecture reflects current industry best practices. The frontend uses React 18 with hooks and React Flow, while the backend is built on Rails 7 with Active Storage and PostgreSQL. Authentication is handled by JWT, and the project includes a comprehensive test suite with over one hundred test files, ensuring code reliability.
5.3 Quality Metrics & Performance
Code Quality
The codebase is modular, with a clear separation of concerns. It is comprehensively documented with technical specifications and user guides. Extensive test coverage ensures system reliability, and security best practices are followed throughout.
User Experience
The UX is responsive and mobile-first, with touch-friendly interactions. It is designed to be accessible, complying with WCAG standards. Performance is optimized through efficient queries, streamlined data loading, and smooth animations.
Business Logic Compliance
The business logic adheres to real-world family relationship rules, including biological and legal constraints. It is culturally appropriate and ensures temporal accuracy and data integrity, preventing impossible family structures.
6. Key Terms & Technical Glossary
Term	Definition
Blood Relationship	Direct biological family connection (parent, child, sibling, grandparent, etc.) with degrees 1-5 based on closeness
Step Relationship	Family connection formed through marriage to a blood relative (step-parent, step-child, step-sibling, step-grandparent)
Half Relationship	Sibling connection sharing exactly one biological parent
In-Law Relationship	Family connection through marriage (father-in-law, mother-in-law, brother-in-law, etc.)
Temporal Validation	Business logic ensuring relationship timing constraints preventing impossible chronological relationships
Blood Relationship Detection	Advanced validation system preventing inappropriate family connections using degree-based closeness analysis
Active Storage	Rails framework for handling file uploads, attachments, and media management with cloud storage support
React Flow (xyflow)	Advanced React library for building interactive, draggable node-based diagrams and family tree visualizations
Polymorphic Association	Database design pattern allowing models to belong to multiple other models (e.g., Media belongs to Person)
JWT Authentication	JSON Web Token-based stateless authentication system with auto-logout and secure session management
Serializer	Component responsible for converting data models to JSON format with relationship inclusion and field filtering
Dynamic Centering	Interactive tree feature allowing smooth pan/zoom navigation to focus on selected family members
MiniMap Navigation	Viewport rectangle overlay for navigating large family trees with responsive mouse and touch interactions
Timeline Consistency	Validation ensuring deceased persons don't have relationships with people born after their death
Relationship Calculator	Core engine determining family relationships between any two people using breadth-first search algorithms
Step-Family Business Rules	Comprehensive logic determining valid step-relationships through direct marriage connections only
Bidirectional Relationships	Symmetric relationship logic ensuring consistency regardless of which person is set as the root
Appendix A: References
The following references provide additional technical documentation, architectural guidelines, and implementation details that support the ChronicleTree project.
●React 18 Documentation: Official documentation for React.
●React Flow Documentation: Guide for the interactive diagram library.
●Ruby on Rails 7 Guides: Official framework documentation.
●PostgreSQL Documentation: Database system documentation.
●ARCHITECTURE_DIAGRAMS.html: Visual system architecture documentation.
●chronicle_tree_client/docs/development_roadmap.md: Frontend development roadmap.
●STEP_RELATIONSHIP_BUSINESS_RULES_UPDATED.md: Business rules for step-family logic.
●TEMPORAL_VALIDATION_FOR_RELATIONSHIPS.md: Documentation for timeline validation.