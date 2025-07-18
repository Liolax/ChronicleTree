// Debug script to test Charlie's relationships
const fs = require('fs');
const path = require('path');

// Load the relationship calculator
const calculatorPath = path.join(__dirname, 'src', 'utils', 'improvedRelationshipCalculator.js');
const calculatorCode = fs.readFileSync(calculatorPath, 'utf8');

// Mock data structure based on what we know from seeds
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

console.log('=== CHARLIE\'S RELATIONSHIP DEBUG ===');
console.log('Mock People:', mockPeople);
console.log('Mock Relationships:', mockRelationships);

// Extract Charlie's relationships
const charlieId = 5;
const charlieRelationships = mockRelationships.filter(r => r.person_id === charlieId);
console.log('Charlie\'s direct relationships:', charlieRelationships);

// Test each person's relationship to Charlie
console.log('\n=== TESTING EACH RELATIONSHIP TO CHARLIE ===');
mockPeople.forEach(person => {
  if (person.id !== charlieId) {
    const relationship = mockRelationships.find(r => 
      r.person_id === charlieId && r.relative_id === person.id
    );
    
    console.log(`${person.full_name} (${person.id}):`, relationship ? relationship.relationship_type : 'NOT FOUND');
  }
});
