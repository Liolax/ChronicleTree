/**
 * Debug by adding temporary console logs to trace step-sibling logic
 */

import fs from 'fs';

// Read the relationship calculator
let code = fs.readFileSync('./chronicle_tree_client/src/utils/improvedRelationshipCalculator.js', 'utf8');

// Add debug logging to the step-sibling section
const debugCode = code.replace(
    '  // Check for step-sibling relationship',
    `  console.log('[DEBUG STEP-SIBLING] Starting step-sibling check for person=' + personId + ', root=' + rootId);
  
  // Check for step-sibling relationship`
).replace(
    "  // Find root's step-parents",
    `  const rootParents = childToParents.get(rootId) || new Set();
  const personParents = childToParents.get(personId) || new Set();
  console.log('[DEBUG STEP-SIBLING] rootParents:', Array.from(rootParents));
  console.log('[DEBUG STEP-SIBLING] personParents:', Array.from(personParents));
  
  // Find root's step-parents`
).replace(
    "  // Check if person is child of any of root's step-parents",
    `  console.log('[DEBUG STEP-SIBLING] rootStepParents:', Array.from(rootStepParents));
  console.log('[DEBUG STEP-SIBLING] personStepParents:', Array.from(personStepParents));
  
  // Check if person is child of any of root's step-parents`
).replace(
    "      // Make sure they don't share ALL biological parents (if they do, they're full siblings)",
    `      console.log('[DEBUG STEP-SIBLING] Found step-parent match:', stepParent);
      console.log('[DEBUG STEP-SIBLING] personParents.has(stepParent):', personParents.has(stepParent));
      
      // Make sure they don't share ALL biological parents (if they do, they're full siblings)`
).replace(
    '      if (sharedBioParents.length < Math.max(rootParents.size, personParents.size)) {',
    `      console.log('[DEBUG STEP-SIBLING] sharedBioParents:', sharedBioParents);
      console.log('[DEBUG STEP-SIBLING] rootParents.size:', rootParents.size, 'personParents.size:', personParents.size);
      console.log('[DEBUG STEP-SIBLING] condition check:', sharedBioParents.length, '<', Math.max(rootParents.size, personParents.size), '=', sharedBioParents.length < Math.max(rootParents.size, personParents.size));
      
      if (sharedBioParents.length < Math.max(rootParents.size, personParents.size)) {`
).replace(
    "        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');",
    `        console.log('[DEBUG STEP-SIBLING] ✅ RETURNING STEP-SIBLING RELATIONSHIP!');
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');`
).replace(
    '  return null;',
    `  console.log('[DEBUG STEP-SIBLING] ❌ No step-sibling relationship found, returning null');
  return null;`
);

// Write debug version
fs.writeFileSync('./debug_relationship_calculator.js', debugCode);

console.log('Created debug version with step-sibling logging');
console.log('Now testing with debug output...\n');

// Import debug version
const { calculateRelationshipToRoot } = await import('./debug_relationship_calculator.js');

// Test data
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2002-08-15', is_deceased: false }
];

const relationships = [
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 2, type: 'child', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('=== TESTING WITH DEBUG STEP-SIBLING LOGGING ===\n');

try {
    const alice = allPeople.find(p => p.first_name === 'Alice');
    const michael = allPeople.find(p => p.first_name === 'Michael');
    
    console.log('Test 1: Michael → Alice (Alice as root)');
    const result1 = calculateRelationshipToRoot(michael, alice, allPeople, relationships);
    console.log(`Result: "${result1}"\n`);
    
    console.log('Test 2: Alice → Michael (Michael as root)');
    const result2 = calculateRelationshipToRoot(alice, michael, allPeople, relationships);
    console.log(`Result: "${result2}"\n`);
    
} catch (error) {
    console.error('Error:', error.message);
}

// Clean up
fs.unlinkSync('./debug_relationship_calculator.js');