# Authentication System Flowchart - Eraser.io

```
// ChronicleTree Authentication System Flow
// For use with app.eraser.io

title Authentication System Flow

// Core System Components
AuthProvider [shape: rectangle, icon: shield, color: blue, title: "AuthProvider (React Context)"]
useAuth [shape: rectangle, icon: hook, color: green, title: "useAuth Hook"]
JWTTokens [shape: rectangle, icon: key, color: yellow, title: "JWT Tokens"]

// Backend Services
AuthAPI [shape: rectangle, icon: server, color: purple, title: "Rails Auth API"]
Database [shape: rectangle, icon: database, color: gray, title: "PostgreSQL Database"]

// Frontend Components
LoginForm [shape: rectangle, icon: log-in, color: blue, title: "Login Form"]
RegisterForm [shape: rectangle, icon: user-plus, color: purple, title: "Register Form"]
ProtectedRoutes [shape: rectangle, icon: lock, color: red, title: "Protected Routes"]

// User Feedback
SweetAlert2 [shape: rectangle, icon: bell, color: orange, title: "SweetAlert2 Notifications"]
LoadingStates [shape: rectangle, icon: clock, color: lightblue, title: "Loading States"]

// Storage & Security
LocalStorage [shape: rectangle, icon: save, color: lightyellow, title: "Token Storage"]
FormValidation [shape: rectangle, icon: check-circle, color: green, title: "React Hook Form Validation"]

// Authentication Flow
LoginForm > useAuth: "Login Request"
RegisterForm > useAuth: "Register Request"
useAuth > AuthAPI: "API Calls"
AuthAPI > Database: "User Verification"
Database > AuthAPI: "User Data"
AuthAPI > JWTTokens: "Generate Tokens"
JWTTokens > AuthProvider: "Store Auth State"
AuthProvider > LocalStorage: "Persist Tokens"

// Protection Flow
ProtectedRoutes > AuthProvider: "Check Auth Status"
AuthProvider > JWTTokens: "Validate Tokens"

// User Experience Flow
useAuth > SweetAlert2: "Success/Error Messages"
useAuth > LoadingStates: "Loading Indicators"
LoginForm > FormValidation: "Form Validation"
RegisterForm > FormValidation: "Form Validation"
```

## Authentication System Components

### React Context System
- **AuthProvider**: Global authentication state management
- **useAuth Hook**: Custom hook for authentication operations
- **React Context**: Shared auth state across components

### JWT Token Management
- **Token Generation**: Secure JWT tokens from Rails API
- **Token Storage**: Local storage for persistence
- **Token Validation**: Automatic token verification
- **Token Refresh**: Handle token expiration

### Backend Integration
- **Rails Auth API**: Devise JWT authentication endpoints
- **PostgreSQL Database**: User credential storage
- **API Security**: Secure authentication endpoints

### Form Handling
- **React Hook Form**: Form validation and submission
- **Real-time Validation**: Instant feedback on form fields
- **Error Handling**: Comprehensive error message display

### User Experience
- **SweetAlert2**: Beautiful success/error notifications
- **Loading States**: Visual feedback during operations
- **Protected Routes**: Secure route access control

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Secure password storage
- **Route Protection**: Authenticated route access only
- **Token Expiration**: Automatic security token expiration
