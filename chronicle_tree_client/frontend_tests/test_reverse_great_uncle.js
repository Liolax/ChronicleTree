/**
 * Test reverse great-uncle relationship - when PatriciaDaughterChild is root
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

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

console.log('=== REVERSE GREAT-UNCLE TEST ===');
console.log('Family structure:');
console.log('David <-> Patricia (siblings, no parents)');
console.log('Patricia <-> PatriciaDaughter (parent-child)');
console.log('PatriciaDaughter <-> PatriciaDaughterChild (parent-child)');
console.log('');

console.log('Testing with PatriciaDaughterChild as ROOT:');

// Test step by step - PatriciaDaughterChild as root
const patriciaChildObj = people.find(p => p.id === 4); // PatriciaDaughterChild as root
const davidObj = people.find(p => p.id === 1);
const patriciaObj = people.find(p => p.id === 2);
const patriciaDaughterObj = people.find(p => p.id === 3);

const childToDavid = calculateRelationshipToRoot(davidObj, patriciaChildObj, people, relationships);
console.log(`1. PatriciaDaughterChild -> David: "${childToDavid}" (should be "Great-Uncle")`);

const childToPatricia = calculateRelationshipToRoot(patriciaObj, patriciaChildObj, people, relationships);
console.log(`2. PatriciaDaughterChild -> Patricia: "${childToPatricia}" (should be "Great-Aunt")`);

const childToPatriciaDaughter = calculateRelationshipToRoot(patriciaDaughterObj, patriciaChildObj, people, relationships);
console.log(`3. PatriciaDaughterChild -> PatriciaDaughter: "${childToPatriciaDaughter}" (should be "Mother")`);

console.log('');
console.log('Expected results:');
console.log('- PatriciaDaughterChild -> David: "Great-Uncle" ❓');
console.log('- PatriciaDaughterChild -> Patricia: "Great-Aunt" ❓');
console.log('- PatriciaDaughterChild -> PatriciaDaughter: "Mother" ✓');