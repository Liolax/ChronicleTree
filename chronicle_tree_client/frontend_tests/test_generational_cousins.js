/**
 * Test generational cousin relationships (1st, 2nd, 3rd cousins, etc.)
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create a multi-generational family tree for testing cousins
const allPeople = [
    // Great-grandparents (Generation 1)
    { id: 1, first_name: 'James', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01', is_deceased: false },
    { id: 2, first_name: 'Mary', last_name: 'Smith', gender: 'Female', date_of_birth: '1922-01-01', is_deceased: false },
    { id: 3, first_name: 'Robert', last_name: 'Jones', gender: 'Male', date_of_birth: '1921-01-01', is_deceased: false },
    { id: 4, first_name: 'Linda', last_name: 'Jones', gender: 'Female', date_of_birth: '1923-01-01', is_deceased: false },
    
    // Grandparents (Generation 2) - siblings
    { id: 5, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1945-01-01', is_deceased: false },
    { id: 6, first_name: 'Susan', last_name: 'Smith', gender: 'Female', date_of_birth: '1947-01-01', is_deceased: false },
    { id: 7, first_name: 'Michael', last_name: 'Smith', gender: 'Male', date_of_birth: '1949-01-01', is_deceased: false }, // Brother of John
    { id: 8, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1951-01-01', is_deceased: false },
    
    // Parents (Generation 3)
    { id: 9, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false }, // John's son
    { id: 10, first_name: 'Sarah', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01', is_deceased: false },
    { id: 11, first_name: 'Mark', last_name: 'Smith', gender: 'Male', date_of_birth: '1971-01-01', is_deceased: false }, // Michael's son
    { id: 12, first_name: 'Lisa', last_name: 'Smith', gender: 'Female', date_of_birth: '1973-01-01', is_deceased: false },
    
    // Children (Generation 4) - Testing subjects
    { id: 13, first_name: 'Alice', last_name: 'Smith', gender: 'Female', date_of_birth: '2000-01-01', is_deceased: false }, // David's daughter
    { id: 14, first_name: 'Bob', last_name: 'Smith', gender: 'Male', date_of_birth: '2001-01-01', is_deceased: false }, // Mark's son
];

const relationships = [
    // Great-grandparent generation marriages
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 3, target: 4, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 4, target: 3, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Great-grandparent → Grandparent relationships
    { source: 1, target: 5, type: 'parent', is_ex: false, is_deceased: false },
    { source: 5, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 5, type: 'parent', is_ex: false, is_deceased: false },
    { source: 5, target: 2, type: 'child', is_ex: false, is_deceased: false },
    
    { source: 1, target: 7, type: 'parent', is_ex: false, is_deceased: false },
    { source: 7, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 7, type: 'parent', is_ex: false, is_deceased: false },
    { source: 7, target: 2, type: 'child', is_ex: false, is_deceased: false },
    
    // Grandparent generation marriages
    { source: 5, target: 6, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 6, target: 5, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 7, target: 8, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 8, target: 7, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Grandparent → Parent relationships
    { source: 5, target: 9, type: 'parent', is_ex: false, is_deceased: false },
    { source: 9, target: 5, type: 'child', is_ex: false, is_deceased: false },
    { source: 6, target: 9, type: 'parent', is_ex: false, is_deceased: false },
    { source: 9, target: 6, type: 'child', is_ex: false, is_deceased: false },
    
    { source: 7, target: 11, type: 'parent', is_ex: false, is_deceased: false },
    { source: 11, target: 7, type: 'child', is_ex: false, is_deceased: false },
    { source: 8, target: 11, type: 'parent', is_ex: false, is_deceased: false },
    { source: 11, target: 8, type: 'child', is_ex: false, is_deceased: false },
    
    // Parent generation marriages
    { source: 9, target: 10, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 10, target: 9, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 11, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 11, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Parent → Child relationships
    { source: 9, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 9, type: 'child', is_ex: false, is_deceased: false },
    { source: 10, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 10, type: 'child', is_ex: false, is_deceased: false },
    
    { source: 11, target: 14, type: 'parent', is_ex: false, is_deceased: false },
    { source: 14, target: 11, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 14, type: 'parent', is_ex: false, is_deceased: false },
    { source: 14, target: 12, type: 'child', is_ex: false, is_deceased: false },
    
    // Sibling relationships (crucial for cousin detection)
    { source: 5, target: 7, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 7, target: 5, type: 'sibling', is_ex: false, is_deceased: false },
];

console.log('=== TESTING GENERATIONAL COUSIN RELATIONSHIPS ===');
console.log('');

console.log('Family Structure:');
console.log('Generation 1: James & Mary Smith (great-grandparents)');
console.log('Generation 2: John Smith & Michael Smith (brothers, grandparents)');
console.log('Generation 3: David Smith (John\'s son) & Mark Smith (Michael\'s son)');
console.log('Generation 4: Alice Smith (David\'s daughter) & Bob Smith (Mark\'s son)');
console.log('');

console.log('Expected Relationship:');
console.log('- Alice and Bob should be 2nd cousins');
console.log('- Their parents (David & Mark) are 1st cousins');
console.log('- Their grandparents (John & Michael) are brothers');
console.log('');

const alice = allPeople.find(p => p.first_name === 'Alice');
const bob = allPeople.find(p => p.first_name === 'Bob');

console.log('Testing cousin relationships:');

try {
    // Test both directions
    const result1 = calculateRelationshipToRoot(bob, alice, allPeople, relationships);
    console.log(`✓ Bob → Alice: "${result1}"`);
    
    const result2 = calculateRelationshipToRoot(alice, bob, allPeople, relationships);
    console.log(`✓ Alice → Bob: "${result2}"`);
    
    // Also test the parents (should be 1st cousins)
    const david = allPeople.find(p => p.first_name === 'David');
    const mark = allPeople.find(p => p.first_name === 'Mark');
    
    const result3 = calculateRelationshipToRoot(mark, david, allPeople, relationships);
    console.log(`✓ Mark → David: "${result3}"`);
    
    const result4 = calculateRelationshipToRoot(david, mark, allPeople, relationships);
    console.log(`✓ David → Mark: "${result4}"`);
    
    console.log('');
    console.log('Results Analysis:');
    
    const isAliceBob2ndCousin = result1 === '2nd Cousin' || result2 === '2nd Cousin';
    const isDavidMark1stCousin = result3 === '1st Cousin' || result4 === '1st Cousin';
    
    console.log(`- Alice ↔ Bob (2nd cousins): ${isAliceBob2ndCousin ? '✅ CORRECT' : '❌ INCORRECT'} ("${result1}" / "${result2}")`);
    console.log(`- David ↔ Mark (1st cousins): ${isDavidMark1stCousin ? '✅ CORRECT' : '❌ INCORRECT'} ("${result3}" / "${result4}")`);
    
    if (isAliceBob2ndCousin && isDavidMark1stCousin) {
        console.log('');
        console.log('🎉 SUCCESS: Generational cousin relationships are working!');
        console.log('The loop-based cousin detection system can handle multi-generational relationships.');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Generational cousin detection needs refinement');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}