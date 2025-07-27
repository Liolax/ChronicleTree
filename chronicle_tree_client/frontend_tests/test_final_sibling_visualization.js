/**
 * Final comprehensive test of sibling visualization:
 * - Blue dotted connectors between direct siblings
 * - Same generation positioning 
 * - Proper edge styling
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Final Sibling Visualization Test ===');
console.log('This test verifies that David Smith as Brother of Patricia:');
console.log('1. Shows blue dotted connector between them');
console.log('2. Positions them on the same horizontal line (generation)');
console.log('3. Creates proper edge styling');
console.log('');

const people = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male' }
];

const relationships = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 }
];

const { nodes, edges } = createFamilyTreeLayout(people, relationships);

console.log('=== Node Positioning ===');
nodes.forEach(node => {
  console.log(`${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const patricia = nodes.find(n => n.data.person.first_name === 'Patricia');
const david = nodes.find(n => n.data.person.first_name === 'David');

if (patricia && david && patricia.position.y === david.position.y) {
  console.log('✅ POSITIONING: Patricia and David are on the same horizontal line');
} else {
  console.log('❌ POSITIONING: Patricia and David are at different levels');
}

console.log('');
console.log('=== Edge Styling ===');
edges.forEach(edge => {
  if (edge.id.startsWith('sibling-')) {
    console.log(`Edge ${edge.source} -> ${edge.target}:`);
    console.log(`  Type: ${edge.type}`);
    console.log(`  Stroke color: ${edge.style.stroke}`);
    console.log(`  Dash pattern: ${edge.style.strokeDasharray}`);
    console.log(`  Stroke width: ${edge.style.strokeWidth}`);
    
    if (edge.style.stroke === '#3b82f6' && edge.style.strokeDasharray === '2 6') {
      console.log('  ✅ STYLING: Correct blue dotted connector');
    } else {
      console.log('  ❌ STYLING: Incorrect styling');
    }
  }
});

if (edges.some(e => e.id.startsWith('sibling-'))) {
  console.log('✅ EDGES: Sibling connector edges are being created');
} else {
  console.log('❌ EDGES: No sibling connector edges found');
}

console.log('');
console.log('=== Final Result ===');
const hasCorrectPositioning = patricia && david && patricia.position.y === david.position.y;
const hasCorrectEdges = edges.some(e => 
  e.id.startsWith('sibling-') && 
  e.style.stroke === '#3b82f6' && 
  e.style.strokeDasharray === '2 6'
);

if (hasCorrectPositioning && hasCorrectEdges) {
  console.log('🎉 SUCCESS: David Smith as Brother of Patricia now shows:');
  console.log('   ✅ Blue dotted connector between their nodes');
  console.log('   ✅ Same generation positioning (same horizontal line)');
  console.log('   ✅ Proper visual indication that they are siblings with no declared parents');
} else {
  console.log('❌ FAILURE: Some aspects are not working correctly');
  console.log(`   Positioning: ${hasCorrectPositioning ? '✅' : '❌'}`);
  console.log(`   Blue dotted edges: ${hasCorrectEdges ? '✅' : '❌'}`);
}