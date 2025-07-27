/**
 * Debug the spouse map building to understand why Tom & Lisa aren't being grouped
 */

import { buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Debugging Spouse Map Building ===');

const people = [
  { id: 1, first_name: 'Tom', last_name: 'Brown', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Lisa', last_name: 'Brown', gender: 'Female', date_of_birth: '1972-01-01' },
  { id: 3, first_name: 'Mike', last_name: 'Davis', gender: 'Male', date_of_birth: '1975-01-01' },
  { id: 4, first_name: 'Sara', last_name: 'Davis', gender: 'Female', date_of_birth: '1977-01-01' }
];

const relationships = [
  { person_id: 1, relative_id: 2, relationship_type: 'spouse' },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse' },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse' },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse' }
];

console.log('Input relationships (Rails format):');
relationships.forEach(r => {
  console.log(`  ${r.person_id} -${r.relationship_type}-> ${r.relative_id}`);
});

// Build the relationship maps using the same function the layout uses
const relationshipMaps = buildRelationshipMaps(relationships, people);

console.log('');
console.log('Generated spouse map:');
if (relationshipMaps.spouseMap && relationshipMaps.spouseMap.size > 0) {
  relationshipMaps.spouseMap.forEach((spouse, person) => {
    const personName = people.find(p => String(p.id) === person)?.first_name || person;
    const spouseName = people.find(p => String(p.id) === spouse)?.first_name || spouse;
    console.log(`  ${personName} (${person}) -> ${spouseName} (${spouse})`);
  });
} else {
  console.log('  No spouse relationships found in spouse map');
}

// Test the spouse map functionality specifically
console.log('');
console.log('Spouse map checks:');
console.log(`Tom (1) has spouse: ${relationshipMaps.spouseMap.has('1')} -> ${relationshipMaps.spouseMap.get('1')}`);
console.log(`Lisa (2) has spouse: ${relationshipMaps.spouseMap.has('2')} -> ${relationshipMaps.spouseMap.get('2')}`);
console.log(`Mike (3) has spouse: ${relationshipMaps.spouseMap.has('3')} -> ${relationshipMaps.spouseMap.get('3')}`);
console.log(`Sara (4) has spouse: ${relationshipMaps.spouseMap.has('4')} -> ${relationshipMaps.spouseMap.get('4')}`);

// Now test the family tree layout format
console.log('');
console.log('=== Testing Family Tree Layout Format ===');

// Convert to family tree layout format (source/target instead of person_id/relative_id)
const layoutRelationships = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 }
];

console.log('Layout format relationships:');
layoutRelationships.forEach(r => {
  console.log(`  ${r.source} -${r.type}-> ${r.target}`);
});

// Check if the family tree layout uses a different relationship map building
// (It might be using the buildRelationshipMaps from familyTreeHierarchicalLayout.js)
import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('');
console.log('Testing direct layout function:');
try {
  const { nodes } = createFamilyTreeLayout(people, layoutRelationships);
  
  console.log('Layout positioning results:');
  nodes.forEach(node => {
    console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
  });
  
} catch (error) {
  console.log('Error in layout function:', error.message);
}