/**
 * Debug John Doe generation assignment to understand why in-laws are not aligned
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debugging John Doe Generation Assignment ===');

// Same test case that's failing
const people = [
  // John Doe and his wife Jane
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  
  // John's parents (should be positioned correctly)
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Jane's parents (John's parents-in-law - should be same generation as John's parents)
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  
  // John's uncle (John's parent's brother - should be same generation as John's parents)
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe', gender: 'Male', date_of_birth: '1954-01-01' },
  
  // John's uncle's wife (John's aunt-in-law - should be same generation)
  { id: 8, first_name: 'JohnAunt', last_name: 'Doe', gender: 'Female', date_of_birth: '1956-01-01' },
  
  // Jane's sibling (should be same generation as John)
  { id: 9, first_name: 'JaneBrother', last_name: 'Smith', gender: 'Male', date_of_birth: '1984-01-01' },
  
  // Jane's sibling's spouse (John's sibling-in-law - should be same generation as John)
  { id: 10, first_name: 'JaneSisterInLaw', last_name: 'Brown', gender: 'Female', date_of_birth: '1986-01-01' }
];

const relationships = [
  // John and Jane marriage
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // John's parent relationships
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  { source: 1, target: 4, type: 'parent', from: 1, to: 4 },
  { source: 4, target: 1, type: 'child', from: 4, to: 1 },
  
  // John's parents marriage
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Jane's parent relationships
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  
  // Jane's parents marriage  
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // John's uncle relationship (JohnUncle is JohnDad's brother)
  { source: 3, target: 7, type: 'sibling', from: 3, to: 7 },
  { source: 7, target: 3, type: 'sibling', from: 7, to: 3 },
  
  // John's uncle's marriage (to John's aunt-in-law)
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 },
  
  // Jane's sibling relationship
  { source: 2, target: 9, type: 'sibling', from: 2, to: 9 },
  { source: 9, target: 2, type: 'sibling', from: 9, to: 2 },
  
  // Jane's sibling's parent relationships (same parents as Jane)
  { source: 9, target: 5, type: 'parent', from: 9, to: 5 },
  { source: 5, target: 9, type: 'child', from: 5, to: 9 },
  { source: 9, target: 6, type: 'parent', from: 9, to: 6 },
  { source: 6, target: 9, type: 'child', from: 6, to: 9 },
  
  // Jane's brother's marriage
  { source: 9, target: 10, type: 'spouse', from: 9, to: 10 },
  { source: 10, target: 9, type: 'spouse', from: 10, to: 9 }
];

// Test with full layout to see the issue
console.log('--- Testing with John as Root ---');
const result = createFamilyTreeLayout(people, relationships, {}, 1);

console.log('');
console.log('Node positions (looking at y-coordinates = generations):');
result.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: y=${node.position.y}`);
});

// Analyze the issue
console.log('');
console.log('--- Generation Analysis ---');

const getNodeByName = (name) => result.nodes.find(n => n.data.person.first_name === name);

const john = getNodeByName('John');
const jane = getNodeByName('Jane');
const janeBrother = getNodeByName('JaneBrother');
const janeSisterInLaw = getNodeByName('JaneSisterInLaw');
const johnDad = getNodeByName('JohnDad');
const johnMom = getNodeByName('JohnMom');
const janeDad = getNodeByName('JaneDad');
const janeMom = getNodeByName('JaneMom');
const johnUncle = getNodeByName('JohnUncle'); 
const johnAunt = getNodeByName('JohnAunt');

console.log('Expected: All parents at same generation level');
console.log(`  JohnDad: y=${johnDad?.position.y}`);
console.log(`  JohnMom: y=${johnMom?.position.y}`);
console.log(`  JaneDad: y=${janeDad?.position.y} ${janeDad?.position.y === johnDad?.position.y ? '✅' : '❌'}`);
console.log(`  JaneMom: y=${janeMom?.position.y} ${janeMom?.position.y === johnDad?.position.y ? '✅' : '❌'}`);
console.log(`  JohnUncle: y=${johnUncle?.position.y} ${johnUncle?.position.y === johnDad?.position.y ? '✅' : '❌'}`);
console.log(`  JohnAunt: y=${johnAunt?.position.y} ${johnAunt?.position.y === johnDad?.position.y ? '✅' : '❌'}`);

console.log('');
console.log('Expected: All John\'s generation at same level');
console.log(`  John: y=${john?.position.y}`);
console.log(`  Jane: y=${jane?.position.y} ${jane?.position.y === john?.position.y ? '✅' : '❌'}`);
console.log(`  JaneBrother: y=${janeBrother?.position.y} ${janeBrother?.position.y === john?.position.y ? '✅' : '❌'}`);
console.log(`  JaneSisterInLaw: y=${janeSisterInLaw?.position.y} ${janeSisterInLaw?.position.y === john?.position.y ? '✅' : '❌'}`);

console.log('');
console.log('=== Issue Analysis ===');
if (janeDad?.position.y !== johnDad?.position.y || janeMom?.position.y !== johnDad?.position.y) {
  console.log('❌ ISSUE: Jane\'s parents (John\'s parents-in-law) not at same level as John\'s parents');
}
if (johnUncle?.position.y !== johnDad?.position.y) {
  console.log('❌ ISSUE: John\'s uncle not at same level as John\'s parents');  
}
if (johnAunt?.position.y !== johnDad?.position.y) {
  console.log('❌ ISSUE: John\'s aunt-in-law not at same level as John\'s parents');
}
if (janeBrother?.position.y !== john?.position.y) {
  console.log('❌ ISSUE: Jane\'s brother not at same level as John');
}
if (janeSisterInLaw?.position.y !== john?.position.y) {
  console.log('❌ ISSUE: Jane\'s sister-in-law not at same level as John');
}

console.log('');
console.log('The post-processing logic needs to handle broader in-law relationships more comprehensively.');