/**
 * Test with just uncle/aunt added to see what causes the split
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debug Uncle/Aunt Generation Split Issue ===');

// Test 1: Basic case that works
console.log('--- Test 1: Basic Case (works) ---');
const basicPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' }
];

const basicRelationships = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  { source: 1, target: 4, type: 'parent', from: 1, to: 4 },
  { source: 4, target: 1, type: 'child', from: 4, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 }
];

const basicResult = createFamilyTreeLayout(basicPeople, basicRelationships, {}, 1);
console.log('Basic test results:');
basicResult.nodes.forEach(node => {
  const name = node.data.person.first_name;
  const y = node.position.y;
  console.log(`  ${name}: y=${y}`);
});

// Test 2: Add just uncle (no aunt)
console.log('');
console.log('--- Test 2: Add Uncle Only ---');
const uncleOnlyPeople = [...basicPeople, 
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe', gender: 'Male', date_of_birth: '1954-01-01' }
];

const uncleOnlyRelationships = [...basicRelationships,
  { source: 3, target: 7, type: 'sibling', from: 3, to: 7 },
  { source: 7, target: 3, type: 'sibling', from: 7, to: 3 }
];

const uncleOnlyResult = createFamilyTreeLayout(uncleOnlyPeople, uncleOnlyRelationships, {}, 1);
console.log('Uncle-only test results:');
uncleOnlyResult.nodes.forEach(node => {
  const name = node.data.person.first_name;
  const y = node.position.y;
  console.log(`  ${name}: y=${y}`);
});

// Test 3: Add uncle + aunt (married couple)
console.log('');
console.log('--- Test 3: Add Uncle + Aunt (Married) ---');
const fullPeople = [...uncleOnlyPeople,
  { id: 8, first_name: 'JohnAunt', last_name: 'Doe', gender: 'Female', date_of_birth: '1956-01-01' }
];

const fullRelationships = [...uncleOnlyRelationships,
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 }
];

const fullResult = createFamilyTreeLayout(fullPeople, fullRelationships, {}, 1);
console.log('Full test results:');
fullResult.nodes.forEach(node => {
  const name = node.data.person.first_name;
  const y = node.position.y;
  console.log(`  ${name}: y=${y}`);
});

console.log('');
console.log('=== Analysis ===');

function analyzeParentPositions(result, testName) {
  const parents = result.nodes.filter(n => 
    ['JohnDad', 'JohnMom', 'JaneDad', 'JaneMom', 'JohnUncle', 'JohnAunt']
    .includes(n.data.person.first_name)
  );
  
  const parentYCoords = parents.map(n => n.position.y);
  const uniqueYCoords = [...new Set(parentYCoords)];
  
  console.log(`${testName}:`);
  if (uniqueYCoords.length === 1) {
    console.log(`  ✅ All parents at same y-coordinate: ${uniqueYCoords[0]}`);
  } else {
    console.log(`  ❌ Parents at different y-coordinates: ${uniqueYCoords}`);
    parents.forEach(node => {
      console.log(`    ${node.data.person.first_name}: y=${node.position.y}`);
    });
  }
}

analyzeParentPositions(basicResult, 'Basic (John+Jane+parents)');
analyzeParentPositions(uncleOnlyResult, 'Uncle Only');
analyzeParentPositions(fullResult, 'Uncle + Aunt');

console.log('');
console.log('This will help identify exactly what causes the generation split.');