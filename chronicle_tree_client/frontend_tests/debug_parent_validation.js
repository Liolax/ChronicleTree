/**
 * Debug the parent validation logic in great-nephew/niece section
 */

import { buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

const people = [
  { id: 1, first_name: 'David', last_name: 'Smith', gender: 'Male' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' }
];

const relationships = [
  { source: 1, target: 2, type: 'sibling', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 }
];

console.log('=== Debug Parent Validation Logic ===');

const maps = buildRelationshipMaps(relationships, people);

// Simulate the exact logic from great-nephew/niece section
const rootId = String(1); // David
const rootParents = maps.childToParents.get(rootId) || new Set();
const sibling = String(2); // Patricia
const siblingParents = maps.childToParents.get(sibling) || new Set();
const sharedParents = [...rootParents].filter(parent => siblingParents.has(parent));

console.log('Values in parent validation:');
console.log(`  rootId: ${rootId} (David)`);
console.log(`  rootParents: [${Array.from(rootParents).join(', ')}] (size: ${rootParents.size})`);
console.log(`  sibling: ${sibling} (Patricia)`);
console.log(`  siblingParents: [${Array.from(siblingParents).join(', ')}] (size: ${siblingParents.size})`);
console.log(`  sharedParents: [${sharedParents.join(', ')}] (length: ${sharedParents.length})`);

console.log('');
console.log('Testing my fixed condition:');

// Original broken condition
const originalCondition = (sharedParents.length === rootParents.size && sharedParents.length === siblingParents.size && sharedParents.length > 0);
console.log(`  Original condition: ${originalCondition}`);
console.log(`    sharedParents.length === rootParents.size: ${sharedParents.length} === ${rootParents.size} = ${sharedParents.length === rootParents.size}`);
console.log(`    sharedParents.length === siblingParents.size: ${sharedParents.length} === ${siblingParents.size} = ${sharedParents.length === siblingParents.size}`);
console.log(`    sharedParents.length > 0: ${sharedParents.length} > 0 = ${sharedParents.length > 0}`);

// My added condition for no parents
const noParentsCondition = (rootParents.size === 0 && siblingParents.size === 0);
console.log(`  No parents condition: ${noParentsCondition}`);
console.log(`    rootParents.size === 0: ${rootParents.size} === 0 = ${rootParents.size === 0}`);
console.log(`    siblingParents.size === 0: ${siblingParents.size} === 0 = ${siblingParents.size === 0}`);

// Combined condition (my fix)
const combinedCondition = originalCondition || noParentsCondition;
console.log(`  Combined condition (my fix): ${combinedCondition}`);

console.log('');
if (combinedCondition) {
  console.log('✅ SUCCESS: The parent validation should pass!');
  console.log('The issue must be elsewhere in the great-nephew/niece logic.');
} else {
  console.log('❌ FAILURE: The parent validation is still failing.');
  console.log('My fix is not correct.');
}