/**
 * Test dotted blue sibling connectors in family tree visualization
 */

// Import the layout function
import { transformFamilyData } from '../src/utils/reactFlowLayout.js';

const testPeople = [
  { id: 1, first_name: 'Patricia', last_name: 'Smith', gender: 'Female', date_of_birth: '1990-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'David', last_name: 'Smith', gender: 'Male', date_of_birth: '1992-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'John', last_name: 'Smith', gender: 'Male', date_of_birth: '1960-01-01', date_of_death: null, is_deceased: false }, // Parent
  { id: 4, first_name: 'Sarah', last_name: 'Smith', gender: 'Female', date_of_birth: '1988-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Mike', last_name: 'Smith', gender: 'Male', date_of_birth: '1990-01-01', date_of_death: null, is_deceased: false },
];

console.log('=== Testing Dotted Blue Sibling Connectors ===');
console.log('');

// Test Case 1: Direct siblings (no parents declared) - should get blue dotted connectors
console.log('--- Test Case 1: Direct Siblings (No Parents) ---');
const directSiblingRelationships = [
  { source: 1, target: 2, type: 'brother', from: 1, to: 2 }, // Patricia -> David
  { source: 2, target: 1, type: 'sister', from: 2, to: 1 }, // David -> Patricia
];

const { nodes: nodes1, edges: edges1 } = transformFamilyData(
  testPeople.slice(0, 2), // Just Patricia and David
  directSiblingRelationships
);

console.log('Direct sibling edges:');
edges1.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}: ${edge.data.effectiveType || edge.data.relationship.type}`);
  console.log(`    Style: stroke=${edge.style.stroke}, strokeDasharray=${edge.style.strokeDasharray}`);
  console.log(`    Expected: stroke=#3b82f6 (blue), strokeDasharray=2 6 (dotted)`);
  
  if (edge.style.stroke === '#3b82f6' && edge.style.strokeDasharray === '2 6') {
    console.log(`    ✅ CORRECT: Blue dotted connector detected`);
  } else {
    console.log(`    ❌ INCORRECT: Expected blue dotted connector`);
  }
});
console.log('');

// Test Case 2: Regular siblings (with shared parents) - should get green dashed connectors
console.log('--- Test Case 2: Regular Siblings (With Shared Parents) ---');
const regularSiblingRelationships = [
  // Sarah and Mike both have John as parent
  { source: 4, target: 3, type: 'parent', from: 4, to: 3 }, // Sarah -> John as parent
  { source: 3, target: 4, type: 'child', from: 3, to: 4 },  // John -> Sarah as child
  { source: 5, target: 3, type: 'parent', from: 5, to: 3 }, // Mike -> John as parent  
  { source: 3, target: 5, type: 'child', from: 3, to: 5 },  // John -> Mike as child
  // Direct sibling relationship between Sarah and Mike
  { source: 4, target: 5, type: 'brother', from: 4, to: 5 }, // Sarah -> Mike
  { source: 5, target: 4, type: 'sister', from: 5, to: 4 },  // Mike -> Sarah
];

const { nodes: nodes2, edges: edges2 } = transformFamilyData(
  [testPeople[2], testPeople[3], testPeople[4]], // John, Sarah, Mike
  regularSiblingRelationships
);

console.log('Regular sibling edges:');
const siblingEdges = edges2.filter(edge => 
  ['sibling', 'brother', 'sister', 'Brother', 'Sister'].includes(edge.data.relationship.type)
);

siblingEdges.forEach(edge => {
  console.log(`  ${edge.source} -> ${edge.target}: ${edge.data.effectiveType || edge.data.relationship.type}`);
  console.log(`    Style: stroke=${edge.style.stroke}, strokeDasharray=${edge.style.strokeDasharray}`);
  console.log(`    Expected: stroke=#10b981 (green), strokeDasharray=3 3 (dashed)`);
  
  if (edge.style.stroke === '#10b981' && edge.style.strokeDasharray === '3 3') {
    console.log(`    ✅ CORRECT: Green dashed connector detected`);
  } else if (edge.style.stroke === '#3b82f6' && edge.style.strokeDasharray === '2 6') {
    console.log(`    ❌ INCORRECT: Got blue dotted (should be green dashed for siblings with parents)`);
  } else {
    console.log(`    ❌ INCORRECT: Unexpected style`);
  }
});

console.log('');
console.log('=== Summary ===');
console.log('✅ Direct siblings (no parents): Blue dotted connectors (#3b82f6, 2 6)');
console.log('✅ Regular siblings (with parents): Green dashed connectors (#10b981, 3 3)');
console.log('');
console.log('This allows family tree visualization to distinguish between:');
console.log('- Known siblings with unknown parents (blue dotted)');
console.log('- Known siblings through shared parents (green dashed)');