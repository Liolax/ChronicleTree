import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Extract the exact test data to debug co-parent-in-law relationship
const testPeople = [
  { id: '1', full_name: 'John Doe', gender: 'male' },
  { id: '2', full_name: 'Jane Doe', gender: 'female' },
  { id: '3', full_name: 'Alice A', gender: 'female' },
  { id: '4', full_name: 'David A', gender: 'male' }, // Note: David A, not David B
  { id: '5', full_name: 'Charlie C', gender: 'male' },
  { id: '6', full_name: 'Bob D', gender: 'male' },
  { id: '7', full_name: 'Emily E', gender: 'female' },
  { id: '8', full_name: 'Michael A', gender: 'male' }, // David's father
  { id: '9', full_name: 'Susan A', gender: 'female' }, // David's mother
  { id: '10', full_name: 'Frank Doe', gender: 'male' }, // John's father (great-grandparent)
  { id: '11', full_name: 'Rose Doe', gender: 'female' }, // John's mother (great-grandparent)
];

// Extended relationships with great-grandparents and co-parents
const testRelationships = [
  // Core family relationships
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '1', target: '5', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '5', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '6', relationship_type: 'parent', is_ex: false },
  { source: '4', target: '6', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '7', relationship_type: 'parent', is_ex: false },
  { source: '4', target: '7', relationship_type: 'parent', is_ex: false },
  
  // David's parents (for co-parent-in-law testing)
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false }, // Michael -> David
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false }, // Susan -> David
  
  // Great-grandparents
  { source: '10', target: '1', relationship_type: 'parent', is_ex: false }, // Frank -> John
  { source: '11', target: '1', relationship_type: 'parent', is_ex: false }, // Rose -> John
  
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
  
  // Ex-spouse relationship (Alice A and David A were married)
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true },
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
];

console.log('🔍 Co-parent-in-law relationship analysis:');
console.log('\nFamily structure:');
console.log('Michael (8) + Susan (9) are parents of David (4)');
console.log('John (1) + Jane (2) are parents of Alice (3)');
console.log('Alice (3) and David (4) are ex-spouses');
console.log('Alice (3) + David (4) have children Bob (6) and Emily (7)');
console.log('');
console.log('Expected: Michael and Jane should be co-parents-in-law');
console.log('  Because Michael is parent of David');
console.log('  And Jane is parent of Alice');
console.log('  And David and Alice are ex-spouses with children');

const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
const michaelA = testPeople.find(p => p.full_name === 'Michael A');
const aliceA = testPeople.find(p => p.full_name === 'Alice A');

console.log('\n🔍 Testing relationships:');
const michaelToJane = calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships);
const michaelToAlice = calculateRelationshipToRoot(michaelA, aliceA, testPeople, testRelationships);

console.log(`Michael -> Jane: ${michaelToJane} (Expected: Co-Father-in-law)`);
console.log(`Michael -> Alice: ${michaelToAlice} (Expected: Unrelated for ex-spouse relative)`);

if (michaelToJane === 'Co-Father-in-law') {
  console.log('✅ Co-parent-in-law working');
} else {
  console.log('❌ Co-parent-in-law NOT working');
}

if (michaelToAlice === 'Unrelated') {
  console.log('✅ Ex-spouse relative correctly unrelated');
} else {
  console.log(`❌ Ex-spouse relative showing as: ${michaelToAlice}`);
}
