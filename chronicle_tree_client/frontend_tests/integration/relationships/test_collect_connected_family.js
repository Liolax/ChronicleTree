// Test if collectConnectedFamily is filtering out Emily when Lisa is root
import { collectConnectedFamily } from './chronicle_tree_client/src/utils/familyTreeHierarchicalLayout.js';

console.log("=== Testing collectConnectedFamily Function ===");

// API data structure
const apiPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01' },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01' },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01' },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01' },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10' },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2015-01-01' },
  { id: 15, first_name: 'William', last_name: 'O\'Sullivan', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' }
];

// API edges structure (from the real API)
const apiEdges = [
  { source: 1, target: 12, relationship_type: 'spouse' },
  { source: 12, target: 1, relationship_type: 'spouse' },
  { source: 1, target: 3, relationship_type: 'child' },
  { source: 3, target: 1, relationship_type: 'parent' },
  { source: 3, target: 6, relationship_type: 'child' },
  { source: 6, target: 3, relationship_type: 'parent' },
  { source: 4, target: 6, relationship_type: 'child' },
  { source: 6, target: 4, relationship_type: 'parent' },
  { source: 3, target: 5, relationship_type: 'child' },
  { source: 5, target: 3, relationship_type: 'parent' },
  { source: 4, target: 5, relationship_type: 'child' },
  { source: 5, target: 4, relationship_type: 'parent' },
  { source: 5, target: 6, relationship_type: 'sibling' },
  { source: 6, target: 5, relationship_type: 'sibling' },
  { source: 12, target: 13, relationship_type: 'child' },
  { source: 13, target: 12, relationship_type: 'parent' },
  { source: 1, target: 13, relationship_type: 'child' },
  { source: 13, target: 1, relationship_type: 'parent' },
  { source: 15, target: 12, relationship_type: 'parent' },
  { source: 12, target: 15, relationship_type: 'child' },
  { source: 16, target: 12, relationship_type: 'parent' },
  { source: 12, target: 16, relationship_type: 'child' },
  { source: 3, target: 4, relationship_type: 'spouse', is_ex: true },
  { source: 4, target: 3, relationship_type: 'spouse', is_ex: true }
];

console.log("\n--- Testing Lisa as Root ---");
console.log("Lisa ID: 12");

// Test collectConnectedFamily with Lisa as root
try {
  const result = collectConnectedFamily(12, apiPeople, apiEdges);
  
  console.log(`\nConnected people found: ${result.persons.length}`);
  console.log("People in connected family:");
  result.persons.forEach(person => {
    console.log(`  - ${person.first_name} ${person.last_name} (ID: ${person.id})`);
  });
  
  // Check if Emily is included
  const emilyFound = result.persons.find(p => p.id === 6);
  if (emilyFound) {
    console.log("\nPASS: Emily IS included in connected family when Lisa is root");
  } else {
    console.log("\nFAIL: Emily is NOT included in connected family when Lisa is root");
    console.log("This is the problem! collectConnectedFamily is filtering out Emily");
  }
  
  // Check if Bob is included (for comparison)
  const bobFound = result.persons.find(p => p.id === 5);
  if (bobFound) {
    console.log("PASS: Bob IS included in connected family when Lisa is root");
  } else {
    console.log("FAIL: Bob is NOT included in connected family when Lisa is root");
  }
  
  console.log(`\nRelationships found: ${result.relationships.length}`);
  
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Also test with John as root (should include Emily)
console.log("\n--- Testing John as Root (for comparison) ---");
try {
  const result = collectConnectedFamily(1, apiPeople, apiEdges);
  const emilyFound = result.persons.find(p => p.id === 6);
  if (emilyFound) {
    console.log("PASS: Emily IS included when John is root");
  } else {
    console.log("FAIL: Emily is NOT included when John is root");
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}