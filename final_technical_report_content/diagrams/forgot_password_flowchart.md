# Forgot Password Page Flowchart - Eraser.io

```
// ChronicleTree Forgot Password Page Flow
// For use with app.eraser.io

title Forgot Password Page Flow

// Main Page
ForgotPasswordPage [shape: rectangle, icon: mail, color: orange, title: "Forgot Password Page (/forgot-password)"]

// Form Components
EmailField [shape: rectangle, icon: envelope, color: lightorange, title: "Email Input Field"]
SendResetButton [shape: rectangle, icon: send, color: orange, title: "Send Reset Email Button"]

// Navigation
BackToLoginLink [shape: rectangle, icon: arrow-left, color: blue, title: "Back to Login Link"]

// External Pages
LoginPage [shape: rectangle, icon: log-in, color: blue, title: "Login Page"]
ResetPasswordPage [shape: rectangle, icon: key, color: red, title: "Reset Password Page"]

// Email System
EmailService [shape: rectangle, icon: mail, color: yellow, title: "Email Service (Reset Link)"]

// Access Restriction
AccessNote [shape: rectangle, icon: warning, color: red, title: "ONLY Accessible from Login Page"]

// Form Flow
ForgotPasswordPage > EmailField: "Enter Registered Email"
ForgotPasswordPage > SendResetButton: "Send Reset Request"

// Navigation Flow
ForgotPasswordPage > BackToLoginLink: "Return to Login"
BackToLoginLink > LoginPage: "Navigate Back"

// Reset Process
SendResetButton > EmailService: "Send Reset Email"
EmailService > ResetPasswordPage: "Email Link Only"

// Access Control
LoginPage > ForgotPasswordPage: "Only Entry Point"
AccessNote > ForgotPasswordPage: "Access Restriction"
```

## Forgot Password Page Features

### Form Fields
- **Email Field**: Enter registered email address
- **Email Validation**: Verify email format and registration

### Actions
- **Send Reset Email Button**: Trigger password reset email
- **Email Service**: Send secure reset link to user's email

### Navigation Options
- **Back to Login Link**: Return to login page
- **No Other Navigation**: Limited navigation options

### Access Control
- **Login Page Only**: Can ONLY be accessed from Login page
- **No Register Access**: Cannot be reached from Register page
- **Direct URL Protection**: Should validate proper navigation

### Reset Process
- **Email Verification**: Check if email is registered
- **Secure Token**: Generate secure reset token
- **Email Delivery**: Send reset link via email
- **Link Expiration**: Time-limited reset links

### Important Restrictions
- **Single Entry Point**: Only accessible from Login page
- **Email-Only Reset**: Reset password only via email link
- **No Direct Reset**: Cannot reset password on this page
