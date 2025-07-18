/**
 * Improved Relationship Calculator Utility
 * Handles complex family relationships including in-law relationships
 * Last updated: Cache bust for relationship fix
 */

/**
 * Calculate the relationship of a person to a root person
 * @param {Object} person - The person to calculate relationship for
 * @param {Object} rootPerson - The root person to calculate relationship to
 * @param {Array} allPeople - Array of all people in the tree
 * @param {Array} relationships - Array of all relationships
 * @returns {string} - The relationship description
 */
export const calculateRelationshipToRoot = (person, rootPerson, allPeople, relationships) => {
  if (!person || !rootPerson || !allPeople || !relationships) {
    return '';
  }

  // If it's the same person, they are the root
  if (person.id === rootPerson.id) {
    return 'Root';
  }

  // COMPREHENSIVE DEBUG LOGGING for Alice and Charlie (the actual bug case)
  // Using mock data IDs: Alice is 4, Charlie is 5
  if ((person.id === 4 || person.id === '4') && (rootPerson.id === 5 || rootPerson.id === '5')) {
    console.log('🔍 [DEBUG] calculateRelationshipToRoot: Alice (4) → Charlie (5)');
    console.log('Person (Alice):', person);
    console.log('Root Person (Charlie):', rootPerson);
    console.log('Total relationships:', relationships.length);
    console.log('All relationships:', relationships);
  }
  
  if ((person.id === 5 || person.id === '5') && (rootPerson.id === 4 || rootPerson.id === '4')) {
    console.log('🔍 [DEBUG] calculateRelationshipToRoot: Charlie (5) → Alice (4)');
    console.log('Person (Charlie):', person);
    console.log('Root Person (Alice):', rootPerson);
    console.log('Total relationships:', relationships.length);
    console.log('All relationships:', relationships);
  }

  // DEBUG LOGGING: Log when Charlie or David relationships are being calculated
  if ((person.id === 4 || person.id === '4') && (rootPerson.id === 5 || rootPerson.id === '5')) {
    console.log('[DEBUG] calculateRelationshipToRoot: David (4) → Charlie (5)');
    console.log('Person (David):', person);
    console.log('Root Person (Charlie):', rootPerson);
    console.log('Total relationships:', relationships.length);
    console.log('All relationships:', relationships);
  }
  
  if ((person.id === 5 || person.id === '5') && (rootPerson.id === 4 || rootPerson.id === '4')) {
    console.log('[DEBUG] calculateRelationshipToRoot: Charlie (5) → David (4)');
    console.log('Person (Charlie):', person);
    console.log('Root Person (David):', rootPerson);
    console.log('Total relationships:', relationships.length);
    console.log('All relationships:', relationships);
  }

  // Build comprehensive relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships);

  // Find the relationship using improved algorithm
  const relationship = findRelationship(
    person.id,
    rootPerson.id,
    relationshipMaps,
    allPeople
  );

  // If sibling relationship exists in either direction, always prefer it over 'Unrelated'
  if (
    relationship === 'Unrelated' && (
      (relationshipMaps.siblingMap.has(String(person.id)) && relationshipMaps.siblingMap.get(String(person.id)).has(String(rootPerson.id))) ||
      (relationshipMaps.siblingMap.has(String(rootPerson.id)) && relationshipMaps.siblingMap.get(String(rootPerson.id)).has(String(person.id)))
    )
  ) {
    console.log(`🔍 [SIBLING FALLBACK] Sibling relationship detected: ${person.full_name || person.first_name} <-> ${rootPerson.full_name || rootPerson.first_name}`);
    console.log(`🔍 [SIBLING FALLBACK] Sibling map for ${person.id}:`, relationshipMaps.siblingMap.get(String(person.id)));
    console.log(`🔍 [SIBLING FALLBACK] Sibling map for ${rootPerson.id}:`, relationshipMaps.siblingMap.get(String(rootPerson.id)));
    const siblingLabel = getGenderSpecificRelation(person.id, 'Brother', 'Sister', allPeople, 'Sibling');
    console.log(`🔍 [SIBLING FALLBACK] Sibling label: ${siblingLabel}`);
    return siblingLabel;
  }

  // DEBUG LOGGING: Log final result for Alice/Charlie relationships
  if ((person.id === 4 || person.id === '4') && (rootPerson.id === 5 || rootPerson.id === '5')) {
    console.log(`🔍 [DEBUG] FINAL RESULT: Alice (4) → Charlie (5) = "${relationship || 'Unrelated'}"`);
  }
  
  if ((person.id === 5 || person.id === '5') && (rootPerson.id === 4 || rootPerson.id === '4')) {
    console.log(`🔍 [DEBUG] FINAL RESULT: Charlie (5) → Alice (4) = "${relationship || 'Unrelated'}"`);
  }

  // DEBUG LOGGING: Log final result for Charlie/David relationships
  if ((person.id === 4 || person.id === '4') && (rootPerson.id === 5 || rootPerson.id === '5')) {
    console.log(`[DEBUG] FINAL RESULT: David (4) → Charlie (5) = "${relationship || 'Unrelated'}"`);
  }
  
  if ((person.id === 5 || person.id === '5') && (rootPerson.id === 4 || rootPerson.id === '4')) {
    console.log(`[DEBUG] FINAL RESULT: Charlie (5) → David (4) = "${relationship || 'Unrelated'}"`);
  }

  return relationship || 'Unrelated';
};

