/**
 * Debug test with console logging enabled to trace the relationship calculation path
 */

// Temporarily modify the calculator to add debug logging
const fs = require('fs');

// Read the current calculator file
const calculatorPath = './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';
let calculatorCode = fs.readFileSync(calculatorPath, 'utf8');

// Add console logging to trace which path returns the result
const debugCode = calculatorCode.replace(
    'return getGenderSpecificRelation(personId, \'Step-Grandson\', \'Step-Granddaughter\', allPeople, \'Step-Grandchild\');',
    `console.log('[DEBUG] Found step-grandchild via reverse logic: person=${personId}, root=${rootId}');
          return getGenderSpecificRelation(personId, 'Step-Grandson', 'Step-Granddaughter', allPeople, 'Step-Grandchild');`
).replace(
    'return getGenderSpecificRelation(personId, \'Step-Grandfather\', \'Step-Grandmother\', allPeople, \'Step-Grandparent\');',
    `console.log('[DEBUG] Found step-grandparent: person=${personId}, root=${rootId}');
          return getGenderSpecificRelation(personId, 'Step-Grandfather', 'Step-Grandmother', allPeople, 'Step-Grandparent');`
);

// Write the debug version
const debugCalculatorPath = './debug_calculator.js';
fs.writeFileSync(debugCalculatorPath, debugCode);

console.log('Created debug version of calculator with console logging.');
console.log('Now importing and testing...');

// Import the debug version
const { calculateRelationshipToRoot } = require('./debug_calculator.js');

// Test data
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false },
    { id: 17, first_name: 'Richard', last_name: 'Sharma', gender: 'Male', date_of_birth: '1945-08-12', is_deceased: false },
    { id: 18, first_name: 'Margaret', last_name: 'Sharma', gender: 'Female', date_of_birth: '1948-02-28', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false }
];

const relationships = [
    { source: 17, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 17, type: 'child', is_ex: false, is_deceased: false },
    { source: 18, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 18, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('\n=== TESTING WITH DEBUG LOGGING ===');
const richard = allPeople.find(p => p.first_name === 'Richard');
const michael = allPeople.find(p => p.first_name === 'Michael');

console.log(`Testing: Michael (${michael.id}) -> Richard (${richard.id})`);

try {
    const result = calculateRelationshipToRoot(michael, richard, allPeople, relationships);
    console.log(`Result: "${result}"`);
} catch (error) {
    console.error('Error:', error.message);
}

// Clean up debug file
fs.unlinkSync(debugCalculatorPath);