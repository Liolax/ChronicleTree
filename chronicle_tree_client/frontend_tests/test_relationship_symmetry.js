/**
 * Test relationship symmetry between Michael and Emma
 * Expected:
 * - Michael (uncle) -> Emma (niece): Emma should be "Half-Niece"
 * - Emma (niece) -> Michael (uncle): Michael should be "Half-Uncle"
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

const actualPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1990-01-15', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1992-07-20', date_of_death: '2015-03-10', is_deceased: true },
  { id: 4, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '2014-11-12', date_of_death: null, is_deceased: false },
  { id: 8, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 9, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-22', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false },
];

const actualRelationships = [
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

const michael = actualPeople.find(p => p.first_name === 'Michael');
const emma = actualPeople.find(p => p.first_name === 'Emma');
const charlie = actualPeople.find(p => p.first_name === 'Charlie');
const john = actualPeople.find(p => p.first_name === 'John');

console.log('=== Family Structure ===');
console.log('John (1) - father');
console.log('├── Charlie (4) - child of John + Jane');
console.log('│   └── Emma (9) - child of Charlie');
console.log('└── Michael (12) - child of John + Lisa');
console.log('');
console.log('Expected: Michael and Charlie are half-brothers');
console.log('Expected: Emma is Michael\'s half-niece');
console.log('Expected: Michael is Emma\'s half-uncle');

console.log('\n=== Relationship Tests ===');

// Test 1: Michael as root, Emma as person
const emmaToMichael = calculateRelationshipToRoot(emma, michael, actualPeople, actualRelationships);
console.log(`1. Emma relationship to Michael (Michael as root): ${emmaToMichael}`);
console.log(`   Expected: "Half-Niece" (Emma is the niece in this relationship)`);

// Test 2: Emma as root, Michael as person  
const michaelToEmma = calculateRelationshipToRoot(michael, emma, actualPeople, actualRelationships);
console.log(`2. Michael relationship to Emma (Emma as root): ${michaelToEmma}`);
console.log(`   Expected: "Half-Uncle" (Michael is the uncle in this relationship)`);

console.log('\n=== Verification ===');
if (emmaToMichael === 'Half-Niece' && michaelToEmma === 'Half-Uncle') {
  console.log('✅ Relationships are correct and symmetric');
} else {
  console.log('❌ Relationships are incorrect:');
  console.log(`   Got: Emma->Michael="${emmaToMichael}", Michael->Emma="${michaelToEmma}"`);
  console.log(`   Expected: Emma->Michael="Half-Niece", Michael->Emma="Half-Uncle"`);
}

console.log('\n=== Simple Family Example for Reference ===');
console.log('In a family:');
console.log('- If John has two sons: Charlie and Michael (half-brothers)');  
console.log('- And Charlie has a daughter: Emma');
console.log('- Then Emma is Michael\'s niece, and Michael is Emma\'s uncle');
console.log('- Since Charlie and Michael are half-brothers, Emma is Michael\'s half-niece');

console.log('\n=== Testing the Core Issue ===');
console.log('The question is: When Michael is the ROOT person in the family tree,');
console.log('should Emma appear in his tree as his half-niece?');
console.log('');
console.log('Answer: YES - Emma should be visible to Michael as his half-niece');
console.log(`Current result: Emma shows as "${emmaToMichael}" to Michael`);

if (emmaToMichael === 'Half-Niece') {
  console.log('✅ Michael CAN see Emma as his half-niece in the family tree');
} else if (emmaToMichael === 'Unrelated') {
  console.log('❌ Michael CANNOT see Emma - she appears as Unrelated');
} else {
  console.log(`⚠️  Michael sees Emma as "${emmaToMichael}" instead of "Half-Niece"`);
}