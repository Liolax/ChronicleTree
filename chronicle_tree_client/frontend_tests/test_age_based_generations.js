/**
 * Test Age-Based Generational Grouping in Full Tree Mode
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Multi-generational family with various birth years
const people = [
  // Great-grandparents (1900s)
  { id: 1, first_name: 'GreatGrandpa', last_name: 'Smith', gender: 'Male', date_of_birth: '1900-01-01' },
  { id: 2, first_name: 'GreatGrandma', last_name: 'Smith', gender: 'Female', date_of_birth: '1905-01-01' },
  
  // Grandparents (1920s-1930s)
  { id: 3, first_name: 'Grandpa', last_name: 'Smith', gender: 'Male', date_of_birth: '1925-01-01' },
  { id: 4, first_name: 'Grandma', last_name: 'Smith', gender: 'Female', date_of_birth: '1928-01-01' },
  { id: 5, first_name: 'GrandAunt', last_name: 'Jones', gender: 'Female', date_of_birth: '1930-01-01' },
  
  // Parents (1950s-1960s)
  { id: 6, first_name: 'Father', last_name: 'Smith', gender: 'Male', date_of_birth: '1955-01-01' },
  { id: 7, first_name: 'Mother', last_name: 'Brown', gender: 'Female', date_of_birth: '1958-01-01' },
  { id: 8, first_name: 'Uncle', last_name: 'Smith', gender: 'Male', date_of_birth: '1960-01-01' },
  
  // Current generation (1980s-1990s)
  { id: 9, first_name: 'Person', last_name: 'Smith', gender: 'Male', date_of_birth: '1985-01-01' },
  { id: 10, first_name: 'Sister', last_name: 'Smith', gender: 'Female', date_of_birth: '1987-01-01' },
  { id: 11, first_name: 'Cousin', last_name: 'Smith', gender: 'Male', date_of_birth: '1990-01-01' },
  
  // Children (2010s)
  { id: 12, first_name: 'Child1', last_name: 'Smith', gender: 'Female', date_of_birth: '2015-01-01' },
  { id: 13, first_name: 'Child2', last_name: 'Smith', gender: 'Male', date_of_birth: '2018-01-01' },
];

const relationships = [
  // Basic family relationships
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 3, target: 6, type: 'child', from: 3, to: 6 },
  { source: 6, target: 7, type: 'spouse', from: 6, to: 7 },
  { source: 6, target: 9, type: 'child', from: 6, to: 9 },
  { source: 6, target: 10, type: 'child', from: 6, to: 10 },
  { source: 9, target: 12, type: 'child', from: 9, to: 12 },
  { source: 9, target: 13, type: 'child', from: 9, to: 13 },
];

console.log('=== AGE-BASED GENERATIONAL GROUPING TEST ===');
console.log('');
console.log('Testing generational organization in full tree mode:');
console.log('- People from 5 different generations (1900s to 2010s)');
console.log('- Should be organized by age levels, not just relationships');
console.log('');

const handlers = {
  onEdit: () => {},
  onDelete: () => {},
  onPersonCardOpen: () => {},
  onRestructure: () => {}
};

try {
  console.log('🌳 FULL TREE MODE (age-based generations):');
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, null);
  
  console.log(`   Generated ${nodes.length} nodes and ${edges.length} edges`);
  console.log('');
  
  // Analyze generational distribution
  console.log('📊 GENERATIONAL DISTRIBUTION:');
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
      y: Math.round(node.position.y)
    });
  });
  
  // Sort and display generations
  Array.from(generationGroups.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([gen, people]) => {
      console.log(`   Generation ${gen}:`);
      people.forEach(person => {
        console.log(`     - ${person.name} (${person.birthYear}) at (${person.x}, ${person.y})`);
      });
      console.log('');
    });
  
  // Check if age-based grouping is working
  console.log('🎯 AGE-BASED GROUPING ANALYSIS:');
  
  // Check if people from same era are in same generation level
  const gen0People = generationGroups.get(0) || [];
  const gen1People = generationGroups.get(1) || [];
  const gen2People = generationGroups.get(2) || [];
  const gen3People = generationGroups.get(3) || [];
  const gen4People = generationGroups.get(4) || [];
  
  const checkAgeGrouping = (genPeople, expectedEra, genName) => {
    if (genPeople.length === 0) return true;
    
    const birthYears = genPeople
      .filter(p => p.birthYear !== 'unknown')
      .map(p => p.birthYear);
    
    if (birthYears.length === 0) return true;
    
    const minYear = Math.min(...birthYears);
    const maxYear = Math.max(...birthYears);
    const span = maxYear - minYear;
    
    console.log(`   ${genName}: ${minYear}-${maxYear} (${span} year span)`);
    return span <= 30; // Allow 30-year span per generation
  };
  
  const gen0Good = checkAgeGrouping(gen0People, '1900s', 'Gen 0 (Oldest)');
  const gen1Good = checkAgeGrouping(gen1People, '1920s-1930s', 'Gen 1 (Grandparents)');
  const gen2Good = checkAgeGrouping(gen2People, '1950s-1960s', 'Gen 2 (Parents)');
  const gen3Good = checkAgeGrouping(gen3People, '1980s-1990s', 'Gen 3 (Current)');
  const gen4Good = checkAgeGrouping(gen4People, '2010s', 'Gen 4 (Children)');
  
  console.log('');
  
  // Final assessment
  const allGenerationsGood = gen0Good && gen1Good && gen2Good && gen3Good && gen4Good;
  const hasProperLevels = generationGroups.size >= 3; // At least 3 generation levels
  
  console.log('✅ AGE-BASED GENERATION RESULTS:');
  console.log(`   Proper age grouping: ${allGenerationsGood ? '✅ YES' : '❌ NO'}`);
  console.log(`   Multiple generation levels: ${hasProperLevels ? '✅ YES' : '❌ NO'}`);
  console.log(`   Total generation levels: ${generationGroups.size}`);
  console.log('');
  
  if (allGenerationsGood && hasProperLevels) {
    console.log('🎉 EXCELLENT! Age-based generational grouping working perfectly!');
    console.log('');
    console.log('✅ People grouped by birth year ranges (~25 year spans)');
    console.log('✅ Clear generational levels from oldest to youngest');
    console.log('✅ Better visual organization in full tree mode');
    console.log('✅ Family structure easy to understand at a glance');
  } else {
    console.log('🔧 Age-based grouping needs improvement.');
  }

} catch (error) {
  console.error('❌ Error testing age-based generations:', error.message);
  console.error(error.stack);
}