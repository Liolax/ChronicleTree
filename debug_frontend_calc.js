// Test the frontend relationship calculator with actual Rails data

// Simulate the Rails API response format
const allPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false }
];

// Rails API relationship format (edges)
const relationships = [
  // Parent-child relationships
  { source: 1, target: 3, relationship_type: 'child' },   // John -> Alice (child)
  { source: 3, target: 1, relationship_type: 'parent' },  // Alice -> John (parent)
  { source: 2, target: 3, relationship_type: 'child' },   // Jane -> Alice (child)
  { source: 3, target: 2, relationship_type: 'parent' },  // Alice -> Jane (parent)
  { source: 3, target: 6, relationship_type: 'child' },   // Alice -> Emily (child)
  { source: 6, target: 3, relationship_type: 'parent' },  // Emily -> Alice (parent)
  { source: 4, target: 6, relationship_type: 'child' },   // David -> Emily (child)
  { source: 6, target: 4, relationship_type: 'parent' },  // Emily -> David (parent)
  { source: 1, target: 13, relationship_type: 'child' },  // John -> Michael (child)
  { source: 13, target: 1, relationship_type: 'parent' }, // Michael -> John (parent)
  { source: 12, target: 13, relationship_type: 'child' }, // Lisa -> Michael (child)
  { source: 13, target: 12, relationship_type: 'parent' },// Michael -> Lisa (parent)
  
  // Spouse relationships
  { source: 1, target: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { source: 2, target: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { source: 1, target: 12, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { source: 12, target: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { source: 3, target: 4, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { source: 4, target: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  
  // PROBLEMATIC: Alice and Michael as full siblings (should be step-siblings)
  { source: 3, target: 13, relationship_type: 'sibling' },
  { source: 13, target: 3, relationship_type: 'sibling' }
];

// Import the relationship calculator (simulated)
function buildRelationshipMaps(relationships, allPeople = []) {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const exSpouseMap = new Map();
  const deceasedSpouseMap = new Map();
  const siblingMap = new Map();

  // Detect relationship format
  const hasParentType = relationships.some(r => r.relationship_type === 'parent');
  const hasChildType = relationships.some(r => r.relationship_type === 'child');
  const isRailsFormat = hasParentType && hasChildType;
  
  console.log('Is Rails format:', isRailsFormat);
  
  relationships.forEach(rel => {
    const source = String(rel.source);
    const target = String(rel.target);
    const relationshipType = rel.relationship_type?.toLowerCase();
    
    switch (relationshipType) {
      case 'parent':
        if (isRailsFormat) {
          // Rails format: source HAS parent target (target is parent of source)
          if (!parentToChildren.has(target)) {
            parentToChildren.set(target, new Set());
          }
          parentToChildren.get(target).add(source);
          
          if (!childToParents.has(source)) {
            childToParents.set(source, new Set());
          }
          childToParents.get(source).add(target);
        }
        break;
        
      case 'child':
        // Child relationship: source has a child named target
        if (!parentToChildren.has(source)) {
          parentToChildren.set(source, new Set());
        }
        parentToChildren.get(source).add(target);
        
        if (!childToParents.has(target)) {
          childToParents.set(target, new Set());
        }
        childToParents.get(target).add(source);
        break;
        
      case 'spouse': {
        const sourcePerson = allPeople.find(p => String(p.id) === source);
        const targetPerson = allPeople.find(p => String(p.id) === target);
        const sourceIsDeceased = sourcePerson && sourcePerson.date_of_death;
        const targetIsDeceased = targetPerson && targetPerson.date_of_death;
        const isDeceasedSpouse = sourceIsDeceased || targetIsDeceased;
        
        if (rel.is_ex) {
          if (!exSpouseMap.has(source)) {
            exSpouseMap.set(source, new Set());
          }
          if (!exSpouseMap.has(target)) {
            exSpouseMap.set(target, new Set());
          }
          exSpouseMap.get(source).add(target);
          exSpouseMap.get(target).add(source);
        } else if (isDeceasedSpouse) {
          if (!deceasedSpouseMap.has(source)) {
            deceasedSpouseMap.set(source, new Set());
          }
          if (!deceasedSpouseMap.has(target)) {
            deceasedSpouseMap.set(target, new Set());
          }
          deceasedSpouseMap.get(source).add(target);
          deceasedSpouseMap.get(target).add(source);
        } else {
          if (!spouseMap.has(source)) {
            spouseMap.set(source, new Set());
          }
          if (!spouseMap.has(target)) {
            spouseMap.set(target, new Set());
          }
          spouseMap.get(source).add(target);
          spouseMap.get(target).add(source);
        }
        break;
      }
        
      case 'sibling':
        if (!siblingMap.has(source)) {
          siblingMap.set(source, new Set());
        }
        if (!siblingMap.has(target)) {
          siblingMap.set(target, new Set());
        }
        siblingMap.get(source).add(target);
        siblingMap.get(target).add(source);
        break;
    }
  });

  // Auto-detect biological siblings through shared parents (DISABLED in this test)
  // This is where the problem might be - we'll skip this for now
  
  return {
    parentToChildren,
    childToParents,
    spouseMap,
    exSpouseMap,
    deceasedSpouseMap,
    siblingMap
  };
}

// Test the relationship calculation
console.log('=== TESTING EMILY -> MICHAEL RELATIONSHIP ===');

const emily = allPeople.find(p => p.first_name === 'Emily');
const michael = allPeople.find(p => p.first_name === 'Michael');

console.log('Emily:', emily);
console.log('Michael:', michael);

const relationshipMaps = buildRelationshipMaps(relationships, allPeople);

console.log('\n=== RELATIONSHIP MAPS ===');
console.log('parentToChildren:', [...relationshipMaps.parentToChildren.entries()].map(([k,v]) => [k, [...v]]));
console.log('childToParents:', [...relationshipMaps.childToParents.entries()].map(([k,v]) => [k, [...v]]));
console.log('siblingMap:', [...relationshipMaps.siblingMap.entries()].map(([k,v]) => [k, [...v]]));

// Test step-uncle detection logic
console.log('\n=== STEP-UNCLE DETECTION TEST ===');

// Emily's parents
const emilyParents = relationshipMaps.childToParents.get(String(emily.id)) || new Set();
console.log('Emily parents:', [...emilyParents]);

// For each parent, check if Michael is their step-sibling
for (const parent of emilyParents) {
  const parentPerson = allPeople.find(p => p.id === parseInt(parent));
  console.log(`\nChecking Emily's parent: ${parentPerson.first_name} (${parent})`);
  
  // Get this parent's parents (Emily's grandparents)
  const grandparents = relationshipMaps.childToParents.get(parent) || new Set();
  console.log(`${parentPerson.first_name}'s parents:`, [...grandparents]);
  
  // For each grandparent, check if Michael is their child
  for (const grandparent of grandparents) {
    const grandparentPerson = allPeople.find(p => p.id === parseInt(grandparent));
    console.log(`  Checking grandparent: ${grandparentPerson.first_name} (${grandparent})`);
    
    const grandparentSpouses = relationshipMaps.spouseMap.get(grandparent) || new Set();
    const grandparentDeceasedSpouses = relationshipMaps.deceasedSpouseMap.get(grandparent) || new Set();
    console.log(`    ${grandparentPerson.first_name}'s spouses:`, [...grandparentSpouses, ...grandparentDeceasedSpouses]);
    
    // Check if any of the grandparent's spouses have Michael as a child
    for (const spouse of [...grandparentSpouses, ...grandparentDeceasedSpouses]) {
      if (relationshipMaps.parentToChildren.get(spouse)?.has(String(michael.id))) {
        console.log(`    Michael is child of ${grandparentPerson.first_name}'s spouse -> Step-Uncle!`);
      }
    }
    
    // Also check if Michael is direct child of this grandparent
    if (relationshipMaps.parentToChildren.get(grandparent)?.has(String(michael.id))) {
      console.log(`    Michael is child of ${grandparentPerson.first_name} -> This makes them step-siblings of Emily's parent`);
      
      // Check if Emily's parent is full sibling or step-sibling to Michael
      const parentParents = relationshipMaps.childToParents.get(parent) || new Set();
      const michaelParents = relationshipMaps.childToParents.get(String(michael.id)) || new Set();
      const sharedParents = [...parentParents].filter(p => michaelParents.has(p));
      
      console.log(`    Shared parents between ${parentPerson.first_name} and Michael:`, sharedParents);
      
      if (sharedParents.length > 0 && sharedParents.length < Math.max(parentParents.size, michaelParents.size)) {
        console.log(`    -> They are STEP-SIBLINGS (share some but not all parents)`);
        console.log(`    -> Michael is Emily's STEP-UNCLE`);
      } else if (sharedParents.length === parentParents.size && sharedParents.length === michaelParents.size) {
        console.log(`    -> They are FULL SIBLINGS (share all parents)`);
        console.log(`    -> Michael is Emily's UNCLE`);
      }
    }
  }
}

// Check what the sibling map shows
console.log('\n=== SIBLING MAP ANALYSIS ===');
const aliceId = String(allPeople.find(p => p.first_name === 'Alice').id);
const michaelId = String(michael.id);

console.log(`Alice (${aliceId}) siblings:`, [...(relationshipMaps.siblingMap.get(aliceId) || [])]);
console.log(`Michael (${michaelId}) siblings:`, [...(relationshipMaps.siblingMap.get(michaelId) || [])]);

if (relationshipMaps.siblingMap.get(aliceId)?.has(michaelId)) {
  console.log('PROBLEM: Alice and Michael are marked as full siblings in the sibling map!');
  console.log('This is why Michael is being detected as Uncle instead of Step-Uncle');
}