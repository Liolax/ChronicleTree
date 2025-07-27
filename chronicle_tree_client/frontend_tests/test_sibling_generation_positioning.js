/**
 * Test that direct siblings are positioned at the same generation level
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Sibling Generation Positioning ===');

// Test Case 1: Two direct siblings without parents
const people1 = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male' }
];

const relationships1 = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 }
];

console.log('--- Test Case 1: Two Direct Siblings (No Parents) ---');
const { nodes: nodes1, edges: edges1 } = createFamilyTreeLayout(people1, relationships1);

console.log('Node positions:');
nodes1.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): y = ${node.position.y}`);
});

const patricia = nodes1.find(n => n.data.person.first_name === 'Patricia');
const david = nodes1.find(n => n.data.person.first_name === 'David');

if (patricia && david) {
  if (patricia.position.y === david.position.y) {
    console.log('✅ SUCCESS: Patricia and David are at the same generation level');
  } else {
    console.log('❌ FAILURE: Patricia and David are at different generation levels');
    console.log(`   Patricia y: ${patricia.position.y}, David y: ${david.position.y}`);
  }
} else {
  console.log('❌ FAILURE: Could not find Patricia or David in nodes');
}

console.log('');

// Test Case 2: Three direct siblings 
const people2 = [
  { id: 1, first_name: 'Alice', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'Bob', last_name: 'Smith', gender: 'Male' },
  { id: 3, first_name: 'Carol', last_name: 'Smith', gender: 'Female' }
];

const relationships2 = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 },
  { source: 1, target: 3, type: 'sister', from: 1, to: 3 },
  { source: 3, target: 1, type: 'sister', from: 3, to: 1 },
  { source: 2, target: 3, type: 'sister', from: 2, to: 3 },
  { source: 3, target: 2, type: 'brother', from: 3, to: 2 }
];

console.log('--- Test Case 2: Three Direct Siblings (No Parents) ---');
const { nodes: nodes2, edges: edges2 } = createFamilyTreeLayout(people2, relationships2);

console.log('Node positions:');
nodes2.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): y = ${node.position.y}`);
});

const alice = nodes2.find(n => n.data.person.first_name === 'Alice');
const bob = nodes2.find(n => n.data.person.first_name === 'Bob');
const carol = nodes2.find(n => n.data.person.first_name === 'Carol');

if (alice && bob && carol) {
  if (alice.position.y === bob.position.y && bob.position.y === carol.position.y) {
    console.log('✅ SUCCESS: All three siblings are at the same generation level');
  } else {
    console.log('❌ FAILURE: Siblings are at different generation levels');
    console.log(`   Alice y: ${alice.position.y}, Bob y: ${bob.position.y}, Carol y: ${carol.position.y}`);
  }
} else {
  console.log('❌ FAILURE: Could not find all siblings in nodes');
}

console.log('');

// Test Case 3: Mixed - siblings with and without parents  
const people3 = [
  { id: 1, first_name: 'Parent', last_name: 'Smith', gender: 'Male' },
  { id: 2, first_name: 'Child1', last_name: 'Smith', gender: 'Female' }, // Has parent
  { id: 3, first_name: 'Child2', last_name: 'Smith', gender: 'Male' },   // Has parent  
  { id: 4, first_name: 'Orphan1', last_name: 'Smith', gender: 'Female' }, // No parent, sibling of Orphan2
  { id: 5, first_name: 'Orphan2', last_name: 'Smith', gender: 'Male' }    // No parent, sibling of Orphan1
];

const relationships3 = [
  // Parent-child relationships
  { source: 2, target: 1, type: 'parent', from: 2, to: 1 },
  { source: 1, target: 2, type: 'child', from: 1, to: 2 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  // Siblings with parent
  { source: 2, target: 3, type: 'brother', from: 2, to: 3 },
  { source: 3, target: 2, type: 'sister', from: 3, to: 2 },
  // Direct siblings (no parent)
  { source: 4, target: 5, type: 'brother', from: 4, to: 5 },
  { source: 5, target: 4, type: 'sister', from: 5, to: 4 }
];

console.log('--- Test Case 3: Mixed Family Structure ---');
const { nodes: nodes3, edges: edges3 } = createFamilyTreeLayout(people3, relationships3);

console.log('Node positions:');
nodes3.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): y = ${node.position.y}`);
});

const child1 = nodes3.find(n => n.data.person.first_name === 'Child1');
const child2 = nodes3.find(n => n.data.person.first_name === 'Child2');
const orphan1 = nodes3.find(n => n.data.person.first_name === 'Orphan1');
const orphan2 = nodes3.find(n => n.data.person.first_name === 'Orphan2');

if (child1 && child2) {
  if (child1.position.y === child2.position.y) {
    console.log('✅ SUCCESS: Child1 and Child2 (with parent) are at the same generation level');
  } else {
    console.log('❌ FAILURE: Child1 and Child2 are at different generation levels');
  }
}

if (orphan1 && orphan2) {
  if (orphan1.position.y === orphan2.position.y) {
    console.log('✅ SUCCESS: Orphan1 and Orphan2 (direct siblings) are at the same generation level');
  } else {
    console.log('❌ FAILURE: Orphan1 and Orphan2 are at different generation levels');
  }
}

console.log('');
console.log('=== Summary ===');
console.log('✅ Direct siblings should be positioned at the same y-coordinate (generation level)');
console.log('✅ Blue dotted connectors should connect siblings on the same horizontal line');