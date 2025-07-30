# Temporal Validation for Parent-Child Relationships

## Changes Implemented

### 1. Frontend Text Updates
- Changed "Related Person" to "Selected Person" throughout the UI
- Updated error messages to use "Selected Person" terminology
- Files modified:
  - `src/components/Forms/PersonForm.jsx`
  - `src/components/Tree/modals/AddPersonModal.jsx`

### 2. Frontend Validation
Added temporal validation in `PersonForm.jsx` that prevents adding children to deceased parents when the child's birth date is after the parent's death date:

```javascript
// Temporal validation for parent-child relationships
const relationType = watch('relationType');
const relatedPersonId = watch('relatedPersonId');

if (value && relationType === 'child' && relatedPersonId) {
  const selectedPerson = filteredPeople.find(p => String(p.id) === String(relatedPersonId));
  if (selectedPerson && selectedPerson.date_of_death) {
    const birthDate = new Date(value);
    const parentDeathDate = new Date(selectedPerson.date_of_death);
    if (birthDate > parentDeathDate) {
      return `Cannot add child born after parent's death (${selectedPerson.first_name} ${selectedPerson.last_name} died ${selectedPerson.date_of_death})`;
    }
  }
}
```

### 3. Backend Validation
Added server-side temporal validation in `people_controller.rb` to prevent impossible parent-child relationships:

```ruby
# TEMPORAL VALIDATION: Prevent impossible parent-child relationships
if rel_type == 'child' && related_person.date_of_death.present? && person.date_of_birth.present?
  parent_death_date = Date.parse(related_person.date_of_death.to_s)
  child_birth_date = Date.parse(person.date_of_birth.to_s)
  
  if child_birth_date > parent_death_date
    render json: { 
      errors: [
        "Cannot add child born after parent's death. #{related_person.first_name} #{related_person.last_name} died on #{parent_death_date.strftime('%B %d, %Y')}, but child was born on #{child_birth_date.strftime('%B %d, %Y')}."
      ] 
    }, status: :unprocessable_entity
    raise ActiveRecord::Rollback
  end
end
```

## Validation Logic

### What's Validated
- **Parent-Child Relationships**: Prevents adding a child to a deceased parent when the child's birth date is after the parent's death date
- **Timeline Logic**: Ensures chronological accuracy in family tree relationships

### What's Allowed
- ✅ Adding children to living parents (any birth date)
- ✅ Adding children to deceased parents if child was born before the parent's death
- ✅ All other relationship types (spouse, sibling, parent) without temporal restrictions

### Error Messages
- **Frontend**: "Cannot add child born after parent's death (Parent Name died YYYY-MM-DD)"
- **Backend**: "Cannot add child born after parent's death. Parent Name died on Month DD, YYYY, but child was born on Month DD, YYYY."

## Example Scenarios

### ✅ Valid Case
- Jane Smith: Born 1970, Died January 1, 2022
- Alice Smith: Born June 15, 2020
- **Result**: Relationship allowed (Alice born before Jane's death)

### ❌ Invalid Case  
- Jane Smith: Born 1970, Died January 1, 2022
- Michael Doe: Born August 15, 2024
- **Result**: Validation error (Michael born 2+ years after Jane's death)

## Benefits

1. **Chronological Accuracy**: Prevents impossible family relationships that violate temporal logic
2. **Data Integrity**: Ensures family tree data remains realistic and accurate
3. **User Experience**: Provides clear error messages explaining why a relationship cannot be created
4. **Consistency**: Aligns with the existing timeline validation implemented for step-relationships

## Files Modified

### Frontend
- `src/components/Forms/PersonForm.jsx` - Added temporal validation and text updates
- `src/components/Tree/modals/AddPersonModal.jsx` - Updated error message text

### Backend  
- `app/controllers/api/v1/people_controller.rb` - Added temporal validation and text updates

### Test Files
- `test_temporal_validation.rb` - Verification script for the validation logic

This implementation ensures that family trees maintain temporal consistency while providing clear feedback to users when they attempt to create impossible relationships.
