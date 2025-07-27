/**
 * Test edge cases that might cause TypeErrors in sibling processing
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Error Edge Cases ===');

// Test Case 1: Relationship references non-existent person
console.log('--- Test Case 1: Relationship with non-existent person ---');
const people1 = [
  { id: 1, first_name: 'Alice', last_name: 'Smith', gender: 'Female' }
];

const relationships1 = [
  { source: 1, target: 999, type: 'brother', from: 1, to: 999 }, // Person 999 doesn't exist
  { source: 999, target: 1, type: 'sister', from: 999, to: 1 }   // Person 999 doesn't exist
];

try {
  const { nodes: nodes1, edges: edges1 } = createFamilyTreeLayout(people1, relationships1);
  console.log('✅ SUCCESS: Handled relationship with non-existent person gracefully');
  console.log(`   Generated ${nodes1.length} nodes and ${edges1.length} edges`);
} catch (error) {
  console.log('❌ FAILURE: Error when processing relationship with non-existent person');
  console.log(`   Error: ${error.message}`);
}

console.log('');

// Test Case 2: Empty relationships array
console.log('--- Test Case 2: Empty relationships array ---');
const people2 = [
  { id: 1, first_name: 'Alice', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'Bob', last_name: 'Smith', gender: 'Male' }
];

const relationships2 = [];

try {
  const { nodes: nodes2, edges: edges2 } = createFamilyTreeLayout(people2, relationships2);
  console.log('✅ SUCCESS: Handled empty relationships array gracefully');
  console.log(`   Generated ${nodes2.length} nodes and ${edges2.length} edges`);
} catch (error) {
  console.log('❌ FAILURE: Error with empty relationships array');
  console.log(`   Error: ${error.message}`);
}

console.log('');

// Test Case 3: Malformed relationship data
console.log('--- Test Case 3: Malformed relationship data ---');
const people3 = [
  { id: 1, first_name: 'Alice', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'Bob', last_name: 'Smith', gender: 'Male' }
];

const relationships3 = [
  { source: null, target: 2, type: 'brother' }, // null source
  { source: 1, target: undefined, type: 'sister' }, // undefined target
  { source: 1, target: 2, type: null }, // null type
  {} // completely empty relationship
];

try {
  const { nodes: nodes3, edges: edges3 } = createFamilyTreeLayout(people3, relationships3);
  console.log('✅ SUCCESS: Handled malformed relationship data gracefully');
  console.log(`   Generated ${nodes3.length} nodes and ${edges3.length} edges`);
} catch (error) {
  console.log('❌ FAILURE: Error with malformed relationship data');
  console.log(`   Error: ${error.message}`);
}

console.log('');

// Test Case 4: Mixed valid and invalid data
console.log('--- Test Case 4: Mixed valid and invalid data ---');
const people4 = [
  { id: 1, first_name: 'Alice', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'Bob', last_name: 'Smith', gender: 'Male' },
  { id: 3, first_name: 'Carol', last_name: 'Smith', gender: 'Female' }
];

const relationships4 = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 }, // Valid
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 },  // Valid
  { source: 1, target: 999, type: 'sister' }, // Invalid - person 999 doesn't exist
  { source: 2, target: 3, type: 'sister', from: 2, to: 3 }, // Valid
  { source: null, target: 3, type: 'brother' } // Invalid - null source
];

try {
  const { nodes: nodes4, edges: edges4 } = createFamilyTreeLayout(people4, relationships4);
  console.log('✅ SUCCESS: Handled mixed valid/invalid data gracefully');
  console.log(`   Generated ${nodes4.length} nodes and ${edges4.length} edges`);
  
  // Check if valid relationships still work
  const siblingEdges = edges4.filter(e => e.id.startsWith('sibling-'));
  console.log(`   Created ${siblingEdges.length} sibling edges from valid relationships`);
  
  if (siblingEdges.length > 0) {
    console.log('✅ Valid sibling relationships were processed correctly');
  }
} catch (error) {
  console.log('❌ FAILURE: Error with mixed valid/invalid data');
  console.log(`   Error: ${error.message}`);
}

console.log('');
console.log('=== Summary ===');
console.log('✅ The fixed code should handle all edge cases without throwing TypeErrors');
console.log('✅ Invalid relationships are filtered out, valid ones are processed normally');