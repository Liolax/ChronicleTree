# ChronicleTree Development Roadmap

This document outlines the current state, recent progress, and future plans for the ChronicleTree full-stack application, including both the Rails API backend and the React client frontend.

---

## MiniMap Viewport Rectangle Improvements

- Refined the MiniMap viewport rectangle logic for the Family Tree page to ensure a visually clear, responsive, and user-friendly experience.
- The viewport rectangle now:
  - Always stays fully inside the MiniMap, even at extreme zoom/pan levels or when the visible area is larger than the node area.
  - Uses true proportional mapping for position and size, ensuring accuracy at all zoom and pan levels (no artificial scaling).
  - Moves smoothly and responsively, following the mouse or touch cursor as closely as possible during drag operations.
  - Supports both mouse and touch (mobile/tablet) interactions.
  - Uses requestAnimationFrame for smooth dragging and a CSS transition for smooth animation when not dragging.
  - Stores the pointer offset inside the rectangle on drag start, so the rectangle follows the cursor/finger precisely.
- All changes are isolated to the MiniMap rectangle logic; no unrelated UI or logic was changed.

**Next Steps:**
- Further refine the MiniMap viewport rectangle for even better accessibility, visual clarity, and usability. Consider adding keyboard navigation, improved focus states, and more granular touch support. Gather user feedback to guide future improvements.

These improvements make the MiniMap a robust and intuitive navigation tool for all users, regardless of device or zoom level.

---

## Recent Updates

### [2025-07-01] Unified Notes, Profile Data, and Tree Node Display
- **Single Note per Person:** The backend now enforces a single, unique note per person (not per profile), with a dedicated model, migration, serializer, and API endpoints. This simplifies note management and aligns with real-world use.
- **Seed Data Overhaul:** All seed people have explicit IDs, gender, date_of_birth, and realistic values. Jane Doe is now marked as deceased (with a date of death) to enable robust UI testing of deceased status and date logic. Seeds include rich facts, timeline items, media, and relationships for comprehensive development/testing.
- **Profile Data Alignment:** The frontend now displays all profile data—facts, timeline, media, relationships, and notes—using keys and structures that match the backend API. All data is reliably shown in the UI, with no missing fields.
- **Age & Date Display Logic:**
  - "Age" is only shown under the avatar in the profile and at tree nodes as "{age} y.o.". It is removed from the "Basic Information" section and person cards to avoid redundancy.
  - Tree node status badge now displays "Deceased (YEAR)" if the person is deceased, with the year of death. No birth year is shown at the node for clarity.
  - Person cards show full date of birth and, if deceased, date of death, for accurate historical context.
- **UI/UX Consistency:** All changes are reflected in both backend and frontend, with careful attention to matching mockups and user expectations. The profile and tree are visually and functionally aligned.
- **Testing & Validation:** All changes have been tested and confirmed in both backend and frontend. The system is ready for further feature development and user feedback.

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

### [2025-07-03] Profile Picture Upload & Avatar API Integration
- Profile page now supports uploading and removing a profile picture (avatar) for each person.
- Edit Profile Picture modal provides clear info on accepted file types (JPG, PNG, GIF) and max size (2MB), with client-side validation.
- Avatar upload/removal is fully integrated with the backend API and Active Storage.
- Backend API and serializer updated to expose the profile and its ID for reliable avatar actions from the frontend.
- All error states (invalid file, missing profile, upload failure) are handled gracefully in the UI.
- Seeds and schema confirmed: every person has a profile, and avatars are purged in seeds for clean test data.
- This completes the modern, mockup-aligned profile page with robust media and avatar support.

### [2025-07-03] Media Title Support & Gallery Improvements
- Added `title` column to the `media` table via migration; all media records now support a user-friendly title.
- Updated backend API to permit and save `title` for media uploads and edits (`media_params`).
- Updated seeds to include a `title` for each media record, ensuring clean test data and a better demo experience.
- Updated `MediumSerializer` to include `title` in API responses.
- Updated frontend media gallery to display only the media `title` (never the raw filename), with a fallback label if missing.
- Users can now set and edit a media title via the UI and API, improving clarity and usability in the profile gallery.

### [2025-07-03] Profile Navigation Streamlined
- Removed "Profile" from the main navigation bar (desktop and mobile) in the React client.
- Profile pages are now only accessible by clicking a person node or person card in the tree view, matching the intended user flow and mockups.
- This change reduces navigation clutter and ensures users always access profiles in the context of the family tree.

