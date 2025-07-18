/**
 * Debug the relationship maps to see what data is being processed
 */

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

// Mock buildRelationshipMaps function (simplified)
function buildRelationshipMaps(people, relationships) {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const exSpouseMap = new Map();
  const siblingMap = new Map();

  // Process relationships
  relationships.forEach(rel => {
    const personId = String(rel.person_id);
    const relativeId = String(rel.relative_id);
    const relType = rel.relationship_type || rel.type;

    if (relType === 'parent') {
      if (!childToParents.has(personId)) childToParents.set(personId, new Set());
      childToParents.get(personId).add(relativeId);
    } else if (relType === 'child') {
      if (!parentToChildren.has(personId)) parentToChildren.set(personId, new Set());
      parentToChildren.get(personId).add(relativeId);
    } else if (relType === 'spouse') {
      if (rel.is_ex) {
        if (!exSpouseMap.has(personId)) exSpouseMap.set(personId, new Set());
        exSpouseMap.get(personId).add(relativeId);
      } else {
        if (!spouseMap.has(personId)) spouseMap.set(personId, new Set());
        spouseMap.get(personId).add(relativeId);
      }
    } else if (relType === 'sibling') {
      if (!siblingMap.has(personId)) siblingMap.set(personId, new Set());
      siblingMap.get(personId).add(relativeId);
    }
  });

  return { parentToChildren, childToParents, spouseMap, exSpouseMap, siblingMap };
}

console.log('=== DEBUGGING RELATIONSHIP MAPS ===');

const maps = buildRelationshipMaps(testPeople, testRelationships);

console.log('\n1. PARENT TO CHILDREN MAP:');
for (const [parentId, children] of maps.parentToChildren) {
  const parent = testPeople.find(p => String(p.id) === parentId);
  const childNames = Array.from(children).map(childId => {
    const child = testPeople.find(p => String(p.id) === childId);
    return child ? `${child.first_name} ${child.last_name}` : childId;
  });
  console.log(`  ${parent.first_name} ${parent.last_name} (${parentId}) → [${childNames.join(', ')}]`);
}

console.log('\n2. SPOUSE MAP (Current):');
for (const [personId, spouses] of maps.spouseMap) {
  const person = testPeople.find(p => String(p.id) === personId);
  const spouseNames = Array.from(spouses).map(spouseId => {
    const spouse = testPeople.find(p => String(p.id) === spouseId);
    return spouse ? `${spouse.first_name} ${spouse.last_name}` : spouseId;
  });
  console.log(`  ${person.first_name} ${person.last_name} (${personId}) → [${spouseNames.join(', ')}]`);
}

console.log('\n3. EX-SPOUSE MAP:');
for (const [personId, exSpouses] of maps.exSpouseMap) {
  const person = testPeople.find(p => String(p.id) === personId);
  const exSpouseNames = Array.from(exSpouses).map(exSpouseId => {
    const exSpouse = testPeople.find(p => String(p.id) === exSpouseId);
    return exSpouse ? `${exSpouse.first_name} ${exSpouse.last_name}` : exSpouseId;
  });
  console.log(`  ${person.first_name} ${person.last_name} (${personId}) → [${exSpouseNames.join(', ')}]`);
}

console.log('\n4. TESTING CO-PARENT-IN-LAW LOGIC for Charlie (5) → David (4):');
const charlieId = '5';
const davidId = '4';

const charlieChildren = maps.parentToChildren.get(charlieId) || new Set();
const davidChildren = maps.parentToChildren.get(davidId) || new Set();

console.log(`Charlie's children: [${Array.from(charlieChildren).join(', ')}]`);
console.log(`David's children: [${Array.from(davidChildren).join(', ')}]`);

// Co-parent-in-law logic: check if any of Charlie's children married any of David's children
let coParentRelation = false;
for (const charlieChild of charlieChildren) {
  for (const davidChild of davidChildren) {
    const charlieChildSpouses = maps.spouseMap.get(charlieChild) || new Set();
    const charlieChildExSpouses = maps.exSpouseMap.get(charlieChild) || new Set();
    
    if (charlieChildSpouses.has(davidChild) || charlieChildExSpouses.has(davidChild)) {
      console.log(`Found co-parent relationship: Charlie's child ${charlieChild} married David's child ${davidChild}`);
      coParentRelation = true;
    }
  }
}

if (!coParentRelation) {
  console.log('❌ No co-parent-in-law relationship should exist between Charlie and David');
  console.log('Charlie has no children, so co-parent-in-law logic should not apply');
}

console.log('\n5. TESTING BROTHER-IN-LAW LOGIC (Both scenarios):');

// Scenario 1: Current marriage (Alice still married to David)
console.log('\n--- SCENARIO 1: Current Marriage (Alice ↔ David current spouses) ---');
const testRelationshipsCurrentMarriage = testRelationships.map(rel => {
  if (rel.person_id === 3 && rel.relative_id === 4 && rel.relationship_type === 'spouse') {
    return { ...rel, is_ex: false }; // Alice ↔ David are current spouses
  }
  if (rel.person_id === 4 && rel.relative_id === 3 && rel.relationship_type === 'spouse') {
    return { ...rel, is_ex: false }; // David ↔ Alice are current spouses
  }
  return rel;
});

