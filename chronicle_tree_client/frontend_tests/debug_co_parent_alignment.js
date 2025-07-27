/**
 * Debug the co-parent alignment issue to understand why some co-parents
 * are not being aligned to the same generation level
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debugging Co-Parent Alignment ===');

// Simplified test case that's failing
const people = [
  { id: 1, first_name: 'Dad1', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Mom1', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'Kid1', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
  { id: 4, first_name: 'Dad2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 5, first_name: 'Mom2', last_name: 'Williams', gender: 'Female', date_of_birth: '1973-01-01' },
  { id: 6, first_name: 'Kid2', last_name: 'Johnson-Williams', gender: 'Female', date_of_birth: '2002-01-01' }
];

const relationships = [
  // Dad1 & Mom1 are married and have Kid1
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // Dad2 & Mom2 are NOT married but both are parents of Kid2
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 },
  { source: 6, target: 5, type: 'parent', from: 6, to: 5 },
  { source: 5, target: 6, type: 'child', from: 5, to: 6 }
];

console.log('Testing scenario:');
console.log('- Dad1 & Mom1: married, parents of Kid1');
console.log('- Dad2 & Mom2: NOT married, co-parents of Kid2');
console.log('- Expected: All 4 parents at same generation level');
console.log('');

// Test with Kid1 as root (from married family)
console.log('--- Kid1 as Root ---');
const result1 = createFamilyTreeLayout(people, relationships, 3);

console.log('Node positions:');
result1.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const parents1 = ['Dad1', 'Mom1', 'Dad2', 'Mom2'];
parents1.forEach(name => {
  const node = result1.nodes.find(n => n.data.person.first_name === name);
  if (node) {
    console.log(`${name}: y=${node.position.y}`);
  }
});

console.log('');

// Test with Kid2 as root (from unmarried co-parents)
console.log('--- Kid2 as Root ---');
const result2 = createFamilyTreeLayout(people, relationships, 6);

console.log('Node positions:');
result2.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

parents1.forEach(name => {
  const node = result2.nodes.find(n => n.data.person.first_name === name);
  if (node) {
    console.log(`${name}: y=${node.position.y}`);
  }
});

console.log('');

// Test even simpler case - just the unmarried co-parents
console.log('--- Simplified: Just Unmarried Co-Parents ---');

const simplePeople = [
  { id: 4, first_name: 'Dad2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 5, first_name: 'Mom2', last_name: 'Williams', gender: 'Female', date_of_birth: '1973-01-01' },
  { id: 6, first_name: 'Kid2', last_name: 'Johnson-Williams', gender: 'Female', date_of_birth: '2002-01-01' }
];

const simpleRelationships = [
  // Dad2 & Mom2 are NOT married but both are parents of Kid2
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 },
  { source: 6, target: 5, type: 'parent', from: 6, to: 5 },
  { source: 5, target: 6, type: 'child', from: 5, to: 6 }
];

const result3 = createFamilyTreeLayout(simplePeople, simpleRelationships, 6);

console.log('Simplified node positions:');
result3.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const dad2 = result3.nodes.find(n => n.data.person.first_name === 'Dad2');
const mom2 = result3.nodes.find(n => n.data.person.first_name === 'Mom2');

if (dad2 && mom2) {
  const sameGeneration = dad2.position.y === mom2.position.y;
  console.log(`Dad2: y=${dad2.position.y}, Mom2: y=${mom2.position.y}`);
  console.log(`Co-parents at same level: ${sameGeneration}`);
  
  if (sameGeneration) {
    console.log('✅ Simplified case works - issue is with complex interaction');
  } else {
    console.log('❌ Even simplified case fails - fundamental co-parent alignment issue');
  }
} else {
  console.log('❌ Could not find nodes in simplified case');
}

console.log('');
console.log('=== Analysis ===');
console.log('If simplified case works but complex case fails, the issue is likely:');
console.log('1. Interaction between married couples and unmarried co-parents');
console.log('2. Processing order affecting generation assignment');
console.log('3. BFS traversal starting from different roots affects co-parent alignment');
console.log('');
console.log('If even simplified case fails, the co-parent alignment logic needs fixing.');