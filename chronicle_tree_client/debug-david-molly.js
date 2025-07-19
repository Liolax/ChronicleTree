import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

const testData = [
  { id: 'molly', name: 'Molly', gender: 'female', relationships: [{ personId: 'jane', relationship: 'parent' }] },
  { id: 'jane', name: 'Jane', gender: 'female', relationships: [{ personId: 'molly', relationship: 'child' }, { personId: 'alice', relationship: 'parent' }, { personId: 'charlie', relationship: 'parent' }] },
  { id: 'alice', name: 'Alice', gender: 'female', relationships: [{ personId: 'jane', relationship: 'child' }, { personId: 'charlie', relationship: 'spouse' }, { personId: 'david', relationship: 'ex-spouse' }] },
  { id: 'charlie', name: 'Charlie C', gender: 'male', relationships: [{ personId: 'jane', relationship: 'child' }, { personId: 'alice', relationship: 'spouse' }, { personId: 'bob', relationship: 'parent' }, { personId: 'emily', relationship: 'parent' }] },
  { id: 'david', name: 'David', gender: 'male', relationships: [{ personId: 'alice', relationship: 'ex-spouse' }] },
  { id: 'bob', name: 'Bob', gender: 'male', relationships: [{ personId: 'charlie', relationship: 'child' }, { personId: 'emily', relationship: 'spouse' }] },
  { id: 'emily', name: 'Emily', gender: 'female', relationships: [{ personId: 'charlie', relationship: 'child' }, { personId: 'bob', relationship: 'spouse' }] }
];

console.log('🔍 David-Molly Relationship Analysis');
console.log('');
console.log('Family context:');
console.log('  - David: Alice\'s ex-husband');
console.log('  - Molly: Alice\'s mother (Jane\'s mother)');
console.log('  - Expected relationship: ???');
console.log('');

const relationship = calculateRelationshipToRoot('molly', 'david', testData, 'david');

console.log(`Result: Molly -> David: ${relationship || 'null'}`);
console.log('');

console.log('Possible correct relationships:');
console.log('  - "Ex-Mother-in-law" (if ex-spouse relationships maintained)');
console.log('  - "Unrelated" (if ex-spouses become unrelated)');
console.log('  - Current result shows:', relationship || 'null');
