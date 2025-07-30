# Frontend Tests

Organized test structure for ChronicleTree client application.

## Directory Structure

### `/components/`
Tests for React components:
- **Login.test.jsx**: Authentication component tests

### `/utils/`
Tests for utility functions:
- **improvedRelationshipCalculator.test.js**: Core relationship calculation logic
- **familyTreeLayout.test.js**: Tree layout algorithms
- **genderNeutralNaming.test.js**: Gender-neutral relationship naming

### `/integration/`
Integration and comprehensive tests:
- **comprehensive-relationship-test.test.js**: End-to-end relationship testing
- **integration.test.js**: Full application integration tests

### `/unit/`
Unit tests for specific functionality (empty - ready for future tests)

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- Login.test.jsx

# Run tests in watch mode
npm test -- --watch
```

## Test Guidelines

- Use descriptive test names
- Group related tests using `describe()` blocks
- Use `beforeEach()` for test setup
- Mock external dependencies
- Test both success and error cases

## Removed Files

The following debug/temporary files were cleaned up from the old `frontend_tests/` directory:
- 100+ debug scripts and temporary test files
- Backup files (.bak)
- HTML test files that should be in proper test framework
- Duplicate test files with similar functionality

For historical reference, see git history for the removed debugging files.