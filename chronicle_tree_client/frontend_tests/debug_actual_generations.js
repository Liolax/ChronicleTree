/**
 * Temporarily modify the layout function to log actual generation assignments
 */

// I'll create a minimal test that calls the actual functions to see what's really happening

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debug Actual Generation Assignments ===');

// Test data
const people = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' }
];

const relationships = [
  // John and Jane marriage
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  // John's parent relationships
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  { source: 1, target: 4, type: 'parent', from: 1, to: 4 },
  { source: 4, target: 1, type: 'child', from: 4, to: 1 },
  // John's parents marriage
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  // Jane's parent relationships
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  // Jane's parents marriage  
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 }
];

console.log('Simplified test: Just John, Jane, and their parents');
console.log('Expected result: All parents should be at same y-coordinate');
console.log('');

const result = createFamilyTreeLayout(people, relationships, {}, 1);

console.log('Results:');
result.nodes.forEach(node => {
  const name = node.data.person.first_name;
  const y = node.position.y;
  console.log(`${name}: y=${y}`);
});

console.log('');
console.log('Analysis:');
const parents = result.nodes.filter(n => ['JohnDad', 'JohnMom', 'JaneDad', 'JaneMom'].includes(n.data.person.first_name));
const parentYCoords = parents.map(n => n.position.y);
const uniqueYCoords = [...new Set(parentYCoords)];

if (uniqueYCoords.length === 1) {
  console.log('✅ SUCCESS: All parents at same y-coordinate:', uniqueYCoords[0]);
} else {
  console.log('❌ FAILURE: Parents at different y-coordinates:', uniqueYCoords);
  parents.forEach(node => {
    console.log(`  ${node.data.person.first_name}: y=${node.position.y}`);
  });
}

console.log('');
console.log('If this simplified test shows the same issue, the problem is in the core algorithm.');
console.log('If this simplified test works, the issue is with the additional complexity (uncle/aunt relationships).');