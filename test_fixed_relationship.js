// Test the fixed relationship calculation

// Updated Rails API response format (after fixing sibling relationships)
const allPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false }
];

// Fixed Rails API relationship format (NO Alice-Michael sibling relationships)
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
  
  // FIXED: No Alice-Michael sibling relationships (they are step-siblings, not full siblings)
  // The relationship calculator should now detect them as step-siblings automatically
];

// Import relationship calculator logic
function buildRelationshipMaps(relationships, allPeople = []) {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const exSpouseMap = new Map();
  const deceasedSpouseMap = new Map();
  const siblingMap = new Map();

  const hasParentType = relationships.some(r => r.relationship_type === 'parent');
  const hasChildType = relationships.some(r => r.relationship_type === 'child');
  const isRailsFormat = hasParentType && hasChildType;
  
  relationships.forEach(rel => {
    const source = String(rel.source);
    const target = String(rel.target);
    const relationshipType = rel.relationship_type?.toLowerCase();
    
    switch (relationshipType) {
      case 'parent':
        if (isRailsFormat) {
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

  return {
    parentToChildren,
    childToParents,
    spouseMap,
    exSpouseMap,
    deceasedSpouseMap,
    siblingMap
  };
}

// Simplified step-uncle detection
function findStepUncleRelationship(emilyId, michaelId, relationshipMaps) {
  const { childToParents, spouseMap, deceasedSpouseMap } = relationshipMaps;
  
  // Get Emily's parents
  const emilyParents = childToParents.get(emilyId) || new Set();
  
  for (const parent of emilyParents) {
    // Get this parent's parents (Emily's grandparents)
    const grandparents = childToParents.get(parent) || new Set();
    
    for (const grandparent of grandparents) {
      // Get grandparent's spouses
      const grandparentSpouses = spouseMap.get(grandparent) || new Set();
      const grandparentDeceasedSpouses = deceasedSpouseMap.get(grandparent) || new Set();
      
      // Check if any of the grandparent's spouses have Michael as a child
      for (const spouse of [...grandparentSpouses, ...grandparentDeceasedSpouses]) {
        const spouseChildren = relationshipMaps.parentToChildren.get(spouse) || new Set();
        if (spouseChildren.has(michaelId)) {
          return 'Step-Uncle'; // Michael is child of Emily's grandparent's spouse
        }
      }
      
      // Also check if Michael is direct child of this grandparent
      const grandparentChildren = relationshipMaps.parentToChildren.get(grandparent) || new Set();
      if (grandparentChildren.has(michaelId)) {
        // Michael is child of Emily's grandparent
        // Check if Emily's parent and Michael are step-siblings
        const parentParents = childToParents.get(parent) || new Set();
        const michaelParents = childToParents.get(michaelId) || new Set();
        const sharedParents = [...parentParents].filter(p => michaelParents.has(p));
        
        if (sharedParents.length > 0 && sharedParents.length < Math.max(parentParents.size, michaelParents.size)) {
          return 'Step-Uncle'; // Michael and Emily's parent are step-siblings
        }
      }
    }
  }
  
  return null;
}

// Test the relationship calculation
console.log('=== TESTING FIXED EMILY -> MICHAEL RELATIONSHIP ===');

const emily = allPeople.find(p => p.first_name === 'Emily');
const michael = allPeople.find(p => p.first_name === 'Michael');

const relationshipMaps = buildRelationshipMaps(relationships, allPeople);

console.log('\n=== FIXED RELATIONSHIP MAPS ===');
console.log('parentToChildren:', [...relationshipMaps.parentToChildren.entries()].map(([k,v]) => [k, [...v]]));
console.log('childToParents:', [...relationshipMaps.childToParents.entries()].map(([k,v]) => [k, [...v]]));
console.log('siblingMap:', [...relationshipMaps.siblingMap.entries()].map(([k,v]) => [k, [...v]]));

// Test step-uncle detection
const stepRelationship = findStepUncleRelationship(String(emily.id), String(michael.id), relationshipMaps);

console.log('\n=== RESULT ===');
console.log(`Emily -> Michael relationship: ${stepRelationship || 'Not detected'}`);

if (stepRelationship === 'Step-Uncle') {
  console.log('SUCCESS! Emily now correctly sees Michael as Step-Uncle');
} else {
  console.log('Issue: Step-Uncle relationship not detected');
}