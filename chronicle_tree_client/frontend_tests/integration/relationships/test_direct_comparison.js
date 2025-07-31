// Test to compare my working test vs what might be failing in the frontend
import { calculateRelationshipToRoot, getAllRelationshipsToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Direct Comparison Test ===");

// Test data that matches what I saw in the frontend debugging
const people = [
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

// Frontend relationship format (converted from edges)
const relationships = [
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 1, relative_id: 3, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 1, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 6, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 6, relative_id: 3, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 4, relative_id: 6, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 6, relative_id: 4, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 5, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 5, relative_id: 3, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 4, relative_id: 5, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 5, relative_id: 4, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 5, relative_id: 6, relationship_type: 'sibling', is_ex: false, is_deceased: false },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 13, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 13, relative_id: 12, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 1, relative_id: 13, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 13, relative_id: 1, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 15, relative_id: 12, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 15, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 16, relative_id: 12, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 16, relationship_type: 'child', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false }
];

const lisa = people.find(p => p.id === 12);
const emily = people.find(p => p.id === 6);

console.log("\n--- Test 1: Direct calculateRelationshipToRoot call ---");
try {
  const directResult = calculateRelationshipToRoot(emily, lisa, people, relationships);
  console.log(`Direct result: "${directResult}"`);
} catch (error) {
  console.log(`Direct ERROR: ${error.message}`);
}

console.log("\n--- Test 2: getAllRelationshipsToRoot (what frontend uses) ---");
try {
  const allResults = getAllRelationshipsToRoot(lisa, people, relationships);
  const emilyResult = allResults.find(p => p.id === 6);
  console.log(`getAllRelationshipsToRoot result for Emily: "${emilyResult?.relation}"`);
  
  // Also check Bob for comparison
  const bobResult = allResults.find(p => p.id === 5);
  console.log(`getAllRelationshipsToRoot result for Bob: "${bobResult?.relation}"`);
} catch (error) {
  console.log(`getAllRelationshipsToRoot ERROR: ${error.message}`);
}

console.log("\n--- Test 3: Check if results match ---");
try {
  const directResult = calculateRelationshipToRoot(emily, lisa, people, relationships);
  const allResults = getAllRelationshipsToRoot(lisa, people, relationships);
  const emilyFromAll = allResults.find(p => p.id === 6);
  
  console.log(`Direct: "${directResult}"`);
  console.log(`From getAllRelationshipsToRoot: "${emilyFromAll?.relation}"`);
  console.log(`Results match: ${directResult === emilyFromAll?.relation ? 'YES' : 'NO'}`);
  
  if (directResult !== emilyFromAll?.relation) {
    console.log("ERROR: MISMATCH FOUND! This explains the frontend issue.");
  } else {
    console.log("PASS: Results match - issue must be elsewhere");
  }
} catch (error) {
  console.log(`Comparison ERROR: ${error.message}`);
}