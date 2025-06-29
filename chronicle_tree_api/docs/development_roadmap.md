# Backend Development Roadmap

This document outlines the development plan for the ChronicleTree Rails API, focusing on building out features, ensuring stability through testing, and finalizing the database structure.

## 1. API Endpoint Expansion

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

## 2. Database Schema

-   Review and finalize migrations for `Person`, `Relationship`, `Fact`, and `Media` models.
-   Ensure all associations are correctly defined.
-   Add necessary database indexes and foreign key constraints for performance and data integrity.
-   Populate `db/seeds.rb` with comprehensive sample data for development.

## 3. Service Objects

Encapsulate complex business logic into service objects to keep controllers and models lean.

-   **`People::TreeBuilder`**: This service is responsible for generating the node and edge data required for the frontend to render a family tree, centered on a specific person. It gathers the person, their parents, spouses, siblings, and children.
-   Future services may be created for tasks like media processing or data import/export.

## 4. Testing Strategy (RSpec)

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

## 5. CI/CD & Quality

-   Configure GitHub Actions to run `bundle exec rspec` on every pull request.
-   Integrate static analysis tools like RuboCop and Brakeman into the CI pipeline.
