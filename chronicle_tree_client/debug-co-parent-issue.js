import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test data from comprehensive-relationship-test.test.js
const testPeople = [
  { id: '1', full_name: 'John Doe', gender: 'male' },
  { id: '2', full_name: 'Jane Doe', gender: 'female' },
  { id: '3', full_name: 'Alice A', gender: 'female' },
  { id: '4', full_name: 'David B', gender: 'male' },
  { id: '5', full_name: 'Charlie C', gender: 'male' },
  { id: '6', full_name: 'Bob D', gender: 'male' },
  { id: '7', full_name: 'Emily E', gender: 'female' },
  { id: '8', full_name: 'Michael A', gender: 'male' },
  { id: '9', full_name: 'Susan A', gender: 'female' },
  { id: '10', full_name: 'Frank Doe', gender: 'male' },
  { id: '11', full_name: 'Rose Doe', gender: 'female' },
];

const testRelationships = [
  // Core family relationships
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false }, // John -> Alice
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false }, // Jane -> Alice
  { source: '1', target: '5', relationship_type: 'parent', is_ex: false }, // John -> Charlie
  { source: '2', target: '5', relationship_type: 'parent', is_ex: false }, // Jane -> Charlie
  { source: '3', target: '6', relationship_type: 'parent', is_ex: false }, // Alice -> Bob
  { source: '4', target: '6', relationship_type: 'parent', is_ex: false }, // David -> Bob
  { source: '3', target: '7', relationship_type: 'parent', is_ex: false }, // Alice -> Emily
  { source: '4', target: '7', relationship_type: 'parent', is_ex: false }, // David -> Emily
];

console.log('🔍 Analyzing relationship structure...');

console.log('\nFamily Structure:');
console.log('John (1) + Jane (2) have children:');
console.log('  - Alice (3)');
console.log('  - Charlie (5)');
console.log('');
console.log('Alice (3) + David (4) [ex-spouses] have children:');
console.log('  - Bob (6)');
console.log('  - Emily (7)');

console.log('\nKey question: Are Charlie and Alice being detected as co-parents of Bob/Emily?');
console.log('This would be WRONG - Charlie is Alice\'s SIBLING, not co-parent of her children');

// Check if Charlie has any children
const charlieChildren = testRelationships.filter(r => r.source === '5' && r.relationship_type === 'parent');
console.log('\nCharlie\'s children:', charlieChildren);

// Check Alice's children
const aliceChildren = testRelationships.filter(r => r.source === '3' && r.relationship_type === 'parent');
console.log('Alice\'s children:', aliceChildren);

console.log('\nCharlie should be UNCLE to Bob/Emily, not co-parent');

const charlieC = testPeople.find(p => p.full_name === 'Charlie C');
const bobD = testPeople.find(p => p.full_name === 'Bob D');

const charlieToBob = calculateRelationshipToRoot(charlieC, bobD, testPeople, testRelationships);
console.log(`Charlie -> Bob: ${charlieToBob} (Expected: Uncle)`);
