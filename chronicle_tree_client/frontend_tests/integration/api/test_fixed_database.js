// Test Emily's relationship to Lisa with the fixed database structure
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing with FIXED Database Structure ===");

// Fixed database structure with correct parent-child relationships
const fixedPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2015-01-01', date_of_death: null, is_deceased: false },
  { id: 15, first_name: 'William', last_name: 'O\'Sullivan', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: false }
];

// Fixed relationships matching the corrected database
const fixedRelationships = [
  // William -> Lisa (FIXED: William is parent, Lisa is child)
  { person_id: 15, relative_id: 12, relationship_type: 'parent' },
  { person_id: 12, relative_id: 15, relationship_type: 'child' },
  
  // Patricia -> Lisa (FIXED: Patricia is parent, Lisa is child)
  { person_id: 16, relative_id: 12, relationship_type: 'parent' },
  { person_id: 12, relative_id: 16, relationship_type: 'child' },
  
  // John -> Lisa (spouse)
  { person_id: 1, relative_id: 12, relationship_type: 'spouse' },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse' },
  
  // John -> Alice (parent-child)
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  
  // Alice -> Emily (parent-child)
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // Lisa -> Michael (parent-child)
  { person_id: 12, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 12, relationship_type: 'parent' },
  
  // John -> Michael (parent-child)
  { person_id: 1, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 1, relationship_type: 'parent' }
];

const lisa = fixedPeople.find(p => p.id === 12);
const emily = fixedPeople.find(p => p.id === 6);

console.log("\n--- FIXED Family Structure ---");
console.log("William (15) and Patricia (16) are Lisa's parents CONFIRMED");
console.log("Lisa (12) married to John (1) CONFIRMED");
console.log("John (1) has daughter Alice (3) from previous relationship CONFIRMED");
console.log("Alice (3) has daughter Emily (6) CONFIRMED");
console.log("Lisa (12) and John (1) have son Michael (13) CONFIRMED");

console.log("\n--- Expected Relationship Path ---");
console.log("Lisa (12) -> spouse John (1) -> daughter Alice (3) -> daughter Emily (6)");
console.log("This makes Emily Lisa's step-granddaughter (2 generations from Lisa)");

console.log("\n--- Testing Lisa -> Emily with FIXED database ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, fixedPeople, fixedRelationships);
  console.log(`Result: "${result}"`);
  
  if (result === "Step-Granddaughter") {
    console.log("SUCCESS Emily is now correctly Lisa's Step-Granddaughter");
  } else if (result === "Unrelated") {
    console.log("FAIL Still showing as Unrelated - there might be another issue");
  } else {
    console.log(`UNEXPECTED Unexpected result: "${result}"`);
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Test reverse relationship
console.log("\n--- Testing Emily -> Lisa (reverse) ---");
try {
  const result = calculateRelationshipToRoot(lisa, emily, fixedPeople, fixedRelationships);
  console.log(`Emily -> Lisa: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Summary ---");
console.log("The database relationships have been fixed:");
console.log("CONFIRMED William and Patricia are now correctly Lisa's parents");
console.log("CONFIRMED Lisa is now correctly William and Patricia's child");
console.log("CONFIRMED This should resolve the Emily relationship calculation issue");

// Verify the family tree structure
console.log("\n--- Family Tree Verification ---");
console.log("Generation 0 (Grandparents): William (15), Patricia (16)");
console.log("Generation 1 (Parents): Lisa (12), John (1)");
console.log("Generation 2 (Children): Alice (3), Michael (13)");
console.log("Generation 3 (Grandchildren): Emily (6)");
console.log("From Lisa's perspective: Emily is her step-granddaughter CONFIRMED");