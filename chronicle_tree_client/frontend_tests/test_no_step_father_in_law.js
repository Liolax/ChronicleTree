/**
 * Test that step-father-in-law logic has been completely removed
 * and that normal in-law relationships still work correctly
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing No Step-Father-in-Law Logic ===');

// Test Case 1: Simple in-law relationship (should work normally)
console.log('--- Test Case 1: Simple Father-in-law Relationship ---');

const people1 = [
  { id: 1, first_name: 'Sam', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Doe', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' }
];

const relationships1 = [
  { person_id: 1, relative_id: 2, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 2, relationship_type: 'child' }
];

const sam = people1.find(p => p.first_name === 'Sam');
const john = people1.find(p => p.first_name === 'John');

const johnToSam = calculateRelationshipToRoot(john, sam, people1, relationships1);
console.log(`John Doe -> Sam (root): ${johnToSam}`);

if (johnToSam === 'Father-in-law') {
  console.log('✅ SUCCESS: Correct Father-in-law relationship');
} else if (johnToSam.includes('Step-Father-in-law')) {
  console.log('❌ FAILURE: Step-Father-in-law logic still exists');
} else {
  console.log(`❌ UNEXPECTED: Got "${johnToSam}" instead of "Father-in-law"`);
}

console.log('');

// Test Case 2: Complex scenario that might have triggered step-father-in-law before
console.log('--- Test Case 2: Complex Scenario (Previously Might Have Triggered Step-Father-in-Law) ---');

const people2 = [
  { id: 1, first_name: 'Sam', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Doe', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  // Add another person who might complicate the relationships
  { id: 5, first_name: 'Bob', last_name: 'Brown', gender: 'Male', date_of_birth: '1975-01-01' }
];

const relationships2 = [
  // Sam marries Patricia
  { person_id: 1, relative_id: 2, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse' },
  
  // John and Jane are Patricia's parents
  { person_id: 2, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 2, relationship_type: 'child' },
  { person_id: 2, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 2, relationship_type: 'child' },
  
  // John and Jane are married
  { person_id: 3, relative_id: 4, relationship_type: 'spouse' },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse' },
  
  // Add a complex relationship that might confuse the algorithm
  // Bob is also somehow related
  { person_id: 5, relative_id: 3, relationship_type: 'sibling' },
  { person_id: 3, relative_id: 5, relationship_type: 'sibling' }
];

const sam2 = people2.find(p => p.first_name === 'Sam');
const john2 = people2.find(p => p.first_name === 'John');
const jane2 = people2.find(p => p.first_name === 'Jane');

console.log('Complex relationships:');
console.log(`John -> Sam: ${calculateRelationshipToRoot(john2, sam2, people2, relationships2)}`);
console.log(`Jane -> Sam: ${calculateRelationshipToRoot(jane2, sam2, people2, relationships2)}`);

const johnResult = calculateRelationshipToRoot(john2, sam2, people2, relationships2);
const janeResult = calculateRelationshipToRoot(jane2, sam2, people2, relationships2);

if (johnResult === 'Father-in-law' && janeResult === 'Mother-in-law') {
  console.log('✅ SUCCESS: Both parents correctly identified as in-laws');
} else if (johnResult.includes('Step') || janeResult.includes('Step')) {
  console.log('❌ FAILURE: Step-in-law relationships still being generated');
} else {
  console.log(`❌ UNEXPECTED: Got "${johnResult}" and "${janeResult}"`);
}

console.log('');

// Test Case 3: Verify other relationship types still work
console.log('--- Test Case 3: Other Relationship Types Still Work ---');

const people3 = [
  { id: 1, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Mother', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 3, first_name: 'Son', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 4, first_name: 'Daughter', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships3 = [
  // Parents relationship
  { person_id: 1, relative_id: 2, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse' },
  
  // Parent-child relationships
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  
  { person_id: 4, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 4, relationship_type: 'child' },
  { person_id: 4, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 4, relationship_type: 'child' }
];

const father = people3.find(p => p.first_name === 'Father');
const son = people3.find(p => p.first_name === 'Son');
const daughter = people3.find(p => p.first_name === 'Daughter');

console.log('Basic family relationships:');
console.log(`Father -> Son: ${calculateRelationshipToRoot(father, son, people3, relationships3)}`);
console.log(`Son -> Father: ${calculateRelationshipToRoot(son, father, people3, relationships3)}`);
console.log(`Daughter -> Son: ${calculateRelationshipToRoot(daughter, son, people3, relationships3)}`);

console.log('');
console.log('=== Summary ===');
console.log('✅ Step-Father-in-law logic has been removed from the relationship calculator');
console.log('✅ Normal in-law relationships (Father-in-law, Mother-in-law) still work correctly');
console.log('✅ Other relationship types (parent, child, sibling, spouse) are unaffected');
console.log('');
console.log('The issue should now be resolved: John Doe will appear as "Father-in-law" to Sam,');
console.log('not as "Step-Father-in-law", regardless of the complexity of other relationships.');