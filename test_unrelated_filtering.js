// Test script to check if showUnrelated filtering affects Emily/Lisa
import { getAllRelationshipsToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test data - same as used in tree view
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
    
    // Jane's relationships
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

// Convert edges to relationships (same logic as tree view)
function convertEdgesToRelationships(edges) {
  const relationships = [];
  
  edges.forEach(edge => {
    relationships.push({
      person_id: edge.source,
      relative_id: edge.target,
      relationship_type: edge.relationship_type === 'parent' ? 'child' : edge.relationship_type,
      is_ex: edge.is_ex || false,
      is_deceased: edge.is_deceased || false
    });
    
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

console.log("=== Testing showUnrelated Filtering Logic ===");

// Test Lisa as root (ID 12)
const lisa = apiResponse.nodes.find(p => p.id === 12);
const emily = apiResponse.nodes.find(p => p.id === 6);
const bob = apiResponse.nodes.find(p => p.id === 5);

console.log("\n--- Lisa as Root: Calculate All Relationships ---");

// Use the exact same function as FamilyTreeFlow
const peopleWithRelations = getAllRelationshipsToRoot(
  lisa, 
  apiResponse.nodes, 
  convertEdgesToRelationships(apiResponse.edges)
);

console.log("All people with relations from Lisa's perspective:");
peopleWithRelations.forEach(person => {
  console.log(`- ${person.first_name} ${person.last_name} (ID: ${person.id}): "${person.relation}"`);
});

// Test the filtering logic (same as FamilyTreeFlow line 94)
console.log("\n--- Apply showUnrelated=false filtering ---");
const filteredWithUnrelated = peopleWithRelations.filter(node => node.relation !== 'Unrelated');

console.log("After filtering out 'Unrelated' people:");
filteredWithUnrelated.forEach(person => {
  console.log(`- ${person.first_name} ${person.last_name} (ID: ${person.id}): "${person.relation}"`);
});

// Check specifically for Emily and Bob
console.log("\n--- Focus on Emily and Bob ---");
const emilyResult = peopleWithRelations.find(p => p.id === 6);
const bobResult = peopleWithRelations.find(p => p.id === 5);

console.log(`Emily: relation = "${emilyResult?.relation}" (filtered out: ${emilyResult?.relation === 'Unrelated'})`);
console.log(`Bob: relation = "${bobResult?.relation}" (filtered out: ${bobResult?.relation === 'Unrelated'})`);

// Test edge cases
console.log("\n--- Test Empty String Filtering ---");
const testCases = [
  { name: 'Emily', relation: 'Step-Granddaughter' },
  { name: 'Emily_Empty', relation: '' },
  { name: 'Emily_Unrelated', relation: 'Unrelated' },
  { name: 'Bob', relation: 'Step-Grandson' }
];

console.log("Filter test (showUnrelated=false):");
testCases.forEach(test => {
  const wouldBeFiltered = test.relation === 'Unrelated';
  console.log(`- ${test.name} with relation "${test.relation}": filtered = ${wouldBeFiltered}`);
});

// Test what happens if relation is empty string
console.log("\n--- Empty String vs Unrelated ---");
console.log("Empty string ('') === 'Unrelated':", '' === 'Unrelated');
console.log("Empty string ('') !== 'Unrelated':", '' !== 'Unrelated');
console.log("So empty strings would NOT be filtered out by showUnrelated=false logic");