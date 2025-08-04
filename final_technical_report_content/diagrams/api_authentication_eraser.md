# ChronicleTree Authentication API - Eraser.io Sequence Diagram

```
// ChronicleTree Authentication Flow - Hybrid Implementation
// Dev: Sidekiq+Redis+memory_store, Prod: Solid Queue+Solid Cache
// For use with app.eraser.io

title ChronicleTree Authentication API - Hybrid Implementation

React Client [icon: react, color: blue]
Rails API [icon: ruby, color: red]
Devise JWT [icon: key, color: orange]
PostgreSQL [icon: database, color: blue]
Memory Store [icon: memory, color: green]

activate React Client

// User Registration Flow
React Client > Rails API: POST /api/v1/auth
note right of Rails API: RegistrationsController
activate Rails API
Rails API > PostgreSQL: Create user account
activate PostgreSQL
PostgreSQL --> Rails API: User created
deactivate PostgreSQL
Rails API > Devise JWT: Generate JWT token
activate Devise JWT
Devise JWT --> Rails API: JWT token via cookie
deactivate Devise JWT
Rails API > Memory Store: Store session
activate Memory Store
deactivate Memory Store
Rails API --> React Client: User data + JWT cookie
deactivate Rails API

// User Login Flow
React Client > Rails API: POST /api/v1/auth/sign_in
note right of Rails API: SessionsController
activate Rails API
Rails API > PostgreSQL: Validate credentials
activate PostgreSQL
PostgreSQL --> Rails API: User authenticated
deactivate PostgreSQL
Rails API > Devise JWT: Issue JWT token
activate Devise JWT
Devise JWT --> Rails API: JWT token
deactivate Devise JWT
Rails API > Memory Store: Cache session
activate Memory Store
deactivate Memory Store
Rails API --> React Client: JWT token + user data
deactivate Rails API

// Password Reset Flow
React Client > Rails API: POST /api/v1/auth/password
note right of Rails API: PasswordsController
activate Rails API
Rails API > PostgreSQL: Generate reset token
activate PostgreSQL
PostgreSQL --> Rails API: Reset token created
deactivate PostgreSQL
Rails API --> React Client: Reset initiated (email via ActionMailer)
deactivate Rails API

// Password Update Flow
React Client > Rails API: PUT /api/v1/auth/password
activate Rails API
Rails API > PostgreSQL: Validate reset token
activate PostgreSQL
PostgreSQL --> Rails API: Token valid
Rails API > PostgreSQL: Update password
PostgreSQL --> Rails API: Password updated
deactivate PostgreSQL
Rails API > Devise JWT: Invalidate old sessions
activate Devise JWT
deactivate Devise JWT
Rails API --> React Client: Password updated
deactivate Rails API

// User Logout Flow
React Client > Rails API: DELETE /api/v1/auth/sign_out
activate Rails API
Rails API > Devise JWT: Invalidate JWT token
activate Devise JWT
deactivate Devise JWT
Rails API > Memory Store: Clear session
activate Memory Store
deactivate Memory Store
Rails API --> React Client: Logged out (no_content)
deactivate Rails API

deactivate React Client
```

## Authentication API Patterns

### Registration Pattern
- **Account Creation**: User registration with email/password validation
- **Automatic Login**: JWT token issued immediately upon registration
- **Session Management**: Memory store (dev), Solid Cache (prod) for performance

### Login/Logout Pattern
- **Credential Validation**: Database authentication with Devise
- **JWT Token Management**: Secure token-based authentication
- **Cookie-based Transport**: JWT tokens delivered via HTTP cookies

### Password Management
- **Reset Flow**: Email-based password reset with secure tokens
- **Token Validation**: Time-limited reset tokens with single use
- **Session Invalidation**: Old sessions cleared on password change

### Security Features
- **Devise Integration**: Rails industry-standard authentication
- **JWT Security**: Stateless authentication with hybrid caching
- **Controller Separation**: Dedicated controllers for each auth operation
