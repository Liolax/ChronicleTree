# Frontend Development Roadmap

This document outlines the plan for building the ChronicleTree React client, from converting static mockups to creating a dynamic, data-driven single-page application (SPA).

## 1. Component Architecture

The primary goal is to translate the static HTML mockups into a reusable and stateful component architecture. The project is organized by feature, with generic, reusable components placed in centralized directories.

-   **Core Directories**:
    -   `pages/`: Top-level components that correspond to a page view (e.g., `TreeView.jsx`, `Profile.jsx`).
    -   `components/`: Contains all reusable components, organized into subdirectories.
    -   `services/`: Houses API interaction logic and React Query hooks.
    -   `context/`: Provides shared state management across the application.

-   **Component Breakdown**:
    -   **`components/UI`**: Generic, application-agnostic components (`Button`, `Card`, `Input`, `Modal`).
    -   **`components/Layout`**: Components that define the page structure (`NavBar`, `PageHeader`, `Tabs`).
    -   **`components/Forms`**: Reusable form components used for creating and editing data (`PersonForm`, `RelationshipForm`, `FactForm`).
    -   **`components/Tree`**: Components specifically for the family tree visualization (`Tree`, `CustomNode`, `AddPersonModal`).
    -   **`components/Profile`**: Components used within the user profile page (`ProfileHeader`, `ProfileDetails`, `FactList`).
    -   **`components/Settings`**: Components for the user settings page (`ProfileSettings`, `PasswordSettings`).

-   **Styling**: Continue using Tailwind CSS as established in the mockups.
-   **Routing**: Implement client-side routing using `react-router-dom` to create a seamless SPA experience.

## 2. API Integration & State Management

Connect the React components to the Rails backend to handle live data.

-   **API Client**: Use `axios` for making HTTP requests. A centralized API client is configured with the base URL and authentication headers.
-   **Authentication Flow**:
    -   On login/registration, store the received JWT in `localStorage`.
    -   Attach the JWT as a `Bearer` token in the `Authorization` header for all authenticated API requests.
    -   Implement an auto-logout mechanism upon receiving a `401 Unauthorized` response.
-   **Data Fetching**: Use `@tanstack/react-query` for server state management, including caching, refetching, and optimistic updates.
-   **Authentication**: Implement context-based authentication using `AuthContext` to manage JWTs and user state.

## 3. Tree Visualization with reactflow (React Flow)

Implement the interactive family tree view.

-   **Library**: Use `reactflow` to render the tree structure from the `GET /api/v1/people/:id/tree` endpoint data (nodes and edges).
-   **Layouting**: Use the `dagre` library to automatically calculate and apply a hierarchical layout to the nodes and edges.
-   **Custom Nodes**: A `CustomNode` component displays person details (name, photo, dates) and contains its own logic for triggering edit and delete modals, making it a self-contained and reusable unit.
-   **Interaction**:
    -   Implement pan and zoom functionality using React Flow's built-in controls.
    -   Modals for adding, editing, and deleting people and relationships are managed via context and local state.

## 4. Forms and User Input

Build robust forms for creating and editing data.

-   **Form Library**: Use `react-hook-form` for efficient form state management, submission, and validation.
-   **Centralized Forms**: Reusable forms (`PersonForm`, `RelationshipForm`, `FactForm`) are located in `src/components/Forms` and are used by modal components to perform create/update operations.

## 5. Testing Strategy

Ensure the frontend is reliable and bug-free.

-   **Unit/Component Tests**: Use `Vitest` and `React Testing Library` to write tests for individual components, especially forms and components with complex logic.
-   **Integration Tests**: Create integration tests for key user flows, such as login, profile updates, and adding a family member.
-   **CI/CD**: Configure GitHub Actions to run `npm test` and `npm run lint` on every pull request.
