// Simple debug script to check relationship maps
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
  
  // Spouse relationships - THIS IS KEY!
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true }, // Alice <-> David (ex-spouses)
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
];

console.log('🔍 Checking relationship data:');
console.log('\nParent relationships:');
testRelationships.filter(r => r.relationship_type === 'parent').forEach(r => {
  console.log(`  ${r.source} -> ${r.target}`);
});

console.log('\nEx-spouse relationships:');
testRelationships.filter(r => r.relationship_type === 'spouse' && r.is_ex).forEach(r => {
  console.log(`  ${r.source} <-> ${r.target} (ex)`);
});

console.log('\nKey insight: Who would be co-parents-in-law?');
console.log('John/Jane (parents of Alice) should be co-parents-in-law with Michael/Susan (parents of David)');
console.log('because Alice and David are ex-spouses with children Bob/Emily');
console.log('');
console.log('BUT Alice and Charlie should be SIBLINGS, not co-parents-in-law!');
console.log('');
console.log('The bug might be: Are Alice and Charlie somehow being treated as');
console.log('having children that are married to each other?');

// Let me manually check co-parent-in-law logic
console.log('\n🔍 Manual co-parent check:');
console.log('Alice (3) children: 6, 7');
console.log('Charlie (5) children: (none)');
console.log('For Alice and Charlie to be co-parents-in-law:');
console.log('  One of Alice\'s children (6 or 7) would need to be married to one of Charlie\'s children (none)');
console.log('  This is IMPOSSIBLE since Charlie has no children!');
