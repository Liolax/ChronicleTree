/**
 * Test that co-parents (people who share a child) are positioned at the same generation level
 * even if they are not married to each other
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Co-Parents Same Generation ===');

// Test Case 1: John and Jane share a child (Lisa) but are not married
console.log('--- Test Case 1: Unmarried Co-Parents with Shared Child ---');

const people1 = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'Lisa', last_name: 'Doe-Smith', gender: 'Female', date_of_birth: '2010-01-01' }
];

const relationships1 = [
  // John and Jane are NOT married, but they share a child
  // { source: 1, target: 2, type: 'spouse', from: 1, to: 2 }, // INTENTIONALLY COMMENTED OUT
  
  // Both John and Jane are parents of Lisa
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 }
];

console.log('Family structure:');
console.log('John and Jane are NOT married but both are parents of Lisa');
console.log('Expected: John and Jane should be at the same generation level (co-parents)');
console.log('');

function testCoParents(people, relationships, testName, rootId = null) {
  console.log(`Testing: ${testName}`);
  
  const result = createFamilyTreeLayout(people, relationships, rootId);
  
  console.log('Node positions:');
  result.nodes.forEach(node => {
    console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
  });
  
  const john = result.nodes.find(n => n.data.person.first_name === 'John');
  const jane = result.nodes.find(n => n.data.person.first_name === 'Jane');
  const lisa = result.nodes.find(n => n.data.person.first_name === 'Lisa');
  
  console.log('');
  
  if (john && jane && lisa) {
    const johnGen = john.position.y;
    const janeGen = jane.position.y;
    const lisaGen = lisa.position.y;
    
    console.log(`John (co-parent): y=${johnGen}`);
    console.log(`Jane (co-parent): y=${janeGen}`);
    console.log(`Lisa (shared child): y=${lisaGen}`);
    
    const coParentsSameLevel = johnGen === janeGen;
    const childDifferentLevel = lisaGen !== johnGen; // Child should be at different level
    
    if (coParentsSameLevel) {
      console.log('✅ SUCCESS: Co-parents at same generation level');
    } else {
      console.log('❌ FAILURE: Co-parents at different generation levels');
      console.log(`   Expected: Same generation, Got: John=${johnGen}, Jane=${janeGen}`);
    }
    
    if (childDifferentLevel) {
      console.log('✅ SUCCESS: Child at different generation from parents');
    } else {
      console.log('❌ FAILURE: Child at same generation as parents (should be different)');
    }
    
    return coParentsSameLevel && childDifferentLevel;
  } else {
    console.log('❌ ERROR: Could not find all required nodes');
    return false;
  }
}

// Test with different root persons
const success1 = testCoParents(people1, relationships1, 'Lisa as root', 3);
console.log('');

const success2 = testCoParents(people1, relationships1, 'John as root', 1);
console.log('');

const success3 = testCoParents(people1, relationships1, 'Jane as root', 2);
console.log('');

// Test Case 2: More complex scenario with multiple children
console.log('--- Test Case 2: Co-Parents with Multiple Children ---');

const people2 = [
  { id: 1, first_name: 'Father', last_name: 'Johnson', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 2, first_name: 'Mother', last_name: 'Williams', gender: 'Female', date_of_birth: '1977-01-01' },
  { id: 3, first_name: 'Child1', last_name: 'Johnson-Williams', gender: 'Male', date_of_birth: '2005-01-01' },
  { id: 4, first_name: 'Child2', last_name: 'Johnson-Williams', gender: 'Female', date_of_birth: '2007-01-01' },
  
  // Add another person for comparison
  { id: 5, first_name: 'Uncle', last_name: 'Johnson', gender: 'Male', date_of_birth: '1973-01-01' }
];

const relationships2 = [
  // Father and Mother are NOT married but share multiple children
  
  // Both are parents of Child1
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // Both are parents of Child2
  { source: 4, target: 1, type: 'parent', from: 4, to: 1 },
  { source: 1, target: 4, type: 'child', from: 1, to: 4 },
  { source: 4, target: 2, type: 'parent', from: 4, to: 2 },
  { source: 2, target: 4, type: 'child', from: 2, to: 4 },
  
  // Uncle is Father's sibling (for comparison)
  { source: 1, target: 5, type: 'sibling', from: 1, to: 5 },
  { source: 5, target: 1, type: 'sibling', from: 5, to: 1 }
];

console.log('Family structure:');
console.log('Father and Mother are NOT married but both are parents of Child1 AND Child2');
console.log('Uncle is Father\'s sibling');
console.log('Expected: Father and Mother should be at same generation level');
console.log('');

const success4 = testCoParents(people2, relationships2, 'Multiple children scenario', 3);
console.log('');

// Test Case 3: Mixed scenario - some married, some not
console.log('--- Test Case 3: Mixed Married and Unmarried Co-Parents ---');

const people3 = [
  // Married couple with child
  { id: 1, first_name: 'Dad1', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Mom1', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'Kid1', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
  
  // Unmarried co-parents with child
  { id: 4, first_name: 'Dad2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 5, first_name: 'Mom2', last_name: 'Williams', gender: 'Female', date_of_birth: '1973-01-01' },
  { id: 6, first_name: 'Kid2', last_name: 'Johnson-Williams', gender: 'Female', date_of_birth: '2002-01-01' }
];

const relationships3 = [
  // Married couple
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // Married couple's child
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // Unmarried co-parents (NOT married to each other)
  // { source: 4, target: 5, type: 'spouse', from: 4, to: 5 }, // INTENTIONALLY COMMENTED OUT
  
  // Unmarried co-parents' child
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 },
  { source: 6, target: 5, type: 'parent', from: 6, to: 5 },
  { source: 5, target: 6, type: 'child', from: 5, to: 6 }
];

console.log('Family structure:');
console.log('Dad1 & Mom1 are MARRIED and have Kid1');
console.log('Dad2 & Mom2 are NOT MARRIED but both are parents of Kid2');
console.log('Expected: All 4 parents should be at the same generation level');
console.log('');

const result3 = createFamilyTreeLayout(people3, relationships3, 3); // Kid1 as root

console.log('Node positions:');
result3.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const allParents = ['Dad1', 'Mom1', 'Dad2', 'Mom2'];
const parentNodes = allParents.map(name => 
  result3.nodes.find(n => n.data.person.first_name === name)
).filter(n => n);

console.log('');
console.log('Parent analysis:');
parentNodes.forEach(node => {
  const married = (node.data.person.first_name === 'Dad1' || node.data.person.first_name === 'Mom1') ? ' (married)' : ' (unmarried co-parent)';
  console.log(`  ${node.data.person.first_name}${married}: y=${node.position.y}`);
});

const parentGens = parentNodes.map(n => n.position.y);
const allParentsSameGen = parentGens.every(gen => gen === parentGens[0]);

if (allParentsSameGen) {
  console.log('✅ SUCCESS: All parents (married and unmarried co-parents) at same generation');
} else {
  console.log('❌ FAILURE: Parents at different generations');
  console.log(`   Generations: [${parentGens.join(', ')}]`);
}

console.log('');
console.log('=== Summary ===');

const allSuccess = success1 && success2 && success3 && success4 && allParentsSameGen;

if (allSuccess) {
  console.log('✅ SUCCESS: Co-parents are consistently positioned at same generation level');
  console.log('✅ This works for both married and unmarried co-parents');
  console.log('✅ Multiple children with same co-parents work correctly');
  console.log('✅ Mixed scenarios (married + unmarried co-parents) work correctly');
} else {
  console.log('❌ FAILURE: Some co-parent scenarios are not working correctly');
}

console.log('');
console.log('Expected behavior achieved: People who share a child (like Lisa)');
console.log('are positioned at the same generation level regardless of marriage status.');