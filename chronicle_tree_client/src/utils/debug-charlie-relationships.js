/**
 * Debug script to test Charlie C relationship calculation
 * This will help identify if the fix for the relationship_type vs type issue worked
 */

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Mock data based on seeds.rb
const testPeople = [
  { id: '1', full_name: 'John Doe', gender: 'male' },
  { id: '2', full_name: 'Jane Doe', gender: 'female' },
  { id: '3', full_name: 'Alice A', gender: 'female' },
  { id: '4', full_name: 'David A', gender: 'male' },
  { id: '5', full_name: 'Charlie C', gender: 'male' },
  { id: '6', full_name: 'Bob', gender: 'male' },
  { id: '7', full_name: 'Emily', gender: 'female' }
];

// Mock relationships using relationship_type format (as from API)
const testRelationships = [
  // Parent-child relationships
  { source: '1', target: '3', relationship_type: 'parent', is_ex: false }, // John -> Alice
  { source: '2', target: '3', relationship_type: 'parent', is_ex: false }, // Jane -> Alice  
  { source: '1', target: '5', relationship_type: 'parent', is_ex: false }, // John -> Charlie
  { source: '2', target: '5', relationship_type: 'parent', is_ex: false }, // Jane -> Charlie
  { source: '3', target: '6', relationship_type: 'parent', is_ex: false }, // Alice -> Bob
  { source: '4', target: '6', relationship_type: 'parent', is_ex: false }, // David -> Bob
  { source: '3', target: '7', relationship_type: 'parent', is_ex: false }, // Alice -> Emily
  { source: '4', target: '7', relationship_type: 'parent', is_ex: false }, // David -> Emily
  
  // Child-parent relationships (reverse)
  { source: '3', target: '1', relationship_type: 'child', is_ex: false }, // Alice -> John
  { source: '3', target: '2', relationship_type: 'child', is_ex: false }, // Alice -> Jane
  { source: '5', target: '1', relationship_type: 'child', is_ex: false }, // Charlie -> John
  { source: '5', target: '2', relationship_type: 'child', is_ex: false }, // Charlie -> Jane
  { source: '6', target: '3', relationship_type: 'child', is_ex: false }, // Bob -> Alice
  { source: '6', target: '4', relationship_type: 'child', is_ex: false }, // Bob -> David
  { source: '7', target: '3', relationship_type: 'child', is_ex: false }, // Emily -> Alice
  { source: '7', target: '4', relationship_type: 'child', is_ex: false }, // Emily -> David
  
  // Spouse relationships
  { source: '1', target: '2', relationship_type: 'spouse', is_ex: false }, // John <-> Jane
  { source: '2', target: '1', relationship_type: 'spouse', is_ex: false }, // Jane <-> John
  { source: '3', target: '4', relationship_type: 'spouse', is_ex: true },  // Alice <-> David (ex)
  { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },  // David <-> Alice (ex)
  
  // Sibling relationships
  { source: '3', target: '5', relationship_type: 'sibling', is_ex: false }, // Alice <-> Charlie
  { source: '5', target: '3', relationship_type: 'sibling', is_ex: false }, // Charlie <-> Alice
  { source: '6', target: '7', relationship_type: 'sibling', is_ex: false }, // Bob <-> Emily
  { source: '7', target: '6', relationship_type: 'sibling', is_ex: false }, // Emily <-> Bob
];

// Test the relationship calculation
const charlieC = testPeople.find(p => p.full_name === 'Charlie C');
const aliceA = testPeople.find(p => p.full_name === 'Alice A');

console.log('=== CHARLIE C RELATIONSHIP TESTING ===');
console.log('Charlie C:', charlieC);
console.log('Alice A:', aliceA);

// Test what Alice A shows as when Charlie C is root
const aliceToCharlieRelation = calculateRelationshipToRoot(aliceA, charlieC, testPeople, testRelationships);
console.log(`Alice A's relationship to Charlie C (as root): ${aliceToCharlieRelation}`);

// Test a few other relationships from Charlie's perspective
testPeople.forEach(person => {
  if (person.id !== charlieC.id) {
    const relation = calculateRelationshipToRoot(person, charlieC, testPeople, testRelationships);
    console.log(`${person.full_name} -> Charlie C: ${relation}`);
  }
});

console.log('\n=== DEBUGGING RELATIONSHIP DATA ===');
console.log('Total relationships:', testRelationships.length);
console.log('Sibling relationships:', testRelationships.filter(r => r.relationship_type === 'sibling').length);

// Check sibling relationships specifically
const siblingRels = testRelationships.filter(r => r.relationship_type === 'sibling');
console.log('Sibling relationships:');
siblingRels.forEach(rel => {
  const sourcePerson = testPeople.find(p => p.id === rel.source);
  const targetPerson = testPeople.find(p => p.id === rel.target);
  console.log(`  ${sourcePerson?.full_name} <-> ${targetPerson?.full_name}`);
});
