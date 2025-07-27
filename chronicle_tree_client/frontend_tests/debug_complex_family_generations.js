/**
 * Debug the generation assignment in complex family
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

// Original complex scenario
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

console.log('=== COMPLEX FAMILY GENERATION DEBUG ===');
console.log('');

const handlers = {
  onPersonClick: () => {},
  onPersonDoubleClick: () => {},
  onDeletePerson: () => {}
};

try {
  const { nodes, edges } = createFamilyTreeLayout(people, relationships, handlers, '1');
  
  console.log('Generation analysis:');
  
  // Group by generation
  const generations = new Map();
  nodes.forEach(node => {
    const roundedY = Math.round(node.position.y / 450) * 450;
    if (!generations.has(roundedY)) {
      generations.set(roundedY, []);
    }
    generations.get(roundedY).push(node);
  });
  
  Array.from(generations.keys()).sort((a, b) => a - b).forEach(y => {
    const genIndex = Math.round(y / 450);
    const genNodes = generations.get(y);
    console.log(`\\nGeneration ${genIndex} (Y: ${y}):`);
    
    genNodes.sort((a, b) => a.position.x - b.position.x).forEach(node => {
      const person = people.find(p => String(p.id) === node.id);
      console.log(`  ${person.first_name}: X=${Math.round(node.position.x)}`);
    });
  });
  
  // Focus on the problematic trio
  const stepGF = nodes.find(n => n.id === '4');
  const grandfather = nodes.find(n => n.id === '5');  
  const greatUncle = nodes.find(n => n.id === '7');
  
  console.log('\\n🎯 PROBLEMATIC TRIO ANALYSIS:');
  
  if (stepGF && grandfather && greatUncle) {
    console.log(`StepGrandfather: Gen ${Math.round(stepGF.position.y / 450)}, X=${Math.round(stepGF.position.x)}`);
    console.log(`Grandfather:     Gen ${Math.round(grandfather.position.y / 450)}, X=${Math.round(grandfather.position.x)}`);
    console.log(`GreatUncle:      Gen ${Math.round(greatUncle.position.y / 450)}, X=${Math.round(greatUncle.position.x)}`);
    
    // Check if they're in the same generation
    const stepGFGen = Math.round(stepGF.position.y / 450);
    const grandfatherGen = Math.round(grandfather.position.y / 450);
    const greatUncleGen = Math.round(greatUncle.position.y / 450);
    
    console.log('\\nGeneration alignment:');
    console.log(`Same generation? ${stepGFGen === grandfatherGen && grandfatherGen === greatUncleGen ? 'YES' : 'NO'}`);
    
    if (stepGFGen === grandfatherGen && grandfatherGen === greatUncleGen) {
      // They're in same generation, check spacing
      const d1 = Math.abs(stepGF.position.x - grandfather.position.x);
      const d2 = Math.abs(grandfather.position.x - greatUncle.position.x);
      const d3 = Math.abs(stepGF.position.x - greatUncle.position.x);
      
      console.log('\\nSpacing analysis:');
      console.log(`StepGF ↔ Grandfather: ${Math.round(d1)}px`);
      console.log(`Grandfather ↔ GreatUncle: ${Math.round(d2)}px`);
      console.log(`StepGF ↔ GreatUncle: ${Math.round(d3)}px`);
      
      const minRequired = 360; // 280 + 80
      console.log(`\\nMinimum required: ${minRequired}px`);
      console.log(`Issues: ${[d1, d2, d3].filter(d => d < minRequired).length} spacing violations`);
    }
  }
  
} catch (error) {
  console.error('Error:', error.message);
}