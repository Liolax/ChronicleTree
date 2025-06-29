# ChronicleTree

A full-stack family-tree web app  
– **Backend**: Ruby on Rails 8.0 API with Devise-JWT authentication  
– **Frontend**: React 19 (Vite + TailwindCSS) SPA

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Getting Started](#getting-started)  
3. [Configuration](#configuration)  
4. [Database Setup](#database-setup)  
5. [Running the App](#running-the-app)  
6. [Authentication Flow](#authentication-flow)  
7. [API Endpoints](#api-endpoints)  
8. [Testing](#testing)  
9. [Contributing](#contributing)  
10. [License](#license)

---

## Prerequisites

- Ruby 3.3.0 + Bundler  
- Node.js ≥18 & npm (or Yarn)  
- PostgreSQL (or your chosen DB)  
- Git

## Getting Started

```bash
# Clone the monorepo
git clone https://github.com/Liolax/ChronicleTree.git
cd ChronicleTree

# Install backend gems
cd chronicle_tree_api
bundle install

# Install frontend deps (in another terminal)
cd ../chronicle_tree_client
npm install
```

## Running the App

1.  **Start the Rails server** (from `chronicle_tree_api`):
    ```bash
    bin/rails s
    ```
    The API will be available at `http://localhost:3000`.

2.  **Start the React dev server** (from `chronicle_tree_client`):
    ```bash
    npm run dev
    ```
    The client will be available at `http://localhost:5173`.

**Default credentials for development:**  
– **Email**: `test@example.com`  
– **Password**: `Password123!`

## Authentication Flow

The app uses `devise-jwt` for token-based authentication.

1.  **Register**: `POST /api/v1/auth`
2.  **Login**: `POST /api/v1/auth/sign_in`
3.  **Logout**: `DELETE /api/v1/auth/sign_out`

On successful login/registration, the API returns a JWT in the `Authorization` header. The client stores this token (e.g., in `localStorage`) and includes it in the header for all subsequent authenticated requests.

## API Endpoints

All endpoints are prefixed with `/api/v1`. For a more detailed breakdown, see the [API Endpoints Overview](./chronicle_tree_api/docs/api_endpoints_overview.md).

| Method   | Path                                  | Purpose                                      |
| :------- | :------------------------------------ | :------------------------------------------- |
| `POST`   | `/auth`                               | Register a new user.                         |
| `POST`   | `/auth/sign_in`                       | Log in and receive a JWT.                    |
| `DELETE` | `/auth/sign_out`                      | Log out and revoke the current JWT.          |
| `GET`    | `/users/me`                           | Get the current user's profile.              |
| `PATCH`  | `/users/password`                     | Change the current user's password.          |
| `GET`    | `/people`                             | List all people for the current user.        |
| `POST`   | `/people`                             | Create a new person.                         |
| `GET`    | `/people/:id`                         | Get details for a specific person.           |
| `PATCH`  | `/people/:id`                         | Update a person's details.                   |
| `DELETE` | `/people/:id`                         | Delete a person.                             |
| `GET`    | `/people/:id/tree`                    | Get family tree data for a person.           |
| `POST`   | `/relationships`                      | Create a relationship between two people.    |
| `DELETE` | `/relationships/:id`                  | Delete a relationship.                       |
| `POST`   | `/people/:person_id/facts`            | Create a new fact for a person.              |
| `POST`   | `/people/:person_id/media`            | Upload a new media file for a person.        |
| `POST`   | `/people/:person_id/timeline_items`   | Create a new timeline item.                  |

## Documentation

For more detailed technical documentation, please see the following files:

-   **Backend**:
    -   [API Endpoints Overview](./chronicle_tree_api/docs/api_endpoints_overview.md)
    -   [Development Roadmap](./chronicle_tree_api/docs/development_roadmap.md)
    -   [Devise & JWT Setup](./chronicle_tree_api/docs/devise_setup.md)
-   **Frontend**:
    -   [Development Roadmap](./chronicle_tree_client/docs/development_roadmap.md)

## Next Steps & Roadmap

The project has a solid foundation with working authentication. The next phase involves building out the core features of the application. Detailed development roadmaps are available for both the backend and frontend:

-   **Backend Roadmap**: See [`chronicle_tree_api/docs/development_roadmap.md`](./chronicle_tree_api/docs/development_roadmap.md) for the plan to build API endpoints, tests, and database models.
-   **Frontend Roadmap**: See [`chronicle_tree_client/docs/development_roadmap.md`](./chronicle_tree_client/docs/development_roadmap.md) for the plan to convert mockups into React components and integrate with the API.

---

# Chronicle Tree - Client

This directory contains the React frontend for the Chronicle Tree application, built with Vite.

## Available Scripts

In this directory, you can run:

### `npm install`

Installs the required dependencies for the project.

### `npm run dev`

Runs the app in development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`

Lints the project files for code quality and style issues.

