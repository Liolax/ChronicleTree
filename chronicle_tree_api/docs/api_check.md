
# API Sanity Check & Review (Actual)

This document is a live checklist for the ChronicleTree Rails API, reflecting the current, actual state of the codebase. Use this to validate correctness, security, and best practices after major changes or before releases.


## 1. Controller Inheritance & Authentication

- **Check**: All API controllers inherit from `ApplicationController` (see `app/controllers/api/v1/`).
- **Authentication**: All protected endpoints use `before_action :authenticate_user!` (via `Api::V1::BaseController`).
- **Status**: ✅ All controllers are correctly set up for authentication.


## 2. Devise & JWT Configuration

- **Check**: Devise and devise-jwt are configured for `/api/v1/auth` endpoints, with JWT denylist enabled.
- **How to Verify**: See `config/routes.rb` for `devise_for :users, path: 'api/v1/auth', ...`, `config/initializers/devise.rb` for JWT config, and `app/models/jwt_denylist.rb` for the denylist model.
- **Status**: ✅ Devise/JWT setup matches the codebase and is working as intended.


## 3. Authorization & Scoping

- **Check**: All controller actions scope data to `current_user` (e.g., `current_user.people`, `current_user.facts`).
- **How to Verify**: Inspect all controller actions for user scoping; no global queries are present.
- **Status**: ✅ All data access is properly scoped.


## 4. File Organization & Cleanup

- **Check**: API code and documentation are organized for clarity and maintainability.
- **How to Verify**: Controllers are in `app/controllers/api/v1/`, docs are in `docs/`, and all files are loaded by Rails.
- **Status**: ✅ File structure is clean and correct.


## 5. Endpoint Coverage & Consistency

- **Check**: All major resources (people, facts, timeline items, media, notes, relationships) have full CRUD endpoints.
- **How to Verify**: Compare `config/routes.rb` and controller actions to `docs/api_endpoints_overview.md` (which is up to date).
- **Status**: ✅ All endpoints are present and match the documentation.


## 6. Documentation Sync

- **Check**: API documentation in `docs/api_endpoints_overview.md` and `ROADMAP.md` is up to date with the codebase.
- **How to Verify**: Review docs after any API change. All new endpoints, parameters, and behaviors are documented.
- **Status**: ✅ Docs are in sync with the codebase.


## Conclusion

The ChronicleTree API is fully up to date and follows best practices for authentication, authorization, endpoint coverage, and documentation. Continue to use this checklist to validate future changes. For next steps, follow the [Project Roadmap](../../ROADMAP.md) for feature-specific plans, tests, and database model improvements.
