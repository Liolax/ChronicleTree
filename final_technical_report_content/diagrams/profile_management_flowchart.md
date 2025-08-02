# ChronicleTree Profile Management Page Flowchart - Eraser.io

```
// ChronicleTree Profile Management Page Flow (Based on Actual Profile.jsx Implementation)
// For use with app.eraser.io

title ChronicleTree Profile Management Flow

// Main Profile Page (/profile/:id)
ProfilePage [shape: rectangle, icon: user, color: purple, title: "Profile Page - /profile/:id Route"]
ProfileHeader [shape: rectangle, icon: id-card, color: blue, title: "Profile Header - Photo, Name, Gender Icons"]
TabSystem [shape: rectangle, icon: menu, color: green, title: "Tab System - Details | Facts | Timeline | Media | Notes | Relationships"]
ShareProfileButton [shape: rectangle, icon: share, color: cyan, title: "Share Profile Button (FaShareAlt)"]

// Tab Components (Actual Implementation)
DetailsTab [shape: rectangle, icon: info, color: blue, title: "Details Tab - ProfileDetails Component"]
FactsTab [shape: rectangle, icon: info, color: yellow, title: "Facts Tab - FactList Component"]
TimelineTab [shape: rectangle, icon: calendar, color: orange, title: "Timeline Tab - Timeline Component"]
MediaTab [shape: rectangle, icon: image, color: red, title: "Media Tab - MediaGallery Component"]
NotesTab [shape: rectangle, icon: file-text, color: gray, title: "Notes Tab - Notes Component"]
RelationshipsTab [shape: rectangle, icon: users, color: red, title: "Relationships Tab - RelationshipManager"]

// Form Components
FactForm [shape: rectangle, icon: plus, color: yellow, title: "FactForm - Add/Edit Facts"]
TimelineForm [shape: rectangle, icon: plus, color: orange, title: "TimelineForm - Add/Edit Timeline"]
MediaForm [shape: rectangle, icon: upload, color: red, title: "MediaForm - Upload Media"]
ProfileEditForm [shape: rectangle, icon: edit, color: blue, title: "ProfileDetails Edit Form"]

// Action Buttons and Modals
AddFactButton [shape: rectangle, icon: plus, color: green, title: "Add Fact Button (FaPlus)"]
AddTimelineButton [shape: rectangle, icon: plus, color: green, title: "Add Timeline Button (FaPlus)"]
AddMediaButton [shape: rectangle, icon: camera, color: blue, title: "Add Media Button (FaCamera)"]
EditDetailsButton [shape: rectangle, icon: pencil-alt, color: orange, title: "Edit Details Button (FaPencilAlt)"]
DeletePersonModal [shape: rectangle, icon: trash, color: red, title: "DeletePersonModal - Delete Confirmation"]
ShareModal [shape: rectangle, icon: share, color: cyan, title: "ShareModal - Social Sharing"]

// Relationship Management
RelationshipManager [shape: rectangle, icon: users, color: red, title: "RelationshipManager - Manage Family Relations"]
ToggleSpouseEx [shape: rectangle, icon: heart, color: red, title: "Toggle Spouse Ex Status"]
DeleteRelationship [shape: rectangle, icon: trash, color: red, title: "Delete Relationship Action"]

// Main Profile Flow
ProfilePage > ProfileHeader: "Header Section"
ProfilePage > TabSystem: "Tab Navigation"
ProfilePage > ShareProfileButton: "Top Action Button"

// Tab Navigation Flow
TabSystem > DetailsTab: "Default Tab"
TabSystem > FactsTab: "Facts Tab"
TabSystem > TimelineTab: "Timeline Tab"
TabSystem > MediaTab: "Media Tab"
TabSystem > NotesTab: "Notes Tab"
TabSystem > RelationshipsTab: "Relationships Tab"

// Details Tab Flow
DetailsTab > EditDetailsButton: "Edit Profile Details"
EditDetailsButton > ProfileEditForm: "Profile Edit Form"

// Facts Tab Flow
FactsTab > AddFactButton: "Add New Fact"
FactsTab > FactForm: "Edit Existing Fact"
AddFactButton > FactForm: "Fact Creation Form"

// Timeline Tab Flow
TimelineTab > AddTimelineButton: "Add Timeline Item"
AddTimelineButton > TimelineForm: "Timeline Creation Form"

// Media Tab Flow
MediaTab > AddMediaButton: "Upload Media"
AddMediaButton > MediaForm: "Media Upload Form"

// Relationships Tab Flow
RelationshipsTab > RelationshipManager: "Manage Relationships"
RelationshipManager > ToggleSpouseEx: "Ex-Spouse Toggle"
RelationshipManager > DeleteRelationship: "Remove Relationship"

// Modal Interactions
ShareProfileButton > ShareModal: "Social Sharing Options"
DeleteRelationship > DeletePersonModal: "Confirm Deletion"
```

## Actual Profile Management Implementation

### Profile Page Structure
- **Route**: `/profile/:id` with person ID parameter
- **Profile Header**: Person photo, name, gender icons (FaVenus/FaMars)
- **Tab System**: Six main tabs for different content types
- **Share Button**: Social sharing with FaShareAlt icon

### Tab Components (Real Implementation)
1. **Details Tab**: ProfileDetails component with edit functionality
2. **Facts Tab**: FactList component with add/edit capabilities
3. **Timeline Tab**: Timeline component with chronological events
4. **Media Tab**: MediaGallery component with photo/document upload
5. **Notes Tab**: Notes component with rich text editing
6. **Relationships Tab**: RelationshipManager for family connections

### Form Integration
- **FactForm**: Handles life events and facts
- **TimelineForm**: Manages chronological timeline items
- **MediaForm**: File upload with validation
- **ProfileDetails**: Basic person information editing

### Relationship Management Features
- **RelationshipManager**: Advanced relationship handling
- **Ex-Spouse Toggle**: Mark relationships as former
- **Relationship Deletion**: Remove family connections
- **Relationship Stats**: Count and display connections

### State Management
- **React Query**: Server state synchronization
- **Local State**: Form states and UI interactions
- **Error Handling**: SweetAlert2 for user feedback
- **Loading States**: ProfileLoader component

### Data Operations
- **CRUD Operations**: Create, read, update, delete for all data types
- **File Upload**: Media upload with progress indicators
- **Real-time Updates**: Immediate UI updates after changes
- **Validation**: Form validation with error messages

### Mobile Responsive Design
- **Touch-Friendly**: Large touch targets for mobile
- **Responsive Tabs**: Mobile-optimized tab navigation
- **Modal Optimization**: Mobile-friendly modal layouts
- **Image Handling**: Responsive image galleries
