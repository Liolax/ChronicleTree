/**
 * Test complex late spouse scenarios with multiple generations and different root persons
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Complex Late Spouse Scenarios ===');

// Complex family with multiple late spouse relationships across generations
const people = [
  // Generation 1 (grandparents) - both late spouses
  { id: 1, first_name: 'GrandDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01', date_of_death: '2010-01-01', is_deceased: true },
  { id: 2, first_name: 'GrandMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1922-01-01', date_of_death: '2015-01-01', is_deceased: true },
  
  // Generation 2 (parents) - mixed late/current spouse relationships
  { id: 3, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'Mother', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01', date_of_death: '2022-01-01', is_deceased: true },
  
  { id: 5, first_name: 'Uncle', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'Aunt', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  
  // Generation 3 (children) - current spouses
  { id: 7, first_name: 'Son', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 8, first_name: 'Daughter_In_Law', last_name: 'Jones', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships = [
  // Late spouse relationship (both deceased)
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2, is_deceased: true },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1, is_deceased: true },
  
  // Late spouse relationship (one deceased)
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4, is_deceased: true },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3, is_deceased: true },
  
  // Current spouse relationship
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // Current spouse relationship (young generation)
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 },
  
  // Parent-child relationships
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  
  { source: 7, target: 3, type: 'parent', from: 7, to: 3 },
  { source: 3, target: 7, type: 'child', from: 3, to: 7 },
  { source: 7, target: 4, type: 'parent', from: 7, to: 4 },
  { source: 4, target: 7, type: 'child', from: 4, to: 7 }
];

function testWithRoot(rootId, rootName) {
  console.log(`--- Testing with ${rootName} as Root ---`);
  
  const result = createFamilyTreeLayout(people, relationships, rootId);
  
  console.log('Node positions:');
  result.nodes.forEach(node => {
    const status = node.data.person.is_deceased || node.data.person.date_of_death ? ' (deceased)' : '';
    console.log(`  ${node.data.person.first_name}${status}: x=${node.position.x}, y=${node.position.y}`);
  });
  
  // Check all spouse pairs
  const couples = [
    { names: ['GrandDad', 'GrandMom'], type: 'late', generation: 'Grandparent' },
    { names: ['Father', 'Mother'], type: 'late', generation: 'Parent' },
    { names: ['Uncle', 'Aunt'], type: 'current', generation: 'Parent' },
    { names: ['Son', 'Daughter_In_Law'], type: 'current', generation: 'Child' }
  ];
  
  couples.forEach(couple => {
    const person1 = result.nodes.find(n => n.data.person.first_name === couple.names[0]);
    const person2 = result.nodes.find(n => n.data.person.first_name === couple.names[1]);
    
    if (person1 && person2) {
      const distance = Math.abs(person1.position.x - person2.position.x);
      const sameGeneration = person1.position.y === person2.position.y;
      const expectedDistance = couple.type === 'late' ? 350 : 330;
      
      console.log(`  ${couple.generation} - ${couple.names[0]} & ${couple.names[1]} (${couple.type}):`);
      console.log(`    Distance: ${distance}px, Same line: ${sameGeneration}, Expected: ${expectedDistance}px`);
      
      if (distance === expectedDistance && sameGeneration) {
        console.log(`    ✅ SUCCESS`);
      } else {
        console.log(`    ❌ FAILURE`);
      }
    }
  });
  
  console.log('');
}

// Test with different root persons
testWithRoot(1, 'GrandDad');
testWithRoot(3, 'Father');
testWithRoot(7, 'Son');

console.log('--- Summary Analysis ---');

// Test consistency across different roots
const results = [
  createFamilyTreeLayout(people, relationships, 1), // GrandDad as root
  createFamilyTreeLayout(people, relationships, 3), // Father as root  
  createFamilyTreeLayout(people, relationships, 7)  // Son as root
];

let allConsistent = true;

// Check that all late spouse pairs maintain the same distance regardless of root
['GrandDad', 'Father'].forEach(person => {
  const spouseName = person === 'GrandDad' ? 'GrandMom' : 'Mother';
  const distances = results.map(result => {
    const p1 = result.nodes.find(n => n.data.person.first_name === person);
    const p2 = result.nodes.find(n => n.data.person.first_name === spouseName);
    return p1 && p2 ? Math.abs(p1.position.x - p2.position.x) : null;
  });
  
  const sameLines = results.map(result => {
    const p1 = result.nodes.find(n => n.data.person.first_name === person);
    const p2 = result.nodes.find(n => n.data.person.first_name === spouseName);
    return p1 && p2 ? p1.position.y === p2.position.y : null;
  });
  
  const distanceConsistent = distances.every(d => d === 350);
  const lineConsistent = sameLines.every(l => l === true);
  
  if (distanceConsistent && lineConsistent) {
    console.log(`✅ ${person} & ${spouseName}: Consistent across all roots (350px, same line)`);
  } else {
    console.log(`❌ ${person} & ${spouseName}: Inconsistent - distances: [${distances.join(', ')}], same lines: [${sameLines.join(', ')}]`);
    allConsistent = false;
  }
});

if (allConsistent) {
  console.log('');
  console.log('✅ SUCCESS: All late spouse pairs are consistently positioned regardless of root person');
  console.log('✅ Late spouses maintain 350px distance (more than current spouses 330px)');
  console.log('✅ All spouse pairs are on the same line within their generation');
} else {
  console.log('');
  console.log('❌ FAILURE: Late spouse positioning is not consistent across different root persons');
}

console.log('');
console.log('=== Expected Behavior ===');
console.log('✅ Late spouses (both deceased) should be 350px apart and on same line');
console.log('✅ Current spouses should be 330px apart and on same line');
console.log('✅ Distance should be the same regardless of who is the root person');
console.log('✅ All spouses should be on the same generation line as each other');