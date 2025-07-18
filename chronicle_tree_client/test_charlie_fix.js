/**
 * Test script to verify Charlie's relationships after database fix
 * This tests the frontend relationship calculator with correct data
 */

import { calculateRelationshipToRoot, getAllRelationshipsToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test data matching the current database state (after the fix)
const testPeople = [
  { id: 31, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 32, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 33, first_name: 'Alice', last_name: 'A', gender: 'Female', date_of_birth: '1990-01-01' },
  { id: 34, first_name: 'David', last_name: 'A', gender: 'Male', date_of_birth: '1988-01-01' },
  { id: 35, first_name: 'Bob', last_name: 'B', gender: 'Male', date_of_birth: '2010-01-01' },
  { id: 36, first_name: 'Emily', last_name: 'E', gender: 'Female', date_of_birth: '2012-01-01' },
  { id: 37, first_name: 'Charlie', last_name: 'C', gender: 'Male', date_of_birth: '2014-01-01' },
  { id: 38, first_name: 'Michael', last_name: 'A', gender: 'Male', date_of_birth: '1960-01-01' }
];

// Fixed relationships based on database state after fix
const testRelationships = [
  // Parent-child relationships
  { source: 31, target: 33, type: 'parent' }, // John -> Alice
  { source: 32, target: 33, type: 'parent' }, // Jane -> Alice
  { source: 31, target: 37, type: 'parent' }, // John -> Charlie
  { source: 32, target: 37, type: 'parent' }, // Jane -> Charlie
  { source: 33, target: 35, type: 'parent' }, // Alice -> Bob
  { source: 34, target: 35, type: 'parent' }, // David -> Bob
  { source: 33, target: 36, type: 'parent' }, // Alice -> Emily
  { source: 34, target: 36, type: 'parent' }, // David -> Emily
  { source: 38, target: 34, type: 'parent' }, // Michael -> David
  
  // Spouse relationships
  { source: 31, target: 32, type: 'spouse', is_ex: false }, // John <-> Jane
  { source: 32, target: 31, type: 'spouse', is_ex: false },
  { source: 33, target: 34, type: 'spouse', is_ex: true }, // Alice <-> David (EX-SPOUSES - FIXED!)
  { source: 34, target: 33, type: 'spouse', is_ex: true },
  
  // Sibling relationships
  { source: 33, target: 37, type: 'sibling' }, // Alice <-> Charlie
  { source: 37, target: 33, type: 'sibling' },
  { source: 35, target: 36, type: 'sibling' }, // Bob <-> Emily
  { source: 36, target: 35, type: 'sibling' }
];

console.log('=== TESTING CHARLIE\'S RELATIONSHIPS AFTER DATABASE FIX ===');

const charlie = testPeople.find(p => p.first_name === 'Charlie');

// Test all relationships with Charlie as root
const allRelationships = getAllRelationshipsToRoot(charlie, testPeople, testRelationships);

console.log('\nCharlie\'s Family Tree (Charlie as Root):');
allRelationships.forEach(person => {
  console.log(`${person.first_name} ${person.last_name}: ${person.relation}`);
});

console.log('\n=== SPECIFIC TESTS ===');

// Test David's relationship to Charlie (should now be Unrelated)
const david = testPeople.find(p => p.first_name === 'David');
const davidToCharlie = calculateRelationshipToRoot(david, charlie, testPeople, testRelationships);
console.log(`David A -> Charlie C: ${davidToCharlie} (Expected: Unrelated)`);

// Test Alice's relationship to Charlie (should be Sister)
const alice = testPeople.find(p => p.first_name === 'Alice');
const aliceToCharlie = calculateRelationshipToRoot(alice, charlie, testPeople, testRelationships);
console.log(`Alice A -> Charlie C: ${aliceToCharlie} (Expected: Sister)`);

// Test John's relationship to Charlie (should be Father)
const john = testPeople.find(p => p.first_name === 'John');
const johnToCharlie = calculateRelationshipToRoot(john, charlie, testPeople, testRelationships);
console.log(`John Doe -> Charlie C: ${johnToCharlie} (Expected: Father)`);

// Test Bob's relationship to Charlie (should be Nephew)
const bob = testPeople.find(p => p.first_name === 'Bob');
const bobToCharlie = calculateRelationshipToRoot(bob, charlie, testPeople, testRelationships);
console.log(`Bob B -> Charlie C: ${bobToCharlie} (Expected: Nephew)`);

console.log('\n=== FIX VERIFICATION ===');
if (davidToCharlie === 'Unrelated') {
  console.log('✅ SUCCESS: David is now correctly showing as "Unrelated" to Charlie');
} else {
  console.log(`❌ ISSUE: David is still showing as "${davidToCharlie}" instead of "Unrelated"`);
}

if (aliceToCharlie === 'Sister') {
  console.log('✅ SUCCESS: Alice is correctly showing as "Sister" to Charlie');
} else {
  console.log(`❌ ISSUE: Alice is showing as "${aliceToCharlie}" instead of "Sister"`);
}
