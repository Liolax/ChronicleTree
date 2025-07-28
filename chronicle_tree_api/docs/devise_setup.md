

# Devise & JWT Authentication Setup (Up-to-Date: July 2025)

This document provides a live, up-to-date overview of the Devise and `devise-jwt` setup for authentication in the ChronicleTree API, matching the current Rails implementation. This version reflects all current configuration, stateless API design, and token expiration logic.



## 1. Gems

The authentication system relies on two core gems:

- `devise`: The primary engine for user authentication in Rails.
- `devise-jwt`: An extension for Devise that provides JWT-based authentication.


```ruby
# Gemfile
gem "devise"
gem "devise-jwt"
```



## 2. Configuration

### `config/initializers/devise.rb`

This file contains the main configuration for Devise and `devise-jwt`.

- **Stateless API**: The API is fully stateless (`skip_session_storage` is set for `:http_auth`, no session cookies).
- **JWT Dispatch/Revocation**: `dispatch_requests` and `revocation_requests` are set for `/api/v1/auth/sign_in` and `/api/v1/auth/sign_out`.
- **JWT Secret**: Loaded from `Rails.application.credentials.devise_jwt_secret_key`.
- **Token Expiration**: JWT tokens expire after 1 day (24 hours) for security.
- **Revocation**: Logging out adds the token's `jti` to the denylist, immediately invalidating it.



### `config/routes.rb`

Devise endpoints are under `/api/v1/auth` for a clean, versioned API structure. All authentication is handled via JSON requests and responses.

```ruby
# config/routes.rb
devise_for :users,
           path: 'api/v1/auth',
           path_names: {
             sign_in: 'sign_in',
             sign_out: 'sign_out',
             registration: '' # POST to /api/v1/auth
           },
           controllers: {
             sessions:      'api/v1/auth/sessions',
             registrations: 'api/v1/auth/registrations',
             passwords:     'api/v1/auth/passwords'
           }
```



## 3. Models

### `User` Model

The `User` model is the core of the authentication system.

- **Modules**: Includes `:database_authenticatable`, `:registerable`, `:recoverable`, `:rememberable`, `:validatable`, and `:jwt_authenticatable`.
- **JWT Strategy**: Uses `JwtDenylist` as the revocation strategy, so JWTs are invalidated on logout.
- **Associations**: All user data (people, facts, relationships, etc.) is scoped to the authenticated user.


```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist
  # ...
end
```



### `JwtDenylist` Model

Implements the denylist strategy for `devise-jwt`. When a user signs out, their token's `jti` is added to the `jwt_denylists` table, preventing reuse of the token.

```ruby
# app/models/jwt_denylist.rb
class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist
  self.table_name = 'jwt_denylists'
end
```



## 4. Controllers

### Custom Controllers

- **`Api::V1::Auth::SessionsController`**: Inherits from `Devise::SessionsController`. Handles JWT token dispatch on login and revocation on logout.
- **`Api::V1::Auth::RegistrationsController`**: Overrides `create` to return user data and JWT in the JSON response.
- **`Api::V1::Auth::PasswordsController`**: Handles password reset requests and updates.

### Authentication Enforcement

All protected API endpoints inherit from `Api::V1::BaseController`, which uses a `before_action` to ensure the user is authenticated. No session or cookie-based authentication is used.

```ruby
# app/controllers/api/v1/base_controller.rb
class BaseController < ApplicationController
  before_action :authenticate_user!
  # ...
end
```



## 5. Conclusion

This setup provides a secure, stateless, token-based authentication system that is fully integrated with the Rails framework and follows API design best practices. It forms the foundation for all protected endpoints in the application. For a full list of endpoints, see the [API Endpoints Overview](./api_endpoints_overview.md).
