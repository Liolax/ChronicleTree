/**
 * Test that parents and parents-in-law are always at the same generation level
 * regardless of who is set as the root person
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Parents and Parents-in-Law Generation Consistency ===');

// Family structure:
// John & Jane (couple 1) have daughter Alice
// Bob & Carol (couple 2) have son David
// Alice marries David
// All parents should be at the same generation level regardless of root

const people = [
  // Couple 1: John & Jane (Alice's parents)
  { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1960-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1962-01-01' },
  
  // Couple 2: Bob & Carol (David's parents)  
  { id: 3, first_name: 'Bob', last_name: 'Johnson', gender: 'Male', date_of_birth: '1958-01-01' },
  { id: 4, first_name: 'Carol', last_name: 'Johnson', gender: 'Female', date_of_birth: '1960-01-01' },
  
  // The married couple (children)
  { id: 5, first_name: 'Alice', last_name: 'Smith', gender: 'Female', date_of_birth: '1990-01-01' },
  { id: 6, first_name: 'David', last_name: 'Johnson', gender: 'Male', date_of_birth: '1988-01-01' }
];

const relationships = [
  // John & Jane are married
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // Bob & Carol are married
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Alice & David are married
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // John & Jane are Alice's parents
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  
  // Bob & Carol are David's parents
  { source: 6, target: 3, type: 'parent', from: 6, to: 3 },
  { source: 3, target: 6, type: 'child', from: 3, to: 6 },
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 }
];

console.log('Family structure:');
console.log('John & Jane -> Alice');
console.log('Bob & Carol -> David');
console.log('Alice married David');
console.log('');
console.log('Expected: All parents (John, Jane, Bob, Carol) should be at same generation level');
console.log('');

function testWithRoot(rootId, rootName) {
  console.log(`--- Testing with ${rootName} as Root ---`);
  
  const result = createFamilyTreeLayout(people, relationships, rootId);
  
  const john = result.nodes.find(n => n.data.person.first_name === 'John');
  const jane = result.nodes.find(n => n.data.person.first_name === 'Jane');
  const bob = result.nodes.find(n => n.data.person.first_name === 'Bob');
  const carol = result.nodes.find(n => n.data.person.first_name === 'Carol');
  const alice = result.nodes.find(n => n.data.person.first_name === 'Alice');
  const david = result.nodes.find(n => n.data.person.first_name === 'David');
  
  console.log('Node positions:');
  result.nodes.forEach(node => {
    console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
  });
  
  if (john && jane && bob && carol) {
    const johnGen = john.position.y;
    const janeGen = jane.position.y;
    const bobGen = bob.position.y;
    const carolGen = carol.position.y;
    
    console.log('');
    console.log('Parent generations:');
    console.log(`  John: y=${johnGen}`);
    console.log(`  Jane: y=${janeGen}`);
    console.log(`  Bob: y=${bobGen}`);
    console.log(`  Carol: y=${carolGen}`);
    
    const allSameGeneration = johnGen === janeGen && janeGen === bobGen && bobGen === carolGen;
    
    if (allSameGeneration) {
      console.log('  ✅ SUCCESS: All parents at same generation level');
    } else {
      console.log('  ❌ FAILURE: Parents at different generation levels');
    }
    
    return { johnGen, janeGen, bobGen, carolGen, allSameGeneration };
  }
  
  console.log('');
  return null;
}

// Test with different root persons
const results = [];

results.push(testWithRoot(1, 'John (parent)'));
results.push(testWithRoot(5, 'Alice (child)'));
results.push(testWithRoot(6, 'David (child)'));

console.log('--- Cross-Root Analysis ---');

// Check if parent generations are consistent across different roots
const validResults = results.filter(r => r !== null);

if (validResults.length >= 2) {
  let consistent = true;
  const baseResult = validResults[0];
  
  for (let i = 1; i < validResults.length; i++) {
    const currentResult = validResults[i];
    
    if (baseResult.johnGen !== currentResult.johnGen ||
        baseResult.janeGen !== currentResult.janeGen ||
        baseResult.bobGen !== currentResult.bobGen ||
        baseResult.carolGen !== currentResult.carolGen) {
      consistent = false;
      break;
    }
  }
  
  if (consistent) {
    console.log('✅ SUCCESS: Parent generations are consistent across all root selections');
  } else {
    console.log('❌ FAILURE: Parent generations change depending on root selection');
    console.log('');
    console.log('Generation comparison:');
    validResults.forEach((result, index) => {
      const rootNames = ['John', 'Alice', 'David'];
      console.log(`  ${rootNames[index]} as root: John=${result.johnGen}, Jane=${result.janeGen}, Bob=${result.bobGen}, Carol=${result.carolGen}`);
    });
  }
  
  // Check if all parents are at same level within each root scenario
  const allParentsSameLevel = validResults.every(r => r.allSameGeneration);
  
  if (allParentsSameLevel) {
    console.log('✅ SUCCESS: Within each root scenario, all parents are at the same level');
  } else {
    console.log('❌ FAILURE: Parents are not at the same generation level within some root scenarios');
  }
} else {
  console.log('❌ ERROR: Could not analyze results properly');
}

console.log('');

// Test a more complex scenario with grandparents
console.log('--- Complex Scenario: 3 Generations ---');

const complexPeople = [
  // Grandparents
  { id: 1, first_name: 'GrandDad1', last_name: 'Smith', gender: 'Male', date_of_birth: '1940-01-01' },
  { id: 2, first_name: 'GrandMom1', last_name: 'Smith', gender: 'Female', date_of_birth: '1942-01-01' },
  { id: 3, first_name: 'GrandDad2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1938-01-01' },
  { id: 4, first_name: 'GrandMom2', last_name: 'Johnson', gender: 'Female', date_of_birth: '1940-01-01' },
  
  // Parents (parents-in-law to each other)
  { id: 5, first_name: 'Dad1', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 6, first_name: 'Mom1', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 7, first_name: 'Dad2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1968-01-01' },
  { id: 8, first_name: 'Mom2', last_name: 'Johnson', gender: 'Female', date_of_birth: '1970-01-01' },
  
  // Children
  { id: 9, first_name: 'Child1', last_name: 'Smith', gender: 'Female', date_of_birth: '2000-01-01' },
  { id: 10, first_name: 'Child2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1998-01-01' }
];

const complexRelationships = [
  // Grandparent marriages
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Parent marriages  
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 },
  
  // Child marriage
  { source: 9, target: 10, type: 'spouse', from: 9, to: 10 },
  { source: 10, target: 9, type: 'spouse', from: 10, to: 9 },
  
  // Grandparent -> Parent relationships
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  
  { source: 7, target: 3, type: 'parent', from: 7, to: 3 },
  { source: 3, target: 7, type: 'child', from: 3, to: 7 },
  { source: 7, target: 4, type: 'parent', from: 7, to: 4 },
  { source: 4, target: 7, type: 'child', from: 4, to: 7 },
  
  // Parent -> Child relationships
  { source: 9, target: 5, type: 'parent', from: 9, to: 5 },
  { source: 5, target: 9, type: 'child', from: 5, to: 9 },
  { source: 9, target: 6, type: 'parent', from: 9, to: 6 },
  { source: 6, target: 9, type: 'child', from: 6, to: 9 },
  
  { source: 10, target: 7, type: 'parent', from: 10, to: 7 },
  { source: 7, target: 10, type: 'child', from: 7, to: 10 },
  { source: 10, target: 8, type: 'parent', from: 10, to: 8 },
  { source: 8, target: 10, type: 'child', from: 8, to: 10 }
];

console.log('Testing 3-generation family with Child1 as root:');
const complexResult = createFamilyTreeLayout(complexPeople, complexRelationships, 9); // Child1 as root

// Group by expected generations
const grandparents = ['GrandDad1', 'GrandMom1', 'GrandDad2', 'GrandMom2'];
const parents = ['Dad1', 'Mom1', 'Dad2', 'Mom2'];
const children = ['Child1', 'Child2'];

console.log('');
console.log('Generation analysis:');

grandparents.forEach(name => {
  const node = complexResult.nodes.find(n => n.data.person.first_name === name);
  if (node) {
    console.log(`  ${name} (grandparent): y=${node.position.y}`);
  }
});

parents.forEach(name => {
  const node = complexResult.nodes.find(n => n.data.person.first_name === name);
  if (node) {
    console.log(`  ${name} (parent/parent-in-law): y=${node.position.y}`);
  }
});

children.forEach(name => {
  const node = complexResult.nodes.find(n => n.data.person.first_name === name);
  if (node) {
    console.log(`  ${name} (child): y=${node.position.y}`);
  }
});

// Check if parents-in-law are at same level
const parentNodes = parents.map(name => complexResult.nodes.find(n => n.data.person.first_name === name)).filter(n => n);
const parentGenerations = parentNodes.map(n => n.position.y);
const parentsAtSameLevel = parentGenerations.every(gen => gen === parentGenerations[0]);

console.log('');
if (parentsAtSameLevel) {
  console.log('✅ SUCCESS: All parents and parents-in-law are at the same generation level');
} else {
  console.log('❌ FAILURE: Parents and parents-in-law are at different generation levels');
  console.log(`   Parent generations: [${parentGenerations.join(', ')}]`);
}

console.log('');
console.log('=== Expected Behavior ===');
console.log('✅ Parents and parents-in-law should always be at the same generation level');
console.log('✅ This should be consistent regardless of who is set as the root person');
console.log('✅ All people of the same generation should have the same y-coordinate');
console.log('✅ In-law relationships should not affect generation positioning');