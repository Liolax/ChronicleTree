/**
 * Debug test for relationship calculation
 */
import { calculateRelationshipToRoot } from './improvedRelationshipCalculator.js';

// Test data based on what we know from the database
const testPeople = [
  { id: 5, first_name: 'Charlie', last_name: 'C', full_name: 'Charlie C', gender: 'Male' },
  { id: 3, first_name: 'Alice', last_name: 'A', full_name: 'Alice A', gender: 'Female' },
  { id: 4, first_name: 'David', last_name: 'A', full_name: 'David A', gender: 'Male' },
  { id: 6, first_name: 'Bob', last_name: 'E', full_name: 'Bob E', gender: 'Male' },
  { id: 7, first_name: 'Emily', last_name: 'E', full_name: 'Emily E', gender: 'Female' },
  { id: 1, first_name: 'John', last_name: 'D', full_name: 'John D', gender: 'Male' },
  { id: 2, first_name: 'Jane', last_name: 'D', full_name: 'Jane D', gender: 'Female' },
];

// Test relationships based on what we know from database
const testRelationships = [
  // Charlie-Alice sibling relationship
  { from: 5, to: 3, type: 'sibling', is_ex: false },
  { from: 3, to: 5, type: 'sibling', is_ex: false },
  
  // Alice-David ex-spouse relationship
  { from: 3, to: 4, type: 'spouse', is_ex: true },
  { from: 4, to: 3, type: 'spouse', is_ex: true },
  
  // Parent-child relationships
  { from: 1, to: 5, type: 'parent', is_ex: false }, // John -> Charlie
  { from: 2, to: 5, type: 'parent', is_ex: false }, // Jane -> Charlie
  { from: 1, to: 3, type: 'parent', is_ex: false }, // John -> Alice
  { from: 2, to: 3, type: 'parent', is_ex: false }, // Jane -> Alice
  { from: 3, to: 6, type: 'parent', is_ex: false }, // Alice -> Bob
  { from: 4, to: 6, type: 'parent', is_ex: false }, // David -> Bob
  { from: 3, to: 7, type: 'parent', is_ex: false }, // Alice -> Emily
  { from: 4, to: 7, type: 'parent', is_ex: false }, // David -> Emily
];

export function testRelationshipCalculation() {
  console.log('=== RELATIONSHIP CALCULATION TEST ===');
  
  const charlie = testPeople.find(p => p.id === 5);
  const alice = testPeople.find(p => p.id === 3);
  const david = testPeople.find(p => p.id === 4);
  const bob = testPeople.find(p => p.id === 6);
  const emily = testPeople.find(p => p.id === 7);
  
  console.log('Test people:', testPeople);
  console.log('Test relationships:', testRelationships);
  
  // Test Charlie as root
  console.log('\n--- Testing with Charlie as Root ---');
  const aliceToCharlie = calculateRelationshipToRoot(alice, charlie, testPeople, testRelationships);
  console.log(`Alice → Charlie: "${aliceToCharlie}"`);
  
  const davidToCharlie = calculateRelationshipToRoot(david, charlie, testPeople, testRelationships);
  console.log(`David → Charlie: "${davidToCharlie}"`);
  
  const bobToCharlie = calculateRelationshipToRoot(bob, charlie, testPeople, testRelationships);
  console.log(`Bob → Charlie: "${bobToCharlie}"`);
  
  const emilyToCharlie = calculateRelationshipToRoot(emily, charlie, testPeople, testRelationships);
  console.log(`Emily → Charlie: "${emilyToCharlie}"`);
  
  console.log('=== END TEST ===');
}
