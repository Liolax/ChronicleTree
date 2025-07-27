/**
 * Test Classic Tree View - Compare root-based vs classic full tree
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Simple 3-generation family for clear comparison
const people = [
  // Grandparents
  { id: 1, first_name: 'Grandpa', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01' },
  { id: 2, first_name: 'Grandma', last_name: 'Smith', gender: 'Female', date_of_birth: '1925-01-01' },
  
  // Parents
  { id: 3, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'Mother', last_name: 'Johnson', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Children
  { id: 5, first_name: 'Son', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 6, first_name: 'Daughter', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
];

const relationships = [
  // Grandparent couple
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // Parent generation
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  
  // Parent couple
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Children
  { source: 3, target: 5, type: 'child', from: 3, to: 5 },
  { source: 5, target: 3, type: 'parent', from: 5, to: 3 },
  { source: 4, target: 5, type: 'child', from: 4, to: 5 },
  { source: 5, target: 4, type: 'parent', from: 5, to: 4 },
  
  { source: 3, target: 6, type: 'child', from: 3, to: 6 },
  { source: 6, target: 3, type: 'parent', from: 6, to: 3 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 },
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
];

console.log('=== CLASSIC TREE VIEW COMPARISON ===');
console.log('');
console.log('Comparing root-based vs classic full tree approaches:');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  console.log('👤 ROOT-BASED TREE (with Father as root):');
  const { nodes: rootNodes, edges: rootEdges } = createFamilyTreeLayout(people, relationships, handlers, '3');
  
  console.log(`   Generated ${rootNodes.length} nodes and ${rootEdges.length} edges`);
  console.log('   Edge analysis:');
  
  // Analyze root-based edges
  const rootEdgeTypes = new Map();
  rootEdges.forEach(edge => {
    const color = edge.style?.stroke || 'no-color';
    const width = edge.style?.strokeWidth || 'no-width';
    const dash = edge.style?.strokeDasharray || 'solid';
    const type = `${color} (${width}px, ${dash})`;
    rootEdgeTypes.set(type, (rootEdgeTypes.get(type) || 0) + 1);
  });
  
  rootEdgeTypes.forEach((count, type) => {
    console.log(`   - ${count} edges: ${type}`);
  });
  console.log('');
  
  console.log('🌳 CLASSIC FULL TREE (no root selected):');
  const { nodes: fullNodes, edges: fullEdges } = createFamilyTreeLayout(people, relationships, handlers, null);
  
  console.log(`   Generated ${fullNodes.length} nodes and ${fullEdges.length} edges`);
  console.log('   Edge analysis:');
  
  // Analyze full tree edges
  const fullEdgeTypes = new Map();
  fullEdges.forEach(edge => {
    const color = edge.style?.stroke || 'no-color';
    const width = edge.style?.strokeWidth || 'no-width';
    const dash = edge.style?.strokeDasharray || 'solid';
    const opacity = edge.style?.opacity || 1;
    const type = `${color} (${width}px, ${dash}, ${Math.round(opacity*100)}% opacity)`;
    fullEdgeTypes.set(type, (fullEdgeTypes.get(type) || 0) + 1);
  });
  
  fullEdgeTypes.forEach((count, type) => {
    console.log(`   - ${count} edges: ${type}`);
  });
  console.log('');
  
  // Compare positioning approach
  console.log('📊 POSITIONING COMPARISON:');
  const rootPositions = rootNodes.map(n => ({ 
    name: n.data.person.first_name, 
    x: Math.round(n.position.x), 
    y: Math.round(n.position.y) 
  }));
  const fullPositions = fullNodes.map(n => ({ 
    name: n.data.person.first_name, 
    x: Math.round(n.position.x), 
    y: Math.round(n.position.y) 
  }));
  
  console.log('   Root-based positioning:');
  rootPositions.forEach(pos => {
    console.log(`   - ${pos.name}: (${pos.x}, ${pos.y})`);
  });
  console.log('');
  
  console.log('   Classic full tree positioning:');
  fullPositions.forEach(pos => {
    console.log(`   - ${pos.name}: (${pos.x}, ${pos.y})`);
  });
  console.log('');
  
  // Final comparison
  const edgeReduction = Math.round(((rootEdges.length - fullEdges.length) / rootEdges.length) * 100);
  const visualComplexity = fullEdges.reduce((sum, edge) => sum + (edge.style?.opacity || 1), 0) / fullEdges.length;
  
  console.log('🎯 CLASSIC TREE BENEFITS:');
  console.log(`   Edge reduction: ${edgeReduction}% fewer connectors`);
  console.log(`   Average edge opacity: ${Math.round(visualComplexity * 100)}% (more subtle)`);
  console.log(`   Visual approach: ${fullEdges.length === 0 ? 'Pure positioning' : 'Minimal connectors + positioning'}`);
  console.log('');
  
  if (edgeReduction > 0 || visualComplexity < 0.5) {
    console.log('🎉 SUCCESS! Classic tree view is more subtle and traditional!');
    console.log('');
    console.log('✅ Fewer visual distractions from connectors');
    console.log('✅ More focus on family member information');
    console.log('✅ Traditional genealogical tree appearance');
    console.log('✅ Position-based relationship understanding');
  } else {
    console.log('🔧 Classic tree view needs more refinement.');
  }

} catch (error) {
  console.error('❌ Error testing classic tree view:', error.message);
  console.error(error.stack);
}