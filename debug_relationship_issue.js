// Debug script to test relationship calculation between Lisa Doe and Anderson children
// This will help us understand why Bob shows as Step-Grandson but Emily shows as Unrelated

console.log("=== Debug: Lisa Doe -> Anderson Children Relationships ===");

// Simulate the family structure from seeds.rb
const mockPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female' },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male' },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male' },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female' },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female' }
];

// Simulate relationships from seeds.rb
const mockRelationships = [
  // Alice's parents: John and Jane
  { from: 1, to: 3, relationship_type: 'child' },
  { from: 3, to: 1, relationship_type: 'parent' },
  { from: 2, to: 3, relationship_type: 'child' },
  { from: 3, to: 2, relationship_type: 'parent' },
  
  // Bob's parents: Alice and David
  { from: 3, to: 5, relationship_type: 'child' },
  { from: 5, to: 3, relationship_type: 'parent' },
  { from: 4, to: 5, relationship_type: 'child' },
  { from: 5, to: 4, relationship_type: 'parent' },
  
  // Emily's parents: Alice and David
  { from: 3, to: 6, relationship_type: 'child' },
  { from: 6, to: 3, relationship_type: 'parent' },
  { from: 4, to: 6, relationship_type: 'child' },
  { from: 6, to: 4, relationship_type: 'parent' },
  
  // Spouses
  { from: 1, to: 12, relationship_type: 'spouse' }, // John + Lisa (current)
  { from: 12, to: 1, relationship_type: 'spouse' },
  { from: 3, to: 4, relationship_type: 'spouse', is_ex: true }, // Alice + David (ex)
  { from: 4, to: 3, relationship_type: 'spouse', is_ex: true },
  
  // Siblings
  { from: 5, to: 6, relationship_type: 'sibling' }, // Bob + Emily
  { from: 6, to: 5, relationship_type: 'sibling' }
];

console.log("\nFamily Structure:");
console.log("Lisa Doe (root) -> married to John Doe");
console.log("John Doe -> father of Alice Doe");
console.log("Alice Doe -> mother of Bob Anderson and Emily Anderson");
console.log("David Anderson -> father of Bob Anderson and Emily Anderson");
console.log("\nExpected relationships from Lisa's perspective:");
console.log("- Bob Anderson: Step-Grandson");
console.log("- Emily Anderson: Step-Granddaughter");

// Basic relationship path tracing
function findRelationshipPath(fromPersonId, toPersonId, relationships) {
  const visited = new Set();
  const queue = [{ personId: fromPersonId, path: [] }];
  
  while (queue.length > 0) {
    const { personId, path } = queue.shift();
    
    if (personId === toPersonId) {
      return path;
    }
    
    if (visited.has(personId)) continue;
    visited.add(personId);
    
    // Find all relationships from this person
    const relatedPeople = relationships.filter(rel => rel.from === personId);
    
    for (const rel of relatedPeople) {
      if (!visited.has(rel.to)) {
        queue.push({
          personId: rel.to,
          path: [...path, { from: personId, to: rel.to, type: rel.relationship_type, is_ex: rel.is_ex }]
        });
      }
    }
  }
  
  return null; // No path found
}

// Test paths from Lisa to Bob and Emily
console.log("\n=== Relationship Path Analysis ===");

const lisaToBobPath = findRelationshipPath(12, 5, mockRelationships);
console.log("\nLisa -> Bob path:", lisaToBobPath);

const lisaToEmilyPath = findRelationshipPath(12, 6, mockRelationships);
console.log("Lisa -> Emily path:", lisaToEmilyPath);

if (lisaToBobPath && lisaToEmilyPath) {
  console.log("\nBoth paths found - algorithm should work for both children");
} else if (lisaToBobPath && !lisaToEmilyPath) {
  console.log("\nPROBLEM: Path found for Bob but not Emily!");
} else if (!lisaToBobPath && lisaToEmilyPath) {
  console.log("\nPROBLEM: Path found for Emily but not Bob!");
} else {
  console.log("\nPROBLEM: No paths found for either child!");
}

console.log("\n=== Possible Issues ===");
console.log("1. Missing sibling relationship between Bob and Emily");
console.log("2. Different relationship data for Bob vs Emily");
console.log("3. Bug in step-grandchild calculation algorithm");
console.log("4. Issue with bidirectional relationship lookup");