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

  // Enhanced sibling detection - automatically finds siblings through shared parents

  // Build comprehensive relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships);

  // Find the relationship using improved algorithm
  const relationship = findRelationship(
    person.id,
    rootPerson.id,
    relationshipMaps,
    allPeople
  );

  // Enhanced sibling detection: if primary algorithm shows "Unrelated" but sibling relationship exists, use it
  if (
    relationship === 'Unrelated' && (
      (relationshipMaps.siblingMap.has(String(person.id)) && relationshipMaps.siblingMap.get(String(person.id)).has(String(rootPerson.id))) ||
      (relationshipMaps.siblingMap.has(String(rootPerson.id)) && relationshipMaps.siblingMap.get(String(rootPerson.id)).has(String(person.id)))
    )
  ) {
    return getGenderSpecificRelation(person.id, 'Brother', 'Sister', allPeople, 'Sibling');
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

  // CRITICAL FIX: After building parent-child relationships, automatically detect siblings through shared parents
  const allPersonIds = new Set();
  relationships.forEach(rel => {
    allPersonIds.add(String(rel.source || rel.from));
    allPersonIds.add(String(rel.target || rel.to));
  });

  // For each person, find their siblings by looking for other people with the same parents
  for (const personId of allPersonIds) {
    const personParents = childToParents.get(personId) || new Set();
    
    if (personParents.size > 0) {
      // Find all other people who share at least one parent with this person
      for (const otherPersonId of allPersonIds) {
        if (personId !== otherPersonId) {
          const otherParents = childToParents.get(otherPersonId) || new Set();
          
          // Check if they share any parents
          const sharedParents = [...personParents].filter(parent => otherParents.has(parent));
          
          if (sharedParents.length > 0) {
            // They are siblings - add to siblingMap
            if (!siblingMap.has(personId)) {
              siblingMap.set(personId, new Set());
            }
            if (!siblingMap.has(otherPersonId)) {
              siblingMap.set(otherPersonId, new Set());
            }
            siblingMap.get(personId).add(otherPersonId);
            siblingMap.get(otherPersonId).add(personId);
          }
        }
      }
    }
  }

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
  
  for (const sibling of rootSiblings) {
    const siblingCurrentSpouses = spouseMap.get(sibling) || new Set();
    
    if (siblingCurrentSpouses.has(personId)) {
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
  
  for (const personChild of (parentToChildren.get(personId) || new Set())) {
    for (const rootChild of (parentToChildren.get(rootId) || new Set())) {
      // Check if person's child is/was married to root's child (current or ex-spouse)
      const personChildCurrentSpouses = spouseMap.get(personChild) || new Set();
      const personChildExSpouses = relationshipMaps.exSpouseMap.get(personChild) || new Set();
      
      if (personChildCurrentSpouses.has(rootChild) || personChildExSpouses.has(rootChild)) {
        // They are co-parents-in-law (parents of current or former spouses)
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