/**
 * Let me intercept the actual generation calculation to see what numbers are being assigned
 */

// I'll create a temporary modified version of the layout function
// Let me test a hypothesis: maybe the issue is not in post-processing but in the initial BFS generation assignment

// When we add sibling relationships to the BFS, maybe they're creating cycles or conflicts

console.log('=== Debug Generation Numbers Assigned ===');

// Let me manually simulate what should happen:

console.log('Expected logical flow:');
console.log('1. BFS starts with John at generation 0');
console.log('2. John\'s parents (JohnDad, JohnMom) assigned to generation -1');
console.log('3. Jane (John\'s spouse) assigned to generation 0');
console.log('4. Jane\'s parents (JaneDad, JaneMom) assigned to generation -1');
console.log('5. JohnUncle (JohnDad\'s sibling) assigned to generation -1 during BFS sibling traversal');
console.log('6. Post-processing aligns all generation -1 people together');
console.log('7. Result: All parents at same visual y-coordinate');
console.log('');

console.log('Possible bug scenarios:');
console.log('A) JohnUncle gets assigned a different generation number during BFS');
console.log('B) Post-processing creates conflicts between sibling and parent-in-law alignment');
console.log('C) The hierarchical positioning treats people with same generation number as different groups');
console.log('');

// Let me check if the issue is in the actual generation assignment by the current algorithm
import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

const people = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe', gender: 'Male', date_of_birth: '1954-01-01' }
];

const relationships = [
  { source: 1, target: 2, type: 'spouse', from: 1, to: 2 },
  { source: 2, target: 1, type: 'spouse', from: 2, to: 1 },
  { source: 1, target: 3, type: 'parent', from: 1, to: 3 },
  { source: 3, target: 1, type: 'child', from: 3, to: 1 },
  { source: 1, target: 4, type: 'parent', from: 1, to: 4 },
  { source: 4, target: 1, type: 'child', from: 4, to: 1 },
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  // The sibling relationship that causes the issue
  { source: 3, target: 7, type: 'sibling', from: 3, to: 7 },
  { source: 7, target: 3, type: 'sibling', from: 7, to: 3 }
];

console.log('Testing with uncle relationship that causes the split...');
const result = createFamilyTreeLayout(people, relationships, {}, 1);

// Let me group the results by y-coordinate to understand the actual generation assignments
const yGroups = new Map();
result.nodes.forEach(node => {
  const y = node.position.y;
  if (!yGroups.has(y)) {
    yGroups.set(y, []);
  }
  yGroups.get(y).push(node.data.person.first_name);
});

console.log('People grouped by actual y-coordinate (visual generations):');
Array.from(yGroups.entries())
  .sort((a, b) => a[0] - b[0])
  .forEach(([y, names]) => {
    console.log(`  y=${y}: [${names.join(', ')}]`);
  });

console.log('');
console.log('Key insight: If multiple y-coordinates exist for the parent generation,');
console.log('it means the algorithm is creating multiple logical generation numbers');
console.log('even though they should all be the same.');
console.log('');
console.log('The fact that JohnDad/JohnMom are at y=220 while others are at y=0');
console.log('suggests they are being assigned a different generation number');
console.log('(likely generation -1 vs generation 0 or something similar)');
console.log('');
console.log('This indicates the issue is in the generation calculation logic itself,');
console.log('not in the visual positioning logic.');