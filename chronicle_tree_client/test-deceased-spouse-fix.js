/**
 // Test data with deceased spouse scenario
const testPeople = [
  { id: 'john', full_name: 'John Doe', gender: 'male' },
  { id: 'jane', full_name: 'Jane Doe (Sharma)', gender: 'female', date_of_death: '2020-03-15' }, // Deceased spouse
  { id: 'richard', full_name: 'Richard Sharma', gender: 'male' },
  { id: 'margaret', full_name: 'Margaret Sharma', gender: 'female' },
  { id: 'alice', full_name: 'Alice Doe', gender: 'female' },
  { id: 'charlie', full_name: 'Charlie Doe', gender: 'male' },
];

const testRelationships = [
  // John and Jane are married but Jane is deceased (automatically detected via date_of_death)
  { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false },
  { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false },to verify the deceased spouse relationship fix
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test data with deceased spouse scenario
const testPeople = [
  { id: 'john', full_name: 'John Doe', gender: 'male' },
  { id: 'jane', full_name: 'Jane Doe (Sharma)', gender: 'female', death_date: '2020-03-15' }, // Deceased spouse
  { id: 'richard', full_name: 'Richard Sharma', gender: 'male' },
  { id: 'margaret', full_name: 'Margaret Sharma', gender: 'female' },
  { id: 'alice', full_name: 'Alice Doe', gender: 'female' },
  { id: 'charlie', full_name: 'Charlie Doe', gender: 'male' },
];

const testRelationships = [
  // John and Jane are married but Jane is deceased (automatically detected via death_date)
  { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false },
  { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false },
  
  // Richard and Margaret are Jane's parents
  { source: 'richard', target: 'jane', relationship_type: 'parent', is_ex: false },
  { source: 'margaret', target: 'jane', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'richard', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'margaret', relationship_type: 'child', is_ex: false },
  
  // Alice and Charlie are children of John and Jane
  { source: 'john', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'john', target: 'charlie', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'charlie', relationship_type: 'parent', is_ex: false },
  { source: 'alice', target: 'john', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'charlie', target: 'john', relationship_type: 'child', is_ex: false },
  { source: 'charlie', target: 'jane', relationship_type: 'child', is_ex: false },
];

// Test the relationships
console.log('=== DECEASED SPOUSE RELATIONSHIP FIX TEST ===\n');

const john = testPeople.find(p => p.id === 'john');
const richard = testPeople.find(p => p.id === 'richard');
const margaret = testPeople.find(p => p.id === 'margaret');
const alice = testPeople.find(p => p.id === 'alice');
const charlie = testPeople.find(p => p.id === 'charlie');

console.log('Testing with John Doe as root:');

// This should NOT show Richard and Margaret as parents-in-law
const richardToJohn = calculateRelationshipToRoot(richard, john, testPeople, testRelationships);
const margaretToJohn = calculateRelationshipToRoot(margaret, john, testPeople, testRelationships);

console.log(`  Richard Sharma -> John Doe: ${richardToJohn}`);
console.log(`  Margaret Sharma -> John Doe: ${margaretToJohn}`);

// But they should still be grandparents to Alice and Charlie
console.log('\nTesting with Alice as root:');
const richardToAlice = calculateRelationshipToRoot(richard, alice, testPeople, testRelationships);
const margaretToAlice = calculateRelationshipToRoot(margaret, alice, testPeople, testRelationships);

console.log(`  Richard Sharma -> Alice: ${richardToAlice}`);
console.log(`  Margaret Sharma -> Alice: ${margaretToAlice}`);

console.log('\nTesting with Charlie as root:');
const richardToCharlie = calculateRelationshipToRoot(richard, charlie, testPeople, testRelationships);
const margaretToCharlie = calculateRelationshipToRoot(margaret, charlie, testPeople, testRelationships);

console.log(`  Richard Sharma -> Charlie: ${richardToCharlie}`);
console.log(`  Margaret Sharma -> Charlie: ${margaretToCharlie}`);

console.log('\n=== EXPECTED RESULTS ===');
console.log('Richard/Margaret -> John: Should be "Unrelated" (not parents-in-law)');
console.log('Richard/Margaret -> Alice/Charlie: Should be "Grandfather"/"Grandmother"');
console.log('\nNote: Jane is automatically detected as deceased due to date_of_death field.');
