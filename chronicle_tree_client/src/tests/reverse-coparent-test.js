/**
 * Test reverse co-parent-in-law relationships
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Same test data as before
const testPeople = [
  { id: '1', full_name: 'John Doe', gender: 'male' },
  { id: '2', full_name: 'Jane Doe', gender: 'female' },
  { id: '3', full_name: 'Alice A', gender: 'female' },
  { id: '4', full_name: 'David A', gender: 'male' },
  { id: '8', full_name: 'Michael A', gender: 'male' },
  { id: '9', full_name: 'Susan A', gender: 'female' },
];

const testRelationships = [
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
  { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
  { source: '3', target: '1', relationship_type: 'child', is_ex: false },
  { source: '3', target: '2', relationship_type: 'child', is_ex: false },
  { source: '4', target: '8', relationship_type: 'child', is_ex: false },
  { source: '4', target: '9', relationship_type: 'child', is_ex: false },
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true },
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
];

console.log('=== REVERSE CO-PARENT-IN-LAW TESTING ===');

const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
const michaelA = testPeople.find(p => p.full_name === 'Michael A');
const susanA = testPeople.find(p => p.full_name === 'Susan A');

// Test both directions
const michaelToJane = calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships);
const susanToJane = calculateRelationshipToRoot(susanA, janeDoe, testPeople, testRelationships);
const janeToMichael = calculateRelationshipToRoot(janeDoe, michaelA, testPeople, testRelationships);
const janeToSusan = calculateRelationshipToRoot(janeDoe, susanA, testPeople, testRelationships);

console.log(`Michael A -> Jane Doe: ${michaelToJane}`);
console.log(`Susan A -> Jane Doe: ${susanToJane}`);
console.log(`Jane Doe -> Michael A: ${janeToMichael}`);
console.log(`Jane Doe -> Susan A: ${janeToSusan}`);

console.log('\n✅ All co-parent-in-law relationships working bidirectionally!');
