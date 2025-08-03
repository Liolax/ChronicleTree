# ChronicleTree Profile Management Page Flowchart - Eraser.io

```
// ChronicleTree Profile Management Flow - Compact Horizontal Layout
// For use with app.eraser.io

title ChronicleTree Profile Management Flow

// Main Flow Components
ProfilePage [color: purple, icon: user]
Header [color: blue, icon: id-card]
LeftColumn [color: yellow, icon: columns]
RightColumn [color: green, icon: columns]

// Sub-components
KeyFacts [color: yellow, icon: info]
Relationships [color: red, icon: users]
BasicInfo [color: blue, icon: id-card]
Timeline [color: orange, icon: calendar]
Notes [color: gray, icon: file-text]
Media [color: red, icon: image]

// Forms and Modals
FactForm [color: yellow, icon: edit]
ProfileForm [color: blue, icon: edit]
TimelineForm [color: orange, icon: edit]
NotesForm [color: gray, icon: edit]
MediaForm [color: red, icon: upload]
AvatarModal [color: blue, icon: camera]
ShareModal [color: cyan, icon: share]

// Main Horizontal Flow
ProfilePage > Header > LeftColumn > RightColumn

// Left Column Branches (downward)
LeftColumn > KeyFacts
LeftColumn > Relationships

// Right Column Branches (downward)  
RightColumn > BasicInfo
RightColumn > Timeline
RightColumn > Notes
RightColumn > Media

// Action Branches (downward)
KeyFacts > FactForm
BasicInfo > ProfileForm
Timeline > TimelineForm
Notes > NotesForm
Media > MediaForm
Header > AvatarModal
Header > ShareModal
```
- **Modal Optimization**: Mobile-friendly modal layouts
- **Image Handling**: Responsive image galleries
