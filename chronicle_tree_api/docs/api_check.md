# API Sanity Check & Review

This document outlines a review of the ChronicleTree Rails API, focusing on correctness, security, and best practices. Use this checklist to validate the API after major changes or before releases.

## 1. Controller Inheritance & Authentication

- **Check**: All API controllers inherit from `ApplicationController`, which includes Devise helpers and authentication logic.
- **How to Verify**: Inspect `app/controllers/api/v1/*_controller.rb` files. Confirm `class ... < ApplicationController` and that `before_action :authenticate_user!` is present where needed.
- **Status**: ✅ **Correct**

## 2. Devise & JWT Configuration

- **Check**: Devise routes are set up for `/auth` endpoints, and JWT authentication with denylist is enabled.
- **How to Verify**: Review `config/routes.rb` for `devise_for` and `devise_scope`. Check `config/initializers/devise.rb` and `jwt_denylist.rb` for correct JWT setup.
- **Status**: ✅ **Correct**

## 3. Authorization & Scoping

- **Check**: All controllers scope data access to `current_user` to prevent data leaks between users.
- **How to Verify**: Inspect controller actions for queries like `current_user.people`, `current_user.facts`, etc. Ensure no global queries are used.
- **Status**: ✅ **Correct**

## 4. File Organization & Cleanup

- **Check**: API and docs files are organized for clarity. Controllers are in `app/controllers/api/v1/`, docs are in `docs/`.
- **How to Verify**: Confirm file locations. Check that `RelationshipsController` is at `app/controllers/api/v1/relationships_controller.rb` and loaded by the router.
- **Status**: ✅ **Corrected**

## 5. Endpoint Coverage & Consistency

- **Check**: All major resources (people, facts, timeline items, media, notes, relationships) have full CRUD endpoints, and routes match the documentation.
- **How to Verify**: Compare `config/routes.rb` and controller actions to `docs/api_endpoints_overview.md`. Confirm that endpoints like `/people/:id/full_tree` and `/people/:person_id/note` exist and behave as described.
- **Status**: ✅ **Correct**

## 6. Documentation Sync

- **Check**: API documentation in `docs/api_endpoints_overview.md` and `ROADMAP.md` is up to date with the codebase.
- **How to Verify**: Review docs after any API change. Ensure new endpoints, parameters, and behaviors are documented.
- **Status**: ✅ **Up to Date**

## Conclusion

The API's foundational structure for authentication, authorization, and resource management is sound. Continue to use this checklist to validate future changes. For next steps, follow the [Project Roadmap](../../ROADMAP.md) for feature-specific plans, tests, and database model improvements.
