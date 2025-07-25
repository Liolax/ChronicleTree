/**
 * Test "once removed" logic for uncle/aunt relationships
 * 
 * "Once removed" means there's a one-generation difference between you and your relative:
 * - Your parent's cousin is your "1st cousin once removed"
 * - Your cousin's child is your "1st cousin once removed" 
 * - Your great-uncle's child is your "uncle once removed" or "1st cousin once removed"
 * - Your uncle's grandchild is your "nephew/niece once removed"
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create family tree to test once removed relationships
const allPeople = [
    // Generation 1: Great-grandparents
    { id: 40, first_name: 'George', last_name: 'Wilson', gender: 'Male', date_of_birth: '1920-01-01', is_deceased: false },
    { id: 41, first_name: 'Helen', last_name: 'Wilson', gender: 'Female', date_of_birth: '1922-01-01', is_deceased: false },
    
    // Generation 2: Grandparents (siblings)
    { id: 20, first_name: 'Robert', last_name: 'Wilson', gender: 'Male', date_of_birth: '1945-01-01', is_deceased: false },
    { id: 21, first_name: 'Margaret', last_name: 'Wilson', gender: 'Female', date_of_birth: '1947-01-01', is_deceased: false },
    { id: 42, first_name: 'David', last_name: 'Wilson', gender: 'Male', date_of_birth: '1947-01-01', is_deceased: false }, // Robert's brother
    { id: 43, first_name: 'Sarah', last_name: 'Wilson', gender: 'Female', date_of_birth: '1950-01-01', is_deceased: false },
    
    // Generation 3: Parents  
    { id: 1, first_name: 'John', last_name: 'Wilson', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false }, // Robert's son
    { id: 2, first_name: 'Lisa', last_name: 'Wilson', gender: 'Female', date_of_birth: '1972-01-01', is_deceased: false },
    { id: 44, first_name: 'Michael', last_name: 'Wilson', gender: 'Male', date_of_birth: '1972-01-01', is_deceased: false }, // David's son
    { id: 45, first_name: 'Jennifer', last_name: 'Wilson', gender: 'Female', date_of_birth: '1974-01-01', is_deceased: false },
    
    // Generation 4: Children (focus of testing)
    { id: 3, first_name: 'Alice', last_name: 'Wilson', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false }, // John's daughter
    { id: 46, first_name: 'Tom', last_name: 'Wilson', gender: 'Male', date_of_birth: '1995-08-15', is_deceased: false }, // Michael's son
    
    // Generation 5: Grandchildren
    { id: 47, first_name: 'Sophie', last_name: 'Wilson', gender: 'Female', date_of_birth: '2020-03-10', is_deceased: false } // Tom's daughter
];

// Using correct Rails format
const relationships = [
    // George + Helen → Robert, David (siblings)
    { source: 20, target: 40, type: 'parent', is_ex: false, is_deceased: false },
    { source: 40, target: 20, type: 'child', is_ex: false, is_deceased: false },
    { source: 20, target: 41, type: 'parent', is_ex: false, is_deceased: false },
    { source: 41, target: 20, type: 'child', is_ex: false, is_deceased: false },
    
    { source: 42, target: 40, type: 'parent', is_ex: false, is_deceased: false },
    { source: 40, target: 42, type: 'child', is_ex: false, is_deceased: false },
    { source: 42, target: 41, type: 'parent', is_ex: false, is_deceased: false },
    { source: 41, target: 42, type: 'child', is_ex: false, is_deceased: false },
    
    // Great-grandparent marriage
    { source: 40, target: 41, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 41, target: 40, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Generation 2 marriages
    { source: 20, target: 21, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 21, target: 20, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 42, target: 43, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 43, target: 42, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Robert + Margaret → John
    { source: 1, target: 20, type: 'parent', is_ex: false, is_deceased: false },
    { source: 20, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 1, target: 21, type: 'parent', is_ex: false, is_deceased: false },
    { source: 21, target: 1, type: 'child', is_ex: false, is_deceased: false },
    
    // David + Sarah → Michael
    { source: 44, target: 42, type: 'parent', is_ex: false, is_deceased: false },
    { source: 42, target: 44, type: 'child', is_ex: false, is_deceased: false },
    { source: 44, target: 43, type: 'parent', is_ex: false, is_deceased: false },
    { source: 43, target: 44, type: 'child', is_ex: false, is_deceased: false },
    
    // Generation 3 marriages
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 44, target: 45, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 45, target: 44, type: 'spouse', is_ex: false, is_deceased: false },
    
    // John + Lisa → Alice
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },
    { source: 3, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 3, type: 'child', is_ex: false, is_deceased: false },
    
    // Michael + Jennifer → Tom
    { source: 46, target: 44, type: 'parent', is_ex: false, is_deceased: false },
    { source: 44, target: 46, type: 'child', is_ex: false, is_deceased: false },
    { source: 46, target: 45, type: 'parent', is_ex: false, is_deceased: false },
    { source: 45, target: 46, type: 'child', is_ex: false, is_deceased: false },
    
    // Tom → Sophie
    { source: 47, target: 46, type: 'parent', is_ex: false, is_deceased: false },
    { source: 46, target: 47, type: 'child', is_ex: false, is_deceased: false },
    
    // Sibling relationships (crucial for once removed detection)
    { source: 20, target: 42, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 42, target: 20, type: 'sibling', is_ex: false, is_deceased: false }
];

console.log('=== TESTING ONCE REMOVED LOGIC FOR UNCLE/AUNT RELATIONSHIPS ===');
console.log('');

console.log('Family Structure:');
console.log('Generation 1: George + Helen');
console.log('Generation 2: Robert + Margaret, David + Sarah (brothers)');  
console.log('Generation 3: John (Robert\'s son), Michael (David\'s son) - 1st cousins');
console.log('Generation 4: Alice (John\'s daughter), Tom (Michael\'s son) - 2nd cousins');
console.log('Generation 5: Sophie (Tom\'s daughter)');
console.log('');

console.log('Expected "Once Removed" Relationships:');
console.log('- David should be Alice\'s "Great-Uncle" (Alice\'s grandfather\'s brother)');
console.log('- Michael should be Alice\'s "Uncle once removed" (Alice\'s father\'s cousin)');
console.log('- Alice should be Michael\'s "Niece once removed" (Michael\'s cousin\'s daughter)');
console.log('- Tom should be Alice\'s "2nd Cousin" (Alice and Tom\'s parents are 1st cousins)');
console.log('- Sophie should be Alice\'s "2nd Cousin once removed" (Alice\'s 2nd cousin\'s daughter)');
console.log('');

const alice = allPeople.find(p => p.first_name === 'Alice');
const david = allPeople.find(p => p.first_name === 'David');
const michael = allPeople.find(p => p.first_name === 'Michael');
const tom = allPeople.find(p => p.first_name === 'Tom');
const sophie = allPeople.find(p => p.first_name === 'Sophie');

console.log('Testing relationships:');

try {
    // Test 1: David → Alice (should be Great-Uncle)
    const result1 = calculateRelationshipToRoot(david, alice, allPeople, relationships);
    console.log(`✓ David → Alice (Alice as root): "${result1}"`);
    
    // Test 2: Michael → Alice (should be Uncle once removed or 1st Cousin once removed)
    const result2 = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`✓ Michael → Alice (Alice as root): "${result2}"`);
    
    // Test 3: Alice → Michael (should be Niece once removed or 1st Cousin once removed)
    const result3 = calculateRelationshipToRoot(alice, michael, allPeople, relationships);
    console.log(`✓ Alice → Michael (Michael as root): "${result3}"`);
    
    // Test 4: Tom → Alice (should be 2nd Cousin)
    const result4 = calculateRelationshipToRoot(tom, alice, allPeople, relationships);
    console.log(`✓ Tom → Alice (Alice as root): "${result4}"`);
    
    // Test 5: Sophie → Alice (should be 2nd Cousin once removed)
    const result5 = calculateRelationshipToRoot(sophie, alice, allPeople, relationships);
    console.log(`✓ Sophie → Alice (Alice as root): "${result5}"`);
    
    console.log('');
    console.log('Expected vs Actual:');
    console.log(`- David → Alice: Expected "Great-Uncle", Got "${result1}"`);
    console.log(`- Michael → Alice: Expected "Uncle once removed" or "1st Cousin once removed", Got "${result2}"`);
    console.log(`- Alice → Michael: Expected "Niece once removed" or "1st Cousin once removed", Got "${result3}"`);
    console.log(`- Tom → Alice: Expected "2nd Cousin", Got "${result4}"`);
    console.log(`- Sophie → Alice: Expected "2nd Cousin once removed", Got "${result5}"`);
    
    console.log('');
    console.log('Analysis:');
    const hasGreatUncle = result1 === 'Great-Uncle';
    const hasOnceRemoved2 = result2.includes('once removed') || result2.includes('1 time removed');
    const hasOnceRemoved3 = result3.includes('once removed') || result3.includes('1 time removed');
    const has2ndCousin = result4 === '2nd Cousin';
    const has2ndCousinOnceRemoved = result5.includes('2nd Cousin') && (result5.includes('once removed') || result5.includes('1 time removed'));
    
    console.log(`- Great-Uncle relationship: ${hasGreatUncle ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- Once removed logic (Michael-Alice): ${hasOnceRemoved2 ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- Once removed logic (Alice-Michael): ${hasOnceRemoved3 ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- 2nd Cousin relationship: ${has2ndCousin ? '✅ WORKING' : '❌ MISSING'}`);
    console.log(`- 2nd Cousin once removed: ${has2ndCousinOnceRemoved ? '✅ WORKING' : '❌ MISSING'}`);
    
    if (hasOnceRemoved2 && hasOnceRemoved3 && has2ndCousinOnceRemoved) {
        console.log('');
        console.log('🎉 SUCCESS: Once removed logic is working correctly!');
    } else {
        console.log('');
        console.log('⚠️ TODO: Need to implement or improve once removed logic');
        console.log('Once removed means there\'s a one-generation difference in the relationship.');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}