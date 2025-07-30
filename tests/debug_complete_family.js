// Debug with complete family structure including David
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing Complete Family Structure ===");

// Complete family as per your seeds.rb
const completePeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1997-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false }
];

const completeRelationships = [
  // John's children
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 1, relationship_type: 'parent' },
  
  // Jane's children (deceased parent)
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

const lisa = completePeople.find(p => p.id === 12);
const emily = completePeople.find(p => p.id === 6);
const bob = completePeople.find(p => p.id === 5);

console.log("\n--- Complete Family Test ---");
console.log("Family structure:");
console.log("- John (1) married to Jane (2, deceased) and Lisa (12)");
console.log("- John & Jane have children: Alice (3), Charlie (7)");
console.log("- Alice (3) was married to David (4, ex-spouse)");
console.log("- Alice & David have children: Bob (5), Emily (6)");
console.log("- Bob and Emily are siblings");

// Test Lisa -> Emily
console.log("\n1. Lisa -> Emily:");
try {
  const emilyResult = calculateRelationshipToRoot(emily, lisa, completePeople, completeRelationships);
  console.log(`   Result: "${emilyResult}"`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

// Test Lisa -> Bob  
console.log("\n2. Lisa -> Bob:");
try {
  const bobResult = calculateRelationshipToRoot(bob, lisa, completePeople, completeRelationships);
  console.log(`   Result: "${bobResult}"`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

// Check if the issue is with ex-spouse relationships
console.log("\n--- Testing Without Ex-Spouse Relationship ---");
const noExSpouseRelationships = completeRelationships.filter(r => 
  !(r.person_id === 3 && r.relative_id === 4 && r.relationship_type === 'spouse') &&
  !(r.person_id === 4 && r.relative_id === 3 && r.relationship_type === 'spouse')
);

console.log("\n3. Lisa -> Emily (without Alice-David ex-spouse):");
try {
  const emilyResult = calculateRelationshipToRoot(emily, lisa, completePeople, noExSpouseRelationships);
  console.log(`   Result: "${emilyResult}"`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

console.log("\n4. Lisa -> Bob (without Alice-David ex-spouse):");
try {
  const bobResult = calculateRelationshipToRoot(bob, lisa, completePeople, noExSpouseRelationships);
  console.log(`   Result: "${bobResult}"`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

// Test if the issue is with Jane being deceased
console.log("\n--- Testing Timeline Issues ---");
console.log("Checking if Jane being deceased affects the calculation...");

// Test with Jane alive
const janeAlivePeople = completePeople.map(p => 
  p.id === 2 ? { ...p, is_deceased: false, date_of_death: null } : p
);

console.log("\n5. Lisa -> Emily (Jane alive):");
try {
  const emilyResult = calculateRelationshipToRoot(emily, lisa, janeAlivePeople, completeRelationships);
  console.log(`   Result: "${emilyResult}"`);
} catch (error) {
  console.log(`   ERROR: ${error.message}`);
}

// Show detailed relationships for Emily
console.log("\n--- Emily's Complete Relationship Set ---");
const emilyRels = completeRelationships.filter(r => r.person_id === 6 || r.relative_id === 6);
console.log("Emily's relationships in database:");
emilyRels.forEach(rel => {
  const otherId = rel.person_id === 6 ? rel.relative_id : rel.person_id;
  const otherPerson = completePeople.find(p => p.id === otherId);
  const direction = rel.person_id === 6 ? 'Emily ->' : '-> Emily';
  const extra = rel.is_ex ? ' (ex)' : rel.is_deceased ? ' (deceased)' : '';
  console.log(`   ${direction} ${otherPerson.first_name} ${otherPerson.last_name} (${rel.relationship_type}${extra})`);
});

// Show detailed relationships for Bob
console.log("\n--- Bob's Complete Relationship Set ---");
const bobRels = completeRelationships.filter(r => r.person_id === 5 || r.relative_id === 5);
console.log("Bob's relationships in database:");
bobRels.forEach(rel => {
  const otherId = rel.person_id === 5 ? rel.relative_id : rel.person_id;
  const otherPerson = completePeople.find(p => p.id === otherId);
  const direction = rel.person_id === 5 ? 'Bob ->' : '-> Bob';
  const extra = rel.is_ex ? ' (ex)' : rel.is_deceased ? ' (deceased)' : '';
  console.log(`   ${direction} ${otherPerson.first_name} ${otherPerson.last_name} (${rel.relationship_type}${extra})`);
});

console.log("\n--- Checking for Relationship Differences ---");
const emilyRelCount = emilyRels.length;
const bobRelCount = bobRels.length;
console.log(`Emily has ${emilyRelCount} relationships, Bob has ${bobRelCount} relationships`);

if (emilyRelCount !== bobRelCount) {
  console.log("⚠️  DIFFERENCE FOUND: Emily and Bob have different numbers of relationships!");
} else {
  console.log("✅ Emily and Bob have the same number of relationships");
}