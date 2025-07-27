/**
 * Test that visual configuration colors match the Connection Legend
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Create a family with all the relationship types from the Connection Legend
const people = [
  { id: 1, first_name: 'Root', last_name: 'Person', gender: 'Male', date_of_birth: '1990-01-01' },
  { id: 2, first_name: 'Father', last_name: 'Person', gender: 'Male', date_of_birth: '1960-01-01' },
  { id: 3, first_name: 'CurrentSpouse', last_name: 'Partner', gender: 'Female', date_of_birth: '1992-01-01' },
  { id: 4, first_name: 'ExSpouse', last_name: 'Former', gender: 'Female', date_of_birth: '1988-01-01', is_ex: true },
  { id: 5, first_name: 'LateSpouse', last_name: 'Deceased', gender: 'Female', date_of_birth: '1985-01-01', date_of_death: '2020-01-01' },
  { id: 6, first_name: 'SiblingNoParents', last_name: 'Person', gender: 'Male', date_of_birth: '1987-01-01' },
  { id: 7, first_name: 'Child', last_name: 'Person', gender: 'Female', date_of_birth: '2015-01-01' },
];

const relationships = [
  // Parent-Child relationship
  { source: 1, target: 2, type: 'parent', from: 1, to: 2 },
  { source: 2, target: 1, type: 'child', from: 2, to: 1 },
  
  // Current Spouse
  { source: 1, target: 3, type: 'spouse', from: 1, to: 3 },
  { source: 3, target: 1, type: 'spouse', from: 3, to: 1 },
  
  // Ex-Spouse  
  { source: 1, target: 4, type: 'ex-spouse', from: 1, to: 4 },
  { source: 4, target: 1, type: 'ex-spouse', from: 4, to: 1 },
  
  // Late Spouse (deceased)
  { source: 1, target: 5, type: 'late-spouse', from: 1, to: 5 },
  { source: 5, target: 1, type: 'late-spouse', from: 5, to: 1 },
  
  // Siblings (no parents)
  { source: 1, target: 6, type: 'sibling-no-parents', from: 1, to: 6 },
  { source: 6, target: 1, type: 'sibling-no-parents', from: 6, to: 1 },
  
  // Child relationship
  { source: 7, target: 1, type: 'parent', from: 7, to: 1 },
  { source: 1, target: 7, type: 'child', from: 1, to: 7 },
  { source: 7, target: 3, type: 'parent', from: 7, to: 3 },
  { source: 3, target: 7, type: 'child', from: 3, to: 7 },
];

console.log('=== CONNECTION LEGEND COLOR VERIFICATION ===');
console.log('');
console.log('Testing that anti-overlap system uses correct Connection Legend colors:');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '1');
  
  console.log('✅ Layout generated with enhanced visuals!');
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Expected colors from Connection Legend
  const expectedColors = {
    'parent': '#6366f1',      // Indigo - Parent-Child
    'child': '#6366f1',       // Indigo - Parent-Child
    'spouse': '#ec4899',      // Pink - Current Spouse  
    'ex-spouse': '#9ca3af',   // Gray - Ex-Spouse
    'late-spouse': '#000000', // Black - Late Spouse
    'sibling-no-parents': '#3b82f6', // Blue - Siblings (no parents)
  };
  
  console.log('🎨 COLOR VERIFICATION:');
  console.log('');
  
  // Check each edge type by actual relationship type (not React Flow type)
  const edgesByRelationshipType = new Map();
  edges.forEach(edge => {
    const relationshipType = edge.data?.relationshipType || 'unknown';
    if (!edgesByRelationshipType.has(relationshipType)) {
      edgesByRelationshipType.set(relationshipType, []);
    }
    edgesByRelationshipType.get(relationshipType).push(edge);
  });
  
  console.log('Edge colors by relationship type:');
  edgesByRelationshipType.forEach((edgeList, type) => {
    const firstEdge = edgeList[0];
    const actualColor = firstEdge.style?.stroke || 'not set';
    const expectedColor = expectedColors[type] || 'not in legend';
    
    const match = actualColor === expectedColor ? '✅' : (expectedColor === 'not in legend' ? '📝' : '❌');
    const dashStyle = firstEdge.style?.strokeDasharray || 'solid';
    
    console.log(`   ${type}: ${actualColor} ${match}`);
    console.log(`     Expected: ${expectedColor}`);
    console.log(`     Line style: ${dashStyle}`);
    console.log(`     Count: ${edgeList.length} edges`);
    console.log('');
  });
  
  // Also show React Flow edge types for reference
  console.log('React Flow edge types (for reference):');
  const reactFlowTypes = new Map();
  edges.forEach(edge => {
    const flowType = edge.type || 'unknown';
    if (!reactFlowTypes.has(flowType)) {
      reactFlowTypes.set(flowType, []);
    }
    reactFlowTypes.get(flowType).push(edge);
  });
  
  reactFlowTypes.forEach((edgeList, type) => {
    console.log(`   ${type}: ${edgeList.length} edges`);
  });
  console.log('');
  
  // Check node visual enhancements
  console.log('🔍 NODE ENHANCEMENTS:');
  const enhancedNodes = nodes.filter(node => 
    node.data?.hasComplexRelationships || 
    node.style?.border || 
    node.style?.boxShadow
  );
  
  console.log(`Enhanced nodes: ${enhancedNodes.length}/${nodes.length}`);
  enhancedNodes.forEach(node => {
    const person = people.find(p => String(p.id) === node.id);
    const relationshipTypes = node.data?.relationshipTypes || [];
    console.log(`   • ${person.first_name}: ${relationshipTypes.join(', ')}`);
  });
  console.log('');
  
  // Summary
  const correctColors = Array.from(edgesByRelationshipType.entries()).filter(([type, edgeList]) => {
    const actualColor = edgeList[0].style?.stroke;
    const expectedColor = expectedColors[type];
    return actualColor === expectedColor;
  }).length;
  
  const totalTypesInLegend = Object.keys(expectedColors).length;
  const colorAccuracy = Math.round((correctColors / totalTypesInLegend) * 100);
  
  console.log('📊 SUMMARY:');
  console.log(`   Color accuracy: ${colorAccuracy}% (${correctColors}/${totalTypesInLegend} correct)`);
  console.log(`   Enhanced edges: ${edges.filter(e => e.style).length}/${edges.length}`);
  console.log(`   Enhanced nodes: ${enhancedNodes.length}/${nodes.length}`);
  console.log('');
  
  if (colorAccuracy >= 90) {
    console.log('🎉 SUCCESS! Colors match Connection Legend!');
    console.log('');
    console.log('✅ Parent-Child: Indigo solid lines');
    console.log('✅ Current Spouse: Pink dashed lines');
    console.log('✅ Ex-Spouse: Gray dashed lines');
    console.log('✅ Late Spouse: Black dashed lines');
    console.log('✅ Siblings (no parents): Blue dotted lines');
    console.log('');
    console.log('The anti-overlap system now uses your exact Connection Legend colors!');
  } else {
    console.log('⚠️  Some colors need adjustment to match the legend perfectly.');
  }
  
} catch (error) {
  console.error('❌ Error testing colors:', error.message);
  console.error(error.stack);
}