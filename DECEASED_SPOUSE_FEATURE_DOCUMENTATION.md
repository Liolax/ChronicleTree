# Deceased Spouse Feature Documentation

## Overview
The ChronicleTree relationship calculator now supports deceased spouse relationships, allowing users to properly track when a spouse has passed away while maintaining the ability to add new current spouses.

## Key Features

### 1. Deceased Spouse Logic
- **Current Spouse**: Living spouse (default state)
- **Ex-Spouse**: Divorced or separated spouse (`is_ex: true`)
- **Deceased Spouse**: Spouse who has passed away (`is_deceased: true`)

### 2. Business Rules
- A person can have **only one current spouse** at a time
- A person can have **multiple deceased spouses** (serial marriages)
- A person can have **multiple ex-spouses** (multiple divorces)
- **Deceased spouses do not prevent new marriages** (unlike current spouses)
- A spouse **cannot be both ex and deceased** simultaneously

### 3. Relationship Display
- **Current Spouse**: "Husband" / "Wife" / "Spouse"
- **Deceased Spouse**: "Husband (deceased)" / "Wife (deceased)" / "Spouse (deceased)"
- **Ex-Spouse**: "Ex-Husband" / "Ex-Wife" / "Ex-Spouse"

## Frontend Implementation

### Enhanced Relationship Calculator
The `improvedRelationshipCalculator.js` now includes:

```javascript
// Deceased spouse map for tracking deceased spouses
const deceasedSpouseMap = new Map();

// Spouse relationship parsing with deceased support
case 'spouse':
  if (rel.is_ex) {
    // Ex-spouse logic
  } else if (rel.is_deceased) {
    // Deceased spouse logic - new!
    deceasedSpouseMap.get(source).add(target);
    deceasedSpouseMap.get(target).add(source);
  } else {
    // Current spouse logic
  }
```

### Gender-Specific Deceased Labels
- **Male**: "Husband (deceased)"
- **Female**: "Wife (deceased)"  
- **Non-binary/Unknown**: "Spouse (deceased)"

## Backend Implementation

### Database Schema
```sql
-- Added to relationships table
ALTER TABLE relationships ADD COLUMN is_deceased BOOLEAN DEFAULT FALSE NOT NULL;
ADD INDEX index_relationships_on_type_and_deceased (relationship_type, is_deceased);
```

### Rails Model Updates
```ruby
# New scopes in Relationship model
scope :current_spouses, -> { where(relationship_type: "spouse", is_ex: false, is_deceased: false) }
scope :deceased_spouses, -> { where(relationship_type: "spouse", is_deceased: true) }
scope :ex_spouses, -> { where(relationship_type: "spouse", is_ex: true) }

# Updated validations
validate :only_one_current_spouse, if: -> { relationship_type == "spouse" && !is_ex && !is_deceased }
validate :spouse_status_exclusivity, if: -> { relationship_type == "spouse" }
```

### API Serialization
```ruby
# Updated RelationshipSerializer
attributes :id, :person_id, :relative_id, :relationship_type, :is_ex, :is_deceased
```

## Usage Examples

### Frontend Usage
```javascript
const testData = {
  people: [
    { id: 'john', first_name: 'John', gender: 'Male' },
    { id: 'jane', first_name: 'Jane', gender: 'Female' },
    { id: 'mary', first_name: 'Mary', gender: 'Female' }
  ],
  relationships: [
    // Jane is John's deceased spouse
    { source: 'john', target: 'jane', type: 'spouse', is_deceased: true },
    
    // Mary is John's current spouse (remarried after Jane's death)
    { source: 'john', target: 'mary', type: 'spouse' }
  ]
};

// Results:
// John -> Jane: "Wife (deceased)"
// John -> Mary: "Wife"
// Mary -> Jane: "Unrelated" (ex-spouse relative logic)
```

### Backend Usage
```ruby
# Create deceased spouse relationship
Relationship.create!(
  person: john,
  relative: jane,
  relationship_type: 'spouse',
  is_deceased: true
)

# Create new current spouse (allowed after deceased spouse)
Relationship.create!(
  person: john,
  relative: mary,
  relationship_type: 'spouse'
)

# Query examples
john.relationships.current_spouses    # Returns Mary
john.relationships.deceased_spouses   # Returns Jane
john.relationships.ex_spouses         # Returns any divorced spouses
```

## Migration Instructions

### 1. Database Migration
```bash
# Run the migration
rails db:migrate

# The migration adds:
# - is_deceased column (boolean, default: false)
# - Performance index for spouse queries
```

### 2. Frontend Update
The relationship calculator automatically detects and handles `is_deceased` fields in relationship data. No additional frontend changes required.

### 3. Data Migration (if needed)
```ruby
# If you have existing data that needs to be marked as deceased
# Run in Rails console:

# Example: Mark Jane Doe as deceased spouse of John Doe
john = Person.find_by(first_name: 'John', last_name: 'Doe')
jane = Person.find_by(first_name: 'Jane', last_name: 'Doe')

relationships = Relationship.where(
  person: [john, jane],
  relative: [john, jane],
  relationship_type: 'spouse'
)

relationships.update_all(is_deceased: true)
```

## User Interface Considerations

### Profile Display
- **John's Profile**: Shows Jane as "Wife (deceased)" and Mary as "Wife"
- **Jane's Profile**: Shows John as "Husband (deceased)" 
- **Mary's Profile**: Shows John as "Husband", Jane as "Unrelated"

### Add Spouse Functionality
- **With Current Spouse**: "Add Spouse" option disabled
- **With Deceased Spouse**: "Add Spouse" option available
- **With Ex-Spouse**: "Add Spouse" option available

### Family Tree Display
- **Visual Indicator**: Consider adding visual markers for deceased relationships
- **Connection Lines**: Different line styles for current vs deceased vs ex relationships

## Testing

### Frontend Tests
- 11 comprehensive test cases covering all deceased spouse scenarios
- Gender-specific labeling verification  
- Multiple spouse type handling
- Step-parent relationship validation

### Backend Tests
- Model validation testing
- Scope functionality verification
- Reciprocal relationship synchronization
- Business rule enforcement

## Benefits

1. **Accurate Family History**: Properly represents deceased family members
2. **Remarriage Support**: Allows new marriages after spouse death
3. **Historical Accuracy**: Maintains complete relationship timeline
4. **User-Friendly**: Clear visual indicators and intuitive labeling
5. **Data Integrity**: Robust validation prevents invalid relationship states

## Future Enhancements

1. **Death Date Tracking**: Add date fields for when relationships ended
2. **Cause of Relationship End**: Track whether relationship ended by death, divorce, etc.
3. **Memorial Features**: Special UI features for deceased family members
4. **Timeline Integration**: Show relationship status changes over time
5. **Notification System**: Alert users when marking relationships as deceased
