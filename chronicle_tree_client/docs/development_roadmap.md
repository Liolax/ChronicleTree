
# Frontend Development Roadmap

This document reflects the current state and plan for the ChronicleTree React client, including the actual component structure, API integration, and testing strategy as implemented.


## 1. Component Architecture

The ChronicleTree React client is organized by feature, with generic, reusable components in centralized directories. The actual structure includes:

- **pages/**: Top-level page views (e.g., `TreeView.jsx`, `Profile.jsx`, `Settings.jsx`).
- **components/**: All reusable components, organized into:
  - **UI/**: Generic, application-agnostic components (`Button`, `Card`, `Input`, `Modal`, etc.)
  - **Layout/**: Page structure components (`NavBar`, `PageHeader`, `Tabs`)
  - **Forms/**: Reusable form components (`PersonForm`, `RelationshipForm`, `FactForm`, etc.)
  - **Tree/**: Family tree visualization (`Tree`, `CustomNode`, `AddPersonModal`, `PersonCard`, etc.)
  - **Profile/**: Profile page components (`ProfileHeader`, `ProfileDetails`, `FactList`, `MediaGallery`, etc.)
  - **Settings/**: User settings components (`ProfileSettings`, `PasswordSettings`)
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
- **Layout:** Hierarchical layout is calculated with `dagre` and custom logic in `familyTreeHierarchicalLayout.js`.
- **Custom Nodes:** `CustomNode` displays person details and handles edit/delete modals.
- **Interaction:**
  - Pan/zoom with React Flow controls
  - Add/edit/delete people and relationships via modals managed by context/local state
  - MiniMap viewport rectangle for navigation
  - MiniMap node color reflects gender: blue (male), pink (female), grey (other)
  - MiniMap is always visible for quick navigation and context


## 4. Forms and User Input

- **Form Library:** Uses `react-hook-form` for form state, validation, and submission.
- **Centralized Forms:** All forms (`PersonForm`, `RelationshipForm`, `FactForm`, etc.) are reusable and located in `components/Forms`.
- **Validation:** Includes robust validation for age, blood relationship, timeline, and logical constraints, with user-friendly error messages.


## 5. Testing Strategy

- **Unit/Component Tests:** All major components and forms are covered by `Vitest` and `React Testing Library`.
- **Integration Tests:** Key user flows (login, profile updates, adding family members) are tested.
- **CI/CD:** GitHub Actions runs all tests and linting on every pull request.

---

This roadmap reflects the current, implemented state of the ChronicleTree React client as of July 2025. All features, including MiniMap color logic and modal behaviors, are up to date with the latest implementation.
