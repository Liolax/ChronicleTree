// Test specifically for Molly relationship issues
// Based on user's description: Molly is mother of Jane, but showing as sister to Charlie/Alice

import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

// Test data representing the issue
const testPeople = [
  { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
  { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
  { id: 'alice', first_name: 'Alice', last_name: 'A', gender: 'Female' },
  { id: 'charlie', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
  { id: 'david', first_name: 'David', last_name: 'A', gender: 'Male' },
  { id: 'bob', first_name: 'Bob', last_name: 'B', gender: 'Male' },
  { id: 'emily', first_name: 'Emily', last_name: 'E', gender: 'Female' },
  { id: 'molly', first_name: 'Molly', last_name: 'M', gender: 'Female' } // NEW: Molly as mother of Jane
];

const testRelationships = [
  // John and Jane are spouses
  { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false },
  { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false },
  
  // CRITICAL: Molly is mother of Jane
  { source: 'molly', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'molly', relationship_type: 'parent', is_ex: false },
  
  // John and Jane are parents of Alice and Charlie
  { source: 'john', target: 'alice', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'john', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'alice', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'parent', is_ex: false },
  
  { source: 'john', target: 'charlie', relationship_type: 'child', is_ex: false },
  { source: 'charlie', target: 'john', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'charlie', relationship_type: 'child', is_ex: false },
  { source: 'charlie', target: 'jane', relationship_type: 'parent', is_ex: false },
  
  // David is ex-husband of Alice
  { source: 'david', target: 'alice', relationship_type: 'spouse', is_ex: true },
  { source: 'alice', target: 'david', relationship_type: 'spouse', is_ex: true },
  
  // Bob and Emily are children of Alice and David
  { source: 'alice', target: 'bob', relationship_type: 'child', is_ex: false },
  { source: 'bob', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'david', target: 'bob', relationship_type: 'child', is_ex: false },
  { source: 'bob', target: 'david', relationship_type: 'parent', is_ex: false },
  
  { source: 'alice', target: 'emily', relationship_type: 'child', is_ex: false },
  { source: 'emily', target: 'alice', relationship_type: 'parent', is_ex: false },
  { source: 'david', target: 'emily', relationship_type: 'child', is_ex: false },
  { source: 'emily', target: 'david', relationship_type: 'parent', is_ex: false },
];

console.log('=== MOLLY RELATIONSHIP DEBUGGING ===');
console.log('');

// Test 1: Molly to Alice - should be "Grandmother", not "Sister"
console.log('Test 1: Molly to Alice');
const mollyToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  testRelationships
);
console.log(`  Expected: Grandmother`);
console.log(`  Actual: ${mollyToAlice}`);
console.log(`  Status: ${mollyToAlice === 'Grandmother' ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log('');

// Test 2: Molly to Charlie - should be "Grandmother", not "Sister"
console.log('Test 2: Molly to Charlie');
const mollyToCharlie = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'charlie'),
  testPeople,
  testRelationships
);
console.log(`  Expected: Grandmother`);
console.log(`  Actual: ${mollyToCharlie}`);
console.log(`  Status: ${mollyToCharlie === 'Grandmother' ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log('');

// Test 3: Molly to David - should be "Unrelated" (ex-spouse relatives are unrelated)
console.log('Test 3: Molly to David');
const mollyToDavid = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'david'),
  testPeople,
  testRelationships
);
console.log(`  Expected: Unrelated`);
console.log(`  Actual: ${mollyToDavid}`);
console.log(`  Status: ${mollyToDavid === 'Unrelated' ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log('');

// Test 4: Molly to Bob - should be "Great-Grandmother" (correct according to user)
console.log('Test 4: Molly to Bob');
const mollyToBob = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'bob'),
  testPeople,
  testRelationships
);
console.log(`  Expected: Great-Grandmother`);
console.log(`  Actual: ${mollyToBob}`);
console.log(`  Status: ${mollyToBob === 'Great-Grandmother' ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log('');

// Test 5: Molly to Emily - should be "Great-Grandmother" (correct according to user)
console.log('Test 5: Molly to Emily');
const mollyToEmily = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'emily'),
  testPeople,
  testRelationships
);
console.log(`  Expected: Great-Grandmother`);
console.log(`  Actual: ${mollyToEmily}`);
console.log(`  Status: ${mollyToEmily === 'Great-Grandmother' ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log('');

// Test 6: Molly to Jane - should be "Mother"
console.log('Test 6: Molly to Jane');
const mollyToJane = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'jane'),
  testPeople,
  testRelationships
);
console.log(`  Expected: Mother`);
console.log(`  Actual: ${mollyToJane}`);
console.log(`  Status: ${mollyToJane === 'Mother' ? '✅ CORRECT' : '❌ INCORRECT'}`);
console.log('');

console.log('=== SUMMARY ===');
const tests = [
  { name: 'Molly to Alice', result: mollyToAlice, expected: 'Grandmother' },
  { name: 'Molly to Charlie', result: mollyToCharlie, expected: 'Grandmother' },
  { name: 'Molly to David', result: mollyToDavid, expected: 'Unrelated' },
  { name: 'Molly to Bob', result: mollyToBob, expected: 'Great-Grandmother' },
  { name: 'Molly to Emily', result: mollyToEmily, expected: 'Great-Grandmother' },
  { name: 'Molly to Jane', result: mollyToJane, expected: 'Mother' }
];

const correctCount = tests.filter(t => t.result === t.expected).length;
console.log(`Tests passed: ${correctCount}/${tests.length}`);
console.log(`Tests failed: ${tests.length - correctCount}/${tests.length}`);

if (correctCount === tests.length) {
  console.log('🎉 ALL TESTS PASSED - Molly relationship logic is working correctly!');
} else {
  console.log('❌ SOME TESTS FAILED - Molly relationship logic needs fixing');
  console.log('');
  console.log('Failed tests:');
  tests.filter(t => t.result !== t.expected).forEach(t => {
    console.log(`  - ${t.name}: Expected "${t.expected}", got "${t.result}"`);
  });
}
