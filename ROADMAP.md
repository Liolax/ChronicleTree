# ChronicleTree Development Roadmap

This document outlines the development plan for the ChronicleTree full-stack application, covering both the Rails API backend and the React client frontend.

---

# MiniMap Viewport Rectangle Improvements (June 2025)

- Refined the MiniMap viewport rectangle logic for the Family Tree page to ensure a visually clear, responsive, and user-friendly experience.
- The viewport rectangle now:
  - Always stays fully inside the MiniMap, even at extreme zoom/pan levels or when the visible area is larger than the node area.
  - Uses true proportional mapping for position and size, ensuring accuracy at all zoom and pan levels (no artificial scaling).
  - Moves smoothly and responsively, following the mouse or touch cursor as closely as possible during drag operations.
  - Supports both mouse and touch (mobile/tablet) interactions.
  - Uses requestAnimationFrame for smooth dragging and a CSS transition for smooth animation when not dragging.
  - Stores the pointer offset inside the rectangle on drag start, so the rectangle follows the cursor/finger precisely.
- All changes are isolated to the MiniMap rectangle logic; no unrelated UI or logic was changed.

These improvements make the MiniMap a robust and intuitive navigation tool for all users, regardless of device or zoom level.

---

## Recent Updates

### [2025-06-30] Comprehensive Seed Data & First Person Logic
- `db/seeds.rb` now creates a fully connected, multi-generational family tree with all relationship types (parent, child, spouse, sibling, cousin, grandparent, etc.) for robust frontend and backend testing.
- Frontend and backend logic updated to allow creation of the first/root person without requiring a relationship type.
- Add Person modal now hides the relationship type field when adding the first person.
- All React Flow edge types are registered and visually distinct.
- Tree layout and zoom are dynamic and logical for any tree size.

### [2025-06-29] PersonForm & TreeView Fixes
- PersonForm now matches mockup: death date only enabled if "Deceased" is checked, relationship selection is present, and all register usages are correct.
- TreeView always shows people if any exist (uses first person as root if needed).
- Improved UX and reliability for adding people and visualizing the tree.

### [2025-06-29] Profile Page Refactor
- Profile page now displays the selected person from the tree, not the logged-in user.
- Route `/profile/:id` fetches and shows all profile data (details, timeline, media, facts, relationships) for the chosen person.
- Tabs and layout improved for extensibility and clarity.
- UI/UX structure matches mock-ups and is ready for further CRUD enhancements.

### [2025-06-29] CRUD Modal Unification & PersonCard Improvements
- All delete confirmations now use a single, reusable `ConfirmDeleteModal` component (no more `DeletePersonModal`).
- PersonCard UI/UX improved for consistency with mock-ups: clear action buttons, better layout, and modal flows.
- Added several sample people and relationships to the test user in `db/seeds.rb` for development and demo purposes.

### [2025-06-30] Robust Tree Visualization, Unified Modals, and Relationship Management
- Upgraded the React family tree to use a visually distinct, accessible, and interactive tree layout with clear node/edge types and a wider canvas.
- Unified all CRUD modals (`AddPersonModal`, `EditPersonModal`, `ConfirmDeleteModal`) for accessibility, single-modal logic, and consistent UI/UX.
- Ensured only one modal can be open at a time by centralizing modal state logic in `TreeStateContext.jsx`.
- Improved `PersonForm.jsx` to use `react-hook-form` with robust validation, accessibility, and enforced relationship selection with clear guidance.
- Added a persistent, accessible "+ Add Person" button with icon and text.
- Person card is now smaller, positioned near the node, and auto-closes on edit/delete; edit/delete handlers open the correct modals.
- Added a single toggle for node interactivity ("Move Nodes"); node movement is only possible when enabled.
- Moved `nodeTypes` and `edgeTypes` outside the `Tree` component to resolve React Flow warnings.
- Removed all debug logs and duplicate modal/toggle rendering from the codebase.
- Backend `/tree` and `/full_tree` endpoints and serializers updated for correct data structure and field mapping.

