# Test Structure Documentation

## Overview
This document describes the organized test structure for the ChronicleTree project.

## Directory Structure

### Frontend Tests
```
chronicle_tree_client/
├── src/tests/                          # Unit tests (Vitest)
│   ├── *.test.js                       # JavaScript unit tests
│   ├── *.test.jsx                      # React component tests
│   └── README.md                       # This file
├── tests/                              # Integration and manual tests
│   ├── integration/                    # Integration tests (HTML)
│   │   ├── complete-frontend-test.html
│   │   ├── frontend-seeds-test.html
│   │   ├── comprehensive-sibling-test.html
│   │   ├── alice-charlie-test.html
│   │   ├── alice-charlie-relationship-test.html
│   │   ├── alice-charlie-final-test.html
│   │   ├── rails-api-format-test.html
│   │   ├── real-seeds-test.html
│   │   └── live-api-test.html
│   └── manual/                         # Manual test files
│       ├── relationship-test.html
│       ├── sibling-test.html
│       ├── test-fix.html
│       ├── test-shared-parent-siblings.html
│       ├── direct-test.html
│       ├── comprehensive-relationship-test.js
│       ├── reverse-coparent-test.js
│       ├── test_charlie_fix.js
│       └── test_fix.js
│   └── unit/                           # Unit test files (Vitest)
│       ├── improvedRelationshipCalculator.test.js
│       ├── genderNeutralNaming.test.js
│       ├── familyTreeLayout.test.js
│       ├── exSpouseRelativesHandling.test.js
│       ├── comprehensiveRelationshipTest.test.js
│       └── debugCollectConnectedFamily.test.js
└── public/                             # Static assets
    └── test.html                       # Public test file
```

### Backend Tests
```
chronicle_tree_api/
└── test/                               # Rails tests
    ├── controllers/                    # Controller tests
    │   └── api/v1/                    # API controller tests
    ├── models/                         # Model tests
    ├── integration/                    # Integration tests
    └── test_helper.rb                  # Test configuration
```

### Debug Files
```
debug/                                  # Debug and development files
├── debug-relationship-test.html        # Debug relationship tests
├── test-api-debug.html                # API debug tests
├── debug_data_format.js               # Data format debugging
└── debug_real_data.js                 # Real data debugging
```

## Test Types

### 1. Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and components in isolation
- **Framework**: Vitest
- **Files**: `*.test.js`, `*.test.jsx`
- **Run with**: `npm test`

#### Key Unit Test Files:
- `improvedRelationshipCalculator.test.js` - Core relationship calculation tests
- `genderNeutralNaming.test.js` - Gender-neutral naming tests
- `familyTreeLayout.test.js` - Family tree layout tests
- `exSpouseRelativesHandling.test.js` - Ex-spouse relatives handling tests
- `comprehensiveRelationshipTest.test.js` - Comprehensive relationship tests
- `debugCollectConnectedFamily.test.js` - Debug connected family tests

### 2. Integration Tests (`tests/integration/`)
- **Purpose**: Test complete workflows and API integration
- **Framework**: HTML + JavaScript (browser-based)
- **Files**: `*.html`
- **Run with**: Open in browser

#### Key Integration Tests:
- `complete-frontend-test.html` - Complete relationship calculator testing with visual dashboard
- `frontend-seeds-test.html` - Tests with Rails seed data format
- `comprehensive-sibling-test.html` - Comprehensive sibling relationship testing
- `alice-charlie-test.html` - Specific test for Alice-Charlie sibling bug
- `rails-api-format-test.html` - Rails API format compatibility tests
- `live-api-test.html` - Live API integration tests

### 3. Manual Tests (`tests/manual/`)
- **Purpose**: Manual testing and debugging with interactive tools
- **Framework**: HTML + JavaScript, Node.js scripts
- **Files**: `*.html`, `*.js`
- **Run with**: Open HTML files in browser, run JS files with Node.js

