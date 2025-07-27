/**
 * Debug the collision resolution process
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Simple test case with just the three problematic nodes
const people = [
  { id: 4, first_name: 'StepGrandfather', last_name: 'Step', gender: 'Male', date_of_birth: '1935-01-01' },
  { id: 5, first_name: 'Grandfather', last_name: 'Person', gender: 'Male', date_of_birth: '1940-01-01' },
  { id: 7, first_name: 'GreatUncle', last_name: 'Person', gender: 'Male', date_of_birth: '1938-01-01' },
];

const relationships = [
  // Make them siblings so they end up in same generation
  { source: 4, target: 5, type: 'sibling', from: 4, to: 5 },
  { source: 5, target: 4, type: 'sibling', from: 5, to: 4 },
  { source: 5, target: 7, type: 'sibling', from: 5, to: 7 },
  { source: 7, target: 5, type: 'sibling', from: 7, to: 5 },
];

console.log('=== COLLISION RESOLUTION DEBUG ===');
console.log('');
console.log('Testing with just 3 nodes that should be spaced apart:');
console.log('StepGrandfather, Grandfather, GreatUncle');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '5');
  
  console.log(`Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Show initial positions
  console.log('Node positions:');
  nodes.forEach(node => {
    const person = people.find(p => String(p.id) === node.id);
    console.log(`  ${person.first_name}: X=${Math.round(node.position.x)}, Y=${Math.round(node.position.y)}`);
  });
  console.log('');
  
  // Check distances
  console.log('Distances between nodes:');
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      const personA = people.find(p => String(p.id) === nodeA.id);
      const personB = people.find(p => String(p.id) === nodeB.id);
      
      const distance = Math.abs(nodeA.position.x - nodeB.position.x);
      const required = 360; // 280 + 80 minimum
      const status = distance >= required ? '✅' : '❌';
      
      console.log(`  ${personA.first_name} ↔ ${personB.first_name}: ${Math.round(distance)}px ${status} (min: ${required}px)`);
    }
  }
  
} catch (error) {
  console.error('Error:', error.message);
}