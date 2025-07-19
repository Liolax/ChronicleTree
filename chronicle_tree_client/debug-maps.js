// Debug script to examine the relationship maps
import fs from 'fs';

// Read the calculator code to extract buildRelationshipMaps function
const calculatorCode = fs.readFileSync('./src/utils/improvedRelationshipCalculator.js', 'utf8');

// Find the buildRelationshipMaps function
const startIndex = calculatorCode.indexOf('const buildRelationshipMaps = ');
const endIndex = calculatorCode.indexOf('\n};', startIndex) + 3;
const functionCode = calculatorCode.substring(startIndex, endIndex);

// Execute the function code
eval(functionCode);

// Test data with both parent and child relationships
const testRelationships = [
  // Core family relationships
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '1', target: '5', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '5', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '6', relationship_type: 'parent', is_ex: false },
  { source: '4', target: '6', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '7', relationship_type: 'parent', is_ex: false },
  { source: '4', target: '7', relationship_type: 'parent', is_ex: false },
  
  // David's parents
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
  
  // Great-grandparents
  { source: '10', target: '1', relationship_type: 'parent', is_ex: false },
  { source: '11', target: '1', relationship_type: 'parent', is_ex: false },
  
  // Reverse child relationships  
  { source: '3', target: '1', relationship_type: 'child', is_ex: false },
  { source: '3', target: '2', relationship_type: 'child', is_ex: false },
  { source: '5', target: '1', relationship_type: 'child', is_ex: false },
  { source: '5', target: '2', relationship_type: 'child', is_ex: false },
  { source: '6', target: '3', relationship_type: 'child', is_ex: false },
  { source: '6', target: '4', relationship_type: 'child', is_ex: false },
  { source: '7', target: '3', relationship_type: 'child', is_ex: false },
  { source: '7', target: '4', relationship_type: 'child', is_ex: false },
  { source: '4', target: '8', relationship_type: 'child', is_ex: false },
  { source: '4', target: '9', relationship_type: 'child', is_ex: false },
  { source: '1', target: '10', relationship_type: 'child', is_ex: false },
  { source: '1', target: '11', relationship_type: 'child', is_ex: false },
  
  // Ex-spouse relationship
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true },
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
];

const maps = buildRelationshipMaps(testRelationships);

console.log('🔍 Relationship Maps Debug:');
console.log('\nParent to Children:');
for (const [parent, children] of maps.parentToChildren.entries()) {
  console.log(`  ${parent} -> [${Array.from(children).join(', ')}]`);
}

console.log('\nChild to Parents:');
for (const [child, parents] of maps.childToParents.entries()) {
  console.log(`  ${child} -> [${Array.from(parents).join(', ')}]`);
}

console.log('\n🔍 Checking Michael (8) -> Alice (3) great-grandparent logic:');
console.log('Alice (3) parents:', Array.from(maps.childToParents.get('3') || new Set()));

const aliceParents = maps.childToParents.get('3') || new Set();
for (const parent of aliceParents) {
  console.log(`\nAlice parent ${parent}:`);
  const grandparents = maps.childToParents.get(parent) || new Set();
  console.log(`  ${parent} parents: [${Array.from(grandparents).join(', ')}]`);
  
  for (const grandparent of grandparents) {
    console.log(`    Checking if Michael (8) is child of grandparent ${grandparent}:`);
    const grandparentChildren = maps.childToParents.get(grandparent) || new Set();
    console.log(`      ${grandparent} children: [${Array.from(grandparentChildren).join(', ')}]`);
    
    if (grandparentChildren.has('8')) {
      console.log(`      ❌ FOUND ISSUE: Michael (8) is listed as child of ${grandparent}!`);
    }
  }
}
