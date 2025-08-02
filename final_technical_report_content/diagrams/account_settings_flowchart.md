# ChronicleTree Account Settings Page Flowchart - Eraser.io

```
// ChronicleTree Account Settings Page Flow (Based on Actual Settings.jsx Implementation)
// For use with app.eraser.io

title ChronicleTree Account Settings Flow

// Main Settings Page (/settings)
SettingsPage [shape: rectangle, icon: settings, color: gray, title: "Settings Page - Account Management"]
PageHeader [shape: rectangle, icon: header, color: green, title: "PageHeader - Account Settings Title"]
TabsComponent [shape: rectangle, icon: menu, color: green, title: "Tabs Component - Profile | Password | Danger Zone"]

// Tab Components (Actual Implementation)
ProfileTab [shape: rectangle, icon: user, color: blue, title: "Profile Tab - ProfileSettings Component"]
PasswordTab [shape: rectangle, icon: lock, color: red, title: "Password Tab - PasswordSettings Component"]
DangerZoneTab [shape: rectangle, icon: exclamation-triangle, color: red, title: "Danger Zone Tab - DeleteAccount Component"]

// Profile Settings Components
ProfileSettings [shape: rectangle, icon: user, color: blue, title: "ProfileSettings - User Profile Management"]
UserProfileForm [shape: rectangle, icon: edit, color: blue, title: "User Profile Form - Name, Email"]
AvatarUpload [shape: rectangle, icon: upload, color: purple, title: "Avatar Upload - Profile Photo"]
SaveProfileButton [shape: rectangle, icon: save, color: green, title: "Save Profile Changes"]

// Password Settings Components
PasswordSettings [shape: rectangle, icon: key, color: red, title: "PasswordSettings - Password Management"]
PasswordChangeForm [shape: rectangle, icon: form, color: red, title: "Password Change Form"]
CurrentPasswordField [shape: rectangle, icon: lock, color: orange, title: "Current Password Field"]
NewPasswordField [shape: rectangle, icon: key, color: red, title: "New Password Field"]
ConfirmPasswordField [shape: rectangle, icon: check, color: green, title: "Confirm Password Field"]
ChangePasswordButton [shape: rectangle, icon: save, color: red, title: "Change Password Button"]

// Danger Zone Components
DeleteAccount [shape: rectangle, icon: trash, color: red, title: "DeleteAccount - Account Deletion"]
DeleteWarning [shape: rectangle, icon: alert-triangle, color: orange, title: "Delete Warning - Permanent Action Warning"]
DeleteConfirmation [shape: rectangle, icon: type, color: red, title: "Delete Confirmation - Type Username"]
DeleteAccountButton [shape: rectangle, icon: trash, color: red, title: "Delete Account Button"]

// Loading and Error States
SettingsLoader [shape: rectangle, icon: spinner, color: gray, title: "SettingsLoader - Loading State"]
ErrorHandling [shape: rectangle, icon: exclamation-circle, color: red, title: "Error Handling - Form Validation"]
SuccessMessages [shape: rectangle, icon: check-circle, color: green, title: "Success Messages - Operation Feedback"]

// Main Settings Flow
SettingsPage > PageHeader: "Page Title and Subtitle"
SettingsPage > TabsComponent: "Tab Navigation"
SettingsPage > SettingsLoader: "Loading State"

// Tab Navigation Flow
TabsComponent > ProfileTab: "Default Active Tab"
TabsComponent > PasswordTab: "Password Management"
TabsComponent > DangerZoneTab: "Account Deletion"

// Profile Settings Flow
ProfileTab > ProfileSettings: "Profile Management Component"
ProfileSettings > UserProfileForm: "User Information Form"
ProfileSettings > AvatarUpload: "Profile Photo Upload"
UserProfileForm > SaveProfileButton: "Save Changes"

// Password Settings Flow
PasswordTab > PasswordSettings: "Password Management Component"
PasswordSettings > PasswordChangeForm: "Password Change Form"
PasswordChangeForm > CurrentPasswordField: "Current Password"
PasswordChangeForm > NewPasswordField: "New Password"
PasswordChangeForm > ConfirmPasswordField: "Confirm New Password"
PasswordChangeForm > ChangePasswordButton: "Submit Password Change"

// Danger Zone Flow
DangerZoneTab > DeleteAccount: "Account Deletion Component"
DeleteAccount > DeleteWarning: "Permanent Action Warning"
DeleteAccount > DeleteConfirmation: "Username Confirmation"
DeleteConfirmation > DeleteAccountButton: "Final Delete Action"

// State Management Flow
SaveProfileButton > SuccessMessages: "Profile Updated"
ChangePasswordButton > SuccessMessages: "Password Changed"
DeleteAccountButton > ErrorHandling: "Account Deletion"
UserProfileForm > ErrorHandling: "Validation Errors"
PasswordChangeForm > ErrorHandling: "Password Validation"
```

## Actual Account Settings Implementation

### Settings Page Structure
- **Route**: `/settings` - Protected route requiring authentication
- **PageHeader**: "Account Settings" title with subtitle
- **Tabs Component**: Three-tab navigation system
- **SettingsLoader**: Loading state while fetching user data

### Tab System (Actual Implementation)
1. **Profile Tab**: ProfileSettings component (default active)
2. **Password Tab**: PasswordSettings component
3. **Danger Zone Tab**: DeleteAccount component

### Profile Settings Features
- **User Profile Form**: Edit name and email address
- **Avatar Upload**: Profile photo management
- **Form Validation**: Real-time validation feedback
- **Save Changes**: Update user profile information

### Password Settings Features
- **Current Password**: Verify existing password
- **New Password**: Set new password
- **Confirm Password**: Password confirmation field
- **Security Validation**: Password strength requirements
- **Change Password**: Secure password update

### Danger Zone Features
- **Delete Warning**: Clear warning about permanent deletion
- **Username Confirmation**: Type username to confirm deletion
- **Account Deletion**: Permanent account removal
- **Data Loss Warning**: Information about data deletion

### Data Management
- **useCurrentUser**: Fetch current user data
- **React Query**: Server state management
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error feedback

### User Experience
- **Loading States**: SettingsLoader while data loads
- **Success Messages**: Feedback for successful operations
- **Error Messages**: Clear error communication
- **Responsive Design**: Mobile-friendly interface

### Security Features
- **Authentication Required**: Protected route
- **Password Verification**: Current password required for changes
- **Confirmation Steps**: Multi-step deletion process
- **Data Protection**: Secure data handling
