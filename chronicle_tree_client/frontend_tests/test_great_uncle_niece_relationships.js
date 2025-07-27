/**
 * Test to verify that great-uncle/aunt and great-nephew/niece relationships work correctly
 * Testing the user's scenario: David Smith (Patricia's brother) should be related to Patricia's daughter
 */

import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

console.log('=== Testing Great-Uncle/Aunt and Great-Nephew/Niece Relationships ===');

// Test scenario based on user's question:
// David Smith is Patricia's brother (with no parents declared)
// Patricia has a daughter
// David should be the great-uncle of Patricia's daughter
// Patricia's daughter should be David's great-niece

const people = [
  { id: 1, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1955-01-01' },
  { id: 3, first_name: 'PatriciaDaughter', last_name: 'Johnson', gender: 'Female', date_of_birth: '1990-01-01' },
  { id: 4, first_name: 'PatriciaDaughterChild', last_name: 'Johnson', gender: 'Female', date_of_birth: '2015-01-01' }
];

const relationships = [
  // David and Patricia are siblings (no parents declared)
  { source: 1, target: 2, type: 'sibling', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 },
  
  // Patricia is mother of PatriciaDaughter
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  
  // PatriciaDaughter is mother of PatriciaDaughterChild
  { source: 4, target: 3, type: 'parent', from: 4, to: 3 },
  { source: 3, target: 4, type: 'child', from: 3, to: 4 }
];

console.log('Family structure:');
console.log('- David Smith: Patricia\'s brother (no parents declared)');
console.log('- Patricia Smith: David\'s sister');
console.log('- PatriciaDaughter: Patricia\'s daughter (David\'s niece)');
console.log('- PatriciaDaughterChild: Patricia\'s granddaughter (David\'s great-niece)');
console.log('');

// Test 1: David as root, what is Patricia's daughter to him?
console.log('--- Test 1: David as Root ---');
const patriciaDaughterObj = people.find(p => p.id === 3);
const davidObj = people.find(p => p.id === 1);
const davidToPatriciaDaughter = calculateRelationshipToRoot(patriciaDaughterObj, davidObj, people, relationships);
console.log(`David -> PatriciaDaughter: "${davidToPatriciaDaughter}"`);
console.log(`Expected: "Niece" (Patricia's daughter is David's niece)`);
console.log(`Result: ${davidToPatriciaDaughter === 'Niece' ? '✅' : '❌'}`);
console.log('');

// Test 2: Patricia's daughter as root, what is David to her?
console.log('--- Test 2: PatriciaDaughter as Root ---');
const patriciaDaughterToDavid = calculateRelationshipToRoot(davidObj, patriciaDaughterObj, people, relationships);
console.log(`PatriciaDaughter -> David: "${patriciaDaughterToDavid}"`);
console.log(`Expected: "Uncle" (David is Patricia's daughter's uncle)`);
console.log(`Result: ${patriciaDaughterToDavid === 'Uncle' ? '✅' : '❌'}`);
console.log('');

// Test 3: David as root, what is Patricia's granddaughter to him?
console.log('--- Test 3: David as Root, Great-Niece Relationship ---');
const patriciaGranddaughterObj = people.find(p => p.id === 4);
const davidToPatriciaGranddaughter = calculateRelationshipToRoot(patriciaGranddaughterObj, davidObj, people, relationships);
console.log(`David -> PatriciaDaughterChild: "${davidToPatriciaGranddaughter}"`);
console.log(`Expected: "Great-Niece" (Patricia's granddaughter is David's great-niece)`);
console.log(`Result: ${davidToPatriciaGranddaughter === 'Great-Niece' ? '✅' : '❌'}`);
console.log('');

// Test 4: Patricia's granddaughter as root, what is David to her?
console.log('--- Test 4: PatriciaDaughterChild as Root, Great-Uncle Relationship ---');
const patriciaGranddaughterToDavid = calculateRelationshipToRoot(davidObj, patriciaGranddaughterObj, people, relationships);
console.log(`PatriciaDaughterChild -> David: "${patriciaGranddaughterToDavid}"`);
console.log(`Expected: "Great-Uncle" (David is Patricia's granddaughter's great-uncle)`);
console.log(`Result: ${patriciaGranddaughterToDavid === 'Great-Uncle' ? '✅' : '❌'}`);
console.log('');

// Test 5: Verify basic sibling relationship still works
console.log('--- Test 5: Basic Sibling Relationship ---');
const patriciaObj = people.find(p => p.id === 2);
const davidToPatricia = calculateRelationshipToRoot(patriciaObj, davidObj, people, relationships);
console.log(`David -> Patricia: "${davidToPatricia}"`);
console.log(`Expected: "Sister" (Patricia is David's sister)`);
console.log(`Result: ${davidToPatricia === 'Sister' ? '✅' : '❌'}`);
console.log('');

console.log('=== Summary ===');
const allTests = [
  { name: 'David -> PatriciaDaughter (Niece)', result: davidToPatriciaDaughter === 'Niece' },
  { name: 'PatriciaDaughter -> David (Uncle)', result: patriciaDaughterToDavid === 'Uncle' },
  { name: 'David -> PatriciaDaughterChild (Great-Niece)', result: davidToPatriciaGranddaughter === 'Great-Niece' },
  { name: 'PatriciaDaughterChild -> David (Great-Uncle)', result: patriciaGranddaughterToDavid === 'Great-Uncle' },
  { name: 'David -> Patricia (Sister)', result: davidToPatricia === 'Sister' }
];

const passedTests = allTests.filter(test => test.result).length;
const totalTests = allTests.length;

console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('');

if (passedTests === totalTests) {
  console.log('✅ SUCCESS: All great-uncle/aunt and great-nephew/niece relationships are working correctly!');
  console.log('The relationship calculator properly handles these extended family relationships.');
} else {
  console.log('❌ ISSUES FOUND: Some relationships are not being calculated correctly.');
  console.log('Failed tests:');
  allTests.forEach(test => {
    if (!test.result) {
      console.log(`  - ${test.name}`);
    }
  });
  console.log('');
  console.log('The great-uncle/aunt and great-nephew/niece logic may need to be reviewed or fixed.');
}

console.log('');
console.log('=== User Question Context ===');
console.log('User asked: "why David Smith (i added patricia\'s brother with no parents declared) as');
console.log('Root isnt related to patricia\'s daughter? where are grandnehew/niece and great-uncle/aunt logic?"');
console.log('');
console.log('Answer: If David is not showing as related to Patricia\'s daughter, the issue could be:');
console.log('1. The relationship calculation is not working correctly (test above will show this)');
console.log('2. The UI is not displaying the relationships correctly');
console.log('3. The data structure in the app might be different from this test');
console.log('4. There might be missing bidirectional relationships in the database');