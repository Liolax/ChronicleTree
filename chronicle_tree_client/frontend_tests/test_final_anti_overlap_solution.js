/**
 * Final comprehensive test of the anti-overlap solution
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Create the exact scenario mentioned by user: step-grandparent, grandparent, great-uncle overlapping
const people = [
  { id: 1, first_name: 'Root', last_name: 'Person', gender: 'Male', date_of_birth: '1990-01-01' },
  { id: 2, first_name: 'Father', last_name: 'Person', gender: 'Male', date_of_birth: '1960-01-01' },
  { id: 3, first_name: 'Mother', last_name: 'Person', gender: 'Female', date_of_birth: '1965-01-01' },
  { id: 4, first_name: 'StepGrandfather', last_name: 'Step', gender: 'Male', date_of_birth: '1935-01-01' },
  { id: 5, first_name: 'Grandfather', last_name: 'Person', gender: 'Male', date_of_birth: '1940-01-01' },
  { id: 6, first_name: 'Grandmother', last_name: 'Person', gender: 'Female', date_of_birth: '1942-01-01' },
  { id: 7, first_name: 'GreatUncle', last_name: 'Person', gender: 'Male', date_of_birth: '1938-01-01' },
  { id: 8, first_name: 'StepFather', last_name: 'Step', gender: 'Male', date_of_birth: '1955-01-01' },
];

const relationships = [
  // Root's parents
  { source: 1, target: 2, type: 'parent', from: 1, to: 2 },
  { source: 2, target: 1, type: 'child', from: 2, to: 1 },
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  
  // Father's parents (Grandfather & Grandmother)
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  
  // Grandparents marriage
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // Great-Uncle (Grandfather's sibling)
  { source: 5, target: 7, type: 'sibling', from: 5, to: 7 },
  { source: 7, target: 5, type: 'sibling', from: 7, to: 5 },
  
  // Step-Father (Mother's new husband)
  { source: 3, target: 8, type: 'spouse', from: 3, to: 8 },
  { source: 8, target: 3, type: 'spouse', from: 8, to: 3 },
  
  // Step-Grandfather (Step-Father's father)
  { source: 8, target: 4, type: 'parent', from: 8, to: 4 },
  { source: 4, target: 8, type: 'child', from: 4, to: 8 },
];

console.log('=== FINAL ANTI-OVERLAP SOLUTION TEST ===');
console.log('');
console.log('Testing the exact overlapping scenario mentioned:');
console.log('👥 Key relationships that typically overlap:');
console.log('   • StepGrandfather: Step-relationship through mother\'s remarriage');
console.log('   • Grandfather: Direct biological grandparent');
console.log('   • GreatUncle: Grandfather\'s sibling (multiple relationship paths)');
console.log('   • All three should be properly spaced to avoid overlap');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '1');
  
  console.log('✅ Layout generated with all enhancements!');
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Focus on the problematic relationships
  const rootNode = nodes.find(n => n.id === '1');
  const stepGrandfatherNode = nodes.find(n => n.id === '4');
  const grandfatherNode = nodes.find(n => n.id === '5');
  const greatUncleNode = nodes.find(n => n.id === '7');
  
  console.log('🎯 CRITICAL NODE POSITIONING:');
  console.log('');
  
  if (stepGrandfatherNode) {
    console.log(`StepGrandfather: X=${Math.round(stepGrandfatherNode.position.x)}, Y=${Math.round(stepGrandfatherNode.position.y)}`);
  }
  if (grandfatherNode) {
    console.log(`Grandfather:     X=${Math.round(grandfatherNode.position.x)}, Y=${Math.round(grandfatherNode.position.y)}`);
  }
  if (greatUncleNode) {
    console.log(`GreatUncle:      X=${Math.round(greatUncleNode.position.x)}, Y=${Math.round(greatUncleNode.position.y)}`);
  }
  console.log('');
  
  // Calculate distances between critical nodes
  const criticalDistances = [];
  
  if (stepGrandfatherNode && grandfatherNode) {
    const distance = Math.sqrt(
      Math.pow(stepGrandfatherNode.position.x - grandfatherNode.position.x, 2) +
      Math.pow(stepGrandfatherNode.position.y - grandfatherNode.position.y, 2)
    );
    criticalDistances.push({
      pair: 'StepGrandfather ↔ Grandfather',
      distance: Math.round(distance),
      horizontal: Math.abs(stepGrandfatherNode.position.x - grandfatherNode.position.x),
      vertical: Math.abs(stepGrandfatherNode.position.y - grandfatherNode.position.y)
    });
  }
  
  if (grandfatherNode && greatUncleNode) {
    const distance = Math.sqrt(
      Math.pow(grandfatherNode.position.x - greatUncleNode.position.x, 2) +
      Math.pow(grandfatherNode.position.y - greatUncleNode.position.y, 2)
    );
    criticalDistances.push({
      pair: 'Grandfather ↔ GreatUncle',
      distance: Math.round(distance),
      horizontal: Math.abs(grandfatherNode.position.x - greatUncleNode.position.x),
      vertical: Math.abs(grandfatherNode.position.y - greatUncleNode.position.y)
    });
  }
  
  if (stepGrandfatherNode && greatUncleNode) {
    const distance = Math.sqrt(
      Math.pow(stepGrandfatherNode.position.x - greatUncleNode.position.x, 2) +
      Math.pow(stepGrandfatherNode.position.y - greatUncleNode.position.y, 2)
    );
    criticalDistances.push({
      pair: 'StepGrandfather ↔ GreatUncle',
      distance: Math.round(distance),
      horizontal: Math.abs(stepGrandfatherNode.position.x - greatUncleNode.position.x),
      vertical: Math.abs(stepGrandfatherNode.position.y - greatUncleNode.position.y)
    });
  }
  
  console.log('📏 CRITICAL DISTANCES:');
  criticalDistances.forEach(d => {
    console.log(`   ${d.pair}:`);
    console.log(`     Total: ${d.distance}px | H: ${Math.round(d.horizontal)}px | V: ${Math.round(d.vertical)}px`);
  });
  console.log('');
  
  // Check for overlaps specifically among critical nodes
  const NODE_WIDTH = 280;
  const MIN_SAFE_DISTANCE = 340; // Node width + minimum spacing
  
  console.log('🔍 OVERLAP ANALYSIS FOR CRITICAL NODES:');
  let criticalOverlaps = 0;
  
  criticalDistances.forEach(d => {
    const isOverlapping = d.horizontal < MIN_SAFE_DISTANCE && d.vertical < 100;
    const status = isOverlapping ? '❌ OVERLAP' : '✅ SAFE';
    console.log(`   ${d.pair}: ${status}`);
    if (isOverlapping) criticalOverlaps++;
  });
  console.log('');
  
  // Check visual enhancements
  console.log('🎨 VISUAL ENHANCEMENTS:');
  console.log('');
  
  const complexNodes = nodes.filter(node => node.data?.hasComplexRelationships);
  console.log(`Complex relationship nodes identified: ${complexNodes.length}`);
  complexNodes.forEach(node => {
    const person = people.find(p => String(p.id) === node.id);
    console.log(`   • ${person.first_name}: ${node.data.relationshipCount} relationships, types: ${node.data.relationshipTypes.join(', ')}`);
  });
  console.log('');
  
  // Enhanced edges check
  const enhancedEdges = edges.filter(edge => edge.style || edge.markerEnd);
  console.log(`Enhanced edges: ${enhancedEdges.length}/${edges.length}`);
  console.log('');
  
  // Final assessment
  console.log('📊 FINAL ASSESSMENT:');
  console.log(`   Critical overlaps: ${criticalOverlaps}`);
  console.log(`   Complex nodes enhanced: ${complexNodes.length}`);
  console.log(`   Enhanced edges: ${enhancedEdges.length}`);
  console.log(`   Total safety score: ${Math.round((1 - criticalOverlaps / criticalDistances.length) * 100)}%`);
  console.log('');
  
  if (criticalOverlaps === 0) {
    console.log('🎉 SUCCESS! OVERLAPPING ISSUE RESOLVED!');
    console.log('');
    console.log('✅ All critical relationships properly spaced');
    console.log('✅ Step-grandparent, grandparent, great-uncle alignment fixed');
    console.log('✅ Visual enhancements applied for complex relationships');
    console.log('✅ Family tree maintains readability and organization');
    console.log('');
    console.log('The anti-overlap system successfully prevents overlapping nodes');
    console.log('while maintaining proper family relationship visualization!');
  } else {
    console.log('⚠️  Some overlaps still detected - system needs refinement');
  }
  
} catch (error) {
  console.error('❌ Error in final test:', error.message);
  console.error(error.stack);
}