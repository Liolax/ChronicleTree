/**
 * Debug why the great-nephew/niece logic still isn't working
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Debug Great-Nephew/Niece Logic ===');

// Simple test case:
// David (uncle) -> Patricia (sister) -> PatriciaDaughter -> PatriciaDaughterChild (great-niece)

const people = [
  { id: 1, first_name: 'David', last_name: 'Smith', gender: 'Male' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' },
  { id: 3, first_name: 'PatriciaDaughter', last_name: 'Johnson', gender: 'Female' },
  { id: 4, first_name: 'PatriciaDaughterChild', last_name: 'Johnson', gender: 'Female' }
];

const relationships = [
  // David and Patricia are siblings (no parents)
  { source: 1, target: 2, type: 'sibling', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 },
  
  // Patricia -> PatriciaDaughter
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // PatriciaDaughter -> PatriciaDaughterChild
  { source: 4, target: 3, type: 'parent', from: 4, to: 3 },
  { source: 3, target: 4, type: 'child', from: 3, to: 4 }
];

console.log('Family structure:');
console.log('David <-> Patricia (siblings, no parents)');
console.log('Patricia <-> PatriciaDaughter (parent-child)');
console.log('PatriciaDaughter <-> PatriciaDaughterChild (parent-child)');
console.log('');

console.log('Expected relationships from David\'s perspective:');
console.log('- David -> Patricia: Sister ✓');
console.log('- David -> PatriciaDaughter: Niece ✓'); 
console.log('- David -> PatriciaDaughterChild: Great-Niece ❌');
console.log('');

// Test step by step
const davidObj = people.find(p => p.id === 1);
const patriciaObj = people.find(p => p.id === 2);
const patriciaDaughterObj = people.find(p => p.id === 3);
const patriciaGranddaughterObj = people.find(p => p.id === 4);

console.log('Testing relationships:');

const davidToPatricia = calculateRelationshipToRoot(patriciaObj, davidObj, people, relationships);
console.log(`1. David -> Patricia: "${davidToPatricia}" (should be "Sister")`);

const davidToPatriciaDaughter = calculateRelationshipToRoot(patriciaDaughterObj, davidObj, people, relationships);
console.log(`2. David -> PatriciaDaughter: "${davidToPatriciaDaughter}" (should be "Niece")`);

const davidToPatriciaGranddaughter = calculateRelationshipToRoot(patriciaGranddaughterObj, davidObj, people, relationships);
console.log(`3. David -> PatriciaDaughterChild: "${davidToPatriciaGranddaughter}" (should be "Great-Niece")`);

console.log('');
console.log('=== Logic Analysis ===');
console.log('For great-niece relationship to work:');
console.log('1. David must be in rootSiblings (for David as root)');
console.log('2. Patricia must be found as David\'s sibling');
console.log('3. The algorithm must traverse 2 levels down from Patricia:');
console.log('   - Level 1: PatriciaDaughter (Patricia\'s child)');
console.log('   - Level 2: PatriciaDaughterChild (Patricia\'s grandchild)');
console.log('4. The condition for biological siblings must pass');
console.log('');
console.log('The issue might be:');
console.log('- The great-nephew/niece loop doesn\'t find Patricia as David\'s sibling');
console.log('- The descendant traversal doesn\'t work correctly');
console.log('- The biological sibling validation still fails');

console.log('');
console.log('Since uncle/niece works but great-uncle/great-niece doesn\'t,');
console.log('the issue is specifically in the multi-level descendant logic.');