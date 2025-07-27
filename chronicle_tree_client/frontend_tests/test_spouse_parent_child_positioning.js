/**
 * Test Spouse and Parent-Child Positioning in Age-Based Full Tree Mode
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Family with clear spouse pairs and parent-child relationships
const people = [
  // Grandparents (spouse pair)
  { id: 1, first_name: 'Grandpa', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01' },
  { id: 2, first_name: 'Grandma', last_name: 'Smith', gender: 'Female', date_of_birth: '1922-01-01' },
  
  // Parents (spouse pair)
  { id: 3, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'Mother', last_name: 'Brown', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Uncle and Aunt (spouse pair, same generation as parents)
  { id: 5, first_name: 'Uncle', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'Aunt', last_name: 'Smith', gender: 'Female', date_of_birth: '1951-01-01' },
  
  // Current generation (siblings)
  { id: 7, first_name: 'Person', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 8, first_name: 'Sister', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  
  // Children
  { id: 9, first_name: 'Child1', last_name: 'Smith', gender: 'Female', date_of_birth: '2010-01-01' },
  { id: 10, first_name: 'Child2', last_name: 'Smith', gender: 'Male', date_of_birth: '2012-01-01' },
];

const relationships = [
  // Spouse relationships
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // Parent-child relationships
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 2, target: 3, type: 'parent', from: 2, to: 3 },
  { source: 1, target: 5, type: 'parent', from: 1, to: 5 },
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 3, target: 7, type: 'parent', from: 3, to: 7 },
  { source: 4, target: 7, type: 'parent', from: 4, to: 7 },
  { source: 3, target: 8, type: 'parent', from: 3, to: 8 },
  { source: 4, target: 8, type: 'parent', from: 4, to: 8 },
  { source: 7, target: 9, type: 'parent', from: 7, to: 9 },
  { source: 7, target: 10, type: 'parent', from: 7, to: 10 },
];

console.log('=== SPOUSE & PARENT-CHILD POSITIONING TEST ===');
console.log('');
console.log('Testing spouse positioning and parent-child hierarchy:');
console.log('- Spouses should be at same generation level and close together');
console.log('- Parents should be positioned above their children');
console.log('- Age-based grouping should be preserved');
console.log('');

const handlers = {
  onEdit: () => {},
  onDelete: () => {},
  onPersonCardOpen: () => {},
  onRestructure: () => {}
};

try {
  console.log('🌳 FULL TREE MODE (with spouse & parent-child positioning):');
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, null);
  
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Analyze positioning
  console.log('📊 POSITIONING ANALYSIS:');
  
  // Group nodes by generation
  const generationGroups = new Map();
  nodes.forEach(node => {
    const person = node.data.person;
    const generation = Math.round(node.position.y / 450); // Approximate generation from Y position
    const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : 'unknown';
    
    if (!generationGroups.has(generation)) {
      generationGroups.set(generation, []);
    }
    generationGroups.get(generation).push({ 
      name: person.first_name, 
      birthYear,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
      id: person.id
    });
  });
  
  // Display each generation
  Array.from(generationGroups.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([gen, people]) => {
      console.log(`   Generation ${gen}:`);
      people.forEach(person => {
        console.log(`     - ${person.name} (${person.birthYear}) at (${person.x}, ${person.y})`);
      });
      console.log('');
    });
  
  // Test spouse positioning
  console.log('👫 SPOUSE POSITIONING TEST:');
  const spousePairs = [
    [1, 2], // Grandpa & Grandma
    [3, 4], // Father & Mother  
    [5, 6]  // Uncle & Aunt
  ];
  
  let spouseTestsPassed = 0;
  spousePairs.forEach(([spouse1Id, spouse2Id]) => {
    const spouse1Node = nodes.find(n => n.data.person.id === spouse1Id);
    const spouse2Node = nodes.find(n => n.data.person.id === spouse2Id);
    
    if (spouse1Node && spouse2Node) {
      const sameGeneration = spouse1Node.position.y === spouse2Node.position.y;
      const distance = Math.abs(spouse1Node.position.x - spouse2Node.position.x);
      const closeDistance = distance <= 400; // Within reasonable spouse distance
      
      const spouse1Name = spouse1Node.data.person.first_name;
      const spouse2Name = spouse2Node.data.person.first_name;
      
      console.log(`   ${spouse1Name} & ${spouse2Name}:`);
      console.log(`     Same generation: ${sameGeneration ? '✅' : '❌'}`);
      console.log(`     Close distance (${distance}px): ${closeDistance ? '✅' : '❌'}`);
      
      if (sameGeneration && closeDistance) {
        spouseTestsPassed++;
      }
    }
  });
  
  console.log('');
  
  // Test parent-child hierarchy
  console.log('👨‍👩‍👧‍👦 PARENT-CHILD HIERARCHY TEST:');
  const parentChildPairs = [
    [1, 3], // Grandpa -> Father
    [2, 3], // Grandma -> Father
    [3, 7], // Father -> Person
    [4, 7], // Mother -> Person
    [7, 9]  // Person -> Child1
  ];
  
  let hierarchyTestsPassed = 0;
  parentChildPairs.forEach(([parentId, childId]) => {
    const parentNode = nodes.find(n => n.data.person.id === parentId);
    const childNode = nodes.find(n => n.data.person.id === childId);
    
    if (parentNode && childNode) {
      const parentAboveChild = parentNode.position.y < childNode.position.y;
      
      const parentName = parentNode.data.person.first_name;
      const childName = childNode.data.person.first_name;
      
      console.log(`   ${parentName} -> ${childName}: ${parentAboveChild ? '✅' : '❌'}`);
      
      if (parentAboveChild) {
        hierarchyTestsPassed++;
      }
    }
  });
  
  console.log('');
  
  // Final assessment
  console.log('✅ TEST RESULTS:');
  console.log(`   Spouse positioning: ${spouseTestsPassed}/${spousePairs.length} passed`);
  console.log(`   Parent-child hierarchy: ${hierarchyTestsPassed}/${parentChildPairs.length} passed`);
  console.log(`   Total generation levels: ${generationGroups.size}`);
  console.log('');
  
  const allTestsPassed = spouseTestsPassed === spousePairs.length && 
                        hierarchyTestsPassed === parentChildPairs.length &&
                        generationGroups.size >= 3;
  
  if (allTestsPassed) {
    console.log('🎉 EXCELLENT! All positioning tests passed!');
    console.log('');
    console.log('✅ Spouses are at same level and positioned close together');
    console.log('✅ Parents are properly positioned above their children');
    console.log('✅ Age-based generational grouping is maintained');
    console.log('✅ Bidirectional relationships handled correctly');
  } else {
    console.log('🔧 Some positioning tests failed - needs adjustment.');
  }

} catch (error) {
  console.error('❌ Error testing spouse & parent-child positioning:', error.message);
  console.error(error.stack);
}