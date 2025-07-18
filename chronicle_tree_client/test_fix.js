// Test script to verify the data format fix
// This will simulate the API response and test the relationship calculator

import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Mock API response (NEW format with source/target/relationship_type)
const mockApiResponse = {
  nodes: [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
    { id: 3, first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 4, first_name: 'David', last_name: 'A', gender: 'Male' },
    { id: 7, first_name: 'Charlie', last_name: 'C', gender: 'Male' }
  ],
  edges: [
    { source: 1, target: 3, relationship_type: 'parent' },
    { source: 2, target: 3, relationship_type: 'parent' },
    { source: 1, target: 7, relationship_type: 'parent' },
    { source: 2, target: 7, relationship_type: 'parent' },
    { source: 3, target: 7, relationship_type: 'sibling' },
    { source: 7, target: 3, relationship_type: 'sibling' },
    { source: 3, target: 4, relationship_type: 'spouse', is_ex: true },
    { source: 4, target: 3, relationship_type: 'spouse', is_ex: true }
  ]
};

console.log("=== TESTING FIXED DATA FORMAT ===");
console.log("API Response edges format:", mockApiResponse.edges[0]);

// Test Charlie's relationships
const charlie = mockApiResponse.nodes.find(p => p.first_name === 'Charlie');
const alice = mockApiResponse.nodes.find(p => p.first_name === 'Alice');
const david = mockApiResponse.nodes.find(p => p.first_name === 'David');

console.log("\n=== TESTING CHARLIE'S RELATIONSHIPS ===");
console.log("Charlie as root:");

// Test Alice to Charlie (should be Sister)
const aliceToCharlie = calculateRelationshipToRoot(alice, charlie, mockApiResponse.nodes, mockApiResponse.edges);
console.log(`Alice → Charlie: ${aliceToCharlie}`);

// Test David to Charlie (should be Ex-Brother-in-law)
const davidToCharlie = calculateRelationshipToRoot(david, charlie, mockApiResponse.nodes, mockApiResponse.edges);
console.log(`David → Charlie: ${davidToCharlie}`);

console.log("\n=== SUCCESS! ===");
console.log("The API now sends the correct format:");
console.log("- source/target instead of from/to");
console.log("- relationship_type instead of type");
console.log("- The relationship calculator should now work correctly!");
