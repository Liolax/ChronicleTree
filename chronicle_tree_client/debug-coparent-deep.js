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

console.log('🔬 Deep Debug: Co-Parent Logic');
console.log('');

// First let's make sure basic relationships work
console.log('=== BASIC RELATIONSHIPS ===');
const aliceA = testPeople.find(p => p.full_name === 'Alice A');
const davidA = testPeople.find(p => p.full_name === 'David A');
const johnDoe = testPeople.find(p => p.full_name === 'John Doe');
const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
const michaelA = testPeople.find(p => p.full_name === 'Michael A');

console.log(`Alice -> David: ${calculateRelationshipToRoot(aliceA, davidA, testPeople, testRelationships)}`);
console.log(`David -> Alice: ${calculateRelationshipToRoot(davidA, aliceA, testPeople, testRelationships)}`);
console.log(`John -> Alice: ${calculateRelationshipToRoot(johnDoe, aliceA, testPeople, testRelationships)}`);
console.log(`Alice -> John: ${calculateRelationshipToRoot(aliceA, johnDoe, testPeople, testRelationships)}`);
console.log(`Michael -> David: ${calculateRelationshipToRoot(michaelA, davidA, testPeople, testRelationships)}`);
console.log(`David -> Michael: ${calculateRelationshipToRoot(davidA, michaelA, testPeople, testRelationships)}`);

console.log('');
console.log('=== CO-PARENT TARGET ===');
console.log(`Michael -> Jane: ${calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships)}`);
console.log(`Jane -> Michael: ${calculateRelationshipToRoot(janeDoe, michaelA, testPeople, testRelationships)}`);

console.log('');
console.log('=== MANUAL LOGIC CHECK ===');
console.log('For Michael -> Jane to be Co-Father-in-law:');
console.log('1. Michael must be parent of someone');
console.log('2. Jane must be parent of someone');  
console.log('3. Michael\'s child must be current spouse of Jane\'s child');
console.log('');
console.log('Checking:');
console.log('1. Michael (8) is parent of David (4) ✓');
console.log('2. Jane (2) is parent of Alice (3) ✓');
console.log('3. David (4) is current spouse of Alice (3) ✓');
console.log('');
console.log('Therefore: Michael should be Co-Father-in-law to Jane');

// Let's test if the issue is with string vs number IDs
console.log('');
console.log('=== ID DEBUG ===');
console.log(`Michael ID: ${michaelA.id} (type: ${typeof michaelA.id})`);
console.log(`Jane ID: ${janeDoe.id} (type: ${typeof janeDoe.id})`);
console.log(`David ID: ${davidA.id} (type: ${typeof davidA.id})`);
console.log(`Alice ID: ${aliceA.id} (type: ${typeof aliceA.id})`);

// Test alternative scenarios
console.log('');
console.log('=== OTHER COMBINATIONS ===');
const susanA = testPeople.find(p => p.full_name === 'Susan A');
console.log(`Susan -> Jane: ${calculateRelationshipToRoot(susanA, janeDoe, testPeople, testRelationships)}`);
console.log(`Susan -> John: ${calculateRelationshipToRoot(susanA, johnDoe, testPeople, testRelationships)}`);
console.log(`Michael -> John: ${calculateRelationshipToRoot(michaelA, johnDoe, testPeople, testRelationships)}`);
