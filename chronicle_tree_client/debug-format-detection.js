const testRelationships = [
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '1', relationship_type: 'child', is_ex: false },
  { source: '3', target: '2', relationship_type: 'child', is_ex: false },
  { source: '4', target: '8', relationship_type: 'child', is_ex: false },
  { source: '4', target: '9', relationship_type: 'child', is_ex: false },
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: false },
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: false },
];

// Check format detection
const hasParentType = testRelationships.some(r => (r.type || r.relationship_type) === 'parent');
const hasChildType = testRelationships.some(r => (r.type || r.relationship_type) === 'child');
const isRailsFormat = hasParentType && hasChildType;

console.log('🔍 Relationship Format Detection');
console.log(`Has parent type: ${hasParentType}`);
console.log(`Has child type: ${hasChildType}`);
console.log(`Detected as Rails format: ${isRailsFormat}`);
console.log('');

if (isRailsFormat) {
  console.log('Rails format interpretation:');
  console.log('  parent: source HAS parent target (target is parent of source)');
  console.log('  child: source has a child named target (source is parent of target)');
} else {
  console.log('Test format interpretation:');
  console.log('  parent: source IS parent OF target');
}

console.log('');
console.log('Sample relationship analysis:');
console.log('{ source: "1", target: "3", relationship_type: "parent" }');
if (isRailsFormat) {
  console.log('  Rails: 1 HAS parent 3 → 3 is parent of 1 ❌ WRONG');
} else {
  console.log('  Test: 1 IS parent OF 3 → 1 is parent of 3 ✅ CORRECT');
}

console.log('');
console.log('{ source: "3", target: "1", relationship_type: "child" }');
console.log('  Both: 3 has child 1 → 3 is parent of 1 ❌ WRONG');

console.log('');
console.log('The issue: having both parent and child types triggers Rails format,');
console.log('but our data is actually test format with redundant bidirectional entries!');
