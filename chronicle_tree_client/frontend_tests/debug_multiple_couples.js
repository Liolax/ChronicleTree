/**
 * Debug why multiple unrelated couples aren't positioned correctly
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debugging Multiple Couples ===');

const people = [
  { id: 1, first_name: 'Tom', last_name: 'Brown', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Lisa', last_name: 'Brown', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'Mike', last_name: 'Davis', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 4, first_name: 'Sara', last_name: 'Davis', gender: 'Female', date_of_birth: '1977-01-01' }
];

const relationships = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 }
];

console.log('Input data:');
console.log('People:', people.map(p => `${p.first_name} (${p.id})`));
console.log('Relationships:', relationships.map(r => `${r.source} -${r.type}-> ${r.target}`));
console.log('');

const { nodes, edges } = createFamilyTreeLayout(people, relationships);

console.log('Generated nodes:');
nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): x=${node.position.x}, y=${node.position.y}`);
});

console.log('');
console.log('Generated edges:');
edges.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}: ${edge.type} (${edge.style.stroke})`);
});

// Check if spouses are connected by edges
const spouseEdges = edges.filter(e => e.style.stroke === '#ec4899'); // Pink spouse edges
console.log('');
console.log('Spouse edges:');
if (spouseEdges.length > 0) {
  spouseEdges.forEach(edge => {
    console.log(`  ${edge.source} -> ${edge.target}: spouse connection`);
  });
} else {
  console.log('  No spouse edges found');
}

// Analyze the positioning
const tom = nodes.find(n => n.data.person.first_name === 'Tom');
const lisa = nodes.find(n => n.data.person.first_name === 'Lisa');
const mike = nodes.find(n => n.data.person.first_name === 'Mike');
const sara = nodes.find(n => n.data.person.first_name === 'Sara');

console.log('');
console.log('Analysis:');
if (tom && lisa) {
  const sameGeneration = tom.position.y === lisa.position.y;
  const distance = Math.abs(tom.position.x - lisa.position.x);
  console.log(`Tom & Lisa: Same generation? ${sameGeneration}, Distance: ${distance}px`);
}

if (mike && sara) {
  const sameGeneration = mike.position.y === sara.position.y;
  const distance = Math.abs(mike.position.x - sara.position.x);
  console.log(`Mike & Sara: Same generation? ${sameGeneration}, Distance: ${distance}px`);
}

console.log('');
console.log('Expected behavior:');
console.log('- All 4 people should be at the same generation level (same y-coordinate)');
console.log('- Tom & Lisa should be close together (≤ 400px apart)');
console.log('- Mike & Sara should be close together (≤ 400px apart)');
console.log('- There should be spouse edges connecting each couple');