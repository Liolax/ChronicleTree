/**
 * Test how grandparents of step-children are handled
 * In real life, your step-child's grandparents (from their other biological parent) 
 * should typically be "Unrelated" to you, not step-great-grandparents
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Extended family tree to test step-grandparent relationships
const allPeople = [
    // John's parents (Emma's step-great-grandparents through Alice's step-father)
    { id: 20, first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '1945-01-01', is_deceased: false },
    { id: 21, first_name: 'Margaret', last_name: 'Doe', gender: 'Female', date_of_birth: '1947-01-01', is_deceased: false },
    
    // Jane's parents (Michael's maternal grandparents, should be unrelated to Emma)
    { id: 22, first_name: 'William', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01', is_deceased: false },
    { id: 23, first_name: 'Dorothy', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01', is_deceased: false },
    
    // Lisa's parents (Alice's maternal grandparents, Emma's real great-grandparents)
    { id: 24, first_name: 'Charles', last_name: 'Brown', gender: 'Male', date_of_birth: '1952-01-01', is_deceased: false },
    { id: 25, first_name: 'Helen', last_name: 'Brown', gender: 'Female', date_of_birth: '1954-01-01', is_deceased: false },
    
    // Main family
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1975-01-01', is_deceased: false },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '1995-08-15', is_deceased: false },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    { id: 14, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-10', is_deceased: false }
];

// Using correct Rails format
const relationships = [
    // Robert + Margaret → John (John's parents)
    { source: 1, target: 20, type: 'parent', is_ex: false, is_deceased: false },
    { source: 20, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 1, target: 21, type: 'parent', is_ex: false, is_deceased: false },
    { source: 21, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 20, target: 21, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 21, target: 20, type: 'spouse', is_ex: false, is_deceased: false },
    
    // William + Dorothy → Jane (Jane's parents)
    { source: 2, target: 22, type: 'parent', is_ex: false, is_deceased: false },
    { source: 22, target: 2, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 23, type: 'parent', is_ex: false, is_deceased: false },
    { source: 23, target: 2, type: 'child', is_ex: false, is_deceased: false },
    { source: 22, target: 23, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 23, target: 22, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Charles + Helen → Lisa (Lisa's parents)
    { source: 12, target: 24, type: 'parent', is_ex: false, is_deceased: false },
    { source: 24, target: 12, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 25, type: 'parent', is_ex: false, is_deceased: false },
    { source: 25, target: 12, type: 'child', is_ex: false, is_deceased: false },
    { source: 24, target: 25, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 25, target: 24, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Main family relationships
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Michael HAS parents John + Jane
    { source: 13, target: 1, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'child', is_ex: false, is_deceased: false },
    { source: 13, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 13, type: 'child', is_ex: false, is_deceased: false },
    
    // Alice HAS parents John + Lisa
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },
    { source: 3, target: 12, type: 'parent', is_ex: false, is_deceased: false },
    { source: 12, target: 3, type: 'child', is_ex: false, is_deceased: false },
    
    // Emma HAS parent Alice
    { source: 14, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 14, type: 'child', is_ex: false, is_deceased: false }
];

console.log('=== TESTING STEP-GRANDPARENT RELATIONSHIPS ===');
console.log('');

console.log('Family Structure:');
console.log('- Robert + Margaret → John');
console.log('- William + Dorothy → Jane (deceased)');
console.log('- Charles + Helen → Lisa');
console.log('- John + Jane → Michael');
console.log('- John + Lisa → Alice');
console.log('- Alice → Emma');
console.log('');

console.log('Relationship Questions:');
console.log('1. What is William (Jane\'s father) to Emma?');
console.log('   - William is Michael\'s grandfather');
console.log('   - Michael is Alice\'s step-brother');
console.log('   - Alice is Emma\'s mother');
console.log('   - So William should be "Unrelated" to Emma (not step-great-grandfather)');
console.log('');

console.log('2. What is Robert (John\'s father) to Emma?');
console.log('   - Robert is John\'s father');
console.log('   - John is Alice\'s father');
console.log('   - Alice is Emma\'s mother');
console.log('   - So Robert should be Emma\'s "Great-Grandfather"');
console.log('');

const emma = allPeople.find(p => p.first_name === 'Emma');
const william = allPeople.find(p => p.first_name === 'William'); // Jane's father
const robert = allPeople.find(p => p.first_name === 'Robert');   // John's father
const charles = allPeople.find(p => p.first_name === 'Charles'); // Lisa's father

console.log('Testing relationships:');

try {
    // Test 1: William → Emma (should be Unrelated)
    const result1 = calculateRelationshipToRoot(william, emma, allPeople, relationships);
    console.log(`✓ William → Emma (Emma as root): "${result1}"`);
    
    // Test 2: Robert → Emma (should be Great-Grandfather)
    const result2 = calculateRelationshipToRoot(robert, emma, allPeople, relationships);
    console.log(`✓ Robert → Emma (Emma as root): "${result2}"`);
    
    // Test 3: Charles → Emma (should be Great-Grandfather)
    const result3 = calculateRelationshipToRoot(charles, emma, allPeople, relationships);
    console.log(`✓ Charles → Emma (Emma as root): "${result3}"`);
    
    console.log('');
    console.log('Expected Results:');
    console.log('- William → Emma: Should be "Unrelated" (step-child\'s biological grandparent)');  
    console.log('- Robert → Emma: Should be "Great-Grandfather" (biological paternal great-grandfather)');
    console.log('- Charles → Emma: Should be "Great-Grandfather" (biological maternal great-grandfather)');
    
    console.log('');
    console.log('Analysis:');
    const isWilliamUnrelated = result1 === 'Unrelated';
    const isRobertGreatGrandfather = result2 === 'Great-Grandfather';
    const isCharlesGreatGrandfather = result3 === 'Great-Grandfather';
    
    console.log(`- William (step-child's grandfather): ${isWilliamUnrelated ? '✅ CORRECT' : '❌ INCORRECT'} ("${result1}")`);
    console.log(`- Robert (paternal great-grandfather): ${isRobertGreatGrandfather ? '✅ CORRECT' : '❌ INCORRECT'} ("${result2}")`);
    console.log(`- Charles (maternal great-grandfather): ${isCharlesGreatGrandfather ? '✅ CORRECT' : '❌ INCORRECT'} ("${result3}")`);
    
    if (isWilliamUnrelated && isRobertGreatGrandfather && isCharlesGreatGrandfather) {
        console.log('');
        console.log('🎉 SUCCESS: Step-grandparent logic is working correctly!');
        console.log('Step-children\'s biological grandparents are properly marked as Unrelated.');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Step-grandparent relationships need adjustment');
        if (!isWilliamUnrelated) {
            console.log('  - William should be Unrelated to Emma (he\'s Michael\'s biological grandfather, but Michael is Emma\'s step-uncle)');
        }
        if (!isRobertGreatGrandfather) {
            console.log('  - Robert should be Emma\'s Great-Grandfather (direct biological line)');
        }
        if (!isCharlesGreatGrandfather) {
            console.log('  - Charles should be Emma\'s Great-Grandfather (direct biological line)');
        }
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}