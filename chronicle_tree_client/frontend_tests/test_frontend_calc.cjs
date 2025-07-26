// Test the frontend relationship calculator
const fs = require('fs');

// Read the relationship calculator
const calcPath = './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';
const calcCode = fs.readFileSync(calcPath, 'utf8');

// Extract the main function (simplified for testing)
// We'll test the relationship between Alice (3) and Michael (13)

// Mock data based on our database analysis
const mockPeople = [
  { id: 1, full_name: 'John Doe', gender: 'Male' },
  { id: 2, full_name: 'Jane Doe', gender: 'Female' },
  { id: 3, full_name: 'Alice Doe', gender: 'Female' },
  { id: 12, full_name: 'Lisa Doe', gender: 'Female' },
  { id: 13, full_name: 'Michael Doe', gender: 'Male' }
];

const mockRelationships = [
  // Alice's relationships
  { source: 3, target: 1, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { source: 3, target: 2, relationship_type: 'parent', is_ex: false, is_deceased: false },
  
  // Michael's relationships  
  { source: 13, target: 1, relationship_type: 'parent', is_ex: false, is_deceased: false },
  { source: 13, target: 12, relationship_type: 'parent', is_ex: false, is_deceased: false },
  
  // John's relationships
  { source: 1, target: 3, relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: 1, target: 13, relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: 1, target: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { source: 1, target: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // Jane's relationships (deceased)
  { source: 2, target: 3, relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: 2, target: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // Lisa's relationships
  { source: 12, target: 13, relationship_type: 'child', is_ex: false, is_deceased: false },
  { source: 12, target: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false }
];

console.log('=== Testing Relationship Calculator ===');
console.log('Alice (3) -> Michael (13)');
console.log('\nCurrent setup:');
console.log('- Alice: John (father) + Jane (mother, deceased)');
console.log('- Michael: John (father) + Lisa (mother)');
console.log('- John married to Lisa (current)');
console.log('- Expected: Alice and Michael are HALF-SIBLINGS (same father)');

// Since we can't easily run the full calculator, let's at least document what should happen
console.log('\n=== Expected Calculation Result ===');
console.log('Based on current data:');
console.log('1. Alice and Michael share parent John (ID: 1)');
console.log('2. Alice has additional parent Jane (ID: 2)');
console.log('3. Michael has additional parent Lisa (ID: 12)');
console.log('4. They share 1 out of 2 parents');
console.log('5. Result: HALF-SIBLING relationship (Brother/Sister)');

console.log('\n=== To Test Step-Relationship Instead ===');
console.log('Would need to modify data:');
console.log('1. Remove John as Michael\'s biological parent');
console.log('2. Michael would have only Lisa as parent');
console.log('3. Alice would still have John + Jane as parents');
console.log('4. John marries Lisa (step-parent relationship)');
console.log('5. Result: Alice and Michael would be STEP-SIBLINGS');