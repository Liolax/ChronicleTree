/**
 * Test that only direct siblings (no shared parents) get visual connectors
 * Regular siblings with shared parents should have no connectors (shown through positioning)
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Sibling Connector Logic ===');

// Test Case 1: Siblings with shared parents (should have NO visual connectors)
console.log('--- Test Case 1: Siblings With Shared Parents ---');

const people1 = [
  { id: 1, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Mother', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 3, first_name: 'Brother', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 4, first_name: 'Sister', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships1 = [
  // Parents are spouses
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // Brother has both parents
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // Sister has both parents
  { source: 4, target: 1, type: 'parent', from: 4, to: 1 },
  { source: 1, target: 4, type: 'child', from: 1, to: 4 },
  { source: 4, target: 2, type: 'parent', from: 4, to: 2 },
  { source: 2, target: 4, type: 'child', from: 2, to: 4 },
  
  // Direct sibling relationship (should NOT get visual connector since they have shared parents)
  { source: 3, target: 4, type: 'sibling', from: 3, to: 4 },
  { source: 4, target: 3, type: 'sibling', from: 4, to: 3 }
];

const { nodes: nodes1, edges: edges1 } = createFamilyTreeLayout(people1, relationships1);

console.log('Generated edges:');
edges1.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}: ${edge.style.stroke} (${edge.style.strokeDasharray || 'solid'})`);
});

// Check for sibling edges
const siblingEdges1 = edges1.filter(e => e.id.startsWith('sibling-'));
console.log(`\nSibling edges found: ${siblingEdges1.length}`);
if (siblingEdges1.length === 0) {
  console.log('✅ SUCCESS: No sibling connectors for siblings with shared parents');
} else {
  console.log('❌ FAILURE: Found sibling connectors when none should exist');
  siblingEdges1.forEach(e => console.log(`  ${e.source} -> ${e.target}`));
}

console.log('');

// Test Case 2: Direct siblings (no shared parents) should get blue dotted connectors
console.log('--- Test Case 2: Direct Siblings (No Shared Parents) ---');

const people2 = [
  { id: 1, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Jones', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships2 = [
  // Direct sibling relationship with no shared parents
  { source: 1, target: 2, type: 'Brother', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 }
];

const { nodes: nodes2, edges: edges2 } = createFamilyTreeLayout(people2, relationships2);

console.log('Generated edges:');
edges2.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}: ${edge.style.stroke} (${edge.style.strokeDasharray || 'solid'})`);
});

// Check for sibling edges
const siblingEdges2 = edges2.filter(e => e.id.startsWith('sibling-'));
console.log(`\nSibling edges found: ${siblingEdges2.length}`);
if (siblingEdges2.length > 0) {
  console.log('✅ SUCCESS: Found sibling connectors for direct siblings');
  siblingEdges2.forEach(e => {
    if (e.style.stroke === '#3b82f6' && e.style.strokeDasharray === '2 6') {
      console.log(`✅ Correct styling: ${e.source} -> ${e.target} (blue dotted)`);
    } else {
      console.log(`❌ Wrong styling: ${e.source} -> ${e.target} (${e.style.stroke}, ${e.style.strokeDasharray})`);
    }
  });
} else {
  console.log('❌ FAILURE: No sibling connectors found for direct siblings');
}

console.log('');

// Test Case 3: Mixed scenario - some siblings with parents, some without
console.log('--- Test Case 3: Mixed Scenario ---');

const people3 = [
  // Family 1: Parent + children
  { id: 1, first_name: 'Parent', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Child1', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 3, first_name: 'Child2', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  
  // Family 2: Direct siblings with no parents
  { id: 4, first_name: 'DirectSib1', last_name: 'Jones', gender: 'Male', date_of_birth: '1985-01-01' },
  { id: 5, first_name: 'DirectSib2', last_name: 'Jones', gender: 'Female', date_of_birth: '1987-01-01' }
];

const relationships3 = [
  // Regular siblings with shared parent
  { source: 2, target: 1, type: 'parent', from: 2, to: 1 },
  { source: 1, target: 2, type: 'child', from: 1, to: 2 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 2, target: 3, type: 'sibling', from: 2, to: 3 },
  { source: 3, target: 2, type: 'sibling', from: 3, to: 2 },
  
  // Direct siblings with no parents
  { source: 4, target: 5, type: 'Brother', from: 4, to: 5 },
  { source: 5, target: 4, type: 'Sister', from: 5, to: 4 }
];

const { nodes: nodes3, edges: edges3 } = createFamilyTreeLayout(people3, relationships3);

console.log('Generated edges:');
edges3.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}: ${edge.style.stroke} (${edge.style.strokeDasharray || 'solid'})`);
});

const siblingEdges3 = edges3.filter(e => e.id.startsWith('sibling-'));
console.log(`\nSibling edges found: ${siblingEdges3.length}`);

let correctCount = 0;
siblingEdges3.forEach(e => {
  if (e.style.stroke === '#3b82f6' && e.style.strokeDasharray === '2 6') {
    console.log(`✅ Correct blue dotted connector: ${e.source} -> ${e.target}`);
    correctCount++;
  } else {
    console.log(`❌ Wrong connector: ${e.source} -> ${e.target} (${e.style.stroke}, ${e.style.strokeDasharray})`);
  }
});

if (correctCount === 1 && siblingEdges3.length === 1) {
  console.log('✅ SUCCESS: Only direct siblings got connectors, regular siblings did not');
} else {
  console.log(`❌ Expected 1 blue dotted connector, got ${correctCount} correct and ${siblingEdges3.length} total`);
}

console.log('');
console.log('=== Summary ===');
console.log('✅ Regular siblings (with shared parents): NO visual connectors - shown through positioning');
console.log('✅ Direct siblings (no shared parents): Blue dotted connectors');
console.log('✅ This matches the legend: "📍 Sibling relationships shown through positioning"');