### [2025-06-30] Profile Page CRUD & Navigation Enhancements
- Profile page now uses modular components and matches the latest mock-up for layout, style, and UX.
- Added sticky header with share button and improved section cards for details, facts, timeline, media, and relationships.
- All modals (edit picture, add fact, add timeline, add media, share) are present and styled.
- Data fields and layout are mapped to backend and mock-up requirements.
- Navigation: Profile page links to relatives' profiles and tree/settings via `<Link>` components for seamless SPA navigation.
- Next steps: Implement full CRUD for facts, timeline, media, and relationships directly from the profile page, with optimistic updates and error handling.

---

## July 2025: Profile, Tree, and Data Model Upgrades

### [2025-07-01] Unified Notes, Age/Date Display, and Deceased Status
- Refactored backend to support a single note per person (not per profile); updated models, migrations, serializers, and API endpoints accordingly.
- Improved and expanded seed data: all people have explicit IDs, gender, date_of_birth, and realistic values; Jane Doe is now marked as deceased for UI testing.
- Frontend now displays all profile data (facts, timeline, media, relationships, notes) and is fully aligned with backend API keys.
- "Age" is now only shown under the avatar in the profile and at tree nodes as "{age} y.o."; it is removed from the "Basic Information" section and person cards.
- Tree node status badge now displays "Deceased (YEAR)" if the person is deceased, with the year of death; no birth year is shown at the node.
- Person cards show full date of birth and, if deceased, date of death.
- All changes tested and confirmed in both backend and frontend.

---

## Backend Development (Rails API)

This section outlines the development plan for the ChronicleTree Rails API, focusing on building out features, ensuring stability through testing, and finalizing the database structure.

### 1. API Endpoint Expansion

The current API supports authentication. The next step is to build CRUD endpoints for core application resources.

-   **`PeopleController` (`/api/v1/people`)**:
    -   Implement `index`, `show`, `create`, `update`, `destroy` actions.
    -   Add a member route `GET /api/v1/people/:id/tree` to return family tree data for a specific person, powered by a `People::TreeBuilder` service.
-   **Nested Resources**:
    -   **Facts**: `POST /api/v1/people/:person_id/facts` and `GET /api/v1/people/:person_id/facts`.
    -   **Media**: `POST /api/v1/people/:person_id/media` (for uploads via ActiveStorage).
    -   Top-level routes for updates/deletes: `PUT/PATCH /api/v1/facts/:id`, `DELETE /api/v1/media/:id`.
-   **`RelationshipsController`**:
    -   Implement `create` and `destroy` to manage relationships between people.
-   **Authorization**:
    -   Ensure all new endpoints are protected with `before_action :authenticate_user!`.
    -   Implement ownership checks (e.g., using Pundit or custom logic) to ensure users can only modify their own data.

### 2. Database Schema

-   Review and finalize migrations for `Person`, `Relationship`, `Fact`, and `Media` models.
-   Ensure all associations are correctly defined.
-   Add necessary database indexes and foreign key constraints for performance and data integrity.
-   Populate `db/seeds.rb` with comprehensive sample data for development.

### 3. Service Objects

Encapsulate complex business logic into service objects to keep controllers and models lean.

-   **`People::TreeBuilder`**: This service is responsible for generating the node and edge data required for the frontend to render a family tree, centered on a specific person. It gathers the person, their parents, spouses, siblings, and children.
-   Future services may be created for tasks like media processing or data import/export.

### 4. Testing Strategy (RSpec)

A robust test suite is critical for API stability.

-   **Request Specs**: Write integration tests for every API endpoint. Cover:
    -   "Happy path" (successful requests with valid data).
    -   Authentication errors (401 Unauthorized).
    -   Authorization errors (403 Forbidden).
    -   Not found errors (404 Not Found).
    -   Validation errors (422 Unprocessable Entity).
-   **Model/Unit Tests**:
    -   Test all model validations (e.g., a person cannot be their own parent).
    -   Test service objects like `People::TreeBuilder` to ensure correct JSON output.
