# Backend Tests

Organized test suite for Chronicle Tree Rails API backend.

## Structure

```
backend_tests/
├── unit/                      # Unit tests for individual classes/modules
│   ├── models/               # ActiveRecord model tests
│   ├── services/             # Service object tests
│   ├── controllers/          # Controller unit tests
│   ├── test_person_26.rb     # Test script for person ID 26 operations
│   └── test_molly_fix.rb     # Test script for deceased spouse marriage fix
├── integration/              # Integration tests
│   ├── api/                  # API endpoint integration tests
│   ├── relationships/        # Family relationship logic tests
│   └── image_generation/     # Share image generation tests
├── system/                   # System-level tests
│   ├── end_to_end/          # Full system workflow tests
│   └── performance/         # Performance and load tests
├── fixtures/                 # Test data and sample families
│   ├── test_data/           # Rails fixtures (YAML)
│   └── sample_families/     # Sample family structures
└── scripts/                 # Utility scripts
    ├── debug/               # Debugging and data analysis scripts
    ├── maintenance/         # Data verification and cleanup scripts
    ├── setup/               # Test environment setup scripts
    ├── debug_molly_fix.rb   # Debug script for Molly/Robert marriage issue
    ├── debug_molly.rb       # Script to understand Molly/Robert relationship status
    ├── debug_api_call.rb    # Debug specific API call failures
    ├── direct_ownership_fix.rb # Direct database fix for user ownership issues
    ├── investigate_person_26.rb # Investigation script for person ID 26 issues
    └── investigate_500_error.rb # Investigation script for 500 error causes
```

## Test Types

### Unit Tests
- **Models**: Test ActiveRecord models, validations, associations
- **Services**: Test service objects and business logic
- **Controllers**: Test controller actions and responses

### Integration Tests  
- **API**: Test complete API request/response cycles
- **Relationships**: Test family relationship calculation algorithms
- **Image Generation**: Test share image creation and processing

### System Tests
- **End-to-End**: Test complete user workflows
- **Performance**: Test system performance and scalability

### Scripts
- **Debug**: Tools for debugging relationship issues
- **Maintenance**: Scripts for data verification and cleanup
- **Setup**: Scripts for test environment configuration

## Running Tests

```bash
# Run all tests
rails test

# Run specific test categories
rails test test/unit/models
rails test test/integration/api

# Run specific test file
rails test test/unit/models/person_test.rb

# Run with coverage
COVERAGE=true rails test
```

## Adding New Tests

1. **Unit tests**: Place in appropriate `unit/` subdirectory
2. **Integration tests**: Place in appropriate `integration/` subdirectory
3. **Scripts**: Place in appropriate `scripts/` subdirectory

Follow Rails naming conventions: `*_test.rb` for test files.

## Test Environment

- Uses Rails test database
- Fixtures loaded from `fixtures/test_data/`
- Test helper located at `unit/test_helper.rb`