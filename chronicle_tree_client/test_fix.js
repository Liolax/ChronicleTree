// Test if the fix is working by directly importing and testing the function
import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test with Charlie C as root (ID 5) and Bob B as person (ID 6)
const testPeople = [
  { id: 1, full_name: 'John Doe', first_name: 'John', last_name: 'Doe', gender: 'Male' },
  { id: 2, full_name: 'Jane Doe', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
  { id: 3, full_name: 'Alice A', first_name: 'Alice', last_name: 'A', gender: 'Female' },
  { id: 4, full_name: 'David A', first_name: 'David', last_name: 'A', gender: 'Male' },
  { id: 5, full_name: 'Charlie C', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
  { id: 6, full_name: 'Bob B', first_name: 'Bob', last_name: 'B', gender: 'Male' },
  { id: 7, full_name: 'Emily E', first_name: 'Emily', last_name: 'E', gender: 'Female' }
];

// Rails format relationships
const relationships = [
  { source: 3, target: 1, relationship_type: 'parent' },
  { source: 3, target: 2, relationship_type: 'parent' },
  { source: 5, target: 1, relationship_type: 'parent' },
  { source: 5, target: 2, relationship_type: 'parent' },
  { source: 6, target: 3, relationship_type: 'parent' },
  { source: 6, target: 4, relationship_type: 'parent' },
  { source: 7, target: 3, relationship_type: 'parent' },
  { source: 7, target: 4, relationship_type: 'parent' },
  { source: 1, target: 3, relationship_type: 'child' },
  { source: 2, target: 3, relationship_type: 'child' },
  { source: 1, target: 5, relationship_type: 'child' },
  { source: 2, target: 5, relationship_type: 'child' },
  { source: 3, target: 6, relationship_type: 'child' },
  { source: 4, target: 6, relationship_type: 'child' },
  { source: 3, target: 7, relationship_type: 'child' },
  { source: 4, target: 7, relationship_type: 'child' },
  { source: 3, target: 5, relationship_type: 'sibling' },
  { source: 5, target: 3, relationship_type: 'sibling' },
  { source: 6, target: 7, relationship_type: 'sibling' },
  { source: 7, target: 6, relationship_type: 'sibling' }
];

console.log('=== TESTING CHARLIE C AS ROOT ===');
const charlie = testPeople.find(p => p.id === 5);
const bob = testPeople.find(p => p.id === 6);
const alice = testPeople.find(p => p.id === 3);

console.log('Charlie:', charlie);
console.log('Bob:', bob);
console.log('Alice:', alice);

// Test specific relationships
const bobToCharlie = calculateRelationshipToRoot(bob, charlie, testPeople, relationships);
const aliceToCharlie = calculateRelationshipToRoot(alice, charlie, testPeople, relationships);

console.log(`Bob -> Charlie: ${bobToCharlie} (expected: Nephew)`);
console.log(`Alice -> Charlie: ${aliceToCharlie} (expected: Sister)`);

if (bobToCharlie === 'Nephew' && aliceToCharlie === 'Sister') {
  console.log('✅ FIX IS WORKING!');
} else {
  console.log('❌ Fix is not working');
}