const mapsCurrentMarriage = buildRelationshipMaps(testPeople, testRelationshipsCurrentMarriage);

console.log('Alice\'s current spouses:', Array.from(mapsCurrentMarriage.spouseMap.get('3') || []));
console.log('David\'s current spouses:', Array.from(mapsCurrentMarriage.spouseMap.get('4') || []));
console.log('Charlie\'s siblings:', Array.from(mapsCurrentMarriage.siblingMap.get('5') || []));

// Brother-in-law logic 1: Person is sibling of root's current spouse
let brotherInLawRelation1 = false;
const rootCurrentSpouses = mapsCurrentMarriage.spouseMap.get('5') || new Set(); // Charlie's spouses
console.log(`Charlie's current spouses: [${Array.from(rootCurrentSpouses).join(', ')}]`);

for (const spouse of rootCurrentSpouses) {
  if (mapsCurrentMarriage.siblingMap.has(spouse) && mapsCurrentMarriage.siblingMap.get(spouse).has('4')) {
    console.log(`✅ David is brother-in-law: David is sibling of Charlie's spouse ${spouse}`);
    brotherInLawRelation1 = true;
  }
}

// Brother-in-law logic 2: Person is current spouse of root's sibling  
const charliesSiblings = mapsCurrentMarriage.siblingMap.get('5') || new Set(); // Charlie's siblings
console.log(`Charlie's siblings: [${Array.from(charliesSiblings).join(', ')}]`);

for (const sibling of charliesSiblings) {
  const siblingSpouses = mapsCurrentMarriage.spouseMap.get(sibling) || new Set();
  console.log(`${sibling}'s current spouses: [${Array.from(siblingSpouses).join(', ')}]`);
  if (siblingSpouses.has('4')) {
    console.log(`✅ David is brother-in-law: David is current spouse of Charlie's sibling ${sibling}`);
    brotherInLawRelation1 = true;
  }
}

if (!brotherInLawRelation1) {
  console.log('❌ No brother-in-law relationship found in current marriage scenario');
}

// Scenario 2: After divorce (Alice and David are ex-spouses)
console.log('\n--- SCENARIO 2: After Divorce (Alice ↔ David ex-spouses) ---');
const mapsAfterDivorce = buildRelationshipMaps(testPeople, testRelationships); // Original with is_ex: true

console.log('Alice\'s ex-spouses:', Array.from(mapsAfterDivorce.exSpouseMap.get('3') || []));
console.log('David\'s ex-spouses:', Array.from(mapsAfterDivorce.exSpouseMap.get('4') || []));
console.log('Alice\'s current spouses:', Array.from(mapsAfterDivorce.spouseMap.get('3') || []));
console.log('David\'s current spouses:', Array.from(mapsAfterDivorce.spouseMap.get('4') || []));

// Brother-in-law logic after divorce: Only considers CURRENT spouses
let brotherInLawRelation2 = false;
const rootCurrentSpousesAfterDivorce = mapsAfterDivorce.spouseMap.get('5') || new Set(); // Charlie's current spouses
console.log(`Charlie's current spouses after divorce: [${Array.from(rootCurrentSpousesAfterDivorce).join(', ')}]`);

for (const spouse of rootCurrentSpousesAfterDivorce) {
  if (mapsAfterDivorce.siblingMap.has(spouse) && mapsAfterDivorce.siblingMap.get(spouse).has('4')) {
    console.log(`✅ David is brother-in-law: David is sibling of Charlie's current spouse ${spouse}`);
    brotherInLawRelation2 = true;
  }
}

const charliesSiblingsAfterDivorce = mapsAfterDivorce.siblingMap.get('5') || new Set(); // Charlie's siblings
for (const sibling of charliesSiblingsAfterDivorce) {
  const siblingCurrentSpouses = mapsAfterDivorce.spouseMap.get(sibling) || new Set(); // Only current spouses
  console.log(`${sibling}'s current spouses after divorce: [${Array.from(siblingCurrentSpouses).join(', ')}]`);
  if (siblingCurrentSpouses.has('4')) {
    console.log(`✅ David is brother-in-law: David is current spouse of Charlie's sibling ${sibling}`);
    brotherInLawRelation2 = true;
  }
}

if (!brotherInLawRelation2) {
  console.log('❌ No brother-in-law relationship found after divorce (correct behavior)');
  console.log('   Ex-spouse relationships are ignored for in-law calculations');
}

console.log('\n6. CONCLUSION:');
console.log('Current marriage scenario: David would be Charlie\'s brother-in-law ✅');
console.log('After divorce scenario: David is unrelated to Charlie ✅');
console.log('Co-parent-in-law should never apply since Charlie has no children ❌');
