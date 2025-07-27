/**
 * Test the step-father-in-law issue described by the user
 * Sam is Patricia's husband, Sam is root, John Doe appears as Step-Father-in-law
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing Step-Father-in-Law Issue ===');

// Scenario: Sam marries Patricia, John Doe is Patricia's father
const people = [
  { id: 1, first_name: 'Sam', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Doe', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' }
];

const relationships = [
  // Sam and Patricia are married
  { person_id: 1, relative_id: 2, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse' },
  
  // John Doe is Patricia's father
  { person_id: 2, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 2, relationship_type: 'child' }
];

console.log('People:');
people.forEach(p => console.log(`  ${p.first_name} ${p.last_name} (ID: ${p.id})`));

console.log('');
console.log('Relationships:');
relationships.forEach(r => {
  const person = people.find(p => p.id === r.person_id);
  const relative = people.find(p => p.id === r.relative_id);
  console.log(`  ${person.first_name} -> ${relative.first_name}: ${r.relationship_type}`);
});

console.log('');
console.log('--- Relationship Calculations (Sam as Root) ---');

// Test what relationship John Doe has to Sam (Sam is root)
const samPerson = people.find(p => p.first_name === 'Sam');
const johnPerson = people.find(p => p.first_name === 'John');

const johnToSam = calculateRelationshipToRoot(johnPerson, samPerson, people, relationships);
console.log(`John Doe -> Sam (root): ${johnToSam}`);

if (johnToSam.includes('Step-Father-in-law')) {
  console.log('❌ ISSUE REPRODUCED: John Doe is incorrectly showing as Step-Father-in-law');
  console.log('');
  console.log('Analysis of why this is happening:');
  console.log('1. Sam is married to Patricia');
  console.log('2. John Doe is Patricia\'s father');
  console.log('3. The algorithm thinks Sam is married to John Doe (Patricia\'s parent)');
  console.log('4. Since Sam is not Patricia\'s biological parent, it returns Step-Father-in-law');
  console.log('');
  console.log('Expected behavior: John Doe should be Sam\'s Father-in-law, not Step-Father-in-law');
} else {
  console.log('✅ No step-father-in-law relationship detected');
}

console.log('');
console.log('--- Additional Test: What should the relationship be? ---');

// John Doe should be Sam's Father-in-law (not Step-Father-in-law)
// Let's check if there's a direct parent-in-law relationship
console.log('Expected: John Doe should be Sam\'s Father-in-law because:');
console.log('- John Doe is Patricia\'s father');
console.log('- Patricia is Sam\'s wife');
console.log('- Therefore John Doe is Sam\'s Father-in-law');

console.log('');
console.log('--- Testing Reverse Direction ---');

// Test Sam -> John relationship 
const samToJohn = calculateRelationshipToRoot(samPerson, johnPerson, people, relationships);
console.log(`Sam -> John Doe (root): ${samToJohn}`);

console.log('');
console.log('=== Root Cause Analysis ===');
console.log('The step-father-in-law logic is triggered when:');
console.log('1. Person (Sam) has a spouse (Patricia)');
console.log('2. Root (John) is married to spouse\'s parent - BUT THIS IS THE BUG!');
console.log('3. The algorithm incorrectly thinks Sam is married to John');
console.log('4. Since Sam is not Patricia\'s biological parent, it returns Step-Father-in-law');
console.log('');
console.log('The bug is likely in the spouse relationship checking logic.');
console.log('John Doe should be recognized as Patricia\'s father (Father-in-law to Sam), not as');
console.log('someone who Sam is married to (which would make him Step-Father-in-law).');

console.log('');
console.log('=== Recommendation ===');
console.log('The step-father-in-law logic should be removed or fixed because:');
console.log('1. The user states there should be no step-father-in-law logic in the app');
console.log('2. The current logic has bugs that create incorrect relationships');
console.log('3. John Doe should simply be "Father-in-law" to Sam');