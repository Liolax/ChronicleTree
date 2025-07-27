/**
 * Test that blood relationships (including half-relatives) are not blocked by timeline validation
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1990-01-15', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1992-07-20', date_of_death: '2015-03-10', is_deceased: true },
  { id: 4, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '2014-11-12', date_of_death: '2019-05-01', is_deceased: true }, // DIED BEFORE MICHAEL BORN
  { id: 8, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 9, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2018-03-22', date_of_death: '2022-01-15', is_deceased: true }, // DIED BEFORE MICHAEL BORN
  { id: 12, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false }, // BORN AFTER EMMA DIED
];

const testRelationships = [
  // John is parent of Charlie
  { person_id: 4, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 4, relationship_type: 'child' },  
  // Jane is parent of Charlie  
  { person_id: 4, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 4, relationship_type: 'child' },  
  // Charlie is parent of Emma
  { person_id: 9, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 9, relationship_type: 'child' },  
  // John and Lisa are parents of Michael
  { person_id: 12, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 12, relationship_type: 'child' },
  { person_id: 12, relative_id: 8, relationship_type: 'parent' },
  { person_id: 8, relative_id: 12, relationship_type: 'child' },
];

const michael = testPeople.find(p => p.first_name === 'Michael');
const emma = testPeople.find(p => p.first_name === 'Emma');
const charlie = testPeople.find(p => p.first_name === 'Charlie');

console.log('=== Timeline Conflict Test ===');
console.log('Family Structure:');
console.log('- John (alive)');
console.log('  ├── Charlie (died 2019-05-01) + Jane → Emma (died 2022-01-15)');
console.log('  └── Michael (born 2024-08-15) + Lisa');
console.log('');

console.log('Timeline Analysis:');
console.log(`Emma died: ${emma.date_of_death}`);
console.log(`Michael born: ${michael.date_of_birth}`);
console.log('❌ Michael was born AFTER Emma died - they never lived at the same time');
console.log('✅ But they are BLOOD relatives (half-uncle/half-niece) through shared grandfather John');

console.log('\n=== Relationship Tests ===');

// Test 1: Michael as root, Emma as person
const emmaToMichael = calculateRelationshipToRoot(emma, michael, testPeople, testRelationships);
console.log(`Emma relationship to Michael (Michael as root): ${emmaToMichael}`);

if (emmaToMichael === 'Half-Niece') {
  console.log('✅ SUCCESS: Blood relationship (Half-Niece) is preserved despite timeline conflict');
} else if (emmaToMichael === 'Unrelated') {
  console.log('❌ FAILURE: Timeline validation incorrectly blocked blood relationship');
  console.log('   This is the bug - blood relatives should NEVER be blocked by timeline');
} else {
  console.log(`⚠️  UNEXPECTED: Got "${emmaToMichael}" instead of "Half-Niece"`);
}

// Test 2: Emma as root, Michael as person  
const michaelToEmma = calculateRelationshipToRoot(michael, emma, testPeople, testRelationships);
console.log(`Michael relationship to Emma (Emma as root): ${michaelToEmma}`);

if (michaelToEmma === 'Half-Uncle') {
  console.log('✅ SUCCESS: Blood relationship (Half-Uncle) is preserved despite timeline conflict');
} else if (michaelToEmma === 'Unrelated') {
  console.log('❌ FAILURE: Timeline validation incorrectly blocked blood relationship');
} else {
  console.log(`⚠️  UNEXPECTED: Got "${michaelToEmma}" instead of "Half-Uncle"`);
}

console.log('\n=== Blood Relationship Logic Test ===');
console.log('Key principle: Blood relationships exist regardless of timeline');
console.log('Examples:');
console.log('- A half-uncle who died before his half-niece was born is still her half-uncle');
console.log('- A great-grandmother who died centuries ago is still your great-grandmother');
console.log('- Siblings who lived in different eras are still siblings');
console.log('');
console.log('Only STEP-RELATIONSHIPS and IN-LAW relationships should be blocked by timeline,');
console.log('because they depend on marriages that must have existed when both people were alive.');

// Test with normal timeline (both alive)
console.log('\n=== Control Test: Normal Timeline ===');
const normalMichael = { ...michael, date_of_birth: '2020-08-15' }; // Born when Emma was alive
const normalEmmaToMichael = calculateRelationshipToRoot(emma, normalMichael, testPeople, testRelationships);
console.log(`Emma to Michael (normal timeline): ${normalEmmaToMichael}`);
console.log(`Expected: "Half-Niece" - ${normalEmmaToMichael === 'Half-Niece' ? '✅' : '❌'}`);

console.log('\n=== Summary ===');
if (emmaToMichael === 'Half-Niece' && michaelToEmma === 'Half-Uncle') {
  console.log('✅ FIXED: Timeline validation no longer blocks blood relationships');
  console.log('   Half-relatives can see each other regardless of when they lived');
} else {
  console.log('❌ STILL BROKEN: Timeline validation is blocking blood relationships');
  console.log('   This needs to be fixed - blood relatives should always be related');
}