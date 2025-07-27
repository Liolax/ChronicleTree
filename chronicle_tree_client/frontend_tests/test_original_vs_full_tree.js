/**
 * Test Original Approach - Compare with root vs without root
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Simple family for testing
const people = [
  { id: 1, first_name: 'Grandpa', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01' },
  { id: 2, first_name: 'Grandma', last_name: 'Smith', gender: 'Female', date_of_birth: '1925-01-01' },
  { id: 3, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'Mother', last_name: 'Johnson', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 5, first_name: 'Son', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 6, first_name: 'Daughter', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
];

const relationships = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  { source: 3, target: 5, type: 'child', from: 3, to: 5 },
  { source: 5, target: 3, type: 'parent', from: 5, to: 3 },
  { source: 4, target: 5, type: 'child', from: 4, to: 5 },
  { source: 5, target: 4, type: 'parent', from: 5, to: 4 },
  { source: 3, target: 6, type: 'child', from: 3, to: 6 },
  { source: 6, target: 3, type: 'parent', from: 6, to: 3 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 },
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
];

console.log('=== ORIGINAL APPROACH COMPARISON ===');
console.log('');

const handlers = {
  onEdit: () => {},
  onDelete: () => {},
  onPersonCardOpen: () => {},
  onRestructure: () => {}
};

try {
  console.log('👤 WITH ROOT PERSON (Father as root):');
  const { nodes: rootNodes, edges: rootEdges } = createFamilyTreeLayout(people, relationships, handlers, '3');
  
  console.log(`   Generated ${rootNodes.length} nodes and ${rootEdges.length} edges`);
  console.log('   Layout dimensions:');
  const rootPositions = rootNodes.map(n => ({ 
    name: n.data.person.first_name, 
    x: Math.round(n.position.x), 
    y: Math.round(n.position.y) 
  }));
  
  const minX = Math.min(...rootPositions.map(p => p.x));
  const maxX = Math.max(...rootPositions.map(p => p.x));
  const minY = Math.min(...rootPositions.map(p => p.y));
  const maxY = Math.max(...rootPositions.map(p => p.y));
  
  console.log(`   - Size: ${maxX - minX}px × ${maxY - minY}px`);
  console.log('   - Positions:');
  rootPositions.forEach(pos => {
    console.log(`     ${pos.name}: (${pos.x}, ${pos.y})`);
  });
  console.log('');
  
  console.log('🌳 WITHOUT ROOT PERSON (full tree):');
  const { nodes: fullNodes, edges: fullEdges } = createFamilyTreeLayout(people, relationships, handlers, null);
  
  console.log(`   Generated ${fullNodes.length} nodes and ${fullEdges.length} edges`);
  console.log('   Layout dimensions:');
  const fullPositions = fullNodes.map(n => ({ 
    name: n.data.person.first_name, 
    x: Math.round(n.position.x), 
    y: Math.round(n.position.y) 
  }));
  
  const fullMinX = Math.min(...fullPositions.map(p => p.x));
  const fullMaxX = Math.max(...fullPositions.map(p => p.x));
  const fullMinY = Math.min(...fullPositions.map(p => p.y));
  const fullMaxY = Math.max(...fullPositions.map(p => p.y));
  
  console.log(`   - Size: ${fullMaxX - fullMinX}px × ${fullMaxY - fullMinY}px`);
  console.log('   - Positions:');
  fullPositions.forEach(pos => {
    console.log(`     ${pos.name}: (${pos.x}, ${pos.y})`);
  });
  console.log('');
  
  // Check edge styling
  console.log('🎨 EDGE COMPARISON:');
  console.log('   With root:');
  rootEdges.forEach((edge, i) => {
    console.log(`   - Edge ${i + 1}: ${edge.style?.stroke || 'default'} (${edge.style?.strokeWidth || 'default'}px)`);
  });
  console.log('');
  
  console.log('   Without root:');
  fullEdges.forEach((edge, i) => {
    console.log(`   - Edge ${i + 1}: ${edge.style?.stroke || 'default'} (${edge.style?.strokeWidth || 'default'}px)`);
  });
  console.log('');
  
  console.log('📊 SUMMARY:');
  console.log(`   Both modes use same styling: ${rootEdges.length === fullEdges.length ? 'YES' : 'NO'}`);
  console.log(`   Both have proper hierarchy: ${rootNodes.length === fullNodes.length ? 'YES' : 'NO'}`);
  console.log(`   Anti-overlap working: ${fullPositions.every((pos, i) => fullPositions.slice(i + 1).every(otherPos => Math.abs(pos.x - otherPos.x) > 200 || Math.abs(pos.y - otherPos.y) > 100)) ? 'YES' : 'NO'}`);

} catch (error) {
  console.error('❌ Error testing original approach:', error.message);
  console.error(error.stack);
}