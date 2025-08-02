# Reset Password Page Flowchart - Eraser.io

```
// ChronicleTree Reset Password Page Flow
// For use with app.eraser.io

title Reset Password Page Flow

// Main Page
ResetPasswordPage [shape: rectangle, icon: key, color: red, title: "Reset Password Page (/reset-password)"]

// Form Components
NewPasswordField [shape: rectangle, icon: key, color: lightred, title: "New Password Field"]
ConfirmPasswordField [shape: rectangle, icon: check, color: green, title: "Confirm New Password"]
ShowHideToggle [shape: rectangle, icon: eye, color: gray, title: "Password Show/Hide Toggle"]
ResetButton [shape: rectangle, icon: save, color: red, title: "Reset Password Button"]

// External Pages
LoginPage [shape: rectangle, icon: log-in, color: blue, title: "Login Page"]

// Security Components
TokenValidation [shape: rectangle, icon: shield, color: yellow, title: "Token Validation"]
EmailLink [shape: rectangle, icon: mail, color: orange, title: "Email Reset Link"]

// Access Control
AccessNote [shape: rectangle, icon: warning, color: red, title: "ONLY via Email Link"]

// Form Flow
ResetPasswordPage > NewPasswordField: "Enter New Password"
ResetPasswordPage > ConfirmPasswordField: "Confirm New Password"
NewPasswordField > ShowHideToggle: "Toggle Visibility"
ConfirmPasswordField > ShowHideToggle: "Toggle Visibility"
ResetPasswordPage > ResetButton: "Submit New Password"

// Security Flow
EmailLink > TokenValidation: "Validate Reset Token"
TokenValidation > ResetPasswordPage: "Token Valid - Show Form"

// Completion Flow
ResetButton > LoginPage: "Success - Return to Login"

// Access Control
AccessNote > ResetPasswordPage: "Email Link Access Only"
```

## Reset Password Page Features

### Form Fields
- **New Password Field**: Enter new secure password with show/hide toggle
- **Confirm Password Field**: Verify new password with show/hide toggle
- **Password Validation**: Strength requirements and matching validation

### Actions
- **Reset Password Button**: Submit new password and complete reset
- **Form Validation**: Real-time password strength and matching checks

### Security Features
- **Token Validation**: Verify reset token from email is valid and not expired
- **Secure Reset**: Encrypted password update process
- **Session Security**: Secure token handling

### Access Control
- **Email Link Only**: Can ONLY be accessed via reset link from email
- **No Direct Access**: Cannot be reached from any page navigation
- **Token Required**: Must have valid reset token to access
- **Time Limitation**: Reset tokens expire after set time period

### Completion Process
- **Password Update**: Securely update user password in database
- **Auto Redirect**: Automatically return to login page after success
- **Clear Tokens**: Invalidate reset token after successful use

### Important Restrictions
- **Single Entry Method**: Only via email reset link
- **No Page Navigation**: No links to other pages
- **Token Dependency**: Requires valid token to function
- **One-Time Use**: Reset tokens are single-use only
