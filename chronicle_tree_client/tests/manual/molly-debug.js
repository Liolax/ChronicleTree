// Debug the specific Molly to David relationship issue

import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

// Test data representing the issue
const testPeople = [
  { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
  { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
  { id: 'alice', first_name: 'Alice', last_name: 'A', gender: 'Female' },
  { id: 'david', first_name: 'David', last_name: 'A', gender: 'Male' },
  { id: 'molly', first_name: 'Molly', last_name: 'M', gender: 'Female' } // NEW: Molly as mother of Jane
];

const testRelationships = [
  // John and Jane are spouses
  { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false },
  { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false },
  
  // CRITICAL: Molly is mother of Jane
  { source: 'molly', target: 'jane', relationship_type: 'child', is_ex: false },
  { source: 'jane', target: 'molly', relationship_type: 'parent', is_ex: false },
  
  // John and Jane are parents of Alice
  { source: 'john', target: 'alice', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'john', relationship_type: 'parent', is_ex: false },
  { source: 'jane', target: 'alice', relationship_type: 'child', is_ex: false },
  { source: 'alice', target: 'jane', relationship_type: 'parent', is_ex: false },
  
  // David is ex-husband of Alice
  { source: 'david', target: 'alice', relationship_type: 'spouse', is_ex: true },
  { source: 'alice', target: 'david', relationship_type: 'spouse', is_ex: true },
];

console.log('=== DEBUGGING MOLLY TO DAVID RELATIONSHIP ===');
console.log('');

// Let's trace through the relationship step by step
console.log('Expected relationship path:');
console.log('Molly → (mother of) → Jane → (mother of) → Alice → (ex-wife of) → David');
console.log('Therefore: Molly should be Ex-Mother-in-law to David');
console.log('');

// Test the individual steps
console.log('Step 1: Molly to Jane');
const mollyToJane = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'jane'),
  testPeople,
  testRelationships
);
console.log(`  Result: ${mollyToJane} (Expected: Mother)`);
console.log('');

console.log('Step 2: Jane to Alice');
const janeToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'jane'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  testRelationships
);
console.log(`  Result: ${janeToAlice} (Expected: Mother)`);
console.log('');

console.log('Step 3: Alice to David');
const aliceToDavid = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'alice'),
  testPeople.find(p => p.id === 'david'),
  testPeople,
  testRelationships
);
console.log(`  Result: ${aliceToDavid} (Expected: Ex-Wife)`);
console.log('');

console.log('Step 4: David to Alice (reverse)');
const davidToAlice = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'david'),
  testPeople.find(p => p.id === 'alice'),
  testPeople,
  testRelationships
);
console.log(`  Result: ${davidToAlice} (Expected: Ex-Husband)`);
console.log('');

console.log('Final Test: Molly to David');
const mollyToDavid = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'molly'),
  testPeople.find(p => p.id === 'david'),
  testPeople,
  testRelationships
);
console.log(`  Result: ${mollyToDavid} (Expected: Ex-Mother-in-law)`);
console.log('');

// Let's also test the reverse direction
console.log('Reverse: David to Molly');
const davidToMolly = calculateRelationshipToRoot(
  testPeople.find(p => p.id === 'david'),
  testPeople.find(p => p.id === 'molly'),
  testPeople,
  testRelationships
);
console.log(`  Result: ${davidToMolly} (Expected: Ex-Father-in-law)`);
console.log('');

// Debug: Let's check what the relationship maps look like
console.log('=== RELATIONSHIP MAP DEBUGGING ===');
console.log('Relationships:');
testRelationships.forEach((rel, i) => {
  console.log(`  ${i+1}: ${rel.source} → ${rel.target} (${rel.relationship_type}${rel.is_ex ? ', ex' : ''})`);
});
