
# ChronicleTree Development Roadmap

This document reflects the current state and plan for the ChronicleTree application, including the React client, Rails API backend, and recent improvements to the sharing system.

## Recent Completed Features (August 2025)

### ✅ Public Sharing System Enhancement
- **Issue Fixed**: Improved UX for shared profile/tree links - visitors no longer forced to login
- **Image Generation**: Automatic high-quality image generation for profiles and family trees
- **Public Share Pages**: SEO-optimized pages with generated images and download options
- **Modern UI Design**: Beautiful Tailwind CSS styling with Inter font and responsive design
- **Social Media Integration**: Perfect preview images for Facebook, Twitter, WhatsApp, etc.
- **Direct Image Access**: Download buttons for generated images without authentication required
- **Professional Styling**: Card-based layout with shadows, rounded corners, and smooth transitions
- **Mobile-First Design**: Fully responsive layout that works perfectly on all devices
- **Flowchart Updates**: Updated technical documentation to reflect actual implementation

### ✅ Code Cleanup & Optimization
- **Removed Unused Code**: Eliminated dagreLayout, CustomNode demo components, and debug pages
- **Controller Improvements**: Enhanced `public_shares_controller.rb` with modern Tailwind CSS styling
- **HTML Structure**: Clean, semantic HTML with proper meta tags for SEO and social sharing
- **Performance**: Optimized image loading and CDN integration for fast page loads
- **Documentation**: Simplified and corrected sharing flowcharts to match real functionality


## 1. Component Architecture (Current Implementation)

The ChronicleTree React client is organized by feature, with generic, reusable components in centralized directories. The actual structure includes:

