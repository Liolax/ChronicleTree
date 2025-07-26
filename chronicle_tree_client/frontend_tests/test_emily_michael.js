/**
 * Test Emily Anderson and Michael Doe relationship
 * Emily should see Michael as Step-Uncle, not Uncle
 * because Michael is the step-brother of Emily's mother
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create test data based on the actual family structure
const allPeople = [
    // John Doe (shared father)
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    
    // Jane Doe (Michael's mother, deceased)
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    
    // Lisa Doe (Alice's mother, John's current wife)
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1975-01-01', is_deceased: false },
    
    // Michael Doe (John + Jane's son, should be Emily's step-uncle)
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '1995-08-15', is_deceased: false },
    
    // Alice Doe (John + Lisa's daughter, Michael's step-sister, Emily's mother)
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    
    // Emily Anderson (Alice's daughter, should see Michael as step-uncle)
    { id: 50, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2020-03-10', is_deceased: false }
];

// Using correct Rails format where source HAS relationship target
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
    
    // Emily HAS parent Alice (Rails format)
    { source: 50, target: 3, type: 'parent', is_ex: false, is_deceased: false },  // Emily HAS parent Alice
    { source: 3, target: 50, type: 'child', is_ex: false, is_deceased: false }    // Alice HAS child Emily
];

console.log('=== TESTING EMILY ANDERSON AND MICHAEL DOE RELATIONSHIP ===');
console.log('');

console.log('Family Structure:');
console.log('- John + Jane → Michael (born 1995)');
console.log('- John + Lisa → Alice (born 2000)');
console.log('- Alice → Emily Anderson (born 2020)');
console.log('');

console.log('Key Relationships:');
console.log('- Michael and Alice are step-siblings (they share father John)');
console.log('- Alice is Emily\'s mother');
console.log('- Therefore: Michael should be Emily\'s STEP-UNCLE, not Uncle');
console.log('');

const emily = allPeople.find(p => p.first_name === 'Emily');
const michael = allPeople.find(p => p.first_name === 'Michael');
const alice = allPeople.find(p => p.first_name === 'Alice');

console.log('Testing relationships:');

try {
    // Test 1: Michael → Emily (Emily as root) - should be Step-Uncle
    const result1 = calculateRelationshipToRoot(michael, emily, allPeople, relationships);
    console.log(`✓ Michael → Emily (Emily as root): "${result1}"`);
    
    // Test 2: Emily → Michael (Michael as root) - should be Step-Niece
    const result2 = calculateRelationshipToRoot(emily, michael, allPeople, relationships);
    console.log(`✓ Emily → Michael (Michael as root): "${result2}"`);
    
    // Test 3: Michael → Alice (Alice as root) - should be Step-Brother (for verification)
    const result3 = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`✓ Michael → Alice (Alice as root): "${result3}"`);
    
    console.log('');
    console.log('Expected Results:');
    console.log('- Michael → Emily (Emily as root): Should be "Step-Uncle"');
    console.log('- Emily → Michael (Michael as root): Should be "Step-Niece"');
    console.log('- Michael → Alice (Alice as root): Should be "Step-Brother"');
    
    console.log('');
    console.log('Analysis:');
    const isStepUncle = result1 === 'Step-Uncle';
    const isStepNiece = result2 === 'Step-Niece';
    const isStepBrother = result3 === 'Step-Brother';
    
    console.log(`- Michael → Emily: ${isStepUncle ? '✅ CORRECT' : '❌ INCORRECT'} ("${result1}")`);
    console.log(`- Emily → Michael: ${isStepNiece ? '✅ CORRECT' : '❌ INCORRECT'} ("${result2}")`);
    console.log(`- Michael → Alice: ${isStepBrother ? '✅ CORRECT' : '❌ INCORRECT'} ("${result3}")`);
    
    if (!isStepUncle) {
        console.log('');
        console.log('🔍 ISSUE DETECTED:');
        console.log('Emily Anderson should see Michael Doe as "Step-Uncle", not "' + result1 + '"');
        console.log('This is because:');
        console.log('1. Michael is Alice\'s step-brother (they share father John)');
        console.log('2. Alice is Emily\'s mother');
        console.log('3. Therefore: Michael is Emily\'s mother\'s step-brother = Emily\'s step-uncle');
    }
    
    if (isStepUncle && isStepNiece && isStepBrother) {
        console.log('');
        console.log('🎉 SUCCESS: All step-relationships are working correctly!');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}