# Backend Tests

This directory contains organized backend tests for the Chronicle Tree API.

## Directory Structure

### `/rails_tests/`
Standard Rails tests including controllers, models, and fixtures.
- **Controllers**: API endpoint tests
- **Models**: Model validation and behavior tests  
- **Fixtures**: Test data
- **Integration**: Integration tests
- **Mailers**: Email functionality tests

### `/relationship_tests/`
Tests focused on family relationship logic and calculations.
- Comprehensive relationship testing
- Sibling relationship validation
- Gender-neutral relationship labels
- Profile relationship display tests

### `/step_relationship_tests/`
Specialized tests for step-family relationships.
- Step-sibling detection and analysis
- Step-grandparent relationships
- Step-family hierarchy validation

### `/validation_tests/`
Tests for data validation logic.
- Age validation
- Deceased logic validation

### `/debug_scripts/`
Utility scripts for debugging and fixing data issues.
- **fix_relationships.rb**: Script to fix bidirectional relationship issues
- **fix_sibling_relationships.rb**: Script to correct sibling relationships
- **fix_michael_step_relationship.rb**: Step-relationship debugging
- Various other relationship debugging utilities

## Test Files in Root Directory

### `test_extended_family.rb`
Test script for creating and testing extended family data across 4-5 generations. Used for comprehensive family tree testing.
- Deceased status logic
- Temporal validation
- Edit validation

### `/api_tests/`
API endpoint integration tests.
- API response validation
- Endpoint functionality tests

### `/integration_tests/`
End-to-end integration tests.
- Image generation tests
- Profile sharing functionality
- Full workflow testing

### `/debug_scripts/`
Debugging and data maintenance scripts.
- Relationship fixing scripts
- Data analysis tools
- Database maintenance utilities

### `/verification_tests/`
Data integrity and verification tests.
- Family structure validation
- Data consistency checks
- Parentage verification

## Running Tests

### Rails Tests
```bash
# Run all Rails tests
cd chronicle_tree_api
rails test backend_tests/rails_tests/

# Run specific test
rails test backend_tests/rails_tests/models/person_test.rb
```

### Debug Scripts
```bash
# Run from the API root directory
cd chronicle_tree_api
ruby backend_tests/debug_scripts/list_people.rb
```

### Other Tests
```bash
# Run individual test files
cd chronicle_tree_api
ruby backend_tests/relationship_tests/comprehensive_relationship_test.rb
```

## Notes

- All test files have been updated with correct require paths (`../../config/environment`)
- Debug output has been cleaned up while preserving essential functionality
- Tests are organized by functionality for better maintainability