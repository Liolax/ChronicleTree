// Test the relationship calculator with Charlie's data
const fs = require('fs');
const path = require('path');

// Load the relationship calculator manually (simulate module loading)
const calculatorPath = path.join(__dirname, 'src', 'utils', 'improvedRelationshipCalculator.js');
let calculatorCode = fs.readFileSync(calculatorPath, 'utf8');

// Remove the import statement and export statement to make it work in Node.js
calculatorCode = calculatorCode.replace(/import.*from.*;\s*/g, '');
calculatorCode = calculatorCode.replace(/export\s+{[^}]*};\s*$/, '');

// Add the function to global scope
eval(calculatorCode);

// Mock data structure exactly as it comes from the API
const mockPeople = [
  { id: 1, full_name: 'John Doe', gender: 'male' },
  { id: 2, full_name: 'Jane Doe', gender: 'female' },
  { id: 3, full_name: 'Alice A', gender: 'female' },
  { id: 4, full_name: 'David A', gender: 'male' },
  { id: 5, full_name: 'Charlie C', gender: 'male' },
  { id: 6, full_name: 'Bob B', gender: 'male' },
  { id: 7, full_name: 'Emily E', gender: 'female' }
];

const mockRelationships = [
  // John (1) relationships
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 1, relative_id: 5, relationship_type: 'child' },
  
  // Jane (2) relationships  
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 2, relative_id: 5, relationship_type: 'child' },
  
  // Alice (3) relationships
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true },
  { person_id: 3, relative_id: 5, relationship_type: 'sibling' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 3, relative_id: 7, relationship_type: 'child' },
  
  // David (4) relationships
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true },
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 4, relative_id: 7, relationship_type: 'child' },
  
  // Charlie (5) relationships
  { person_id: 5, relative_id: 1, relationship_type: 'parent' },
  { person_id: 5, relative_id: 2, relationship_type: 'parent' },
  { person_id: 5, relative_id: 3, relationship_type: 'sibling' },
  
  // Bob (6) relationships
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  { person_id: 6, relative_id: 7, relationship_type: 'sibling' },
  
  // Emily (7) relationships
  { person_id: 7, relative_id: 3, relationship_type: 'parent' },
  { person_id: 7, relative_id: 4, relationship_type: 'parent' },
  { person_id: 7, relative_id: 6, relationship_type: 'sibling' }
];

console.log('=== TESTING RELATIONSHIP CALCULATOR WITH CHARLIE ===');

try {
  // Test what the calculator produces for each person relative to Charlie
  const charlieId = 5;
  const rootPerson = mockPeople.find(p => p.id === charlieId);
  
  console.log(`Testing relationships relative to ${rootPerson.full_name} (${charlieId})`);
  
  mockPeople.forEach(person => {
    if (person.id !== charlieId) {
      const relationship = calculateRelationshipToRoot(person, rootPerson, mockPeople, mockRelationships);
      console.log(`${person.full_name} → Charlie: "${relationship}"`);
    }
  });

  console.log('\n=== EXPECTED vs ACTUAL ===');
  const expectedRelationships = {
    'John Doe': 'Father',
    'Jane Doe': 'Mother', 
    'Alice A': 'Sister',
    'David A': 'Co-parent-in-law', // Alice's ex-husband
    'Bob B': 'Nephew', // Alice's son
    'Emily E': 'Niece' // Alice's daughter
  };
  
  Object.entries(expectedRelationships).forEach(([name, expected]) => {
    const person = mockPeople.find(p => p.full_name === name);
    const actual = calculateRelationshipToRoot(person, rootPerson, mockPeople, mockRelationships);
    const status = actual === expected ? '✅' : '❌';
    console.log(`${status} ${name}: Expected "${expected}", Got "${actual}"`);
  });

} catch (error) {
  console.error('Error testing relationship calculator:', error);
  console.error(error.stack);
}
