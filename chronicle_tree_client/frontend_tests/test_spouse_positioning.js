/**
 * Test that spouses are positioned close together even without shared children
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Spouse Positioning ===');

// Test Case 1: Married couple without children
console.log('--- Test Case 1: Married Couple Without Children ---');
const people1 = [
  { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships1 = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 }
];

const { nodes: nodes1, edges: edges1 } = createFamilyTreeLayout(people1, relationships1);

console.log('Node positions:');
nodes1.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const john = nodes1.find(n => n.data.person.first_name === 'John');
const jane = nodes1.find(n => n.data.person.first_name === 'Jane');

if (john && jane) {
  const xDistance = Math.abs(john.position.x - jane.position.x);
  const yDistance = Math.abs(john.position.y - jane.position.y);
  
  console.log(`Distance between spouses: x=${xDistance}, y=${yDistance}`);
  
  if (yDistance === 0) {
    console.log('✅ SUCCESS: Spouses are on the same generation level');
  } else {
    console.log('❌ FAILURE: Spouses are on different generation levels');
  }
  
  if (xDistance <= 400) { // Should be close based on spouse spacing constants
    console.log('✅ SUCCESS: Spouses are positioned close together');
  } else {
    console.log('❌ FAILURE: Spouses are too far apart');
    console.log(`   Expected distance ≤ 400, got ${xDistance}`);
  }
} else {
  console.log('❌ FAILURE: Could not find both spouses');
}

console.log('');

// Test Case 2: Married couple with children (for comparison)
console.log('--- Test Case 2: Married Couple With Children (Comparison) ---');
const people2 = [
  { id: 1, first_name: 'Bob', last_name: 'Johnson', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 2, first_name: 'Alice', last_name: 'Johnson', gender: 'Female', date_of_birth: '1977-01-01' },
  { id: 3, first_name: 'Child', last_name: 'Johnson', gender: 'Male', date_of_birth: '2000-01-01' }
];

const relationships2 = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 }
];

const { nodes: nodes2, edges: edges2 } = createFamilyTreeLayout(people2, relationships2);

console.log('Node positions:');
nodes2.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const bob = nodes2.find(n => n.data.person.first_name === 'Bob');
const alice = nodes2.find(n => n.data.person.first_name === 'Alice');

if (bob && alice) {
  const xDistance = Math.abs(bob.position.x - alice.position.x);
  const yDistance = Math.abs(bob.position.y - alice.position.y);
  
  console.log(`Distance between spouses with children: x=${xDistance}, y=${yDistance}`);
  
  if (yDistance === 0) {
    console.log('✅ SUCCESS: Spouses with children are on the same generation level');
  } else {
    console.log('❌ FAILURE: Spouses with children are on different generation levels');
  }
  
  if (xDistance <= 400) {
    console.log('✅ SUCCESS: Spouses with children are positioned close together');
  } else {
    console.log('❌ FAILURE: Spouses with children are too far apart');
  }
}

console.log('');

// Test Case 3: Multiple unrelated couples
console.log('--- Test Case 3: Multiple Unrelated Couples ---');
const people3 = [
  { id: 1, first_name: 'Tom', last_name: 'Brown', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Lisa', last_name: 'Brown', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'Mike', last_name: 'Davis', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 4, first_name: 'Sara', last_name: 'Davis', gender: 'Female', date_of_birth: '1977-01-01' }
];

const relationships3 = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 }
];

const { nodes: nodes3, edges: edges3 } = createFamilyTreeLayout(people3, relationships3);

console.log('Node positions:');
nodes3.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const tom = nodes3.find(n => n.data.person.first_name === 'Tom');
const lisa = nodes3.find(n => n.data.person.first_name === 'Lisa');
const mike = nodes3.find(n => n.data.person.first_name === 'Mike');
const sara = nodes3.find(n => n.data.person.first_name === 'Sara');

if (tom && lisa) {
  const xDistance1 = Math.abs(tom.position.x - lisa.position.x);
  console.log(`Tom & Lisa distance: x=${xDistance1}`);
  if (xDistance1 <= 400) {
    console.log('✅ SUCCESS: First couple positioned close together');
  } else {
    console.log('❌ FAILURE: First couple too far apart');
  }
}

if (mike && sara) {
  const xDistance2 = Math.abs(mike.position.x - sara.position.x);
  console.log(`Mike & Sara distance: x=${xDistance2}`);
  if (xDistance2 <= 400) {
    console.log('✅ SUCCESS: Second couple positioned close together');
  } else {
    console.log('❌ FAILURE: Second couple too far apart');
  }
}

console.log('');
console.log('=== Summary ===');
console.log('✅ Spouses should be positioned close to each other regardless of whether they have children');
console.log('✅ The spacing should use the spouse spacing constants (≤ 400 pixels apart)');
console.log('✅ Multiple couples should each have their own close positioning');