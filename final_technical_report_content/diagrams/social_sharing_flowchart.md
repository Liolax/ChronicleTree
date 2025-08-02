# ChronicleTree Social Sharing Overview - Simplified - Eraser.io

```
// ChronicleTree Social Sharing Flow (Simplified)
// For use with app.eraser.io

title ChronicleTree Social Sharing Flow

// Main Share Modal
ShareModal [shape: rectangle, icon: share, color: cyan, title: "Share Modal"]
ProfileShare [shape: rectangle, icon: user, color: purple, title: "Share Profile"]
TreeShare [shape: rectangle, icon: git-branch, color: green, title: "Share Tree"]
CloseModal [shape: rectangle, icon: x, color: gray, title: "Close Modal"]

// Social Platforms
SocialPlatforms [shape: rectangle, icon: globe, color: blue, title: "Social Media Platforms"]
CopyLink [shape: rectangle, icon: copy, color: orange, title: "Copy Share Link"]

// Public Share Page
PublicPage [shape: rectangle, icon: eye, color: lightblue, title: "Public Share Page (SEO/Crawlers)"]
FrontendRedirect [shape: rectangle, icon: arrow-right, color: orange, title: "Redirect to Frontend App"]
AuthenticationRequired [shape: rectangle, icon: lock, color: red, title: "Authentication Required"]

// Share Success
ShareSuccess [shape: rectangle, icon: check-circle, color: green, title: "Share Success"]

// Main Flow
ShareModal > ProfileShare: "Profile Sharing"
ShareModal > TreeShare: "Tree Sharing"
ShareModal > CloseModal: "Close Action"

// Sharing Options
ProfileShare > SocialPlatforms: "Social Media"
ProfileShare > CopyLink: "Copy Link"
TreeShare > SocialPlatforms: "Social Media"
TreeShare > CopyLink: "Copy Link"

// Share Results
SocialPlatforms > ShareSuccess: "Share Complete"
CopyLink > ShareSuccess: "Link Copied"
ProfileShare > PublicPage: "Crawler View"
TreeShare > PublicPage: "Crawler View"
PublicPage > FrontendRedirect: "Browser Redirect"
FrontendRedirect > AuthenticationRequired: "Login Required"
```

## Simplified Social Sharing

### Main Share Options
- **Profile Share**: Share individual person profiles
- **Tree Share**: Share family tree views
- **Copy Link**: Generate shareable URLs
- **Social Media**: Direct platform integration

### Share Process
- **Modal Interface**: Clean sharing interface
- **Platform Selection**: Choose social media platform
- **Link Generation**: Create public share URLs
- **Success Feedback**: Confirm sharing completion

### Public Pages
- **SEO Optimized**: Search-friendly shared content
- **Mobile Responsive**: Works on all devices
- **Join Prompts**: Convert visitors to users
