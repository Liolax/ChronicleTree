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

  // CRITICAL TIMELINE VALIDATION: Check if the two people's lifespans overlapped
  // People who never coexisted cannot have family relationships (except direct blood relationships)
  const personBirth = person.date_of_birth ? new Date(person.date_of_birth) : null;
  const personDeath = person.date_of_death ? new Date(person.date_of_death) : null;
  const rootBirth = rootPerson.date_of_birth ? new Date(rootPerson.date_of_birth) : null;
  const rootDeath = rootPerson.date_of_death ? new Date(rootPerson.date_of_death) : null;

  // Check if lifespans overlapped
  if (personBirth && rootDeath && personBirth > rootDeath) {
    // Person was born after root died - they never coexisted
    // Only allow direct blood relationships (parent-child, grandparent-grandchild, great-grandparent-great-grandchild, etc.)
    const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
    const { childToParents, parentToChildren } = relationshipMaps;
    
    // Check if they are direct blood relatives (any ancestor-descendant relationship)
    const personParents = childToParents.get(String(person.id)) || new Set();
    const rootChildren = parentToChildren.get(String(rootPerson.id)) || new Set();
    const personChildren = parentToChildren.get(String(person.id)) || new Set();
    
    // If root is person's parent (person born after root died - impossible but check anyway)
    if (personParents.has(String(rootPerson.id))) {
      return getGenderSpecificRelation(rootPerson.id, 'Father', 'Mother', allPeople, 'Parent');
    }
    
    // If person is root's child (person born after root died - impossible but check anyway)  
    if (rootChildren.has(String(person.id))) {
      return getGenderSpecificRelation(person.id, 'Son', 'Daughter', allPeople, 'Child');
    }
    
    // Check for grandparent-grandchild relationship (person is grandparent of root)
    for (const child of personChildren) {
      if (parentToChildren.has(child) && parentToChildren.get(child).has(String(rootPerson.id))) {
        return getGenderSpecificRelation(person.id, 'Grandfather', 'Grandmother', allPeople, 'Grandparent');
      }
    }
    
    // Check for grandchild-grandparent relationship (root is grandparent of person)
    for (const parent of personParents) {
      if (childToParents.has(parent) && childToParents.get(parent).has(String(rootPerson.id))) {
        return getGenderSpecificRelation(person.id, 'Grandson', 'Granddaughter', allPeople, 'Grandchild');
      }
    }
    
    // No direct blood relationship and they never coexisted = Unrelated
    return 'Unrelated';
  }
  
  if (rootBirth && personDeath && rootBirth > personDeath) {
    // Root was born after person died - they never coexisted
    // Only allow direct blood relationships (parent-child, grandparent-grandchild, great-grandparent-great-grandchild, etc.) 
    const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
    const { childToParents, parentToChildren } = relationshipMaps;
    
    // Check if they are direct blood relatives
    const rootParents = childToParents.get(String(rootPerson.id)) || new Set();
    const personChildren = parentToChildren.get(String(person.id)) || new Set();
    const rootChildren = parentToChildren.get(String(rootPerson.id)) || new Set();
    const personParents = childToParents.get(String(person.id)) || new Set();
    
    // If person is root's parent (root born after person died - impossible but check anyway)
    if (rootParents.has(String(person.id))) {
      return getGenderSpecificRelation(person.id, 'Father', 'Mother', allPeople, 'Parent');
    }
    
    // If root is person's child (root born after person died - impossible but check anyway)
    if (personChildren.has(String(rootPerson.id))) {
      return getGenderSpecificRelation(rootPerson.id, 'Son', 'Daughter', allPeople, 'Child');
    }
    
    // Check for grandparent-grandchild relationship (person is grandparent of root)
    for (const child of personChildren) {
      if (parentToChildren.has(child) && parentToChildren.get(child).has(String(rootPerson.id))) {
        return getGenderSpecificRelation(person.id, 'Grandfather', 'Grandmother', allPeople, 'Grandparent');
      }
    }
    
    // Check for grandchild-grandparent relationship (root is grandparent of person)  
    for (const parent of rootParents) {
      if (parentToChildren.has(parent) && parentToChildren.get(parent).has(String(person.id))) {
        return getGenderSpecificRelation(rootPerson.id, 'Grandfather', 'Grandmother', allPeople, 'Grandparent');
      }
    }
    
    // No direct blood relationship and they never coexisted = Unrelated
    return 'Unrelated';
  }

  // Enhanced sibling detection - automatically finds siblings through shared parents

  // Build comprehensive relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships, allPeople);

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
 * @param {Array} allPeople - Array of all people (needed to check death dates)
 * @returns {Object} - Maps for different relationship types
 */
