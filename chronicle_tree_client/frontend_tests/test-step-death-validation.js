/**
 * Test to verify step-relationship death date validation fix
 * Tests the scenario where Michael (born 2024) incorrectly showed as Jane's (died 2022) step-son
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test data matching the actual bug scenario
const testPeople = [
  { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false, date_of_birth: '1970-01-01' },
  { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true, date_of_birth: '1972-01-01', date_of_death: '2022-01-01' }, // Jane died Jan 2022
  { id: '5', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', is_deceased: false, date_of_birth: '1975-01-01' },
  { id: '6', first_name: 'Michael', last_name: 'Doe', gender: 'Male', is_deceased: false, date_of_birth: '2024-08-15' } // Michael born Aug 2024 (AFTER Jane's death)
];

const testRelationships = [
  // John-Jane marriage (Jane deceased)
  { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { source: '2', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // John-Lisa marriage (current)
  { source: '1', target: '5', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { source: '5', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // John and Lisa are Michael's parents
  { source: '1', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: '6', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },
  { source: '5', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: '6', target: '5', relationship_type: 'parent', is_ex: false, is_deceased: false }
];

console.log('=== STEP-RELATIONSHIP DEATH DATE VALIDATION TEST ===\n');

const john = testPeople.find(p => p.id === '1');
const jane = testPeople.find(p => p.id === '2');
const lisa = testPeople.find(p => p.id === '5');
const michael = testPeople.find(p => p.id === '6');

console.log('Scenario Details:');
console.log(`- Jane died: ${jane.date_of_death} (January 1, 2022)`);
console.log(`- Michael born: ${michael.date_of_birth} (August 15, 2024)`);
console.log(`- Time gap: Michael was born 2+ years AFTER Jane's death\n`);

console.log('=== THE BUG BEING FIXED ===');
console.log('Before Fix: Michael incorrectly showed as Jane\'s "Step-Son"');
console.log('After Fix: Michael should show as "Unrelated" to Jane\n');

console.log('=== TESTING FROM JANE\'S PERSPECTIVE ===');
const michaelToJane = calculateRelationshipToRoot(michael, jane, testPeople, testRelationships);
console.log(`Michael -> Jane: "${michaelToJane}"`);
console.log(`Expected: "Unrelated" (Michael born after Jane's death)\n`);

console.log('=== TESTING FROM MICHAEL\'S PERSPECTIVE ===');
const janeToMichael = calculateRelationshipToRoot(jane, michael, testPeople, testRelationships);
console.log(`Jane -> Michael: "${janeToMichael}"`);
console.log(`Expected: "Unrelated" (Jane died before Michael was born)\n`);

console.log('=== VALID RELATIONSHIPS (Should Still Work) ===');
const johnToMichael = calculateRelationshipToRoot(michael, john, testPeople, testRelationships);
const lisaToMichael = calculateRelationshipToRoot(michael, lisa, testPeople, testRelationships);
console.log(`Michael -> John: "${johnToMichael}" (Expected: "Son")`);
console.log(`Michael -> Lisa: "${lisaToMichael}" (Expected: "Son")`);

console.log('\n=== VALIDATION RESULTS ===');
if (michaelToJane === 'Unrelated' && janeToMichael === 'Unrelated') {
  console.log('✅ SUCCESS: Death date validation working correctly!');
  console.log('✅ Deceased people cannot have step-relationships with people born after their death');
} else {
  console.log('❌ ISSUE: Step-relationship death date validation needs more work');
  console.log(`❌ Michael -> Jane: "${michaelToJane}" (should be "Unrelated")`);
  console.log(`❌ Jane -> Michael: "${janeToMichael}" (should be "Unrelated")`);
}

console.log('\n=== LOGICAL EXPLANATION ===');
console.log('A step-relationship requires the step-parent to have been alive and married');
console.log('to the biological parent when the child existed. Since Jane died in 2022');
console.log('and Michael was born in 2024, they never coexisted, so no step-relationship');
console.log('can exist between them. This fix ensures chronological accuracy in family trees.');
