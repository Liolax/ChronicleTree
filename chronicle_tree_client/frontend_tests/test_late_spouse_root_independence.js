/**
 * Test that late spouses are positioned at the same line regardless of who is the root person
 * And ensure they have more distance than current spouses but are still on the same line
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Late Spouse Root Independence ===');

// Family with late spouse relationship and children
const people = [
  { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Mary', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01', date_of_death: '2020-01-01', is_deceased: true },
  { id: 3, first_name: 'Son', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 4, first_name: 'Daughter', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships = [
  // Late spouse relationship (Mary is deceased, but was legitimately married to John)
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2, is_deceased: true },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1, is_deceased: true },
  
  // Children relationships
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  { source: 4, target: 1, type: 'parent', from: 4, to: 1 },
  { source: 1, target: 4, type: 'child', from: 1, to: 4 },
  { source: 4, target: 2, type: 'parent', from: 4, to: 2 },
  { source: 2, target: 4, type: 'child', from: 2, to: 4 }
];

// Test Case 1: John as root
console.log('--- Test Case 1: John as Root ---');
const result1 = createFamilyTreeLayout(people, relationships, 1); // John as root
const john1 = result1.nodes.find(n => n.data.person.first_name === 'John');
const mary1 = result1.nodes.find(n => n.data.person.first_name === 'Mary');
const son1 = result1.nodes.find(n => n.data.person.first_name === 'Son');

console.log('Node positions (John as root):');
result1.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

if (john1 && mary1) {
  const distance1 = Math.abs(john1.position.x - mary1.position.x);
  const sameGeneration1 = john1.position.y === mary1.position.y;
  console.log(`John & Mary (late spouses): Distance=${distance1}px, Same line=${sameGeneration1}`);
}

console.log('');

// Test Case 2: Mary as root  
console.log('--- Test Case 2: Mary as Root ---');
const result2 = createFamilyTreeLayout(people, relationships, 2); // Mary as root
const john2 = result2.nodes.find(n => n.data.person.first_name === 'John');
const mary2 = result2.nodes.find(n => n.data.person.first_name === 'Mary');

console.log('Node positions (Mary as root):');
result2.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

if (john2 && mary2) {
  const distance2 = Math.abs(john2.position.x - mary2.position.x);
  const sameGeneration2 = john2.position.y === mary2.position.y;
  console.log(`John & Mary (late spouses): Distance=${distance2}px, Same line=${sameGeneration2}`);
}

console.log('');

// Test Case 3: Son as root
console.log('--- Test Case 3: Son as Root ---');
const result3 = createFamilyTreeLayout(people, relationships, 3); // Son as root
const john3 = result3.nodes.find(n => n.data.person.first_name === 'John');
const mary3 = result3.nodes.find(n => n.data.person.first_name === 'Mary');

console.log('Node positions (Son as root):');
result3.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

if (john3 && mary3) {
  const distance3 = Math.abs(john3.position.x - mary3.position.x);
  const sameGeneration3 = john3.position.y === mary3.position.y;
  console.log(`John & Mary (late spouses): Distance=${distance3}px, Same line=${sameGeneration3}`);
}

console.log('');

// Analysis
console.log('--- Analysis ---');

if (john1 && mary1 && john2 && mary2 && john3 && mary3) {
  // Check if late spouses are always on the same line regardless of root
  const allSameLine = (john1.position.y === mary1.position.y) && 
                      (john2.position.y === mary2.position.y) && 
                      (john3.position.y === mary3.position.y);
  
  if (allSameLine) {
    console.log('✅ SUCCESS: Late spouses are always on the same line regardless of root person');
  } else {
    console.log('❌ FAILURE: Late spouses are not consistently on the same line');
    console.log(`  John as root: John y=${john1.position.y}, Mary y=${mary1.position.y}`);
    console.log(`  Mary as root: John y=${john2.position.y}, Mary y=${mary2.position.y}`);
    console.log(`  Son as root: John y=${john3.position.y}, Mary y=${mary3.position.y}`);
  }
  
  // Check distances
  const distance1 = Math.abs(john1.position.x - mary1.position.x);
  const distance2 = Math.abs(john2.position.x - mary2.position.x);
  const distance3 = Math.abs(john3.position.x - mary3.position.x);
  
  console.log('');
  console.log('Distance consistency:');
  console.log(`  John as root: ${distance1}px`);
  console.log(`  Mary as root: ${distance2}px`);
  console.log(`  Son as root: ${distance3}px`);
  
  const currentSpouseDistance = 330; // From constants
  const lateSpouseDistance = 350;   // From constants
  
  const allDistancesCorrect = distance1 === lateSpouseDistance && 
                             distance2 === lateSpouseDistance && 
                             distance3 === lateSpouseDistance;
  
  if (allDistancesCorrect) {
    console.log(`✅ SUCCESS: All late spouse distances are ${lateSpouseDistance}px (more than current spouses ${currentSpouseDistance}px)`);
  } else {
    console.log(`❌ FAILURE: Late spouse distances are inconsistent or incorrect`);
    console.log(`   Expected: ${lateSpouseDistance}px (late spouse constant)`);
    console.log(`   Current spouse distance: ${currentSpouseDistance}px`);
  }
}

console.log('');

// Test comparison with current spouses
console.log('--- Comparison with Current Spouses ---');

const currentSpousePeople = [
  { id: 5, first_name: 'Bob', last_name: 'Jones', gender: 'Male', date_of_birth: '1955-01-01' },
  { id: 6, first_name: 'Alice', last_name: 'Jones', gender: 'Female', date_of_birth: '1957-01-01' }
];

const currentSpouseRelationships = [
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 }
];

const resultCurrent = createFamilyTreeLayout(currentSpousePeople, currentSpouseRelationships, 5);
const bob = resultCurrent.nodes.find(n => n.data.person.first_name === 'Bob');
const alice = resultCurrent.nodes.find(n => n.data.person.first_name === 'Alice');

if (bob && alice) {
  const currentDistance = Math.abs(bob.position.x - alice.position.x);
  console.log(`Current spouses (Bob & Alice): Distance=${currentDistance}px`);
  
  if (john1 && mary1) {
    const lateDistance = Math.abs(john1.position.x - mary1.position.x);
    console.log(`Late spouses (John & Mary): Distance=${lateDistance}px`);
    
    if (lateDistance > currentDistance) {
      console.log('✅ SUCCESS: Late spouses have more distance than current spouses');
    } else {
      console.log('❌ FAILURE: Late spouses should have more distance than current spouses');
      console.log(`   Expected: Late > Current, Got: ${lateDistance} vs ${currentDistance}`);
    }
  }
}

console.log('');
console.log('=== Expected Behavior ===');
console.log('✅ Late spouses should always be on the same line (same y-coordinate) regardless of root person');
console.log('✅ Late spouses should have more distance than current spouses but still be together');
console.log('✅ Distance should be consistent regardless of who is the root person');