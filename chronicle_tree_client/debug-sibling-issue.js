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
  { source: '3', target: '6', relationship_type: 'parent', is_ex: false },
  { source: '4', target: '6', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '7', relationship_type: 'parent', is_ex: false },
  { source: '4', target: '7', relationship_type: 'parent', is_ex: false },
  
  // David's parents (for co-parent-in-law testing)
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
  
  // Great-grandparents
  { source: '10', target: '1', relationship_type: 'parent', is_ex: false },
  { source: '11', target: '1', relationship_type: 'parent', is_ex: false },
  
  // Reverse child relationships
  { source: '3', target: '1', relationship_type: 'child', is_ex: false },
  { source: '3', target: '2', relationship_type: 'child', is_ex: false },
  { source: '5', target: '1', relationship_type: 'child', is_ex: false },
  { source: '5', target: '2', relationship_type: 'child', is_ex: false },
  { source: '6', target: '3', relationship_type: 'child', is_ex: false },
  { source: '6', target: '4', relationship_type: 'child', is_ex: false },
  { source: '7', target: '3', relationship_type: 'child', is_ex: false },
  { source: '7', target: '4', relationship_type: 'child', is_ex: false },
  { source: '4', target: '8', relationship_type: 'child', is_ex: false },
  { source: '4', target: '9', relationship_type: 'child', is_ex: false },
  { source: '1', target: '10', relationship_type: 'child', is_ex: false },
  { source: '1', target: '11', relationship_type: 'child', is_ex: false },
  
  // Spouse relationships
  { source: '1', target: '2', relationship_type: 'spouse', is_ex: false },
  { source: '2', target: '1', relationship_type: 'spouse', is_ex: false },
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true },
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
];

console.log('🔍 Testing Alice-Charlie sibling relationship...');

const charlieC = testPeople.find(p => p.full_name === 'Charlie C');
const aliceA = testPeople.find(p => p.full_name === 'Alice A');

console.log('Charlie:', charlieC);
console.log('Alice:', aliceA);

console.log('\nParent relationships for Alice:');
console.log(testRelationships.filter(r => r.relationship_type === 'parent' && r.target === '3'));

console.log('\nParent relationships for Charlie:');
console.log(testRelationships.filter(r => r.relationship_type === 'parent' && r.target === '5'));

const charlieToAlice = calculateRelationshipToRoot(charlieC, aliceA, testPeople, testRelationships);
const aliceToCharlie = calculateRelationshipToRoot(aliceA, charlieC, testPeople, testRelationships);

console.log('\nResults:');
console.log(`Charlie -> Alice: ${charlieToAlice} (Expected: Brother)`);
console.log(`Alice -> Charlie: ${aliceToCharlie} (Expected: Sister)`);

if (charlieToAlice !== 'Brother' || aliceToCharlie !== 'Sister') {
  console.log('❌ SIBLING DETECTION FAILED');
} else {
  console.log('✅ SIBLING DETECTION WORKING');
}
