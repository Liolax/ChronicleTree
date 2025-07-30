// Test with the exact API data structure
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Exact API data from Rails output
const apiPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1997-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false }
];

// Exact relationships from API (only the relevant ones)
const apiRelationships = [
  // John's relationships
  { person_id: 1, relative_id: 3, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 1, relative_id: 7, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // Jane's relationships
  { person_id: 2, relative_id: 3, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 2, relative_id: 7, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // Alice's relationships
  { person_id: 3, relative_id: 1, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 2, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 5, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 6, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { person_id: 3, relative_id: 7, relationship_type: 'sibling', is_ex: false, is_deceased: false },
  
  // David's relationships
  { person_id: 4, relative_id: 5, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 4, relative_id: 6, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  
  // Bob's relationships
  { person_id: 5, relative_id: 3, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 5, relative_id: 4, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 5, relative_id: 6, relationship_type: 'sibling', is_ex: false, is_deceased: false },
  
  // Emily's relationships
  { person_id: 6, relative_id: 3, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 6, relative_id: 4, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling', is_ex: false, is_deceased: false },
  
  // Charlie's relationships
  { person_id: 7, relative_id: 1, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 7, relative_id: 2, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 7, relative_id: 3, relationship_type: 'sibling', is_ex: false, is_deceased: false },
  
  // Lisa's relationships
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false }
];

console.log("=== Testing with Real API Data ===");

// Test Lisa -> Bob (Lisa is root, Bob is person)
console.log("\n--- Lisa -> Bob ---");
try {
  const bobObj = apiPeople.find(p => p.id === 5);
  const lisaObj = apiPeople.find(p => p.id === 12);
  const lisaToBob = calculateRelationshipToRoot(bobObj, lisaObj, apiPeople, apiRelationships);
  console.log("Result:", lisaToBob);
} catch (error) {
  console.log("Error:", error.message);
  console.log("Stack:", error.stack);
}

// Test Lisa -> Emily (Lisa is root, Emily is person)
console.log("\n--- Lisa -> Emily ---");
try {
  const emilyObj = apiPeople.find(p => p.id === 6);
  const lisaObj = apiPeople.find(p => p.id === 12);
  const lisaToEmily = calculateRelationshipToRoot(emilyObj, lisaObj, apiPeople, apiRelationships);
  console.log("Result:", lisaToEmily);
} catch (error) {
  console.log("Error:", error.message);
  console.log("Stack:", error.stack);
}

// Test reverse direction - Emily as root, Lisa as person
console.log("\n--- Emily -> Lisa (Reverse) ---");
try {
  const emilyObj = apiPeople.find(p => p.id === 6);
  const lisaObj = apiPeople.find(p => p.id === 12);
  const emilyToLisa = calculateRelationshipToRoot(lisaObj, emilyObj, apiPeople, apiRelationships);
  console.log("Result:", emilyToLisa);
} catch (error) {
  console.log("Error:", error.message);
  console.log("Stack:", error.stack);
}

// Test reverse direction - Bob as root, Lisa as person
console.log("\n--- Bob -> Lisa (Reverse) ---");
try {
  const bobObj = apiPeople.find(p => p.id === 5);
  const lisaObj = apiPeople.find(p => p.id === 12);
  const bobToLisa = calculateRelationshipToRoot(lisaObj, bobObj, apiPeople, apiRelationships);
  console.log("Result:", bobToLisa);
} catch (error) {
  console.log("Error:", error.message);
  console.log("Stack:", error.stack);
}

console.log("\n--- Data Verification ---");
console.log("Bob's data:", apiPeople.find(p => p.id === 5));
console.log("Emily's data:", apiPeople.find(p => p.id === 6));
console.log("Bob's relationships:", apiRelationships.filter(r => r.person_id === 5 || r.relative_id === 5));
console.log("Emily's relationships:", apiRelationships.filter(r => r.person_id === 6 || r.relative_id === 6));