# Devise & JWT Authentication Setup

This document provides a comprehensive overview of the Devise and `devise-jwt` setup for authentication in the ChronicleTree API.

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

- **Authentication Strategy**: The API is configured to be stateless (`skip_session_storage`).
- **JWT Dispatch/Revocation**: The `dispatch_requests` and `revocation_requests` arrays are configured to match the API's namespaced sign-in and sign-out routes.
- **JWT Secret**: The secret key is loaded from Rails' encrypted credentials (`Rails.application.credentials.devise_jwt_secret_key`).
- **Expiration**: Tokens are set to expire after 1 day.

### `config/routes.rb`

The routes are configured to place Devise's endpoints under `/api/v1/auth`. This provides a clean, versioned API structure.

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

- **Modules**: It includes standard Devise modules like `:database_authenticatable`, `:registerable`, and `:recoverable`.
- **JWT Strategy**: It is configured with `:jwt_authenticatable` and specifies `JwtDenylist` as the revocation strategy. This ensures that JWTs can be invalidated upon logout.

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

This model implements the denylist strategy for `devise-jwt`. When a user signs out, their token's `jti` (JWT ID) is added to the `jwt_denylists` table, effectively revoking it.

```ruby
# app/models/jwt_denylist.rb
class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist
  self.table_name = 'jwt_denylists'
end
```

## 4. Controllers

### Custom Controllers

- **`Api::V1::Auth::SessionsController`**: Inherits directly from `Devise::SessionsController`. `devise-jwt` automatically handles token dispatch on login and revocation on logout.
- **`Api::V1::Auth::RegistrationsController`**: Overrides the `create` action to provide a custom JSON response upon successful registration, returning the user data and a JWT.

### Authentication Enforcement

All protected API endpoints inherit from `Api::V1::BaseController`, which uses a `before_action` to ensure the user is authenticated.

```ruby
# app/controllers/api/v1/base_controller.rb
class BaseController < ApplicationController
  before_action :authenticate_user!
  # ...
end
```

This setup provides a secure, token-based authentication system that is well-integrated with the Rails framework and follows API design best practices.
