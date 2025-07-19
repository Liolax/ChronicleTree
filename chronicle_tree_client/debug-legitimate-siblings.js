import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test legitimate siblings (who actually share parents)
const legitimateSiblingData = [
  // John and Jane are parents of Alice and Charlie
  { source: 'john', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'john', target: 'charlie', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'charlie', relationship_type: 'parent', is_ex: false },
  
  // Alice and Charlie are siblings (this should work because they share parents)
  { source: 'alice', target: 'charlie', relationship_type: 'sibling', is_ex: false },
  { source: 'charlie', target: 'alice', relationship_type: 'sibling', is_ex: false },
];

const testPeople = [
  { id: 'john', full_name: 'John Doe', gender: 'male' },
  { id: 'jane', full_name: 'Jane Doe', gender: 'female' },
  { id: 'alice', full_name: 'Alice A', gender: 'female' },
  { id: 'charlie', full_name: 'Charlie C', gender: 'male' },
];

console.log('🔍 LEGITIMATE SIBLING VALIDATION TEST');
console.log('');

const aliceToCharlie = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'alice'),
  testPeople.find(p => p.id === 'charlie'),
  testPeople,
  legitimateSiblingData
);

const charlieToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'charlie'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  legitimateSiblingData
);

console.log(`Alice -> Charlie: ${aliceToCharlie} (Expected: Brother)`);
console.log(`Charlie -> Alice: ${charlieToAlice} (Expected: Sister)`);

if (aliceToCharlie === 'Brother' && charlieToAlice === 'Sister') {
  console.log('✅ Legitimate siblings still work correctly!');
} else {
  console.log('❌ Fix broke legitimate sibling relationships');
}
