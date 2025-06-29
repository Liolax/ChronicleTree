# Frontend Development Roadmap

This document outlines the plan for building the ChronicleTree React client, from converting static mockups to creating a dynamic, data-driven single-page application (SPA).

## 1. Convert HTML Mockups to React Components

The primary goal is to translate the static HTML mockups into a reusable and stateful component architecture.

-   **Component Breakdown**:
    -   **Pages**: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ProfilePage`, `SettingsPage`, `TreeViewPage`.
    -   **Layout**: `NavBar`, `PageHeader`.
    -   **Feature Components**: `ProfileHeader`, `FactList`, `Timeline`, `MediaGallery`, `RelationshipManager`.
-   **Styling**: Continue using Tailwind CSS as established in the mockups.
-   **State Management**: Use React hooks (`useState`, `useEffect`, `useContext`) for managing component state.
-   **Routing**: Implement client-side routing using `react-router-dom` to create a seamless SPA experience. Replace all `<a>` tags with `<Link>` components for internal navigation.

## 2. API Integration & State Management

Connect the React components to the Rails backend to handle live data.

-   **API Client**: Use `axios` for making HTTP requests. Create a centralized API client instance that can be configured with the base URL and authentication headers.
-   **Authentication Flow**:
    -   On login/registration, store the received JWT in `localStorage`.
    -   Attach the JWT as a `Bearer` token in the `Authorization` header for all authenticated API requests.
    -   Implement an auto-logout mechanism that clears the token and redirects to the login page upon receiving a `401 Unauthorized` response.
-   **Data Fetching**: Use `@tanstack/react-query` for server state management, including caching, refetching, and optimistic updates.
-   **Authentication**: Implement context-based authentication using `AuthContext` to manage JWTs and user state.

## 3. Tree Visualization with @xyflow/react (React Flow)

Implement the interactive family tree view.

-   **Library**: Use `@xyflow/react` to render the tree structure from the `GET /api/v1/people/:id/tree` endpoint data (nodes and edges).
-   **State Management**: Use a dedicated `TreeStateContext` to manage UI state related to the tree, such as the currently selected node and the visibility of detail cards. This decouples the tree view from the components that display node information.
-   **Data Fetching**: Use the `useTree` hook with `@tanstack/react-query` to fetch node and edge data from the `/api/v1/people/:id/tree` endpoint.
-   **Layouting**: Use the `dagre` library to automatically calculate and apply a hierarchical layout to the nodes and edges, ensuring a clean and readable tree structure.
-   **Custom Nodes**: Develop a `CustomNode` component to display person details (name, photo, dates) as shown in the mockups.
-   **Interaction**:
    -   Implement pan and zoom functionality using React Flow's built-in controls.
    -   Display a modal `PersonCard` component on node click, managed via `TreeStateContext`.
    -   Implement smooth viewport transitions to center the view on a selected node.

## 4. Forms and User Input

Build robust forms for creating and editing data.

-   **Form Library**: Use a library like `React Hook Form` with `Yup` for validation to handle form state, submission, and client-side validation efficiently.
-   **Forms to Implement**:
    -   `PersonForm` (add/edit person)
    -   `FactForm` (add/edit fact)
    -   `MediaUploadForm`
    -   `RelationshipForm`

## 5. Testing Strategy

Ensure the frontend is reliable and bug-free.

-   **Unit/Component Tests**: Use `Vitest` and `React Testing Library` to write tests for individual components, especially forms and components with complex logic.
-   **Integration Tests**: Create integration tests for key user flows, such as login, profile updates, and adding a family member.
-   **CI/CD**: Configure GitHub Actions to run `npm test` and `npm run lint` on every pull request.
