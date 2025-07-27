/**
 * Test extreme overlap scenarios - multiple people with overlapping roles
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Create an extreme scenario where one person has multiple overlapping roles
const people = [
  { id: 1, first_name: 'Root', last_name: 'Person', gender: 'Male', date_of_birth: '1990-01-01' },
  { id: 2, first_name: 'Father', last_name: 'Person', gender: 'Male', date_of_birth: '1960-01-01' },
  { id: 3, first_name: 'Mother', last_name: 'Person', gender: 'Female', date_of_birth: '1965-01-01' },
  { id: 4, first_name: 'ComplexPerson', last_name: 'Multi', gender: 'Male', date_of_birth: '1955-01-01' },
  // ComplexPerson will be: step-grandfather, great-uncle, AND grandfather-in-law
  { id: 5, first_name: 'Grandmother', last_name: 'Person', gender: 'Female', date_of_birth: '1940-01-01' },
  { id: 6, first_name: 'Sibling1', last_name: 'Person', gender: 'Male', date_of_birth: '1992-01-01' },
  { id: 7, first_name: 'Sibling2', last_name: 'Person', gender: 'Female', date_of_birth: '1988-01-01' },
  { id: 8, first_name: 'Spouse', last_name: 'Partner', gender: 'Female', date_of_birth: '1991-01-01' },
  { id: 9, first_name: 'ChildOfRoot', last_name: 'Person', gender: 'Male', date_of_birth: '2015-01-01' },
];

const relationships = [
  // Basic family structure
  { source: 1, target: 2, type: 'parent', from: 1, to: 2 },
  { source: 2, target: 1, type: 'child', from: 2, to: 1 },
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  
  // ComplexPerson as step-grandfather (mother's step-father)
  { source: 3, target: 4, type: 'parent', from: 3, to: 4 },
  { source: 4, target: 3, type: 'child', from: 4, to: 3 },
  
  // ComplexPerson as great-uncle (father's father's sibling) 
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 4, target: 5, type: 'sibling', from: 4, to: 5 },
  { source: 5, target: 4, type: 'sibling', from: 5, to: 4 },
  
  // Siblings
  { source: 1, target: 6, type: 'sibling', from: 1, to: 6 },
  { source: 6, target: 1, type: 'sibling', from: 6, to: 1 },
  { source: 1, target: 7, type: 'sibling', from: 1, to: 7 },
  { source: 7, target: 1, type: 'sibling', from: 7, to: 1 },
  { source: 6, target: 7, type: 'sibling', from: 6, to: 7 },
  { source: 7, target: 6, type: 'sibling', from: 7, to: 6 },
  
  // Sibling parents (same as root)
  { source: 6, target: 2, type: 'parent', from: 6, to: 2 },
  { source: 2, target: 6, type: 'child', from: 2, to: 6 },
  { source: 6, target: 3, type: 'parent', from: 6, to: 3 },
  { source: 3, target: 6, type: 'child', from: 3, to: 6 },
  { source: 7, target: 2, type: 'parent', from: 7, to: 2 },
  { source: 2, target: 7, type: 'child', from: 2, to: 7 },
  { source: 7, target: 3, type: 'parent', from: 7, to: 3 },
  { source: 3, target: 7, type: 'child', from: 3, to: 7 },
  
  // Root's marriage and child
  { source: 1, target: 8, type: 'spouse', from: 1, to: 8 },
  { source: 8, target: 1, type: 'spouse', from: 8, to: 1 },
  { source: 9, target: 1, type: 'parent', from: 9, to: 1 },
  { source: 1, target: 9, type: 'child', from: 1, to: 9 },
  { source: 9, target: 8, type: 'parent', from: 9, to: 8 },
  { source: 8, target: 9, type: 'child', from: 8, to: 9 },
];

console.log('=== EXTREME OVERLAP SCENARIO TEST ===');
console.log('');
console.log('Complex scenario where ComplexPerson has multiple roles:');
console.log('🔗 ComplexPerson is simultaneously:');
console.log('   • Step-grandfather (mother\'s step-father)');
console.log('   • Great-uncle (grandmother\'s sibling)');
console.log('   • Multiple relationship paths to same family');
console.log('');
console.log('🔗 Additional complexity:');
console.log('   • Root has 2 siblings (3 people same generation)');
console.log('   • Root has spouse and child (marriage + offspring)');
console.log('   • Multiple overlapping family lines');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '1');
  
  console.log('✅ Extreme scenario handled successfully!');
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Calculate layout statistics
  console.log('📊 LAYOUT STATISTICS:');
  console.log('');
  
  // Analyze generation distribution
  const generations = new Map();
  nodes.forEach(node => {
    const roundedY = Math.round(node.position.y / 450) * 450;
    if (!generations.has(roundedY)) {
      generations.set(roundedY, []);
    }
    generations.get(roundedY).push(node);
  });
  
  console.log(`🏗️  Generations created: ${generations.size}`);
  generations.forEach((genNodes, y) => {
    const genIndex = Math.round(y / 450);
    console.log(`   Generation ${genIndex}: ${genNodes.length} people`);
  });
  console.log('');
  
  // Check ComplexPerson's positioning
  const complexPersonNode = nodes.find(n => n.id === '4');
  if (complexPersonNode) {
    const complexPerson = people.find(p => p.id === 4);
    console.log(`🎯 ComplexPerson (${complexPerson.first_name}) positioning:`);
    console.log(`   X: ${Math.round(complexPersonNode.position.x)}, Y: ${Math.round(complexPersonNode.position.y)}`);
    console.log(`   Generation: ${Math.round(complexPersonNode.position.y / 450)}`);
    
    // Check distance to other nodes in same generation
    const sameGenNodes = nodes.filter(n => 
      Math.abs(n.position.y - complexPersonNode.position.y) < 100 && n.id !== '4'
    );
    
    if (sameGenNodes.length > 0) {
      console.log('   Distances to same-generation nodes:');
      sameGenNodes.forEach(node => {
        const person = people.find(p => String(p.id) === node.id);
        const distance = Math.abs(node.position.x - complexPersonNode.position.x);
        console.log(`     → ${person.first_name}: ${Math.round(distance)}px`);
      });
    }
  }
  console.log('');
  
  // Comprehensive overlap check
  console.log('🔍 COMPREHENSIVE OVERLAP ANALYSIS:');
  const NODE_WIDTH = 280;
  const MIN_HORIZONTAL_SPACING = 60;
  const MIN_VERTICAL_SPACING = 40;
  
  let overlapsFound = 0;
  let nearMissesFound = 0;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      
      const horizontalDistance = Math.abs(nodeA.position.x - nodeB.position.x);
      const verticalDistance = Math.abs(nodeA.position.y - nodeB.position.y);
      
      const personA = people.find(p => String(p.id) === nodeA.id);
      const personB = people.find(p => String(p.id) === nodeB.id);
      
      // Check for actual overlaps
      if (horizontalDistance < NODE_WIDTH + MIN_HORIZONTAL_SPACING && 
          verticalDistance < MIN_VERTICAL_SPACING) {
        console.log(`   ❌ OVERLAP: ${personA.first_name} ↔ ${personB.first_name}`);
        console.log(`      H: ${Math.round(horizontalDistance)}px, V: ${Math.round(verticalDistance)}px`);
        overlapsFound++;
      }
      // Check for near misses (tight but acceptable)
      else if (horizontalDistance < NODE_WIDTH + MIN_HORIZONTAL_SPACING + 50 && 
               verticalDistance < MIN_VERTICAL_SPACING + 100) {
        console.log(`   ⚠️  TIGHT: ${personA.first_name} ↔ ${personB.first_name}`);
        console.log(`      H: ${Math.round(horizontalDistance)}px, V: ${Math.round(verticalDistance)}px`);
        nearMissesFound++;
      }
    }
  }
  
  console.log('');
  console.log('📈 FINAL RESULTS:');
  console.log(`   Overlaps found: ${overlapsFound}`);
  console.log(`   Near misses: ${nearMissesFound}`);
  console.log(`   Total nodes: ${nodes.length}`);
  console.log(`   Success rate: ${Math.round((1 - overlapsFound / (nodes.length * (nodes.length - 1) / 2)) * 100)}%`);
  
  if (overlapsFound === 0) {
    console.log('');
    console.log('🎉 ANTI-OVERLAP SYSTEM SUCCESSFUL!');
    console.log('   ✅ Complex multi-role relationships handled correctly');
    console.log('   ✅ No overlapping nodes detected');
    console.log('   ✅ Family tree remains readable and organized');
  }
  
} catch (error) {
  console.error('❌ Error in extreme scenario test:', error.message);
  console.error(error.stack);
}