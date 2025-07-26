/**
 * Test Alice and Michael step-sibling relationship
 * Alice's father John married Lisa (Alice's step-mother)
 * Michael is Lisa's child (but not Alice's biological mother's child)
 * Therefore Michael should be Alice's step-brother
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test data - focusing on Alice and Michael relationship
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false }
];

// Relationships based on the family structure
const relationships = [
    // John was married to Jane (deceased spouse relationship)
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    
    // John is now married to Lisa (current spouse)
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // John is parent of Alice (from his marriage to Jane)
    { source: 1, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 1, type: 'child', is_ex: false, is_deceased: false },
    
    // Jane is parent of Alice (biological mother)
    { source: 2, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 2, type: 'child', is_ex: false, is_deceased: false },
    
    // John is parent of Michael (from his marriage to Lisa)
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    
    // Lisa is parent of Michael (biological mother)
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('=== TESTING ALICE AND MICHAEL STEP-SIBLING RELATIONSHIP ===');
console.log('');

console.log('Family Structure:');
console.log('- John Doe was married to Jane Doe (deceased)');
console.log('  - Their child: Alice Doe');
console.log('- John Doe is now married to Lisa Doe');
console.log('  - Their child: Michael Doe');
console.log('');

console.log('Expected relationship:');
console.log('- Alice and Michael should be step-siblings');
console.log('- Alice\'s step-mother is Lisa (John\'s current wife)');
console.log('- Michael is Lisa\'s biological child (but not Alice\'s biological mother\'s child)');
console.log('- Therefore: Michael should be Alice\'s step-brother');
console.log('');

const alice = allPeople.find(p => p.first_name === 'Alice');
const michael = allPeople.find(p => p.first_name === 'Michael');

console.log('Testing relationships:');

try {
    // Test Alice as root, Michael as person
    const aliceRoot = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`✓ Michael → Alice (Alice as root): "${aliceRoot}"`);
    
    // Test Michael as root, Alice as person  
    const michaelRoot = calculateRelationshipToRoot(alice, michael, allPeople, relationships);
    console.log(`✓ Alice → Michael (Michael as root): "${michaelRoot}"`);
    
    console.log('');
    console.log('Results Analysis:');
    
    const expectedResults = ['Step-Brother', 'Step-Sister'];
    const aliceCorrect = expectedResults.includes(aliceRoot);
    const michaelCorrect = expectedResults.includes(michaelRoot);
    
    console.log(`- Alice as root result: ${aliceCorrect ? '✅ CORRECT' : '❌ INCORRECT'} ("${aliceRoot}")`);
    console.log(`- Michael as root result: ${michaelCorrect ? '✅ CORRECT' : '❌ INCORRECT'} ("${michaelRoot}")`);
    
    if (aliceCorrect && michaelCorrect) {
        console.log('');
        console.log('🎉 SUCCESS: Step-sibling relationship is working correctly!');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Step-sibling relationship needs fixing');
        console.log('Expected: Both should return "Step-Brother" or "Step-Sister"');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}