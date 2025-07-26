/**
 * Test Emily Anderson and Michael Doe relationship using actual seeds data structure
 * Emily should see Michael as Step-Uncle after the seeds fix
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Using the ACTUAL seeds data structure (from seeds.rb)
const allPeople = [
    // John Doe (p1) - born 1970
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    
    // Jane Doe (p2) - born 1972, died 2022
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    
    // Lisa - born 1994, John's current wife  
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    
    // Alice - born 1995, daughter of John + Jane, Emily's mother
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', is_deceased: false },
    
    // Charlie - born 1998, son of John + Jane, Alice's brother
    { id: 4, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1998-01-01', is_deceased: false },
    
    // Michael - born 2024, son of John + Lisa, Alice's step-brother
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false },
    
    // David - Emily's father
    { id: 5, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1992-01-01', is_deceased: false },
    
    // Emily Anderson - born 2019, daughter of Alice + David
    { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', is_deceased: false }
];

// Using correct Rails format based on seeds.rb structure
const relationships = [
    // John married to Jane (deceased spouse) - bidirectional
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    
    // John married to Lisa (current spouse) - bidirectional
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Alice HAS parents John + Jane (Rails format: [ p1, alice ], [ p2, alice ])
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },   // Alice HAS parent John
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },    // John HAS child Alice
    { source: 3, target: 2, type: 'parent', is_ex: false, is_deceased: false },   // Alice HAS parent Jane
    { source: 2, target: 3, type: 'child', is_ex: false, is_deceased: false },    // Jane HAS child Alice
    
    // Charlie HAS parents John + Jane (Rails format: [ p1, charlie ], [ p2, charlie ])
    { source: 4, target: 1, type: 'parent', is_ex: false, is_deceased: false },   // Charlie HAS parent John
    { source: 1, target: 4, type: 'child', is_ex: false, is_deceased: false },    // John HAS child Charlie
    { source: 4, target: 2, type: 'parent', is_ex: false, is_deceased: false },   // Charlie HAS parent Jane
    { source: 2, target: 4, type: 'child', is_ex: false, is_deceased: false },    // Jane HAS child Charlie
    
    // Michael HAS parents John + Lisa (Rails format: [ p1, michael ], [ lisa, michael ])
    { source: 13, target: 1, type: 'parent', is_ex: false, is_deceased: false },  // Michael HAS parent John
    { source: 1, target: 13, type: 'child', is_ex: false, is_deceased: false },   // John HAS child Michael
    { source: 13, target: 12, type: 'parent', is_ex: false, is_deceased: false }, // Michael HAS parent Lisa
    { source: 12, target: 13, type: 'child', is_ex: false, is_deceased: false },  // Lisa HAS child Michael
    
    // Emily HAS parents Alice + David (Rails format: [ alice, emily ], [ david, emily ])
    { source: 6, target: 3, type: 'parent', is_ex: false, is_deceased: false },   // Emily HAS parent Alice
    { source: 3, target: 6, type: 'child', is_ex: false, is_deceased: false },    // Alice HAS child Emily
    { source: 6, target: 5, type: 'parent', is_ex: false, is_deceased: false },   // Emily HAS parent David
    { source: 5, target: 6, type: 'child', is_ex: false, is_deceased: false },    // David HAS child Emily
    
    // Regular sibling relationships (only the ones still in seeds after our fix)
    // Charlie and Alice are regular siblings (both children of John + Jane)
    { source: 4, target: 3, type: 'sibling', is_ex: false, is_deceased: false },  // Charlie HAS sibling Alice
    { source: 3, target: 4, type: 'sibling', is_ex: false, is_deceased: false }   // Alice HAS sibling Charlie
    
    // NOTE: No explicit sibling relationship between Alice-Michael or Charlie-Michael 
    // They should be detected as step-siblings automatically
];

console.log('=== TESTING EMILY ANDERSON AND MICHAEL DOE WITH ACTUAL SEEDS DATA ===');
console.log('');

console.log('Actual Family Structure (from seeds.rb):');
console.log('- John + Jane → Alice (1995), Charlie (1998)');
console.log('- John + Lisa → Michael (2024)');  
console.log('- Alice + David → Emily Anderson (2019)');
console.log('');

console.log('Expected Relationships:');
console.log('- Alice and Charlie are REGULAR siblings (both John + Jane children)');
console.log('- Alice and Michael are STEP-siblings (Alice from John + Jane, Michael from John + Lisa)');
console.log('- Charlie and Michael are STEP-siblings (Charlie from John + Jane, Michael from John + Lisa)');
console.log('- Emily should see Michael as STEP-UNCLE (Michael is Alice\'s step-brother)');
console.log('');

const emily = allPeople.find(p => p.first_name === 'Emily');
const michael = allPeople.find(p => p.first_name === 'Michael');
const alice = allPeople.find(p => p.first_name === 'Alice');
const charlie = allPeople.find(p => p.first_name === 'Charlie');

console.log('Testing relationships:');

try {
    // Test 1: Michael → Emily (Emily as root) - should be Step-Uncle
    const result1 = calculateRelationshipToRoot(michael, emily, allPeople, relationships);
    console.log(`✓ Michael → Emily (Emily as root): "${result1}"`);
    
    // Test 2: Emily → Michael (Michael as root) - should be Step-Niece
    const result2 = calculateRelationshipToRoot(emily, michael, allPeople, relationships);
    console.log(`✓ Emily → Michael (Michael as root): "${result2}"`);
    
    // Test 3: Michael → Alice (Alice as root) - should be Step-Brother
    const result3 = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`✓ Michael → Alice (Alice as root): "${result3}"`);
    
    // Test 4: Alice → Michael (Michael as root) - should be Step-Sister
    const result4 = calculateRelationshipToRoot(alice, michael, allPeople, relationships);
    console.log(`✓ Alice → Michael (Michael as root): "${result4}"`);
    
    // Test 5: Charlie → Alice (Alice as root) - should be Brother (regular sibling)
    const result5 = calculateRelationshipToRoot(charlie, alice, allPeople, relationships);
    console.log(`✓ Charlie → Alice (Alice as root): "${result5}"`);
    
    console.log('');
    console.log('Expected vs Actual:');
    console.log(`- Michael → Emily: Expected "Step-Uncle", Got "${result1}"`);
    console.log(`- Emily → Michael: Expected "Step-Niece", Got "${result2}"`);
    console.log(`- Michael → Alice: Expected "Step-Brother", Got "${result3}"`);
    console.log(`- Alice → Michael: Expected "Step-Sister", Got "${result4}"`);
    console.log(`- Charlie → Alice: Expected "Brother", Got "${result5}"`);
    
    console.log('');
    console.log('Analysis:');
    const isStepUncle = result1 === 'Step-Uncle';
    const isStepNiece = result2 === 'Step-Niece';
    const isStepBrother = result3 === 'Step-Brother';
    const isStepSister = result4 === 'Step-Sister';
    const isBrother = result5 === 'Brother';
    
    console.log(`- Emily sees Michael as Step-Uncle: ${isStepUncle ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Michael sees Emily as Step-Niece: ${isStepNiece ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Alice sees Michael as Step-Brother: ${isStepBrother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Michael sees Alice as Step-Sister: ${isStepSister ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Alice sees Charlie as Brother: ${isBrother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (isStepUncle && isStepNiece && isStepBrother && isStepSister && isBrother) {
        console.log('');
        console.log('🎉 SUCCESS: Seeds fix worked! All relationships are now correct.');
        console.log('Emily Anderson now sees Michael Doe as Step-Uncle instead of Uncle.');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Some relationships still need fixing.');
        if (!isStepUncle) {
            console.log('  - Emily should see Michael as Step-Uncle');
        }
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}