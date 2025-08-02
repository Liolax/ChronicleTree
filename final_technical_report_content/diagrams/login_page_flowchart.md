# Login Page Flowchart - Eraser.io

```
// ChronicleTree Login Page Flow
// For use with app.eraser.io

title Login Page Flow

// Main Page
LoginPage [shape: rectangle, icon: log-in, color: blue, title: "Login Page (/login)"]

// Form Components
EmailField [shape: rectangle, icon: envelope, color: lightblue, title: "Email Input Field"]
PasswordField [shape: rectangle, icon: lock, color: red, title: "Password Input Field"]
ShowHideToggle [shape: rectangle, icon: eye, color: gray, title: "Show/Hide Password Toggle"]
LoginButton [shape: rectangle, icon: log-in, color: blue, title: "Login Submit Button"]

// Navigation Links
ForgotPasswordLink [shape: rectangle, icon: mail, color: orange, title: "Forgot Password Link"]
RegisterLink [shape: rectangle, icon: user-plus, color: purple, title: "Create Account Link"]

// External Pages
ForgotPasswordPage [shape: rectangle, icon: mail, color: orange, title: "Forgot Password Page"]
RegisterPage [shape: rectangle, icon: user-plus, color: purple, title: "Register Page"]
TreePage [shape: rectangle, icon: git-branch, color: green, title: "Family Tree Page"]

// Authentication System
AuthSystem [shape: rectangle, icon: shield, color: gray, title: "JWT Authentication"]

// Form Flow
LoginPage > EmailField: "Email Input"
LoginPage > PasswordField: "Password Input"
PasswordField > ShowHideToggle: "Toggle Visibility"
LoginPage > LoginButton: "Submit Form"

// Navigation Flow
LoginPage > ForgotPasswordLink: "Forgot Password?"
LoginPage > RegisterLink: "Need Account?"
ForgotPasswordLink > ForgotPasswordPage: "Navigate"
RegisterLink > RegisterPage: "Navigate"

// Authentication Flow
LoginButton > AuthSystem: "Authenticate User"
AuthSystem > TreePage: "Success - Redirect"
```

## Login Page Features

### Form Fields
- **Email Field**: Standard email input with validation
- **Password Field**: Secure password input
- **Show/Hide Toggle**: Eye icon to toggle password visibility

### Actions
- **Login Button**: Submit credentials for authentication
- **Form Validation**: Real-time validation feedback

### Navigation Options
- **Forgot Password Link**: Navigate to password reset
- **Register Link**: Navigate to account creation

### Authentication
- **JWT Authentication**: Secure token-based login
- **Success Redirect**: Navigate to family tree on success
- **Error Handling**: Display validation errors
