// Test script to simulate tree view behavior with actual API data structure
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Simulate the full_tree API response data structure
const apiResponse = {
  nodes: [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: null, is_deceased: true },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
    { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
    { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
    { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
    { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1997-01-01', date_of_death: null, is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false }
  ],
  edges: [
    // John's relationships
    { source: 1, target: 3, relationship_type: 'parent' },
    { source: 1, target: 7, relationship_type: 'parent' },
    { source: 1, target: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
    
    // Jane's relationships (reverse direction would be in edges if bidirectional)
    { source: 2, target: 3, relationship_type: 'parent' },
    { source: 2, target: 7, relationship_type: 'parent' },
    
    // Alice's relationships
    { source: 3, target: 5, relationship_type: 'parent' },
    { source: 3, target: 6, relationship_type: 'parent' },
    { source: 3, target: 4, relationship_type: 'spouse', is_ex: true, is_deceased: false },
    { source: 3, target: 7, relationship_type: 'sibling' },
    
    // David's relationships
    { source: 4, target: 5, relationship_type: 'parent' },
    { source: 4, target: 6, relationship_type: 'parent' },
    
    // Sibling relationship
    { source: 5, target: 6, relationship_type: 'sibling' }
  ]
};

// Convert edges to relationship format that calculator expects
function convertEdgesToRelationships(edges) {
  const relationships = [];
  
  edges.forEach(edge => {
    // Forward relationship
    relationships.push({
      person_id: edge.source,
      relative_id: edge.target,
      relationship_type: edge.relationship_type === 'parent' ? 'child' : edge.relationship_type,
      is_ex: edge.is_ex || false,
      is_deceased: edge.is_deceased || false
    });
    
    // Reverse relationship (bidirectional)
    if (edge.relationship_type === 'parent') {
      relationships.push({
        person_id: edge.target,
        relative_id: edge.source,
        relationship_type: 'parent',
        is_ex: edge.is_ex || false,
        is_deceased: edge.is_deceased || false
      });
    } else if (edge.relationship_type === 'spouse') {
      relationships.push({
        person_id: edge.target,
        relative_id: edge.source,
        relationship_type: 'spouse',
        is_ex: edge.is_ex || false,
        is_deceased: edge.is_deceased || false
      });
    } else if (edge.relationship_type === 'sibling') {
      relationships.push({
        person_id: edge.target,
        relative_id: edge.source,
        relationship_type: 'sibling',
        is_ex: edge.is_ex || false,
        is_deceased: edge.is_deceased || false
      });
    }
  });
  
  return relationships;
}

const relationships = convertEdgesToRelationships(apiResponse.edges);

console.log("=== Testing Tree View Data Structure ===");
console.log("Generated relationships:", relationships.length);

// Test Lisa as root (ID 12)
const lisa = apiResponse.nodes.find(p => p.id === 12);
const emily = apiResponse.nodes.find(p => p.id === 6);
const bob = apiResponse.nodes.find(p => p.id === 5);

console.log("\n--- Lisa as Root (Tree View Scenario) ---");
console.log("Lisa:", lisa);

console.log("\n--- Lisa -> Emily ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, apiResponse.nodes, relationships);
  console.log("Emily from Lisa's perspective:", result);
} catch (error) {
  console.log("Error:", error.message);
}

console.log("\n--- Lisa -> Bob ---");
try {
  const result = calculateRelationshipToRoot(bob, lisa, apiResponse.nodes, relationships);
  console.log("Bob from Lisa's perspective:", result);
} catch (error) {
  console.log("Error:", error.message);
}

// Debug: Check Lisa's connections
console.log("\n--- Lisa's Relationships in Data ---");
const lisaRelationships = relationships.filter(r => r.person_id === 12 || r.relative_id === 12);
console.log("Lisa's relationships:", lisaRelationships);

// Debug: Check paths to Emily and Bob
console.log("\n--- Debugging Connection Paths ---");
console.log("Emily's relationships:", relationships.filter(r => r.person_id === 6 || r.relative_id === 6));
console.log("Bob's relationships:", relationships.filter(r => r.person_id === 5 || r.relative_id === 5));

// Check Alice (Emily and Bob's mother) and her relationship to John (Lisa's husband)
const alice = apiResponse.nodes.find(p => p.id === 3);
const john = apiResponse.nodes.find(p => p.id === 1);
console.log("\nAlice's relationships:", relationships.filter(r => r.person_id === 3 || r.relative_id === 3));
console.log("John's relationships:", relationships.filter(r => r.person_id === 1 || r.relative_id === 1));