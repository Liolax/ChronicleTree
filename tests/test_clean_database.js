// Test with cleaned database (Lisa has only Michael as child)
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing with CLEANED Database Structure ===");

// Corrected data: Lisa has only Michael as child
const cleanedPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2015-01-01', date_of_death: null, is_deceased: false }
];

// Corrected relationships: Lisa has only Michael, not William/Patricia
const cleanedRelationships = [
  // John -> Alice (parent-child)
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  
  // Alice -> Emily (parent-child)
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // Alice -> Bob (parent-child) - assuming Bob exists
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  
  // John -> Lisa (spouse)
  { person_id: 1, relative_id: 12, relationship_type: 'spouse' },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse' },
  
  // John -> Michael (parent-child)
  { person_id: 1, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 1, relationship_type: 'parent' },
  
  // Lisa -> Michael (parent-child) - ONLY child
  { person_id: 12, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 12, relationship_type: 'parent' },
  
  // Bob -> Emily (sibling)
  { person_id: 5, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling' }
];

const lisa = cleanedPeople.find(p => p.id === 12);
const emily = cleanedPeople.find(p => p.id === 6);
const bob = cleanedPeople.find(p => p.id === 5);

console.log("\n--- CLEANED Family Structure ---");
console.log("Lisa (12) married to John (1)");
console.log("Lisa (12) has ONLY Michael (13) as biological child"); 
console.log("John (1) has children: Alice (3), Michael (13)");
console.log("Alice (3) has children: Emily (6), Bob (5)");

console.log("\n--- Lisa -> Emily with CLEANED data ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, cleanedPeople, cleanedRelationships);
  console.log(`Result: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Lisa -> Bob with CLEANED data ---");
try {
  const result = calculateRelationshipToRoot(bob, lisa, cleanedPeople, cleanedRelationships);
  console.log(`Result: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Compare with the messy data including William and Patricia
console.log("\n=== Now testing with MESSY data (William & Patricia as Lisa's children) ===");

const messyPeople = [...cleanedPeople, 
  { id: 15, first_name: 'William', last_name: 'O\'Sullivan', gender: 'Male', date_of_birth: '2020-01-01', date_of_death: null, is_deceased: false },
  { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '2018-01-01', date_of_death: null, is_deceased: false }
];

const messyRelationships = [...cleanedRelationships,
  // Lisa -> William (WRONG)
  { person_id: 12, relative_id: 15, relationship_type: 'child' },
  { person_id: 15, relative_id: 12, relationship_type: 'parent' },
  
  // Lisa -> Patricia (WRONG)  
  { person_id: 12, relative_id: 16, relationship_type: 'child' },
  { person_id: 16, relative_id: 12, relationship_type: 'parent' }
];

console.log("\n--- Lisa -> Emily with MESSY data (extra children) ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, messyPeople, messyRelationships);
  console.log(`Result: "${result}"`);
  console.log("Does extra children affect Emily's relationship?");
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}