- **pages/**: Top-level page views (e.g., `TreeView.jsx`, `Profile.jsx`, `Settings.jsx`).
- **components/**: All reusable components, organized into:
  - **UI/**: Generic, application-agnostic components (`Button`, `Card`, `Input`, `Modal`, etc.)
  - **Layout/**: Page structure components (`NavBar`, `PageHeader`, `Tabs`)
  - **Forms/**: Reusable form components (`PersonForm`, `RelationshipForm`, `FactForm`, etc.)
  - **Tree/**: Family tree visualization (`Tree`, `FamilyTreeFlow`, `AddPersonModal`, `PersonCard`, etc.)
  - **Profile/**: Profile page components (`ProfileHeader`, `ProfileDetails`, `FactList`, `MediaGallery`, etc.)
  - **Settings/**: User settings components (`ProfileSettings`, `PasswordSettings`)
  - **Sharing/**: Social sharing components (`ShareModal`, integrated with backend image generation)
- **services/**: API interaction logic and React Query hooks
- **context/**: Shared state management (e.g., `AuthContext`, `TreeStateContext`)
- **utils/**: Utility functions (e.g., `familyTreeHierarchicalLayout.js`, validation helpers)

**Styling:** Tailwind CSS is used throughout for utility-first styling.
**Routing:** Client-side routing is implemented with `react-router-dom` for a seamless SPA experience.



## 2. API Integration & State Management

The React client is fully integrated with the Rails API backend and uses modern best practices for authentication and data management:

- **API Client:**
  - Uses `axios` for all HTTP requests.
  - Centralized API client is configured with the Rails API base URL and automatically attaches JWT tokens.
- **Authentication:**
  - JWT is stored in `localStorage` after login or registration.
  - All API requests include the JWT as a `Bearer` token in the `Authorization` header.
  - Auto-logout is triggered on `401 Unauthorized` responses, clearing the token and user state.
  - `AuthContext` provides authentication state, user info, and login/logout helpers to all components.
- **Data Fetching:**
  - `@tanstack/react-query` manages all server state, including caching, background refetching, and optimistic UI updates.
  - All profile, tree, and relationship data is fetched live from the backend and kept in sync with the server.
  - Query keys are organized by resource (e.g., `['person', id]`, `['tree', id]`) for efficient cache invalidation.
  - Error handling and loading states are managed at the query and mutation level for robust UX.


## 3. Tree Visualization with React Flow

- **Library:** Uses `reactflow` (xyflow) for advanced family tree visualization.
- **Data:** Tree structure is rendered from `/api/v1/people/:id/tree` endpoint (nodes and edges).
- **Layout:** Hierarchical layout is calculated with custom logic in `familyTreeHierarchicalLayout.js`.
- **Custom Nodes:** Node components display person details and handle edit/delete modals.
- **Interaction:**
  - Pan/zoom with React Flow controls
  - Add/edit/delete people and relationships via modals managed by context/local state
  - MiniMap viewport rectangle for navigation
  - MiniMap node color reflects gender: blue (male), pink (female), grey (other)
  - MiniMap is always visible for quick navigation and context

## 4. Public Sharing & Image Generation System

- **Backend Services:** 
  - `ImageGeneration::ProfileCardGenerator` - Creates high-quality profile cards
  - `ImageGeneration::TreeSnippetGenerator` - Generates family tree visualizations
  - `PublicSharesController` - Handles public share pages with modern UI and SEO optimization
- **Frontend Integration:**
  - `ShareModal` component integrated with tree and profile views
  - Social media platform selection (Facebook, Twitter, WhatsApp, email)
  - Copy link functionality with generated public URLs
- **Public Pages Design:**
  - **Modern UI**: Tailwind CSS with Inter font and professional card-based layout
  - **Responsive Design**: Mobile-first approach with flexible grid and button layouts
  - **Visual Hierarchy**: Clean typography with proper spacing and visual emphasis
  - **Interactive Elements**: Smooth hover effects and focus states for accessibility
  - **SEO Optimized**: OpenGraph and Twitter Card meta tags for perfect social previews
  - **Performance**: CDN-hosted Tailwind CSS and Google Fonts for fast loading
- **User Experience:**
  - Direct image download without authentication
  - Clear call-to-action buttons for interactive experience
  - Crawler detection for optimal social media previews
  - Mobile-responsive design with touch-friendly interface


## 5. Forms and User Input

- **Form Library:** Uses `react-hook-form` for form state, validation, and submission.
- **Centralized Forms:** All forms (`PersonForm`, `RelationshipForm`, `FactForm`, etc.) are reusable and located in `components/Forms`.
- **Validation:** Includes robust validation for age, blood relationship, timeline, and logical constraints, with user-friendly error messages.

## 6. Testing Strategy

- **Unit/Component Tests:** All major components and forms are covered by `Vitest` and `React Testing Library`.
- **Integration Tests:** Key user flows (login, profile updates, adding family members, sharing) are tested.
- **CI/CD:** GitHub Actions runs all tests and linting on every pull request.

## 7. Backend Architecture (Rails 8 API)

- **Image Processing:** VIPS library for high-performance image generation
- **Authentication:** JWT-based authentication with Devise
- **Database:** PostgreSQL with comprehensive family relationship modeling
- **File Storage:** Local storage for generated share images with expiration
- **API Design:** RESTful endpoints with proper error handling and validation
- **Public Sharing:** 
  - Modern HTML pages with Tailwind CSS framework
  - Google Fonts integration (Inter typeface) for professional typography
  - Responsive design patterns with mobile-first approach
  - Advanced meta tag optimization for social media platforms
  - Performance-optimized with CDN resources and proper caching headers

## Upcoming Features & Improvements

### 🔄 In Progress
- Performance optimization for large family trees
- Enhanced mobile responsiveness for sharing pages
- Advanced privacy controls for shared content

### 📋 Planned Features
- **Collaborative Family Trees:** Multi-user editing with permission controls
- **Timeline Views:** Interactive family history timelines
- **Photo Management:** Enhanced media upload and organization
- **Export Options:** PDF and other format exports for family trees
- **Advanced Search:** Global search across all family data
- **Analytics Dashboard:** Insights about family tree growth and sharing
- **Custom Themes:** Personalized styling options for shared pages
- **Offline Support:** Progressive Web App features for offline access

### 🔧 Technical Debt & Maintenance
- Upgrade to latest React Flow version
- Optimize image generation performance for large trees
- Implement comprehensive error boundary system
- Add comprehensive API documentation with OpenAPI spec
- Migrate from CDN Tailwind to local build process for better performance
- Implement proper asset pipeline for public share pages

---

This roadmap reflects the current, implemented state of the ChronicleTree application as of August 2025, including recent improvements to the public sharing system and image generation capabilities.
