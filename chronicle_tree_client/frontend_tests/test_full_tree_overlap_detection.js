/**
 * Test Full Tree Overlap Detection - Verify no nodes are overlapping
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Create a larger family with potential for overlaps
const people = [
  // Multiple generations with many connections
  { id: 1, first_name: 'GrandPa1', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01' },
  { id: 2, first_name: 'GrandMa1', last_name: 'Smith', gender: 'Female', date_of_birth: '1925-01-01' },
  { id: 3, first_name: 'GrandPa2', last_name: 'Jones', gender: 'Male', date_of_birth: '1918-01-01' },
  { id: 4, first_name: 'GrandMa2', last_name: 'Jones', gender: 'Female', date_of_birth: '1922-01-01' },
  
  // Parents generation - many siblings
  { id: 5, first_name: 'Dad', last_name: 'Smith', gender: 'Male', date_of_birth: '1945-01-01' },
  { id: 6, first_name: 'Mom', last_name: 'Smith', gender: 'Female', date_of_birth: '1947-01-01' },
  { id: 7, first_name: 'Uncle1', last_name: 'Smith', gender: 'Male', date_of_birth: '1943-01-01' },
  { id: 8, first_name: 'Aunt1', last_name: 'Smith', gender: 'Female', date_of_birth: '1949-01-01' },
  { id: 9, first_name: 'Uncle2', last_name: 'Smith', gender: 'Male', date_of_birth: '1951-01-01' },
  { id: 10, first_name: 'Aunt2', last_name: 'Smith', gender: 'Female', date_of_birth: '1953-01-01' },
  
  // Current generation - many cousins and siblings
  { id: 11, first_name: 'Person1', last_name: 'Smith', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 12, first_name: 'Person2', last_name: 'Smith', gender: 'Female', date_of_birth: '1977-01-01' },
  { id: 13, first_name: 'Person3', last_name: 'Smith', gender: 'Male', date_of_birth: '1979-01-01' },
  { id: 14, first_name: 'Cousin1', last_name: 'Smith', gender: 'Female', date_of_birth: '1976-01-01' },
  { id: 15, first_name: 'Cousin2', last_name: 'Smith', gender: 'Male', date_of_birth: '1978-01-01' },
  { id: 16, first_name: 'Cousin3', last_name: 'Smith', gender: 'Female', date_of_birth: '1980-01-01' },
  { id: 17, first_name: 'Cousin4', last_name: 'Smith', gender: 'Male', date_of_birth: '1981-01-01' },
  { id: 18, first_name: 'Cousin5', last_name: 'Smith', gender: 'Female', date_of_birth: '1983-01-01' },
  
  // Next generation
  { id: 19, first_name: 'Child1', last_name: 'Smith', gender: 'Male', date_of_birth: '2005-01-01' },
  { id: 20, first_name: 'Child2', last_name: 'Smith', gender: 'Female', date_of_birth: '2007-01-01' },
];

const relationships = [
  // Grandparent couples
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Parent generation
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  
  { source: 1, target: 7, type: 'child', from: 1, to: 7 },
  { source: 7, target: 1, type: 'parent', from: 7, to: 1 },
  { source: 2, target: 7, type: 'child', from: 2, to: 7 },
  { source: 7, target: 2, type: 'parent', from: 7, to: 2 },
  
  { source: 1, target: 9, type: 'child', from: 1, to: 9 },
  { source: 9, target: 1, type: 'parent', from: 9, to: 1 },
  { source: 2, target: 9, type: 'child', from: 2, to: 9 },
  { source: 9, target: 2, type: 'parent', from: 9, to: 2 },
  
  // Parent couples
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 },
  { source: 9, target: 10, type: 'spouse', from: 9, to: 10 },
  { source: 10, target: 9, type: 'spouse', from: 10, to: 9 },
  
  // Current generation
  { source: 5, target: 11, type: 'child', from: 5, to: 11 },
  { source: 11, target: 5, type: 'parent', from: 11, to: 5 },
  { source: 6, target: 11, type: 'child', from: 6, to: 11 },
  { source: 11, target: 6, type: 'parent', from: 11, to: 6 },
  
  { source: 5, target: 12, type: 'child', from: 5, to: 12 },
  { source: 12, target: 5, type: 'parent', from: 12, to: 5 },
  { source: 6, target: 12, type: 'child', from: 6, to: 12 },
  { source: 12, target: 6, type: 'parent', from: 12, to: 6 },
  
  { source: 5, target: 13, type: 'child', from: 5, to: 13 },
  { source: 13, target: 5, type: 'parent', from: 13, to: 5 },
  { source: 6, target: 13, type: 'child', from: 6, to: 13 },
  { source: 13, target: 6, type: 'parent', from: 13, to: 6 },
  
  // Cousins
  { source: 7, target: 14, type: 'child', from: 7, to: 14 },
  { source: 14, target: 7, type: 'parent', from: 14, to: 7 },
  { source: 8, target: 14, type: 'child', from: 8, to: 14 },
  { source: 14, target: 8, type: 'parent', from: 14, to: 8 },
  
  { source: 7, target: 15, type: 'child', from: 7, to: 15 },
  { source: 15, target: 7, type: 'parent', from: 15, to: 7 },
  { source: 8, target: 15, type: 'child', from: 8, to: 15 },
  { source: 15, target: 8, type: 'parent', from: 15, to: 8 },
  
  { source: 9, target: 16, type: 'child', from: 9, to: 16 },
  { source: 16, target: 9, type: 'parent', from: 16, to: 9 },
  { source: 10, target: 16, type: 'child', from: 10, to: 16 },
  { source: 16, target: 10, type: 'parent', from: 16, to: 10 },
  
  { source: 9, target: 17, type: 'child', from: 9, to: 17 },
  { source: 17, target: 9, type: 'parent', from: 17, to: 9 },
  { source: 10, target: 17, type: 'child', from: 10, to: 17 },
  { source: 17, target: 10, type: 'parent', from: 17, to: 10 },
  
  { source: 9, target: 18, type: 'child', from: 9, to: 18 },
  { source: 18, target: 9, type: 'parent', from: 18, to: 9 },
  { source: 10, target: 18, type: 'child', from: 10, to: 18 },
  { source: 18, target: 10, type: 'parent', from: 18, to: 10 },
  
  // Next generation
  { source: 11, target: 19, type: 'child', from: 11, to: 19 },
  { source: 19, target: 11, type: 'parent', from: 19, to: 11 },
  
  { source: 12, target: 20, type: 'child', from: 12, to: 20 },
  { source: 20, target: 12, type: 'parent', from: 20, to: 12 },
];

console.log('=== FULL TREE OVERLAP DETECTION TEST ===');
console.log('');
console.log('Testing anti-overlap system with large family tree:');
console.log(`- ${people.length} people across 4 generations`);
console.log('- Many siblings, cousins, and potential overlap points');
console.log('- Verifying no nodes overlap in full tree mode');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  console.log('🌳 Testing FULL TREE MODE overlap detection:');
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, null); // Full tree mode
  
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Analyze for overlaps
  console.log('🔍 OVERLAP DETECTION ANALYSIS:');
  console.log('');
  
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 150; // Approximate node height
  const overlaps = [];
  
  // Check every pair of nodes for overlap
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      
      // Calculate distance between node centers
      const dx = Math.abs(nodeA.position.x - nodeB.position.x);
      const dy = Math.abs(nodeA.position.y - nodeB.position.y);
      
      // Check if nodes overlap (with small tolerance)
      const minHorizontalDistance = NODE_WIDTH + 10; // 10px buffer
      const minVerticalDistance = NODE_HEIGHT + 10; // 10px buffer
      
      if (dx < minHorizontalDistance && dy < minVerticalDistance) {
        overlaps.push({
          nodeA: `${nodeA.data.person.first_name} ${nodeA.data.person.last_name}`,
          nodeB: `${nodeB.data.person.first_name} ${nodeB.data.person.last_name}`,
          distance: Math.round(Math.sqrt(dx * dx + dy * dy)),
          dx: Math.round(dx),
          dy: Math.round(dy),
          positionA: `(${Math.round(nodeA.position.x)}, ${Math.round(nodeA.position.y)})`,
          positionB: `(${Math.round(nodeB.position.x)}, ${Math.round(nodeB.position.y)})`
        });
      }
    }
  }
  
  // Report overlap results
  if (overlaps.length === 0) {
    console.log('✅ NO OVERLAPS DETECTED!');
    console.log('   All nodes properly spaced and readable');
    console.log('');
  } else {
    console.log(`❌ OVERLAPS DETECTED: ${overlaps.length} overlapping pairs`);
    console.log('');
    overlaps.forEach((overlap, index) => {
      console.log(`   ${index + 1}. ${overlap.nodeA} ↔ ${overlap.nodeB}`);
      console.log(`      Distance: ${overlap.distance}px (dx: ${overlap.dx}px, dy: ${overlap.dy}px)`);
      console.log(`      Positions: ${overlap.positionA} vs ${overlap.positionB}`);
      console.log('');
    });
  }
  
  // Layout statistics
  const positions = nodes.map(node => ({
    x: node.position.x,
    y: node.position.y,
    name: `${node.data.person.first_name} ${node.data.person.last_name}`
  }));
  
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  console.log('📐 LAYOUT STATISTICS:');
  console.log(`   Tree dimensions: ${Math.round(maxX - minX)}px × ${Math.round(maxY - minY)}px`);
  console.log(`   Horizontal spread: ${minX} to ${maxX}`);
  console.log(`   Vertical spread: ${minY} to ${maxY}`);
  console.log(`   Average horizontal spacing: ${Math.round((maxX - minX) / Math.max(1, nodes.length - 1))}px`);
  console.log('');
  
  // Final assessment
  const noOverlaps = overlaps.length === 0;
  const reasonableSize = (maxX - minX) < 3000 && (maxY - minY) < 4000;
  const goodSpacing = (maxX - minX) > 500 && (maxY - minY) > 200;
  
  console.log('🎯 ANTI-OVERLAP ASSESSMENT:');
  console.log(`   No overlapping nodes: ${noOverlaps ? '✅' : '❌'}`);
  console.log(`   Reasonable tree size: ${reasonableSize ? '✅' : '❌'}`);
  console.log(`   Good node spacing: ${goodSpacing ? '✅' : '❌'}`);
  console.log('');
  
  if (noOverlaps && reasonableSize && goodSpacing) {
    console.log('🎉 PERFECT! Anti-overlap system working flawlessly!');
    console.log('');
    console.log('✅ All nodes properly positioned without overlaps');
    console.log('✅ Family tree remains readable and well-spaced');
    console.log('✅ Large families display beautifully in full tree mode');
    console.log('');
    console.log('🌟 Users will see clean, non-overlapping family trees!');
  } else {
    console.log('🔧 Issues detected - anti-overlap system needs improvement.');
  }

} catch (error) {
  console.error('❌ Error testing overlap detection:', error.message);
  console.error(error.stack);
}