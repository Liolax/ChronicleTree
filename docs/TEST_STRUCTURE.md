# Chronicle Tree Test Structure

## Overview
This document describes the organized test structure for the Chronicle Tree application.

## Directory Structure

### Backend Tests
**Location**: `chronicle_tree_api/backend_tests/`
**Purpose**: Ruby-based backend functionality tests
**Files**:
- `test_validation.rb` - Input validation tests
- `test_age_logic.rb` - Age calculation logic tests  
- `test_edit_validation.rb` - Edit operation validation tests
- `test_step_relationships.rb` - Step relationship functionality tests
- `test_step_family.rb` - Step family data structure tests
- `test_deceased_logic.rb` - Deceased person logic tests
- `test_temporal_validation.rb` - Date/time validation tests

**Usage**: Run with `cd chronicle_tree_api && rails runner backend_tests/[test_file].rb`

### Frontend Tests  
**Location**: `chronicle_tree_client/frontend_tests/`
**Purpose**: JavaScript/Vitest-based frontend functionality tests
**Categories**:

#### Unit Tests (.test.js files)
- `RelationshipMergeLogic.test.js` - Relationship merging logic
- `comprehensive-relationship-test.test.js` - Comprehensive relationship calculations
- `comprehensiveRelationshipTest.test.js` - Alternative comprehensive tests
- `deceased-spouse-relationships.test.js` - Deceased spouse handling
- `deceasedSpouseRelationships.test.js` - Alternative deceased spouse tests
- `exSpouseRelativesHandling.test.js` - Ex-spouse relative handling
- `familyTreeLayout.test.js` - Family tree layout logic
- `genderNeutralNaming.test.js` - Gender-neutral naming tests
- `improvedRelationshipCalculator.test.js` - Relationship calculator tests
- `integration.test.js` - Integration tests
- `problemStatementVerification.test.js` - Problem statement verification
- `reverse-coparent-test.test.js` - Reverse co-parent relationship tests
- `sibling-relationships.test.js` - Sibling relationship tests
- `siblingRelationshipTest.test.js` - Alternative sibling tests
- `timeline-validation.test.js` - Timeline validation tests
- `uncleAuntRelationshipTest.test.js` - Uncle/aunt relationship tests

#### Manual/Debug Tests (.js files)
- `browser-console-test.js` - Browser console debugging
- `browser-test.js` - Browser-based testing
- `comprehensive-timeline-test.js` - Timeline comprehensive testing
- `deceased-spouse-test.js` - Manual deceased spouse testing
- `molly-relationship-test.js` - Specific relationship debugging
- `reverse-coparent-test.js` - Manual reverse co-parent testing
- `test-deceased-spouse-fix.js` - Deceased spouse fix testing
- `test-deceased-spouse-label-fix.js` - Deceased spouse label fixes
- `test-deceased-spouse-parents.js` - Deceased spouse parent handling
- `test-relationship-debug.js` - Relationship debugging utilities
- `test-step-death-validation.js` - Step relationship death validation
- `test-step-grandparents.js` - Step grandparent relationship tests
- `test-step-relationships.js` - Manual step relationship testing

#### HTML Test Files
- `direct-test.html` - Direct browser testing interface
- `relationship-test.html` - Relationship testing interface
- `sibling-test.html` - Sibling relationship testing interface
- `test-fix.html` - General fix testing interface
- `test-shared-parent-siblings.html` - Shared parent sibling testing

#### Integration Test Files (HTML)
- `alice-charlie-final-test.html` - Alice and Charlie relationship final testing
- `alice-charlie-relationship-test.html` - Alice and Charlie relationship testing
- `alice-charlie-test.html` - Alice and Charlie general testing
- `complete-frontend-test.html` - Complete frontend testing interface
- `comprehensive-sibling-test.html` - Comprehensive sibling relationship testing
- `frontend-seeds-test.html` - Frontend seed data testing
- `live-api-test.html` - Live API testing interface
- `rails-api-format-test.html` - Rails API format testing
- `real-seeds-test.html` - Real seed data testing

#### Component Tests
- `Login.test.jsx` - Login component testing

**Usage**: Run with `cd chronicle_tree_client && npm test`

### Debug Files
**Location**: `debug/`
**Purpose**: Debugging and development utilities organized by technology stack

#### Frontend Debug (`debug/frontend/`)
**Step Relationship Debug Files**:
- `debug-step.js` - Step relationship debugging utilities
- `debug-step-detailed.js` - Detailed step relationship analysis
- `test-relationship-debug.js` - Relationship debugging test utilities

**Relationship Calculation Debug**:
- `debug-actual-calc.cjs` - Actual calculation debugging (CommonJS)
- `debug-charlie-calc.cjs` - Charlie relationship calculations
- `debug-relationship-maps.cjs` - Relationship mapping utilities
- `debug-relationships.js` - General relationship debugging
- `debug-relationship-fix.js` - Relationship calculation fixes

**Character-Specific Debug**:
- `debug-charlie.js` - Charlie character debugging
- `debug-charlie-relationships.js` - Charlie's relationship analysis

**Data Format Debug**:
- `debug-api-format.cjs` - API data format debugging
- `debug_data_format.js` - Data format validation
- `debug_real_data.js` - Real data debugging utilities

**Browser Debug Interfaces**:
- `debug-relationship-test.html` - Browser-based relationship testing
- `test-api-debug.html` - API debugging interface
- `console-debug.js` - Browser console debugging utilities

#### Backend Debug (`debug/backend/`)
- `debug_relationships.rb` - Ruby relationship debugging
- `debug_siblings.rb` - Ruby sibling relationship debugging

**Usage**: 
- Frontend: `node debug/frontend/debug-step.js`
- Backend: `cd chronicle_tree_api && rails runner ../debug/backend/debug_relationships.rb`
- HTML interfaces: Open directly in browser

### Rails Standard Tests
**Location**: `chronicle_tree_api/test/`
**Purpose**: Standard Rails testing structure (controllers, models)
**Note**: These follow Rails conventions and remain in the standard location

## Import Structure

### Frontend Test Imports
All frontend tests now use consistent import paths:
```javascript
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator';
```

### Backend Test Includes
Backend tests include necessary Rails components:
```ruby
require_relative '../config/environment'
```

## Running Tests

### Backend
```bash
cd chronicle_tree_api
# Run specific custom test
rails runner backend_tests/test_validation.rb

# Run Rails test suite
rails test
```

### Frontend
```bash
cd chronicle_tree_client
# Run all tests
npm test

# Run specific test
npm test -- --run RelationshipMergeLogic.test.js

# Run tests in watch mode
npm test -- --watch
```

## Test Organization Benefits

1. **Consistency**: All test files are in dedicated directories
2. **Clarity**: Clear separation between backend and frontend tests
3. **Maintainability**: Easier to locate and update test files
4. **Scalability**: Room for growth in both test categories
5. **Convention**: Follows standard practices for both Rails and Vitest

## Notes

- Test files maintain their original functionality
- Import paths have been updated for the new structure
- HTML test files provide browser-based debugging interfaces
- Manual test files assist with debugging specific scenarios