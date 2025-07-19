import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Minimal test case focusing on Molly-Alice sibling issue
const testPeople = [
  { id: 'molly', full_name: 'Molly', gender: 'female' },
  { id: 'jane', full_name: 'Jane', gender: 'female' },
  { id: 'alice', full_name: 'Alice', gender: 'female' },
];

const relationships = [
  // Molly is mother of Jane
  { source: 'molly', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'molly', relationship_type: 'parent', is_ex: false },
  
  // Jane is mother of Alice
  { source: 'jane', target: 'alice', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'parent', is_ex: false },
];

console.log('🔍 Debug: Molly sibling detection issue');
console.log('\nFamily structure:');
console.log('  Molly -> Jane (mother)');
console.log('  Jane -> Alice (mother)');
console.log('  Therefore: Molly -> Alice should be Grandmother');

console.log('\nRelationship data:');
relationships.forEach(rel => {
  console.log(`  ${rel.source} --${rel.relationship_type}--> ${rel.target}`);
});

const mollyToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  relationships
);

console.log('\nResult:');
console.log(`Molly -> Alice: ${mollyToAlice} (Expected: Grandmother)`);

if (mollyToAlice === 'Grandmother') {
  console.log('✅ WORKING');
} else {
  console.log('❌ NOT WORKING');
  console.log('\nThis suggests the sibling detection is incorrectly triggering');
  console.log('because Molly and Alice might both be listed as children of the same person');
}

// Let's manually trace the logic
console.log('\n🔍 Manual trace:');
console.log('1. Check if Molly is direct relative of Alice:');
console.log('   - Parent? No');
console.log('   - Child? No');
console.log('   - Spouse? No');
console.log('   - Sibling? This is where it might be going wrong');

console.log('\n2. Blood relationship check:');
console.log('   - Molly should be grandmother via: Molly -> Jane -> Alice');
console.log('   - But sibling detection might be interfering');

console.log('\n3. Sibling detection issue:');
console.log('   - If both Molly and Alice share a parent, they would be siblings');
console.log('   - But Molly is grandmother, not sibling');
console.log('   - The parent-child exclusion check should prevent this');
