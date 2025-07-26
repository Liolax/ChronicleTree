/**
 * Test William O'Sullivan and Bob Anderson step-great-grandparent relationship
 * William should be Bob's Step-Great-Grandfather (step-grandmother's father)
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create test data based on the actual family structure
const allPeople = [
    // John Doe (Bob's grandfather, Lisa's husband)
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    
    // Jane Doe (John's deceased first wife)
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    
    // Lisa Doe (John's current wife, Bob's step-grandmother)
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    
    // Alice Doe (John + Jane's daughter, Bob's mother)
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', is_deceased: false },
    
    // David Anderson (Bob's father)
    { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1992-01-01', is_deceased: false },
    
    // Bob Anderson (the root person we're testing)
    { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2015-01-01', is_deceased: false },
    
    // William O'Sullivan (Lisa's father, should be Bob's step-great-grandfather)
    { id: 15, first_name: 'William', last_name: "O'Sullivan", gender: 'Male', date_of_birth: '1965-01-01', is_deceased: false },
    
    // Patricia Smith (Lisa's mother, should be Bob's step-great-grandmother)
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
    { source: 16, target: 12, type: 'child', is_ex: false, is_deceased: false },  // Patricia HAS child Lisa
    
    // William and Patricia are married
    { source: 15, target: 16, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 16, target: 15, type: 'spouse', is_ex: false, is_deceased: false }
];

console.log('=== TESTING WILLIAM O\'SULLIVAN AND BOB ANDERSON STEP-GREAT-GRANDPARENT RELATIONSHIP ===');
console.log('');

console.log('Family Structure:');
console.log('- John + Jane → Alice');
console.log('- Alice + David → Bob Anderson');
console.log('- John + Lisa (current marriage)');
console.log('- William + Patricia → Lisa');
console.log('');

console.log('Expected Step-Great-Grandparent Relationship Logic:');
console.log('1. John is Bob\'s grandfather (Alice\'s father)');
console.log('2. Lisa is John\'s current wife (Bob\'s step-grandmother)');
console.log('3. William is Lisa\'s father');
console.log('4. Therefore: William should be Bob\'s STEP-GREAT-GRANDFATHER');
console.log('5. Similarly: Patricia should be Bob\'s STEP-GREAT-GRANDMOTHER');
console.log('');

const bob = allPeople.find(p => p.first_name === 'Bob');
const lisa = allPeople.find(p => p.first_name === 'Lisa');
const william = allPeople.find(p => p.first_name === 'William');
const patricia = allPeople.find(p => p.first_name === 'Patricia');
const john = allPeople.find(p => p.first_name === 'John');
const alice = allPeople.find(p => p.first_name === 'Alice');

console.log('Testing relationships:');

try {
    // Test 1: William → Bob (should be Step-Great-Grandfather)
    const result1 = calculateRelationshipToRoot(william, bob, allPeople, relationships);
    console.log(`✓ William → Bob (Bob as root): "${result1}"`);
    
    // Test 2: Patricia → Bob (should be Step-Great-Grandmother)
    const result2 = calculateRelationshipToRoot(patricia, bob, allPeople, relationships);
    console.log(`✓ Patricia → Bob (Bob as root): "${result2}"`);
    
    // Test 3: Bob → William (should be Step-Great-Grandson)
    const result3 = calculateRelationshipToRoot(bob, william, allPeople, relationships);
    console.log(`✓ Bob → William (William as root): "${result3}"`);
    
    // Test 4: Bob → Patricia (should be Step-Great-Grandson)
    const result4 = calculateRelationshipToRoot(bob, patricia, allPeople, relationships);
    console.log(`✓ Bob → Patricia (Patricia as root): "${result4}"`);
    
    // Verification tests - these should remain unchanged
    const result5 = calculateRelationshipToRoot(lisa, bob, allPeople, relationships);
    const result6 = calculateRelationshipToRoot(john, bob, allPeople, relationships);
    const result7 = calculateRelationshipToRoot(alice, bob, allPeople, relationships);
    console.log(`✓ Lisa → Bob (Bob as root): "${result5}"`);
    console.log(`✓ John → Bob (Bob as root): "${result6}"`);
    console.log(`✓ Alice → Bob (Bob as root): "${result7}"`);
    
    console.log('');
    console.log('Expected vs Actual:');
    console.log(`- William → Bob: Expected "Step-Great-Grandfather", Got "${result1}"`);
    console.log(`- Patricia → Bob: Expected "Step-Great-Grandmother", Got "${result2}"`);
    console.log(`- Bob → William: Expected "Step-Great-Grandson", Got "${result3}"`);
    console.log(`- Bob → Patricia: Expected "Step-Great-Grandson", Got "${result4}"`);
    console.log(`- Lisa → Bob: Expected "Step-Grandmother", Got "${result5}"`);
    console.log(`- John → Bob: Expected "Grandfather", Got "${result6}"`);
    console.log(`- Alice → Bob: Expected "Mother", Got "${result7}"`);
    
    console.log('');
    console.log('Analysis:');
    const isWilliamStepGreatGrandfather = result1 === 'Step-Great-Grandfather';
    const isPatriciaStepGreatGrandmother = result2 === 'Step-Great-Grandmother';
    const isBobStepGreatGrandson1 = result3 === 'Step-Great-Grandson';
    const isBobStepGreatGrandson2 = result4 === 'Step-Great-Grandson';
    const isLisaStepGrandmother = result5 === 'Step-Grandmother';
    const isJohnGrandfather = result6 === 'Grandfather';
    const isAliceMother = result7 === 'Mother';
    
    console.log(`- William as Step-Great-Grandfather: ${isWilliamStepGreatGrandfather ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Patricia as Step-Great-Grandmother: ${isPatriciaStepGreatGrandmother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Bob as Step-Great-Grandson (to William): ${isBobStepGreatGrandson1 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Bob as Step-Great-Grandson (to Patricia): ${isBobStepGreatGrandson2 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Lisa as Step-Grandmother: ${isLisaStepGrandmother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- John as Grandfather: ${isJohnGrandfather ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`- Alice as Mother: ${isAliceMother ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (isWilliamStepGreatGrandfather && isPatriciaStepGreatGrandmother && isBobStepGreatGrandson1 && isBobStepGreatGrandson2) {
        console.log('');
        console.log('🎉 SUCCESS: Step-great-grandparent relationships are working correctly!');
        console.log('William O\'Sullivan now correctly shows as Bob Anderson\'s Step-Great-Grandfather.');
    } else {
        console.log('');
        console.log('🔧 ISSUE: Step-great-grandparent relationships need further implementation.');
        console.log('William should be Bob\'s Step-Great-Grandfather because:');
        console.log('- William is Lisa\'s father');
        console.log('- Lisa is Bob\'s step-grandmother (John\'s current wife)');
        console.log('- Therefore: William = Bob\'s step-grandmother\'s father = Bob\'s step-great-grandfather');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}