# ChronicleTree Development Journal
## Monthly Learning Log - BSc (Honours) Computing Software Development

**Student:** Yuliia Smyshliakova  
**Student ID:** x23327127  
**Module:** Software Project  
**Lecturer:** Andrew Hogan  
**Academic Year:** 2024/2025  
**Submission Date:** 9 August 2025

---

## Log 1 - May 21, 2025
Today we started the project module which I have been looking forward to since the beginning of the course. I have been thinking about creating a genealogy application because I find family history fascinating, and I want to build something that combines modern web development with meaningful personal storytelling. I'm nervous about undertaking such a complex project since it involves both frontend and backend development, but I have been learning React and Rails throughout my studies, so I think I can apply those skills effectively.

I am particularly interested in the relationship modeling aspect - figuring out how to represent complex family structures in a database seems like a challenging but rewarding problem to solve. I hope I can create something that feels professional and useful rather than just a basic CRUD application.

## Log 2 - May 28, 2025
I started working on my proposal this week. What I'm trying to achieve seems quite ambitious right now - a full genealogy management system with interactive tree visualization, relationship validation, and social sharing features. I'm concerned about whether I can implement all these features in the time available, especially the complex relationship calculations and tree layout algorithms.

I have been researching existing genealogy software and noticed they often have complicated interfaces that overwhelm users. I want to create something more accessible while still being powerful enough for serious family history work. The technical challenge of building the tree visualization using React is both exciting and intimidating.

## Log 3 - June 7, 2025
Had my proposal approved today, which was a relief. The feedback was positive about the project scope and technical complexity. I've decided to call it ChronicleTree, focusing on the storytelling aspect of family history rather than just data collection.

Started setting up the development environment this week. Chose Rails 8.0.2 for the backend API and React 19 for the frontend. The decision to separate these into different applications feels right for maintaining clean architecture. I am planning to use PostgreSQL for the database because of its robust relationship modeling capabilities.

The initial database design is proving more complex than expected. Representing family relationships while avoiding circular references and maintaining data integrity requires careful thought about foreign keys and constraints.

## Log 4 - June 14, 2025
This week I focused on the core database schema design and started implementing basic authentication. The relationship modeling is definitely the most challenging aspect so far. I decided to use a self-referencing relationships table that can handle parent-child, spouse, and sibling connections with different relationship types.

Authentication setup went smoothly using Devise with JWT tokens. I like how this approach keeps the API stateless while providing secure user sessions. The token denylist implementation for logout functionality was trickier than expected but essential for proper security.

Started building the basic Person and Relationship models with proper validations. The complexity of family relationships is becoming clear - step-relationships, divorced individuals, and deceased family members all need special handling.

## Log 5 - June 21, 2025
Made significant progress on the React frontend this week. Setting up the component architecture and routing took some time, but I'm happy with the modular structure I've created. Using TanStack Query for server state management has been a good decision - it handles caching and synchronization really well.

The person creation and editing forms are working now. I spent a lot of time on form validation and user experience details. Learning React Hook Form properly has made the form handling much cleaner than my previous projects.

Started experimenting with ReactFlow for the tree visualization. This library is powerful but has a steep learning curve. The challenge will be creating custom layout algorithms that position family members in logical hierarchical arrangements.

## Log 6 - June 28, 2025 (Interim Report Due)
Submitted my interim report today. The progress feels solid - I have a working authentication system, basic CRUD operations for people and relationships, and the beginnings of tree visualization. The relationship validation logic is starting to take shape.

The biggest challenge I've identified is the complexity of genealogical relationship calculations. I started implementing a BloodRelationshipDetector service to prevent inappropriate marriages between relatives. This requires traversing relationship networks to detect consanguinity, which is more complex than I initially anticipated.

Performance is already a concern with complex relationship queries. I need to be careful about database query optimization and caching strategies as the system grows.

## Log 7 - July 5, 2025
This week was all about the relationship calculation algorithms. I created a comprehensive improvedRelationshipCalculator.js module that ended up being over 2,000 lines of complex logic. This handles everything from basic parent-child relationships to complex multi-generational analysis with step-relationships and in-law connections.

