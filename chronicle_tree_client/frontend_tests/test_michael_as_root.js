/**
 * Test Michael as root to see Emma's relationship
 * Emma should be Michael's Half-Niece, not full Niece
 */

// Import the relationship calculator
import { calculateRelationshipToRoot, buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

const actualPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1990-01-15', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1992-07-20', date_of_death: '2015-03-10', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Johnson', gender: 'Female', date_of_birth: '2012-02-28', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '2014-11-12', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Johnson', gender: 'Male', date_of_birth: '2010-06-25', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Johnson', gender: 'Female', date_of_birth: '2008-04-03', date_of_death: null, is_deceased: false },
  { id: 7, first_name: 'David', last_name: 'Johnson', gender: 'Male', date_of_birth: '1985-09-18', date_of_death: null, is_deceased: false },
  { id: 8, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 9, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-22', date_of_death: null, is_deceased: false },
  { id: 10, first_name: 'Molly', last_name: 'Doe', gender: 'Female', date_of_birth: '1965-12-15', date_of_death: '2019-08-20', is_deceased: true },
  { id: 11, first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '1963-03-10', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false },
];

// Relationships based on seeds.rb format (Rails bidirectional format)
const actualRelationships = [
  // John is parent of Alice, Charlie
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 4, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 4, relationship_type: 'child' },
  
  // Jane is parent of Alice, Charlie  
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 4, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 4, relationship_type: 'child' },
  
  // Alice and David are parents of Bob, Emily
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 5, relative_id: 7, relationship_type: 'parent' },
  { person_id: 7, relative_id: 5, relationship_type: 'child' },
  { person_id: 6, relative_id: 7, relationship_type: 'parent' },
  { person_id: 7, relative_id: 6, relationship_type: 'child' },
  
  // Charlie is parent of Emma
  { person_id: 9, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 9, relationship_type: 'child' },
  
  // Molly and Robert are parents of John
  { person_id: 1, relative_id: 10, relationship_type: 'parent' },
  { person_id: 10, relative_id: 1, relationship_type: 'child' },
  { person_id: 1, relative_id: 11, relationship_type: 'parent' },
  { person_id: 11, relative_id: 1, relationship_type: 'child' },
  
  // John and Lisa are current spouses
  { person_id: 1, relative_id: 8, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 8, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // John and Jane were spouses (Jane is deceased)  
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // Alice and David were spouses (now ex-spouses)
  { person_id: 3, relative_id: 7, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { person_id: 7, relative_id: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  
  // John and Lisa are parents of Michael
  { person_id: 12, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 12, relationship_type: 'child' },
  { person_id: 12, relative_id: 8, relationship_type: 'parent' },
  { person_id: 8, relative_id: 12, relationship_type: 'child' },
];

const michael = actualPeople.find(p => p.first_name === 'Michael');
const emma = actualPeople.find(p => p.first_name === 'Emma');
const charlie = actualPeople.find(p => p.first_name === 'Charlie');

console.log('=== Testing Michael as Root ===');
console.log('Michael (Root):', michael);

console.log('\n=== All Relationships for Michael ===');
actualPeople.forEach(person => {
  if (person.id !== michael.id) {
    const relationship = calculateRelationshipToRoot(person, michael, actualPeople, actualRelationships);
    if (relationship && relationship !== 'Unrelated') {
      console.log(`${person.first_name} ${person.last_name}: ${relationship}`);
    }
  }
});

console.log('\n=== Debug: Michael-Emma Relationship ===');
console.log(`Emma relationship to Michael: ${calculateRelationshipToRoot(emma, michael, actualPeople, actualRelationships)}`);

// Debug the relationship maps
const maps = buildRelationshipMaps(actualRelationships, actualPeople);

console.log('\n=== Debug Family Structure ===');
console.log('Michael parents:', maps.childToParents.get('12')); // Should be John (1) and Lisa (8)
console.log('Charlie parents:', maps.childToParents.get('4'));  // Should be John (1) and Jane (2)
console.log('Emma parents:', maps.childToParents.get('9'));     // Should be Charlie (4)

console.log('\n=== Debug Sibling Relationship ===');
console.log('Michael siblings:', maps.siblingMap.get('12'));    // Should include Charlie (4) - half-siblings
console.log('Charlie siblings:', maps.siblingMap.get('4'));     // Should include Michael (12) - half-siblings

console.log('\n=== Expected Relationship Logic ===');
console.log('Michael parents: John (1) + Lisa (8)');
console.log('Charlie parents: John (1) + Jane (2)');
console.log('Shared parent: John (1) -> Michael and Charlie are HALF-SIBLINGS');
console.log('Emma is Charlie\'s daughter -> Emma is Michael\'s HALF-NIECE');

// Check shared parents between Michael and Charlie
const michaelParents = maps.childToParents.get('12') || new Set();
const charlieParents = maps.childToParents.get('4') || new Set();
const sharedParents = [...michaelParents].filter(parent => charlieParents.has(parent));
console.log('\n=== Shared Parents Analysis ===');
console.log('Michael parents:', michaelParents);
console.log('Charlie parents:', charlieParents);
console.log('Shared parents:', sharedParents);
console.log('Number of shared parents:', sharedParents.length);

if (sharedParents.length === 1) {
  console.log('✅ Confirmed: Michael and Charlie are HALF-SIBLINGS (share 1 parent)');
  console.log('✅ Therefore: Emma should be Michael\'s HALF-NIECE');
} else if (sharedParents.length === 2) {
  console.log('❌ Issue: Michael and Charlie appear as FULL-SIBLINGS (share 2 parents)');
  console.log('❌ Therefore: Emma would be Michael\'s full NIECE');
} else {
  console.log('❌ Issue: Michael and Charlie share no parents - not siblings');
}