/**
 * Build comprehensive relationship maps for efficient lookups
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object} - Maps for different relationship types
 */
const buildRelationshipMaps = (relationships) => {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map(); // Maps person ID to Set of current spouses
  const exSpouseMap = new Map(); // Maps person ID to Set of ex-spouses
  const siblingMap = new Map();

  // Detect relationship format based on whether we have both 'parent' and 'child' types
  const hasParentType = relationships.some(r => (r.type || r.relationship_type) === 'parent');
  const hasChildType = relationships.some(r => (r.type || r.relationship_type) === 'child');
  
  // If we have both parent and child types, it's Rails format (bidirectional)
  // If we only have parent type, it's test format (unidirectional)
  const isRailsFormat = hasParentType && hasChildType;
  
  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    // Support both 'type' and 'relationship_type' field names for flexibility
    const relationshipType = rel.type || rel.relationship_type;
    
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
        } else {
          // Test format: source IS parent OF target
          if (!parentToChildren.has(source)) {
            parentToChildren.set(source, new Set());
          }
          parentToChildren.get(source).add(target);
          
          if (!childToParents.has(target)) {
            childToParents.set(target, new Set());
          }
          childToParents.get(target).add(source);
        }
        break;
        
      case 'child':
        // Child relationship: source has a child named target
        // This means source is the parent of target
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
          // Ex-spouse relationships - use Sets to handle multiple ex-spouses
          if (!exSpouseMap.has(source)) {
            exSpouseMap.set(source, new Set());
          }
          if (!exSpouseMap.has(target)) {
            exSpouseMap.set(target, new Set());
          }
          exSpouseMap.get(source).add(target);
          exSpouseMap.get(target).add(source);
        } else {
          // Current spouse relationships - use Sets to handle multiple current spouses
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
};

/**
 * Find the relationship between two people using improved algorithm
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string} - The relationship description
 */
const findRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  // Ensure IDs are strings for consistent map lookups
  const personIdStr = String(personId);
  const rootIdStr = String(rootId);
  
  // Direct relationships first
  const directRelationship = getDirectRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (directRelationship) {
    return directRelationship;
  }

  // Check if person is related through blood relationship
  const bloodRelationship = findBloodRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (bloodRelationship) {
    return bloodRelationship;
  }

  // Check in-law relationships
  const inLawRelationship = findInLawRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (inLawRelationship) {
    return inLawRelationship;
  }

  return 'Unrelated';
};

/**
 * Get direct relationships (parent, child, spouse, sibling)
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - Direct relationship or null
 */
const getDirectRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { parentToChildren, childToParents, spouseMap, exSpouseMap, siblingMap } = relationshipMaps;
  
  // Check if person is root's parent
  if (childToParents.has(rootId) && childToParents.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Father', 'Mother', allPeople, 'Parent');
  }
  
  // Check if person is root's child
  if (parentToChildren.has(rootId) && parentToChildren.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Son', 'Daughter', allPeople, 'Child');
  }
  
  // Check if person is root's current spouse
  if (spouseMap.has(rootId) && spouseMap.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Husband', 'Wife', allPeople, 'Spouse');
  }
  
  // Check if person is root's ex-spouse
  if (exSpouseMap.has(rootId) && exSpouseMap.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Ex-Husband', 'Ex-Wife', allPeople, 'Ex-Spouse');
  }
  
  // Check if person is root's sibling
  if (siblingMap.has(rootId) && siblingMap.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Brother', 'Sister', allPeople, 'Sibling');
  }
  
  return null;
};

