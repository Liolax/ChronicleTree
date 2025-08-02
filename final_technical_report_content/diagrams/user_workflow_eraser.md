# ChronicleTree User Workflow - Eraser.io Diagram

```
// ChronicleTree User Journey & Workflow
// For use with app.eraser.io

title ChronicleTree User Journey & Workflow

// Entry point
Start [icon: play, color: blue]

// User authentication and onboarding
User Authentication [icon: user-plus, color: blue] {
  Visit Website [icon: monitor, color: lightblue]
  Register Account [icon: form, color: green]
  JWT Login [icon: log-in, color: blue]
  Forgot Password [icon: mail, color: orange]
}

Tree Navigation [icon: git-branch, color: green] {
  Interactive Tree View [icon: network, color: green]
  Pan and Zoom [icon: search, color: orange]
  Person Node Selection [icon: user, color: purple]
  Person Actions Buttons [icon: user-plus, color: blue]
  Share Tree Button [icon: share, color: cyan]
}

Person Actions [icon: users, color: red] {
  Add Person Modal [icon: user-plus, color: green]
  Person Form with Relations [icon: form, color: blue]
  Edit Person Modal [icon: edit, color: orange]
  Delete Person Modal [icon: trash, color: red]
}

Profile Management [icon: user, color: purple] {
  Profile Details [icon: id-card, color: blue]
  Facts Management [icon: info, color: yellow]
  Timeline Items [icon: calendar, color: orange]
  Media Gallery [icon: image, color: red]
  Personal Notes [icon: file-text, color: gray]
  Share Profile Button [icon: share, color: cyan]
}

Social Sharing [icon: share, color: cyan] {
  Generate Profile Share [icon: share, color: cyan]
  Generate Tree Share [icon: git-branch, color: blue]
  Social Media Posts [icon: facebook, color: blue]
  Public Share Links [icon: link, color: green]
}

Account Management [icon: settings, color: gray] {
  User Profile Settings [icon: user, color: blue]
  Password Changes [icon: lock, color: red]
  Delete Account [icon: trash, color: red]
}

// Define workflow connections
Start > User Authentication: Begin Journey
User Authentication > Tree Navigation: Account Created
Tree Navigation > Person Actions: Add/Edit Person
Tree Navigation > Profile Management: View Person
Person Actions > Profile Management: Manage Details
Profile Management > Social Sharing: Share Profile
Tree Navigation > Social Sharing: Share Tree
Tree Navigation > Account Management: User Settings

// Main workflow complete - users can navigate naturally between sections
```

## Actual ChronicleTree Workflow Features

### 1. Authentication System �
- **JWT-based Authentication**: Devise with JWT tokens for secure API access
- **User Registration**: Email/password with validation
- **Password Reset**: Forgot password functionality via email
- **Persistent Sessions**: Token-based authentication for seamless experience

### 2. Interactive Family Tree 🌳
- **React Flow Integration**: @xyflow/react for interactive node-based tree visualization
- **Tree View Page**: Main application interface showing family connections
- **Person Nodes**: Clickable family member cards with relationship indicators
- **Navigation**: Pan, zoom, and explore family connections visually

### 3. Comprehensive Profile Management �
- **Profile Details**: Name, birth/death dates, places, gender
- **Facts Management**: Add/edit life facts and events with CRUD operations
- **Timeline Items**: Chronological life events with dates and descriptions
- **Media Gallery**: Photo and document upload with metadata
- **Personal Notes**: Rich text notes for each family member
- **Profile Header**: Visual profile display with avatar support

### 4. Advanced Relationship System 💞
- **Relationship Manager**: Comprehensive relationship creation and management
- **Relationship Types**: Parent, child, spouse, sibling with proper validation
- **Ex-Spouse Toggle**: Mark relationships as current or former
- **Person Creation**: Add new family members directly from relationship interface
- **Delete Protection**: Safe person deletion with relationship impact warning
- **Relationship Stats**: Analytics on family connections

### 5. Social Sharing Platform 📤
- **Profile Sharing**: Generate shareable links for individual profiles
- **Tree Sharing**: Create public links for entire family tree sections
- **Social Media Integration**: Direct sharing to Facebook, Twitter, WhatsApp
- **Public Share Pages**: SEO-optimized public pages for social media crawlers
- **Share Image Generation**: Automatic image generation for social previews

### 6. Technical Infrastructure ⚙️
- **API-First Architecture**: Rails 8 API with PostgreSQL database
- **File Management**: Active Storage for media and document handling
- **Background Processing**: Sidekiq for image generation and sharing tasks
- **User Settings**: Account management and preferences

## Real User Journey Patterns

### New User Journey
`Start → Register → Tree View (Empty) → Add First Person → Profile Details → Add Family → Define Relationships → Share`

### Returning User Journey
`Start → Login → Tree View → Select Person → Profile Management → Add Facts/Timeline/Media → Relationship Updates`

### Profile Enhancement Flow
`Profile View → Profile Details → Facts Management → Timeline Items → Media Gallery → Notes → Back to Tree`

### Person Actions Flow
`Tree View → Add Person → Define Relationship → Relationship Manager → Toggle Ex Status → Updated Tree View`

### Social Sharing Flow
`Profile/Tree View → Generate Share → Social Media Platforms → Public Share Links → External Traffic`
