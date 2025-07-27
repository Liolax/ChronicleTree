/**
 * Debug the relationship maps to understand why uncle/niece relationships aren't working
 */

import { buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Debugging Relationship Maps ===');

const people = [
  { id: 1, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1955-01-01' },
  { id: 3, first_name: 'PatriciaDaughter', last_name: 'Johnson', gender: 'Female', date_of_birth: '1990-01-01' }
];

const relationships = [
  // David and Patricia are siblings (bidirectional)
  { source: 1, target: 2, type: 'sibling', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 },
  
  // Patricia is mother of PatriciaDaughter (bidirectional)
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 }
];

console.log('Input data:');
console.log('People:', people.map(p => `${p.first_name} (ID: ${p.id})`));
console.log('Relationships:');
relationships.forEach(rel => {
  const sourceName = people.find(p => p.id === rel.source)?.first_name || rel.source;
  const targetName = people.find(p => p.id === rel.target)?.first_name || rel.target;
  console.log(`  ${sourceName} -> ${targetName}: ${rel.type}`);
});
console.log('');

// Build the relationship maps that the calculator uses
const maps = buildRelationshipMaps(relationships, people);

console.log('Built relationship maps:');
console.log('');

console.log('Parent to Children:');
maps.parentToChildren.forEach((children, parentId) => {
  const parentName = people.find(p => String(p.id) === parentId)?.first_name || parentId;
  const childNames = Array.from(children).map(childId => 
    people.find(p => String(p.id) === childId)?.first_name || childId
  );
  console.log(`  ${parentName} -> children: [${childNames.join(', ')}]`);
});

console.log('');
console.log('Child to Parents:');
maps.childToParents.forEach((parents, childId) => {
  const childName = people.find(p => String(p.id) === childId)?.first_name || childId;
  const parentNames = Array.from(parents).map(parentId => 
    people.find(p => String(p.id) === parentId)?.first_name || parentId
  );
  console.log(`  ${childName} -> parents: [${parentNames.join(', ')}]`);
});

console.log('');
console.log('Sibling Map:');
maps.siblingMap.forEach((siblings, personId) => {
  const personName = people.find(p => String(p.id) === personId)?.first_name || personId;
  const siblingNames = Array.from(siblings).map(siblingId => 
    people.find(p => String(p.id) === siblingId)?.first_name || siblingId
  );
  console.log(`  ${personName} -> siblings: [${siblingNames.join(', ')}]`);
});

console.log('');
console.log('=== Analysis ===');
console.log('For David to be PatriciaDaughter\'s uncle, the relationship calculator needs:');
console.log('1. Patricia to be in siblingMap for David (✓)');
console.log('2. PatriciaDaughter to be in parentToChildren for Patricia (✓)');
console.log('3. The uncle/niece logic to connect these (❌ - this is where the issue is)');
console.log('');
console.log('The relationship maps look correct, so the issue is likely in the');
console.log('uncle/niece relationship calculation logic itself.');