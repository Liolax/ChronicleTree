/**
 * Debug test for step relationships
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },     
  { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },   
  { id: '3', first_name: 'Alice', last_name: 'Doe', gender: 'Female', is_deceased: false }, 
  { id: '5', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', is_deceased: false },  
  { id: '6', first_name: 'Michael', last_name: 'Doe', gender: 'Male', is_deceased: false }  
];

const testRelationships = [
  // John-Lisa marriage (current)
  { source: '1', target: '5', relationship_type: 'spouse', is_ex: false, is_deceased: false },  
  { source: '5', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // John-Jane marriage (deceased)
  { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true },  
  { source: '2', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // John-Alice parent relationship (from previous marriage with Jane)
  { source: '1', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '3', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
  { source: '2', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '3', target: '2', relationship_type: 'parent', is_ex: false, is_deceased: false }, 
  
  // John-Michael and Lisa-Michael parent relationships (current marriage)
  { source: '1', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '6', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
  { source: '5', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   
  { source: '6', target: '5', relationship_type: 'parent', is_ex: false, is_deceased: false }
];

console.log('=== Debug Step Relationships ===');

const john = testPeople.find(p => p.id === '1');
const alice = testPeople.find(p => p.id === '3');
const lisa = testPeople.find(p => p.id === '5');
const michael = testPeople.find(p => p.id === '6');

// Test basic relationships first
console.log('Basic relationships:');
console.log(`Michael to John: "${calculateRelationshipToRoot(michael, john, testPeople, testRelationships)}" (should be Son)`);
console.log(`Michael to Lisa: "${calculateRelationshipToRoot(michael, lisa, testPeople, testRelationships)}" (should be Son)`);
console.log(`Alice to John: "${calculateRelationshipToRoot(alice, john, testPeople, testRelationships)}" (should be Daughter)`);
console.log(`Lisa to John: "${calculateRelationshipToRoot(lisa, john, testPeople, testRelationships)}" (should be Wife)`);

console.log('\nStep relationships:');
console.log(`Alice to Lisa: "${calculateRelationshipToRoot(alice, lisa, testPeople, testRelationships)}" (should be Step-Daughter)`);
console.log(`Lisa to Alice: "${calculateRelationshipToRoot(lisa, alice, testPeople, testRelationships)}" (should be Step-Mother)`);
console.log(`Michael to Alice: "${calculateRelationshipToRoot(michael, alice, testPeople, testRelationships)}" (should be Step-Brother)`);
console.log(`Alice to Michael: "${calculateRelationshipToRoot(alice, michael, testPeople, testRelationships)}" (should be Step-Sister)`);
