# Profile Share Flowchart - Eraser.io

```
// ChronicleTree Profile Share Flow
// For use with app.eraser.io

title Profile Share Flow

// Main Profile Share
ProfileShareModal [shape: rectangle, icon: user, color: purple, title: "Profile Share Modal"]
PersonProfile [shape: rectangle, icon: id-card, color: blue, title: "Person Profile Data"]
SharePreview [shape: rectangle, icon: eye, color: lightblue, title: "Share Preview"]

// Privacy Settings
PrivacySettings [shape: rectangle, icon: shield, color: orange, title: "Privacy Settings"]
VisibleFields [shape: rectangle, icon: check, color: green, title: "Visible Profile Fields"]
HiddenFields [shape: rectangle, icon: x, color: red, title: "Hidden Private Fields"]

// Share Content
ProfileImage [shape: rectangle, icon: image, color: pink, title: "Profile Photo"]
BasicInfo [shape: rectangle, icon: info, color: lightgreen, title: "Name, Birth Date, Bio"]
FamilyConnections [shape: rectangle, icon: users, color: yellow, title: "Family Relationships"]
ShareMessage [shape: rectangle, icon: message-square, color: cyan, title: "Custom Share Message"]

// Social Platforms
FacebookProfile [shape: rectangle, icon: facebook, color: blue, title: "Share to Facebook"]
TwitterProfile [shape: rectangle, icon: twitter, color: cyan, title: "Share to Twitter"]
WhatsAppProfile [shape: rectangle, icon: message-circle, color: green, title: "Share to WhatsApp"]
EmailProfile [shape: rectangle, icon: mail, color: orange, title: "Share via Email"]
CopyProfileLink [shape: rectangle, icon: copy, color: gray, title: "Copy Profile Link"]

// Public Profile Page
PublicProfilePage [shape: rectangle, icon: globe, color: blue, title: "Public Profile Page (SEO/Crawlers)"]
ProfileViewer [shape: rectangle, icon: eye, color: purple, title: "Profile Viewer"]
ContactActions [shape: rectangle, icon: phone, color: green, title: "Contact Actions"]
FrontendRedirect [shape: rectangle, icon: arrow-right, color: orange, title: "Redirect to Frontend App"]
AuthRequired [shape: rectangle, icon: lock, color: red, title: "Authentication Required"]

// Success & Analytics
ProfileShareSuccess [shape: rectangle, icon: check-circle, color: green, title: "Profile Share Success"]
ProfileAnalytics [shape: rectangle, icon: bar-chart, color: orange, title: "Profile Share Analytics"]

// Main Profile Flow
ProfileShareModal > PersonProfile: "Load Profile Data"
ProfileShareModal > PrivacySettings: "Configure Sharing"
PersonProfile > SharePreview: "Generate Preview"

// Privacy Configuration
PrivacySettings > VisibleFields: "Public Information"
PrivacySettings > HiddenFields: "Keep Private"
VisibleFields > ProfileImage: "Show Photo"
VisibleFields > BasicInfo: "Show Details"
VisibleFields > FamilyConnections: "Show Relationships"

// Share Content Flow
SharePreview > ShareMessage: "Add Custom Message"
SharePreview > FacebookProfile: "Facebook Share"
SharePreview > TwitterProfile: "Twitter Share"
SharePreview > WhatsAppProfile: "WhatsApp Share"
SharePreview > EmailProfile: "Email Share"
SharePreview > CopyProfileLink: "Copy Link"

// Social Media Results
FacebookProfile > ProfileShareSuccess: "Facebook Posted"
TwitterProfile > ProfileShareSuccess: "Tweet Sent"
WhatsAppProfile > ProfileShareSuccess: "WhatsApp Sent"
EmailProfile > ProfileShareSuccess: "Email Sent"
CopyProfileLink > ProfileShareSuccess: "Link Copied"

// Public Profile Access
CopyProfileLink > PublicProfilePage: "External Access"
PublicProfilePage > ProfileViewer: "View Profile"
PublicProfilePage > ContactActions: "Contact Person"
PublicProfilePage > FrontendRedirect: "Browser Redirect"
FrontendRedirect > AuthRequired: "Login Required"

// Analytics Flow
ProfileShareSuccess > ProfileAnalytics: "Track Performance"
```

## Profile Share Features

### Profile Data Management
- **Person Profile**: Individual family member information
- **Privacy Settings**: Control what information is shared publicly
- **Visible Fields**: Name, photo, birth date, bio, relationships
- **Hidden Fields**: Private contact info, sensitive data

### Share Preview
- **Visual Preview**: See exactly what others will view
- **Custom Message**: Add personal message with profile share
- **Profile Photo**: Include or exclude profile image
- **Relationship Info**: Show family connections

### Social Media Integration
- **Facebook**: Share profile with custom message
- **Twitter**: Tweet about family member with profile link
- **WhatsApp**: Send profile via messaging
- **Email**: Email profile information
- **Copy Link**: Generate shareable URL

### Public Profile Pages
- **SEO Optimized**: Search engine friendly profile pages
- **Mobile Responsive**: Works on all devices
- **Contact Actions**: Ways to reach out to person
- **Join Prompts**: Convert visitors to ChronicleTree users

### Privacy & Security
- **Granular Privacy**: Choose exactly what to share
- **Safe Sharing**: No sensitive information exposed
- **Consent Based**: Only share with permission
- **Revokable**: Can disable sharing anytime

### Analytics & Tracking
- **View Counts**: How many people viewed profile
- **Platform Breakdown**: Which social media works best
- **Engagement**: Clicks, contacts, sign-ups from shares
- **Performance**: Most shared profiles and content