-   **Factories (FactoryBot)**:
    -   Use FactoryBot to create test data, replacing or supplementing simple fixtures.

### 5. CI/CD & Quality

-   Configure GitHub Actions to run `bundle exec rspec` on every pull request.
-   Integrate static analysis tools like RuboCop and Brakeman into the CI pipeline.

---

## Frontend Development (React Client)

This section outlines the plan for building the ChronicleTree React client, from converting static mockups to creating a dynamic, data-driven single-page application (SPA).

### 1. Convert HTML Mockups to React Components

The primary goal is to translate the static HTML mockups into a reusable and stateful component architecture.

-   **Component Breakdown**:
    -   **Pages**: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ProfilePage`, `SettingsPage`, `TreeViewPage`.
    -   **Layout**: `NavBar`, `PageHeader`.
    -   **Feature Components**: `ProfileHeader`, `FactList`, `Timeline`, `MediaGallery`, `RelationshipManager`.
-   **Styling**: Continue using Tailwind CSS as established in the mockups.
-   **State Management**: Use React hooks (`useState`, `useEffect`, `useContext`) for managing component state.
-   **Routing**: Implement client-side routing using `react-router-dom` to create a seamless SPA experience. Replace all `<a>` tags with `<Link>` components for internal navigation.

### 2. API Integration & State Management

Connect the React components to the Rails backend to handle live data.

-   **API Client**: Use `axios` for making HTTP requests. Create a centralized API client instance that can be configured with the base URL and authentication headers.
-   **Authentication Flow**:
    -   On login/registration, store the received JWT in `localStorage`.
    -   Attach the JWT as a `Bearer` token in the `Authorization` header for all authenticated API requests.
    -   Implement an auto-logout mechanism that clears the token and redirects to the login page upon receiving a `401 Unauthorized` response.
-   **Data Fetching**: Use `@tanstack/react-query` for server state management, including caching, refetching, and optimistic updates.
-   **Authentication**: Implement context-based authentication using `AuthContext` to manage JWTs and user state.

### 3. Tree Visualization with reactflow (React Flow)

Implement the interactive family tree view.

-   **Library**: Use `reactflow` to render the tree structure from the `GET /api/v1/people/:id/tree` endpoint data (nodes and edges).
-   **State Management**: Use a dedicated `TreeStateContext` to manage UI state related to the tree, such as the currently selected node and the visibility of detail cards. This decouples the tree view from the components that display node information.
-   **Data Fetching**: Use the `useTree` hook with `@tanstack/react-query` to fetch node and edge data from the `/api/v1/people/:id/tree` endpoint.
-   **Layouting**: Use the `dagre` library to automatically calculate and apply a hierarchical layout to the nodes and edges, ensuring a clean and readable tree structure.
-   **Custom Nodes**: Develop a `CustomNode` component to display person details (name, photo, dates) as shown in the mockups.
-   **Interaction**:
    -   Implement pan and zoom functionality using React Flow's built-in controls.
    -   Display a modal `PersonCard` component on node click, managed via `TreeStateContext`.
    -   Implement smooth viewport transitions to center the view on a selected node.

### 4. Forms and User Input

Build robust forms for creating and editing data.

-   **Form Library**: Use a library like `React Hook Form` with `Yup` for validation to handle form state, submission, and client-side validation efficiently.
-   **Forms to Implement**:
    -   `PersonForm` (add/edit person)
    -   `FactForm` (add/edit fact)
    -   `MediaUploadForm`
    -   `RelationshipForm`

### 5. Testing Strategy

Ensure the frontend is reliable and bug-free.

-   **Unit/Component Tests**: Use `Vitest` and `React Testing Library` to write tests for individual components, especially forms and components with complex logic.
-   **Integration Tests**: Create integration tests for key user flows, such as login, profile updates, and adding a family member.
-   **CI/CD**: Configure GitHub Actions to run `npm test` and `npm run lint` on every pull request`.
