# Frontend Tests

Organized test suite for Chronicle Tree frontend application.

## Structure

```
frontend_tests/
   unit/                    # Unit tests for individual components/functions
      components/         # React component tests
      utils/             # Utility function tests  
      services/          # Service layer tests
   integration/            # Integration tests
      api/               # API integration tests
      relationships/     # Family relationship calculation tests
      tree/              # Tree visualization tests
   e2e/                   # End-to-end tests
   acceptance/            # User acceptance tests
   performance/           # Performance tests
   manual/                # Manual testing tools
       browser/           # Browser console tests & HTML test pages
       debug/             # Debug scripts and tools
```

## Test Types

### Unit Tests
- **Components**: Test individual React components in isolation
- **Utils**: Test utility functions and helpers
- **Services**: Test API services and data processing

### Integration Tests
- **API**: Test frontend-backend API integration
- **Relationships**: Test family relationship calculation logic
- **Tree**: Test tree visualization and layout algorithms

### Manual Tests
- **Browser**: HTML test pages and browser console scripts
- **Debug**: Debugging tools and data validation scripts

## Running Tests

```bash
# Run all tests
npm test

# Run specific test category
npm test unit
npm test integration

# Run tests in watch mode
npm test -- --watch
```

## Adding New Tests

1. **Unit tests**: Place in appropriate `unit/` subdirectory
2. **Integration tests**: Place in appropriate `integration/` subdirectory  
3. **Manual tools**: Place in `manual/debug/` or `manual/browser/`

Follow naming convention: `*.test.js` or `*.spec.js`