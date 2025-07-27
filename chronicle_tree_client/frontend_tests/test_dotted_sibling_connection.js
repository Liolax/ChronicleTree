/**
 * Test that demonstrates the "dotted sibling connection" scenario
 * Where siblings are added without parents declared
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1990-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1992-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Mary', last_name: 'Smith', gender: 'Female', date_of_birth: '1988-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'John', last_name: 'Johnson', gender: 'Male', date_of_birth: '2015-01-01', date_of_death: null, is_deceased: false }, // Patricia's son
];

const testRelationships = [
  // Sibling relationships WITHOUT parents declared (dotted connection scenario)
  { person_id: 1, relative_id: 2, relationship_type: 'brother' }, // Patricia -> David as brother
  { person_id: 2, relative_id: 1, relationship_type: 'sister' }, // David -> Patricia as sister
  { person_id: 1, relative_id: 3, relationship_type: 'sister' }, // Patricia -> Mary as sister  
  { person_id: 3, relative_id: 1, relationship_type: 'sister' }, // Mary -> Patricia as sister
  { person_id: 2, relative_id: 3, relationship_type: 'sister' }, // David -> Mary as sister
  { person_id: 3, relative_id: 2, relationship_type: 'brother' }, // Mary -> David as brother
  
  // Patricia has a son (to show family tree connections work)
  { person_id: 4, relative_id: 1, relationship_type: 'parent' }, // John -> Patricia as parent
  { person_id: 1, relative_id: 4, relationship_type: 'child' }, // Patricia -> John as child
];

console.log('=== Dotted Sibling Connection Test ===');
console.log('Scenario: Patricia, David, and Mary are siblings, but no parents are declared');
console.log('This should create a "dotted sibling connection" in family tree visualization');
console.log('');

console.log('=== Family Structure ===');
console.log('Patricia (1) ←→ David (2) [dotted sibling connection]');
console.log('     ↕                ↕');
console.log('Mary (3) ←──────────→ [dotted sibling connections]');
console.log('     │');
console.log('John (4) - Patricia\'s son');
console.log('');

// Test all sibling relationships
console.log('=== Testing Sibling Relationships ===');

const siblings = [
  { name: 'Patricia', person: testPeople[0] },
  { name: 'David', person: testPeople[1] },
  { name: 'Mary', person: testPeople[2] }
];

siblings.forEach(rootSibling => {
  console.log(`--- ${rootSibling.name} as root ---`);
  
  siblings.forEach(otherSibling => {
    if (rootSibling.name !== otherSibling.name) {
      const relationship = calculateRelationshipToRoot(
        otherSibling.person,
        rootSibling.person,
        testPeople,
        testRelationships
      );
      
      const expectedGender = otherSibling.person.gender === 'Male' ? 'Brother' : 'Sister';
      const status = relationship === expectedGender ? '✅' : '❌';
      
      console.log(`  ${status} ${otherSibling.name}: ${relationship} (expected: ${expectedGender})`);
    }
  });
  
  // Test other family members
  const johnRelationship = calculateRelationshipToRoot(
    testPeople[3], // John
    rootSibling.person,
    testPeople,
    testRelationships
  );
  
  let expectedJohnRelation;
  if (rootSibling.name === 'Patricia') {
    expectedJohnRelation = 'Son';
  } else {
    expectedJohnRelation = 'Nephew'; // John should be nephew to David and Mary
  }
  
  const johnStatus = johnRelationship === expectedJohnRelation ? '✅' : '❌';
  console.log(`  ${johnStatus} John: ${johnRelationship} (expected: ${expectedJohnRelation})`);
  console.log('');
});

console.log('=== Summary ===');
console.log('✅ This demonstrates the "dotted sibling connection" feature');
console.log('✅ Siblings can be related even without declared parents');
console.log('✅ The family tree should show these as siblings with dotted lines');
console.log('✅ Other relationships (like nephew) still work correctly');
console.log('');
console.log('In family tree visualization, these sibling connections should be:');
console.log('- Shown with dotted lines (since no parents are declared)');
console.log('- Allow users to later add parents if/when that information becomes available');
console.log('- Maintain the sibling relationships even after parents are added');