---

## Profile Picture (Avatar) Data Flow Diagram

```mermaid
graph TD
  direction LR
  A[User clicks Edit Profile Picture] --> B[Modal opens: shows file type/size info]
  B --> C[User selects image file]
  C --> D{Client-side validation}
  D -- Valid --> E[PATCH /api/v1/profiles/:profile_id with avatar]
  D -- Invalid --> F[Show error message]
  E --> G[Backend: ProfileController updates avatar]
  G --> H[Active Storage attaches file]
  H --> I[PersonSerializer returns avatar_url and profile.id]
  I --> J[Frontend reloads, shows new avatar]
  C --> K[User clicks Remove Current Picture]
  K --> L[PATCH /api/v1/profiles/:profile_id with avatar: null]
  L --> M[Backend purges avatar]
  M --> I
```

- All error states (invalid file, upload failure, missing profile) are handled in the UI.
- Data always flows through the profile association, ensuring every person has a profile and avatar actions are reliable.

---

## Backend Development (Rails API)

This section outlines the current and planned development for the ChronicleTree Rails API, focusing on features, stability, and robust data.

### 1. API Endpoint Expansion

- All core resources (people, facts, timeline items, media, relationships, notes) have full CRUD endpoints.
- `/api/v1/people/:id/tree` and `/api/v1/people/:id/full_tree` return all data needed for tree visualization and profile display.
- All endpoints are protected with authentication and ownership checks.
- Nested and top-level routes for facts, media, and relationships are implemented.

### 2. Database Schema

- Migrations finalized for all models: Person, Relationship, Fact, TimelineItem, Media, Note, Profile.
- All associations, indexes, and foreign key constraints are in place for integrity and performance.
- `db/seeds.rb` provides comprehensive, realistic sample data for development and UI testing, including deceased people and all relationship types.

### 3. Service Objects

- `People::TreeBuilder` generates node/edge data for the frontend tree, including all relatives.
- Additional services may be added for media processing, data import/export, or advanced queries.

### 4. Testing Strategy (RSpec)

- Request specs cover all API endpoints, including authentication, authorization, and validation errors.
- Model/unit tests validate all business logic and associations.
- FactoryBot is used for robust test data.
- CI runs all tests and static analysis (RuboCop, Brakeman) on every pull request.

---

## Frontend Development (React Client)

This section outlines the current and planned development for the ChronicleTree React client.

### 1. Component Architecture & Styling

- All static HTML mockups have been converted to modular, reusable React components.
- Tailwind CSS is used for all styling.
- State is managed with React hooks and context; routing uses `react-router-dom`.

### 2. API Integration & State Management

- Axios is used for all API requests, with JWT authentication and auto-logout on 401.
- `@tanstack/react-query` manages server state, caching, and optimistic updates.
- All profile and tree data is fetched live from the backend and kept in sync.

### 3. Tree Visualization with React Flow

- The family tree is rendered with `reactflow`, using data from `/api/v1/people/:id/tree`.
- `TreeStateContext` manages UI state for the tree, including selected node and modal/card visibility.
- Nodes use a custom `CustomNode` component showing name, avatar, gender, age, and deceased status (with year if applicable).
- Person cards show full birth/death dates and all profile data.
- Pan/zoom, smooth centering, and a robust MiniMap are implemented.
- The MiniMap viewport rectangle is fully responsive and accessible, supporting both mouse and touch interactions, and always stays within bounds.

### 4. Forms and User Input

- All forms (person, fact, timeline, media, relationship) use `React Hook Form` and `Yup` for validation.
- Modals are unified and accessible; only one can be open at a time.
- All form flows match the latest mockups, including conditional fields (e.g., death date only if "Deceased" is checked).

### 5. Testing & CI

- All major components and flows are covered by unit and integration tests using Vitest and React Testing Library.
- CI runs all tests and linting on every pull request.
- Static analysis and accessibility checks are part of the CI pipeline.

---

## Future Plans & Next Steps

- Add advanced search and filtering for people and relationships.
- Implement export/import of tree data (e.g., GEDCOM support).
- Add user settings, notifications, and multi-user collaboration features.
- Continue to expand test coverage and improve accessibility.
- Gather user feedback for further UI/UX improvements.
- Explore AI-powered features for relationship suggestions and data enrichment.
- Expand documentation and onboarding guides for new users and contributors.
