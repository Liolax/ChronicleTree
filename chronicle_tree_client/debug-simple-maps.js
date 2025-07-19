// Debug the relationship maps to understand the issue
console.log('🔍 Starting relationship map debug...');

// Test data that causes the issue
const testRelationships = [
  // Michael (8) is parent of David (4)
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  // David (4) is child of Michael (8) - bidirectional
  { source: '4', target: '8', relationship_type: 'child', is_ex: false },
  
  // John (1) has parents Frank (10) and Rose (11)
  { source: '10', target: '1', relationship_type: 'parent', is_ex: false },
  { source: '11', target: '1', relationship_type: 'parent', is_ex: false },
  // Bidirectional
  { source: '1', target: '10', relationship_type: 'child', is_ex: false },
  { source: '1', target: '11', relationship_type: 'child', is_ex: false },
  
  // Alice (3) has parents John (1) and Jane (2)
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
  // Bidirectional
  { source: '3', target: '1', relationship_type: 'child', is_ex: false },
  { source: '3', target: '2', relationship_type: 'child', is_ex: false },
];

console.log('\nRelationship data:');
testRelationships.forEach(rel => {
  console.log(`  ${rel.source} --${rel.relationship_type}-> ${rel.target}`);
});

console.log('\nProcessing parent relationships...');
const parentToChildren = new Map();
const childToParents = new Map();

testRelationships.forEach(rel => {
  const source = String(rel.source);
  const target = String(rel.target);
  const relationshipType = rel.relationship_type;
  
  console.log(`\nProcessing: ${source} --${relationshipType}-> ${target}`);
  
  if (relationshipType === 'parent') {
    // source IS parent OF target
    if (!parentToChildren.has(source)) {
      parentToChildren.set(source, new Set());
    }
    parentToChildren.get(source).add(target);
    console.log(`  Added: ${source} is parent of ${target}`);
    
    if (!childToParents.has(target)) {
      childToParents.set(target, new Set());
    }
    childToParents.get(target).add(source);
    console.log(`  Added: ${target} has parent ${source}`);
  } else if (relationshipType === 'child') {
    // source has a child named target - so source is parent of target
    if (!parentToChildren.has(source)) {
      parentToChildren.set(source, new Set());
    }
    parentToChildren.get(source).add(target);
    console.log(`  Added: ${source} is parent of ${target} (via child relationship)`);
    
    if (!childToParents.has(target)) {
      childToParents.set(target, new Set());
    }
    childToParents.get(target).add(source);
    console.log(`  Added: ${target} has parent ${source} (via child relationship)`);
  }
});

console.log('\n🔍 Final maps:');
console.log('\nParent to Children:');
for (const [parent, children] of parentToChildren.entries()) {
  console.log(`  ${parent} -> [${Array.from(children).join(', ')}]`);
}

console.log('\nChild to Parents:');
for (const [child, parents] of childToParents.entries()) {
  console.log(`  ${child} -> [${Array.from(parents).join(', ')}]`);
}

console.log('\n🔍 Simulating great-grandparent check: Michael (8) to Alice (3)');
console.log('Alice (3) parents:', Array.from(childToParents.get('3') || new Set()));

const aliceParents = childToParents.get('3') || new Set();
for (const parent of aliceParents) {
  console.log(`\nChecking Alice's parent: ${parent}`);
  const grandparents = childToParents.get(parent) || new Set();
  console.log(`  ${parent}'s parents (Alice's grandparents): [${Array.from(grandparents).join(', ')}]`);
  
  for (const grandparent of grandparents) {
    console.log(`  Checking if Michael (8) is child of grandparent ${grandparent}:`);
    
    // This is the condition that's causing the issue
    if (childToParents.has(grandparent) && childToParents.get(grandparent).has('8')) {
      console.log(`    ❌ ISSUE: Michael (8) found as child of ${grandparent}!`);
      console.log(`    ${grandparent}'s children: [${Array.from(childToParents.get(grandparent)).join(', ')}]`);
    } else {
      console.log(`    ✅ OK: Michael (8) is NOT child of ${grandparent}`);
    }
  }
}
