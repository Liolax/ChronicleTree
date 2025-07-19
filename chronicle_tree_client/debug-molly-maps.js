// Debug the relationship maps for Molly case
console.log('🔍 Debugging Molly relationship maps...');

// Manually simulate the buildRelationshipMaps function logic
const relationships = [
  { source: 'molly', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'molly', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'alice', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'parent', is_ex: false },
];

const parentToChildren = new Map();
const childToParents = new Map();
const siblingMap = new Map();

console.log('\n1. Processing relationships:');
relationships.forEach(rel => {
  const source = String(rel.source);
  const target = String(rel.target);
  const relationshipType = rel.relationship_type;
  
  console.log(`Processing: ${source} --${relationshipType}--> ${target}`);
  
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
    // Child relationship: source has a child named target
    // This means source is the parent of target
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

console.log('\n2. Final parent-child maps:');
console.log('Parent to Children:');
for (const [parent, children] of parentToChildren.entries()) {
  console.log(`  ${parent} -> [${Array.from(children).join(', ')}]`);
}

console.log('Child to Parents:');
for (const [child, parents] of childToParents.entries()) {
  console.log(`  ${child} -> [${Array.from(parents).join(', ')}]`);
}

console.log('\n3. Sibling detection logic:');
const allPersonIds = new Set(['molly', 'jane', 'alice']);

for (const personId of allPersonIds) {
  const personParents = childToParents.get(personId) || new Set();
  console.log(`\nChecking ${personId} (parents: [${Array.from(personParents).join(', ')}])`);
  
  if (personParents.size > 0) {
    for (const otherPersonId of allPersonIds) {
      if (personId !== otherPersonId) {
        const otherParents = childToParents.get(otherPersonId) || new Set();
        console.log(`  Comparing with ${otherPersonId} (parents: [${Array.from(otherParents).join(', ')}])`);
        
        const sharedParents = [...personParents].filter(parent => otherParents.has(parent));
        console.log(`    Shared parents: [${sharedParents.join(', ')}]`);
        
        if (sharedParents.length > 0) {
          console.log(`    ${personId} and ${otherPersonId} share parents - checking if parent-child...`);
          
          const isParentChild = (
            (parentToChildren.has(personId) && parentToChildren.get(personId).has(otherPersonId)) ||
            (parentToChildren.has(otherPersonId) && parentToChildren.get(otherPersonId).has(personId))
          );
          
          console.log(`    Is ${personId} parent of ${otherPersonId}? ${parentToChildren.has(personId) && parentToChildren.get(personId).has(otherPersonId)}`);
          console.log(`    Is ${otherPersonId} parent of ${personId}? ${parentToChildren.has(otherPersonId) && parentToChildren.get(otherPersonId).has(personId)}`);
          console.log(`    isParentChild: ${isParentChild}`);
          
          if (!isParentChild) {
            console.log(`    ❌ MARKING AS SIBLINGS: ${personId} <-> ${otherPersonId}`);
            if (!siblingMap.has(personId)) {
              siblingMap.set(personId, new Set());
            }
            if (!siblingMap.has(otherPersonId)) {
              siblingMap.set(otherPersonId, new Set());
            }
            siblingMap.get(personId).add(otherPersonId);
            siblingMap.get(otherPersonId).add(personId);
          } else {
            console.log(`    ✅ NOT SIBLINGS (parent-child relationship)`);
          }
        }
      }
    }
  }
}

console.log('\n4. Final sibling map:');
for (const [person, siblings] of siblingMap.entries()) {
  console.log(`  ${person} -> [${Array.from(siblings).join(', ')}]`);
}
