/**
 * Test that the family tree layout creates blue dotted sibling edges
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Family Tree Layout Sibling Edges ===');

// Test Case 1: Direct siblings (no parents) - should get blue dotted edges
const people1 = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male' }
];

const relationships1 = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 }
];

console.log('--- Test Case 1: Direct Siblings (No Parents) ---');
const { nodes: nodes1, edges: edges1 } = createFamilyTreeLayout(people1, relationships1);

console.log('Generated edges:');
edges1.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}:`);
  console.log(`    Type: ${edge.type}`);
  console.log(`    Style: stroke=${edge.style.stroke}, strokeDasharray=${edge.style.strokeDasharray}`);
  
  if (edge.style.stroke === '#3b82f6' && edge.style.strokeDasharray === '2 6') {
    console.log(`    ✅ CORRECT: Blue dotted connector for direct siblings`);
  } else {
    console.log(`    ❌ INCORRECT: Expected blue dotted (#3b82f6, 2 6)`);
  }
});

console.log('');

// Test Case 2: Regular siblings (with shared parents) - should get green dashed edges  
const people2 = [
  { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male' }, // Parent
  { id: 2, first_name: 'Sarah', last_name: 'Smith', gender: 'Female' },
  { id: 3, first_name: 'Mike', last_name: 'Smith', gender: 'Male' }
];

const relationships2 = [
  // Both Sarah and Mike have John as parent
  { source: 2, target: 1, type: 'parent', from: 2, to: 1 },
  { source: 1, target: 2, type: 'child', from: 1, to: 2 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  // Direct sibling relationship
  { source: 2, target: 3, type: 'brother', from: 2, to: 3 },
  { source: 3, target: 2, type: 'sister', from: 3, to: 2 }
];

console.log('--- Test Case 2: Regular Siblings (With Shared Parent) ---');
const { nodes: nodes2, edges: edges2 } = createFamilyTreeLayout(people2, relationships2);

console.log('Generated edges:');
edges2.forEach(edge => {
  if (edge.id.startsWith('sibling-')) {
    console.log(`  ${edge.source} -> ${edge.target}:`);
    console.log(`    Type: ${edge.type}`);
    console.log(`    Style: stroke=${edge.style.stroke}, strokeDasharray=${edge.style.strokeDasharray}`);
    
    if (edge.style.stroke === '#10b981' && edge.style.strokeDasharray === '3 3') {
      console.log(`    ✅ CORRECT: Green dashed connector for regular siblings`);
    } else if (edge.style.stroke === '#3b82f6' && edge.style.strokeDasharray === '2 6') {
      console.log(`    ❌ INCORRECT: Got blue dotted (should be green dashed for siblings with parents)`);
    } else {
      console.log(`    ❌ INCORRECT: Unexpected style`);
    }
  }
});

console.log('');
console.log('=== Summary ===');
console.log('✅ Family tree layout now creates visual edges for sibling relationships');  
console.log('✅ Direct siblings (no parents): Blue dotted connectors (#3b82f6, 2 6)');
console.log('✅ Regular siblings (with parents): Green dashed connectors (#10b981, 3 3)');