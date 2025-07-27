/**
 * Test that late spouses are positioned at the same generation level (same y-coordinate)
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Late Spouse Positioning ===');

// Test Case 1: Late spouse relationship - both should be at same generation
console.log('--- Test Case 1: Late Spouse (Deceased Spouse) ---');

const people1 = [
  { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Mary', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01', date_of_death: '2020-01-01', is_deceased: true },
  { id: 3, first_name: 'Child', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' }
];

const relationships1 = [
  // Late spouse relationship (Mary is deceased, but was legitimately married to John)
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2, is_deceased: true },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1, is_deceased: true },
  
  // Child relationships
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 }
];

const { nodes: nodes1, edges: edges1 } = createFamilyTreeLayout(people1, relationships1);

console.log('Generated nodes:');
nodes1.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): x=${node.position.x}, y=${node.position.y}`);
});

const john = nodes1.find(n => n.data.person.first_name === 'John');
const mary = nodes1.find(n => n.data.person.first_name === 'Mary');
const child = nodes1.find(n => n.data.person.first_name === 'Child');

console.log('');
console.log('--- Generation Analysis ---');

if (john && mary) {
  const johnGen = john.position.y;
  const maryGen = mary.position.y;
  const distance = Math.abs(john.position.x - mary.position.x);
  
  console.log(`John generation: y=${johnGen}`);
  console.log(`Mary (deceased) generation: y=${maryGen}`);
  console.log(`Distance between late spouses: x=${distance}`);
  
  if (johnGen === maryGen) {
    console.log('✅ SUCCESS: Late spouses are at the same generation level');
  } else {
    console.log('❌ FAILURE: Late spouses are not at the same generation level');
    console.log(`   Expected: Same y-coordinate, got John: ${johnGen}, Mary: ${maryGen}`);
  }
  
  if (distance <= 400) {
    console.log('✅ SUCCESS: Late spouses are positioned close together');
  } else {
    console.log('❌ FAILURE: Late spouses are too far apart');
    console.log(`   Expected distance ≤ 400px, got ${distance}px`);
  }
}

if (child && john) {
  const childGen = child.position.y;
  const johnGen = john.position.y;
  
  if (childGen > johnGen) {
    console.log('✅ SUCCESS: Child is positioned in lower generation than parents');
  } else {
    console.log('❌ FAILURE: Child should be in lower generation than parents');
  }
}

console.log('');

// Test Case 2: Multiple late spouse relationships
console.log('--- Test Case 2: Multiple People with Late Spouses ---');

const people2 = [
  // First couple
  { id: 1, first_name: 'Robert', last_name: 'Jones', gender: 'Male', date_of_birth: '1945-01-01' },
  { id: 2, first_name: 'Helen', last_name: 'Jones', gender: 'Female', date_of_birth: '1947-01-01', date_of_death: '2018-01-01', is_deceased: true },
  
  // Second couple  
  { id: 3, first_name: 'David', last_name: 'Brown', gender: 'Male', date_of_birth: '1950-01-01', date_of_death: '2019-01-01', is_deceased: true },
  { id: 4, first_name: 'Linda', last_name: 'Brown', gender: 'Female', date_of_birth: '1952-01-01' }
];

const relationships2 = [
  // First late spouse relationship
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2, is_deceased: true },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1, is_deceased: true },
  
  // Second late spouse relationship
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4, is_deceased: true },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3, is_deceased: true }
];

const { nodes: nodes2, edges: edges2 } = createFamilyTreeLayout(people2, relationships2);

console.log('Generated nodes:');
nodes2.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): x=${node.position.x}, y=${node.position.y}`);
});

const robert = nodes2.find(n => n.data.person.first_name === 'Robert');
const helen = nodes2.find(n => n.data.person.first_name === 'Helen');
const david = nodes2.find(n => n.data.person.first_name === 'David');
const linda = nodes2.find(n => n.data.person.first_name === 'Linda');

console.log('');
console.log('--- Multiple Late Spouses Analysis ---');

if (robert && helen && david && linda) {
  const robertGen = robert.position.y;
  const helenGen = helen.position.y;
  const davidGen = david.position.y;
  const lindaGen = linda.position.y;
  
  console.log(`Robert generation: y=${robertGen}`);
  console.log(`Helen (deceased) generation: y=${helenGen}`);
  console.log(`David (deceased) generation: y=${davidGen}`);
  console.log(`Linda generation: y=${lindaGen}`);
  
  if (robertGen === helenGen && davidGen === lindaGen && robertGen === davidGen) {
    console.log('✅ SUCCESS: All late spouse pairs are at the same generation level');
  } else {
    console.log('❌ FAILURE: Late spouse pairs are not all at the same generation level');
  }
  
  // Check couple distances
  const couple1Distance = Math.abs(robert.position.x - helen.position.x);
  const couple2Distance = Math.abs(david.position.x - linda.position.x);
  
  console.log(`Robert & Helen distance: ${couple1Distance}px`);
  console.log(`David & Linda distance: ${couple2Distance}px`);
  
  if (couple1Distance <= 400 && couple2Distance <= 400) {
    console.log('✅ SUCCESS: Both late spouse couples are positioned close together');
  } else {
    console.log('❌ FAILURE: Late spouse couples are too far apart');
  }
}

console.log('');

// Check edge styling for late spouses
console.log('--- Late Spouse Edge Styling ---');
edges2.forEach(edge => {
  if (edge.id.startsWith('spouse-')) {
    console.log(`  ${edge.source} -> ${edge.target}: ${edge.style.stroke} (${edge.style.strokeDasharray || 'solid'})`);
    if (edge.style.stroke === '#000000') {
      console.log(`    ✅ Correct black color for late spouse edge`);
    } else {
      console.log(`    ❌ Wrong color for late spouse edge: ${edge.style.stroke}`);
    }
  }
});

console.log('');
console.log('=== Expected Behavior ===');
console.log('✅ Late spouses should be at the same generation level (same y-coordinate)');
console.log('✅ Late spouse couples should be positioned close together (≤ 400px apart)');
console.log('✅ Late spouse edges should be black with dashed style');