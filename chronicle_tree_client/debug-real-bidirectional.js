import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Simulating what might be your actual database format with bidirectional relationships
const realWorldRelationships = [
  // Molly is parent of Jane (your database might have this)
  { source: 'molly', target: 'jane', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'molly', relationship_type: 'child', is_ex: false },
  
  // Jane is parent of Alice and Charlie
  { source: 'jane', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'charlie', relationship_type: 'parent', is_ex: false },
  { source: 'charlie', target: 'jane', relationship_type: 'child', is_ex: false },
  
  // Alice and Charlie spouses
  { source: 'alice', target: 'charlie', relationship_type: 'spouse', is_ex: false },
  { source: 'charlie', target: 'alice', relationship_type: 'spouse', is_ex: false },
];

const testPeople = [
  { id: 'molly', full_name: 'Molly E', gender: 'female' },
  { id: 'jane', full_name: 'Jane Doe', gender: 'female' },
  { id: 'alice', full_name: 'Alice A', gender: 'female' },
  { id: 'charlie', full_name: 'Charlie C', gender: 'male' },
];

console.log('🔍 REAL WORLD BIDIRECTIONAL RELATIONSHIPS CHECK');
console.log('');

// Check format detection
const hasParentType = realWorldRelationships.some(r => (r.type || r.relationship_type) === 'parent');
const hasChildType = realWorldRelationships.some(r => (r.type || r.relationship_type) === 'child');
const isRailsFormat = hasParentType && hasChildType;

console.log(`Format Detection: ${isRailsFormat ? 'Rails (bidirectional)' : 'Test (unidirectional)'}`);
console.log('');

if (isRailsFormat) {
  console.log('⚠️  RAILS FORMAT DETECTED - This might cause issues!');
  console.log('In Rails format:');
  console.log('  { source: "molly", target: "jane", relationship_type: "parent" }');
  console.log('  means: "molly HAS parent jane" → jane is parent of molly ❌ WRONG');
  console.log('');
}

console.log('Testing actual relationships:');
const mollyToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  realWorldRelationships
);

const mollyToCharlie = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'charlie'),
  testPeople,
  realWorldRelationships
);

const aliceToCharlie = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'alice'),
  testPeople.find(p => p.id === 'charlie'),
  testPeople,
  realWorldRelationships
);

console.log(`Molly -> Alice: ${mollyToAlice} (Expected: Grandmother)`);
console.log(`Molly -> Charlie: ${mollyToCharlie} (Expected: Grandmother)`);
console.log(`Alice -> Charlie: ${aliceToCharlie} (Expected: Sister or Spouse)`);

console.log('');
console.log('🚨 ISSUE ANALYSIS:');
if (mollyToAlice === 'Sister' || mollyToCharlie === 'Sister') {
  console.log('❌ BUG CONFIRMED: Molly showing as Sister instead of Grandmother');
  console.log('   This is caused by Rails format interpretation of bidirectional data');
} else {
  console.log('✅ Working correctly with this data format');
}
