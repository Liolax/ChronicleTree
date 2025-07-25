/**
 * Debug the relationship map building to see why childToParents is missing people
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test data
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1975-01-01', is_deceased: false },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '1995-08-15', is_deceased: false },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    { id: 14, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-10', is_deceased: false }
];

const relationships = [
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 2, type: 'child', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 12, type: 'child', is_ex: false, is_deceased: false },
    { source: 3, target: 14, type: 'parent', is_ex: false, is_deceased: false },
    { source: 14, target: 3, type: 'child', is_ex: false, is_deceased: false }
];

console.log('=== DEBUGGING RELATIONSHIP MAP BUILDING ===');
console.log('');

console.log('Input relationships:');
relationships.forEach((rel, i) => {
    const sourcePerson = allPeople.find(p => p.id === rel.source);
    const targetPerson = allPeople.find(p => p.id === rel.target);
    console.log(`${i+1}. ${sourcePerson.first_name} → ${targetPerson.first_name} (${rel.type})`);
});

console.log('');
console.log('All people IDs:');
allPeople.forEach(person => {
    console.log(`- ${person.first_name}: ID=${person.id} (type: ${typeof person.id})`);
});

console.log('');
console.log('Now let\'s see what happens when we call calculateRelationshipToRoot...');

try {
    const emma = allPeople.find(p => p.first_name === 'Emma');
    const michael = allPeople.find(p => p.first_name === 'Michael');
    
    console.log(`Testing Michael (${michael.id}) → Emma (${emma.id})`);
    
    // This should trigger the relationship map building and show debug output
    const result = calculateRelationshipToRoot(michael, emma, allPeople, relationships);
    console.log(`Result: "${result}"`);
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}