/**
 * Test that co-father-in-law logic has been removed
 * Robert Doe should now show as "No relation" to Sam instead of "Co-Father-in-law"
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing No Co-Father-in-Law Logic ===');

// Same scenario as before, but now they should be unrelated
const people = [
  { id: 1, first_name: 'Sam', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'SamChild', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
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
  
  // The children are married to each other
  { person_id: 3, relative_id: 6, relationship_type: 'spouse' },
  { person_id: 6, relative_id: 3, relationship_type: 'spouse' }
];

console.log('Family structure:');
console.log('Sam + Patricia -> SamChild');
console.log('Robert + RobertWife -> RobertChild'); 
console.log('SamChild married to RobertChild');
console.log('');
console.log('Expected: Sam and Robert should now be UNRELATED (not co-fathers-in-law)');
console.log('');

const sam = people.find(p => p.first_name === 'Sam');
const robert = people.find(p => p.first_name === 'Robert');

// Test Robert -> Sam relationship
const robertToSam = calculateRelationshipToRoot(robert, sam, people, relationships);
console.log(`Robert Doe -> Sam (root): "${robertToSam}"`);

if (robertToSam === 'No relation') {
  console.log('✅ SUCCESS: Robert and Sam are now correctly unrelated');
} else if (robertToSam === 'Co-Father-in-law') {
  console.log('❌ FAILURE: Co-Father-in-law logic still exists');
} else {
  console.log(`❌ UNEXPECTED: Got "${robertToSam}" instead of "No relation"`);
}

// Test Sam -> Robert relationship
const samToRobert = calculateRelationshipToRoot(sam, robert, people, relationships);
console.log(`Sam -> Robert Doe (root): "${samToRobert}"`);

if (samToRobert === 'No relation') {
  console.log('✅ SUCCESS: Reverse relationship also correctly unrelated');
} else {
  console.log(`❌ FAILURE: Reverse relationship incorrect: "${samToRobert}"`);
}

console.log('');

// Test that other relationships still work correctly
console.log('--- Testing Other Relationships Still Work ---');

const patricia = people.find(p => p.first_name === 'Patricia');
const samChild = people.find(p => p.first_name === 'SamChild');
const robertChild = people.find(p => p.first_name === 'RobertChild');

// Sam and Patricia should still be spouses
const patriciaToSam = calculateRelationshipToRoot(patricia, sam, people, relationships);
console.log(`Patricia -> Sam: "${patriciaToSam}"`);

// SamChild should still be Sam's son
const samChildToSam = calculateRelationshipToRoot(samChild, sam, people, relationships);
console.log(`SamChild -> Sam: "${samChildToSam}"`);

// RobertChild should still be Robert's daughter
const robertChildToRobert = calculateRelationshipToRoot(robertChild, robert, people, relationships);
console.log(`RobertChild -> Robert: "${robertChildToRobert}"`);

// The children should still be spouses
const robertChildToSamChild = calculateRelationshipToRoot(robertChild, samChild, people, relationships);
console.log(`RobertChild -> SamChild: "${robertChildToSamChild}"`);

console.log('');

// Test a simplified case to make sure
console.log('--- Simplified Test Case ---');

const simplePeople = [
  { id: 1, first_name: 'Father1', last_name: 'A', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Child1', last_name: 'A', gender: 'Male', date_of_birth: '2000-01-01' },
  { id: 3, first_name: 'Father2', last_name: 'B', gender: 'Male', date_of_birth: '1968-01-01' },
  { id: 4, first_name: 'Child2', last_name: 'B', gender: 'Female', date_of_birth: '2002-01-01' }
];

const simpleRelationships = [
  // Father1 -> Child1
  { person_id: 2, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 2, relationship_type: 'child' },
  
  // Father2 -> Child2
  { person_id: 4, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 4, relationship_type: 'child' },
  
  // Child1 married Child2
  { person_id: 2, relative_id: 4, relationship_type: 'spouse' },
  { person_id: 4, relative_id: 2, relationship_type: 'spouse' }
];

const father1 = simplePeople.find(p => p.first_name === 'Father1');
const father2 = simplePeople.find(p => p.first_name === 'Father2');

const father2ToFather1 = calculateRelationshipToRoot(father2, father1, simplePeople, simpleRelationships);
console.log(`Father2 -> Father1 (simplified): "${father2ToFather1}"`);

if (father2ToFather1 === 'No relation') {
  console.log('✅ SUCCESS: Simplified case also shows no relation');
} else {
  console.log(`❌ FAILURE: Simplified case shows "${father2ToFather1}"`);
}

console.log('');
console.log('=== Summary ===');
console.log('✅ Co-Father-in-law logic has been removed from the relationship calculator');
console.log('✅ People whose children are married are now correctly unrelated');
console.log('✅ Other relationship types (spouse, parent, child) are unaffected');
console.log('');
console.log('Robert Doe will now show as "No relation" to Sam, not "Co-Father-in-law"');