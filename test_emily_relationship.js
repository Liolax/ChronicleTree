// Test script to debug Emily Anderson relationship calculation
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Mock data matching seeds.rb structure
const mockPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01' },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01' },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01' },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01' },
  { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1997-01-01' },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10' }
];

const mockRelationships = [
  // Parent-child relationships (bidirectional as in seeds.rb)
  // John's children
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 1, relationship_type: 'parent' },
  
  // Jane's children
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 2, relationship_type: 'parent' },
  
  // Alice's children
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // David's children
  { person_id: 4, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  
  // Spouses
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  
  // Siblings
  { person_id: 3, relative_id: 7, relationship_type: 'sibling' },
  { person_id: 7, relative_id: 3, relationship_type: 'sibling' },
  { person_id: 5, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling' }
];

console.log("=== Testing Lisa -> Bob and Emily relationships ===");
console.log("Family structure:");
console.log("Lisa (12) -> married to John (1)");
console.log("John (1) -> father of Alice (3)");
console.log("Alice (3) -> mother of Bob (5) and Emily (6)");
console.log("David (4) -> father of Bob (5) and Emily (6)");
console.log("Bob (5) and Emily (6) -> siblings");

// Test Lisa -> Bob (Lisa is root, Bob is person)
console.log("\n--- Lisa -> Bob ---");
try {
  const bobObj = mockPeople.find(p => p.id === 5);
  const lisaObj = mockPeople.find(p => p.id === 12);
  const lisaToBob = calculateRelationshipToRoot(bobObj, lisaObj, mockPeople, mockRelationships);
  console.log("Result:", lisaToBob);
} catch (error) {
  console.log("Error:", error.message);
}

// Test Lisa -> Emily (Lisa is root, Emily is person)
console.log("\n--- Lisa -> Emily ---");
try {
  const emilyObj = mockPeople.find(p => p.id === 6);
  const lisaObj = mockPeople.find(p => p.id === 12);
  const lisaToEmily = calculateRelationshipToRoot(emilyObj, lisaObj, mockPeople, mockRelationships);
  console.log("Result:", lisaToEmily);
} catch (error) {
  console.log("Error:", error.message);
}

// Test reverse relationships for debugging
console.log("\n--- Reverse relationships for debugging ---");
try {
  const bobObj = mockPeople.find(p => p.id === 5);
  const lisaObj = mockPeople.find(p => p.id === 12);
  const bobToLisa = calculateRelationshipToRoot(lisaObj, bobObj, mockPeople, mockRelationships);
  console.log("Bob -> Lisa:", bobToLisa);
} catch (error) {
  console.log("Bob -> Lisa Error:", error.message);
}

try {
  const emilyObj = mockPeople.find(p => p.id === 6);
  const lisaObj = mockPeople.find(p => p.id === 12);
  const emilyToLisa = calculateRelationshipToRoot(lisaObj, emilyObj, mockPeople, mockRelationships);
  console.log("Emily -> Lisa:", emilyToLisa);
} catch (error) {
  console.log("Emily -> Lisa Error:", error.message);
}

// Verify data integrity
console.log("\n--- Data integrity checks ---");
console.log("Bob's relationships:", mockRelationships.filter(r => r.person_id === 5 || r.relative_id === 5));
console.log("Emily's relationships:", mockRelationships.filter(r => r.person_id === 6 || r.relative_id === 6));

// Check if both have the same parent relationships
const bobParents = mockRelationships.filter(r => r.person_id === 5 && r.relationship_type === 'parent').map(r => r.relative_id);
const emilyParents = mockRelationships.filter(r => r.person_id === 6 && r.relationship_type === 'parent').map(r => r.relative_id);
console.log("Bob's parents:", bobParents);
console.log("Emily's parents:", emilyParents);
console.log("Same parents?", JSON.stringify(bobParents.sort()) === JSON.stringify(emilyParents.sort()));