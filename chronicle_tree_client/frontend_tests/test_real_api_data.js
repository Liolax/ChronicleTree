/**
 * Test Emily Anderson and Michael Doe relationship using the EXACT API data
 * This should reveal why Emily sees Michael as Uncle instead of Step-Uncle
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Using the EXACT data structure returned by the Rails API for Emily's tree
const allPeople = [
    { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female' },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female' },
    { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male' },
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
    { id: 10, first_name: 'Sarah', last_name: 'Anderson', gender: 'Female' },
    { id: 11, first_name: 'Thomas', last_name: 'Anderson', gender: 'Male' },
    { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male' },
    { id: 8, first_name: 'Molly', last_name: 'Doe', gender: 'Female' },
    { id: 9, first_name: 'Robert', last_name: 'Doe', gender: 'Male' },
    { id: 17, first_name: 'Richard', last_name: 'Sharma', gender: 'Male' },
    { id: 18, first_name: 'Margaret', last_name: 'Sharma', gender: 'Female' },
    { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male' },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male' },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female' },
    { id: 14, first_name: 'Emma', last_name: 'Doe', gender: 'Female' },
    { id: 15, first_name: 'William', last_name: "O'Sullivan", gender: 'Male' },
    { id: 16, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' }
];

// Convert the Rails API edges format to the format expected by the relationship calculator
const relationships = [
    // parent relationships
    { source: 3, target: 6, type: 'parent', is_ex: false, is_deceased: false },
    { source: 4, target: 6, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 5, type: 'parent', is_ex: false, is_deceased: false },
    { source: 4, target: 5, type: 'parent', is_ex: false, is_deceased: false },
    { source: 10, target: 4, type: 'parent', is_ex: false, is_deceased: false },
    { source: 11, target: 4, type: 'parent', is_ex: false, is_deceased: false },
    { source: 8, target: 1, type: 'parent', is_ex: false, is_deceased: false },
    { source: 9, target: 1, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 7, type: 'parent', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 17, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 18, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 7, type: 'parent', is_ex: false, is_deceased: false },
    { source: 7, target: 14, type: 'parent', is_ex: false, is_deceased: false },
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 15, target: 12, type: 'parent', is_ex: false, is_deceased: false },
    { source: 16, target: 12, type: 'parent', is_ex: false, is_deceased: false },

    // spouse relationships  
    { source: 3, target: 4, type: 'spouse', is_ex: true, is_deceased: false },
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 10, target: 11, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 8, target: 9, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 17, target: 18, type: 'spouse', is_ex: false, is_deceased: false },

    // sibling relationships (THESE MIGHT BE THE PROBLEM!)
    { source: 6, target: 10, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 6, target: 11, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 3, target: 8, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 3, target: 9, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 3, target: 17, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 3, target: 18, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 5, target: 10, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 5, target: 11, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 7, target: 8, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 7, target: 9, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 7, target: 17, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 7, target: 18, type: 'sibling', is_ex: false, is_deceased: false },
    
    // PROBLEMATIC: Michael shows siblings as William and Patricia (should be Lisa's parents!)
    { source: 13, target: 15, type: 'sibling', is_ex: false, is_deceased: false },
    { source: 13, target: 16, type: 'sibling', is_ex: false, is_deceased: false }
];

console.log('=== TESTING WITH EXACT API DATA FROM EMILY\'S TREE ===');
console.log('');

console.log('🔍 PROBLEM DETECTED IN API DATA:');
console.log('- Michael shows William and Patricia as siblings');
console.log('- But William and Patricia should be Lisa\'s parents (Michael\'s grandparents)');
console.log('- This suggests the TreeBuilder has incorrect relationship generation');
console.log('');

const emily = allPeople.find(p => p.first_name === 'Emily');
const michael = allPeople.find(p => p.first_name === 'Michael');
const alice = allPeople.find(p => p.first_name === 'Alice');

console.log('Testing relationships with the ACTUAL API data:');

try {
    // Test: Michael → Emily (Emily as root) - currently showing Uncle instead of Step-Uncle
    const result = calculateRelationshipToRoot(michael, emily, allPeople, relationships);
    console.log(`✓ Michael → Emily (Emily as root): "${result}"`);
    
    console.log('');
    console.log('Expected: "Step-Uncle"');
    console.log(`Actual: "${result}"`);
    
    if (result === 'Step-Uncle') {
        console.log('✅ CORRECT - Relationship calculator is working properly');
    } else {
        console.log('❌ INCORRECT - The API data has incorrect relationships');
        console.log('');
        console.log('🔧 ROOT CAUSE ANALYSIS:');
        console.log('The TreeBuilder service is generating incorrect sibling relationships.');
        console.log('Michael should NOT have explicit siblings. His relationship to Alice should be');
        console.log('calculated as step-sibling based on shared parent (John) and different mothers.');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}