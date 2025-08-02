# ChronicleTree Professional Diagrams

This directory contains professional diagrams for the ChronicleTree project using PlantUML and Eraser.io formats.

## PlantUML Diagrams (.puml files)

### Prerequisites
- Install PlantUML: https://plantuml.com/download
- Or use online editor: https://www.plantuml.com/plantuml/uml/

### Available Diagrams

1. **System Architecture Overview** (`system_architecture_overview.puml`)
   - Complete system architecture showing client-server separation
   - Technologies and their interactions
   - Data flow between components

2. **Deployment Architecture** (`deployment_architecture.puml`)
   - Development vs Production environments
   - Infrastructure components and scaling
   - Load balancing and redundancy

3. **Technology Stack** (`technology_stack.puml`)
   - Frontend and backend technologies
   - Development and deployment tools
   - Technology relationships and dependencies

4. **API Architecture Overview** (`api_architecture_overview.puml`)
   - High-level API structure and relationships
   - API group interactions and dependencies
   - Data flow between API categories

5. **API Endpoints - Detailed by Category**:
   - **Authentication APIs** (`api_authentication_endpoints.puml`) - User auth and account management
   - **People Management APIs** (`api_people_endpoints.puml`) - Family member CRUD operations
   - **Relationship APIs** (`api_relationships_endpoints.puml`) - Family relationship management
   - **Media Management APIs** (`api_media_endpoints.puml`) - File upload and media handling
   - **Timeline & Facts APIs** (`api_timeline_facts_endpoints.puml`) - Life events and custom data
   - **Tree Operations APIs** (`api_tree_operations_endpoints.puml`) - Tree visualization and sharing
   - **Search & Discovery APIs** (`api_search_endpoints.puml`) - Search and AI-powered suggestions

6. **User Workflow** (`user_workflow.puml`)
   - User journey from registration to advanced features
   - Decision points and process flows
   - Progressive feature adoption

7. **Database Schema Design** (`database_schema_design.puml`)
   - Complete database entity relationships
   - Primary and foreign key relationships
   - Data types and constraints

8. **Relationship Types Supported** (`relationship_types_supported.puml`)
   - All supported family relationship types
   - Relationship validation rules
   - Gender-specific terminology

### How to Generate Images from PlantUML

#### Method 1: Command Line
```bash
# Install PlantUML
brew install plantuml  # macOS
# or
sudo apt-get install plantuml  # Ubuntu

# Generate PNG images
plantuml -tpng *.puml

# Generate SVG images (recommended for web)
plantuml -tsvg *.puml
```

#### Method 2: Online Editor
1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy and paste the content of any .puml file
3. Click "Submit" to generate the diagram
4. Right-click and save the image

#### Method 3: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any .puml file
3. Press `Alt+D` to preview
4. Use `Ctrl+Shift+P` → "PlantUML: Export Current Diagram" to save

## Eraser.io Diagrams (.md files)

### Prerequisites
- Visit https://app.eraser.io/
- Create a free account

### Available Diagrams

1. **System Architecture Eraser** (`system_architecture_eraser.md`)
   - Interactive system architecture diagram
   - Cloud-based components with icons
   - Modern visual representation

2. **User Workflow Eraser** (`user_workflow_eraser.md`)
   - User journey with decision points
   - Interactive workflow visualization
   - Step-by-step process mapping

3. **Technology Stack Eraser** (`technology_stack_eraser.md`)
   - Technology stack with relationships
   - Interactive component connections
   - Detailed technology descriptions

4. **Deployment Architecture Eraser** (`deployment_architecture_eraser.md`)
   - Production deployment visualization
   - Infrastructure components and scaling
   - Cloud architecture representation

5. **Database Schema Design Eraser** (`database_schema_design_eraser.md`)
   - Complete database entity relationship diagram
   - Interactive table relationships with foreign keys
   - Polymorphic associations and constraints

### How to Use Eraser.io Diagrams

1. **Create New Diagram**
   - Go to https://app.eraser.io/
   - Click "New Diagram"
   - Select "Cloud Architecture" or "Flowchart" template

2. **Import Code**
   - Copy the content from any `*_eraser.md` file
   - Paste it into the Eraser.io editor
   - The diagram will auto-generate

3. **Customize**
   - Modify colors, icons, and layouts as needed
   - Add additional components or connections
   - Export as PNG, SVG, or PDF

4. **Share and Collaborate**
   - Generate shareable links
   - Collaborate in real-time
   - Export for documentation

## Integration with Documentation

### Updating the Project Specification

Replace the placeholder figure references in `refined_project_spec.md` with actual diagram images:

```markdown
**Figure 3.1.1: System Architecture Overview**
![System Architecture](diagrams/system_architecture_overview.svg)

**Figure 3.2.1: Deployment Architecture Diagram**
![Deployment Architecture](diagrams/deployment_architecture.svg)

**Figure 3.3.1: Technology Stack Diagram**
![Technology Stack](diagrams/technology_stack.svg)

**Figure 3.5.1: API Endpoints Structure**
![API Endpoints](diagrams/api_endpoints_structure.svg)

**Figure 4.1.1: User Workflow**
![User Workflow](diagrams/user_workflow.svg)

**Figure 4.2.1: Database Schema Design**
![Database Schema](diagrams/database_schema_design.svg)

**Figure 4.4.1: Relationship Types Supported**
![Relationship Types](diagrams/relationship_types_supported.svg)

**Figure 5.2.1: Relationship Types Supported**
![Relationship Types](diagrams/relationship_types_supported.svg)
```

## Best Practices

### PlantUML Tips
- Use themes (`!theme aws-orange`) for professional appearance
- Add notes for additional context
- Use proper entity relationships in database diagrams
- Include legends for complex diagrams

### Eraser.io Tips
- Use consistent color schemes across diagrams
- Include descriptive labels for components
- Leverage icons for better visual communication
- Export in SVG format for scalability

### Documentation Integration
- Generate diagrams in SVG format for web documentation
- Use PNG for print documentation
- Maintain source files for future updates
- Version control diagram source code

## Maintenance

### Updating Diagrams
1. Modify the source `.puml` or `.md` files
2. Regenerate images using the methods above
3. Update documentation references
4. Commit both source and generated files

### Adding New Diagrams
1. Create new source file in appropriate format
2. Follow naming conventions
3. Update this README
4. Add references in project documentation

## Troubleshooting

### PlantUML Issues
- Ensure Java is installed for command-line usage
- Check syntax using online editor first
- Use simple themes if rendering fails

### Eraser.io Issues
- Check internet connection for online editor
- Verify syntax using provided examples
- Clear browser cache if diagrams don't load

## File Structure
```
diagrams/
├── README.md (this file)
├── PlantUML Diagrams/
│   ├── system_architecture_overview.puml
│   ├── deployment_architecture.puml
│   ├── technology_stack.puml
│   ├── api_architecture_overview.puml
│   ├── api_authentication_endpoints.puml
│   ├── api_people_endpoints.puml
│   ├── api_relationships_endpoints.puml
│   ├── api_media_endpoints.puml
│   ├── api_timeline_facts_endpoints.puml
│   ├── api_tree_operations_endpoints.puml
│   ├── api_search_endpoints.puml
│   ├── user_workflow.puml
│   ├── database_schema_design.puml
│   └── relationship_types_supported.puml
└── Eraser.io Diagrams/
    ├── system_architecture_eraser.md
    ├── user_workflow_eraser.md
    ├── technology_stack_eraser.md
    ├── deployment_architecture_eraser.md
    └── database_schema_design_eraser.md
```
