/**
 * Test the actual findStepRelationship function with Alice and Michael
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test with a simpler dataset focused on the step-sibling case
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2002-08-15', is_deceased: false } // Changed birth year to avoid timeline issues
];

const relationships = [
    // John was married to Jane (deceased spouse)
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    
    // John is now married to Lisa (current spouse)
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // John and Jane are parents of Alice
    { source: 1, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 2, type: 'child', is_ex: false, is_deceased: false },
    
    // John and Lisa are parents of Michael
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('=== STEP-SIBLING TEST WITH SIMPLIFIED TIMELINE ===');
console.log('');

console.log('Family Structure:');
console.log('- John + Jane → Alice (born 2000)');
console.log('- John + Lisa → Michael (born 2002)'); 
console.log('- Jane died 2022 (after both children were born)');
console.log('');

const alice = allPeople.find(p => p.first_name === 'Alice');
const michael = allPeople.find(p => p.first_name === 'Michael');

console.log('Testing step-sibling relationship:');

try {
    // Test both directions
    const result1 = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`✓ Michael → Alice: "${result1}"`);
    
    const result2 = calculateRelationshipToRoot(alice, michael, allPeople, relationships);
    console.log(`✓ Alice → Michael: "${result2}"`);
    
    const isStepSibling1 = ['Step-Brother', 'Step-Sister'].includes(result1);
    const isStepSibling2 = ['Step-Brother', 'Step-Sister'].includes(result2);
    
    console.log('');
    console.log('Results:');
    console.log(`- Michael → Alice: ${isStepSibling1 ? '✅ CORRECT' : '❌ INCORRECT'} ("${result1}")`);
    console.log(`- Alice → Michael: ${isStepSibling2 ? '✅ CORRECT' : '❌ INCORRECT'} ("${result2}")`);
    
    if (isStepSibling1 && isStepSibling2) {
        console.log('');
        console.log('🎉 SUCCESS: Step-sibling relationships are working!');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Step-sibling detection still needs fixing');
        console.log('Expected: Both should be Step-Brother/Step-Sister');
        console.log('This suggests the step-sibling logic is not being reached');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}