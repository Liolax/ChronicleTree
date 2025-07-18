/**
 * Test the actual relationship calculator to find the bug
 */

const { buildRelationshipMaps, calculateRelationship } = require('./src/utils/improvedRelationshipCalculator.js');

// Sample data matching the seeds.rb
const testPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
  { id: 3, first_name: 'Alice', last_name: 'A', gender: 'Female' },
  { id: 4, first_name: 'David', last_name: 'A', gender: 'Male' },
  { id: 5, first_name: 'Charlie', last_name: 'C', gender: 'Male' },
  { id: 6, first_name: 'Bob', last_name: 'B', gender: 'Male' },
  { id: 7, first_name: 'Emily', last_name: 'E', gender: 'Female' }
];

const testRelationships = [
  // Parent-child relationships
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 1, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 1, relationship_type: 'parent' },
  { person_id: 2, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 2, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  { person_id: 3, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 3, relationship_type: 'parent' },
  { person_id: 4, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 4, relationship_type: 'parent' },
  
  // Spouse relationships
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true },
  
  // Sibling relationships
  { person_id: 6, relative_id: 7, relationship_type: 'sibling' },
  { person_id: 7, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 5, relative_id: 3, relationship_type: 'sibling' },
  { person_id: 3, relative_id: 5, relationship_type: 'sibling' }
];

console.log('=== TESTING ACTUAL RELATIONSHIP CALCULATOR ===');

try {
  const charlieId = '5';
  const davidId = '4';
  
  const result = calculateRelationship(charlieId, davidId, testPeople, testRelationships);
  console.log(`Charlie (5) → David (4): "${result}"`);
  
  // Also test the reverse
  const reverseResult = calculateRelationship(davidId, charlieId, testPeople, testRelationships);
  console.log(`David (4) → Charlie (5): "${reverseResult}"`);
  
  // Let's debug the relationship maps that are being built
  const maps = buildRelationshipMaps(testPeople, testRelationships);
  
  console.log('\n--- Relationship Maps Debug ---');
  console.log('Charlie\'s children:', Array.from(maps.parentToChildren.get(charlieId) || []));
  console.log('David\'s children:', Array.from(maps.parentToChildren.get(davidId) || []));
  
  // Test each relationship type individually
  console.log('\n--- Testing specific relationship functions ---');
  
} catch (error) {
  console.error('Error testing relationship calculator:', error.message);
  console.error('Stack:', error.stack);
}
