/**
 * Test Bob Anderson and Lisa Doe step-grandparent relationship
 * Lisa should be Bob's Step-Grandmother, not Unrelated
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create test data based on the actual family structure
const allPeople = [
    // John Doe (Bob's grandfather, Lisa's husband)
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    
    // Jane Doe (John's deceased first wife)
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    
    // Lisa Doe (John's current wife, should be Bob's step-grandmother)
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    
    // Alice Doe (John + Jane's daughter, Bob's mother)
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', is_deceased: false },
    
    // David Anderson (Bob's father)
    { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1992-01-01', is_deceased: false },
    
    // Bob Anderson (the root person we're testing)
    { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2015-01-01', is_deceased: false },
    
    // Lisa's parents (should be unrelated to Bob)
    { id: 15, first_name: 'William', last_name: "O'Sullivan", gender: 'Male', date_of_birth: '1965-01-01', is_deceased: false },
    { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1967-01-01', is_deceased: false }
];

// Using correct Rails format
const relationships = [
    // John married to Jane (deceased spouse) - bidirectional
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    
    // John married to Lisa (current spouse) - bidirectional
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Alice HAS parents John + Jane (Rails format)
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },   // Alice HAS parent John
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },    // John HAS child Alice
    { source: 3, target: 2, type: 'parent', is_ex: false, is_deceased: false },   // Alice HAS parent Jane
    { source: 2, target: 3, type: 'child', is_ex: false, is_deceased: false },    // Jane HAS child Alice
    
    // Bob HAS parents Alice + David (Rails format)
    { source: 5, target: 3, type: 'parent', is_ex: false, is_deceased: false },   // Bob HAS parent Alice
    { source: 3, target: 5, type: 'child', is_ex: false, is_deceased: false },    // Alice HAS child Bob
    { source: 5, target: 4, type: 'parent', is_ex: false, is_deceased: false },   // Bob HAS parent David
    { source: 4, target: 5, type: 'child', is_ex: false, is_deceased: false },    // David HAS child Bob
    
    // Lisa HAS parents William + Patricia (Rails format)
    { source: 12, target: 15, type: 'parent', is_ex: false, is_deceased: false }, // Lisa HAS parent William
    { source: 15, target: 12, type: 'child', is_ex: false, is_deceased: false },  // William HAS child Lisa
    { source: 12, target: 16, type: 'parent', is_ex: false, is_deceased: false }, // Lisa HAS parent Patricia
    { source: 16, target: 12, type: 'child', is_ex: false, is_deceased: false }   // Patricia HAS child Lisa
];

console.log('=== TESTING BOB ANDERSON AND LISA DOE STEP-GRANDPARENT RELATIONSHIP ===');
console.log('');

console.log('Family Structure:');
console.log('- John + Jane → Alice');
console.log('- Alice + David → Bob Anderson');
console.log('- John + Lisa (current marriage)');
console.log('- William + Patricia → Lisa');
console.log('');

console.log('Expected Step-Grandparent Relationship:');
console.log('- John is Bob\'s grandfather (Alice\'s father)');
console.log('- Lisa is John\'s current wife');
console.log('- Therefore: Lisa should be Bob\'s STEP-GRANDMOTHER');
console.log('');

console.log('Expected "Unrelated" Relationships:');
console.log('- William should be Unrelated to Bob (Lisa\'s father)');
console.log('- Patricia should be Unrelated to Bob (Lisa\'s mother)');
console.log('');

const bob = allPeople.find(p => p.first_name === 'Bob');
const lisa = allPeople.find(p => p.first_name === 'Lisa');
const william = allPeople.find(p => p.first_name === 'William');
const patricia = allPeople.find(p => p.first_name === 'Patricia');
const john = allPeople.find(p => p.first_name === 'John');
const alice = allPeople.find(p => p.first_name === 'Alice');

console.log('Testing relationships:');

try {
    // Test 1: Lisa → Bob (should be Step-Grandmother)
    const result1 = calculateRelationshipToRoot(lisa, bob, allPeople, relationships);
    console.log(`✓ Lisa → Bob (Bob as root): "${result1}"`);
    
    // Test 2: Bob → Lisa (should be Step-Grandson)
    const result2 = calculateRelationshipToRoot(bob, lisa, allPeople, relationships);
    console.log(`✓ Bob → Lisa (Lisa as root): "${result2}"`);
    
    // Test 3: William → Bob (should be Unrelated)
    const result3 = calculateRelationshipToRoot(william, bob, allPeople, relationships);
    console.log(`✓ William → Bob (Bob as root): "${result3}"`);
    
    // Test 4: Patricia → Bob (should be Unrelated)
    const result4 = calculateRelationshipToRoot(patricia, bob, allPeople, relationships);
    console.log(`✓ Patricia → Bob (Bob as root): "${result4}"`);
    
    // Test 5: John → Bob (should be Grandfather - for verification)
    const result5 = calculateRelationshipToRoot(john, bob, allPeople, relationships);
    console.log(`✓ John → Bob (Bob as root): "${result5}"`);
    
    // Test 6: Alice → Bob (should be Mother - for verification)
    const result6 = calculateRelationshipToRoot(alice, bob, allPeople, relationships);
    console.log(`✓ Alice → Bob (Bob as root): "${result6}"`);
    
    console.log('');
    console.log('Expected vs Actual:');
    console.log(`- Lisa → Bob: Expected "Step-Grandmother", Got "${result1}"`);
    console.log(`- Bob → Lisa: Expected "Step-Grandson", Got "${result2}"`);
    console.log(`- William → Bob: Expected "Unrelated", Got "${result3}"`);
    console.log(`- Patricia → Bob: Expected "Unrelated", Got "${result4}"`);
    console.log(`- John → Bob: Expected "Grandfather", Got "${result5}"`);
    console.log(`- Alice → Bob: Expected "Mother", Got "${result6}"`);
    
    console.log('');
    console.log('Analysis:');
    const isStepGrandmother = result1 === 'Step-Grandmother';
    const isStepGrandson = result2 === 'Step-Grandson';
    const isWilliamUnrelated = result3 === 'Unrelated';
    const isPatriciaUnrelated = result4 === 'Unrelated';
    const isJohnGrandfather = result5 === 'Grandfather';
    const isAliceMother = result6 === 'Mother';
    
    console.log(`- Lisa as Step-Grandmother: ${isStepGrandmother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Bob as Step-Grandson: ${isStepGrandson ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- William as Unrelated: ${isWilliamUnrelated ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Patricia as Unrelated: ${isPatriciaUnrelated ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- John as Grandfather: ${isJohnGrandfather ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Alice as Mother: ${isAliceMother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (!isStepGrandmother || !isStepGrandson) {
        console.log('');
        console.log('🔧 ISSUE IDENTIFIED:');
        console.log('The step-grandparent logic needs to be implemented or fixed.');
        console.log('Lisa is John\'s current spouse, and John is Bob\'s grandfather,');
        console.log('so Lisa should be Bob\'s step-grandmother.');
    }
    
    if (isStepGrandmother && isStepGrandson && isWilliamUnrelated && isPatriciaUnrelated) {
        console.log('');
        console.log('🎉 SUCCESS: All step-grandparent relationships are working correctly!');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}