/**
 * Find blood relationships (grandparent, grandchild, aunt/uncle, niece/nephew, cousin)
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - Blood relationship or null
 */
const findBloodRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { parentToChildren, childToParents, siblingMap } = relationshipMaps;
  
  // Check for grandparent relationship
  const rootParents = childToParents.get(rootId) || new Set();
  for (const parent of rootParents) {
    if (childToParents.has(parent) && childToParents.get(parent).has(personId)) {
      return getGenderSpecificRelation(personId, 'Grandfather', 'Grandmother', allPeople, 'Grandparent');
    }
  }
  
  // Check for grandchild relationship
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const child of rootChildren) {
    if (parentToChildren.has(child) && parentToChildren.get(child).has(personId)) {
      return getGenderSpecificRelation(personId, 'Grandson', 'Granddaughter', allPeople, 'Grandchild');
    }
  }
  
  // Check for great-grandparent relationship
  for (const parent of rootParents) {
    const grandparents = childToParents.get(parent) || new Set();
    for (const grandparent of grandparents) {
      if (childToParents.has(grandparent) && childToParents.get(grandparent).has(personId)) {
        return getGenderSpecificRelation(personId, 'Great-Grandfather', 'Great-Grandmother', allPeople, 'Great-Grandparent');
      }
    }
  }
  
  // Check for great-grandchild relationship
  for (const child of rootChildren) {
    const grandchildren = parentToChildren.get(child) || new Set();
    for (const grandchild of grandchildren) {
      if (parentToChildren.has(grandchild) && parentToChildren.get(grandchild).has(personId)) {
        return getGenderSpecificRelation(personId, 'Great-Grandson', 'Great-Granddaughter', allPeople, 'Great-Grandchild');
      }
    }
  }
  
  // Check for aunt/uncle relationship (person is aunt/uncle of root)
  const rootSiblings = siblingMap.get(rootId) || new Set();

  // Check if person is root's parent's sibling (person is root's aunt/uncle)
  for (const parent of rootParents) {
    if (siblingMap.has(parent) && siblingMap.get(parent).has(personId)) {
      return getGenderSpecificRelation(personId, 'Uncle', 'Aunt', allPeople, "Parent's sibling");
    }
  }

  // Check for niece/nephew relationship (person is niece/nephew of root)
  for (const sibling of rootSiblings) {
    if (parentToChildren.has(sibling) && parentToChildren.get(sibling).has(personId)) {
      return getGenderSpecificRelation(personId, 'Nephew', 'Niece', allPeople, "Sibling's child");
    }
  }

  // Check for cousin relationship (person and root are cousins if their parents are siblings)
  const personParents = childToParents.get(personId) || new Set();
  for (const personParent of personParents) {
    const personParentSiblings = siblingMap.get(personParent) || new Set();
    for (const rootParent of rootParents) {
      if (personParentSiblings.has(rootParent)) {
        return '1st Cousin';
      }
    }
  }
  
  // Check for 2nd cousin relationship (person and root share great-grandparents)
  for (const personParent of personParents) {
    const personGrandparents = childToParents.get(personParent) || new Set();
    for (const personGrandparent of personGrandparents) {
      const personGrandparentSiblings = siblingMap.get(personGrandparent) || new Set();
      for (const rootParent of rootParents) {
        const rootGrandparents = childToParents.get(rootParent) || new Set();
        for (const rootGrandparent of rootGrandparents) {
          if (personGrandparentSiblings.has(rootGrandparent)) {
            return '2nd Cousin';
          }
        }
      }
    }
  }

  // No fallback to 'Distant Relative' for key relations. If not found, return null.
  return null;
};

/**
 * Find in-law relationships
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - In-law relationship or null
 */
const findInLawRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { parentToChildren, childToParents, spouseMap, siblingMap } = relationshipMaps;
  
  // Get all current spouses of root (NO ex-spouses for in-law calculations)
  const rootCurrentSpouses = spouseMap.get(rootId) || new Set();
  
  // ===========================================
  // CURRENT SPOUSE IN-LAW RELATIONSHIPS ONLY
  // ===========================================
  
  // Check if person is parent of root's current spouse (parent-in-law)
  for (const spouse of rootCurrentSpouses) {
    if (childToParents.has(spouse) && childToParents.get(spouse).has(personId)) {
      return getGenderSpecificRelation(personId, 'Father-in-law', 'Mother-in-law', allPeople, 'Parent-in-law');
    }
  }
  
  // Check if person is child of root's current spouse (child-in-law)
  for (const spouse of rootCurrentSpouses) {
    if (parentToChildren.has(spouse) && parentToChildren.get(spouse).has(personId)) {
      return getGenderSpecificRelation(personId, 'Son-in-law', 'Daughter-in-law', allPeople, 'Child-in-law');
    }
  }
  
  // Check if person is sibling of root's current spouse (sibling-in-law)
  for (const spouse of rootCurrentSpouses) {
    if (siblingMap.has(spouse) && siblingMap.get(spouse).has(personId)) {
      return getGenderSpecificRelation(personId, 'Brother-in-law', 'Sister-in-law', allPeople, 'Sibling-in-law');
    }
  }
  
  // Check if person is current spouse of root's sibling (sibling-in-law)
  const rootSiblings = siblingMap.get(rootId) || new Set();
  
  if ((personId === '4' && rootId === '5') || (personId === '5' && rootId === '4')) {
    console.log(`[DEBUG] Brother-in-law check - person ${personId} → root ${rootId}:`);
    console.log(`  Root's siblings: [${Array.from(rootSiblings).join(', ')}]`);
  }
  
  for (const sibling of rootSiblings) {
    const siblingCurrentSpouses = spouseMap.get(sibling) || new Set();
    
    if ((personId === '4' && rootId === '5') || (personId === '5' && rootId === '4')) {
      console.log(`  Sibling ${sibling}'s current spouses: [${Array.from(siblingCurrentSpouses).join(', ')}]`);
      console.log(`  Is person ${personId} a current spouse of sibling ${sibling}? ${siblingCurrentSpouses.has(personId)}`);
    }
    
    if (siblingCurrentSpouses.has(personId)) {
      if ((personId === '4' && rootId === '5') || (personId === '5' && rootId === '4')) {
        console.log(`  [DEBUG] ✅ FOUND BROTHER-IN-LAW: ${personId} is current spouse of ${rootId}'s sibling ${sibling}`);
      }
      return getGenderSpecificRelation(personId, 'Brother-in-law', 'Sister-in-law', allPeople, 'Sibling-in-law');
    }
  }
  
  // Check if person is current spouse of root's child (child-in-law)
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const child of rootChildren) {
    if (spouseMap.has(child) && spouseMap.get(child).has(personId)) {
      return getGenderSpecificRelation(personId, 'Son-in-law', 'Daughter-in-law', allPeople, 'Child-in-law');
    }
  }
  
  // ===========================================
  // REVERSE DIRECTION: ROOT IS THE IN-LAW (CURRENT SPOUSES ONLY)
  // ===========================================
  
  // Check if root is current spouse of person's child (root is child-in-law to person)
  const personChildren = parentToChildren.get(personId) || new Set();
  for (const child of personChildren) {
    if (spouseMap.has(child) && spouseMap.get(child).has(rootId)) {
      return getGenderSpecificRelation(rootId, 'Son-in-law', 'Daughter-in-law', allPeople, 'Child-in-law');
    }
  }
  
  // Check if root is current spouse of person's sibling (root is sibling-in-law to person)
  const personSiblings = siblingMap.get(personId) || new Set();
  for (const sibling of personSiblings) {
    if (spouseMap.has(sibling) && spouseMap.get(sibling).has(rootId)) {
      return getGenderSpecificRelation(rootId, 'Brother-in-law', 'Sister-in-law', allPeople, 'Sibling-in-law');
    }
  }
  
  // Check if root is parent of person's current spouse (root is parent-in-law to person)
  const personCurrentSpouses = spouseMap.get(personId) || new Set();
  for (const spouse of personCurrentSpouses) {
    if (childToParents.has(spouse) && childToParents.get(spouse).has(rootId)) {
      return getGenderSpecificRelation(rootId, 'Father-in-law', 'Mother-in-law', allPeople, 'Parent-in-law');
    }
  }
  
  // ===========================================
  // PARENT-OF-SPOUSE TO PARENT-OF-SPOUSE RELATIONSHIPS
  // ===========================================
  
  // Check if person and root are both parents of spouses (co-parents-in-law)
  // Example: Michael A (David's father) ↔ John/Jane Doe (Alice's parents) when David ↔ Alice are/were married
  // Note: Co-parent-in-law relationships persist even after divorce due to shared grandchildren
  
  // DEBUG LOGGING for co-parent-in-law calculation
  const coParentPersonChildren = parentToChildren.get(personId) || new Set();
  const coParentRootChildren = parentToChildren.get(rootId) || new Set();
  
  if (personId === '4' && rootId === '5') { // David → Charlie
    console.log('[DEBUG] Co-parent-in-law check for David (4) → Charlie (5):');
    console.log(`  David's children: [${Array.from(coParentPersonChildren).join(', ')}]`);
    console.log(`  Charlie's children: [${Array.from(coParentRootChildren).join(', ')}]`);
  }
  
  if (personId === '5' && rootId === '4') { // Charlie → David  
    console.log('[DEBUG] Co-parent-in-law check for Charlie (5) → David (4):');
    console.log(`  Charlie's children: [${Array.from(coParentPersonChildren).join(', ')}]`);
    console.log(`  David's children: [${Array.from(coParentRootChildren).join(', ')}]`);
  }
  
  for (const personChild of (parentToChildren.get(personId) || new Set())) {
    for (const rootChild of (parentToChildren.get(rootId) || new Set())) {
      // Check if person's child is/was married to root's child (current or ex-spouse)
      const personChildCurrentSpouses = spouseMap.get(personChild) || new Set();
      const personChildExSpouses = relationshipMaps.exSpouseMap.get(personChild) || new Set();
      
      if ((personId === '4' && rootId === '5') || (personId === '5' && rootId === '4')) {
        console.log(`  [DEBUG] Checking ${personChild} (person's child) ↔ ${rootChild} (root's child):`);
        console.log(`    ${personChild}'s current spouses: [${Array.from(personChildCurrentSpouses).join(', ')}]`);
        console.log(`    ${personChild}'s ex-spouses: [${Array.from(personChildExSpouses).join(', ')}]`);
        console.log(`    Is ${rootChild} a spouse? ${personChildCurrentSpouses.has(rootChild) || personChildExSpouses.has(rootChild)}`);
      }
      
      if (personChildCurrentSpouses.has(rootChild) || personChildExSpouses.has(rootChild)) {
        // They are co-parents-in-law (parents of current or former spouses)
        if ((personId === '4' && rootId === '5') || (personId === '5' && rootId === '4')) {
          console.log(`  [DEBUG] ✅ FOUND CO-PARENT-IN-LAW: ${personChild} ↔ ${rootChild} were/are married`);
        }
        return getGenderSpecificRelation(personId, 'Co-Father-in-law', 'Co-Mother-in-law', allPeople, 'Co-Parent-in-law');
      }
    }
  }
  
  // NO EX-SPOUSE IN-LAW LOGIC - All ex-spouse relatives should be "Unrelated"
  return null;
};

