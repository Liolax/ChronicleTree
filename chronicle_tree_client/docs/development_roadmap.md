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
-   **Data Fetching**: Use `@tanstack/react-query` to fetch data from the Rails API. Create custom hooks for each resource (e.g., `useCurrentUser`, `useTree`).
-   **Authentication Context**: Use a React context (`AuthContext`) to manage the user's authentication state and JWT token globally.

## 3. Tree Visualization with React Flow

Implement the interactive family tree view.

-   **Library**: Use a library like `D3.js`, `React Flow`, or `Konva.js` to render the tree structure from the `GET /api/v1/people/:id/tree` endpoint data (nodes and edges).
-   **Data Fetching**: Use the `useTree` hook to fetch node and edge data from the `/api/v1/people/:id/tree` endpoint.
-   **Data Transformation**: Create a utility function to transform the API response into a format compatible with React Flow (nodes with `id`, `position`, `data`; edges with `id`, `source`, `target`).
-   **Rendering**: Implement the `Tree.jsx` component to render the React Flow canvas, passing the transformed nodes and edges.
-   **Custom Nodes**: Develop a `CustomNode.jsx` component to display person data in a styled card, matching the mockups.
-   **Layout**: Implement a basic auto-layouting algorithm to position nodes hierarchically on the canvas.
-   **Interaction**:
    -   Implement pan and zoom functionality.
    -   Implement the "Dynamic Centering" feature: clicking a node smoothly animates the view to center on that node.
    -   Display a `PersonCard` component on node click/hover with summary details and action buttons.

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
