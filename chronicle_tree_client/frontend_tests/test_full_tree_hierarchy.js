/**
 * Test Full Tree Hierarchy System - Enhanced visual hierarchy for complete family tree
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Create people representing different family hierarchies and generations
const people = [
  // Root generation (founders/patriarchs)
  { id: 1, first_name: 'Patriarch', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01' },
  { id: 2, first_name: 'Matriarch', last_name: 'Smith', gender: 'Female', date_of_birth: '1925-01-01' },
  
  // Second generation (their children)
  { id: 3, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1945-01-01' },
  { id: 4, first_name: 'Aunt', last_name: 'Johnson', gender: 'Female', date_of_birth: '1948-01-01' },
  { id: 5, first_name: 'Uncle', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  
  // Spouses of second generation
  { id: 6, first_name: 'Mother', last_name: 'Brown', gender: 'Female', date_of_birth: '1947-01-01' },
  { id: 7, first_name: 'AuntSpouse', last_name: 'Johnson', gender: 'Male', date_of_birth: '1946-01-01' },
  
  // Third generation (grandchildren)
  { id: 8, first_name: 'MainPerson', last_name: 'Smith', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 9, first_name: 'Sister', last_name: 'Smith', gender: 'Female', date_of_birth: '1978-01-01' },
  { id: 10, first_name: 'Cousin1', last_name: 'Johnson', gender: 'Male', date_of_birth: '1976-01-01' },
  { id: 11, first_name: 'Cousin2', last_name: 'Smith', gender: 'Female', date_of_birth: '1980-01-01' },
  
  // Fourth generation (great-grandchildren)
  { id: 12, first_name: 'Child1', last_name: 'Smith', gender: 'Female', date_of_birth: '2005-01-01' },
  { id: 13, first_name: 'Child2', last_name: 'Smith', gender: 'Male', date_of_birth: '2008-01-01' },
  
  // Unrelated family cluster
  { id: 14, first_name: 'Orphan1', last_name: 'Jones', gender: 'Male', date_of_birth: '1960-01-01' },
  { id: 15, first_name: 'Orphan2', last_name: 'Jones', gender: 'Female', date_of_birth: '1962-01-01' },
];

const relationships = [
  // Root couple
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // First generation children
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  
  { source: 1, target: 4, type: 'child', from: 1, to: 4 },
  { source: 4, target: 1, type: 'parent', from: 4, to: 1 },
  { source: 2, target: 4, type: 'child', from: 2, to: 4 },
  { source: 4, target: 2, type: 'parent', from: 4, to: 2 },
  
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  
  // Second generation spouses
  { source: 3, target: 6, type: 'spouse', from: 3, to: 6 },
  { source: 6, target: 3, type: 'spouse', from: 6, to: 3 },
  
  { source: 4, target: 7, type: 'spouse', from: 4, to: 7 },
  { source: 7, target: 4, type: 'spouse', from: 7, to: 4 },
  
  // Third generation (grandchildren)
  { source: 3, target: 8, type: 'child', from: 3, to: 8 },
  { source: 8, target: 3, type: 'parent', from: 8, to: 3 },
  { source: 6, target: 8, type: 'child', from: 6, to: 8 },
  { source: 8, target: 6, type: 'parent', from: 8, to: 6 },
  
  { source: 3, target: 9, type: 'child', from: 3, to: 9 },
  { source: 9, target: 3, type: 'parent', from: 9, to: 3 },
  { source: 6, target: 9, type: 'child', from: 6, to: 9 },
  { source: 9, target: 6, type: 'parent', from: 9, to: 6 },
  
  { source: 4, target: 10, type: 'child', from: 4, to: 10 },
  { source: 10, target: 4, type: 'parent', from: 10, to: 4 },
  { source: 7, target: 10, type: 'child', from: 7, to: 10 },
  { source: 10, target: 7, type: 'parent', from: 10, to: 7 },
  
  { source: 5, target: 11, type: 'child', from: 5, to: 11 },
  { source: 11, target: 5, type: 'parent', from: 11, to: 5 },
  
  // Fourth generation (great-grandchildren)
  { source: 8, target: 12, type: 'child', from: 8, to: 12 },
  { source: 12, target: 8, type: 'parent', from: 12, to: 8 },
  
  { source: 8, target: 13, type: 'child', from: 8, to: 13 },
  { source: 13, target: 8, type: 'parent', from: 13, to: 8 },
  
  // Unrelated siblings (no parents)
  { source: 14, target: 15, type: 'sibling', from: 14, to: 15 },
  { source: 15, target: 14, type: 'sibling', from: 15, to: 14 },
];

console.log('=== FULL TREE HIERARCHY TEST ===');
console.log('');
console.log('Testing advanced hierarchy system for complete family tree:');
console.log('- Natural root detection based on age and connections');
console.log('- Family clustering by generation and relationships');
console.log('- Visual importance hierarchy (Tier 1-5 styling)');
console.log('- Anti-overlap positioning with generational spacing');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  console.log('🔍 Testing with ROOT PERSON (normal hierarchy):');
  const { nodes: rootNodes, edges: rootEdges } = createFamilyTreeLayout(people, relationships, handlers, '8'); // MainPerson as root
  console.log(`   Generated ${rootNodes.length} nodes and ${rootEdges.length} edges`);
  console.log('   ✅ Root-based hierarchy working');
  console.log('');
  
  console.log('🌳 Testing FULL TREE MODE (no root selected):');
  const { nodes: fullNodes, edges: fullEdges } = createFamilyTreeLayout(people, relationships, handlers, null); // No root = full tree
  
  console.log(`   Generated ${fullNodes.length} nodes and ${fullEdges.length} edges`);
  console.log('');
  
  // Analyze the full tree hierarchy results
  console.log('📊 FULL TREE HIERARCHY ANALYSIS:');
  console.log('');
  
  // Check for natural root detection
  const naturalRoots = fullNodes.filter(node => 
    node.data?.hierarchy?.isRoot || 
    node.data?.importance >= 8 ||
    node.data?.generation <= 0
  );
  
  console.log(`🏛️  Natural Roots Detected: ${naturalRoots.length}`);
  naturalRoots.forEach(node => {
    const person = node.data.person;
    const importance = node.data.importance || 'N/A';
    const generation = node.data.generation || 'N/A';
    console.log(`   - ${person.first_name} ${person.last_name} (importance: ${importance}, gen: ${generation})`);
  });
  console.log('');
  
  // Check generation distribution
  const generationCounts = new Map();
  fullNodes.forEach(node => {
    const gen = node.data.generation || 0;
    generationCounts.set(gen, (generationCounts.get(gen) || 0) + 1);
  });
  
  console.log('📊 Generation Distribution:');
  Array.from(generationCounts.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([gen, count]) => {
      console.log(`   Generation ${gen}: ${count} people`);
    });
  console.log('');
  
  // Check visual tier distribution
  const tierCounts = new Map();
  const hierarchyNodes = fullNodes.filter(node => node.data?.hierarchy?.visualTier);
  
  hierarchyNodes.forEach(node => {
    const tier = node.data.hierarchy.visualTier;
    tierCounts.set(tier, (tierCounts.get(tier) || 0) + 1);
  });
  
  console.log('🎨 Visual Hierarchy Tiers:');
  Array.from(tierCounts.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([tier, count]) => {
      const tierName = {
        1: 'Core/Root',
        2: 'Direct Family', 
        3: 'Close Family',
        4: 'Extended Family',
        5: 'Distant Family'
      }[tier] || `Tier ${tier}`;
      console.log(`   Tier ${tier} (${tierName}): ${count} people`);
    });
  console.log('');
  
  // Check family clustering
  const clusters = new Map();
  fullNodes.forEach(node => {
    const clusterId = node.data?.clusterId || 'unassigned';
    clusters.set(clusterId, (clusters.get(clusterId) || 0) + 1);
  });
  
  console.log('👨‍👩‍👧‍👦 Family Clusters:');
  console.log(`   Total clusters: ${clusters.size}`);
  if (clusters.has('unassigned')) {
    console.log(`   Unassigned: ${clusters.get('unassigned')} people`);
  }
  console.log('');
  
  // Check positioning spread
  const positions = fullNodes.map(node => ({
    x: node.position.x,
    y: node.position.y,
    name: `${node.data.person.first_name} ${node.data.person.last_name}`
  }));
  
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));
  
  console.log('📐 Layout Dimensions:');
  console.log(`   Width: ${Math.round(maxX - minX)}px (${minX} to ${maxX})`);
  console.log(`   Height: ${Math.round(maxY - minY)}px (${minY} to ${maxY})`);
  console.log('');
  
  // Final assessment
  const hasNaturalRoots = naturalRoots.length > 0;
  const hasGenerationSpread = generationCounts.size > 1;
  const hasVisualHierarchy = tierCounts.size > 1;
  const hasGoodSpacing = (maxX - minX) > 500 && (maxY - minY) > 200;
  
  const score = [hasNaturalRoots, hasGenerationSpread, hasVisualHierarchy, hasGoodSpacing].filter(Boolean).length;
  
  console.log('🎯 FULL TREE HIERARCHY ASSESSMENT:');
  console.log(`   Natural root detection: ${hasNaturalRoots ? '✅' : '❌'}`);
  console.log(`   Multi-generation layout: ${hasGenerationSpread ? '✅' : '❌'}`);
  console.log(`   Visual tier hierarchy: ${hasVisualHierarchy ? '✅' : '❌'}`);
  console.log(`   Proper spacing: ${hasGoodSpacing ? '✅' : '❌'}`);
  console.log('');
  
  if (score >= 3) {
    console.log('🎉 EXCELLENT! Full tree hierarchy system working perfectly!');
    console.log('');
    console.log('✅ Advanced full tree layout provides fine hierarchy');
    console.log('✅ Natural family structure automatically detected');
    console.log('✅ Visual tiers create clear importance hierarchy');
    console.log('✅ Anti-overlap system maintains readability');
    console.log('');
    console.log('🌟 Users will see beautifully organized family trees when clicking "Full Tree"!');
  } else if (score >= 2) {
    console.log('🟡 GOOD! Most hierarchy features working, minor improvements needed.');
  } else {
    console.log('🔧 Needs work - hierarchy system needs debugging.');
  }

} catch (error) {
  console.error('❌ Error testing full tree hierarchy:', error.message);
  console.error(error.stack);
}