// Quick test to verify sibling relationships work correctly
import { calculateRelationship } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test data with legitimate siblings Alice and Charlie
const testData = {
  people: [
    { id: 'alice', first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 'charlie', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
    { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' }
  ],
  relationships: [
    // Jane is parent to both Alice and Charlie (making them siblings)
    { person_a_id: 'jane', person_b_id: 'alice', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'charlie', relationship_type: 'Parent' }
  ]
};

console.log('Testing legitimate sibling relationships:');
console.log('Alice -> Charlie:', calculateRelationship('alice', 'charlie', testData));
console.log('Charlie -> Alice:', calculateRelationship('charlie', 'alice', testData));

// Test cross-generational data to ensure the fix holds
const crossGenData = {
  people: [
    { id: 'molly', first_name: 'Molly', last_name: 'M', gender: 'Female' },
    { id: 'alice', first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 'charlie', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
    { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' }
  ],
  relationships: [
    // Correct generational relationships
    { person_a_id: 'molly', person_b_id: 'jane', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'alice', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'charlie', relationship_type: 'Parent' },
    // Bad data: cross-generational "sibling" relationship
    { person_a_id: 'molly', person_b_id: 'alice', relationship_type: 'Sibling' },
    { person_a_id: 'alice', person_b_id: 'molly', relationship_type: 'Sibling' }
  ]
};

console.log('\nTesting cross-generational protection:');
console.log('Molly -> Alice:', calculateRelationship('molly', 'alice', crossGenData));
console.log('Alice -> Molly:', calculateRelationship('alice', 'molly', crossGenData));
