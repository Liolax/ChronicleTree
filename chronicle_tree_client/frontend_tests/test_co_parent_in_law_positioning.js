/**
 * Test co-parent-in-law positioning - they should be at the same generation level
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing Co-Parent-in-Law Positioning ===');

// Test scenario: Two married couples with children who marry each other
// David (son of Michael & Sarah) marries Alice (daughter of John & Jane)
// Michael & Sarah should be at same generation as John & Jane (co-parents-in-law)

const people = [
  // Parents of David
  { id: 1, first_name: 'Michael', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Sarah', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Parents of Alice  
  { id: 3, first_name: 'John', last_name: 'Johnson', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 4, first_name: 'Jane', last_name: 'Johnson', gender: 'Female', date_of_birth: '1950-01-01' },
  
  // The married children
  { id: 5, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 6, first_name: 'Alice', last_name: 'Johnson', gender: 'Female', date_of_birth: '1982-01-01' }
];

const relationships = [
  // Michael & Sarah are spouses
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // John & Jane are spouses
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // David & Alice are spouses
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // Michael & Sarah are parents of David
  { source: 5, target: 1, type: 'parent', from: 5, to: 1 },
  { source: 1, target: 5, type: 'child', from: 1, to: 5 },
  { source: 5, target: 2, type: 'parent', from: 5, to: 2 },
  { source: 2, target: 5, type: 'child', from: 2, to: 5 },
  
  // John & Jane are parents of Alice
  { source: 6, target: 3, type: 'parent', from: 6, to: 3 },
  { source: 3, target: 6, type: 'child', from: 3, to: 6 },
  { source: 6, target: 4, type: 'parent', from: 6, to: 4 },
  { source: 4, target: 6, type: 'child', from: 4, to: 6 }
];

console.log('Input data:');
console.log('People:', people.map(p => `${p.first_name} (${p.id})`));
console.log('');

// First, test that the relationship calculator recognizes co-parent-in-law relationships
console.log('--- Testing Relationship Recognition ---');

// Convert to Rails format for relationship calculator
const railsRelationships = relationships.map(r => ({
  person_id: r.source,
  relative_id: r.target, 
  relationship_type: r.type
}));

// Test Michael -> John relationship (should be co-parent-in-law)
const michael_to_john = calculateRelationshipToRoot(people.find(p => p.id === 1), people.find(p => p.id === 3), people, railsRelationships);
console.log(`Michael -> John: ${michael_to_john}`);

// Test Sarah -> Jane relationship (should be co-parent-in-law)
const sarah_to_jane = calculateRelationshipToRoot(people.find(p => p.id === 2), people.find(p => p.id === 4), people, railsRelationships);
console.log(`Sarah -> Jane: ${sarah_to_jane}`);

// Test John -> Michael relationship (should be co-parent-in-law)
const john_to_michael = calculateRelationshipToRoot(people.find(p => p.id === 3), people.find(p => p.id === 1), people, railsRelationships);
console.log(`John -> Michael: ${john_to_michael}`);

console.log('');

// Now test the family tree layout positioning
console.log('--- Testing Family Tree Layout ---');

const { nodes, edges } = createFamilyTreeLayout(people, relationships);

console.log('Generated nodes:');
nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name} (ID: ${node.id}): x=${node.position.x}, y=${node.position.y}`);
});

console.log('');

// Analyze positioning
const michael = nodes.find(n => n.data.person.first_name === 'Michael');
const sarah = nodes.find(n => n.data.person.first_name === 'Sarah');
const john = nodes.find(n => n.data.person.first_name === 'John');
const jane = nodes.find(n => n.data.person.first_name === 'Jane');
const david = nodes.find(n => n.data.person.first_name === 'David');
const alice = nodes.find(n => n.data.person.first_name === 'Alice');

console.log('--- Generation Analysis ---');

if (michael && sarah && john && jane) {
  // All co-parents-in-law should be at the same generation level
  const michaelGen = michael.position.y;
  const sarahGen = sarah.position.y;
  const johnGen = john.position.y;
  const janeGen = jane.position.y;
  
  console.log(`Michael generation: y=${michaelGen}`);
  console.log(`Sarah generation: y=${sarahGen}`);
  console.log(`John generation: y=${johnGen}`);
  console.log(`Jane generation: y=${janeGen}`);
  
  if (michaelGen === sarahGen && sarahGen === johnGen && johnGen === janeGen) {
    console.log('✅ SUCCESS: All co-parents-in-law are at the same generation level');
  } else {
    console.log('❌ FAILURE: Co-parents-in-law are not at the same generation level');
    console.log('   Expected: All should have the same y-coordinate');
  }
}

if (david && alice) {
  const davidGen = david.position.y;
  const aliceGen = alice.position.y;
  
  console.log(`David generation: y=${davidGen}`);
  console.log(`Alice generation: y=${aliceGen}`);
  
  if (davidGen === aliceGen) {
    console.log('✅ SUCCESS: Married children are at the same generation level');
  } else {
    console.log('❌ FAILURE: Married children are not at the same generation level');
  }
}

console.log('');
console.log('--- Spouse Positioning Analysis ---');

// Check spouse positioning within each couple
if (michael && sarah) {
  const distance1 = Math.abs(michael.position.x - sarah.position.x);
  console.log(`Michael & Sarah distance: x=${distance1}`);
  if (distance1 <= 400) {
    console.log('✅ SUCCESS: Michael & Sarah positioned close together');
  } else {
    console.log('❌ FAILURE: Michael & Sarah too far apart');
  }
}

if (john && jane) {
  const distance2 = Math.abs(john.position.x - jane.position.x);
  console.log(`John & Jane distance: x=${distance2}`);
  if (distance2 <= 400) {
    console.log('✅ SUCCESS: John & Jane positioned close together');
  } else {
    console.log('❌ FAILURE: John & Jane too far apart');
  }
}

if (david && alice) {
  const distance3 = Math.abs(david.position.x - alice.position.x);
  console.log(`David & Alice distance: x=${distance3}`);
  if (distance3 <= 400) {
    console.log('✅ SUCCESS: David & Alice positioned close together');
  } else {
    console.log('❌ FAILURE: David & Alice too far apart');
  }
}

console.log('');
console.log('=== Expected Behavior ===');
console.log('✅ Co-parents-in-law (Michael, Sarah, John, Jane) should all be at the same generation level');
console.log('✅ Each spouse pair should be positioned close together (≤ 400px apart)');
console.log('✅ The married children (David & Alice) should be at the same lower generation level');