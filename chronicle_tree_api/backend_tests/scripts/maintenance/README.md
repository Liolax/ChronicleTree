# ChronicleTree API Tests

## Directory Structure

### `/test/` - Rails Unit Tests
- **Location**: `test/`
- **Purpose**: Standard Rails test suite (minitest)
- **Files**: 
  - `test/models/` - Model tests
  - `test/controllers/` - Controller tests
  - `test/test_helper.rb` - Test configuration
- **Run**: `rails test`

### `/tests/manual/` - Manual Testing Scripts
- **Location**: `tests/manual/`
- **Purpose**: Manual testing scripts for relationship calculations
- **Files**:
  - `test_api_format.rb` - Test API data format
  - `test_charlie_relationships.rb` - Test Charlie's relationships
  - `api_data_test.rb` - Test API data integrity
- **Run**: `ruby tests/manual/filename.rb`

### `/tests/debug/` - Debug Scripts
- **Location**: `tests/debug/`
- **Purpose**: Debug scripts for relationship calculations
- **Files**:
  - `debug_siblings.rb` - Debug sibling relationships
  - `debug_relationships.rb` - Debug relationship calculations
- **Run**: `ruby tests/debug/filename.rb`

### `/tests/verify/` - Verification Scripts
- **Location**: `tests/verify/`
- **Purpose**: Verification scripts for data integrity
- **Files**:
  - `verify_fix.rb` - Verify relationship fixes
  - `verify_api_data.rb` - Verify API data consistency
- **Run**: `ruby tests/verify/filename.rb`

## Running Tests

### Unit Tests (Standard Rails)
```bash
# Run all tests
rails test

# Run specific test file
rails test test/models/relationship_test.rb

# Run specific test method
rails test test/models/relationship_test.rb::test_sibling_relationships
```

### Manual Testing Scripts
```bash
# Run manual tests
ruby tests/manual/test_api_format.rb
ruby tests/manual/test_charlie_relationships.rb
ruby tests/manual/api_data_test.rb
```

### Debug Scripts
```bash
# Run debug scripts
ruby tests/debug/debug_siblings.rb
ruby tests/debug/debug_relationships.rb
```

### Verification Scripts
```bash
# Run verification scripts
ruby tests/verify/verify_fix.rb
ruby tests/verify/verify_api_data.rb
```

## Test Coverage

### Relationship Calculator Tests
- **Frontend**: See `../chronicle_tree_client/tests/` for frontend tests
- **Backend**: Manual tests in `tests/manual/` verify API data format
- **Integration**: Debug scripts help verify end-to-end functionality

### Model Tests
- **People**: Test person creation, validation, relationships
- **Relationships**: Test relationship creation, sibling detection
- **Users**: Test authentication, authorization

### Controller Tests
- **API V1**: Test all API endpoints
- **Authentication**: Test login/logout, JWT tokens
- **Relationships**: Test relationship CRUD operations

## Debugging

### Relationship Issues
1. Use `debug_relationships.rb` to inspect relationship data
2. Use `debug_siblings.rb` to verify sibling detection
3. Use `verify_fix.rb` to confirm fixes are working

### API Data Issues
1. Use `verify_api_data.rb` to check data consistency
2. Use `api_data_test.rb` to test API responses
3. Use `test_api_format.rb` to verify data format

## Maintenance

### Adding New Tests
1. **Unit Tests**: Add to `test/` directory following Rails conventions
2. **Manual Tests**: Add to `tests/manual/` for manual verification
3. **Debug Scripts**: Add to `tests/debug/` for debugging specific issues
4. **Verification**: Add to `tests/verify/` for data integrity checks

### Test Documentation
- Update this README when adding new test categories
- Document test purpose and expected outcomes
- Include instructions for running tests
