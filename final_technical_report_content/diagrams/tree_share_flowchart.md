# Tree Share Flowchart - Eraser.io

```
// ChronicleTree Tree Share Flow
// For use with app.eraser.io

title Tree Share Flow

// Main Tree Share
TreeShareModal [shape: rectangle, icon: share-2, color: green, title: "Tree Share Modal"]
ShareTypeToggle [shape: rectangle, icon: toggle-left, color: cyan, title: "Share Type Toggle"]
GenerationsSelect [shape: rectangle, icon: layers, color: purple, title: "Generations Select (1-5)"]
AdvancedOptions [shape: rectangle, icon: settings, color: orange, title: "Advanced Options"]

// Share Options
StepRelationshipToggle [shape: rectangle, icon: users, color: lightgreen, title: "Include Step-Relationships"]
GenerateContent [shape: rectangle, icon: zap, color: yellow, title: "Generate Share Content"]

// Generated Content
TreeImage [shape: rectangle, icon: image, color: pink, title: "Tree Image Generation"]
TreeDescription [shape: rectangle, icon: message-square, color: yellow, title: "Auto Description"]
ShareMetadata [shape: rectangle, icon: tag, color: lightblue, title: "Share Metadata"]

// Social Platforms
FacebookTree [shape: rectangle, icon: facebook, color: blue, title: "Share Tree to Facebook"]
XTree [shape: rectangle, icon: x, color: cyan, title: "Share Tree to X"]
WhatsAppTree [shape: rectangle, icon: message-circle, color: green, title: "Share Tree to WhatsApp"]
LinkedInTree [shape: rectangle, icon: linkedin, color: blue, title: "Share Tree to LinkedIn"]
RedditTree [shape: rectangle, icon: circle, color: orange, title: "Share Tree to Reddit"]
EmailTree [shape: rectangle, icon: mail, color: orange, title: "Share Tree via Email"]
CopyTreeLink [shape: rectangle, icon: copy, color: gray, title: "Copy Tree Link"]
DownloadImage [shape: rectangle, icon: download, color: green, title: "Download Tree Image"]

// Backend Components
RailsImageAPI [shape: rectangle, icon: server, color: red, title: "Rails Share Images API"]
TreeSnippetGenerator [shape: rectangle, icon: cpu, color: purple, title: "TreeSnippetGenerator"]
ShareImageModel [shape: rectangle, icon: database, color: blue, title: "Share Image Model"]

// Public Tree Page
PublicTreePage [shape: rectangle, icon: globe, color: blue, title: "Public Tree Page (SEO/Crawlers)"]
MetaTags [shape: rectangle, icon: tag, color: lightgreen, title: "Social Media Meta Tags"]
FrontendRedirect [shape: rectangle, icon: arrow-right, color: orange, title: "Redirect to Frontend App"]
AuthRequired [shape: rectangle, icon: lock, color: red, title: "Authentication Required"]

// Success & Analytics
TreeShareSuccess [shape: rectangle, icon: check-circle, color: green, title: "Tree Share Success"]

// Main Tree Flow
TreeShareModal > ShareTypeToggle: "Toggle Profile/Tree"
TreeShareModal > GenerationsSelect: "Select Generations"
TreeShareModal > AdvancedOptions: "Open Advanced Options"
AdvancedOptions > StepRelationshipToggle: "Include Step-Family"
TreeShareModal > GenerateContent: "Generate Share Content"

// Content Generation Flow
GenerateContent > RailsImageAPI: "API Call"
RailsImageAPI > TreeSnippetGenerator: "Create Image"
TreeSnippetGenerator > ShareImageModel: "Save to Database"
ShareImageModel > TreeImage: "Return Image"
GenerateContent > TreeDescription: "Auto Generate Description"
GenerateContent > ShareMetadata: "Add Metadata"

// Share Distribution Flow
TreeImage > FacebookTree: "Facebook Share"
TreeImage > XTree: "X Share"
TreeImage > WhatsAppTree: "WhatsApp Share"
TreeImage > LinkedInTree: "LinkedIn Share"
TreeImage > RedditTree: "Reddit Share"
TreeImage > EmailTree: "Email Share"
TreeImage > CopyTreeLink: "Copy Link"
TreeImage > DownloadImage: "Download Image"

// Social Media Results
FacebookTree > TreeShareSuccess: "Facebook Posted"
XTree > TreeShareSuccess: "Tweet Sent"
WhatsAppTree > TreeShareSuccess: "WhatsApp Sent"
LinkedInTree > TreeShareSuccess: "LinkedIn Posted"
RedditTree > TreeShareSuccess: "Reddit Posted"
EmailTree > TreeShareSuccess: "Email Sent"
CopyTreeLink > TreeShareSuccess: "Link Copied"
DownloadImage > TreeShareSuccess: "Image Downloaded"

// Public Tree Access
CopyTreeLink > PublicTreePage: "External Access"
PublicTreePage > MetaTags: "Load Meta Tags"
PublicTreePage > FrontendRedirect: "Browser Redirect"
FrontendRedirect > AuthRequired: "Login Required"
```

## Tree Share Features

### Tree Scope Selection
- **Generation Limit**: Control how many generations to show (1-5 generations supported)
- **Root Person**: Choose starting person for tree display
- **Include Step-Relationships**: Toggle to include/exclude step-family connections

### Tree Visualization
- **Tree Image**: High-quality image generation for social media
- **Auto Description**: Generated description of family tree with relationship statistics
- **Interactive Public View**: SEO-optimized public pages with redirect to React app

### Customization Options
- **Advanced Options**: Collapsible section for additional sharing controls
- **Step-Relationship Toggle**: Include or exclude step-family in sharing
- **Generated Content**: Automatically generated titles and descriptions

### Social Media Integration
- **Facebook**: Share tree image with description
- **X (formerly Twitter)**: Tweet tree image with family story
- **WhatsApp**: Send tree image via messaging
- **LinkedIn**: Professional family sharing
- **Reddit**: Community sharing options
- **Email**: Email tree with detailed information
- **Copy Link**: Generate shareable tree URL
- **Download Image**: Save generated tree images locally

### Public Tree Pages
- **Rails Backend**: PublicSharesController handles public share pages
- **SEO Optimization**: Meta tags, Open Graph, Twitter Cards
- **Mobile Responsive**: Tailwind CSS responsive design
- **Social Media Crawlers**: Optimized for Facebook, Twitter, LinkedIn bots
- **Frontend Redirect**: Automatic redirect to React app for interactive features

### Backend Implementation
- **Image Generation**: TreeSnippetGenerator creates share images
- **Relationship Statistics**: Comprehensive family relationship calculations
- **Share Image Model**: Database tracking of generated images with expiration
- **Cache Management**: Automatic cleanup of expired share content
- **API Endpoints**: `/api/v1/share/tree/:id` with generations parameter

### Analytics & Insights
- **API Response Metadata**: Basic generation time and expiration data returned with share content
- **Expiration Management**: Automatic cleanup of old share content
- **Error Handling**: Graceful fallbacks when image generation fails
- **Authentication Flow**: Visitors redirected to login for full interactive features