/**
 * Get gender-specific relationship term
 * @param {string} personId - The person's ID
 * @param {string} maleRelation - Male relationship term
 * @param {string} femaleRelation - Female relationship term
 * @param {Array} allPeople - Array of all people
 * @param {string} neutralRelation - Neutral relationship term for when gender is not available
 * @returns {string} - Gender-specific relationship term
 */
const getGenderSpecificRelation = (personId, maleRelation, femaleRelation, allPeople, neutralRelation = null) => {
  const person = allPeople.find(p => String(p.id) === String(personId));
  if (person && person.gender) {
    return person.gender.toLowerCase() === 'female' ? femaleRelation : maleRelation;
  }
  // If neutralRelation is provided and gender is not available, use neutral term
  if (neutralRelation) {
    return neutralRelation;
  }
  return maleRelation; // Default to male if gender not found and no neutral term provided
};

/**
 * Get all people and their relationships to a root person
 * @param {Object} rootPerson - The root person
 * @param {Array} allPeople - Array of all people
 * @param {Array} relationships - Array of all relationships
 * @returns {Array} - Array of people with their relationships to root
 */
export const getAllRelationshipsToRoot = (rootPerson, allPeople, relationships) => {
  if (!rootPerson || !allPeople || !relationships) {
    return allPeople.map(person => ({ ...person, relation: '' }));
  }

  return allPeople.map(person => ({
    ...person,
    relation: calculateRelationshipToRoot(person, rootPerson, allPeople, relationships)
  }));
};