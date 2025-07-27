/**
 * Debug why blue dotted sibling edges aren't showing up
 */

import { transformFamilyData } from '../src/utils/reactFlowLayout.js';

console.log('=== Debug Sibling Edge Creation ===');

// Simple test case: Patricia and David as brothers with no parents
const people = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female' },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male' }
];

const relationships = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 },
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 }
];

console.log('Input data:');
console.log('People:', people);
console.log('Relationships:', relationships);
console.log('');

// Create the edges
const { nodes, edges } = transformFamilyData(people, relationships);

console.log('Generated edges:');
edges.forEach((edge, index) => {
  console.log(`Edge ${index + 1}:`);
  console.log(`  ID: ${edge.id}`);
  console.log(`  Source: ${edge.source} -> Target: ${edge.target}`);
  console.log(`  Original type: ${edge.data.relationship.type}`);
  console.log(`  Effective type: ${edge.data.effectiveType}`);
  console.log(`  Style:`, edge.style);
  console.log('');
});

// Check if the checkIsDirectSibling function is working
console.log('=== Testing checkIsDirectSibling function manually ===');

// Manually test the logic
const person1Id = '1';
const person2Id = '2';

// Find parents of person1
const person1Parents = new Set();
relationships.forEach(rel => {
  const source = String(rel.source || rel.from);
  const target = String(rel.target || rel.to);
  
  if (source === person1Id && rel.type === 'parent') {
    person1Parents.add(target);
  } else if (target === person1Id && rel.type === 'child') {
    person1Parents.add(source);
  }
});

// Find parents of person2
const person2Parents = new Set();
relationships.forEach(rel => {
  const source = String(rel.source || rel.from);
  const target = String(rel.target || rel.to);
  
  if (source === person2Id && rel.type === 'parent') {
    person2Parents.add(target);
  } else if (target === person2Id && rel.type === 'child') {
    person2Parents.add(source);
  }
});

console.log(`Person 1 (${person1Id}) parents:`, Array.from(person1Parents));
console.log(`Person 2 (${person2Id}) parents:`, Array.from(person2Parents));

// Check if they share any parents
const sharedParents = [...person1Parents].filter(parent => person2Parents.has(parent));
console.log('Shared parents:', sharedParents);

// Direct siblings = siblings with no shared parents
const isDirectSibling = sharedParents.length === 0;
console.log(`Is direct sibling: ${isDirectSibling}`);

if (isDirectSibling) {
  console.log('✅ Should get blue dotted edges');
} else {
  console.log('❌ Should get regular green dashed edges');
}