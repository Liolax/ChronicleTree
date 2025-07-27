/**
 * Test Emma Doe's family visibility
 * Emma should see: father, aunt, cousins, grandfather, step-grandmother, great-grandparents
 */

// Mock data based on seeds.rb structure
const mockPeople = [
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

const mockRelationships = [
  // John and Jane are parents of Alice and Charlie (Alice/Charlie HAS John/Jane as parents)
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 4, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 4, relationship_type: 'child' },
  { person_id: 4, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 4, relationship_type: 'child' },
  
  // Alice and David are parents of Bob and Emily (Bob/Emily HAS Alice/David as parents)
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 7, relationship_type: 'parent' },
  { person_id: 7, relative_id: 5, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 7, relationship_type: 'parent' },
  { person_id: 7, relative_id: 6, relationship_type: 'child' },
  
  // Charlie is Emma's father (Emma HAS Charlie as parent)
  { person_id: 9, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 9, relationship_type: 'child' },
  
  // Molly and Robert are John's parents (John HAS Molly/Robert as parents)
  { person_id: 1, relative_id: 10, relationship_type: 'parent' },
  { person_id: 10, relative_id: 1, relationship_type: 'child' },
  { person_id: 1, relative_id: 11, relationship_type: 'parent' },
  { person_id: 11, relative_id: 1, relationship_type: 'child' },
  
  // John and Lisa are spouses (Lisa is step-grandmother to Emma)
  { person_id: 1, relative_id: 8, relationship_type: 'spouse' },
  { person_id: 8, relative_id: 1, relationship_type: 'spouse' },
  
  // John and Lisa are parents of Michael (Michael HAS John/Lisa as parents)
  { person_id: 12, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 12, relationship_type: 'child' },
  { person_id: 12, relative_id: 8, relationship_type: 'parent' },
  { person_id: 8, relative_id: 12, relationship_type: 'child' },
];

// Import the relationship calculator
import { calculateRelationshipToRoot, buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing Emma Doe\'s Family Visibility ===');

const emma = mockPeople.find(p => p.first_name === 'Emma' && p.last_name === 'Doe');
console.log('Emma (Root):', emma);

console.log('\n=== Debug: Relationship Data Format ===');
console.log('Sample relationships:', mockRelationships.slice(0, 5));
const relationshipMaps = buildRelationshipMaps(mockRelationships, mockPeople);
console.log('Parent to Children map:', relationshipMaps.parentToChildren);
console.log('Child to Parents map:', relationshipMaps.childToParents);
console.log('Emma parents:', relationshipMaps.childToParents.get('9'));
console.log('Charlie children:', relationshipMaps.parentToChildren.get('4'));

console.log('\n=== Expected Family Members for Emma ===');
console.log('Father: Charlie Doe');
console.log('Grandfather: John Doe');
console.log('Step-grandmother: Lisa Doe');
console.log('Aunt: Alice Johnson');
console.log('Cousins: Bob Johnson, Emily Johnson');
console.log('Great-grandparents: Molly Doe (deceased), Robert Doe');

console.log('\n=== Current Relationship Calculations ===');
mockPeople.forEach(person => {
  if (person.id !== emma.id) {
    const relationship = calculateRelationshipToRoot(person, emma, mockPeople, mockRelationships);
    if (relationship && relationship !== 'Unrelated') {
      console.log(`${person.first_name} ${person.last_name}: ${relationship}`);
    }
  }
});

console.log('\n=== Debug John and Michael relationships ===');
const john = mockPeople.find(p => p.first_name === 'John' && p.last_name === 'Doe');
const michael = mockPeople.find(p => p.first_name === 'Michael' && p.last_name === 'Doe');

