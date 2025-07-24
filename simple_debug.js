/**
 * Simple debug to understand the relationship calculation
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Add a simple debug version with inline console.log
const originalConsoleLog = console.log;
const debugLogs = [];

// Override console.log to capture debug output
console.log = (...args) => {
    debugLogs.push(args.join(' '));
    originalConsoleLog(...args);
};

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

console.log('=== RELATIONSHIP CALCULATION TEST ===');

const richard = allPeople.find(p => p.first_name === 'Richard');
const michael = allPeople.find(p => p.first_name === 'Michael');

// Test both directions
console.log('\n1. Michael as target, Richard as root:');
const result1 = calculateRelationshipToRoot(michael, richard, allPeople, relationships);
console.log(`   Result: "${result1}"`);

console.log('\n2. Richard as target, Michael as root:');
const result2 = calculateRelationshipToRoot(richard, michael, allPeople, relationships);
console.log(`   Result: "${result2}"`);

console.log('\n=== EXPECTED ===');
console.log('Both should be "Unrelated" due to timeline validation');
console.log('Jane died 2022-01-01, Michael born 2024-08-15');

// Restore original console.log
console.log = originalConsoleLog;