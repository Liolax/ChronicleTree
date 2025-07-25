/**
 * Test reverse step-uncle/aunt logic with Emma and Michael
 * Using CORRECT Rails format: source HAS relationship target
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create test data using the correct Rails format
const allPeople = [
    // John (shared father)
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    
    // Jane (Michael's mother, now deceased)
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    
    // Lisa (Emma's mother, John's current wife)
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1975-01-01', is_deceased: false },
    
    // Michael (John + Jane's son, should be Emma's step-uncle)
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '1995-08-15', is_deceased: false },
    
    // Alice (John + Lisa's daughter, Michael's step-sister)
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    
    // Emma (Alice's daughter, should see Michael as step-uncle)
    { id: 14, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-10', is_deceased: false }
];

// CORRECTED: Using Rails format where source HAS relationship target
const relationships = [
    // John married to Jane (deceased) - bidirectional
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    
    // John married to Lisa (current) - bidirectional
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Michael HAS parents John + Jane (Rails format)
    { source: 13, target: 1, type: 'parent', is_ex: false, is_deceased: false },  // Michael HAS parent John
    { source: 1, target: 13, type: 'child', is_ex: false, is_deceased: false },   // John HAS child Michael
    { source: 13, target: 2, type: 'parent', is_ex: false, is_deceased: false },  // Michael HAS parent Jane
    { source: 2, target: 13, type: 'child', is_ex: false, is_deceased: false },   // Jane HAS child Michael
    
    // Alice HAS parents John + Lisa (Rails format)
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },   // Alice HAS parent John
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },    // John HAS child Alice
    { source: 3, target: 12, type: 'parent', is_ex: false, is_deceased: false },  // Alice HAS parent Lisa
    { source: 12, target: 3, type: 'child', is_ex: false, is_deceased: false },   // Lisa HAS child Alice
    
    // Emma HAS parent Alice (Rails format)
    { source: 14, target: 3, type: 'parent', is_ex: false, is_deceased: false },  // Emma HAS parent Alice
    { source: 3, target: 14, type: 'child', is_ex: false, is_deceased: false }    // Alice HAS child Emma
];

console.log('=== TESTING REVERSE STEP-UNCLE/AUNT LOGIC (CORRECTED RAILS FORMAT) ===');
console.log('');

console.log('Family Structure:');
console.log('- John + Jane → Michael (born 1995)');
console.log('- John + Lisa → Alice (born 2000)');
console.log('- Alice → Emma (born 2020)');
console.log('- Michael and Alice are step-siblings (share father John)');
console.log('- Michael should be Emma\'s step-uncle (he\'s her mother\'s step-brother)');
console.log('');

const emma = allPeople.find(p => p.first_name === 'Emma');
const michael = allPeople.find(p => p.first_name === 'Michael');
const alice = allPeople.find(p => p.first_name === 'Alice');

console.log('Testing relationships:');

try {
    // Test 1: Emma → Michael (should be Step-Uncle)
    const result1 = calculateRelationshipToRoot(michael, emma, allPeople, relationships);
    console.log(`✓ Michael → Emma (Emma as root): "${result1}"`);
    
    // Test 2: Michael → Emma (should be Step-Niece)
    const result2 = calculateRelationshipToRoot(emma, michael, allPeople, relationships);
    console.log(`✓ Emma → Michael (Michael as root): "${result2}"`);
    
    // Test 3: Alice → Michael (should be Step-Brother) 
    const result3 = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`✓ Michael → Alice (Alice as root): "${result3}"`);
    
    // Test 4: Michael → Alice (should be Step-Sister)
    const result4 = calculateRelationshipToRoot(alice, michael, allPeople, relationships);
    console.log(`✓ Alice → Michael (Michael as root): "${result4}"`);
    
    console.log('');
    console.log('Expected Results:');
    console.log('- Michael → Emma (Emma as root): Should be "Step-Uncle"');
    console.log('- Emma → Michael (Michael as root): Should be "Step-Niece"');
    console.log('- Michael → Alice (Alice as root): Should be "Step-Brother"');
    console.log('- Alice → Michael (Michael as root): Should be "Step-Sister"');
    
    console.log('');
    console.log('Analysis:');
    const isStepUncle = result1 === 'Step-Uncle';
    const isStepNiece = result2 === 'Step-Niece';
    const isStepBrother = result3 === 'Step-Brother';
    const isStepSister = result4 === 'Step-Sister';
    
    console.log(`- Step-Uncle relationship: ${isStepUncle ? '✅ CORRECT' : '❌ INCORRECT'} ("${result1}")`);
    console.log(`- Step-Niece relationship: ${isStepNiece ? '✅ CORRECT' : '❌ INCORRECT'} ("${result2}")`);
    console.log(`- Step-Brother relationship: ${isStepBrother ? '✅ CORRECT' : '❌ INCORRECT'} ("${result3}")`);
    console.log(`- Step-Sister relationship: ${isStepSister ? '✅ CORRECT' : '❌ INCORRECT'} ("${result4}")`);
    
    if (isStepUncle && isStepNiece && isStepBrother && isStepSister) {
        console.log('');
        console.log('🎉 SUCCESS: All step-relationships are working correctly!');
        console.log('The reverse step-uncle/aunt logic is now functioning properly.');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Some step-relationships still need fixing');
        if (!isStepUncle) {
            console.log('  - Emma should see Michael as Step-Uncle (he\'s her mother\'s step-brother)');
        }
        if (!isStepNiece) {
            console.log('  - Michael should see Emma as Step-Niece (she\'s his step-sister\'s daughter)');
        }
        if (!isStepBrother) {
            console.log('  - Alice should see Michael as Step-Brother (they share father John)');
        }
        if (!isStepSister) {
            console.log('  - Michael should see Alice as Step-Sister (they share father John)');
        }
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}