export const buildRelationshipMaps = (relationships, allPeople = []) => {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map(); // Maps person ID to Set of current spouses
  const exSpouseMap = new Map(); // Maps person ID to Set of ex-spouses
  const deceasedSpouseMap = new Map(); // Maps person ID to Set of deceased spouses
  const siblingMap = new Map();

  // Detect relationship format based on whether we have both 'parent' and 'child' types
  const hasParentType = relationships.some(r => (r.type || r.relationship_type) === 'parent');
  const hasChildType = relationships.some(r => (r.type || r.relationship_type) === 'child');
  
  // If we have both parent and child types, it's Rails format (bidirectional)
  // If we only have parent type, it's test format (unidirectional)
  const isRailsFormat = hasParentType && hasChildType;
  
  relationships.forEach(rel => {
    // Handle different relationship formats (API format vs test format)
    const source = String(rel.source || rel.from || rel.person_a_id);
    const target = String(rel.target || rel.to || rel.person_b_id);
    
    // Support both 'type' and 'relationship_type' field names for flexibility
    const relationshipType = (rel.type || rel.relationship_type || '').toLowerCase();
    
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
        
      case 'spouse': {
        // Check if either person in the spouse relationship is deceased
        const sourcePerson = allPeople.find(p => String(p.id) === source);
        const targetPerson = allPeople.find(p => String(p.id) === target);
        const sourceIsDeceased = sourcePerson && sourcePerson.date_of_death;
        const targetIsDeceased = targetPerson && targetPerson.date_of_death;
        const isDeceasedSpouse = sourceIsDeceased || targetIsDeceased;
        
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
        } else if (isDeceasedSpouse) {
          // Automatically detect deceased spouse relationships based on death_date
          if (!deceasedSpouseMap.has(source)) {
            deceasedSpouseMap.set(source, new Set());
          }
          if (!deceasedSpouseMap.has(target)) {
            deceasedSpouseMap.set(target, new Set());
          }
          deceasedSpouseMap.get(source).add(target);
          deceasedSpouseMap.get(target).add(source);
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

  // CRITICAL FIX: After building parent-child relationships, automatically detect biological siblings through shared parents
  const allPersonIds = new Set();
  relationships.forEach(rel => {
    allPersonIds.add(String(rel.source || rel.from));
    allPersonIds.add(String(rel.target || rel.to));
  });

  // For each person, find their biological siblings by looking for other people with the same parents
  for (const personId of allPersonIds) {
    const personParents = childToParents.get(personId) || new Set();
    
    if (personParents.size > 0) {
      // Find all other people who share ALL parents with this person (biological siblings)
      for (const otherPersonId of allPersonIds) {
        if (personId !== otherPersonId) {
          const otherParents = childToParents.get(otherPersonId) || new Set();
          
          // Check if they share ALL parents (biological siblings)
          // Both must have the same number of parents and share all of them
          if (personParents.size === otherParents.size && personParents.size > 0) {
            const sharedParents = [...personParents].filter(parent => otherParents.has(parent));
            
            if (sharedParents.length === personParents.size) {
              // They share ALL parents - biological siblings
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
  }

  return {
    parentToChildren,
    childToParents,
    spouseMap,
    exSpouseMap,
    deceasedSpouseMap,
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

  // Check step-relationships
  const stepRelationship = findStepRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (stepRelationship) {
    return stepRelationship;
  }

  // Check if person is related through blood relationship
  const bloodRelationship = findBloodRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (bloodRelationship) {
    return bloodRelationship;
  }

  // Check deceased spouse's family relationships (special handling)
  const deceasedSpouseRelationship = findDeceasedSpouseRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (deceasedSpouseRelationship) {
    return deceasedSpouseRelationship;
  }

  // Check in-law relationships (current spouses only)
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
  const { parentToChildren, childToParents, spouseMap, exSpouseMap, deceasedSpouseMap, siblingMap } = relationshipMaps;
  
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
  
  // Check if person is root's deceased spouse
  if (deceasedSpouseMap.has(rootId) && deceasedSpouseMap.get(rootId).has(personId)) {
    // Check if the root person is deceased - if so, don't use "Late" prefix
    const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
    const rootIsDeceased = rootPerson && (rootPerson.date_of_death || rootPerson.is_deceased);
    
    if (rootIsDeceased) {
      // Root is deceased, so person is just their "Husband/Wife" (not "Late")
      return getGenderSpecificRelation(personId, 'Husband', 'Wife', allPeople, 'Spouse');
    } else {
      // Root is living, so person is their "Late Husband/Wife"
      return getGenderSpecificRelation(personId, 'Late Husband', 'Late Wife', allPeople, 'Late Spouse');
    }
  }
  
  // Check if person is root's ex-spouse
  if (exSpouseMap.has(rootId) && exSpouseMap.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Ex-Husband', 'Ex-Wife', allPeople, 'Ex-Spouse');
  }
  
  // Check if person is root's sibling (with generation validation)
  if (siblingMap.has(rootId) && siblingMap.get(rootId).has(personId)) {
    // Validate that they're actually in the same generation by checking if they share parents
    // This prevents incorrect sibling relationships between different generations
    const rootParents = childToParents.get(rootId) || new Set();
    const personParents = childToParents.get(personId) || new Set();
    
    // Find shared parents
    const sharedParents = [...rootParents].filter(parent => personParents.has(parent));
    
    if (sharedParents.length > 0) {
      // For biological siblings, they should have the same number of parents and share all of them
      // For step-siblings, they share some but not all parents (handled in step-relationship logic)
      if (rootParents.size === personParents.size && sharedParents.length === rootParents.size) {
        // They share all parents - biological siblings
        return getGenderSpecificRelation(personId, 'Brother', 'Sister', allPeople, 'Sibling');
      }
      // If they don't share all parents, this might be a step-sibling relationship
      // Let that be handled by the step-relationship logic
    }
    // If no shared parents, this is an incorrect sibling relationship - ignore it and continue to blood relationship calculation
  }
  
  console.log('[DEBUG STEP-SIBLING] ❌ No step-sibling relationship found, returning null');
  return null;
};

/**
 * Check if a deceased person is a connecting link between two people
 * @param {string} deceasedId - The deceased person's ID
 * @param {string} personId - First person's ID
 * @param {string} rootId - Second person's ID
 * @param {Map} childToParents - Child to parents map
 * @param {Map} parentToChildren - Parent to children map
 * @returns {boolean} - True if deceased person connects the two people
 */
const isDeceasedPersonConnectingPersonAndRoot = (deceasedId, personId, rootId, childToParents, parentToChildren) => {
  // Check if the deceased person is DIRECTLY in the relationship path between person and root
  // This should only block relationships that REQUIRE the deceased person as a connecting link
  
  // Check if person is descendant of deceased
  const isPersonDescendant = isDescendantOf(personId, deceasedId, parentToChildren);
  // Check if root is descendant of deceased
  const isRootDescendant = isDescendantOf(rootId, deceasedId, parentToChildren);
  
  // CRITICAL: Only block if the deceased is a NECESSARY connecting link
  // For step-siblings sharing a living parent, the deceased parent of one sibling
  // is NOT a connecting person - the living shared parent is the connection
  
  // If both person and root are descendants of deceased, deceased is not connecting them (they're both in same family tree)
  if (isPersonDescendant && isRootDescendant) {
    return false; // They're both descendants, so deceased is not a connecting bridge
  }
  
  // If neither is descendant of deceased, deceased is not connecting them
  if (!isPersonDescendant && !isRootDescendant) {
    return false;
  }
  
  // If only one is descendant of deceased, check if deceased is required for the connection
  // This is more complex - for now, let's be more conservative and only block specific cases
  
  // Check if there's a direct step-relationship path that doesn't require the deceased
  // For step-siblings: if they share a living parent, deceased parent is not connecting them
  const personParents = childToParents.get(personId) || new Set();
  const rootParents = childToParents.get(rootId) || new Set();
  
  // Find shared living parents
  const sharedParents = [...personParents].filter(parent => rootParents.has(parent));
  
  // If they share living parents and deceased is not one of those shared parents, 
  // then deceased is not the connecting person
  if (sharedParents.length > 0 && !sharedParents.includes(deceasedId)) {
    return false; // They have other connecting parents, deceased is not required
  }
  
  // If deceased is the only potential connecting link, then it IS connecting them
  return true;
};

/**
 * Check if a person is descendant of another person
 * @param {string} descendantId - Potential descendant's ID
 * @param {string} ancestorId - Potential ancestor's ID
 * @param {Map} parentToChildren - Parent to children map
 * @returns {boolean} - True if descendant is descendant of ancestor
 */
const isDescendantOf = (descendantId, ancestorId, parentToChildren) => {
  const visited = new Set();
  const queue = [ancestorId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    const children = parentToChildren.get(currentId) || new Set();
    if (children.has(descendantId)) {
      return true;
    }
    
    // Add children to queue to check further generations
    for (const childId of children) {
      if (!visited.has(childId)) {
        queue.push(childId);
      }
    }
  }
  
  return false;
};

/**
 * Find step-relationships (step-parent, step-child, step-sibling)
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - Step relationship or null
 */
const findStepRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { childToParents, parentToChildren, spouseMap, deceasedSpouseMap } = relationshipMaps;
  
  // COMPREHENSIVE TIMELINE VALIDATION: Block ALL step-relationships when connecting person died before target was born
  // This prevents step-relationships through deceased connecting persons in all bidirectional cases
  const personObj = allPeople.find(p => String(p.id) === String(personId));
  const rootObj = allPeople.find(p => String(p.id) === String(rootId));
  
  if (personObj && rootObj) {
    // Check all deceased spouses in the system to see if they create invalid timeline connections
    for (const [spouseId, deceasedSpouses] of deceasedSpouseMap) {
      for (const deceasedSpouse of deceasedSpouses) {
        const deceasedPerson = allPeople.find(p => String(p.id) === String(deceasedSpouse));
        if (deceasedPerson && deceasedPerson.date_of_death) {
          const deathDate = new Date(deceasedPerson.date_of_death);
          
          // Check if this deceased person creates an invalid connection between person and root
          // If either person or root was born after the deceased person died, and this deceased person
          // is a potential connecting link, then block any step-relationship
          if (personObj.date_of_birth) {
            const personBirth = new Date(personObj.date_of_birth);
            if (personBirth > deathDate) {
              // Person was born after deceased spouse died - check if this deceased spouse connects them to root
              const isConnectingPerson = isDeceasedPersonConnectingPersonAndRoot(deceasedSpouse, personId, rootId, childToParents, parentToChildren);
              if (isConnectingPerson) {
                return null; // Block step-relationship due to timeline violation
              }
            }
          }
          
          if (rootObj.date_of_birth) {
            const rootBirth = new Date(rootObj.date_of_birth);
            if (rootBirth > deathDate) {
              // Root was born after deceased spouse died - check if this deceased spouse connects them to person
              const isConnectingPerson = isDeceasedPersonConnectingPersonAndRoot(deceasedSpouse, personId, rootId, childToParents, parentToChildren);
              if (isConnectingPerson) {
                return null; // Block step-relationship due to timeline violation
              }
            }
          }
        }
      }
    }
  }
  
  // Check for step-parent relationship
  // Person is step-parent of root if: person is spouse of root's parent, but not root's biological parent
  const rootParents = childToParents.get(rootId) || new Set();
  for (const parent of rootParents) {
    // Check if person is current spouse of this parent
    if (spouseMap.has(parent) && spouseMap.get(parent).has(personId)) {
      // Make sure person is not a biological parent of root
      if (!rootParents.has(personId)) {
        return getGenderSpecificRelation(personId, 'Step-Father', 'Step-Mother', allPeople, 'Step-Parent');
      }
    }
    // Check if person is deceased spouse of this parent
    if (deceasedSpouseMap.has(parent) && deceasedSpouseMap.get(parent).has(personId)) {
      // Make sure person is not a biological parent of root
      if (!rootParents.has(personId)) {
        // CRITICAL FIX: Check if deceased spouse was alive when root was born
        // A deceased person cannot be a step-parent to someone born after their death
        const person = allPeople.find(p => String(p.id) === String(personId));
        const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
        
        if (person && rootPerson && person.date_of_death && rootPerson.date_of_birth) {
          const deathDate = new Date(person.date_of_death);
          const birthDate = new Date(rootPerson.date_of_birth);
          
          // If root was born after person's death, they cannot have a step-relationship
          if (birthDate > deathDate) {
            continue; // Skip this deceased spouse, not a valid step-parent
          }
        }
        
        return getGenderSpecificRelation(personId, 'Late Step-Father', 'Late Step-Mother', allPeople, 'Late Step-Parent');
      }
    }
  }
  
  // Check for step-child relationship
  // Person is step-child of root if: root is spouse of person's parent, but not person's biological parent
  const personParents = childToParents.get(personId) || new Set();
  for (const parent of personParents) {
    // Check if root is current spouse of this parent
    if (spouseMap.has(parent) && spouseMap.get(parent).has(rootId)) {
      // Make sure root is not a biological parent of person
      if (!personParents.has(rootId)) {
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
    // Check if root is deceased spouse of this parent
    if (deceasedSpouseMap.has(parent) && deceasedSpouseMap.get(parent).has(rootId)) {
      // Make sure root is not a biological parent of person
      if (!personParents.has(rootId)) {
        // CRITICAL FIX: Check if deceased spouse was alive when person was born
        // A deceased person cannot be a step-parent to someone born after their death
        const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
        const person = allPeople.find(p => String(p.id) === String(personId));
        
        if (rootPerson && person && rootPerson.date_of_death && person.date_of_birth) {
          const deathDate = new Date(rootPerson.date_of_death);
          const birthDate = new Date(person.date_of_birth);
          
          // If person was born after root's death, they cannot have a step-relationship
          if (birthDate > deathDate) {
            continue; // Skip this deceased spouse, not a valid step-parent
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
  }
  
  // Check for step-grandparent relationship
  // Person is step-grandparent of root if: person is parent of root's step-parent
  for (const parent of rootParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    
    // Check all step-parents of root
    for (const stepParent of [...parentSpouses, ...parentDeceasedSpouses]) {
      if (!rootParents.has(stepParent)) { // Make sure it's actually a step-parent
        const stepParentParents = childToParents.get(stepParent) || new Set();
        if (stepParentParents.has(personId)) {
          // CRITICAL FIX: Check if deceased step-parent was alive when the person being evaluated was born
          // A deceased step-parent cannot create step-grandparent relationships for people born after their death
          const stepParentPerson = allPeople.find(p => String(p.id) === String(stepParent));
          const personObj = allPeople.find(p => String(p.id) === String(personId));
          
          if (stepParentPerson && personObj && stepParentPerson.date_of_death && personObj.date_of_birth) {
            const deathDate = new Date(stepParentPerson.date_of_death);
            const birthDate = new Date(personObj.date_of_birth);
            
            // If person was born after step-parent's death, no step-grandparent relationship exists
            if (birthDate > deathDate) {
              continue; // Skip this deceased step-parent, not a valid step-grandparent relationship
            }
          }
          
          return getGenderSpecificRelation(personId, 'Step-Grandfather', 'Step-Grandmother', allPeople, 'Step-Grandparent');
        }
      }
    }
  }
  
  // REMOVED: Incorrect step-grandparent reverse logic
  // The reverse step-grandparent logic was creating false relationships.
  // Step-grandparent relationships should only be created through the primary logic above.
  
  // ADDITIONAL: Check for step-great-grandparent relationship through person's biological children
  // Person is step-great-grandparent of root if: person's child has step-grandchildren, and root is one of them
  const personChildren = parentToChildren.get(personId) || new Set();
  for (const personChild of personChildren) {
    // Check if this child has step-relationships (through marriage)
    const childSpouses = spouseMap.get(personChild) || new Set();
    const childDeceasedSpouses = deceasedSpouseMap.get(personChild) || new Set();
    
    for (const childSpouse of [...childSpouses, ...childDeceasedSpouses]) {
      // CRITICAL TIMELINE CHECK: If personChild is deceased, check if they were alive when the step-grandchild was born
      // A deceased person cannot have step-relationships with people born after their death
      const personChildObj = allPeople.find(p => String(p.id) === String(personChild));
      
      // For step-great-grandparent logic: check timeline against the step-grandchild (found later in the logic)
      // Since we don't know the step-grandchild yet, we'll do this check inside the inner loop
      if (personChildObj && personChildObj.date_of_death) {
        // We'll validate this timeline later when we find the actual step-grandchild
      }
      
      // Find childSpouse's children who are not personChild's biological children (personChild's step-children)
      const childSpouseChildren = parentToChildren.get(childSpouse) || new Set();
      for (const stepChild of childSpouseChildren) {
        const stepChildParents = childToParents.get(stepChild) || new Set();
        // If personChild is not biological parent of this stepChild, it's personChild's step-child
        if (!stepChildParents.has(personChild) && stepChildParents.has(childSpouse)) {
          // This is personChild's step-child, check if root is their child (making root person's step-great-grandchild)
          const stepChildChildren = parentToChildren.get(stepChild) || new Set();
          if (stepChildChildren.has(rootId)) {
            // CRITICAL TIMELINE CHECK: If personChild is deceased, verify they were alive when root was born
            // A deceased person cannot create step-great-grandparent relationships for people born after their death
            if (personChildObj && personChildObj.date_of_death) {
              const rootObj = allPeople.find(p => String(p.id) === String(rootId));
              if (rootObj && rootObj.date_of_birth) {
                const deathDate = new Date(personChildObj.date_of_death);
                const birthDate = new Date(rootObj.date_of_birth);
                
                // If root was born after personChild's death, no step-great-grandparent relationship exists
                if (birthDate > deathDate) {
                  continue; // Skip this deceased step-relationship, not valid
                }
              }
            }
            
            return getGenderSpecificRelation(personId, 'Step-Great-Grandfather', 'Step-Great-Grandmother', allPeople, 'Step-Great-Grandparent');
          }
        }
      }
    }
  }
  
  // Check for step-grandchild relationship
  // Person is step-grandchild of root if: root is parent of person's step-parent
  for (const parent of personParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    
    // Check all step-parents of person
    for (const stepParent of [...parentSpouses, ...parentDeceasedSpouses]) {
      if (!personParents.has(stepParent)) { // Make sure it's actually a step-parent
        // CRITICAL TIMELINE CHECK: If the step-parent is deceased, check if they were alive when person was born
        // A deceased step-parent cannot create step-grandchild relationships for people born after their death
        const stepParentPerson = allPeople.find(p => String(p.id) === String(stepParent));
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        
        if (stepParentPerson && personObj && stepParentPerson.date_of_death && personObj.date_of_birth) {
          const deathDate = new Date(stepParentPerson.date_of_death);
          const birthDate = new Date(personObj.date_of_birth);
          
          // If person was born after step-parent's death, no step-grandchild relationship exists
          if (birthDate > deathDate) {
            continue; // Skip this deceased step-parent, not a valid step-grandchild relationship
          }
        }
        
        const stepParentParents = childToParents.get(stepParent) || new Set();
        if (stepParentParents.has(rootId)) {
          return getGenderSpecificRelation(personId, 'Step-Grandson', 'Step-Granddaughter', allPeople, 'Step-Grandchild');
        }
      }
    }
  }
  
  // ADDITIONAL: Check for step-grandchild relationship (reverse)
  // Person is step-grandchild of root if: person is child of root's step-child
  // CRITICAL: Only applies when the connecting person is root's spouse, not root's child
  // Find root's spouses and their children who are not root's biological children (root's step-children)
  const rootSpouses = spouseMap.get(rootId) || new Set();
  const rootDeceasedSpouses = deceasedSpouseMap.get(rootId) || new Set();
  
  for (const spouse of [...rootSpouses, ...rootDeceasedSpouses]) {
    // Get all children of this spouse
    const spouseChildren = parentToChildren.get(spouse) || new Set();
    for (const spouseChild of spouseChildren) {
      // Check if this child is not root's biological child (making it root's step-child)
      const spouseChildParents = childToParents.get(spouseChild) || new Set();
      if (!spouseChildParents.has(rootId) && spouseChildParents.has(spouse)) {
        // CRITICAL TIMELINE CHECK: If the step-child is deceased, check if they were alive when person was born
        // A deceased step-child cannot create step-grandchild relationships for people born after their death
        const stepChildPerson = allPeople.find(p => String(p.id) === String(spouseChild));
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        
        if (stepChildPerson && personObj && stepChildPerson.date_of_death && personObj.date_of_birth) {
          const deathDate = new Date(stepChildPerson.date_of_death);
          const birthDate = new Date(personObj.date_of_birth);
          
          // If person was born after step-child's death, no step-grandchild relationship exists
          if (birthDate > deathDate) {
            continue; // Skip this deceased step-child, not a valid step-grandchild relationship
          }
        }
        
        // This is root's step-child, check if person is their child (making person root's step-grandchild)
        const stepChildChildren = parentToChildren.get(spouseChild) || new Set();
        if (stepChildChildren.has(personId)) {
          return getGenderSpecificRelation(personId, 'Step-Grandson', 'Step-Granddaughter', allPeople, 'Step-Grandchild');
        }
        
        // ADDITIONAL: Check for step-great-grandchild relationship
        // Person is step-great-grandchild of root if: person is child of root's step-grandchild
        for (const stepGrandchild of stepChildChildren) {
          const stepGrandchildChildren = parentToChildren.get(stepGrandchild) || new Set();
          if (stepGrandchildChildren.has(personId)) {
            return getGenderSpecificRelation(personId, 'Step-Great-Grandson', 'Step-Great-Granddaughter', allPeople, 'Step-Great-Grandchild');
          }
        }
      }
    }
  }
  
  // ADDITIONAL: Check for step-great-grandchild relationship through root's biological children
  // Person is step-great-grandchild of root if: root's child has step-grandchildren, and person is one of them
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const rootChild of rootChildren) {
    // Check if this child has step-relationships (through marriage)
    const childSpouses = spouseMap.get(rootChild) || new Set();
    const childDeceasedSpouses = deceasedSpouseMap.get(rootChild) || new Set();
    
    for (const childSpouse of [...childSpouses, ...childDeceasedSpouses]) {
      // CRITICAL TIMELINE CHECK: If rootChild is deceased, check if they were alive when person was born
      // A deceased person cannot have step-relationships with people born after their death
      const rootChildObj = allPeople.find(p => String(p.id) === String(rootChild));
      const personObj = allPeople.find(p => String(p.id) === String(personId));
      
      if (rootChildObj && personObj && rootChildObj.date_of_death && personObj.date_of_birth) {
        const deathDate = new Date(rootChildObj.date_of_death);
        const birthDate = new Date(personObj.date_of_birth);
        
        // If person was born after rootChild's death, no step-relationship can exist
        if (birthDate > deathDate) {
          continue; // Skip this deceased child, no valid step-relationship possible
        }
      }
      
      // Find childSpouse's children who are not rootChild's biological children (rootChild's step-children)
      const childSpouseChildren = parentToChildren.get(childSpouse) || new Set();
      for (const stepChild of childSpouseChildren) {
        const stepChildParents = childToParents.get(stepChild) || new Set();
        // If rootChild is not biological parent of this stepChild, it's rootChild's step-child
        if (!stepChildParents.has(rootChild) && stepChildParents.has(childSpouse)) {
          // This is rootChild's step-child, check if person is their child (making person root's step-great-grandchild)
          const stepChildChildren = parentToChildren.get(stepChild) || new Set();
          if (stepChildChildren.has(personId)) {
            return getGenderSpecificRelation(personId, 'Step-Great-Grandson', 'Step-Great-Granddaughter', allPeople, 'Step-Great-Grandchild');
          }
        }
      }
    }
  }
  
  console.log('[DEBUG STEP-SIBLING] Starting step-sibling check for person=' + personId + ', root=' + rootId);
  
  // Check for step-sibling relationship
  // Person is step-sibling of root if: they share a step-parent but no biological parents
  const rootStepParents = new Set();
  const personStepParents = new Set();
  
  const rootParents = childToParents.get(rootId) || new Set();
  const personParents = childToParents.get(personId) || new Set();
  console.log('[DEBUG STEP-SIBLING] rootParents:', Array.from(rootParents));
  console.log('[DEBUG STEP-SIBLING] personParents:', Array.from(personParents));
  
  // Find root's step-parents
  for (const parent of rootParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    [...parentSpouses, ...parentDeceasedSpouses].forEach(spouse => {
      if (!rootParents.has(spouse)) {
        rootStepParents.add(spouse);
      }
    });
  }
  
  // Find person's step-parents
  for (const parent of personParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    [...parentSpouses, ...parentDeceasedSpouses].forEach(spouse => {
      if (!personParents.has(spouse)) {
        personStepParents.add(spouse);
      }
    });
  }
  
  console.log('[DEBUG STEP-SIBLING] rootStepParents:', Array.from(rootStepParents));
  console.log('[DEBUG STEP-SIBLING] personStepParents:', Array.from(personStepParents));
  
  // Check if person is child of any of root's step-parents
  for (const stepParent of rootStepParents) {
    if (personParents.has(stepParent)) {
      console.log('[DEBUG STEP-SIBLING] Found step-parent match:', stepParent);
      console.log('[DEBUG STEP-SIBLING] personParents.has(stepParent):', personParents.has(stepParent));
      
      // Make sure they don't share ALL biological parents (if they do, they're full siblings)
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      console.log('[DEBUG STEP-SIBLING] sharedBioParents:', sharedBioParents);
      console.log('[DEBUG STEP-SIBLING] rootParents.size:', rootParents.size, 'personParents.size:', personParents.size);
      console.log('[DEBUG STEP-SIBLING] condition check:', sharedBioParents.length, '<', Math.max(rootParents.size, personParents.size), '=', sharedBioParents.length < Math.max(rootParents.size, personParents.size));
      
      if (sharedBioParents.length < Math.max(rootParents.size, personParents.size)) {
        console.log('[DEBUG STEP-SIBLING] ✅ RETURNING STEP-SIBLING RELATIONSHIP!');
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  // Check if root is child of any of person's step-parents
  for (const stepParent of personStepParents) {
    if (rootParents.has(stepParent)) {
      // Make sure they don't share ALL biological parents (if they do, they're full siblings)
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      if (sharedBioParents.length < Math.max(rootParents.size, personParents.size)) {
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
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
  const { parentToChildren, childToParents, siblingMap, spouseMap, deceasedSpouseMap } = relationshipMaps;
  
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
  
  // Check for step-aunt/step-uncle relationship (person is step-sibling of root's parent)
  for (const parent of rootParents) {
    // Find step-siblings of this parent (through parent's parent's spouse)
    const parentParents = childToParents.get(parent) || new Set();
    for (const grandparent of parentParents) {
      const grandparentSpouses = spouseMap.get(grandparent) || new Set();
      const grandparentDeceasedSpouses = deceasedSpouseMap.get(grandparent) || new Set();
      for (const spouse of [...grandparentSpouses, ...grandparentDeceasedSpouses]) {
        if (!parentParents.has(spouse)) {
          // This spouse is a step-parent of parent, find their children who are parent's step-siblings
          const stepParentChildren = parentToChildren.get(spouse) || new Set();
          if (stepParentChildren.has(personId) && personId !== parent) {
            return getGenderSpecificRelation(personId, 'Step-Uncle', 'Step-Aunt', allPeople, "Parent's step-sibling");
          }
        }
      }
    }
  }

  // Check for niece/nephew relationship (person is niece/nephew of root)
  // Only count biological siblings, not step-siblings
  for (const sibling of rootSiblings) {
    if (parentToChildren.has(sibling) && parentToChildren.get(sibling).has(personId)) {
      // Check if this is a biological sibling (shares all parents with root) vs step-sibling
      const siblingParents = childToParents.get(sibling) || new Set();
      const sharedParents = [...rootParents].filter(parent => siblingParents.has(parent));
      
      // If they share ALL parents, they're biological siblings
      if (sharedParents.length === rootParents.size && sharedParents.length === siblingParents.size && sharedParents.length > 0) {
        return getGenderSpecificRelation(personId, 'Nephew', 'Niece', allPeople, "Sibling's child");
      }
      // If they're step-siblings, this will be handled by the step-nephew/niece logic below
    }
  }
  
  // Check for step-niece/step-nephew relationship (person is child of root's step-sibling)
  // First, find root's step-siblings
  const rootStepSiblings = new Set();
  for (const parent of rootParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    [...parentSpouses, ...parentDeceasedSpouses].forEach(spouse => {
      if (!rootParents.has(spouse)) {
        // This spouse is a step-parent of root, find their children who are root's step-siblings
        const stepParentChildren = parentToChildren.get(spouse) || new Set();
        stepParentChildren.forEach(stepSibling => {
          if (stepSibling !== rootId) { // Don't include root themselves
            rootStepSiblings.add(stepSibling);
          }
        });
      }
    });
  }
  
  // Check if person is child of any step-sibling
  for (const stepSibling of rootStepSiblings) {
    if (parentToChildren.has(stepSibling) && parentToChildren.get(stepSibling).has(personId)) {
      return getGenderSpecificRelation(personId, 'Step-Nephew', 'Step-Niece', allPeople, "Step-Sibling's child");
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
  const { parentToChildren, childToParents, spouseMap, exSpouseMap, deceasedSpouseMap, siblingMap } = relationshipMaps;
  
  // Get all current spouses of root (NO ex-spouses for in-law calculations)
  // DEFENSIVE CHECK: Filter out any spouses that are marked as deceased or ex
  const rootCurrentSpousesRaw = spouseMap.get(rootId) || new Set();
  const rootDeceasedSpouses = deceasedSpouseMap.get(rootId) || new Set();
  const rootExSpouses = exSpouseMap.get(rootId) || new Set();
  
  const rootCurrentSpouses = new Set();
  for (const spouse of rootCurrentSpousesRaw) {
    if (!rootDeceasedSpouses.has(spouse) && !rootExSpouses.has(spouse)) {
      rootCurrentSpouses.add(spouse);
    }
  }
  
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
    const siblingCurrentSpousesRaw = spouseMap.get(sibling) || new Set();
    const siblingDeceasedSpouses = deceasedSpouseMap.get(sibling) || new Set();
    const siblingExSpouses = exSpouseMap.get(sibling) || new Set();
    
    // Filter out deceased and ex-spouses
    const siblingCurrentSpouses = new Set();
    for (const spouse of siblingCurrentSpousesRaw) {
      if (!siblingDeceasedSpouses.has(spouse) && !siblingExSpouses.has(spouse)) {
        siblingCurrentSpouses.add(spouse);
      }
    }
    
    if (siblingCurrentSpouses.has(personId)) {
      return getGenderSpecificRelation(personId, 'Brother-in-law', 'Sister-in-law', allPeople, 'Sibling-in-law');
    }
  }
  
  // Check if person is current spouse of root's child (child-in-law)
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const child of rootChildren) {
    const childCurrentSpousesRaw = spouseMap.get(child) || new Set();
    const childDeceasedSpouses = deceasedSpouseMap.get(child) || new Set();
    const childExSpouses = exSpouseMap.get(child) || new Set();
    
    // Filter out deceased and ex-spouses
    for (const spouse of childCurrentSpousesRaw) {
      if (!childDeceasedSpouses.has(spouse) && !childExSpouses.has(spouse) && spouse === personId) {
        return getGenderSpecificRelation(personId, 'Son-in-law', 'Daughter-in-law', allPeople, 'Child-in-law');
      }
    }
  }
  
  // ===========================================
  // REVERSE DIRECTION: ROOT IS THE IN-LAW (CURRENT SPOUSES ONLY)
  // ===========================================
  
  // Check if root is current spouse of person's child (root is child-in-law to person)
  const personChildren = parentToChildren.get(personId) || new Set();
  for (const child of personChildren) {
    const childCurrentSpousesRaw = spouseMap.get(child) || new Set();
    const childDeceasedSpouses = deceasedSpouseMap.get(child) || new Set();
    const childExSpouses = exSpouseMap.get(child) || new Set();
    
    // Filter out deceased and ex-spouses
    for (const spouse of childCurrentSpousesRaw) {
      if (!childDeceasedSpouses.has(spouse) && !childExSpouses.has(spouse) && spouse === rootId) {
        return getGenderSpecificRelation(rootId, 'Son-in-law', 'Daughter-in-law', allPeople, 'Child-in-law');
      }
    }
  }
  
  // Check if root is current spouse of person's sibling (root is sibling-in-law to person)
  const personSiblings = siblingMap.get(personId) || new Set();
  for (const sibling of personSiblings) {
    const siblingCurrentSpousesRaw = spouseMap.get(sibling) || new Set();
    const siblingDeceasedSpouses = deceasedSpouseMap.get(sibling) || new Set();
    const siblingExSpouses = exSpouseMap.get(sibling) || new Set();
    
    // Filter out deceased and ex-spouses
    for (const spouse of siblingCurrentSpousesRaw) {
      if (!siblingDeceasedSpouses.has(spouse) && !siblingExSpouses.has(spouse) && spouse === rootId) {
        return getGenderSpecificRelation(rootId, 'Brother-in-law', 'Sister-in-law', allPeople, 'Sibling-in-law');
      }
    }
  }
  
  // Check if root is parent of person's current spouse (root is parent-in-law to person)
  // DEFENSIVE CHECK: Ensure the spouse is truly current (not deceased or ex)
  const personCurrentSpouses = spouseMap.get(personId) || new Set();
  for (const spouse of personCurrentSpouses) {
    // Double-check that this spouse is not in deceased or ex-spouse maps
    const personDeceasedSpouses = deceasedSpouseMap.get(personId) || new Set();
    const personExSpouses = exSpouseMap.get(personId) || new Set();
    
    if (personDeceasedSpouses.has(spouse) || personExSpouses.has(spouse)) {
      // Skip this spouse if they're deceased or ex-spouse
      continue;
    }
    
    if (childToParents.has(spouse) && childToParents.get(spouse).has(rootId)) {
      return getGenderSpecificRelation(rootId, 'Father-in-law', 'Mother-in-law', allPeople, 'Parent-in-law');
    }
  }
  
  // ===========================================
  // PARENT-OF-SPOUSE TO PARENT-OF-SPOUSE RELATIONSHIPS
  // ===========================================
  
  // Check if person and root are both parents of spouses (co-parents-in-law)
  // Example: Michael A (David's father) ↔ John/Jane Doe (Alice's parents) when David ↔ Alice are CURRENTLY married
  // Note: Co-parent-in-law relationships only apply to CURRENT spouses, not ex-spouses
  
  for (const personChild of (parentToChildren.get(personId) || new Set())) {
    for (const rootChild of (parentToChildren.get(rootId) || new Set())) {
      // Check if person's child is CURRENTLY married to root's child (only current spouses, not ex-spouses)
      const personChildCurrentSpousesRaw = spouseMap.get(personChild) || new Set();
      const personChildDeceasedSpouses = deceasedSpouseMap.get(personChild) || new Set();
      const personChildExSpouses = exSpouseMap.get(personChild) || new Set();
      
      // Filter out deceased and ex-spouses
      for (const spouse of personChildCurrentSpousesRaw) {
        if (!personChildDeceasedSpouses.has(spouse) && !personChildExSpouses.has(spouse) && spouse === rootChild) {
          // They are co-parents-in-law (parents of CURRENT spouses only)
          return getGenderSpecificRelation(personId, 'Co-Father-in-law', 'Co-Mother-in-law', allPeople, 'Co-Parent-in-law');
        }
      }
    }
  }
  
  // NO EX-SPOUSE IN-LAW LOGIC - All ex-spouse relatives should be "Unrelated"
  return null;
};

/**
 * Find deceased spouse's family relationships
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - Deceased spouse family relationship or null
 */
const findDeceasedSpouseRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { parentToChildren, childToParents, deceasedSpouseMap, siblingMap } = relationshipMaps;
  
  // Get all deceased spouses of root
  const rootDeceasedSpouses = deceasedSpouseMap.get(rootId) || new Set();
  
  // IMPORTANT: Deceased spouse's parents have NO relationship to the surviving spouse
  // They are "Unrelated" because the connecting person (deceased spouse) is gone
  // However, they maintain blood relationships to their grandchildren
  
  // Check if person is parent of root's deceased spouse
  // This means person is deceased spouse's parent, root is the surviving spouse
  // Result: They should be "Unrelated" - no relationship exists
  for (const deceasedSpouse of rootDeceasedSpouses) {
    if (childToParents.has(deceasedSpouse) && childToParents.get(deceasedSpouse).has(personId)) {
      // Person is parent of root's deceased spouse -> NO RELATIONSHIP
      return null; // Let it fall through to "Unrelated"
    }
  }
  
  // Check if person is child of root's deceased spouse (late spouse's child from another relationship)
  for (const deceasedSpouse of rootDeceasedSpouses) {
    if (parentToChildren.has(deceasedSpouse) && parentToChildren.get(deceasedSpouse).has(personId)) {
      // Person is child of root's deceased spouse - but check if they're already blood relatives
      // If they share the deceased spouse as a parent with root, they're already siblings/step-siblings
      const rootParents = childToParents.get(rootId) || new Set();
      if (!rootParents.has(deceasedSpouse)) {
        // CRITICAL FIX: Check if deceased spouse was alive when person was born
        // A deceased person cannot have a relationship with someone born after their death
        const deceasedSpousePerson = allPeople.find(p => String(p.id) === String(deceasedSpouse));
        const person = allPeople.find(p => String(p.id) === String(personId));
        
        if (deceasedSpousePerson && person && deceasedSpousePerson.date_of_death && person.date_of_birth) {
          const deathDate = new Date(deceasedSpousePerson.date_of_death);
          const birthDate = new Date(person.date_of_birth);
          
          // If person was born after deceased spouse's death, they cannot have a relationship
          if (birthDate > deathDate) {
            continue; // Skip this deceased spouse, no relationship possible
          }
        }
        
        // Root is not biological child of the deceased spouse, so this is truly a late spouse's child
        const deceasedGender = deceasedSpousePerson?.gender?.toLowerCase();
        
        if (deceasedGender === 'female') {
          return getGenderSpecificRelation(personId, 'Late Wife\'s Son', 'Late Wife\'s Daughter', allPeople, 'Late Wife\'s Child');
        } else if (deceasedGender === 'male') {
          return getGenderSpecificRelation(personId, 'Late Husband\'s Son', 'Late Husband\'s Daughter', allPeople, 'Late Husband\'s Child');
        } else {
          return getGenderSpecificRelation(personId, 'Late Spouse\'s Son', 'Late Spouse\'s Daughter', allPeople, 'Late Spouse\'s Child');
        }
      }
    }
  }
  
  // Check if person is sibling of root's deceased spouse (late spouse's sibling)
  for (const deceasedSpouse of rootDeceasedSpouses) {
    if (siblingMap.has(deceasedSpouse) && siblingMap.get(deceasedSpouse).has(personId)) {
      const deceasedSpousePerson = allPeople.find(p => String(p.id) === String(deceasedSpouse));
      const deceasedGender = deceasedSpousePerson?.gender?.toLowerCase();
      
      if (deceasedGender === 'female') {
        return getGenderSpecificRelation(personId, 'Late Wife\'s Brother', 'Late Wife\'s Sister', allPeople, 'Late Wife\'s Sibling');
      } else if (deceasedGender === 'male') {
        return getGenderSpecificRelation(personId, 'Late Husband\'s Brother', 'Late Husband\'s Sister', allPeople, 'Late Husband\'s Sibling');
      } else {
        return getGenderSpecificRelation(personId, 'Late Spouse\'s Brother', 'Late Spouse\'s Sister', allPeople, 'Late Spouse\'s Sibling');
      }
    }
  }
  
  // Reverse direction: Check if root is family member of person's deceased spouse
  const personDeceasedSpouses = deceasedSpouseMap.get(personId) || new Set();
  
  // Check if root is parent of person's deceased spouse  
  // This means: person had a deceased spouse, and root is that deceased spouse's parent
  // Result: They should be "Unrelated" - no relationship exists
  for (const deceasedSpouse of personDeceasedSpouses) {
    if (childToParents.has(deceasedSpouse) && childToParents.get(deceasedSpouse).has(rootId)) {
      // Root is parent of person's deceased spouse -> NO RELATIONSHIP
      return null; // Let it fall through to "Unrelated"
    }
  }
  
  // Check if root is child of person's deceased spouse
  for (const deceasedSpouse of personDeceasedSpouses) {
    if (parentToChildren.has(deceasedSpouse) && parentToChildren.get(deceasedSpouse).has(rootId)) {
      const personParents = childToParents.get(personId) || new Set();
      if (!personParents.has(deceasedSpouse)) {
        const deceasedSpousePerson = allPeople.find(p => String(p.id) === String(deceasedSpouse));
        const deceasedGender = deceasedSpousePerson?.gender?.toLowerCase();
        
        if (deceasedGender === 'female') {
          return getGenderSpecificRelation(rootId, 'Late Wife\'s Son', 'Late Wife\'s Daughter', allPeople, 'Late Wife\'s Child');
        } else if (deceasedGender === 'male') {
          return getGenderSpecificRelation(rootId, 'Late Husband\'s Son', 'Late Husband\'s Daughter', allPeople, 'Late Husband\'s Child');
        } else {
          return getGenderSpecificRelation(rootId, 'Late Spouse\'s Son', 'Late Spouse\'s Daughter', allPeople, 'Late Spouse\'s Child');
        }
      }
    }
  }
  
  // Check if root is sibling of person's deceased spouse
  for (const deceasedSpouse of personDeceasedSpouses) {
    if (siblingMap.has(deceasedSpouse) && siblingMap.get(deceasedSpouse).has(rootId)) {
      const deceasedSpousePerson = allPeople.find(p => String(p.id) === String(deceasedSpouse));
      const deceasedGender = deceasedSpousePerson?.gender?.toLowerCase();
      
      if (deceasedGender === 'female') {
        return getGenderSpecificRelation(rootId, 'Late Wife\'s Brother', 'Late Wife\'s Sister', allPeople, 'Late Wife\'s Sibling');
      } else if (deceasedGender === 'male') {
        return getGenderSpecificRelation(rootId, 'Late Husband\'s Brother', 'Late Husband\'s Sister', allPeople, 'Late Husband\'s Sibling');
      } else {
        return getGenderSpecificRelation(rootId, 'Late Spouse\'s Brother', 'Late Spouse\'s Sister', allPeople, 'Late Spouse\'s Sibling');
      }
    }
  }
  
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
    const gender = person.gender.toLowerCase();
    if (gender === 'female') {
      return femaleRelation;
    } else if (gender === 'male') {
      return maleRelation;
    } else {
      // For non-binary, non-conforming, or any other gender identity
      return neutralRelation || maleRelation;
    }
  }
  // If neutralRelation is provided and gender is not available, use neutral term
  if (neutralRelation) {
    return neutralRelation;
  }
  return maleRelation; // Default to male if gender not found and no neutral term provided
};

/**
 * Enhanced function to detect ANY blood relationship between two people
 * including all ancestor-descendant relationships regardless of depth
 * @param {string} person1Id - First person's ID  
 * @param {string} person2Id - Second person's ID
 * @param {Array} relationships - Array of all relationships
 * @param {Array} allPeople - Array of all people
 * @returns {Object} - {isBloodRelated: boolean, relationship: string, depth: number}
 */
export const detectAnyBloodRelationship = (person1Id, person2Id, relationships, allPeople) => {
  if (!person1Id || !person2Id || person1Id === person2Id) {
    return { isBloodRelated: false, relationship: null, depth: 0 };
  }

  const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
  const { parentToChildren, childToParents } = relationshipMaps;
  
  // Convert IDs to strings for consistent lookup
  const p1Id = String(person1Id);
  const p2Id = String(person2Id);
  
  // Check if person1 is an ancestor of person2 (any depth)
  const ancestorResult = isAncestorOf(p1Id, p2Id, parentToChildren, 0);
  if (ancestorResult.isAncestor) {
    return {
      isBloodRelated: true,
      relationship: `${getGenerationName(ancestorResult.depth)}-ancestor`,
      depth: ancestorResult.depth
    };
  }
  
  // Check if person2 is an ancestor of person1 (any depth)
  const descendantResult = isAncestorOf(p2Id, p1Id, parentToChildren, 0);
  if (descendantResult.isAncestor) {
    return {
      isBloodRelated: true,
      relationship: `${getGenerationName(descendantResult.depth)}-descendant`,
      depth: descendantResult.depth
    };
  }
  
  // Check for sibling relationships (same parents)
  const p1Parents = childToParents.get(p1Id) || new Set();
  const p2Parents = childToParents.get(p2Id) || new Set();
  
  if (p1Parents.size > 0 && p2Parents.size > 0) {
    const sharedParents = [...p1Parents].filter(parent => p2Parents.has(parent));
    if (sharedParents.length > 0) {
      return {
        isBloodRelated: true,
        relationship: 'sibling',
        depth: 0
      };
    }
  }
  
  // Check for cousin relationships (shared ancestors)
  const cousinResult = findCousinRelationship(p1Id, p2Id, parentToChildren, childToParents);
  if (cousinResult.isCousin) {
    return {
      isBloodRelated: true,
      relationship: cousinResult.relationship,
      depth: cousinResult.depth
    };
  }
  
  // Use the existing relationship calculator for other blood relationships
  const calculatedRelation = calculateRelationshipToRoot(
    { id: person2Id }, 
    { id: person1Id }, 
    allPeople, 
    relationships
  );
  
  // Check if the calculated relationship indicates blood relation
  if (isBloodRelationshipString(calculatedRelation)) {
    return {
      isBloodRelated: true,
      relationship: calculatedRelation,
      depth: getRelationshipDepth(calculatedRelation)
    };
  }
  
  return { isBloodRelated: false, relationship: null, depth: 0 };
};

/**
 * Recursive function to check if person1 is an ancestor of person2
 * @param {string} ancestorId - Potential ancestor's ID
 * @param {string} descendantId - Potential descendant's ID
 * @param {Map} parentToChildren - Parent to children map
 * @param {number} depth - Current depth
 * @param {Set} visited - Visited nodes to prevent cycles
 * @returns {Object} - {isAncestor: boolean, depth: number}
 */
const isAncestorOf = (ancestorId, descendantId, parentToChildren, depth, visited = new Set()) => {
  if (visited.has(descendantId)) {
    return { isAncestor: false, depth: 0 }; // Prevent infinite loops
  }
  
  visited.add(descendantId);
  
  const children = parentToChildren.get(ancestorId) || new Set();
  
  // Direct child relationship
  if (children.has(descendantId)) {
    return { isAncestor: true, depth: depth + 1 };
  }
  
  // Check descendants of children (recursive)
  for (const child of children) {
    const result = isAncestorOf(child, descendantId, parentToChildren, depth + 1, new Set(visited));
    if (result.isAncestor) {
      return { isAncestor: true, depth: result.depth };
    }
  }
  
  return { isAncestor: false, depth: 0 };
};

/**
 * Find cousin relationships between two people
 * @param {string} person1Id - First person's ID
 * @param {string} person2Id - Second person's ID
 * @param {Map} parentToChildren - Parent to children map
 * @param {Map} childToParents - Child to parents map
 * @returns {Object} - {isCousin: boolean, relationship: string, depth: number}
 */
const findCousinRelationship = (person1Id, person2Id, parentToChildren, childToParents) => {
  // Find common ancestors and their generation distance
  const p1Ancestors = getAllAncestors(person1Id, childToParents);
  const p2Ancestors = getAllAncestors(person2Id, childToParents);
  
  for (const [ancestor1, depth1] of p1Ancestors) {
    for (const [ancestor2, depth2] of p2Ancestors) {
      if (ancestor1 === ancestor2 && depth1 > 1 && depth2 > 1) {
        // Found common ancestor at generation depth > 1 (not parent/grandparent)
        const minDepth = Math.min(depth1, depth2);
        const maxDepth = Math.max(depth1, depth2);
        
        if (minDepth === maxDepth) {
          if (minDepth === 2) return { isCousin: true, relationship: '1st cousin', depth: 2 };
          if (minDepth === 3) return { isCousin: true, relationship: '2nd cousin', depth: 3 };
          return { isCousin: true, relationship: `${minDepth - 1}th cousin`, depth: minDepth };
        } else {
          const removedCount = maxDepth - minDepth;
          return { 
            isCousin: true, 
            relationship: `${minDepth - 1}th cousin ${removedCount} time${removedCount > 1 ? 's' : ''} removed`, 
            depth: minDepth 
          };
        }
      }
    }
  }
  
  return { isCousin: false, relationship: null, depth: 0 };
};

/**
 * Get all ancestors of a person with their depths
 * @param {string} personId - Person's ID
 * @param {Map} childToParents - Child to parents map
 * @param {number} depth - Current depth
 * @param {Set} visited - Visited nodes to prevent cycles
 * @returns {Map} - Map of ancestor ID to depth
 */
const getAllAncestors = (personId, childToParents, depth = 1, visited = new Set()) => {
  if (visited.has(personId)) {
    return new Map(); // Prevent infinite loops
  }
  
  visited.add(personId);
  const ancestors = new Map();
  const parents = childToParents.get(personId) || new Set();
  
  for (const parent of parents) {
    ancestors.set(parent, depth);
    
    // Recursively get ancestors of this parent
    const parentAncestors = getAllAncestors(parent, childToParents, depth + 1, new Set(visited));
    for (const [ancestor, ancestorDepth] of parentAncestors) {
      if (!ancestors.has(ancestor) || ancestors.get(ancestor) > ancestorDepth) {
        ancestors.set(ancestor, ancestorDepth);
      }
    }
  }
  
  return ancestors;
};

/**
 * Get generation name for a given depth
 * @param {number} depth - Generation depth
 * @returns {string} - Generation name
 */
const getGenerationName = (depth) => {
  switch (depth) {
    case 1: return 'parent/child';
    case 2: return 'grandparent/grandchild';
    case 3: return 'great-grandparent/great-grandchild';
    case 4: return 'great-great-grandparent/great-great-grandchild';
    default: return depth > 4 ? `${depth - 2}x-great-grandparent/grandchild` : 'related';
  }
};

/**
 * Check if a relationship string indicates a blood relationship
 * @param {string} relationship - Relationship string
 * @returns {boolean} - True if blood relationship
 */
const isBloodRelationshipString = (relationship) => {
  if (!relationship || relationship === 'Unrelated') return false;
  
  const lowerRelation = relationship.toLowerCase();
  
  // EXCLUDE in-law relationships first - these are NOT blood relationships
  if (lowerRelation.includes('in-law') || 
      lowerRelation.includes('co-') || 
      lowerRelation.includes('step-') ||
      lowerRelation.includes('ex-') ||
      lowerRelation.includes('late ')) {
    return false;
  }
  
  // Now check for actual blood relationship keywords
  const bloodKeywords = [
    'parent', 'child', 'father', 'mother', 'son', 'daughter',
    'brother', 'sister', 'sibling',
    'grandfather', 'grandmother', 'grandparent', 'grandson', 'granddaughter', 'grandchild',
    'great-grandfather', 'great-grandmother', 'great-grandparent', 'great-grandson', 'great-granddaughter', 'great-grandchild',
    'uncle', 'aunt', 'nephew', 'niece',
    'cousin'
  ];
  
  return bloodKeywords.some(keyword => lowerRelation.includes(keyword));
};

/**
 * Get relationship depth from relationship string
 * @param {string} relationship - Relationship string
 * @returns {number} - Relationship depth
 */
const getRelationshipDepth = (relationship) => {
  if (!relationship) return 0;
  
  const lowerRelation = relationship.toLowerCase();
  
  if (lowerRelation.includes('parent') || lowerRelation.includes('child')) return 1;
  if (lowerRelation.includes('sibling') || lowerRelation.includes('brother') || lowerRelation.includes('sister')) return 0;
  if (lowerRelation.includes('grandparent') || lowerRelation.includes('grandchild')) return 2;
  if (lowerRelation.includes('great-grandparent') || lowerRelation.includes('great-grandchild')) return 3;
  if (lowerRelation.includes('uncle') || lowerRelation.includes('aunt') || lowerRelation.includes('nephew') || lowerRelation.includes('niece')) return 2;
  if (lowerRelation.includes('1st cousin')) return 2;
  if (lowerRelation.includes('2nd cousin')) return 3;
  
  return 1;
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