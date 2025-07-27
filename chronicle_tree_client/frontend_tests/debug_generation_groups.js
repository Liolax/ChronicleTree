/**
 * Debug to understand why people at the same generation get different y-coordinates
 */

// Let me create a simplified debug version by adding console logs to the layout function
// First, let me understand the generation assignment better

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Debugging Generation Groups ===');

// Same test case
const people = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe', gender: 'Male', date_of_birth: '1954-01-01' },
  { id: 8, first_name: 'JohnAunt', last_name: 'Doe', gender: 'Female', date_of_birth: '1956-01-01' },
  { id: 9, first_name: 'JaneBrother', last_name: 'Smith', gender: 'Male', date_of_birth: '1984-01-01' },
  { id: 10, first_name: 'JaneSisterInLaw', last_name: 'Brown', gender: 'Female', date_of_birth: '1986-01-01' }
];

const relationships = [
  // John and Jane marriage
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  // John's parent relationships
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  { source: 1, target: 4, type: 'parent', from: 1, to: 4 },
  { source: 4, target: 1, type: 'child', from: 4, to: 1 },
  // John's parents marriage
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  // Jane's parent relationships
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  // Jane's parents marriage  
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  // John's uncle relationship (JohnUncle is JohnDad's brother)
  { source: 3, target: 7, type: 'sibling', from: 3, to: 7 },
  { source: 7, target: 3, type: 'sibling', from: 7, to: 3 },
  // John's uncle's marriage (to John's aunt-in-law)
  { source: 7, target: 8, type: 'spouse', from: 7, to: 8 },
  { source: 8, target: 7, type: 'spouse', from: 8, to: 7 },
  // Jane's sibling relationship
  { source: 2, target: 9, type: 'sibling', from: 2, to: 9 },
  { source: 9, target: 2, type: 'sibling', from: 9, to: 2 },
  // Jane's sibling's parent relationships (same parents as Jane)
  { source: 9, target: 5, type: 'parent', from: 9, to: 5 },
  { source: 5, target: 9, type: 'child', from: 5, to: 9 },
  { source: 9, target: 6, type: 'parent', from: 9, to: 6 },
  { source: 6, target: 9, type: 'child', from: 6, to: 9 },
  // Jane's brother's marriage
  { source: 9, target: 10, type: 'spouse', from: 9, to: 10 },
  { source: 10, target: 9, type: 'spouse', from: 10, to: 9 }
];

const result = createFamilyTreeLayout(people, relationships, {}, 1);

console.log('All people and their y-coordinates:');
result.nodes.forEach(node => {
  const name = node.data.person.first_name;
  const y = node.position.y;
  console.log(`${name}: y=${y}`);
});

console.log('');
console.log('Generation analysis:');
const generations = new Map();

// Group by y-coordinate to understand the actual generations
result.nodes.forEach(node => {
  const y = node.position.y;
  if (!generations.has(y)) {
    generations.set(y, []);
  }
  generations.get(y).push(node.data.person.first_name);
});

console.log('People grouped by y-coordinate (actual visual generations):');
Array.from(generations.entries())
  .sort((a, b) => a[0] - b[0]) // Sort by y-coordinate
  .forEach(([y, names]) => {
    console.log(`  y=${y}: [${names.join(', ')}]`);
  });

console.log('');
console.log('=== The Problem ===');
console.log('We have people at 2 different y-coordinates within the parent generation:');
console.log('- y=0: JaneDad, JaneMom, JohnUncle, JohnAunt (disconnected from main tree in BFS)');
console.log('- y=220: JohnDad, JohnMom (directly connected to John in BFS)');
console.log('');
console.log('This suggests that the BFS assigns them to the same logical generation (0),');
console.log('but the hierarchical positioning treats them as separate visual generations.');
console.log('');
console.log('Possible causes:');
console.log('1. Multiple generation 0 groups are created');
console.log('2. The generationGroups Map is not properly merging people with same generation');
console.log('3. The generation alignment post-processing is happening after positioning');