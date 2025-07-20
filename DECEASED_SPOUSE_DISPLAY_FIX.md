# Fixed: Deceased Spouse Relationship Display Issue

## Problem
When Jane (deceased) was the root person in the family tree, her husband John showed as "Late Husband" instead of "Husband" on nodes and person cards.

## Root Cause
The `improvedRelationshipCalculator.js` was always applying the "Late" prefix when detecting deceased spouse relationships, regardless of which person was the root (perspective).

## Solution
Updated the deceased spouse relationship logic to check who is the root person:

### Before (Incorrect):
```js
// Always returned "Late Husband/Wife" for deceased spouse relationships
if (deceasedSpouseMap.has(rootId) && deceasedSpouseMap.get(rootId).has(personId)) {
  return getGenderSpecificRelation(personId, 'Late Husband', 'Late Wife', allPeople, 'Late Spouse');
}
```

### After (Correct):
```js
// Check if root person is deceased to determine proper prefix
if (deceasedSpouseMap.has(rootId) && deceasedSpouseMap.get(rootId).has(personId)) {
  const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
  const rootIsDeceased = rootPerson && (rootPerson.date_of_death || rootPerson.is_deceased);
  
  if (rootIsDeceased) {
    // Root is deceased, so person is just their "Husband/Wife" (not "Late")
    return getGenderSpecificRelation(personId, 'Husband', 'Wife', allPeople, 'Spouse');
  } else {
    // Root is living, so person is their "Late Husband/Wife"
    return getGenderSpecificRelation(personId, 'Late Husband', 'Late Wife', allPeople, 'Late Spouse');
  }
}
```

## Result
✅ **From Jane's perspective** (deceased): John shows as "Husband"
✅ **From John's perspective** (living): Jane shows as "Late Wife"

## Updated Tests
- Fixed test expectations to match the corrected behavior
- Updated format from "Deceased Wife" to "Late Wife" to match implementation
- Ensured deceased person's perspective shows spouse without "Late" prefix

## Files Changed
1. `src/utils/improvedRelationshipCalculator.js` - Fixed the relationship calculation logic
2. `tests/unit/deceased-spouse-relationships.test.js` - Updated test expectations

This fix ensures that relationship labels are shown from the correct perspective, making the family tree more intuitive and accurate for users viewing deceased family members' profiles.
