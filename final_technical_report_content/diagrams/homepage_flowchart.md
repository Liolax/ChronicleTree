# ChronicleTree Application Pages Flowchart - Eraser.io

```
// ChronicleTree Main Application Flow (Based on Actual Implementation)
// For use with app.eraser.io

title ChronicleTree Application Flow

// Main Application Entry (No Homepage - Direct to Tree)
AppEntry [shape: rectangle, icon: home, color: blue, title: "ChronicleTree App Entry"]
NavBar [shape: rectangle, icon: menu, color: green, title: "NavBar: ChronicleTree Logo | Tree | Settings | Logout"]
TreeView [shape: rectangle, icon: git-branch, color: green, title: "TreeView - Main Family Tree Interface"]
LoginPage [shape: rectangle, icon: log-in, color: blue, title: "Login Page - Authentication"]
RegisterPage [shape: rectangle, icon: user-plus, color: purple, title: "Register Page - New Account"]

// Authentication Flow (Public Routes)
AuthContainer [shape: rectangle, icon: shield, color: orange, title: "Authentication Container"]
ForgotPassword [shape: rectangle, icon: mail, color: orange, title: "Forgot Password Page"]
ResetPassword [shape: rectangle, icon: key, color: red, title: "Reset Password Page"]

// Protected Routes (Require Authentication)
ProtectedRoutes [shape: rectangle, icon: lock, color: red, title: "Protected Routes (Private)"]
ProfilePage [shape: rectangle, icon: user, color: purple, title: "Profile Page - /profile/:id"]
SettingsPage [shape: rectangle, icon: settings, color: gray, title: "Settings Page - Account Management"]

// Main Application Flow
AppEntry > NavBar: "Navigation Header"
AppEntry > TreeView: "Default Route (/) - Requires Auth"
AppEntry > AuthContainer: "Unauthenticated Users"

// Authentication Flow
AuthContainer > LoginPage: "Login Route (/login)"
AuthContainer > RegisterPage: "Register Route (/register)"
AuthContainer > ForgotPassword: "Forgot Password (/forgot-password)"
AuthContainer > ResetPassword: "Reset Password (/reset-password)"

// Protected Application Flow
LoginPage > ProtectedRoutes: "Successful Authentication"
RegisterPage > ProtectedRoutes: "Account Created"
ProtectedRoutes > TreeView: "Main Tree Interface (/)"
ProtectedRoutes > ProfilePage: "Profile Management (/profile/:id)"
ProtectedRoutes > SettingsPage: "Account Settings (/settings)"

// Navigation Flow
NavBar > TreeView: "Tree Link"
NavBar > SettingsPage: "Settings Link"
NavBar > AuthContainer: "Logout Action"
```

## Actual ChronicleTree Application Structure

### No Traditional Homepage
ChronicleTree is a **single-page application** that routes directly to the family tree interface. There's no marketing homepage - users either see the tree (if authenticated) or login page (if not).

### Navigation Bar (Always Present)
- **ChronicleTree Logo**: Animated logo with wave effect
- **Tree Link**: Navigate to main tree view
- **Settings Link**: Account management
- **Logout Button**: Sign out functionality
- **Mobile Menu**: Responsive hamburger menu

### Authentication System
- **Login Page**: Email/password with "show password" toggle
- **Register Page**: New account creation
- **Forgot Password**: Email-based password reset
- **Reset Password**: Password reset form
- **JWT Authentication**: Token-based authentication

### Protected Routes (Require Login)
- **TreeView (/)**: Main family tree interface using ReactFlow
- **Profile (/profile/:id)**: Detailed person profile management
- **Settings (/settings)**: Account settings with tabs

### Route Protection
- **PrivateRoute Component**: Wraps protected routes
- **AuthProvider**: Context for authentication state
- **Automatic Redirects**: Unmatched routes redirect to /

### Application Architecture
- **Single Page Application**: No traditional homepage
- **Direct Tree Access**: Authenticated users see tree immediately
- **Clean Routing**: Simplified route structure
- **Production Ready**: Removed demo and debug routes
