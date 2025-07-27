/**
 * Test a more complex scenario that might reproduce the parents-in-law generation issue
 * Testing different root person selections to see if the issue appears
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing Complex Parents-in-Law Scenario ===');

// More complex family structure with multiple generations and relationships
const people = [
  // John Doe and his wife Jane
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  
  // John's parents
  { id: 3, first_name: 'FatherDoe', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'MotherDoe', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Jane's parents  
  { id: 5, first_name: 'FatherSmith', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'MotherSmith', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  
  // John and Jane's children
  { id: 7, first_name: 'Child1', last_name: 'Doe', gender: 'Male', date_of_birth: '2010-01-01' },
  { id: 8, first_name: 'Child2', last_name: 'Doe', gender: 'Female', date_of_birth: '2012-01-01' },
  
  // Additional relatives that might affect positioning
  { id: 9, first_name: 'JohnSibling', last_name: 'Doe', gender: 'Female', date_of_birth: '1978-01-01' },
  { id: 10, first_name: 'JaneSibling', last_name: 'Smith', gender: 'Male', date_of_birth: '1980-01-01' }
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
  
  // Jane's parent relationships
  { source: 2, target: 5, type: 'parent', from: 2, to: 5 },
  { source: 5, target: 2, type: 'child', from: 5, to: 2 },
  { source: 2, target: 6, type: 'parent', from: 2, to: 6 },
  { source: 6, target: 2, type: 'child', from: 6, to: 2 },
  
  // John's parents are married
  { source: 3, target: 4, type: 'spouse', from: 3, to: 4 },
  { source: 4, target: 3, type: 'spouse', from: 4, to: 3 },
  
  // Jane's parents are married
  { source: 5, target: 6, type: 'spouse', from: 5, to: 6 },
  { source: 6, target: 5, type: 'spouse', from: 6, to: 5 },
  
  // Children relationships
  { source: 7, target: 1, type: 'parent', from: 7, to: 1 },
  { source: 1, target: 7, type: 'child', from: 1, to: 7 },
  { source: 7, target: 2, type: 'parent', from: 7, to: 2 },
  { source: 2, target: 7, type: 'child', from: 2, to: 7 },
  
  { source: 8, target: 1, type: 'parent', from: 8, to: 1 },
  { source: 1, target: 8, type: 'child', from: 1, to: 8 },
  { source: 8, target: 2, type: 'parent', from: 8, to: 2 },
  { source: 2, target: 8, type: 'child', from: 2, to: 8 },
  
  // Sibling relationships
  { source: 1, target: 9, type: 'sibling', from: 1, to: 9 },
  { source: 9, target: 1, type: 'sibling', from: 9, to: 1 },
  { source: 9, target: 3, type: 'parent', from: 9, to: 3 },
  { source: 3, target: 9, type: 'child', from: 3, to: 9 },
  { source: 9, target: 4, type: 'parent', from: 9, to: 4 },
  { source: 4, target: 9, type: 'child', from: 4, to: 9 },
  
  { source: 2, target: 10, type: 'sibling', from: 2, to: 10 },
  { source: 10, target: 2, type: 'sibling', from: 10, to: 2 },
  { source: 10, target: 5, type: 'parent', from: 10, to: 5 },
  { source: 5, target: 10, type: 'child', from: 5, to: 10 },
  { source: 10, target: 6, type: 'parent', from: 10, to: 6 },
  { source: 6, target: 10, type: 'child', from: 6, to: 10 }
];

function analyzeGenerations(result, title) {
  console.log(`--- ${title} ---`);
  
  console.log('All node positions:');
  result.nodes.forEach(node => {
    console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
  });
  
  // Group by generations
  const generationMap = new Map();
  result.nodes.forEach(node => {
    const y = node.position.y;
    if (!generationMap.has(y)) {
      generationMap.set(y, []);
    }
    generationMap.get(y).push(node.data.person.first_name);
  });
  
  console.log('');
  console.log('Generation groupings:');
  Array.from(generationMap.keys()).sort((a, b) => a - b).forEach(y => {
    console.log(`  y=${y}: ${generationMap.get(y).join(', ')}`);
  });
  
  // Check parents specifically
  const parentNames = ['FatherDoe', 'MotherDoe', 'FatherSmith', 'MotherSmith'];
  const parentNodes = parentNames.map(name => 
    result.nodes.find(n => n.data.person.first_name === name)
  ).filter(n => n);
  
  if (parentNodes.length === 4) {
    const parentGenerations = parentNodes.map(n => n.position.y);
    const allSameGeneration = parentGenerations.every(gen => gen === parentGenerations[0]);
    
    console.log('');
    console.log('Parent analysis:');
    parentNames.forEach(name => {
      const node = result.nodes.find(n => n.data.person.first_name === name);
      if (node) {
        console.log(`  ${name}: y=${node.position.y}`);
      }
    });
    
    if (allSameGeneration) {
      console.log('✅ All parents at same generation level');
    } else {
      console.log('❌ Parents at different generation levels');
      console.log(`   Generations: [${parentGenerations.join(', ')}]`);
    }
    
    return allSameGeneration;
  } else {
    console.log('❌ Could not find all parent nodes');
    return false;
  }
}

// Test with different root persons
const testCases = [
  { id: 1, name: 'John (married person)' },
  { id: 2, name: 'Jane (married person)' },
  { id: 3, name: 'FatherDoe (parent)' },
  { id: 5, name: 'FatherSmith (parent-in-law)' },
  { id: 7, name: 'Child1 (grandchild)' },
  { id: 9, name: 'JohnSibling (sibling)' }
];

const results = [];

testCases.forEach(testCase => {
  const result = createFamilyTreeLayout(people, relationships, testCase.id);
  const success = analyzeGenerations(result, `${testCase.name} as Root`);
  results.push({ name: testCase.name, success });
  console.log('');
});

console.log('=== Summary ===');

const allSuccessful = results.every(r => r.success);

if (allSuccessful) {
  console.log('✅ SUCCESS: All parents maintain same generation level regardless of root');
} else {
  console.log('❌ FAILURE: Some root selections cause parents to be at different levels');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.name}`);
  });
}

console.log('');
console.log('If any failures occurred above, that indicates the specific issue');
console.log('the user is experiencing: parents-in-law not being at the same');
console.log('generation level as parents when certain people are set as root.');