The temporal validation aspect was particularly interesting - ensuring that relationships make chronological sense (people can't be married if one died before the other was born). This required implementing sophisticated date comparison logic throughout the relationship system.

I'm proud of the algorithm complexity I've achieved, but debugging these calculations with edge cases has been time-consuming. Created extensive test scenarios to verify the logic works correctly.

## Log 8 - July 12, 2025
Focused on the tree visualization algorithms this week. The familyTreeHierarchicalLayout.js component implements custom spatial positioning that calculates optimal node placement based on generational hierarchy. Working with ReactFlow's positioning system while implementing custom layout logic has taught me a lot about algorithm development.

The anti-overlap layout system was necessary to prevent node collisions while maintaining readable family structure representation. This involved implementing collision detection and spacing adjustment algorithms that balance visual clarity with space efficiency.

The "Late Spouse" logic for deceased partners was surprisingly complex - determining when to mark someone as "Late Husband/Wife" based on perspective and timeline requires careful consideration of who is viewing the tree and when relationships occurred.

## Log 9 - July 19, 2025
Image generation has been this week's focus. Implementing the Ruby VIPS system for creating social media optimized family tree cards was technically challenging but rewarding. The ProfileCardGenerator creates dynamic layouts that adapt based on content - profile cards can range from 750px to 1200px height depending on timeline events and relationships.

The TreeSnippetGenerator for family tree visualization images required implementing adaptive spacing algorithms that handle 1-5 generations with appropriate sizing (120px → 90px → 70px → 60px) to prevent overlap issues.

Average generation times of 223ms for profile cards and 334ms for tree images seem reasonable for the complexity involved. The quality is professional enough for social media sharing.

## Log 10 - July 26, 2025
Security implementation week. Added comprehensive rate limiting using Rack::Attack with multi-layered protection strategies. The configuration includes IP-based throttling (300 requests per 5 minutes), user limits (1000 per hour), and specialized authentication endpoint protection.

Implementing PaperTrail for audit logging was straightforward but configuring it properly for comprehensive change tracking required understanding Rails callbacks and database versioning. Having complete audit trails for all genealogical data changes seems important for data integrity.

The JWT denylist functionality for secure logout was more complex than expected but necessary for proper session management in a genealogy application where data privacy is crucial.

## Log 11 - August 2, 2025
Testing and quality assurance focus this week. Created comprehensive test suites using Vitest for frontend and Rails Minitest for backend. The relationship calculation algorithms require extensive testing with various family configurations to ensure accuracy.

Implementing ESLint and Rubocop configurations helped maintain consistent code quality throughout development. The Brakeman security scanner identified a few potential vulnerabilities that I addressed.

Performance testing revealed that complex relationship queries execute in around 204ms, which seems acceptable for the complexity involved. Database query optimization with proper indexing has been crucial for maintaining performance.

## Log 12 - August 9, 2025 (Final Submission)
Final week focused on documentation and polish. Completed the technical report with comprehensive analysis of the implemented systems. The project ended up being more algorithmically complex than I initially planned, particularly the frontend relationship calculation engine and spatial positioning algorithms.

Key achievements I'm proud of:
- 2,056-line relationship calculation algorithm handling complex genealogical scenarios
- Custom hierarchical layout algorithms for tree visualization  
- Sophisticated consanguinity detection preventing inappropriate relationships
- Professional image generation system with Ruby VIPS
- Comprehensive security implementation with audit logging
- Clean separation of concerns between frontend and backend

The most significant learning outcome was understanding how complex domain modeling can be. Genealogy appears simple initially but handling all the edge cases of real family structures (step-relationships, divorces, deceased individuals, timeline validation) required much more sophisticated logic than anticipated.

The experience of building comprehensive algorithms from scratch has been valuable for understanding software engineering at a deeper level. I feel much more confident in my ability to tackle complex domain problems and implement robust solutions.

## Technical Learning Outcomes

**Most Challenging Technical Aspect:** The relationship calculation algorithms required extensive research into genealogical patterns and edge case handling. Debugging complex multi-generational relationship traversal logic while maintaining acceptable performance proved particularly challenging.

**Primary Technical Achievement:** Developing the 2,056-line improvedRelationshipCalculator.js module that handles temporal validation, step-relationships, and complex family structures. Successfully implementing logic that correctly identifies relationships such as "second cousin once removed" represents a significant technical accomplishment.

**Core Skills Developed:** Advanced algorithm implementation, complex database modeling, security architecture design, performance optimization techniques, and comprehensive testing methodologies. The project required effective integration of multiple technologies and frameworks.

**Professional Applications:** The relationship modeling and algorithm development experience will prove valuable for complex domain modeling projects in professional software development. Understanding how to decompose complicated business logic into manageable, testable components is directly applicable across various software engineering contexts.

---

*This journal reflects the genuine learning journey of developing ChronicleTree from initial concept through final implementation, capturing both technical challenges and personal growth throughout the project lifecycle.*