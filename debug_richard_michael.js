/**
 * Debug test to trace exactly what happens when Richard is root and Michael is checked
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Mock data matching the seed data
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false },
    { id: 17, first_name: 'Richard', last_name: 'Sharma', gender: 'Male', date_of_birth: '1945-08-12', is_deceased: false },
    { id: 18, first_name: 'Margaret', last_name: 'Sharma', gender: 'Female', date_of_birth: '1948-02-28', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false }
];

// Relationships 
const relationships = [
    // Richard is parent of Jane (bidirectional)
    { source: 17, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 17, type: 'child', is_ex: false, is_deceased: false },
    
    // Margaret is parent of Jane (bidirectional)
    { source: 18, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 18, type: 'child', is_ex: false, is_deceased: false },
    
    // Jane was married to John (deceased spouse relationship)
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    
    // John is now married to Lisa (current spouse)
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // John is parent of Michael (bidirectional)
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    
    // Lisa is parent of Michael (bidirectional)
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('='.repeat(80));
console.log('DEBUG: Testing Richard Sharma as Root, Michael Doe as Target');
console.log('='.repeat(80));

const richard = allPeople.find(p => p.first_name === 'Richard' && p.last_name === 'Sharma');
const michael = allPeople.find(p => p.first_name === 'Michael' && p.last_name === 'Doe');
const jane = allPeople.find(p => p.first_name === 'Jane' && p.last_name === 'Doe');

console.log(`Root: ${richard.first_name} ${richard.last_name} (ID: ${richard.id})`);
console.log(`Target: ${michael.first_name} ${michael.last_name} (ID: ${michael.id})`);
console.log(`Connecting person: ${jane.first_name} ${jane.last_name} (ID: ${jane.id})`);
console.log(`Jane died: ${jane.date_of_death}`);
console.log(`Michael born: ${michael.date_of_birth}`);
console.log(`Gap: ${((new Date(michael.date_of_birth) - new Date(jane.date_of_death)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} years`);

console.log('\nRelationship path that SHOULD be blocked:');
console.log('Richard (grandparent) → Jane (deceased step-parent) → Michael (step-grandchild)');
console.log('But Jane died BEFORE Michael was born, so no relationship should exist.');

console.log('\nTesting relationship calculation...');

try {
    // The key test: when Richard is root, what is Michael's relationship?
    const result = calculateRelationshipToRoot(michael, richard, allPeople, relationships);
    console.log(`\nResult: Michael Doe → Richard Sharma = "${result}"`);
    
    if (result === 'Unrelated') {
        console.log('✅ SUCCESS: Timeline validation is working correctly!');
        console.log('   Michael is correctly identified as Unrelated to Richard.');
    } else {
        console.log('❌ PROBLEM: Timeline validation is NOT working correctly!');
        console.log(`   Expected: "Unrelated", Got: "${result}"`);
        console.log('   This suggests the timeline validation in the step-grandchild logic needs fixing.');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}