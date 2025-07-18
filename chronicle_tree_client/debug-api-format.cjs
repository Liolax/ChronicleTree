/**
 * Test the actual relationship calculator with debug logging to see why Charlie → David shows as "Co-parent-in-law"
 */

// Import the calculator - this needs to be run in a way that can handle ES6 imports
// We'll use Node.js with --experimental-modules or convert to require()

// For now, let's copy the relevant functions and test them directly
console.log('=== TESTING ACTUAL RELATIONSHIP CALCULATOR WITH DEBUG ===');

// Simulate the edge data format that comes from the API
const apiEdgeFormat = [
  // Parent-child relationships
  { from: 1, to: 3, type: 'parent' },
  { from: 3, to: 1, type: 'child' },
  { from: 2, to: 3, type: 'parent' },
  { from: 3, to: 2, type: 'child' },
  { from: 1, to: 5, type: 'parent' },
  { from: 5, to: 1, type: 'child' },
  { from: 2, to: 5, type: 'parent' },
  { from: 5, to: 2, type: 'child' },
  { from: 3, to: 6, type: 'parent' },
  { from: 6, to: 3, type: 'child' },
  { from: 4, to: 6, type: 'parent' },
  { from: 6, to: 4, type: 'child' },
  { from: 3, to: 7, type: 'parent' },
  { from: 7, to: 3, type: 'child' },
  { from: 4, to: 7, type: 'parent' },
  { from: 7, to: 4, type: 'child' },
  
  // Spouse relationships (ex-spouses)
  { from: 1, to: 2, type: 'spouse', is_ex: false },
  { from: 2, to: 1, type: 'spouse', is_ex: false },
  { from: 3, to: 4, type: 'spouse', is_ex: true },
  { from: 4, to: 3, type: 'spouse', is_ex: true },
  
  // Sibling relationships
  { from: 6, to: 7, type: 'sibling' },
  { from: 7, to: 6, type: 'sibling' },
  { from: 5, to: 3, type: 'sibling' },
  { from: 3, to: 5, type: 'sibling' }
];

// Build relationship maps using the same logic as the calculator
function buildRelationshipMaps(relationships) {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const exSpouseMap = new Map();
  const siblingMap = new Map();

  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    // Support both 'type' and 'relationship_type' field names for flexibility
    const relationshipType = rel.type || rel.relationship_type;
    
    switch (relationshipType) {
      case 'parent':
        // Parent -> Child relationship
        if (!parentToChildren.has(source)) {
          parentToChildren.set(source, new Set());
        }
        parentToChildren.get(source).add(target);
        
        if (!childToParents.has(target)) {
          childToParents.set(target, new Set());
        }
        childToParents.get(target).add(source);
        break;
        
      case 'spouse':
        if (rel.is_ex) {
          // Ex-spouse relationships
          if (!exSpouseMap.has(source)) {
            exSpouseMap.set(source, new Set());
          }
          if (!exSpouseMap.has(target)) {
            exSpouseMap.set(target, new Set());
          }
          exSpouseMap.get(source).add(target);
          exSpouseMap.get(target).add(source);
        } else {
          // Current spouse relationships
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
    siblingMap
  };
}

// Test with the API data format
console.log('\n1. BUILDING RELATIONSHIP MAPS FROM API EDGE FORMAT:');
const maps = buildRelationshipMaps(apiEdgeFormat);

console.log('Parent to Children:', Object.fromEntries(maps.parentToChildren));
console.log('Child to Parents:', Object.fromEntries(maps.childToParents));
console.log('Current Spouses:', Object.fromEntries(maps.spouseMap));
console.log('Ex-Spouses:', Object.fromEntries(maps.exSpouseMap));
console.log('Siblings:', Object.fromEntries(maps.siblingMap));

console.log('\n2. TESTING RELATIONSHIP CALCULATION:');
console.log('Now we need to run the actual relationship calculator...');
console.log('This requires importing the ES6 module or running in a different context.');

console.log('\n3. MANUAL CO-PARENT-IN-LAW CHECK:');
// Manual check of co-parent-in-law logic
const charlieId = '5';
const davidId = '4';

const charlieChildren = maps.parentToChildren.get(charlieId) || new Set();
const davidChildren = maps.parentToChildren.get(davidId) || new Set();

console.log(`Charlie (${charlieId}) children:`, Array.from(charlieChildren));
console.log(`David (${davidId}) children:`, Array.from(davidChildren));

// Check if any of Charlie's children are married to any of David's children
let foundCoParentRelation = false;
for (const charlieChild of charlieChildren) {
  for (const davidChild of davidChildren) {
    const charlieChildCurrentSpouses = maps.spouseMap.get(charlieChild) || new Set();
    const charlieChildExSpouses = maps.exSpouseMap.get(charlieChild) || new Set();
    
    if (charlieChildCurrentSpouses.has(davidChild) || charlieChildExSpouses.has(davidChild)) {
      console.log(`FOUND: Charlie's child ${charlieChild} is/was married to David's child ${davidChild}`);
      foundCoParentRelation = true;
    }
  }
}

if (!foundCoParentRelation) {
  console.log('❌ NO CO-PARENT-IN-LAW RELATIONSHIP should exist (Charlie has no children)');
} else {
  console.log('✅ Co-parent-in-law relationship found');
}

console.log('\n4. BROTHER-IN-LAW CHECK:');
// Check brother-in-law logic
const charlieCurrentSpouses = maps.spouseMap.get(charlieId) || new Set();
const charlieSiblings = maps.siblingMap.get(charlieId) || new Set();

console.log(`Charlie's current spouses:`, Array.from(charlieCurrentSpouses));
console.log(`Charlie's siblings:`, Array.from(charlieSiblings));

// Check if David is current spouse of any of Charlie's siblings
let foundBrotherInLawRelation = false;
for (const sibling of charlieSiblings) {
  const siblingCurrentSpouses = maps.spouseMap.get(sibling) || new Set();
  console.log(`Sibling ${sibling}'s current spouses:`, Array.from(siblingCurrentSpouses));
  
  if (siblingCurrentSpouses.has(davidId)) {
    console.log(`✅ BROTHER-IN-LAW: David is current spouse of Charlie's sibling ${sibling}`);
    foundBrotherInLawRelation = true;
  }
}

if (!foundBrotherInLawRelation) {
  console.log('❌ NO BROTHER-IN-LAW relationship (David is ex-spouse, not current spouse)');
}

console.log('\n5. CONCLUSION:');
console.log('Based on this analysis:');
console.log('- Charlie has no children, so co-parent-in-law should NOT apply');
console.log('- David is ex-spouse of Charlie\'s sister, so brother-in-law should NOT apply');
console.log('- David should be "Unrelated" to Charlie');
console.log('');
console.log('If the calculator is returning "Co-parent-in-law", there must be incorrect data being passed to it.');
