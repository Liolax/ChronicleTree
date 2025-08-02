# Register Page Flowchart - Eraser.io

```
// ChronicleTree Register Page Flow
// For use with app.eraser.io

title Register Page Flow

// Main Page
RegisterPage [shape: rectangle, icon: user-plus, color: purple, title: "Register Page (/register)"]

// Form Components
NameField [shape: rectangle, icon: user, color: lightblue, title: "Full Name Field"]
EmailField [shape: rectangle, icon: envelope, color: lightblue, title: "Email Input Field"]
PasswordField [shape: rectangle, icon: lock, color: red, title: "Password Field"]
ConfirmPasswordField [shape: rectangle, icon: check, color: green, title: "Confirm Password Field"]
ShowHideToggle [shape: rectangle, icon: eye, color: gray, title: "Password Show/Hide Toggle"]
RegisterButton [shape: rectangle, icon: user-plus, color: purple, title: "Create Account Button"]

// Navigation (LIMITED)
LoginLink [shape: rectangle, icon: log-in, color: blue, title: "Already have account? Login"]

// External Pages
LoginPage [shape: rectangle, icon: log-in, color: blue, title: "Login Page"]
TreePage [shape: rectangle, icon: git-branch, color: green, title: "Family Tree Page"]

// Authentication System
AuthSystem [shape: rectangle, icon: shield, color: gray, title: "JWT Registration"]

// Form Flow
RegisterPage > NameField: "Full Name Input"
RegisterPage > EmailField: "Email Input"
RegisterPage > PasswordField: "Password Input"
RegisterPage > ConfirmPasswordField: "Confirm Password"
PasswordField > ShowHideToggle: "Toggle Visibility"
ConfirmPasswordField > ShowHideToggle: "Toggle Visibility"
RegisterPage > RegisterButton: "Submit Registration"

// Navigation Flow (LIMITED - NO FORGOT PASSWORD)
RegisterPage > LoginLink: "Have Account? Login Only"
LoginLink > LoginPage: "Navigate to Login"

// Registration Flow
RegisterButton > AuthSystem: "Create New Account"
AuthSystem > TreePage: "Success - Auto Login & Redirect"
```

## Register Page Features

### Form Fields
- **Full Name Field**: User's complete name
- **Email Field**: Email address for new account
- **Password Field**: Secure password input with show/hide toggle
- **Confirm Password Field**: Password confirmation with show/hide toggle

### Actions
- **Create Account Button**: Submit registration form
- **Form Validation**: Real-time validation and password matching

### Navigation Options (LIMITED)
- **Login Link ONLY**: "Already have an account? Log in"
- **NO Forgot Password**: Register page has NO access to password reset

### Registration Process
- **JWT Registration**: Create account and auto-login
- **Success Redirect**: Navigate directly to family tree
- **Error Handling**: Display registration errors

### Important Restrictions
- **No Forgot Password Access**: Users must go to Login page first
- **Single Navigation Option**: Only login link available
