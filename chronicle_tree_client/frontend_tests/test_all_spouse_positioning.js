/**
 * Test that ALL spouse pairs are positioned close together across all generations
 * Including children of root person and their spouses
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing ALL Spouse Positioning Across Generations ===');

// Multi-generation family tree with multiple spouse pairs
const people = [
  // Root generation (grandparents)
  { id: 1, first_name: 'GrandDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1940-01-01' },
  { id: 2, first_name: 'GrandMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1942-01-01' },
  
  // Parent generation (children of root)
  { id: 3, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 4, first_name: 'Mother', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  
  // Another parent generation couple (uncle/aunt)
  { id: 5, first_name: 'Uncle', last_name: 'Smith', gender: 'Male', date_of_birth: '1968-01-01' },
  { id: 6, first_name: 'Aunt', last_name: 'Smith', gender: 'Female', date_of_birth: '1970-01-01' },
  
  // Child generation (grandchildren)
  { id: 7, first_name: 'Son', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
  { id: 8, first_name: 'Daughter_In_Law', last_name: 'Jones', gender: 'Female', date_of_birth: '2002-01-01' },
  
  // Another child generation couple
  { id: 9, first_name: 'Daughter', last_name: 'Smith', gender: 'Female', date_of_birth: '1998-01-01' },
  { id: 10, first_name: 'Son_In_Law', last_name: 'Brown', gender: 'Male', date_of_birth: '1996-01-01' }
];

const relationships = [
  // Grandparent couple
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // Parent couple (Father & Mother)
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Uncle & Aunt couple
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // Child couple (Son & Daughter-in-law)
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 },
  
  // Another child couple (Daughter & Son-in-law)
  { source: 9, target: 10, type: 'spouse', from: 9, to: 10 },
  { source: 10, target: 9, type: 'spouse', from: 10, to: 9 },
  
  // Parent-child relationships
  // GrandDad & GrandMom -> Father
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // GrandDad & GrandMom -> Uncle
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  
  // Father & Mother -> Son
  { source: 7, target: 3, type: 'parent', from: 7, to: 3 },
  { source: 3, target: 7, type: 'child', from: 3, to: 7 },
  { source: 7, target: 4, type: 'parent', from: 7, to: 4 },
  { source: 4, target: 7, type: 'child', from: 4, to: 7 },
  
  // Father & Mother -> Daughter
  { source: 9, target: 3, type: 'parent', from: 9, to: 3 },
  { source: 3, target: 9, type: 'child', from: 3, to: 9 },
  { source: 9, target: 4, type: 'parent', from: 9, to: 4 },
  { source: 4, target: 9, type: 'child', from: 4, to: 9 }
];

const { nodes, edges } = createFamilyTreeLayout(people, relationships);

console.log('Generated nodes:');
nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): x=${node.position.x}, y=${node.position.y}`);
});

console.log('');

// Find all the couples and check their distances
const couples = [
  { names: ['GrandDad', 'GrandMom'], generation: 'Root' },
  { names: ['Father', 'Mother'], generation: 'Parent' },
  { names: ['Uncle', 'Aunt'], generation: 'Parent' },
  { names: ['Son', 'Daughter_In_Law'], generation: 'Child' },
  { names: ['Daughter', 'Son_In_Law'], generation: 'Child' }
];

console.log('--- Spouse Distance Analysis ---');

let allCouplesCloseEnough = true;
const maxAcceptableDistance = 400; // Should be ≤ 400px for close spouse positioning

couples.forEach(couple => {
  const person1 = nodes.find(n => n.data.person.first_name === couple.names[0]);
  const person2 = nodes.find(n => n.data.person.first_name === couple.names[1]);
  
  if (person1 && person2) {
    const distance = Math.abs(person1.position.x - person2.position.x);
    const sameGeneration = person1.position.y === person2.position.y;
    
    console.log(`${couple.generation} Generation - ${couple.names[0]} & ${couple.names[1]}:`);
    console.log(`  Distance: ${distance}px`);
    console.log(`  Same generation: ${sameGeneration}`);
    
    if (distance <= maxAcceptableDistance) {
      console.log(`  ✅ SUCCESS: Close positioning (≤ ${maxAcceptableDistance}px)`);
    } else {
      console.log(`  ❌ FAILURE: Too far apart (expected ≤ ${maxAcceptableDistance}px)`);
      allCouplesCloseEnough = false;
    }
    
    if (!sameGeneration) {
      console.log(`  ❌ FAILURE: Not at same generation level`);
      allCouplesCloseEnough = false;
    }
    
    console.log('');
  } else {
    console.log(`❌ Could not find couple: ${couple.names[0]} & ${couple.names[1]}`);
    allCouplesCloseEnough = false;
  }
});

console.log('--- Overall Analysis ---');
if (allCouplesCloseEnough) {
  console.log('✅ SUCCESS: ALL spouse pairs across all generations are positioned close together');
} else {
  console.log('❌ FAILURE: Some spouse pairs are positioned too far apart');
}

console.log('');

// Check specific generations
console.log('--- Generation Layout ---');
const generationGroups = new Map();
nodes.forEach(node => {
  const y = node.position.y;
  if (!generationGroups.has(y)) {
    generationGroups.set(y, []);
  }
  generationGroups.get(y).push(node.data.person.first_name);
});

Array.from(generationGroups.keys()).sort((a, b) => a - b).forEach(y => {
  console.log(`Generation y=${y}: ${generationGroups.get(y).join(', ')}`);
});

console.log('');

// Check spouse edges
console.log('--- Spouse Edge Analysis ---');
const spouseEdges = edges.filter(e => e.id.startsWith('spouse-'));
console.log(`Total spouse edges: ${spouseEdges.length}`);
spouseEdges.forEach(edge => {
  const sourcePerson = nodes.find(n => n.id === edge.source)?.data.person.first_name;
  const targetPerson = nodes.find(n => n.id === edge.target)?.data.person.first_name;
  console.log(`  ${sourcePerson} -> ${targetPerson}: ${edge.style.stroke} (${edge.style.strokeDasharray || 'solid'})`);
});

console.log('');
console.log('=== Expected Behavior ===');
console.log('✅ ALL spouse pairs should be positioned close together (≤ 400px apart)');
console.log('✅ This includes root couples, parent generation couples, and child generation couples');
console.log('✅ Each spouse pair should be at the same generation level');
console.log('✅ Son and his wife should be close, daughter and her husband should be close');