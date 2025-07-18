// Simple test to check the data format mismatch
// This will help us understand what's happening

// Mock API data format (from Rails API controller)
const apiData = {
  "nodes": [
    { "id": 1, "first_name": "John", "last_name": "Doe" },
    { "id": 2, "first_name": "Jane", "last_name": "Doe" },
    { "id": 3, "first_name": "Alice", "last_name": "A" },
    { "id": 7, "first_name": "Charlie", "last_name": "C" }
  ],
  "edges": [
    { "from": 1, "to": 3, "type": "parent" },
    { "from": 2, "to": 3, "type": "parent" },
    { "from": 1, "to": 7, "type": "parent" },
    { "from": 2, "to": 7, "type": "parent" },
    { "from": 3, "to": 7, "type": "sibling" },
    { "from": 7, "to": 3, "type": "sibling" }
  ]
};

// Frontend expects relationships with source/target/relationship_type
const expectedFrontendFormat = [
  { "source": 1, "target": 3, "relationship_type": "parent" },
  { "source": 2, "target": 3, "relationship_type": "parent" },
  { "source": 1, "target": 7, "relationship_type": "parent" },
  { "source": 2, "target": 7, "relationship_type": "parent" },
  { "source": 3, "target": 7, "relationship_type": "sibling" },
  { "source": 7, "target": 3, "relationship_type": "sibling" }
];

console.log("=== DATA FORMAT ANALYSIS ===");
console.log("API sends edges with:", Object.keys(apiData.edges[0]));
console.log("Frontend expects:", Object.keys(expectedFrontendFormat[0]));

console.log("\n=== ACTUAL DATA MISMATCH ===");
console.log("API format:", apiData.edges[0]);
console.log("Frontend expects:", expectedFrontendFormat[0]);

console.log("\n=== SOLUTION ===");
console.log("The API sends: { from, to, type }");
console.log("Frontend expects: { source, target, relationship_type }");
console.log("The relationship calculator already supports both formats with fallbacks:");
console.log("- rel.source || rel.from");
console.log("- rel.target || rel.to");
console.log("- rel.type || rel.relationship_type");
console.log("\nBut the full_tree endpoint needs to be updated to send the correct format.");
