import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Import buildRelationshipMaps function directly for debugging
const fs = await import('fs');
const calculatorCode = fs.readFileSync('./src/utils/improvedRelationshipCalculator.js', 'utf8');

// Extract the buildRelationshipMaps function by using eval (for debugging only)
const buildRelationshipMapsMatch = calculatorCode.match(/const buildRelationshipMaps = \(relationships\) => \{[\s\S]*?\n\};/);
if (!buildRelationshipMapsMatch) {
  console.error('Could not extract buildRelationshipMaps function');
  process.exit(1);
}

const buildRelationshipMapsCode = buildRelationshipMapsMatch[0];
eval(buildRelationshipMapsCode);

// Test data 
const testRelationships = [
  // Core family relationships
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false }, // John -> Alice
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false }, // Jane -> Alice
  { source: '1', target: '5', relationship_type: 'parent', is_ex: false }, // John -> Charlie
  { source: '2', target: '5', relationship_type: 'parent', is_ex: false }, // Jane -> Charlie
  { source: '3', target: '6', relationship_type: 'parent', is_ex: false }, // Alice -> Bob
  { source: '4', target: '6', relationship_type: 'parent', is_ex: false }, // David -> Bob
  { source: '3', target: '7', relationship_type: 'parent', is_ex: false }, // Alice -> Emily
  { source: '4', target: '7', relationship_type: 'parent', is_ex: false }, // David -> Emily
  
  // David's parents (for co-parent-in-law testing)
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
  
  // Great-grandparents
  { source: '10', target: '1', relationship_type: 'parent', is_ex: false },
  { source: '11', target: '1', relationship_type: 'parent', is_ex: false },
  
  // Spouse relationships - THIS IS KEY!
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true }, // Alice <-> David (ex-spouses)
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
];

console.log('🔍 Debugging relationship maps...');

const maps = buildRelationshipMaps(testRelationships);

console.log('\nParent to Children map:');
for (const [parent, children] of maps.parentToChildren.entries()) {
  console.log(`  ${parent} -> [${Array.from(children).join(', ')}]`);
}

console.log('\nSibling map:');
for (const [person, siblings] of maps.siblingMap.entries()) {
  console.log(`  ${person} -> [${Array.from(siblings).join(', ')}]`);
}

console.log('\nEx-spouse map:');
for (const [person, exSpouses] of maps.exSpouseMap.entries()) {
  console.log(`  ${person} -> [${Array.from(exSpouses).join(', ')}]`);
}

console.log('\n🔍 Checking Alice (3) and Charlie (5) specifically:');
console.log(`Alice's children: [${Array.from(maps.parentToChildren.get('3') || new Set()).join(', ')}]`);
console.log(`Charlie's children: [${Array.from(maps.parentToChildren.get('5') || new Set()).join(', ')}]`);
console.log(`Alice's siblings: [${Array.from(maps.siblingMap.get('3') || new Set()).join(', ')}]`);
console.log(`Charlie's siblings: [${Array.from(maps.siblingMap.get('5') || new Set()).join(', ')}]`);
