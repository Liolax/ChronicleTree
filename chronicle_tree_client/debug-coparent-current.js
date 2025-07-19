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
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: false }, // CURRENT spouses
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: false }, // CURRENT spouses
];

console.log('🔍 Co-Parent-in-Law Testing');
console.log('');
console.log('Family Structure:');
console.log('  - John & Jane Doe are parents of Alice');
console.log('  - Michael & Susan A are parents of David'); 
console.log('  - Alice & David are CURRENT spouses (not ex)');
console.log('  - Expected: Michael should be Co-Father-in-law to Jane');
console.log('');

const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
const michaelA = testPeople.find(p => p.full_name === 'Michael A');

const michaelToJane = calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships);

console.log(`Result: Michael -> Jane: ${michaelToJane}`);
console.log(`Expected: Co-Father-in-law`);
console.log(`Status: ${michaelToJane === 'Co-Father-in-law' ? '✅ WORKING' : '❌ NOT WORKING'}`);

// Let's also test if Alice and David show as spouses correctly
const aliceA = testPeople.find(p => p.full_name === 'Alice A');
const davidA = testPeople.find(p => p.full_name === 'David A');

const aliceToDavid = calculateRelationshipToRoot(aliceA, davidA, testPeople, testRelationships);
console.log('');
console.log('Verification:');
console.log(`Alice -> David: ${aliceToDavid} (should be Husband or Root)`);