if (john) {
  console.log(`John relationship: ${calculateRelationshipToRoot(john, emma, mockPeople, mockRelationships)}`);
  console.log(`John parents:`, relationshipMaps.childToParents.get(String(john.id)));
  console.log(`Emma parents:`, relationshipMaps.childToParents.get(String(emma.id)));
  
  // Check if John is Emma's biological grandfather
  const emmaParents = relationshipMaps.childToParents.get(String(emma.id)) || new Set();
  for (const parent of emmaParents) {
    const parentParents = relationshipMaps.childToParents.get(parent) || new Set();
    console.log(`Emma's parent ${parent} has parents:`, parentParents);
    console.log(`John (${john.id}) is in parent's parents:`, parentParents.has(String(john.id)));
  }
}

if (michael) {
  console.log(`Michael relationship: ${calculateRelationshipToRoot(michael, emma, mockPeople, mockRelationships)}`);
  console.log(`Michael parents:`, relationshipMaps.childToParents.get(String(michael.id)));
  
  // Debug sibling relationship between Michael and Charlie
  const charlie = mockPeople.find(p => p.first_name === 'Charlie');
  console.log(`Charlie (${charlie.id}) siblings:`, relationshipMaps.siblingMap.get(String(charlie.id)));
  console.log(`Michael (${michael.id}) siblings:`, relationshipMaps.siblingMap.get(String(michael.id)));
  console.log(`Charlie parents:`, relationshipMaps.childToParents.get(String(charlie.id)));
  console.log(`Michael parents:`, relationshipMaps.childToParents.get(String(michael.id)));
  
  // Check shared parents
  const charlieParents = relationshipMaps.childToParents.get(String(charlie.id)) || new Set();
  const michaelParents = relationshipMaps.childToParents.get(String(michael.id)) || new Set();
  const sharedParents = [...charlieParents].filter(parent => michaelParents.has(parent));
  console.log(`Shared parents between Charlie and Michael:`, sharedParents);
}

console.log('\n=== Checking Specific Expected Relationships ===');
const expectedRelationships = [
  { name: 'Charlie Doe', expected: 'Father' },
  { name: 'John Doe', expected: 'Grandfather' },
  { name: 'Lisa Doe', expected: 'Step-Grandmother' },
  { name: 'Alice Johnson', expected: 'Aunt' },
  { name: 'Bob Johnson', expected: 'Cousin' },
  { name: 'Emily Johnson', expected: 'Cousin' },
  { name: 'Molly Doe', expected: 'Great-Grandmother' },
  { name: 'Robert Doe', expected: 'Great-Grandfather' }
];

expectedRelationships.forEach(({ name, expected }) => {
  const [firstName, lastName] = name.split(' ');
  const person = mockPeople.find(p => p.first_name === firstName && p.last_name === lastName);
  if (person) {
    const actual = calculateRelationshipToRoot(person, emma, mockPeople, mockRelationships);
    const status = actual === expected ? '✅' : '❌';
    console.log(`${status} ${name}: Expected "${expected}", Got "${actual}"`);
    
    // Debug specific relationships
    if (firstName === 'John') {
      console.log(`  DEBUG John: born ${person.date_of_birth}, died ${person.date_of_death}`);
      console.log(`  DEBUG Emma: born ${emma.date_of_birth}, died ${emma.date_of_death}`);
      console.log(`  DEBUG John parents:`, relationshipMaps.childToParents.get('1'));
      console.log(`  DEBUG Charlie parents:`, relationshipMaps.childToParents.get('4'));
    }
    if (firstName === 'Alice') {
      console.log(`  DEBUG Alice parents:`, relationshipMaps.childToParents.get('3'));
      console.log(`  DEBUG Charlie parents:`, relationshipMaps.childToParents.get('4'));
      console.log(`  DEBUG Sibling map for John:`, relationshipMaps.siblingMap.get('1'));
    }
    if (firstName === 'Molly') {
      console.log(`  DEBUG Molly: born ${person.date_of_birth}, died ${person.date_of_death}`);
      console.log(`  DEBUG Molly children:`, relationshipMaps.parentToChildren.get('10'));
      console.log(`  DEBUG John parents:`, relationshipMaps.childToParents.get('1'));
    }
  }
});