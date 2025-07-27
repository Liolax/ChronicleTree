/**
 * Step-by-step debug of the great-nephew/niece logic to find exactly where it fails
 */

import { buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

const people = [
  { id: 1, first_name: 'David', last_name: 'Smith', gender: 'Male' },
  { id: 2, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' },
  { id: 3, first_name: 'PatriciaDaughter', last_name: 'Johnson', gender: 'Female' },
  { id: 4, first_name: 'PatriciaDaughterChild', last_name: 'Johnson', gender: 'Female' }
];

const relationships = [
  { source: 1, target: 2, type: 'sibling', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sibling', from: 2, to: 1 },
  { source: 3, target: 2, type: 'parent', from: 3, to: 2 },
  { source: 2, target: 3, type: 'child', from: 2, to: 3 },
  { source: 4, target: 3, type: 'parent', from: 4, to: 3 },
  { source: 3, target: 4, type: 'child', from: 3, to: 4 }
];

console.log('=== Step-by-Step Debug of Great-Nephew/Niece Logic ===');

const maps = buildRelationshipMaps(relationships, people);

// Simulate the exact great-nephew/niece logic from the relationship calculator
const rootId = String(1); // David
const personId = String(4); // PatriciaDaughterChild
const rootParents = maps.childToParents.get(rootId) || new Set();
const rootSiblings = maps.siblingMap.get(rootId) || new Set();

console.log('Initial setup:');
console.log(`  rootId: ${rootId} (David)`);
console.log(`  personId: ${personId} (PatriciaDaughterChild)`);
console.log(`  rootParents: [${Array.from(rootParents).join(', ')}] (size: ${rootParents.size})`);
console.log(`  rootSiblings: [${Array.from(rootSiblings).join(', ')}]`);
console.log('');

const MAX_GREAT_LEVELS = 5;

console.log('Testing great-niece/great-nephew logic:');
console.log('');

// Loop through levels 2 to MAX_GREAT_LEVELS
for (let level = 2; level <= MAX_GREAT_LEVELS; level++) {
  console.log(`=== LEVEL ${level} ===`);
  
  // Loop through each sibling
  for (const sibling of rootSiblings) {
    const siblingName = people.find(p => String(p.id) === sibling)?.first_name || sibling;
    console.log(`Processing sibling: ${siblingName} (ID: ${sibling})`);
    
    // Step 1: Verify biological sibling relationship
    const siblingParents = maps.childToParents.get(sibling) || new Set();
    const sharedParents = [...rootParents].filter(parent => siblingParents.has(parent));
    
    console.log(`  siblingParents: [${Array.from(siblingParents).join(', ')}] (size: ${siblingParents.size})`);
    console.log(`  sharedParents: [${sharedParents.join(', ')}] (length: ${sharedParents.length})`);
    
    // Test the biological sibling condition
    const originalCondition = (sharedParents.length === rootParents.size && sharedParents.length === siblingParents.size && sharedParents.length > 0);
    const noParentsCondition = (rootParents.size === 0 && siblingParents.size === 0);
    const biologicalSibling = originalCondition || noParentsCondition;
    
    console.log(`  originalCondition: ${originalCondition}`);
    console.log(`  noParentsCondition: ${noParentsCondition}`);
    console.log(`  biologicalSibling: ${biologicalSibling}`);
    
    if (biologicalSibling) {
      console.log(`  ✅ ${siblingName} is confirmed as biological sibling`);
      
      // Step 2: Build descendants at this level
      console.log(`  Building descendants at level ${level}:`);
      let currentGeneration = new Set([sibling]);
      console.log(`    Generation 0: [${Array.from(currentGeneration).map(id => people.find(p => String(p.id) === id)?.first_name || id).join(', ')}]`);
      
      // Go down 'level' generations to find descendants
      for (let i = 0; i < level; i++) {
        const nextGeneration = new Set();
        for (const currentPerson of currentGeneration) {
          const children = maps.parentToChildren.get(currentPerson) || new Set();
          for (const child of children) {
            nextGeneration.add(child);
          }
        }
        currentGeneration = nextGeneration;
        console.log(`    Generation ${i + 1}: [${Array.from(currentGeneration).map(id => people.find(p => String(p.id) === id)?.first_name || id).join(', ')}]`);
        
        // Step 3: Check if we've reached the target level and person is in this generation
        if (i === level - 1) {
          console.log(`    Checking if personId ${personId} is in generation ${i + 1}:`);
          console.log(`    currentGeneration.has(${personId}): ${currentGeneration.has(personId)}`);
          
          if (currentGeneration.has(personId)) {
            // Generate the correct relationship label
            const greats = 'Great-'.repeat(level - 1);
            const maleRelation = greats + 'Nephew';
            const femaleRelation = greats + 'Niece';
            console.log(`    🎉 MATCH FOUND! Should return: ${femaleRelation}`);
            console.log(`    Relationship: David -> PatriciaDaughterChild = ${femaleRelation}`);
            
            // This should be the return point in the actual function
            process.exit(0); // Exit to show we found the match
          } else {
            console.log(`    ❌ No match at level ${level}`);
          }
        }
      }
    } else {
      console.log(`  ❌ ${siblingName} not considered biological sibling`);
    }
    console.log('');
  }
}

console.log('');
console.log('❌ No great-nephew/niece relationship found at any level');
console.log('This indicates the logic should have found a match but didn\'t.');