# Chronicle Tree Debug Files

## Overview
This directory contains all debugging and development helper files for the Chronicle Tree application, organized by technology stack.

## Directory Structure

### 📁 frontend/
JavaScript, CommonJS, and HTML files for frontend debugging.

#### Step Relationship Debug Files
- `debug-step.js` - Step relationship debugging utilities
- `debug-step-detailed.js` - Detailed step relationship analysis
- `test-relationship-debug.js` - Relationship debugging test utilities

#### Relationship Calculation Debug
- `debug-actual-calc.cjs` - Actual calculation debugging (CommonJS)
- `debug-charlie-calc.cjs` - Charlie relationship calculations
- `debug-relationship-maps.cjs` - Relationship mapping utilities
- `debug-relationships.js` - General relationship debugging
- `debug-relationship-fix.js` - Relationship calculation fixes

#### Character-Specific Debug
- `debug-charlie.js` - Charlie character debugging
- `debug-charlie-relationships.js` - Charlie's relationship analysis

#### Data Format Debug
- `debug-api-format.cjs` - API data format debugging
- `debug_data_format.js` - Data format validation
- `debug_real_data.js` - Real data debugging utilities

#### Browser Debug Interfaces
- `debug-relationship-test.html` - Browser-based relationship testing
- `test-api-debug.html` - API debugging interface
- `console-debug.js` - Browser console debugging utilities

### 📁 backend/
Ruby files for backend debugging.

#### Rails Debug Files
- `debug_relationships.rb` - Ruby relationship debugging
- `debug_siblings.rb` - Ruby sibling relationship debugging

## Usage

### Frontend Debug Files
```bash
# For Node.js files
node debug/frontend/debug-step.js

# For CommonJS modules
node debug/frontend/debug-actual-calc.cjs

# For HTML interfaces - open in browser
open debug/frontend/debug-relationship-test.html
```

### Backend Debug Files
```bash
cd chronicle_tree_api
rails runner ../debug/backend/debug_relationships.rb
```

## File Categories

### 🔧 Step Relationship Debugging
- Focus on step-parent, step-child, step-sibling relationships
- Located in: `debug-step.js`, `debug-step-detailed.js`

### 🔍 Relationship Calculation
- Debugging relationship calculation algorithms
- Files: `debug-*-calc.*`, `debug-relationship-*.js`

### 🧪 Data Format Testing
- API data format validation and debugging
- Files: `debug-*-format.*`, `debug_data_format.js`

### 🌐 Browser Testing
- Interactive debugging interfaces
- Files: `*.html`, `console-debug.js`

### 👤 Character-Specific
- Debugging specific family member calculations
- Files: `debug-charlie*`

## Notes

- All debug files are excluded from production builds
- HTML debug files provide interactive testing interfaces
- CommonJS files (`.cjs`) can be run directly with Node.js
- Ruby debug files should be run from the Rails API directory

## Organization Benefits

1. **Centralized**: All debug files in one location
2. **Categorized**: Frontend and backend clearly separated
3. **Discoverable**: Easy to find relevant debug tools
4. **Maintainable**: Consistent organization pattern
5. **Scalable**: Room for additional debug categories

## Development Workflow

1. **Frontend Issues**: Check `debug/frontend/` for relevant tools
2. **Backend Issues**: Check `debug/backend/` for Ruby debugging
3. **Relationship Bugs**: Use step relationship debug files
4. **Data Issues**: Use format debugging utilities
5. **Interactive Testing**: Use HTML debug interfaces