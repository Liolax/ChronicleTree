/**
 * Test sibling relationships when no parents are declared
 * This should show dotted sibling connections
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1990-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1992-01-01', date_of_death: null, is_deceased: false },
];

// Test different possible relationship types that might be used for siblings
const testCases = [
  {
    name: 'Using sibling relationship type',
    relationships: [
      { person_id: 1, relative_id: 2, relationship_type: 'sibling' },
      { person_id: 2, relative_id: 1, relationship_type: 'sibling' },
    ]
  },
  {
    name: 'Using brother relationship type',
    relationships: [
      { person_id: 1, relative_id: 2, relationship_type: 'brother' },
      { person_id: 2, relative_id: 1, relationship_type: 'sister' },
    ]
  },
  {
    name: 'Using Brother relationship type (capitalized)',
    relationships: [
      { person_id: 1, relative_id: 2, relationship_type: 'Brother' },
      { person_id: 2, relative_id: 1, relationship_type: 'Sister' },
    ]
  }
];

console.log('=== Testing Sibling Relationships Without Parents ===');
console.log('People: Patricia (1), David (2)');
console.log('Expected: David should show as Patricia\'s Brother, Patricia should show as David\'s Sister');
console.log('');

testCases.forEach(testCase => {
  console.log(`--- ${testCase.name} ---`);
  
  // Test Patricia as root, David as person
  const davidToPatricia = calculateRelationshipToRoot(
    testPeople[1], // David 
    testPeople[0], // Patricia as root
    testPeople, 
    testCase.relationships
  );
  
  // Test David as root, Patricia as person
  const patriciaToDavid = calculateRelationshipToRoot(
    testPeople[0], // Patricia
    testPeople[1], // David as root
    testPeople, 
    testCase.relationships
  );
  
  console.log(`David to Patricia (Patricia as root): "${davidToPatricia}"`);
  console.log(`Patricia to David (David as root): "${patriciaToDavid}"`);
  
  if (davidToPatricia === 'Brother' && patriciaToDavid === 'Sister') {
    console.log('✅ SUCCESS: Sibling relationship detected correctly');
  } else if (davidToPatricia === 'Unrelated' || patriciaToDavid === 'Unrelated') {
    console.log('❌ FAILURE: Siblings showing as Unrelated');
  } else {
    console.log(`⚠️  UNEXPECTED: Got "${davidToPatricia}" and "${patriciaToDavid}"`);
  }
  console.log('');
});

console.log('=== Debugging Information ===');
console.log('If siblings are showing as "Unrelated", possible causes:');
console.log('1. Wrong relationship_type being used in database');
console.log('2. Missing bidirectional relationships');
console.log('3. Issue with relationship parsing in buildRelationshipMaps');
console.log('4. siblingMap not being populated correctly');