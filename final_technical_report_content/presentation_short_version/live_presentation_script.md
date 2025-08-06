
# ChronicleTree: 7-Minute Student Project Presentation Script

---

### Slide 1: Introduction (1 min)
"Hello, I'm Yuliia. Welcome to ChronicleTree: Your Family's Living Legacy. ChronicleTree is a full-stack, mobile-first Single Page Application (SPA) for creating, managing, and visualizing complex family trees. It’s built to make family history accessible, interactive, and accurate for everyone—on any device. Today, I’ll walk you through the real technical and user experience breakthroughs that set ChronicleTree apart."

---

### Slide 2: Addressing the Genealogy Gap (1 min)
"The genealogy space is full of outdated tools that are hard to use, lack advanced relationship modeling, and don’t validate data. Most have poor interfaces, limited interaction, and no real social sharing. Modern families need more: support for step-relations, ex-spouses, and rich, accurate data. ChronicleTree is designed to close this gap with a modern, mobile-first approach."

---

### Slide 3: Technical Architecture (1 min)
"Our solution is a mobile-first SPA built on a modern stack. The frontend uses React 19 with hooks and concurrent features for a responsive, interactive experience. ReactFlow powers our tree visualization, and Tailwind CSS ensures accessibility. The backend is a Rails 8.0.2 API with Ruby 3.3.7, using PostgreSQL for complex data and JWT (JSON Web Token) authentication for security. We use Sidekiq and Redis for background jobs in development, and Solid Queue and Solid Cache in production for reliability and simplicity. Media is handled with Active Storage, and image sharing uses VIPS for fast generation. Offline and installable features are planned."

---

### Slide 4: Innovative Genealogy Features (1 min)
"ChronicleTree’s relationship engine supports over 20 relationship types, with temporal validation to prevent impossible connections. Gender-specific terms are generated automatically. The interactive tree lets you drag, zoom, and pan, with dynamic centering and a MiniMap for large families. Profiles include timelines, custom facts, media galleries, and personal notes. Social sharing is built-in: users can generate shareable images for profiles or trees, with privacy and security controls."

---

### Slide 5: Live Demo: ChronicleTree in Action (1 min)
"Let’s walk through the app. First, secure JWT login. Then, add family members and define relationships—watch the tree update instantly. The tree view is fully interactive, with smooth navigation and keyboard accessibility. Try to add an impossible relationship, and the system blocks it with a clear message. Explore a profile: see timeline events, add media, and manage custom facts. Finally, share a tree or profile image—ready for social media or private links. Everything works seamlessly on desktop and mobile."

---

### Slide 6: Project Achievements & Excellence (1 min)
"ChronicleTree exceeds all six core requirements. We have 100+ test files for comprehensive coverage, a production-ready architecture with CI/CD, and full accessibility support. The hybrid job system—Sidekiq/Redis in development, Solid Queue in production—shows real DevOps thinking. Our relationship engine, temporal validation, and ReactFlow integration are all built to industry standards."

---

### Slide 7: Future Development Roadmap (1 min)
"Looking ahead, we’re building advanced search—global tree search, relationship path finding, and smart suggestions. Next is collaboration: real-time editing, fact verification, and discussion threads. Finally, AI-powered relationship hints, GEDCOM import/export, and historical records integration. ChronicleTree will evolve into a full PWA with offline support and installability. Thank you for your attention—I'm happy to answer any questions about the technology, the challenges, or the future of ChronicleTree!"

---


## Typical Student Presentation Q&A Preparation

### Q1: "How does ChronicleTree prevent impossible or illogical family relationships?"
**Answer:** "ChronicleTree uses a multi-layered validation system. The backend (Rails) enforces strict rules for birth, death, and relationship dates, including minimum marriage age, plausible parent-child age gaps, and timeline consistency. The frontend (React) provides instant feedback using react-hook-form, so users can't even submit impossible data. This prevents errors like children born after a parent's death or marriages after someone has died."

