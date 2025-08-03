# ChronicleTree Social Sharing Overview - Simplified - Eraser.io

```
// ChronicleTree Social Sharing Flow 
// For use with app.eraser.io

title Social Sharing Application Flow

// Main Application Components
TreePage [shape: rectangle, icon: git-branch, color: green, title: "Tree Page"]
ProfilePage [shape: rectangle, icon: user, color: purple, title: "Profile Page"]
ShareButton [shape: rectangle, icon: share, color: orange, title: "Share Button"]
ShareModal [shape: rectangle, icon: share-2, color: cyan, title: "Share Modal Component"]

// Share Modal Options
ShareProfileOption [shape: rectangle, icon: user, color: purple, title: "Share This Profile"]
ShareTreeOption [shape: rectangle, icon: git-branch, color: green, title: "Share This Tree"]
CopyLinkButton [shape: rectangle, icon: copy, color: orange, title: "Copy Share Link"]
SocialShareButtons [shape: rectangle, icon: share-2, color: blue, title: "Social Media Buttons"]

// Social Platform Components
FacebookShare [shape: rectangle, icon: facebook, color: blue, title: "Facebook Share"]
XShare [shape: rectangle, icon: x, color: lightblue, title: "X Share"]
WhatsAppShare [shape: rectangle, icon: message-circle, color: green, title: "WhatsApp Share"]
LinkedInShare [shape: rectangle, icon: linkedin, color: blue, title: "LinkedIn Share"]

// React Redirect Components
PublicProfileView [shape: rectangle, icon: arrow-right, color: orange, title: "PublicProfileView.jsx"]
PublicTreeView [shape: rectangle, icon: arrow-right, color: orange, title: "PublicTreeView.jsx"]

// Rails Backend Components
RailsShareController [shape: rectangle, icon: server, color: red, title: "PublicSharesController"]
ProfileSharePage [shape: rectangle, icon: eye, color: lightblue, title: "Public Profile Share Page"]
TreeSharePage [shape: rectangle, icon: eye, color: lightgreen, title: "Public Tree Share Page"]

// Generated Content
ShareImageGenerator [shape: rectangle, icon: image, color: green, title: "Share Image Generator"]
ShareImage [shape: rectangle, icon: download, color: lightgreen, title: "Generated Share Image"]
MetaTagsSystem [shape: rectangle, icon: tag, color: lightblue, title: "Social Media Meta Tags"]

// Success States
LinkCopiedState [shape: rectangle, icon: check, color: green, title: "Link Copied Success"]
ShareSuccessState [shape: rectangle, icon: check-circle, color: green, title: "Share Success"]

// Application Flow
TreePage > ShareButton: "Share Tree Action"
ProfilePage > ShareButton: "Share Profile Action"
ShareButton > ShareModal: "Open Modal"
ShareModal > ShareProfileOption: "Profile Sharing"
ShareModal > ShareTreeOption: "Tree Sharing"

// Share Options Flow
ShareProfileOption > CopyLinkButton: "Copy Profile Link"
ShareProfileOption > SocialShareButtons: "Social Share"
ShareTreeOption > CopyLinkButton: "Copy Tree Link"
ShareTreeOption > SocialShareButtons: "Social Share"

// Social Media Flow
SocialShareButtons > FacebookShare: "Facebook"
SocialShareButtons > XShare: "X"
SocialShareButtons > WhatsAppShare: "WhatsApp"
SocialShareButtons > LinkedInShare: "LinkedIn"

// Backend Processing
CopyLinkButton > PublicProfileView: "Profile Link Route"
CopyLinkButton > PublicTreeView: "Tree Link Route"
PublicProfileView > RailsShareController: "Redirect to Rails"
PublicTreeView > RailsShareController: "Redirect to Rails"

// Share Page Generation
RailsShareController > ShareImageGenerator: "Generate Images"
RailsShareController > MetaTagsSystem: "Add Meta Tags"
RailsShareController > ProfileSharePage: "Profile Output"
RailsShareController > TreeSharePage: "Tree Output"
ShareImageGenerator > ShareImage: "Create Downloadable Image"

// Success States
CopyLinkButton > LinkCopiedState: "Copy Success"
FacebookShare > ShareSuccessState: "Share Success"
XShare > ShareSuccessState: "Share Success"
WhatsAppShare > ShareSuccessState: "Share Success"
LinkedInShare > ShareSuccessState: "Share Success"
```

## Social Sharing Application Components

### Frontend Components
- **Share Button**: Integrated into Tree and Profile pages
- **Share Modal**: React modal component with sharing options
- **Social Media Buttons**: Platform-specific sharing components
- **Redirect Components**: PublicProfileView.jsx and PublicTreeView.jsx

### Backend Components
- **PublicSharesController**: Rails controller handling public shares
- **Share Image Generator**: Automated image creation system
- **Meta Tags System**: Social media optimization
- **Public Share Pages**: SEO-optimized profile and tree pages

### Application States
- **Link Copied**: Success feedback for copy operations
- **Share Success**: Confirmation for social media shares
- **Generated Images**: Downloadable share images
- **Public Pages**: Non-authenticated share views

### Integration Points
- **React to Rails**: Redirect mechanism for public content
- **Image Generation**: Backend service for share images
- **Social Platforms**: Direct integration with major platforms
- **Meta Tag Optimization**: Platform-specific social sharing metadata
