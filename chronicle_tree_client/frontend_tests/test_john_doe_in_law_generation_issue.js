/**
 * Test the specific issue: When John Doe is root, his parents are positioned correctly,
 * but other people at the same generation (parents-in-law, uncle-in-law) are positioned badly
 */

import { createFamilyTreeLayout } from '../src/utils/familyTreeHierarchicalLayout.js';

console.log('=== Testing John Doe In-Law Generation Issue ===');

// Complex family structure to reproduce the issue
const people = [
  // John Doe and his wife Jane
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  
  // John's parents (should be positioned correctly)
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  
  // Jane's parents (John's parents-in-law - should be same generation as John's parents)
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  
  // John's uncle (John's parent's brother - should be same generation as John's parents)
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe', gender: 'Male', date_of_birth: '1954-01-01' },
  
  // John's uncle's wife (John's aunt-in-law - should be same generation)
  { id: 8, first_name: 'JohnAunt', last_name: 'Doe', gender: 'Female', date_of_birth: '1956-01-01' },
  
  // Jane's sibling (should be same generation as John)
  { id: 9, first_name: 'JaneBrother', last_name: 'Smith', gender: 'Male', date_of_birth: '1984-01-01' },
  
  // Jane's sibling's spouse (John's sibling-in-law - should be same generation as John)
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

console.log('Family structure:');
console.log('John Doe (root) married to Jane Smith');
console.log('John\'s parents: JohnDad & JohnMom (should be positioned correctly)');
console.log('Jane\'s parents: JaneDad & JaneMom (John\'s parents-in-law - should be same generation as John\'s parents)');
console.log('John\'s uncle: JohnUncle (JohnDad\'s brother - should be same generation as John\'s parents)');
console.log('John\'s aunt-in-law: JohnAunt (JohnUncle\'s wife - should be same generation as John\'s parents)');
console.log('Jane\'s brother: JaneBrother (should be same generation as John)');
console.log('Jane\'s sister-in-law: JaneSisterInLaw (JaneBrother\'s wife - should be same generation as John)');
console.log('');

console.log('--- Testing with John Doe as Root ---');

const result = createFamilyTreeLayout(people, relationships, 1); // John as root

console.log('All node positions:');
result.nodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: x=${node.position.x}, y=${node.position.y}`);
});

console.log('');

// Analyze generations
const expectedGenerations = {
  // John's generation (root generation)
  johnGeneration: ['John', 'Jane', 'JaneBrother', 'JaneSisterInLaw'],
  
  // Parent generation (should all be at same level)
  parentGeneration: ['JohnDad', 'JohnMom', 'JaneDad', 'JaneMom', 'JohnUncle', 'JohnAunt']
};

console.log('--- Generation Analysis ---');

// Check John's generation
console.log('John\'s generation (should all be at same level):');
const johnGenNodes = expectedGenerations.johnGeneration.map(name => 
  result.nodes.find(n => n.data.person.first_name === name)
).filter(n => n);

johnGenNodes.forEach(node => {
  console.log(`  ${node.data.person.first_name}: y=${node.position.y}`);
});

const johnGenLevels = johnGenNodes.map(n => n.position.y);
const johnGenConsistent = johnGenLevels.every(y => y === johnGenLevels[0]);

if (johnGenConsistent) {
  console.log('✅ John\'s generation: All at same level');
} else {
  console.log('❌ John\'s generation: Not all at same level');
  console.log(`   Levels: [${johnGenLevels.join(', ')}]`);
}

console.log('');

// Check parent generation (this is where the issue likely is)
console.log('Parent generation (should all be at same level):');
const parentGenNodes = expectedGenerations.parentGeneration.map(name => 
  result.nodes.find(n => n.data.person.first_name === name)
).filter(n => n);

parentGenNodes.forEach(node => {
  const relationship = getRelationshipToJohn(node.data.person.first_name);
  console.log(`  ${node.data.person.first_name} (${relationship}): y=${node.position.y}`);
});

const parentGenLevels = parentGenNodes.map(n => n.position.y);
const parentGenConsistent = parentGenLevels.every(y => y === parentGenLevels[0]);

if (parentGenConsistent) {
  console.log('✅ Parent generation: All at same level');
} else {
  console.log('❌ Parent generation: Not all at same level - THIS IS THE ISSUE');
  console.log(`   Levels: [${parentGenLevels.join(', ')}]`);
  
  // Identify which ones are positioned incorrectly
  const correctLevel = parentGenLevels[0]; // Assume first one is correct (John's parents)
  parentGenNodes.forEach((node, index) => {
    const level = parentGenLevels[index];
    const relationship = getRelationshipToJohn(node.data.person.first_name);
    if (level !== correctLevel) {
      console.log(`   ❌ ${node.data.person.first_name} (${relationship}) at wrong level: y=${level} (should be y=${correctLevel})`);
    } else {
      console.log(`   ✅ ${node.data.person.first_name} (${relationship}) at correct level: y=${level}`);
    }
  });
}

function getRelationshipToJohn(name) {
  switch (name) {
    case 'JohnDad': return 'John\'s father';
    case 'JohnMom': return 'John\'s mother';
    case 'JaneDad': return 'John\'s father-in-law';
    case 'JaneMom': return 'John\'s mother-in-law';
    case 'JohnUncle': return 'John\'s uncle';
    case 'JohnAunt': return 'John\'s aunt-in-law';
    default: return 'unknown';
  }
}

console.log('');
console.log('=== Expected Behavior ===');
console.log('When John Doe is root:');
console.log('✅ John\'s parents should be positioned correctly (they probably are)');
console.log('✅ John\'s parents-in-law should be at SAME level as John\'s parents');
console.log('✅ John\'s uncle should be at SAME level as John\'s parents (same generation)'); 
console.log('✅ John\'s aunt-in-law should be at SAME level as John\'s parents');
console.log('✅ ALL people in the parent generation should have the same y-coordinate');
console.log('');
console.log('The issue is that the current algorithm only handles:');
console.log('- Spouses (married couples)');
console.log('- Co-parents (people who share children)');
console.log('But it doesn\'t handle broader generational relationships like:');
console.log('- Parents-in-law relationships');
console.log('- Uncle/aunt-in-law relationships');
console.log('- Other extended family at the same generation level');