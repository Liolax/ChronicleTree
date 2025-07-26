/**
 * Test great-uncle/aunt and great-niece/nephew relationships
 * These are relationships between a person and their grandparent's sibling,
 * or between a person and their sibling's grandchild
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create extended family tree to test great-uncle/aunt relationships
const allPeople = [
    // Great-grandparents (Generation 1)
    { id: 30, first_name: 'James', last_name: 'Smith', gender: 'Male', date_of_birth: '1920-01-01', is_deceased: false },
    { id: 31, first_name: 'Mary', last_name: 'Smith', gender: 'Female', date_of_birth: '1922-01-01', is_deceased: false },
    
    // Generation 2: Siblings (Robert and his brother Thomas)
    { id: 20, first_name: 'Robert', last_name: 'Smith', gender: 'Male', date_of_birth: '1945-01-01', is_deceased: false },
    { id: 21, first_name: 'Margaret', last_name: 'Smith', gender: 'Female', date_of_birth: '1947-01-01', is_deceased: false },
    { id: 32, first_name: 'Thomas', last_name: 'Smith', gender: 'Male', date_of_birth: '1947-01-01', is_deceased: false }, // Robert's brother
    { id: 33, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01', is_deceased: false },
    
    // Generation 3: Children
    { id: 1, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false }, // Robert's son
    { id: 34, first_name: 'Frank', last_name: 'Smith', gender: 'Male', date_of_birth: '1972-01-01', is_deceased: false }, // Thomas's son
    
    // Generation 4: Grandchildren
    { id: 3, first_name: 'Alice', last_name: 'Smith', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false }, // John's daughter
    
    // Generation 5: Great-grandchildren
    { id: 14, first_name: 'Emma', last_name: 'Smith', gender: 'Female', date_of_birth: '2020-03-10', is_deceased: false } // Alice's daughter
];

// Using correct Rails format
const relationships = [
    // James + Mary → Robert, Thomas (siblings)
    { source: 20, target: 30, type: 'parent', is_ex: false, is_deceased: false },
    { source: 30, target: 20, type: 'child', is_ex: false, is_deceased: false },
    { source: 20, target: 31, type: 'parent', is_ex: false, is_deceased: false },
    { source: 31, target: 20, type: 'child', is_ex: false, is_deceased: false },
    
    { source: 32, target: 30, type: 'parent', is_ex: false, is_deceased: false },
    { source: 30, target: 32, type: 'child', is_ex: false, is_deceased: false },
    { source: 32, target: 31, type: 'parent', is_ex: false, is_deceased: false },
    { source: 31, target: 32, type: 'child', is_ex: false, is_deceased: false },
    
    // Great-grandparent marriages
    { source: 30, target: 31, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 31, target: 30, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Generation 2 marriages
    { source: 20, target: 21, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 21, target: 20, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 32, target: 33, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 33, target: 32, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Robert + Margaret → John
    { source: 1, target: 20, type: 'parent', is_ex: false, is_deceased: false },
    { source: 20, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 1, target: 21, type: 'parent', is_ex: false, is_deceased: false },
    { source: 21, target: 1, type: 'child', is_ex: false, is_deceased: false },
    
    // Thomas + Patricia → Frank
    { source: 34, target: 32, type: 'parent', is_ex: false, is_deceased: false },
    { source: 32, target: 34, type: 'child', is_ex: false, is_deceased: false },
    { source: 34, target: 33, type: 'parent', is_ex: false, is_deceased: false },
    { source: 33, target: 34, type: 'child', is_ex: false, is_deceased: false },
    
    // John → Alice
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },
    
    // Alice → Emma
    { source: 14, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 14, type: 'child', is_ex: false, is_deceased: false },
    
    // Sibling relationships (crucial for great-uncle/aunt detection)
    { source: 20, target: 32, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 32, target: 20, type: 'sibling', is_ex: false, is_deceased: false }
];

console.log('=== TESTING GREAT-UNCLE/AUNT AND GREAT-NIECE/NEPHEW RELATIONSHIPS ===');
console.log('');

console.log('Family Structure:');
console.log('Generation 1: James + Mary (great-great-grandparents)');
console.log('Generation 2: Robert + Margaret, Thomas + Patricia (great-grandparents, siblings)');
console.log('Generation 3: John (Robert\'s son), Frank (Thomas\'s son) - 1st cousins');
console.log('Generation 4: Alice (John\'s daughter)');
console.log('Generation 5: Emma (Alice\'s daughter)');
console.log('');

console.log('Expected Relationships:');
console.log('- Thomas should be Alice\'s Great-Uncle (Alice\'s grandfather\'s brother)');
console.log('- Alice should be Thomas\'s Great-Niece (Thomas\'s brother\'s granddaughter)');
console.log('- Thomas should be Emma\'s Great-Great-Uncle (Emma\'s great-grandfather\'s brother)');
console.log('- Emma should be Thomas\'s Great-Great-Niece (Thomas\'s brother\'s great-granddaughter)');
console.log('');

const alice = allPeople.find(p => p.first_name === 'Alice');
const emma = allPeople.find(p => p.first_name === 'Emma');
const thomas = allPeople.find(p => p.first_name === 'Thomas');
const frank = allPeople.find(p => p.first_name === 'Frank');

console.log('Testing relationships:');

try {
    // Test 1: Thomas → Alice (should be Great-Uncle)
    const result1 = calculateRelationshipToRoot(thomas, alice, allPeople, relationships);
    console.log(`✓ Thomas → Alice (Alice as root): "${result1}"`);
    
    // Test 2: Alice → Thomas (should be Great-Niece)
    const result2 = calculateRelationshipToRoot(alice, thomas, allPeople, relationships);
    console.log(`✓ Alice → Thomas (Thomas as root): "${result2}"`);
    
    // Test 3: Thomas → Emma (should be Great-Great-Uncle)
    const result3 = calculateRelationshipToRoot(thomas, emma, allPeople, relationships);
    console.log(`✓ Thomas → Emma (Emma as root): "${result3}"`);
    
    // Test 4: Emma → Thomas (should be Great-Great-Niece)
    const result4 = calculateRelationshipToRoot(emma, thomas, allPeople, relationships);
    console.log(`✓ Emma → Thomas (Thomas as root): "${result4}"`);
    
    // Test 5: Alice → Frank (should be 2nd Cousin - John and Frank are 1st cousins)
    const result5 = calculateRelationshipToRoot(frank, alice, allPeople, relationships);
    console.log(`✓ Frank → Alice (Alice as root): "${result5}"`);
    
    console.log('');
    console.log('Expected vs Actual:');
    console.log(`- Thomas → Alice: Expected "Great-Uncle", Got "${result1}"`);
    console.log(`- Alice → Thomas: Expected "Great-Niece", Got "${result2}"`);
    console.log(`- Thomas → Emma: Expected "Great-Great-Uncle", Got "${result3}"`);
    console.log(`- Emma → Thomas: Expected "Great-Great-Niece", Got "${result4}"`);
    console.log(`- Frank → Alice: Expected "2nd Cousin", Got "${result5}"`);
    
    console.log('');
    console.log('Analysis:');
    const hasGreatUncle = result1 === 'Great-Uncle';
    const hasGreatNiece = result2 === 'Great-Niece';
    const hasGreatGreatUncle = result3 === 'Great-Great-Uncle';
    const hasGreatGreatNiece = result4 === 'Great-Great-Niece';
    const has2ndCousin = result5 === '2nd Cousin';
    
    console.log(`- Great-Uncle relationship: ${hasGreatUncle ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- Great-Niece relationship: ${hasGreatNiece ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- Great-Great-Uncle relationship: ${hasGreatGreatUncle ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- Great-Great-Niece relationship: ${hasGreatGreatNiece ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- 2nd Cousin relationship: ${has2ndCousin ? '✅ WORKING' : '❌ MISSING'}`);
    
    if (hasGreatUncle && hasGreatNiece && hasGreatGreatUncle && hasGreatGreatNiece) {
        console.log('');
        console.log('🎉 SUCCESS: Great-uncle/aunt and great-niece/nephew relationships are implemented!');
    } else {
        console.log('');
        console.log('⚠️ TODO: Need to implement great-uncle/aunt and great-niece/nephew relationships');
        console.log('These relationships involve grandparents\' siblings and siblings\' grandchildren.');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}