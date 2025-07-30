// Test if ex-spouse relationship blocks step-relationship calculation
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing Ex-Spouse Impact on Step-Relationships ===");

const people = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false }
];

// Test 1: Alice and David are CURRENT spouses (not ex)
const currentSpouseRelationships = [
  // Lisa-John spouse
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false },
  
  // John-Alice parent-child
  { person_id: 1, relative_id: 3, relationship_type: 'child', is_ex: false },
  { person_id: 3, relative_id: 1, relationship_type: 'parent', is_ex: false },
  
  // Alice-David CURRENT spouse (not ex)
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: false },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: false },
  
  // Alice-Emily parent-child
  { person_id: 3, relative_id: 6, relationship_type: 'child', is_ex: false },
  { person_id: 6, relative_id: 3, relationship_type: 'parent', is_ex: false },
  
  // David-Emily parent-child
  { person_id: 4, relative_id: 6, relationship_type: 'child', is_ex: false },
  { person_id: 6, relative_id: 4, relationship_type: 'parent', is_ex: false },
  
  // Alice-Bob parent-child
  { person_id: 3, relative_id: 5, relationship_type: 'child', is_ex: false },
  { person_id: 5, relative_id: 3, relationship_type: 'parent', is_ex: false },
  
  // David-Bob parent-child  
  { person_id: 4, relative_id: 5, relationship_type: 'child', is_ex: false },
  { person_id: 5, relative_id: 4, relationship_type: 'parent', is_ex: false },
  
  // Bob-Emily sibling
  { person_id: 5, relative_id: 6, relationship_type: 'sibling', is_ex: false },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling', is_ex: false }
];

// Test 2: Alice and David are EX-spouses
const exSpouseRelationships = [
  // Lisa-John spouse
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false },
  
  // John-Alice parent-child
  { person_id: 1, relative_id: 3, relationship_type: 'child', is_ex: false },
  { person_id: 3, relative_id: 1, relationship_type: 'parent', is_ex: false },
  
  // Alice-David EX-spouse
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true },
  
  // Alice-Emily parent-child
  { person_id: 3, relative_id: 6, relationship_type: 'child', is_ex: false },
  { person_id: 6, relative_id: 3, relationship_type: 'parent', is_ex: false },
  
  // David-Emily parent-child
  { person_id: 4, relative_id: 6, relationship_type: 'child', is_ex: false },
  { person_id: 6, relative_id: 4, relationship_type: 'parent', is_ex: false },
  
  // Alice-Bob parent-child
  { person_id: 3, relative_id: 5, relationship_type: 'child', is_ex: false },
  { person_id: 5, relative_id: 3, relationship_type: 'parent', is_ex: false },
  
  // David-Bob parent-child
  { person_id: 4, relative_id: 5, relationship_type: 'child', is_ex: false },
  { person_id: 5, relative_id: 4, relationship_type: 'parent', is_ex: false },
  
  // Bob-Emily sibling
  { person_id: 5, relative_id: 6, relationship_type: 'sibling', is_ex: false },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling', is_ex: false }
];

const lisa = people.find(p => p.id === 12);
const emily = people.find(p => p.id === 6);
const bob = people.find(p => p.id === 5);

console.log("\n--- Test 1: Alice & David are CURRENT spouses ---");
try {
  const emilyResult = calculateRelationshipToRoot(emily, lisa, people, currentSpouseRelationships);
  const bobResult = calculateRelationshipToRoot(bob, lisa, people, currentSpouseRelationships);
  console.log(`Lisa -> Emily: "${emilyResult}"`);
  console.log(`Lisa -> Bob: "${bobResult}"`);
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Test 2: Alice & David are EX-spouses ---");
try {
  const emilyResult = calculateRelationshipToRoot(emily, lisa, people, exSpouseRelationships);
  const bobResult = calculateRelationshipToRoot(bob, lisa, people, exSpouseRelationships);
  console.log(`Lisa -> Emily: "${emilyResult}"`);
  console.log(`Lisa -> Bob: "${bobResult}"`);
  
  if (emilyResult === "Unrelated" || bobResult === "Unrelated") {
    console.log("❌ EX-SPOUSE BLOCKING: Algorithm blocks step-relationships through ex-spouses!");
  } else {
    console.log("✅ Ex-spouse doesn't block step-relationships");
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

console.log("\n--- Analysis ---");
console.log("If Emily/Bob show as 'Unrelated' when Alice & David are ex-spouses,");
console.log("then the algorithm is designed to NOT recognize step-relationships");
console.log("through ex-spouse connections, which might be intentional behavior.");
console.log("");
console.log("However, in real families, step-grandparents usually still consider");
console.log("their step-childrens children as step-grandchildren, even if the");
console.log("step-child is divorced.");