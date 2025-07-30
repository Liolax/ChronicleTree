// Debug step-grandchild calculation logic step by step
import { buildRelationshipMaps } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Exact same data as before
const mockPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01' },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01' },
  { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01' },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01' },
  { id: 7, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '1997-01-01' },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10' }
];

const mockRelationships = [
  // Parent-child relationships (bidirectional as in seeds.rb)
  // John's children
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 1, relationship_type: 'parent' },
  
  // Jane's children (deceased)
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 2, relationship_type: 'parent' },
  
  // Alice's children
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  
  // David's children
  { person_id: 4, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  
  // Spouses
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  
  // Siblings
  { person_id: 3, relative_id: 7, relationship_type: 'sibling' },
  { person_id: 7, relative_id: 3, relationship_type: 'sibling' },
  { person_id: 5, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling' }
];

console.log("=== Step-Grandchild Logic Debug ===");

// Build the relationship maps
const relationshipMaps = buildRelationshipMaps(mockRelationships, mockPeople);
const { childToParents, spouseMap, deceasedSpouseMap } = relationshipMaps;

console.log("\n--- Relationship Maps ---");
console.log("childToParents:");
for (const [childId, parentSet] of childToParents) {
  const child = mockPeople.find(p => p.id == childId);
  const parents = Array.from(parentSet).map(parentId => {
    const parent = mockPeople.find(p => p.id == parentId);
    return `${parent?.first_name} ${parent?.last_name} (${parentId})`;
  });
  console.log(`  ${child?.first_name} ${child?.last_name} (${childId}): [${parents.join(', ')}]`);
}

console.log("\nspouseMap:");
for (const [personId, spouseSet] of spouseMap) {
  const person = mockPeople.find(p => p.id == personId);
  const spouses = Array.from(spouseSet).map(spouseId => {
    const spouse = mockPeople.find(p => p.id == spouseId);
    return `${spouse?.first_name} ${spouse?.last_name} (${spouseId})`;
  });
  console.log(`  ${person?.first_name} ${person?.last_name} (${personId}): [${spouses.join(', ')}]`);
}

console.log("\ndeceasedSpouseMap:");
for (const [personId, spouseSet] of deceasedSpouseMap) {
  const person = mockPeople.find(p => p.id == personId);
  const spouses = Array.from(spouseSet).map(spouseId => {
    const spouse = mockPeople.find(p => p.id == spouseId);
    return `${spouse?.first_name} ${spouse?.last_name} (${spouseId})`;
  });
  console.log(`  ${person?.first_name} ${person?.last_name} (${personId}): [${spouses.join(', ')}]`);
}

// Now trace step-grandchild logic manually for both Bob and Emily
function traceStepGrandchild(personId, rootId, personName) {
  console.log(`\n--- Tracing Step-Grandchild for ${personName} (${personId}) -> Lisa (${rootId}) ---`);
  
  // Get person's parents
  const personParents = childToParents.get(String(personId)) || new Set();
  console.log(`${personName}'s parents:`, Array.from(personParents).map(id => {
    const p = mockPeople.find(p => p.id == id);
    return `${p?.first_name} ${p?.last_name} (${id})`;
  }));
  
  // For each parent, get their parents (person's grandparents)
  for (const parent of personParents) {
    const grandparents = childToParents.get(parent) || new Set();
    console.log(`  Parent ${parent}'s parents (${personName}'s grandparents):`, Array.from(grandparents).map(id => {
      const p = mockPeople.find(p => p.id == id);
      return `${p?.first_name} ${p?.last_name} (${id})`;
    }));
    
    // For each grandparent, check if Lisa (root) is married to them
    for (const grandparent of grandparents) {
      const grandparentSpouses = spouseMap.get(grandparent) || new Set();
      const grandparentDeceasedSpouses = deceasedSpouseMap.get(grandparent) || new Set();
      
      console.log(`    Grandparent ${grandparent} current spouses:`, Array.from(grandparentSpouses).map(id => {
        const p = mockPeople.find(p => p.id == id);
        return `${p?.first_name} ${p?.last_name} (${id})`;
      }));
      
      console.log(`    Grandparent ${grandparent} deceased spouses:`, Array.from(grandparentDeceasedSpouses).map(id => {
        const p = mockPeople.find(p => p.id == id);
        return `${p?.first_name} ${p?.last_name} (${id})`;
      }));
      
      // Check if Lisa is in current spouses
      if (grandparentSpouses.has(String(rootId))) {
        console.log(`    ✓ Lisa (${rootId}) found in current spouses of grandparent ${grandparent}!`);
        console.log(`    → ${personName} should be Step-Grandchild of Lisa`);
        return true;
      }
      
      // Check if Lisa is in deceased spouses
      if (grandparentDeceasedSpouses.has(String(rootId))) {
        console.log(`    ✓ Lisa (${rootId}) found in deceased spouses of grandparent ${grandparent}!`);
        console.log(`    → Would need timeline validation, but Lisa is alive so this shouldn't happen`);
        return true;
      }
    }
  }
  
  console.log(`    ✗ No step-grandchild relationship found for ${personName}`);
  return false;
}

// Trace for Bob
traceStepGrandchild(5, 12, "Bob");

// Trace for Emily  
traceStepGrandchild(6, 12, "Emily");