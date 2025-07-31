// Test with corrected family structure: William & Patricia are Lisa's parents
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing with CORRECTED Family Structure ===");

const correctedPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2015-01-01', date_of_death: null, is_deceased: false },
  { id: 15, first_name: 'William', last_name: 'O\'Sullivan', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: false }
];

const correctedRelationships = [
  // William -> Lisa (parent-child)
  { person_id: 15, relative_id: 12, relationship_type: 'child' },
  { person_id: 12, relative_id: 15, relationship_type: 'parent' },
  
  // Patricia -> Lisa (parent-child)
  { person_id: 16, relative_id: 12, relationship_type: 'child' },
  { person_id: 12, relative_id: 16, relationship_type: 'parent' },
  
  // John -> Lisa (spouse)
  { person_id: 1, relative_id: 12, relationship_type: 'spouse' },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse' },
  
  // John -> Alice (parent-child)
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  
  // Alice -> Emily (parent-child)
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // John & Lisa -> Michael (both parents)
  { person_id: 1, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 1, relationship_type: 'parent' },
  { person_id: 12, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 12, relationship_type: 'parent' }
];

const lisa = correctedPeople.find(p => p.id === 12);
const emily = correctedPeople.find(p => p.id === 6);

console.log("\n--- CORRECTED Family Structure ---");
console.log("William (15) and Patricia (16) are Lisa's parents");
console.log("Lisa (12) married to John (1)");
console.log("John (1) has daughter Alice (3) from previous relationship");
console.log("Alice (3) has daughter Emily (6)");
console.log("Lisa (12) and John (1) have son Michael (13)");
console.log("");
console.log("Expected relationship path:");
console.log("Lisa -> husband John -> daughter Alice -> daughter Emily");
console.log("This should make Emily Lisa's step-great-granddaughter (3 generations)");

console.log("\n--- Lisa -> Emily with CORRECTED data ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, correctedPeople, correctedRelationships);
  console.log(`Result: "${result}"`);
  
  if (result === "Step-Granddaughter") {
    console.log("ERROR: Algorithm says Step-Granddaughter (2 generations)");
    console.log("   But should be Step-Great-Granddaughter (3 generations)");
  } else if (result === "Step-Great-Granddaughter") {
    console.log("SUCCESS: Correct! Step-Great-Granddaughter (3 generations)");
  } else {
    console.log(`UNEXPECTED result: "${result}"`);
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Test reverse to verify
console.log("\n--- Emily -> Lisa (reverse) ---");
try {
  const result = calculateRelationshipToRoot(lisa, emily, correctedPeople, correctedRelationships);
  console.log(`Emily -> Lisa: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Generation Count Analysis ---");
console.log("Lisa (generation 0) -> John (spouse, same generation)");
console.log("John (generation 0) -> Alice (generation 1, child)"); 
console.log("Alice (generation 1) -> Emily (generation 2, grandchild from Lisa's perspective)");
console.log("So Emily should be Lisa's step-granddaughter, not great-granddaughter");
console.log("The algorithm might be correct after all!");