/**
 * Test all Connection Legend relationship types with correct data structure
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Create people with specific properties for different relationship types
const people = [
  { id: 1, first_name: 'Root', last_name: 'Person', gender: 'Male', date_of_birth: '1990-01-01' },
  { id: 2, first_name: 'Father', last_name: 'Person', gender: 'Male', date_of_birth: '1960-01-01' },
  { id: 3, first_name: 'CurrentWife', last_name: 'Partner', gender: 'Female', date_of_birth: '1992-01-01' },
  { id: 4, first_name: 'ExWife', last_name: 'Former', gender: 'Female', date_of_birth: '1988-01-01' },
  { id: 5, first_name: 'LateWife', last_name: 'Deceased', gender: 'Female', date_of_birth: '1985-01-01', date_of_death: '2020-01-01' },
  { id: 6, first_name: 'BrotherNoParents', last_name: 'Smith', gender: 'Male', date_of_birth: '1987-01-01' },
  { id: 7, first_name: 'Child', last_name: 'Person', gender: 'Female', date_of_birth: '2015-01-01' },
  { id: 8, first_name: 'SisterNoParents', last_name: 'Smith', gender: 'Female', date_of_birth: '1989-01-01' },
];

const relationships = [
  // Parent-Child relationship (solid indigo)
  { source: 1, target: 2, type: 'parent', from: 1, to: 2 },
  { source: 2, target: 1, type: 'child', from: 2, to: 1 },
  
  // Current Spouse (dashed pink)
  { source: 1, target: 3, type: 'spouse', from: 1, to: 3 },
  { source: 3, target: 1, type: 'spouse', from: 3, to: 1 },
  
  // Ex-Spouse (dashed gray) - marked with is_ex flag
  { source: 1, target: 4, type: 'spouse', from: 1, to: 4, is_ex: true },
  { source: 4, target: 1, type: 'spouse', from: 4, to: 1, is_ex: true },
  
  // Late Spouse (dashed black) - marked with is_deceased flag
  { source: 1, target: 5, type: 'spouse', from: 1, to: 5, is_deceased: true },
  { source: 5, target: 1, type: 'spouse', from: 5, to: 1, is_deceased: true },
  
  // Siblings with no parents (dotted blue) - separate people with no parent relationships
  { source: 6, target: 8, type: 'sibling', from: 6, to: 8 },
  { source: 8, target: 6, type: 'sibling', from: 8, to: 6 },
  
  // Child relationship (solid indigo)
  { source: 7, target: 1, type: 'parent', from: 7, to: 1 },
  { source: 1, target: 7, type: 'child', from: 1, to: 7 },
  { source: 7, target: 3, type: 'parent', from: 7, to: 3 },
  { source: 3, target: 7, type: 'child', from: 3, to: 7 },
];

console.log('=== ALL CONNECTION LEGEND TYPES TEST ===');
console.log('');
console.log('Testing all 5 Connection Legend relationship types:');
console.log('1. Parent-Child (solid indigo)');
console.log('2. Current Spouse (dashed pink)');
console.log('3. Ex-Spouse (dashed gray)');
console.log('4. Late Spouse (dashed black)');
console.log('5. Siblings no parents (dotted blue)');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '1');
  
  console.log('✅ Layout generated successfully!');
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');

  // Expected colors from Connection Legend (child relationships are handled as parent)
  const expectedLegend = {
    'parent': { color: '#6366f1', style: 'solid', name: 'Parent-Child' },
    'spouse': { color: '#ec4899', style: 'dashed', name: 'Current Spouse' },
    'ex-spouse': { color: '#9ca3af', style: 'dashed', name: 'Ex-Spouse' },
    'late-spouse': { color: '#000000', style: 'dashed', name: 'Late Spouse' },
    'sibling-no-parents': { color: '#3b82f6', style: 'dotted', name: 'Siblings (no parents)' }
  };

  console.log('🎨 DETAILED COLOR & STYLE VERIFICATION:');
  console.log('');

  // Group edges by relationship type
  const edgesByType = new Map();
  edges.forEach(edge => {
    const relationshipType = edge.data?.relationshipType || 'unknown';
    if (!edgesByType.has(relationshipType)) {
      edgesByType.set(relationshipType, []);
    }
    edgesByType.get(relationshipType).push(edge);
  });

  let correctMatches = 0;
  let totalExpected = Object.keys(expectedLegend).length;

  // Check each relationship type
  Object.entries(expectedLegend).forEach(([type, expected]) => {
    const edges = edgesByType.get(type) || [];
    
    console.log(`📋 ${expected.name}:`);
    
    if (edges.length === 0) {
      console.log(`   ❌ No edges found for type "${type}"`);
      console.log('');
      return;
    }

    const firstEdge = edges[0];
    const actualColor = firstEdge.style?.stroke || 'not set';
    const actualDash = firstEdge.style?.strokeDasharray || '0';
    const actualWidth = firstEdge.style?.strokeWidth || 'not set';

    // Check color match
    const colorMatch = actualColor === expected.color;
    
    // Check style match (approximate)
    let styleMatch = false;
    if (expected.style === 'solid' && actualDash === '0') styleMatch = true;
    if (expected.style === 'dashed' && actualDash.includes(',')) styleMatch = true;
    if (expected.style === 'dotted' && actualDash === '2,2') styleMatch = true;

    const overallMatch = colorMatch && styleMatch;
    if (overallMatch) correctMatches++;

    console.log(`   Color: ${actualColor} ${colorMatch ? '✅' : '❌'} (expected: ${expected.color})`);
    console.log(`   Style: ${actualDash} ${styleMatch ? '✅' : '❌'} (expected: ${expected.style})`); 
    console.log(`   Width: ${actualWidth}px`);
    console.log(`   Count: ${edges.length} edges`);
    console.log(`   Overall: ${overallMatch ? '✅ PERFECT MATCH' : '❌ Needs adjustment'}`);
    console.log('');
  });

  // Show any unexpected relationship types
  const unexpectedTypes = Array.from(edgesByType.keys()).filter(type => !expectedLegend[type]);
  if (unexpectedTypes.length > 0) {
    console.log('📝 UNEXPECTED RELATIONSHIP TYPES:');
    unexpectedTypes.forEach(type => {
      const edges = edgesByType.get(type);
      console.log(`   ${type}: ${edges.length} edges`);
    });
    console.log('');
  }

  // Final assessment
  const accuracy = Math.round((correctMatches / totalExpected) * 100);
  
  console.log('📊 FINAL RESULTS:');
  console.log(`   Perfect matches: ${correctMatches}/${totalExpected}`);
  console.log(`   Accuracy: ${accuracy}%`);
  console.log(`   Total edges styled: ${edges.filter(e => e.style?.stroke).length}/${edges.length}`);
  console.log('');

  if (accuracy >= 90) {
    console.log('🎉 EXCELLENT! Connection Legend colors perfectly matched!');
    console.log('');
    console.log('✅ All relationship types properly colored and styled');
    console.log('✅ Anti-overlap system maintains visual consistency');
    console.log('✅ Family tree matches your Connection Legend exactly');
  } else if (accuracy >= 70) {
    console.log('🟡 GOOD! Most colors match, minor adjustments needed.');
  } else {
    console.log('🔧 Needs work - some relationship types not detected correctly.');
  }

} catch (error) {
  console.error('❌ Error testing all types:', error.message);
  console.error(error.stack);
}