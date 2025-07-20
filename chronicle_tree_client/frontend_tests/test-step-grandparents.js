/**
 * Test step-grandparent relationships
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },     
  { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },   
  { id: '3', first_name: 'Alice', last_name: 'Doe', gender: 'Female', is_deceased: false }, 
  { id: '4', first_name: 'Charlie', last_name: 'Doe', gender: 'Male', is_deceased: false }, 
  { id: '5', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', is_deceased: false },  
  { id: '6', first_name: 'Michael', last_name: 'Doe', gender: 'Male', is_deceased: false },
  { id: '7', first_name: 'Robert', last_name: 'Smith', gender: 'Male', is_deceased: false },  // Lisa's father
  { id: '8', first_name: 'Mary', last_name: 'Smith', gender: 'Female', is_deceased: false }  // Lisa's mother
];

const testRelationships = [
  // John-Lisa marriage (current)
  { source: '1', target: '5', relationship_type: 'spouse', is_ex: false, is_deceased: false },  
  { source: '5', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // John-Jane marriage (deceased)
  { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true },  
  { source: '2', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // John's children with Jane
  { source: '1', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '3', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
  { source: '2', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '3', target: '2', relationship_type: 'parent', is_ex: false, is_deceased: false }, 
  
  { source: '1', target: '4', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '4', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
  { source: '2', target: '4', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '4', target: '2', relationship_type: 'parent', is_ex: false, is_deceased: false }, 
  
  // John and Lisa's child
  { source: '1', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '6', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
  { source: '5', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '6', target: '5', relationship_type: 'parent', is_ex: false, is_deceased: false },
  
  // Lisa's parents
  { source: '7', target: '5', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '5', target: '7', relationship_type: 'parent', is_ex: false, is_deceased: false },  
  { source: '8', target: '5', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '5', target: '8', relationship_type: 'parent', is_ex: false, is_deceased: false }
];

console.log('=== Testing Step-Grandparent Relationships ===\n');

const alice = testPeople.find(p => p.id === '3');
const charlie = testPeople.find(p => p.id === '4');
const michael = testPeople.find(p => p.id === '6');
const robert = testPeople.find(p => p.id === '7'); // Lisa's father
const mary = testPeople.find(p => p.id === '8');   // Lisa's mother

console.log('Current behavior:');
console.log(`Robert (Lisa's father) to Alice: "${calculateRelationshipToRoot(robert, alice, testPeople, testRelationships)}" (should be "Step-Grandfather")`);
console.log(`Mary (Lisa's mother) to Alice: "${calculateRelationshipToRoot(mary, alice, testPeople, testRelationships)}" (should be "Step-Grandmother")`);
console.log(`Robert to Charlie: "${calculateRelationshipToRoot(robert, charlie, testPeople, testRelationships)}" (should be "Step-Grandfather")`);
console.log(`Mary to Charlie: "${calculateRelationshipToRoot(mary, charlie, testPeople, testRelationships)}" (should be "Step-Grandmother")`);

console.log('\nReverse relationships:');
console.log(`Alice to Robert: "${calculateRelationshipToRoot(alice, robert, testPeople, testRelationships)}" (should be "Step-Granddaughter")`);
console.log(`Alice to Mary: "${calculateRelationshipToRoot(alice, mary, testPeople, testRelationships)}" (should be "Step-Granddaughter")`);
console.log(`Charlie to Robert: "${calculateRelationshipToRoot(charlie, robert, testPeople, testRelationships)}" (should be "Step-Grandson")`);
console.log(`Charlie to Mary: "${calculateRelationshipToRoot(charlie, mary, testPeople, testRelationships)}" (should be "Step-Grandson")`);

console.log('\nFor comparison - biological grandparent relationship:');
console.log(`Robert to Michael: "${calculateRelationshipToRoot(robert, michael, testPeople, testRelationships)}" (should be "Grandfather")`);
console.log(`Michael to Robert: "${calculateRelationshipToRoot(michael, robert, testPeople, testRelationships)}" (should be "Grandson")`);
