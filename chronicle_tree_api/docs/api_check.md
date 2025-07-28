



# ChronicleTree API: Solo Project Health Checklist

This practical checklist helps keep the ChronicleTree Rails API healthy, organized, and easy to maintain. Use after major changes, before demos, or as a quick review before sharing or deploying the project.

---


## 1. Controllers & Authentication

- **Check:** All API controllers inherit from `ApplicationController`. Authentication (`before_action :authenticate_user!`) is set up for all protected endpoints.
- **How to verify:** Inspect `app/controllers/api/v1/` for correct inheritance and presence of `before_action` in the base controller.
- **Status:** OK. All controllers are set up for authentication.


## 2. Devise & JWT (Login System)

- **Check:** Devise (with JWT) is working for `/api/v1/auth` endpoints. JWT denylist is enabled.
- **How to verify:** Review `config/routes.rb` for Devise routes, `config/initializers/devise.rb` for JWT config, and `app/models/jwt_denylist.rb` for the denylist model.
- **Status:** OK. Devise/JWT is working as expected.


## 3. Authorization & User Data

- **Check:** All controller actions are scoped to the current user (e.g., `current_user.people`).
- **How to verify:** Review controller actions to confirm absence of global queries; all data access is user-specific.
- **Status:** OK. All data access is properly scoped.


## 4. File Organization

- **Check:** API code is organized and documentation is in the correct location.
- **How to verify:** Controllers are in `app/controllers/api/v1/`, docs in `docs/`, and Rails loads all files without errors.
- **Status:** OK. File structure is clean and organized.



## 5. Endpoints: Coverage & Consistency

- **Check:** All major resources have full CRUD endpoints:
  - People
  - Facts
  - Timeline Items
  - Media
  - Notes
  - Relationships (including step-relationships, deceased spouse, and temporal validation logic)
- **How to verify:** Compare `config/routes.rb` and controller actions to `docs/api_endpoints_overview.md` (should be up to date). Confirm that endpoints for new or refined logic (step-relationships, deceased spouse, etc.) are present and documented.
- **Status:** OK. All endpoints, including recent logic for step-relationships and deceased spouse, are present and match the documentation.



## 6. Documentation: Always in Sync

- **Check:** API documentation (`docs/api_endpoints_overview.md` and `ROADMAP.md`) is up to date with the codebase, including:
  - All endpoints and parameters
  - Step-relationship and deceased spouse logic
  - Timeline and validation rules
- **How to verify:** After any API change, review and update documentation so new endpoints, parameters, and behaviors are always documented. Confirm that recent business logic changes are described in both overview and roadmap docs.
- **Status:** OK. Docs are in sync with the codebase and reflect all recent logic and business rules.

---


## Final Thoughts

The ChronicleTree API is in great shape, following best practices for authentication, user data, endpoint coverage, and documentation. This checklist can be referenced as the project evolves. For next steps and ideas, see the [Project Roadmap](../../ROADMAP.md) for features, tests, and future plans.
