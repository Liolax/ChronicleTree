/**
 * Debug to understand if the issue is in generation calculation or node positioning
 * by logging the intermediate steps
 */

import { buildRelationshipMaps, findRootNodes } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debugging Generation Calculation vs Node Positioning ===');

// Same test case that's failing
const people = [
  { id: 1, first_name: 'Dad1', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Mom1', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'Kid1', last_name: 'Smith', gender: 'Male', date_of_birth: '2000-01-01' },
  { id: 4, first_name: 'Dad2', last_name: 'Johnson', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 5, first_name: 'Mom2', last_name: 'Williams', gender: 'Female', date_of_birth: '1973-01-01' },
  { id: 6, first_name: 'Kid2', last_name: 'Johnson-Williams', gender: 'Female', date_of_birth: '2002-01-01' }
];

const relationships = [
  // Dad1 & Mom1 are married and have Kid1
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 1, type: 'parent', from: 3, to: 1 },
  { source: 1, target: 3, type: 'child', from: 1, to: 3 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // Dad2 & Mom2 are NOT married but both are parents of Kid2
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 },
  { source: 6, target: 5, type: 'parent', from: 6, to: 5 },
  { source: 5, target: 6, type: 'child', from: 5, to: 6 }
];

console.log('Analyzing relationship maps and generations...');

// Step 1: Build relationship maps (same as the layout function does)
const relationshipMaps = buildRelationshipMaps(relationships, people);

console.log('');
console.log('Child to Parents map:');
relationshipMaps.childToParents.forEach((parents, childId) => {
  const child = people.find(p => String(p.id) === childId);
  const parentNames = Array.from(parents).map(pid => {
    const parent = people.find(p => String(p.id) === pid);
    return parent ? parent.first_name : pid;
  });
  console.log(`  ${child ? child.first_name : childId} -> parents: [${parentNames.join(', ')}]`);
});

console.log('');
console.log('Spouse map:');
relationshipMaps.spouseMap.forEach((spouseId, personId) => {
  const person = people.find(p => String(p.id) === personId);
  const spouse = people.find(p => String(p.id) === spouseId);
  console.log(`  ${person ? person.first_name : personId} -> spouse: ${spouse ? spouse.first_name : spouseId}`);
});

// Check what should happen with co-parent alignment
console.log('');
console.log('Expected co-parent alignments:');
relationshipMaps.childToParents.forEach((parents, childId) => {
  if (parents.size >= 2) {
    const child = people.find(p => String(p.id) === childId);
    const parentNames = Array.from(parents).map(pid => {
      const parent = people.find(p => String(p.id) === pid);
      return parent ? parent.first_name : pid;
    });
    console.log(`  ${child ? child.first_name : childId} has co-parents: [${parentNames.join(', ')}] - these should be same generation`);
  }
});

console.log('');
console.log('The issue is likely that Mom2 (ID: 5) should be aligned with Dad2 (ID: 4)');
console.log('because they are both parents of Kid2 (ID: 6)');
console.log('');
console.log('But in the complex scenario, something is overriding this alignment');
console.log('and positioning Mom2 at y=220 instead of y=0 where Dad2 is positioned.');