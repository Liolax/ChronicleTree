/**
 * Test deceased spouse's parents relationship handling
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test data based on our seed file
const testPeople = [
  { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },
  { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },
  { id: '3', first_name: 'Alice', last_name: 'Doe', gender: 'Female', is_deceased: false },
  { id: '4', first_name: 'Charlie', last_name: 'Doe', gender: 'Male', is_deceased: false },
  { id: '5', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', is_deceased: false },
  { id: '17', first_name: 'Richard', last_name: 'Sharma', gender: 'Male', is_deceased: false }, // Jane's father
  { id: '18', first_name: 'Margaret', last_name: 'Sharma', gender: 'Female', is_deceased: false } // Jane's mother
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
  
  // Jane's parents (Richard and Margaret Sharma)
  { source: '17', target: '2', relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: '2', target: '17', relationship_type: 'parent', is_ex: false, is_deceased: false },
  { source: '18', target: '2', relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: '2', target: '18', relationship_type: 'parent', is_ex: false, is_deceased: false },
  
  // Richard and Margaret are married
  { source: '17', target: '18', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { source: '18', target: '17', relationship_type: 'spouse', is_ex: false, is_deceased: false }
];

console.log('=== Testing Deceased Spouse\'s Parents Relationships ===\n');

const john = testPeople.find(p => p.id === '1');
const jane = testPeople.find(p => p.id === '2');
const alice = testPeople.find(p => p.id === '3');
const charlie = testPeople.find(p => p.id === '4');
const lisa = testPeople.find(p => p.id === '5');
const richard = testPeople.find(p => p.id === '17'); // Jane's father
const margaret = testPeople.find(p => p.id === '18'); // Jane's mother

console.log('=== THE CORE ISSUE BEING FIXED ===');
console.log('Before fix: Jane\'s parents (Richard & Margaret) showed as John\'s in-laws even after Jane\'s death');
console.log('After fix: They should show as "Late Wife\'s Father/Mother" instead\n');

console.log('=== TESTING FROM JOHN\'S PERSPECTIVE ===');
console.log(`John -> Jane: "${calculateRelationshipToRoot(jane, john, testPeople, testRelationships)}" (should be "Wife (deceased)" or similar)`);
console.log(`John -> Lisa: "${calculateRelationshipToRoot(lisa, john, testPeople, testRelationships)}" (should be "Wife")`);
console.log(`John -> Richard: "${calculateRelationshipToRoot(richard, john, testPeople, testRelationships)}" (should be "Late Wife's Father")`);
console.log(`John -> Margaret: "${calculateRelationshipToRoot(margaret, john, testPeople, testRelationships)}" (should be "Late Wife's Mother")`);

console.log('\n=== TESTING FROM RICHARD\'S PERSPECTIVE ===');
console.log(`Richard -> John: "${calculateRelationshipToRoot(john, richard, testPeople, testRelationships)}" (should be "Unrelated")`);
console.log(`Richard -> Jane: "${calculateRelationshipToRoot(jane, richard, testPeople, testRelationships)}" (should be "Daughter")`);
console.log(`Richard -> Alice: "${calculateRelationshipToRoot(alice, richard, testPeople, testRelationships)}" (should be "Granddaughter")`);
console.log(`Richard -> Charlie: "${calculateRelationshipToRoot(charlie, richard, testPeople, testRelationships)}" (should be "Grandson")`);

console.log('\n=== TESTING FROM MARGARET\'S PERSPECTIVE ===');
console.log(`Margaret -> John: "${calculateRelationshipToRoot(john, margaret, testPeople, testRelationships)}" (should be "Unrelated")`);
console.log(`Margaret -> Jane: "${calculateRelationshipToRoot(jane, margaret, testPeople, testRelationships)}" (should be "Daughter")`);
console.log(`Margaret -> Alice: "${calculateRelationshipToRoot(alice, margaret, testPeople, testRelationships)}" (should be "Granddaughter")`);
console.log(`Margaret -> Charlie: "${calculateRelationshipToRoot(charlie, margaret, testPeople, testRelationships)}" (should be "Grandson")`);

console.log('\n=== TESTING FROM ALICE\'S PERSPECTIVE ===');
console.log(`Alice -> Richard: "${calculateRelationshipToRoot(richard, alice, testPeople, testRelationships)}" (should be "Grandfather")`);
console.log(`Alice -> Margaret: "${calculateRelationshipToRoot(margaret, alice, testPeople, testRelationships)}" (should be "Grandmother")`);

console.log('\n=== EXPECTED RESULTS ===');
console.log('✅ John should see Richard as "Unrelated" (no relationship after Jane\'s death)');
console.log('✅ John should see Margaret as "Unrelated" (no relationship after Jane\'s death)');
console.log('✅ Richard/Margaret should see John as "Unrelated" (no relationship after Jane\'s death)');
console.log('✅ Alice/Charlie should still see Richard/Margaret as grandparents (blood relationship preserved)');
console.log('✅ This reflects the reality that deceased spouse\'s parents have no relationship to the surviving spouse');
