// Debug script to trace Emily's relationship calculation step by step
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test with the exact same data structure but add detailed logging
console.log("=== Debugging Emily's Specific Relationship Issue ===");

// Let's test with minimal data focused on the specific relationship path
const minimalPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false }
];

const minimalRelationships = [
  // John -> Alice (parent-child)
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  
  // Alice -> Bob (parent-child)
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  
  // Alice -> Emily (parent-child)  
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // John -> Lisa (spouse)
  { person_id: 1, relative_id: 12, relationship_type: 'spouse' },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse' },
  
  // Bob -> Emily (sibling)
  { person_id: 5, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling' }
];

console.log("\n--- Family Structure ---");
console.log("Lisa (12) married to John (1)");
console.log("John (1) is father of Alice (3)");
console.log("Alice (3) is mother of Bob (5) and Emily (6)");
console.log("Bob (5) and Emily (6) are siblings");
console.log("Expected: Lisa -> Bob = Step-Grandson, Lisa -> Emily = Step-Granddaughter");

const lisa = minimalPeople.find(p => p.id === 12);
const emily = minimalPeople.find(p => p.id === 6);
const bob = minimalPeople.find(p => p.id === 5);
const alice = minimalPeople.find(p => p.id === 3);
const john = minimalPeople.find(p => p.id === 1);

console.log("\n--- Testing Both Relationships ---");

// Test Bob
console.log("\n1. Bob -> Lisa (Lisa as root):");
try {
  const bobResult = calculateRelationshipToRoot(bob, lisa, minimalPeople, minimalRelationships);
  console.log(`   Result: "${bobResult}"`);
  console.log(`   Expected: "Step-Grandson"`);
  console.log(`   Match: ${bobResult === 'Step-Grandson'}`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

// Test Emily
console.log("\n2. Emily -> Lisa (Lisa as root):");
try {
  const emilyResult = calculateRelationshipToRoot(emily, lisa, minimalPeople, minimalRelationships);
  console.log(`   Result: "${emilyResult}"`);
  console.log(`   Expected: "Step-Granddaughter"`);
  console.log(`   Match: ${emilyResult === 'Step-Granddaughter'}`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

console.log("\n--- Relationship Data Verification ---");
console.log("Emily's relationships:");
minimalRelationships.filter(r => r.person_id === 6 || r.relative_id === 6).forEach(rel => {
  const other = rel.person_id === 6 ? rel.relative_id : rel.person_id;
  const otherPerson = minimalPeople.find(p => p.id === other);
  const direction = rel.person_id === 6 ? 'Emily ->' : '-> Emily';
  console.log(`   ${direction} ${otherPerson.first_name} (${rel.relationship_type})`);
});

console.log("\nBob's relationships:");
minimalRelationships.filter(r => r.person_id === 5 || r.relative_id === 5).forEach(rel => {
  const other = rel.person_id === 5 ? rel.relative_id : rel.person_id;
  const otherPerson = minimalPeople.find(p => p.id === other);
  const direction = rel.person_id === 5 ? 'Bob ->' : '-> Bob';
  console.log(`   ${direction} ${otherPerson.first_name} (${rel.relationship_type})`);
});

console.log("\nLisa's relationships:");
minimalRelationships.filter(r => r.person_id === 12 || r.relative_id === 12).forEach(rel => {
  const other = rel.person_id === 12 ? rel.relative_id : rel.person_id;
  const otherPerson = minimalPeople.find(p => p.id === other);
  const direction = rel.person_id === 12 ? 'Lisa ->' : '-> Lisa';
  console.log(`   ${direction} ${otherPerson.first_name} (${rel.relationship_type})`);
});

// Test the relationship path manually
console.log("\n--- Manual Path Verification ---");
console.log("Path from Lisa to Emily should be:");
console.log("Lisa (12) -> spouse -> John (1) -> child -> Alice (3) -> child -> Emily (6)");
console.log("This makes Emily Lisa's step-granddaughter");

console.log("\nPath from Lisa to Bob should be:");
console.log("Lisa (12) -> spouse -> John (1) -> child -> Alice (3) -> child -> Bob (5)");
console.log("This makes Bob Lisa's step-grandson");

// Check if there are any missing relationships
console.log("\n--- Checking Critical Relationships ---");
const lisaToJohn = minimalRelationships.find(r => r.person_id === 12 && r.relative_id === 1 && r.relationship_type === 'spouse');
const johnToAlice = minimalRelationships.find(r => r.person_id === 1 && r.relative_id === 3 && r.relationship_type === 'child');
const aliceToEmily = minimalRelationships.find(r => r.person_id === 3 && r.relative_id === 6 && r.relationship_type === 'child');
const aliceToBob = minimalRelationships.find(r => r.person_id === 3 && r.relative_id === 5 && r.relationship_type === 'child');

console.log(`Lisa -> John (spouse): ${lisaToJohn ? 'EXISTS' : 'MISSING'}`);
console.log(`John -> Alice (child): ${johnToAlice ? 'EXISTS' : 'MISSING'}`);
console.log(`Alice -> Emily (child): ${aliceToEmily ? 'EXISTS' : 'MISSING'}`);
console.log(`Alice -> Bob (child): ${aliceToBob ? 'EXISTS' : 'MISSING'}`);

// Test if the issue is with bidirectional relationships
console.log("\n--- Testing Reverse Path ---");
const johnToLisa = minimalRelationships.find(r => r.person_id === 1 && r.relative_id === 12 && r.relationship_type === 'spouse');
const aliceToJohn = minimalRelationships.find(r => r.person_id === 3 && r.relative_id === 1 && r.relationship_type === 'parent');
const emilyToAlice = minimalRelationships.find(r => r.person_id === 6 && r.relative_id === 3 && r.relationship_type === 'parent');
const bobToAlice = minimalRelationships.find(r => r.person_id === 5 && r.relative_id === 3 && r.relationship_type === 'parent');

console.log(`John -> Lisa (spouse): ${johnToLisa ? 'EXISTS' : 'MISSING'}`);
console.log(`Alice -> John (parent): ${aliceToJohn ? 'EXISTS' : 'MISSING'}`);
console.log(`Emily -> Alice (parent): ${emilyToAlice ? 'EXISTS' : 'MISSING'}`);
console.log(`Bob -> Alice (parent): ${bobToAlice ? 'EXISTS' : 'MISSING'}`);

// Test if Emily and Bob have the same parents
console.log("\n--- Parent Comparison ---");
const emilyParents = minimalRelationships.filter(r => r.person_id === 6 && r.relationship_type === 'parent').map(r => r.relative_id).sort();
const bobParents = minimalRelationships.filter(r => r.person_id === 5 && r.relationship_type === 'parent').map(r => r.relative_id).sort();

console.log(`Emily's parents: [${emilyParents.join(', ')}]`);
console.log(`Bob's parents: [${bobParents.join(', ')}]`);
console.log(`Same parents: ${JSON.stringify(emilyParents) === JSON.stringify(bobParents)}`);