// Debug script to test with real API data format
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test with the actual API data format based on what we saw in the Rails API
const testPeople = [
  { id: 1, full_name: 'John Doe', first_name: 'John', last_name: 'Doe', gender: 'Male' },
  { id: 2, full_name: 'Jane Doe', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
  { id: 3, full_name: 'Alice A', first_name: 'Alice', last_name: 'A', gender: 'Female' },
  { id: 4, full_name: 'David A', first_name: 'David', last_name: 'A', gender: 'Male' },
  { id: 5, full_name: 'Charlie C', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
  { id: 6, full_name: 'Bob B', first_name: 'Bob', last_name: 'B', gender: 'Male' },
  { id: 7, full_name: 'Emily E', first_name: 'Emily', last_name: 'E', gender: 'Female' }
];

// Rails API format relationships (bidirectional with both parent and child types)
const railsRelationships = [
  // Parent relationships (X has parent Y)
  { source: 3, target: 1, relationship_type: 'parent' }, // Alice has parent John
  { source: 3, target: 2, relationship_type: 'parent' }, // Alice has parent Jane
  { source: 5, target: 1, relationship_type: 'parent' }, // Charlie has parent John
  { source: 5, target: 2, relationship_type: 'parent' }, // Charlie has parent Jane
  { source: 6, target: 3, relationship_type: 'parent' }, // Bob has parent Alice
  { source: 6, target: 4, relationship_type: 'parent' }, // Bob has parent David
  { source: 7, target: 3, relationship_type: 'parent' }, // Emily has parent Alice
  { source: 7, target: 4, relationship_type: 'parent' }, // Emily has parent David
  
  // Child relationships (X has child Y)
  { source: 1, target: 3, relationship_type: 'child' }, // John has child Alice
  { source: 2, target: 3, relationship_type: 'child' }, // Jane has child Alice
  { source: 1, target: 5, relationship_type: 'child' }, // John has child Charlie
  { source: 2, target: 5, relationship_type: 'child' }, // Jane has child Charlie
  { source: 3, target: 6, relationship_type: 'child' }, // Alice has child Bob
  { source: 4, target: 6, relationship_type: 'child' }, // David has child Bob
  { source: 3, target: 7, relationship_type: 'child' }, // Alice has child Emily
  { source: 4, target: 7, relationship_type: 'child' }, // David has child Emily
  
  // Spouse relationships
  { source: 1, target: 2, relationship_type: 'spouse', is_ex: false }, // John <-> Jane
  { source: 2, target: 1, relationship_type: 'spouse', is_ex: false },
  { source: 3, target: 4, relationship_type: 'spouse', is_ex: true }, // Alice <-> David (ex)
  { source: 4, target: 3, relationship_type: 'spouse', is_ex: true },
  
  // Sibling relationships
  { source: 3, target: 5, relationship_type: 'sibling' }, // Alice <-> Charlie
  { source: 5, target: 3, relationship_type: 'sibling' },
  { source: 6, target: 7, relationship_type: 'sibling' }, // Bob <-> Emily
  { source: 7, target: 6, relationship_type: 'sibling' }
];

console.log('=== TESTING WITH RAILS API FORMAT ===');
console.log('Expected results with Charlie C as root:');
console.log('- John Doe: Father');
console.log('- Jane Doe: Mother');
console.log('- Alice A: Sister');
console.log('- David A: Unrelated (ex-spouse of sister)');
console.log('- Bob B: Nephew (sister\'s son)');
console.log('- Emily E: Niece (sister\'s daughter)');

console.log('\n=== ACTUAL RESULTS ===');
const charlie = testPeople.find(p => p.full_name === 'Charlie C');
testPeople.forEach(person => {
  if (person.id !== charlie.id) {
    const relation = calculateRelationshipToRoot(person, charlie, testPeople, railsRelationships);
    console.log(`${person.full_name} -> Charlie C: ${relation}`);
  }
});

console.log('\n=== DEBUGGING RELATIONSHIP DETECTION ===');
const hasParentType = railsRelationships.some(r => r.relationship_type === 'parent');
const hasChildType = railsRelationships.some(r => r.relationship_type === 'child');
const isRailsFormat = hasParentType && hasChildType;
console.log(`Has parent type: ${hasParentType}`);
console.log(`Has child type: ${hasChildType}`);
console.log(`Detected as Rails format: ${isRailsFormat}`);
