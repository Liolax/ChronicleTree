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

...existing code...
