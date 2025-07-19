import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  { id: '1', full_name: 'John Doe', gender: 'male' },
  { id: '2', full_name: 'Jane Doe', gender: 'female' },
  { id: '3', full_name: 'Alice A', gender: 'female' },
  { id: '4', full_name: 'David A', gender: 'male' },
  { id: '8', full_name: 'Michael A', gender: 'male' },
  { id: '9', full_name: 'Susan A', gender: 'female' },
];

const testRelationships = [
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '1', relationship_type: 'child', is_ex: false },
  { source: '3', target: '2', relationship_type: 'child', is_ex: false },
  { source: '4', target: '8', relationship_type: 'child', is_ex: false },
  { source: '4', target: '9', relationship_type: 'child', is_ex: false },
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: false },
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: false },
];

console.log('🔍 Debugging Co-Parent Logic');
console.log('');

// Let's manually check what the maps should contain
console.log('Expected relationships:');
console.log('  parentToChildren map:');
console.log('    - Michael (8) -> David (4)');
console.log('    - Susan (9) -> David (4)');
console.log('    - John (1) -> Alice (3)');
console.log('    - Jane (2) -> Alice (3)');
console.log('');
console.log('  spouseMap:');
console.log('    - Alice (3) -> David (4)');
console.log('    - David (4) -> Alice (3)');
console.log('');

// Test if the issue is with the specific relationship calculator import
// Let's test with a simple debug
const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
const michaelA = testPeople.find(p => p.full_name === 'Michael A');

const result = calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships);
console.log(`Michael (parent of David) -> Jane (parent of Alice): ${result}`);

// Test the reverse
const result2 = calculateRelationshipToRoot(janeDoe, michaelA, testPeople, testRelationships);
console.log(`Jane (parent of Alice) -> Michael (parent of David): ${result2}`);

// Test Alice and David relationship to confirm spouses work
const aliceA = testPeople.find(p => p.full_name === 'Alice A');
const davidA = testPeople.find(p => p.full_name === 'David A');
const result3 = calculateRelationshipToRoot(aliceA, davidA, testPeople, testRelationships);
console.log(`Alice -> David: ${result3}`);

// Look for the logic that checks for co-parent relationships
console.log('');
console.log('Logic check:');
console.log('  - Michael is parent of David ✓');
console.log('  - Jane is parent of Alice ✓'); 
console.log('  - David is current spouse of Alice ✓');
console.log('  - Therefore: Michael should be Co-Father-in-law to Jane ✓');