### Q2: "How does the app support complex family structures, like step-families and ex-spouses?"
**Answer:** "The relationship engine supports over 20 types, including step-parents, step-siblings, ex-spouses, and in-laws. Step-relationships are calculated dynamically based on marriage connections, and ex-spouses are tracked with date ranges and status flags. The system uses a bidirectional model, so relationships are always consistent no matter which person is the root."

### Q3: "What are the main security and privacy features?"
**Answer:** "ChronicleTree uses JWT (JSON Web Token) authentication for secure, stateless sessions. All data is user-scoped—users can only access their own trees. Rate limiting, audit logging (with Paper Trail), and input validation protect against abuse and data leaks. File uploads are scanned and access-controlled. Public sharing is opt-in, with privacy settings and time-limited links."

### Q4: "How do you ensure performance and scalability, especially for large trees?"
**Answer:** "Performance is achieved through database indexing, optimized queries, and ReactFlow's viewport rendering. The backend uses eager loading to avoid N+1 queries, and the frontend uses memoization and virtualization for fast rendering. The hybrid job system (Sidekiq/Redis in dev, Solid Queue in prod) ensures background tasks don't block the UI. The app has been tested with trees of 100+ (people) and remains responsive."

### Q5: "How does ChronicleTree handle cultural diversity in names and facts?"
**Answer:** "Profiles support custom facts, so users can define any naming convention—family name, given name, maternal surname, etc. The system doesn't force Western patterns. Search and display adapt to user-defined fact types, supporting dual surnames, name order, and more. This makes the app flexible for global users."

### Q6: "What is your testing strategy?"
**Answer:** "We have over 100 test files covering backend (Rails) and frontend (React). There are unit tests for relationship logic, integration tests for API endpoints, and system tests for user flows. Frontend uses Vitest and React Testing Library. CI/CD runs all tests on every pull request."

### Q7: "What was the hardest technical challenge, and how did you solve it?"
**Answer:** "The most challenging part was the relationship calculation engine—finding the correct relationship path between any two people, including step and ex-relations, while enforcing all business rules. We used a breadth-first search algorithm with cycle detection and caching for performance. Extensive tests and real-world scenarios helped refine the logic."

### Q8: "How does the public sharing and image generation work?"
**Answer:** "When a user shares a profile or tree, the backend generates a high-quality image using VIPS. Public share pages are SEO-optimized, mobile-friendly, and provide direct download links. Social media previews use OpenGraph and Twitter Card meta tags for perfect display. Sharing is always under user control, with privacy options."

### Q9: "What would you improve or add next?"
**Answer:** "Next steps are advanced search (relationship path finder, temporal queries), real-time collaboration, and AI-powered relationship suggestions. We also plan to add analytics for shared trees and more export options. The foundation is ready for these features."

---

## Presentation Delivery Notes

- Slides 1-2: ~2 minutes total (engaging problem/solution setup)
- Slide 3: ~1 minute (technical architecture with real-world context)
- Slide 4: ~1 minute (feature innovation with specific examples)
- Slide 5: ~1 minute (live demo with backup screenshots)
- Slide 6: ~1 minute (achievement summary with metrics)
- Slide 7: ~1 minute (future vision with technical foundation)
- Q&A: as needed

**Key Delivery Tips:**
- Listen carefully to each question before responding
- Reference specific technical details from your actual implementation
- Connect answers back to the project's core innovations
- Be honest about challenges and trade-offs
- Show enthusiasm for the technical problem-solving
- Keep answers concise but technically substantive
- Have follow-up examples ready if needed

**Visual Integration Tips:**
- Point to diagrams while explaining technical concepts
- Use architecture diagrams during Slide 3 discussion
- Show relationship type diagrams during Slide 4 features
- Reference UI mockups during demo backup
- Have deployment pipeline diagram ready for hybrid approach questions
