/**
 * Debug to check if the siblingMap is being built correctly
 */

import { buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

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

console.log('=== Debug Sibling Map ===');

const maps = buildRelationshipMaps(relationships, people);

console.log('Sibling Map contents:');
maps.siblingMap.forEach((siblings, personId) => {
  const personName = people.find(p => String(p.id) === personId)?.first_name || personId;
  const siblingNames = Array.from(siblings).map(siblingId => 
    people.find(p => String(p.id) === siblingId)?.first_name || siblingId
  );
  console.log(`  ${personName} (ID: ${personId}) -> siblings: [${siblingNames.join(', ')}]`);
});

console.log('');

// Simulate what the great-nephew/niece logic does
const rootId = String(1); // David as root
const rootSiblings = maps.siblingMap.get(rootId) || new Set();

console.log(`For David (rootId=${rootId}):`);
console.log(`  rootSiblings: [${Array.from(rootSiblings).map(id => people.find(p => String(p.id) === id)?.first_name || id).join(', ')}]`);

console.log('');
console.log('Testing great-nephew/niece logic simulation:');

for (const sibling of rootSiblings) {
  const siblingName = people.find(p => String(p.id) === sibling)?.first_name || sibling;
  console.log(`  Processing sibling: ${siblingName} (ID: ${sibling})`);
  
  // Check descendants at level 2 (great-nephew/niece)
  console.log(`    Level 1 descendants (children of ${siblingName}):`);
  const level1Children = Array.from(maps.parentToChildren.get(sibling) || []);
  level1Children.forEach(childId => {
    const childName = people.find(p => String(p.id) === childId)?.first_name || childId;
    console.log(`      ${childName} (ID: ${childId})`);
  });
  
  console.log(`    Level 2 descendants (grandchildren of ${siblingName}):`);
  level1Children.forEach(childId => {
    const level2Children = Array.from(maps.parentToChildren.get(childId) || []);
    level2Children.forEach(grandchildId => {
      const grandchildName = people.find(p => String(p.id) === grandchildId)?.first_name || grandchildId;
      console.log(`      ${grandchildName} (ID: ${grandchildId})`);
      
      // Check if this matches our target person (PatriciaDaughterChild)
      if (grandchildId === '4') {
        console.log(`        *** MATCH: This should be David's great-niece! ***`);
      }
    });
  });
}

console.log('');
console.log('If the logic finds the match above, the issue is not in the traversal');
console.log('but in the parent validation or the relationship return logic.');