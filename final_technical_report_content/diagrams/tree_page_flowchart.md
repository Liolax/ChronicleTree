# ChronicleTree Family Tree Page Flowchart - Eraser.io

```
// ChronicleTree Family Tree Page Flow (Based on Actual FamilyTreeFlow Component)
// For use with app.eraser.io

title ChronicleTree Family Tree Page Flow

// Main Tree Page Components
TreePage [shape: rectangle, icon: git-branch, color: green, title: "TreeView Page - ReactFlow Family Tree"]
FamilyTreeFlow [shape: rectangle, icon: network, color: green, title: "FamilyTreeFlow Component - Main Tree Logic"]
ReactFlowCanvas [shape: rectangle, icon: git-branch, color: blue, title: "ReactFlow Canvas - Interactive Tree Display"]
ReactFlowControls [shape: rectangle, icon: search, color: orange, title: "ReactFlow Controls - Zoom/Pan"]
ReactFlowMiniMap [shape: rectangle, icon: map, color: purple, title: "ReactFlow MiniMap - Tree Overview"]
ReactFlowBackground [shape: rectangle, icon: grid, color: gray, title: "ReactFlow Background - Grid Pattern"]

// Top Panel Controls
TopPanel [shape: rectangle, icon: menu, color: green, title: "Top Panel - Tree Controls"]
AddPersonButton [shape: rectangle, icon: user-plus, color: blue, title: "Add Person Button"]
ShareTreeButton [shape: rectangle, icon: share, color: cyan, title: "Share Tree Button (FaShareAlt)"]
ShowUnrelatedToggle [shape: rectangle, icon: eye, color: yellow, title: "Show Unrelated Toggle"]
FitViewButton [shape: rectangle, icon: search, color: lightblue, title: "Fit View Button - Center Tree"]

// Person Nodes and Interactions
PersonCardNodes [shape: rectangle, icon: user, color: purple, title: "PersonCardNode - Family Member Cards"]
PersonCard [shape: rectangle, icon: id-card, color: purple, title: "PersonCard Component - Person Details"]

// Modals and Forms
AddPersonModal [shape: rectangle, icon: user-plus, color: blue, title: "AddPersonModal - Add New Person"]
EditPersonModal [shape: rectangle, icon: edit, color: orange, title: "EditPersonModal - Edit Person Details"]
DeletePersonModal [shape: rectangle, icon: trash, color: red, title: "DeletePersonModal - Delete Confirmation"]
ShareModal [shape: rectangle, icon: share, color: cyan, title: "ShareModal - Social Sharing Options"]

// Tree Layout and Data
TreeLayoutEngine [shape: rectangle, icon: sitemap, color: yellow, title: "familyTreeHierarchicalLayout - Tree Positioning"]
RelationshipCalculator [shape: rectangle, icon: users, color: red, title: "improvedRelationshipCalculator - Relationship Logic"]
ConnectedFamilyCollector [shape: rectangle, icon: network, color: green, title: "collectConnectedFamily - Family Group Logic"]

// Main Tree Page Flow
TreePage > FamilyTreeFlow: "Main Component"
FamilyTreeFlow > ReactFlowCanvas: "Tree Display Canvas"
FamilyTreeFlow > TopPanel: "Control Panel"
FamilyTreeFlow > ReactFlowControls: "Zoom/Pan Controls"
FamilyTreeFlow > ReactFlowMiniMap: "Tree Overview"
FamilyTreeFlow > ReactFlowBackground: "Grid Background"

// Top Panel Controls Flow
TopPanel > AddPersonButton: "Add Person Action"
TopPanel > ShareTreeButton: "Share Tree Action"
TopPanel > ShowUnrelatedToggle: "Toggle Unrelated People"
TopPanel > FitViewButton: "Center & Fit Tree View"

// Tree Canvas Flow
ReactFlowCanvas > PersonCardNodes: "Family Member Display"
PersonCardNodes > PersonCard: "Click Person Node"

// Button Actions Flow
FitViewButton > ReactFlowCanvas: "Center Tree View"
ShowUnrelatedToggle > ReactFlowCanvas: "Show/Hide Unrelated People"

// Modal Interactions
AddPersonButton > AddPersonModal: "Open Add Modal"
PersonCard > EditPersonModal: "Edit Person"
PersonCard > DeletePersonModal: "Delete Person"
ShareTreeButton > ShareModal: "Open Share Options"

// Data Processing Flow
FamilyTreeFlow > TreeLayoutEngine: "Calculate Node Positions"
FamilyTreeFlow > RelationshipCalculator: "Calculate Relationships"
FamilyTreeFlow > ConnectedFamilyCollector: "Group Family Members"

// Tree State Management
TreeLayoutEngine > ReactFlowCanvas: "Update Node Positions"
RelationshipCalculator > PersonCardNodes: "Display Relationships"
ConnectedFamilyCollector > ReactFlowCanvas: "Show/Hide Groups"
```

## Actual Family Tree Page Implementation

### ReactFlow Integration
- **@xyflow/react**: Professional tree visualization library
- **PersonCardNode**: Single node type for family member display (CustomNode removed)
- **Interactive Canvas**: Drag, zoom, pan functionality
- **MiniMap**: Overview of large family trees
- **Controls**: Built-in zoom and pan controls

### Cleanup Completed
- **Removed**: dagreLayout.js (unused alternative layout system)
- **Removed**: CustomNode.jsx (only used by unused dagreLayout)
- **Removed**: dagre and @types/dagre packages from dependencies
- **Cleaned**: Import statements and nodeTypes object in FamilyTreeFlow

### Top Panel Controls
- **Add Person**: Opens AddPersonModal for new family members
- **Share Tree**: Opens ShareModal with social sharing options
- **Show Unrelated**: Toggle to show/hide unrelated family members
- **Fit View**: Centers and fits the entire tree in view with proper padding

### Person Card Interactions
- **Click Node**: Shows PersonCard with person details
- **Edit Action**: Opens EditPersonModal for modifications
- **Delete Action**: Opens DeletePersonModal with confirmation
- **Profile Link**: Navigate to full Profile page

### Advanced Tree Features
- **Hierarchical Layout**: Automatic family tree positioning
- **Relationship Calculator**: Displays relationships (cousin, aunt, etc.)
- **Connected Family Groups**: Logical family grouping
- **Root Person Selection**: Choose tree starting point
- **Responsive Design**: Works on mobile and desktop

### Data Management
- **React Query**: Server state management
- **Real-time Updates**: Tree updates when data changes
- **Error Handling**: Graceful error states
- **Loading States**: Skeleton loaders for better UX

### Mobile Optimizations
- **Touch Interactions**: Mobile-friendly touch controls
- **Responsive Modals**: Mobile-optimized modal layouts
- **Gesture Support**: Pinch to zoom, drag to pan
- **Navbar Integration**: Handles mobile navbar overlays
