/**
 * Debug sibling-no-parents detection
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Simple case: just two siblings with no parent relationships
const people = [
  { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1990-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1992-01-01' },
];

const relationships = [
  // Only sibling relationship, no parent relationships  
  { source: 1, target: 2, type: 'sibling', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 },
];

console.log('=== SIBLING-NO-PARENTS DEBUG ===');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '1');
  
  console.log(`Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');

  // Check the edge details
  edges.forEach((edge, index) => {
    console.log(`Edge ${index + 1}:`);
    console.log(`  ID: ${edge.id}`);
    console.log(`  Source: ${edge.source} (${people.find(p => String(p.id) === edge.source)?.first_name})`);
    console.log(`  Target: ${edge.target} (${people.find(p => String(p.id) === edge.target)?.first_name})`);
    console.log(`  React Flow Type: ${edge.type}`);
    console.log(`  Relationship Type: ${edge.data?.relationshipType || 'not set'}`);
    console.log(`  Color: ${edge.style?.stroke || 'not set'}`);
    console.log(`  Style: ${edge.style?.strokeDasharray || 'solid'}`);
    console.log('');
  });

} catch (error) {
  console.error('Error:', error.message);
}