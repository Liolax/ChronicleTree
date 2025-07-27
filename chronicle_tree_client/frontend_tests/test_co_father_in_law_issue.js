/**
 * Test why Robert Doe is not showing as Co-Father-in-law to Sam (Patricia's husband)
 * This should happen when Robert has a child who is married to Sam's child
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing Co-Father-in-Law Issue ===');

// Scenario that should create Co-Father-in-law relationship:
// - Sam is married to Patricia
// - Robert Doe has a child 
// - Sam has a child
// - Sam's child is married to Robert's child
// This makes Sam and Robert co-parents-in-law (co-fathers-in-law)

const people = [
  // Sam and his family
  { id: 1, first_name: 'Sam', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'SamChild', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
  
  // Robert Doe and his family
  { id: 4, first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '1968-01-01' },
  { id: 5, first_name: 'RobertWife', last_name: 'Doe', gender: 'Female', date_of_birth: '1970-01-01' },
  { id: 6, first_name: 'RobertChild', last_name: 'Doe', gender: 'Female', date_of_birth: '2002-01-01' }
];

const relationships = [
  // Sam and Patricia are married
  { person_id: 1, relative_id: 2, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse' },
  
  // Robert and his wife are married
  { person_id: 4, relative_id: 5, relationship_type: 'spouse' },
  { person_id: 5, relative_id: 4, relationship_type: 'spouse' },
  
  // Sam and Patricia are parents of SamChild
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  
  // Robert and his wife are parents of RobertChild
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 5, relationship_type: 'parent' },
  { person_id: 5, relative_id: 6, relationship_type: 'child' },
  
  // CRITICAL: The children are married to each other
  { person_id: 3, relative_id: 6, relationship_type: 'spouse' },
  { person_id: 6, relative_id: 3, relationship_type: 'spouse' }
];

console.log('Family structure:');
console.log('Sam + Patricia -> SamChild');
console.log('Robert + RobertWife -> RobertChild');
console.log('SamChild married to RobertChild');
console.log('');
console.log('Expected: Sam and Robert should be Co-Fathers-in-law');
console.log('');

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
console.log('--- Testing Co-Father-in-law Relationship ---');

const sam = people.find(p => p.first_name === 'Sam');
const robert = people.find(p => p.first_name === 'Robert');

// Test Robert -> Sam relationship (Sam as root)
const robertToSam = calculateRelationshipToRoot(robert, sam, people, relationships);
console.log(`Robert Doe -> Sam (root): "${robertToSam}"`);

if (robertToSam === 'Co-Father-in-law') {
  console.log('✅ SUCCESS: Co-Father-in-law relationship detected correctly');
} else if (robertToSam === 'No relation') {
  console.log('❌ FAILURE: No relationship detected (should be Co-Father-in-law)');
  console.log('');
  console.log('This means the co-parent-in-law logic is not working correctly');
} else {
  console.log(`❌ UNEXPECTED: Got "${robertToSam}" instead of "Co-Father-in-law"`);
}

console.log('');

// Test Sam -> Robert relationship (Robert as root)
const samToRobert = calculateRelationshipToRoot(sam, robert, people, relationships);
console.log(`Sam -> Robert Doe (root): "${samToRobert}"`);

if (samToRobert === 'Co-Father-in-law') {
  console.log('✅ SUCCESS: Reverse Co-Father-in-law relationship detected correctly');
} else {
  console.log(`❌ FAILURE: Reverse relationship incorrect: "${samToRobert}"`);
}

console.log('');
console.log('--- Debugging Co-Parent-in-law Logic ---');

// Let's manually trace through what should happen:
console.log('Manual trace of co-parent-in-law logic:');
console.log('1. Sam has child: SamChild (ID: 3)');
console.log('2. Robert has child: RobertChild (ID: 6)');
console.log('3. SamChild is married to RobertChild');
console.log('4. Therefore, Sam and Robert are co-parents-in-law');
console.log('');

// Test the children's relationship
const samChild = people.find(p => p.first_name === 'SamChild');
const robertChild = people.find(p => p.first_name === 'RobertChild');

const samChildToRobertChild = calculateRelationshipToRoot(samChild, robertChild, people, relationships);
const robertChildToSamChild = calculateRelationshipToRoot(robertChild, samChild, people, relationships);

console.log(`SamChild -> RobertChild: "${samChildToRobertChild}"`);
console.log(`RobertChild -> SamChild: "${robertChildToSamChild}"`);

if (samChildToRobertChild === 'Spouse' || samChildToRobertChild === 'Husband' || samChildToRobertChild === 'Wife') {
  console.log('✅ Children are correctly identified as spouses');
} else {
  console.log('❌ ISSUE: Children are not recognized as spouses');
  console.log('This could be why co-parent-in-law logic is failing');
}

console.log('');
console.log('--- Alternative Scenario (Simpler) ---');

// Maybe the issue is with the specific names or IDs. Let's try a simpler version:
const simplePeople = [
  { id: 1, first_name: 'Sam', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'SamChild', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
  { id: 3, first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '1968-01-01' },
  { id: 4, first_name: 'RobertChild', last_name: 'Doe', gender: 'Female', date_of_birth: '2002-01-01' }
];

const simpleRelationships = [
  // Sam is parent of SamChild
  { person_id: 2, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 2, relationship_type: 'child' },
  
  // Robert is parent of RobertChild  
  { person_id: 4, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 4, relationship_type: 'child' },
  
  // The children are married
  { person_id: 2, relative_id: 4, relationship_type: 'spouse' },
  { person_id: 4, relative_id: 2, relationship_type: 'spouse' }
];

console.log('Simplified scenario:');
console.log('Sam -> SamChild, Robert -> RobertChild, SamChild married RobertChild');

const samSimple = simplePeople.find(p => p.first_name === 'Sam');
const robertSimple = simplePeople.find(p => p.first_name === 'Robert');

const robertToSamSimple = calculateRelationshipToRoot(robertSimple, samSimple, simplePeople, simpleRelationships);
console.log(`Robert -> Sam (simplified): "${robertToSamSimple}"`);

if (robertToSamSimple === 'Co-Father-in-law') {
  console.log('✅ SUCCESS: Simplified version works');
} else {
  console.log('❌ FAILURE: Even simplified version fails');
  console.log('This indicates a fundamental issue with the co-parent-in-law logic');
}

console.log('');
console.log('=== Diagnosis ===');
if (robertToSam === 'No relation' && robertToSamSimple === 'No relation') {
  console.log('❌ The co-parent-in-law logic is not working correctly');
  console.log('Possible issues:');
  console.log('1. The logic is not properly detecting married children');
  console.log('2. The parent-child relationships are not being built correctly');
  console.log('3. The co-parent-in-law algorithm has a bug');
  console.log('4. The relationship data format is not as expected');
  console.log('');
  console.log('Need to examine the co-parent-in-law code in improvedRelationshipCalculator.js');
} else {
  console.log('The issue might be specific to certain relationship structures');
}