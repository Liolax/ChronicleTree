// Test with current exact database structure
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing with CURRENT Database Structure ===");

// Current database people
const currentPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2015-01-01', date_of_death: null, is_deceased: false },
  { id: 15, first_name: 'William', last_name: 'O\'Sullivan', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: false }
];

// Current database relationships (after our fixes)
const currentRelationships = [
  // Lisa-John spouse
  { person_id: 1, relative_id: 12, relationship_type: 'spouse' },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse' },
  
  // John-Alice parent-child
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  
  // Alice-Emily parent-child
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // David-Emily parent-child
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  
  // David-Bob parent-child
  { person_id: 4, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 4, relationship_type: 'parent' },
  
  // Alice-Bob parent-child  
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  
  // Bob-Emily sibling
  { person_id: 5, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling' },
  
  // Lisa-Michael parent-child
  { person_id: 12, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 12, relationship_type: 'parent' },
  
  // John-Michael parent-child
  { person_id: 1, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 1, relationship_type: 'parent' },
  
  // William-Lisa parent-child (FIXED)
  { person_id: 15, relative_id: 12, relationship_type: 'parent' },
  { person_id: 12, relative_id: 15, relationship_type: 'child' },
  
  // Patricia-Lisa parent-child (FIXED)
  { person_id: 16, relative_id: 12, relationship_type: 'parent' },
  { person_id: 12, relative_id: 16, relationship_type: 'child' }
];

const lisa = currentPeople.find(p => p.id === 12);
const emily = currentPeople.find(p => p.id === 6);
const bob = currentPeople.find(p => p.id === 5);

console.log("\n--- Testing Lisa -> Emily ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, currentPeople, currentRelationships);
  console.log(`Lisa -> Emily: "${result}"`);
  
  if (result === "Unrelated") {
    console.log("FAIL: STILL UNRELATED - need to debug further");
  } else if (result === "Step-Granddaughter") {
    console.log("PASS: Working correctly!");
  } else {
    console.log(`UNEXPECTED: "${result}"`);
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Testing Lisa -> Bob (for comparison) ---");
try {
  const result = calculateRelationshipToRoot(bob, lisa, currentPeople, currentRelationships);
  console.log(`Lisa -> Bob: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Testing John -> Emily (should be granddaughter) ---");
const john = currentPeople.find(p => p.id === 1);
try {
  const result = calculateRelationshipToRoot(emily, john, currentPeople, currentRelationships);
  console.log(`John -> Emily: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Debugging: Check if there's a missing relationship ---");
console.log("Emily's parents: Alice (3), David (4)");
console.log("Alice's parents: John (1)");
console.log("John's spouse: Lisa (12)");
console.log("Path: Lisa -> John -> Alice -> Emily (should be step-granddaughter)");

// Test a simpler case
console.log("\n--- Testing Alice -> Lisa (should be step-daughter) ---");
const alice = currentPeople.find(p => p.id === 3);
try {
  const result = calculateRelationshipToRoot(alice, lisa, currentPeople, currentRelationships);
  console.log(`Lisa -> Alice: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}