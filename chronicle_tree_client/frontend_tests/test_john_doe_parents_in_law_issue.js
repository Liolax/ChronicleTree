/**
 * Test the specific issue: When John Doe is root, his parents-in-law are not
 * at the same line as his parents because they are not married to each other
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing John Doe Parents-in-Law Issue ===');

// Scenario: John Doe marries Jane Smith
// John's parents: Father Doe & Mother Doe
// Jane's parents: Father Smith & Mother Smith
// These 4 parents should be at the same generation level when John is root

const people = [
  // John Doe and his wife Jane
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  
  // John's parents (not married in this test to isolate the issue)
  { id: 3, first_name: 'FatherDoe', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'MotherDoe', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Jane's parents (John's parents-in-law, also not married to isolate the issue)
  { id: 5, first_name: 'FatherSmith', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'MotherSmith', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' }
];

const relationships = [
  // John and Jane are married
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  
  // John's parent relationships
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  { source: 1, target: 4, type: 'parent', from: 1, to: 4 },
  { source: 4, target: 1, type: 'child', from: 4, to: 1 },
  
  // Jane's parent relationships
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 }
  
  // NOTE: Intentionally NOT including marriages between parents to isolate the issue
  // { source: 3, target: 4, type: 'spouse', from: 3, to: 4 }, // John's parents married
  // { source: 5, target: 6, type: 'spouse', from: 5, to: 6 }, // Jane's parents married
];

console.log('Family structure:');
console.log('John Doe (root) married to Jane Smith');
console.log('John\'s parents: FatherDoe & MotherDoe (not married in this test)');
console.log('Jane\'s parents: FatherSmith & MotherSmith (not married in this test)');
console.log('');
console.log('Expected: All 4 parents should be at the same generation level');
console.log('');

console.log('--- Testing with John Doe as Root ---');

const result = createFamilyTreeLayout(people, relationships, 1); // John as root

console.log('Node positions:');
result.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const john = result.nodes.find(n => n.data.person.first_name === 'John');
const jane = result.nodes.find(n => n.data.person.first_name === 'Jane');
const fatherDoe = result.nodes.find(n => n.data.person.first_name === 'FatherDoe');
const motherDoe = result.nodes.find(n => n.data.person.first_name === 'MotherDoe');
const fatherSmith = result.nodes.find(n => n.data.person.first_name === 'FatherSmith');
const motherSmith = result.nodes.find(n => n.data.person.first_name === 'MotherSmith');

console.log('');
console.log('Generation analysis:');

if (john && jane) {
  console.log(`John (root): y=${john.position.y}`);
  console.log(`Jane (spouse): y=${jane.position.y}`);
  
  if (john.position.y === jane.position.y) {
    console.log('✅ John and Jane are at same level (correct)');
  } else {
    console.log('❌ John and Jane are at different levels (spouse positioning issue)');
  }
}

console.log('');
console.log('Parent generations:');

if (fatherDoe && motherDoe && fatherSmith && motherSmith) {
  const fatherDoeGen = fatherDoe.position.y;
  const motherDoeGen = motherDoe.position.y;
  const fatherSmithGen = fatherSmith.position.y;
  const motherSmithGen = motherSmith.position.y;
  
  console.log(`FatherDoe (John's parent): y=${fatherDoeGen}`);
  console.log(`MotherDoe (John's parent): y=${motherDoeGen}`);
  console.log(`FatherSmith (Jane's parent, John's parent-in-law): y=${fatherSmithGen}`);
  console.log(`MotherSmith (Jane's parent, John's parent-in-law): y=${motherSmithGen}`);
  
  const allParentsSameLevel = fatherDoeGen === motherDoeGen && 
                              motherDoeGen === fatherSmithGen && 
                              fatherSmithGen === motherSmithGen;
  
  if (allParentsSameLevel) {
    console.log('✅ SUCCESS: All parents at same generation level');
  } else {
    console.log('❌ FAILURE: Parents are at different generation levels');
    console.log(`   John's parents: FatherDoe=${fatherDoeGen}, MotherDoe=${motherDoeGen}`);
    console.log(`   Jane's parents: FatherSmith=${fatherSmithGen}, MotherSmith=${motherSmithGen}`);
    console.log('   This is the ISSUE: Parents-in-law should be at same level as parents');
  }
} else {
  console.log('❌ ERROR: Could not find all parent nodes');
}

console.log('');

// Now test with marriages included to see if that fixes it
console.log('--- Testing with Parent Marriages Included ---');

const relationshipsWithMarriages = [
  ...relationships,
  // Add parent marriages
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 }
];

const resultWithMarriages = createFamilyTreeLayout(people, relationshipsWithMarriages, 1);

console.log('Node positions (with parent marriages):');
resultWithMarriages.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

const fatherDoe2 = resultWithMarriages.nodes.find(n => n.data.person.first_name === 'FatherDoe');
const motherDoe2 = resultWithMarriages.nodes.find(n => n.data.person.first_name === 'MotherDoe');
const fatherSmith2 = resultWithMarriages.nodes.find(n => n.data.person.first_name === 'FatherSmith');
const motherSmith2 = resultWithMarriages.nodes.find(n => n.data.person.first_name === 'MotherSmith');

if (fatherDoe2 && motherDoe2 && fatherSmith2 && motherSmith2) {
  const allParentsSameLevel2 = fatherDoe2.position.y === motherDoe2.position.y && 
                               motherDoe2.position.y === fatherSmith2.position.y && 
                               fatherSmith2.position.y === motherSmith2.position.y;
  
  console.log('');
  console.log('Parent generations (with marriages):');
  console.log(`FatherDoe: y=${fatherDoe2.position.y}`);
  console.log(`MotherDoe: y=${motherDoe2.position.y}`);
  console.log(`FatherSmith: y=${fatherSmith2.position.y}`);
  console.log(`MotherSmith: y=${motherSmith2.position.y}`);
  
  if (allParentsSameLevel2) {
    console.log('✅ With marriages: All parents at same generation level');
    console.log('   This confirms the issue is with unmarried parents-in-law positioning');
  } else {
    console.log('❌ Even with marriages: Parents still at different levels');
    console.log('   This indicates a deeper generation calculation issue');
  }
}

console.log('');
console.log('=== Problem Diagnosis ===');
console.log('The issue is that the generation calculation algorithm:');
console.log('1. Correctly places John\'s parents at their generation level');
console.log('2. Correctly places Jane\'s parents at their generation level');
console.log('3. BUT if John\'s parents and Jane\'s parents are not married to each other,');
console.log('   the algorithm doesn\'t know they should be at the SAME generation level');
console.log('4. The spouse post-processing only aligns spouses, not parents-in-law');
console.log('');
console.log('Solution needed: Add logic to align parents-in-law at the same generation level');
console.log('even when they are not married to each other.');