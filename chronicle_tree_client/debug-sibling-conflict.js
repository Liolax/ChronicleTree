import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Let me try to recreate the exact scenario where Molly shows as Sister
const problematicRelationships = [
  // What if your database has Alice and Charlie as siblings explicitly?
  { source: 'alice', target: 'charlie', relationship_type: 'sibling', is_ex: false },
  { source: 'charlie', target: 'alice', relationship_type: 'sibling', is_ex: false },
  
  // And somehow Molly gets marked as their sibling too?
  { source: 'molly', target: 'alice', relationship_type: 'sibling', is_ex: false },
  { source: 'alice', target: 'molly', relationship_type: 'sibling', is_ex: false },
  { source: 'molly', target: 'charlie', relationship_type: 'sibling', is_ex: false },
  { source: 'charlie', target: 'molly', relationship_type: 'sibling', is_ex: false },
  
  // But also parent relationships exist
  { source: 'molly', target: 'jane', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'molly', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'charlie', relationship_type: 'parent', is_ex: false },
  { source: 'charlie', target: 'jane', relationship_type: 'child', is_ex: false },
];

const testPeople = [
  { id: 'molly', full_name: 'Molly E', gender: 'female' },
  { id: 'jane', full_name: 'Jane Doe', gender: 'female' },
  { id: 'alice', full_name: 'Alice A', gender: 'female' },
  { id: 'charlie', full_name: 'Charlie C', gender: 'male' },
];

console.log('🔍 PROBLEMATIC SIBLING RELATIONSHIPS CHECK');
console.log('');
console.log('Scenario: Molly has BOTH sibling AND parent-chain relationships to Alice/Charlie');
console.log('');

const mollyToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  problematicRelationships
);

const mollyToCharlie = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'charlie'),
  testPeople,
  problematicRelationships
);

console.log(`Molly -> Alice: ${mollyToAlice}`);
console.log(`Molly -> Charlie: ${mollyToCharlie}`);

console.log('');
if (mollyToAlice === 'Sister' || mollyToCharlie === 'Sister') {
  console.log('🚨 FOUND THE BUG: Molly showing as Sister!');
  console.log('   This means your database has conflicting sibling relationships');
  console.log('   that override the correct generational relationships.');
} else {
  console.log('✅ No sister issue with this data');
}

console.log('');
console.log('Your database likely has both:');
console.log('  1. Correct: Molly -> Jane -> Alice/Charlie (generational)');
console.log('  2. Incorrect: Molly <-> Alice/Charlie (direct sibling entries)');
console.log('');
console.log('The sibling relationships are taking precedence over the');
console.log('correct generational calculation.');
