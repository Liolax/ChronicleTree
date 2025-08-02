# Tree Share Flowchart - Eraser.io

```
// ChronicleTree Tree Share Flow
// For use with app.eraser.io

title Tree Share Flow

// Main Tree Share
TreeShareModal [shape: rectangle, icon: git-branch, color: green, title: "Tree Share Modal"]
FamilyTreeData [shape: rectangle, icon: network, color: blue, title: "Family Tree Data"]
TreeScope [shape: rectangle, icon: crop, color: yellow, title: "Tree Scope Selection"]

// Scope Options
FullTree [shape: rectangle, icon: git-branch, color: green, title: "Full Family Tree"]
TreeBranch [shape: rectangle, icon: git-merge, color: orange, title: "Specific Branch"]
GenerationLimit [shape: rectangle, icon: layers, color: purple, title: "Generation Limit"]
RootPerson [shape: rectangle, icon: user, color: blue, title: "Select Root Person"]

// Tree Visualization
TreePreview [shape: rectangle, icon: eye, color: lightblue, title: "Tree Preview"]
TreeImage [shape: rectangle, icon: image, color: pink, title: "Tree Image Generation"]
InteractiveTree [shape: rectangle, icon: mouse-pointer, color: cyan, title: "Interactive Tree View"]
TreeDescription [shape: rectangle, icon: message-square, color: yellow, title: "Tree Description"]

// Share Options
TreeMessage [shape: rectangle, icon: edit, color: lightgreen, title: "Custom Tree Message"]
TreeTitle [shape: rectangle, icon: heading, color: gray, title: "Tree Title"]

// Social Platforms
FacebookTree [shape: rectangle, icon: facebook, color: blue, title: "Share Tree to Facebook"]
TwitterTree [shape: rectangle, icon: twitter, color: cyan, title: "Share Tree to Twitter"]
WhatsAppTree [shape: rectangle, icon: message-circle, color: green, title: "Share Tree to WhatsApp"]
EmailTree [shape: rectangle, icon: mail, color: orange, title: "Share Tree via Email"]
CopyTreeLink [shape: rectangle, icon: copy, color: gray, title: "Copy Tree Link"]

// Public Tree Page
PublicTreePage [shape: rectangle, icon: globe, color: blue, title: "Public Tree Page (SEO/Crawlers)"]
TreeViewer [shape: rectangle, icon: search, color: purple, title: "Interactive Tree Viewer"]
TreeNavigation [shape: rectangle, icon: navigation, color: orange, title: "Tree Navigation Controls"]
PersonDetails [shape: rectangle, icon: info, color: lightblue, title: "Person Detail Popups"]
FrontendRedirect [shape: rectangle, icon: arrow-right, color: orange, title: "Redirect to Frontend App"]
AuthRequired [shape: rectangle, icon: lock, color: red, title: "Authentication Required"]

// Success & Analytics
TreeShareSuccess [shape: rectangle, icon: check-circle, color: green, title: "Tree Share Success"]
TreeAnalytics [shape: rectangle, icon: bar-chart, color: orange, title: "Tree Share Analytics"]

// Main Tree Flow
TreeShareModal > FamilyTreeData: "Load Tree Data"
TreeShareModal > TreeScope: "Select Share Scope"
FamilyTreeData > TreePreview: "Generate Preview"

// Scope Selection Flow
TreeScope > FullTree: "Complete Family Tree"
TreeScope > TreeBranch: "Specific Family Branch"
TreeScope > GenerationLimit: "Limit Generations"
TreeScope > RootPerson: "Choose Starting Person"

// Tree Visualization Flow
TreePreview > TreeImage: "Generate Tree Image"
TreePreview > InteractiveTree: "Interactive Version"
TreePreview > TreeDescription: "Auto Description"

// Customization Flow
TreePreview > TreeMessage: "Add Custom Message"
TreePreview > TreeTitle: "Set Tree Title"

// Share Distribution Flow
TreePreview > FacebookTree: "Facebook Share"
TreePreview > TwitterTree: "Twitter Share"
TreePreview > WhatsAppTree: "WhatsApp Share"
TreePreview > EmailTree: "Email Share"
TreePreview > CopyTreeLink: "Copy Link"

// Social Media Results
FacebookTree > TreeShareSuccess: "Facebook Posted"
TwitterTree > TreeShareSuccess: "Tweet Sent"
WhatsAppTree > TreeShareSuccess: "WhatsApp Sent"
EmailTree > TreeShareSuccess: "Email Sent"
CopyTreeLink > TreeShareSuccess: "Link Copied"

// Public Tree Access
CopyTreeLink > PublicTreePage: "External Access"
PublicTreePage > TreeViewer: "View Interactive Tree"
TreeViewer > TreeNavigation: "Navigate Tree"
TreeViewer > PersonDetails: "View Person Info"
PublicTreePage > FrontendRedirect: "Browser Redirect"
FrontendRedirect > AuthRequired: "Login Required"

// Analytics Flow
TreeShareSuccess > TreeAnalytics: "Track Performance"
```

## Tree Share Features

### Tree Scope Selection
- **Full Tree**: Share complete family tree
- **Specific Branch**: Share only part of tree (e.g., paternal side)
- **Generation Limit**: Control how many generations to show
- **Root Person**: Choose starting person for tree display

### Tree Visualization
- **Tree Preview**: Visual representation of what will be shared
- **Tree Image**: High-quality image generation for social media
- **Interactive Tree**: Clickable, zoomable tree for web viewing
- **Auto Description**: Generated description of family tree

### Customization Options
- **Tree Title**: Custom title for shared tree
- **Custom Message**: Personal message with tree share
- **Privacy Filters**: Hide sensitive family information
- **Visual Themes**: Different tree styling options

### Social Media Integration
- **Facebook**: Share tree image with description
- **Twitter**: Tweet tree image with family story
- **WhatsApp**: Send tree image via messaging
- **Email**: Email tree with detailed information
- **Copy Link**: Generate shareable tree URL

### Public Tree Pages
- **Interactive Viewer**: Zoom, pan, explore tree
- **Navigation Controls**: Easy tree navigation
- **Person Popups**: Click person for details
- **Mobile Optimized**: Works on phones and tablets
- **SEO Friendly**: Search engine discoverable

### Privacy & Control
- **Selective Sharing**: Choose which family members to include
- **Privacy Levels**: Control information visibility
- **Consent Based**: Share only with permission
- **Revokable**: Disable sharing anytime
- **Safe Information**: No sensitive data exposed

### Analytics & Insights
- **View Tracking**: How many people viewed tree
- **Engagement**: Which parts of tree get most attention
- **Platform Performance**: Best social media for tree sharing
- **Authentication Required**: Visitors redirected to login for interactive features
