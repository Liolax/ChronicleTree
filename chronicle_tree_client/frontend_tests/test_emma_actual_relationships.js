/**
 * Test Emma's actual relationships from database/API
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing Emma\'s Actual Relationships from Database ===');

// This would need to be connected to your actual API endpoint
// For now, let's create data that matches the seeds.rb structure more closely

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

const emma = actualPeople.find(p => p.first_name === 'Emma');
console.log('Emma (Root):', emma);

console.log('\n=== All Relationships for Emma ===');
actualPeople.forEach(person => {
  if (person.id !== emma.id) {
    const relationship = calculateRelationshipToRoot(person, emma, actualPeople, actualRelationships);
    if (relationship && relationship !== 'Unrelated') {
      console.log(`${person.first_name} ${person.last_name}: ${relationship}`);
    }
  }
});

// Check if the data structure is correct
import { buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';
const maps = buildRelationshipMaps(actualRelationships, actualPeople);

console.log('\n=== Relationship Maps Debug ===');
console.log('Emma parents:', maps.childToParents.get('9'));
console.log('Charlie parents:', maps.childToParents.get('4'));
console.log('John children:', maps.parentToChildren.get('1'));
console.log('Jane children:', maps.parentToChildren.get('2'));

console.log('\n=== Specific Focus on John and Jane ===');
const john = actualPeople.find(p => p.first_name === 'John');
const jane = actualPeople.find(p => p.first_name === 'Jane');

console.log(`John relationship to Emma: ${calculateRelationshipToRoot(john, emma, actualPeople, actualRelationships)}`);
console.log(`Jane relationship to Emma: ${calculateRelationshipToRoot(jane, emma, actualPeople, actualRelationships)}`);

// Debug John's spouse relationships
console.log('\n=== John\'s Spouse Relationships ===');
console.log('John current spouses:', maps.spouseMap.get('1'));
console.log('John deceased spouses:', maps.deceasedSpouseMap.get('1'));
console.log('John ex spouses:', maps.exSpouseMap.get('1'));

// Check if John is Emma's biological grandfather through the parent chain
console.log('\n=== Biological Relationship Check ===');
const emmaParents = maps.childToParents.get('9') || new Set();
console.log('Emma parents:', emmaParents);

for (const parent of emmaParents) {
  console.log(`Parent ${parent} has parents:`, maps.childToParents.get(parent));
  const grandparents = maps.childToParents.get(parent) || new Set();
  if (grandparents.has('1')) {
    console.log(`✅ John (1) is Emma's biological grandfather through parent ${parent}`);
  }
  if (grandparents.has('2')) {
    console.log(`✅ Jane (2) is Emma's biological grandmother through parent ${parent}`);
  }
}

// Debug the relationship path
console.log('\n=== Debug Relationship Path ===');
console.log('Emma -> Charlie (Emma\'s father)');
console.log('Charlie -> John (Charlie\'s father = Emma\'s grandfather)');
console.log('Charlie -> Jane (Charlie\'s mother = Emma\'s grandmother)');