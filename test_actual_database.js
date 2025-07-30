// Test with actual database structure including Lisa's children
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing with ACTUAL Database Structure ===");

// Based on actual database queries
const actualPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1997-01-01', date_of_death: null, is_deceased: false },
  { id: 8, first_name: 'Molly', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-01-01', date_of_death: null, is_deceased: false },
  { id: 9, first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '2002-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2015-01-01', date_of_death: null, is_deceased: false },
  { id: 15, first_name: 'William', last_name: 'O\'Sullivan', gender: 'Male', date_of_birth: '2020-01-01', date_of_death: null, is_deceased: false },
  { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '2018-01-01', date_of_death: null, is_deceased: false }
];

// Based on actual database relationships
const actualRelationships = [
  // John -> Alice  
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  
  // John -> Charlie
  { person_id: 1, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 1, relationship_type: 'parent' },
  
  // John -> Molly  
  { person_id: 1, relative_id: 8, relationship_type: 'parent' },
  { person_id: 8, relative_id: 1, relationship_type: 'child' },
  
  // John -> Robert
  { person_id: 1, relative_id: 9, relationship_type: 'parent' },
  { person_id: 9, relative_id: 1, relationship_type: 'child' },
  
  // John -> Michael (Lisa's child!)
  { person_id: 1, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 1, relationship_type: 'parent' },
  
  // Alice -> Emily
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // David -> Emily
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  
  // John -> Jane (spouse, deceased)
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // John -> Lisa (spouse, current)
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // Lisa -> Michael (her biological child)
  { person_id: 12, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 12, relationship_type: 'parent' },
  
  // Lisa -> William (her biological child)
  { person_id: 12, relative_id: 15, relationship_type: 'parent' },
  { person_id: 15, relative_id: 12, relationship_type: 'child' },
  
  // Lisa -> Patricia (her biological child)  
  { person_id: 12, relative_id: 16, relationship_type: 'parent' },
  { person_id: 16, relative_id: 12, relationship_type: 'child' }
];

const lisa = actualPeople.find(p => p.id === 12);
const emily = actualPeople.find(p => p.id === 6);

console.log("\n--- ACTUAL Family Structure ---");
console.log("Lisa (12) married to John (1)");
console.log("Lisa (12) has biological children: Michael (13), William (15), Patricia (16)"); 
console.log("John (1) has children: Alice (3), Charlie (7), Molly (8), Robert (9), Michael (13)");
console.log("Alice (3) has child: Emily (6)");
console.log("Emily is Lisa's step-grandchild? Or step-great-grandchild?");

console.log("\n--- Lisa -> Emily with ACTUAL data ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, actualPeople, actualRelationships);
  console.log(`Result: "${result}"`);
  console.log(`Expected: "Step-Granddaughter" but might be different due to Lisa having her own children`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Check the relationship path
console.log("\n--- Relationship Path Analysis ---");
console.log("Path from Lisa to Emily:");
console.log("Lisa (12) -> spouse -> John (1) -> child -> Alice (3) -> child -> Emily (6)");
console.log("This should make Emily Lisa's step-granddaughter");
console.log("");
console.log("But Lisa also has biological children:");
console.log("Lisa (12) -> child -> Michael (13)");
console.log("Lisa (12) -> child -> William (15)"); 
console.log("Lisa (12) -> child -> Patricia (16)");
console.log("");
console.log("This might affect how the algorithm calculates step-relationships");

// Test what John sees Emily as
const john = actualPeople.find(p => p.id === 1);
console.log("\n--- John -> Emily (should be granddaughter) ---");
try {
  const result = calculateRelationshipToRoot(emily, john, actualPeople, actualRelationships);
  console.log(`John -> Emily: "${result}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}