#### Key Manual Test Files:
- `relationship-test.html` - Interactive relationship testing
- `sibling-test.html` - Sibling relationship testing
- `test-fix.html` - Test relationship fixes
- `direct-test.html` - Direct relationship testing
- `comprehensive-relationship-test.js` - Comprehensive JS test script
- `reverse-coparent-test.js` - Reverse co-parent testing
- `test_charlie_fix.js` - Charlie-specific fix testing
- `test_fix.js` - General fix testing

### 4. Backend Tests (`chronicle_tree_api/`)
- **Purpose**: Test Rails API endpoints, models, and services
- **Framework**: Rails Test Framework
- **Files**: `*_test.rb`
- **Run with**: `rails test`

#### Backend Test Structure:
- `test/` - Standard Rails tests (models, controllers, helpers)
- `tests/manual/` - Manual testing scripts
- `tests/debug/` - Debug scripts for relationship calculations
- `tests/verify/` - Verification scripts for data integrity

See `chronicle_tree_api/tests/README.md` for detailed backend test documentation.

## Running Tests

### Frontend Unit Tests
```bash
cd chronicle_tree_client
npm test                    # Run all tests
npm test -- --watch       # Run tests in watch mode
npm test -- --coverage    # Run tests with coverage
```

### Frontend Integration Tests
1. Start the development server: `npm run dev`
2. Open any HTML file in `tests/integration/` in your browser
3. View results in browser console and on-screen

### Backend Tests
```bash
cd chronicle_tree_api
rails test                  # Run all tests
rails test test/models/     # Run model tests only
rails test test/controllers/ # Run controller tests only
```

## Test Coverage

### Relationship Calculator Tests
- ✅ Basic parent-child relationships
- ✅ Sibling relationships (including shared parent detection)
- ✅ Spouse relationships (current and ex)
- ✅ In-law relationships (parent, child, sibling)
- ✅ Co-parent-in-law relationships
- ✅ Great-grandparent relationships
- ✅ Uncle/aunt and nephew/niece relationships
- ✅ Cousin relationships (1st and 2nd)
- ✅ Gender-specific relationship terms
- ✅ Rails API format compatibility
- ✅ Edge cases and error handling

### Backend API Tests
- ✅ People CRUD operations
- ✅ Relationship CRUD operations
- ✅ Authentication and authorization
- ✅ Data validation
- ✅ Automatic sibling relationship creation

## Test Data

### Mock Data Structure
Tests use consistent mock data representing a family tree:
- John Doe & Jane Doe (parents)
- Alice A & Charlie C (siblings, children of John & Jane)
- David A (Alice's ex-husband)
- Michael A & Susan A (David's parents)
- Bob & Emily (Alice & David's children)
- Frank & Rose Doe (John's parents, great-grandparents)

### Rails Seed Data
Integration tests also use actual Rails seed data format to ensure compatibility.

## Best Practices

1. **Test Organization**: Keep unit tests in `src/tests/`, integration tests in `tests/integration/`
2. **Naming Convention**: Use `*.test.js` for unit tests, descriptive names for integration tests
3. **Test Structure**: Use `describe` and `it` blocks for clear test organization
4. **Assertions**: Use clear, descriptive assertions that explain what is being tested
5. **Mock Data**: Use consistent mock data across tests for predictable results
6. **Coverage**: Ensure both success and failure cases are tested

## Debugging

### Debug Files
Debug files are located in the `debug/` directory:
- Use for isolating specific issues
- Include detailed logging and step-by-step analysis
- Not part of the automated test suite

### Debug Process
1. Create debug file in `debug/` directory
2. Add specific test case for the issue
3. Include detailed logging
4. Once fixed, convert to proper unit test

## Contributing

When adding new tests:
1. Place unit tests in appropriate `src/tests/` subdirectory
2. Use proper naming convention (`*.test.js` or `*.test.jsx`)
3. Include both positive and negative test cases
4. Update this README if adding new test categories
5. Ensure tests are deterministic and don't depend on external state
