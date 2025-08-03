# Profile Share Flowchart - Eraser.io

```
// ChronicleTree Profile Share Flow
// For use with app.eraser.io

title Profile Share Flow

// Main Profile Share
ProfileShareModal [shape: rectangle, icon: share-2, color: purple, title: "Profile Share Modal"]
ShareTypeToggle [shape: rectangle, icon: toggle-left, color: cyan, title: "Share Type Toggle"]
AdvancedOptions [shape: rectangle, icon: settings, color: orange, title: "Advanced Options"]

// Share Options
StepRelationshipToggle [shape: rectangle, icon: users, color: lightgreen, title: "Include Step-Relationships"]
GenerateContent [shape: rectangle, icon: zap, color: yellow, title: "Generate Share Content"]

// Generated Content
ProfileImage [shape: rectangle, icon: image, color: pink, title: "Profile Card Image"]
ProfileDescription [shape: rectangle, icon: message-square, color: yellow, title: "Auto Profile Description"]
ShareMetadata [shape: rectangle, icon: tag, color: lightblue, title: "Share Metadata"]

// Social Platforms
FacebookProfile [shape: rectangle, icon: facebook, color: blue, title: "Share to Facebook"]
XProfile [shape: rectangle, icon: x, color: cyan, title: "Share to X"]
WhatsAppProfile [shape: rectangle, icon: message-circle, color: green, title: "Share to WhatsApp"]
LinkedInProfile [shape: rectangle, icon: linkedin, color: blue, title: "Share to LinkedIn"]
RedditProfile [shape: rectangle, icon: circle, color: orange, title: "Share to Reddit"]
EmailProfile [shape: rectangle, icon: mail, color: orange, title: "Share via Email"]
CopyProfileLink [shape: rectangle, icon: copy, color: gray, title: "Copy Profile Link"]
DownloadImage [shape: rectangle, icon: download, color: green, title: "Download Profile Image"]

// Backend Components
RailsImageAPI [shape: rectangle, icon: server, color: red, title: "Rails Share Images API"]
ProfileCardGenerator [shape: rectangle, icon: cpu, color: purple, title: "ProfileCardGenerator"]
ShareImageModel [shape: rectangle, icon: database, color: blue, title: "Share Image Model"]

// Public Profile Page
PublicProfilePage [shape: rectangle, icon: globe, color: blue, title: "Public Profile Page (SEO/Crawlers)"]
MetaTags [shape: rectangle, icon: tag, color: lightgreen, title: "Social Media Meta Tags"]
FrontendRedirect [shape: rectangle, icon: arrow-right, color: orange, title: "Redirect to Frontend App"]
AuthRequired [shape: rectangle, icon: lock, color: red, title: "Authentication Required"]

// Success & Analytics
ProfileShareSuccess [shape: rectangle, icon: check-circle, color: green, title: "Profile Share Success"]

// Main Profile Flow
ProfileShareModal > ShareTypeToggle: "Toggle Profile/Tree"
ProfileShareModal > AdvancedOptions: "Open Advanced Options"
AdvancedOptions > StepRelationshipToggle: "Include Step-Family"
ProfileShareModal > GenerateContent: "Generate Share Content"

// Content Generation Flow
GenerateContent > RailsImageAPI: "API Call"
RailsImageAPI > ProfileCardGenerator: "Create Profile Card"
ProfileCardGenerator > ShareImageModel: "Save to Database"
ShareImageModel > ProfileImage: "Return Profile Image"
GenerateContent > ProfileDescription: "Auto Generate Description"
GenerateContent > ShareMetadata: "Add Metadata"

// Share Distribution Flow
ProfileImage > FacebookProfile: "Facebook Share"
ProfileImage > XProfile: "X Share"
ProfileImage > WhatsAppProfile: "WhatsApp Share"
ProfileImage > LinkedInProfile: "LinkedIn Share"
ProfileImage > RedditProfile: "Reddit Share"
ProfileImage > EmailProfile: "Email Share"
ProfileImage > CopyProfileLink: "Copy Link"
ProfileImage > DownloadImage: "Download Image"

// Social Media Results
FacebookProfile > ProfileShareSuccess: "Facebook Posted"
XProfile > ProfileShareSuccess: "Tweet Sent"
WhatsAppProfile > ProfileShareSuccess: "WhatsApp Sent"
LinkedInProfile > ProfileShareSuccess: "LinkedIn Posted"
RedditProfile > ProfileShareSuccess: "Reddit Posted"
EmailProfile > ProfileShareSuccess: "Email Sent"
CopyProfileLink > ProfileShareSuccess: "Link Copied"
DownloadImage > ProfileShareSuccess: "Image Downloaded"

// Public Profile Access
CopyProfileLink > PublicProfilePage: "External Access"
PublicProfilePage > MetaTags: "Load Meta Tags"
PublicProfilePage > FrontendRedirect: "Browser Redirect"
FrontendRedirect > AuthRequired: "Login Required"
```

## Profile Share Features

### Profile Sharing Components
- **ShareModal**: Same component used for both profile and tree sharing
- **Share Type Toggle**: Switch between Profile Card and Family Tree modes
- **Step-Relationship Toggle**: Include or exclude step-family connections
- **Advanced Options**: Collapsible section for additional controls

### Content Generation
- **ProfileCardGenerator**: Backend service that creates profile card images
- **Auto Description**: Generated descriptions with relationship statistics
- **Share Image Model**: Database tracking of generated images with expiration
- **Metadata**: Generation time, expiration dates, and performance metrics

### Social Media Integration
- **Facebook**: Share profile card with description
- **X (formerly Twitter)**: Tweet profile card with family context
- **WhatsApp**: Send profile card via messaging
- **LinkedIn**: Professional family profile sharing
- **Reddit**: Community sharing options
- **Email**: Email profile card with detailed information
- **Copy Link**: Generate shareable profile URL
- **Download Image**: Save generated profile card images locally

### Public Profile Pages
- **Rails Backend**: PublicSharesController handles public profile pages
- **SEO Optimization**: Meta tags, Open Graph, Twitter Cards for profile sharing
- **Mobile Responsive**: Tailwind CSS responsive design
- **Social Media Crawlers**: Optimized for Facebook, Twitter, LinkedIn bots
- **Frontend Redirect**: Automatic redirect to React app for interactive features

### Backend Implementation
- **Image Generation**: ProfileCardGenerator creates shareable profile cards
- **Relationship Statistics**: Comprehensive family relationship calculations for profiles
- **API Endpoints**: `/api/v1/share/profile/:id` with step-relationships parameter
- **Cache Management**: Automatic cleanup of expired share content
- **Performance Tracking**: Generation time tracking and optimization

### Analytics & Insights
- **API Response Metadata**: Basic generation time and expiration data returned with share content
- **Expiration Management**: Automatic cleanup of old share content
- **Error Handling**: Graceful fallbacks when profile card generation fails
- **Authentication Flow**: Visitors redirected to login for full interactive features
