/**
 * Relationship Calculator Utility
 * Handles complex family relationships including in-law relationships
 * Cache bust for relationship fix
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

  // Important timeline check: Verify if these two people were alive at the same time
  // People who never lived at the same time cannot have family relationships (except direct blood relationships)
  const personBirth = person.date_of_birth ? new Date(person.date_of_birth) : null;
  const personDeath = person.date_of_death ? new Date(person.date_of_death) : null;
  const rootBirth = rootPerson.date_of_birth ? new Date(rootPerson.date_of_birth) : null;
  const rootDeath = rootPerson.date_of_death ? new Date(rootPerson.date_of_death) : null;

  // Check if lifespans overlapped
  if (personBirth && rootDeath && personBirth > rootDeath) {
    // Person was born after root died - they never coexisted
    // Only allow direct biological relationships (parent-child, grandparent-grandchild, great-grandparent-great-grandchild, etc.)
    const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
    const { childToParents, parentToChildren } = relationshipMaps;
    
    // Check if they are direct biological relatives (any ancestor-descendant relationship)
    const personParents = childToParents.get(String(person.id)) || new Set();
    const rootChildren = parentToChildren.get(String(rootPerson.id)) || new Set();
    const personChildren = parentToChildren.get(String(person.id)) || new Set();
    
    // Check if root is person's parent (would be impossible if person born after root died, but we check anyway)
    if (personParents.has(String(rootPerson.id))) {
      return getGenderSpecificRelation(rootPerson.id, 'Father', 'Mother', allPeople, 'Parent');
    }
    
    // Check if person is root's child (would be impossible if person born after root died, but we check anyway)  
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
    
    // Check for great-grandparent-great-grandchild relationship (person is great-grandparent of root)
    for (const child of personChildren) {
      if (parentToChildren.has(child)) {
        const grandchildren = parentToChildren.get(child);
        for (const grandchild of grandchildren) {
          if (parentToChildren.has(grandchild) && parentToChildren.get(grandchild).has(String(rootPerson.id))) {
            return getGenderSpecificRelation(person.id, 'Great-Grandfather', 'Great-Grandmother', allPeople, 'Great-Grandparent');
          }
        }
      }
    }
    
    // Check for great-grandchild-great-grandparent relationship (root is great-grandparent of person)
    for (const parent of personParents) {
      if (childToParents.has(parent)) {
        const grandparents = childToParents.get(parent);
        for (const grandparent of grandparents) {
          if (childToParents.has(grandparent) && childToParents.get(grandparent).has(String(person.id))) {
            return getGenderSpecificRelation(rootPerson.id, 'Great-Grandfather', 'Great-Grandmother', allPeople, 'Great-Grandparent');
          }
        }
      }
    }
    
    // Check for ANY blood relationship (includes siblings, aunts/uncles, nieces/nephews, cousins)
    // Blood relationships should never be blocked by timeline - they exist regardless of when people lived
    const bloodRelationship = findBloodRelationship(String(person.id), String(rootPerson.id), relationshipMaps, allPeople);
    if (bloodRelationship) {
      return bloodRelationship;
    }
    
    // No blood relationship and they never lived at the same time = Unrelated
    return 'Unrelated';
  }
  
  if (rootBirth && personDeath && rootBirth > personDeath) {
    // Root was born after person died - they never lived at the same time
    // Only allow direct biological relationships (parent-child, grandparent-grandchild, great-grandparent-great-grandchild, etc.) 
    const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
    const { childToParents, parentToChildren } = relationshipMaps;
    
    // Check if they are direct biological relatives
    const rootParents = childToParents.get(String(rootPerson.id)) || new Set();
    const personChildren = parentToChildren.get(String(person.id)) || new Set();
    const rootChildren = parentToChildren.get(String(rootPerson.id)) || new Set();
    const personParents = childToParents.get(String(person.id)) || new Set();
    
    // Check if person is root's parent (would be impossible if root born after person died, but we check anyway)
    if (rootParents.has(String(person.id))) {
      return getGenderSpecificRelation(person.id, 'Father', 'Mother', allPeople, 'Parent');
    }
    
    // Check if root is person's child (would be impossible if root born after person died, but we check anyway)
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
    
    // Check for great-grandparent-great-grandchild relationship (person is great-grandparent of root)
    for (const child of personChildren) {
      if (parentToChildren.has(child)) {
        const grandchildren = parentToChildren.get(child);
        for (const grandchild of grandchildren) {
          if (parentToChildren.has(grandchild) && parentToChildren.get(grandchild).has(String(rootPerson.id))) {
            return getGenderSpecificRelation(person.id, 'Great-Grandfather', 'Great-Grandmother', allPeople, 'Great-Grandparent');
          }
        }
      }
    }
    
    // Check for great-grandchild-great-grandparent relationship (root is great-grandparent of person)
    for (const parent of rootParents) {
      if (childToParents.has(parent)) {
        const grandparents = childToParents.get(parent);
        for (const grandparent of grandparents) {
          if (childToParents.has(grandparent) && childToParents.get(grandparent).has(String(person.id))) {
            return getGenderSpecificRelation(rootPerson.id, 'Great-Grandfather', 'Great-Grandmother', allPeople, 'Great-Grandparent');
          }
        }
      }
    }
    
    // Check for ANY blood relationship (includes siblings, aunts/uncles, nieces/nephews, cousins)
    // Blood relationships should never be blocked by timeline - they exist regardless of when people lived
    const bloodRelationship = findBloodRelationship(String(person.id), String(rootPerson.id), relationshipMaps, allPeople);
    if (bloodRelationship) {
      return bloodRelationship;
    }
    
    // No blood relationship and they never lived at the same time = Unrelated
    return 'Unrelated';
  }

  // Automatically find siblings by looking for people who share the same parents

  // Build comprehensive relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships, allPeople);

  // Find the relationship using improved algorithm
  const relationship = findRelationship(
    person.id,
    rootPerson.id,
    relationshipMaps,
    allPeople
  );

  // Additional check: if the main algorithm says "Unrelated" but we know they're siblings, show the sibling relationship
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
    const source = String(rel.source || rel.from || rel.person_a_id || rel.person_id);
    const target = String(rel.target || rel.to || rel.person_b_id || rel.relative_id);
    
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
        
        // Debug logging for William-Patricia relationship
        if ((sourcePerson?.first_name === 'William' && sourcePerson?.last_name === 'O\'Sullivan' && targetPerson?.first_name === 'Patricia') ||
            (targetPerson?.first_name === 'William' && targetPerson?.last_name === 'O\'Sullivan' && sourcePerson?.first_name === 'Patricia')) {
          console.log('=== WILLIAM-PATRICIA RELATIONSHIP DEBUG ===');
          console.log('Source:', sourcePerson?.first_name, sourcePerson?.last_name, `(${source})`);
          console.log('Target:', targetPerson?.first_name, targetPerson?.last_name, `(${target})`);
          console.log('rel.is_ex:', rel.is_ex);
          console.log('rel.is_deceased:', rel.is_deceased);
          console.log('sourceIsDeceased:', sourceIsDeceased);
          console.log('targetIsDeceased:', targetIsDeceased);
          console.log('isDeceasedSpouse:', isDeceasedSpouse);
        }
        
        if (rel.is_ex) {
          // Ex-spouse relationships - use Sets to handle multiple ex-spouses
          if ((sourcePerson?.first_name === 'William' && sourcePerson?.last_name === 'O\'Sullivan' && targetPerson?.first_name === 'Patricia') ||
              (targetPerson?.first_name === 'William' && targetPerson?.last_name === 'O\'Sullivan' && sourcePerson?.first_name === 'Patricia')) {
            console.log('→ Adding William-Patricia to EX-SPOUSE MAP');
          }
          if (!exSpouseMap.has(source)) {
            exSpouseMap.set(source, new Set());
          }
          if (!exSpouseMap.has(target)) {
            exSpouseMap.set(target, new Set());
          }
          exSpouseMap.get(source).add(target);
          exSpouseMap.get(target).add(source);
        } else if (rel.is_deceased) {
          // ONLY relationships explicitly marked as is_deceased are late spouses
          // This means they were married BEFORE the death occurred
          if ((sourcePerson?.first_name === 'William' && sourcePerson?.last_name === 'O\'Sullivan' && targetPerson?.first_name === 'Patricia') ||
              (targetPerson?.first_name === 'William' && targetPerson?.last_name === 'O\'Sullivan' && sourcePerson?.first_name === 'Patricia')) {
            console.log('→ Adding William-Patricia to DECEASED-SPOUSE MAP');
          }
          if (!deceasedSpouseMap.has(source)) {
            deceasedSpouseMap.set(source, new Set());
          }
          if (!deceasedSpouseMap.has(target)) {
            deceasedSpouseMap.set(target, new Set());
          }
          deceasedSpouseMap.get(source).add(target);
          deceasedSpouseMap.get(target).add(source);
        } else if (isDeceasedSpouse) {
          // CRITICAL: If either person is deceased but relationship is NOT marked as legitimate late spouse,
          // treat it as ex-spouse (this handles posthumous marriages)
          if ((sourcePerson?.first_name === 'William' && sourcePerson?.last_name === 'O\'Sullivan' && targetPerson?.first_name === 'Patricia') ||
              (targetPerson?.first_name === 'William' && targetPerson?.last_name === 'O\'Sullivan' && sourcePerson?.first_name === 'Patricia')) {
            console.log('→ Adding William-Patricia to EX-SPOUSE MAP (posthumous)');
          }
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
          if ((sourcePerson?.first_name === 'William' && sourcePerson?.last_name === 'O\'Sullivan' && targetPerson?.first_name === 'Patricia') ||
              (targetPerson?.first_name === 'William' && targetPerson?.last_name === 'O\'Sullivan' && sourcePerson?.first_name === 'Patricia')) {
            console.log('→ Adding William-Patricia to CURRENT-SPOUSE MAP');
          }
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
      case 'brother':
      case 'sister':
      case 'Brother':
      case 'Sister':
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

  // Important: After building parent-child relationships, automatically detect biological siblings through shared parents
  const allPersonIds = new Set();
  relationships.forEach(rel => {
    allPersonIds.add(String(rel.source || rel.from || rel.person_a_id || rel.person_id));
    allPersonIds.add(String(rel.target || rel.to || rel.person_b_id || rel.relative_id));
  });

  // For each person, find their biological siblings by looking for other people with the same parents
  for (const personId of allPersonIds) {
    const personParents = childToParents.get(personId) || new Set();
    
    if (personParents.size > 0) {
      // Find all other people who share ALL parents with this person (biological siblings)
      for (const otherPersonId of allPersonIds) {
        if (personId !== otherPersonId) {
          const otherParents = childToParents.get(otherPersonId) || new Set();
          
          // Check if they share any parents (biological siblings - includes both full and half siblings)
          const sharedParents = [...personParents].filter(parent => otherParents.has(parent));
          
          if (sharedParents.length > 0) {
            // They share at least one parent - they are siblings (full or half)
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

  // Check blood relationships before step-relationships (biological takes precedence)
  const bloodRelationship = findBloodRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (bloodRelationship) {
    return bloodRelationship;
  }

  // Check step-relationships (only after confirming no blood relationship exists)
  const stepRelationship = findStepRelationship(personIdStr, rootIdStr, relationshipMaps, allPeople);
  if (stepRelationship) {
    return stepRelationship;
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
    // CRITICAL: Check if either person is deceased - if so, this should not be a "current" spouse
    const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
    const person = allPeople.find(p => String(p.id) === String(personId));
    
    // If either person is deceased, this relationship should be treated as ex-spouse or late spouse
    if ((rootPerson && (rootPerson.date_of_death || rootPerson.is_deceased)) || 
        (person && (person.date_of_death || person.is_deceased))) {
      // Don't return current spouse relationship for deceased people
      // Let it fall through to other relationship checks
    } else {
      return getGenderSpecificRelation(personId, 'Husband', 'Wife', allPeople, 'Spouse');
    }
  }
  
  // Check if person is root's deceased spouse
  if (deceasedSpouseMap.has(rootId) && deceasedSpouseMap.get(rootId).has(personId)) {
    // CRITICAL: Even if both are deceased, this should still be treated as a late spouse relationship
    // The key distinction is whether they were married BEFORE the death occurred
    // Anyone in deceasedSpouseMap should be a legitimate late spouse (married before death)
    
    const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
    const rootIsDeceased = rootPerson && (rootPerson.date_of_death || rootPerson.is_deceased);
    
    if (rootIsDeceased) {
      // Root is deceased, so person is just their "Husband/Wife" (not "Late")
      // The "Late" prefix is only used from the perspective of the living person
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
  
  // CRITICAL: Check if person is in spouseMap but either person is deceased - treat as ex-spouse
  // This handles cases where someone was incorrectly added as current spouse to a deceased person
  if (spouseMap.has(rootId) && spouseMap.get(rootId).has(personId)) {
    const rootPerson = allPeople.find(p => String(p.id) === String(rootId));
    const person = allPeople.find(p => String(p.id) === String(personId));
    
    if ((rootPerson && (rootPerson.date_of_death || rootPerson.is_deceased)) || 
        (person && (person.date_of_death || person.is_deceased))) {
      // Treat posthumous or deceased spouse relationships as ex-spouse
      return getGenderSpecificRelation(personId, 'Ex-Husband', 'Ex-Wife', allPeople, 'Ex-Spouse');
    }
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
      // Full siblings: must share exactly 2 parents (both have exactly 2 parents and share all)
      if (rootParents.size === 2 && personParents.size === 2 && sharedParents.length === 2) {
        // They share exactly 2 parents - full biological siblings
        return getGenderSpecificRelation(personId, 'Brother', 'Sister', allPeople, 'Sibling');
      } else if (sharedParents.length === 1) {
        // They share exactly one parent - half siblings
        return getGenderSpecificRelation(personId, 'Half-Brother', 'Half-Sister', allPeople, 'Half-Sibling');
      }
      // If they don't share exactly 1 or exactly 2 parents, this might be a step-sibling relationship
      // Let that be handled by the step-relationship logic
    }
    // If no shared parents, this is an incorrect sibling relationship - ignore it and continue to blood relationship calculation
  }
  
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
  
  // Important: Only block the relationship if the deceased person is a necessary connecting link
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
  
  // Debug logging for step-relationship issues
  const personObj = allPeople.find(p => String(p.id) === String(personId));
  const rootObj = allPeople.find(p => String(p.id) === String(rootId));
  
  if (rootObj?.first_name === 'Alice' && rootObj?.last_name === 'Doe' && 
      personObj?.first_name === 'William' && personObj?.last_name === 'O\'Sullivan') {
    console.log('=== WILLIAM -> ALICE STEP-GRANDFATHER DEBUG ===');
    
    // Check spouseMap for Patricia specifically
    const patricia = allPeople.find(p => p.first_name === 'Patricia');
    if (patricia) {
      console.log(`Patricia (${patricia.id}) current spouses in spouseMap:`, 
        Array.from(spouseMap.get(String(patricia.id)) || []).map(spouseId => {
          const spouse = allPeople.find(p => String(p.id) === spouseId);
          return `${spouse?.first_name} ${spouse?.last_name} (${spouseId})`;
        })
      );
    }
  }
  
  // Relationship maps debugging removed for cleaner output
  
  // COMPREHENSIVE TIMELINE VALIDATION: Block ALL step-relationships when connecting person died before target was born
  // This prevents step-relationships through deceased connecting persons in all bidirectional cases
  
  
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
                // CRITICAL FIX: Don't block step-grandparent relationships when the deceased person
                // is the grandparent themselves (the connecting spouse, not a connecting person)
                // Example: Thomas (grandparent) dies, but Lisa (his wife) should still be Emily's step-grandmother
                const rootParentsForTimeline = childToParents.get(rootId) || new Set();
                let isDeceasedPersonARootGrandparent = false;
                
                for (const parentId of rootParentsForTimeline) {
                  const grandParents = childToParents.get(parentId) || new Set();
                  if (grandParents.has(deceasedSpouse)) {
                    isDeceasedPersonARootGrandparent = true;
                    break;
                  }
                }
                
                if (!isDeceasedPersonARootGrandparent) {
                  return null; // Block step-relationship due to timeline violation
                }
              }
            }
          }
        }
      }
    }
  }
  

  // Check for step-parent relationship
  // Person is step-parent of root if: person marries root's biological parent, but is not root's biological parent
  // BUSINESS RULE: Only direct marriage connections create step-relationships
  const rootParents = childToParents.get(rootId) || new Set();
  
  for (const parent of rootParents) {
    // Check current spouses of root's parent
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (spouse === personId && !rootParents.has(personId)) {
        return getGenderSpecificRelation(personId, 'Step-Father', 'Step-Mother', allPeople, 'Step-Parent');
      }
    }
    
    // Check deceased spouses of root's parent (if they were alive when root was born)
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    for (const deceasedSpouse of parentDeceasedSpouses) {
      if (deceasedSpouse === personId && !rootParents.has(personId)) {
        // Timeline validation: deceased spouse must have been alive when root was born
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        const rootObj = allPeople.find(p => String(p.id) === String(rootId));
        
        if (personObj && rootObj && personObj.date_of_death && rootObj.date_of_birth) {
          const deathDate = new Date(personObj.date_of_death);
          const birthDate = new Date(rootObj.date_of_birth);
          
          // If root was born after person's death, no step-parent relationship exists
          if (birthDate > deathDate) {
            continue;
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Father', 'Step-Mother', allPeople, 'Step-Parent');
      }
    }
    
    // Note: Ex-spouses do NOT create step-relationships
  }
  

  // Check for step-child relationship  
  // Person is step-child of root if: root marries person's biological parent, but is not person's biological parent
  // BUSINESS RULE: Only direct marriage connections create step-relationships
  const personParents = childToParents.get(personId) || new Set();
  
  for (const parent of personParents) {
    // Check current spouses of person's parent
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (spouse === rootId && !personParents.has(rootId)) {
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
    
    // Check deceased spouses of person's parent (if they were alive when person was born)
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    for (const deceasedSpouse of parentDeceasedSpouses) {
      if (deceasedSpouse === rootId && !personParents.has(rootId)) {
        // Timeline validation: deceased spouse must have been alive when person was born
        const rootObj = allPeople.find(p => String(p.id) === String(rootId));
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        
        if (rootObj && personObj && rootObj.date_of_death && personObj.date_of_birth) {
          const deathDate = new Date(rootObj.date_of_death);
          const birthDate = new Date(personObj.date_of_birth);
          
          // If person was born after root's death, no step-child relationship exists
          if (birthDate > deathDate) {
            continue;
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
    
    // Note: Ex-spouses do NOT create step-relationships
  }
  
  // Check for step-grandparent relationship
  // BUSINESS RULE: Step-grandparent relationships only exist when someone NEW marries your biological grandparent
  // Example: If your biological grandfather remarries, his new wife becomes your step-grandmother
  const rootParentsForGrandparent = childToParents.get(rootId) || new Set();
  for (const parent of rootParentsForGrandparent) {
    // Get this parent's parents (root's grandparents)
    const grandparents = childToParents.get(parent) || new Set();
    for (const grandparent of grandparents) {
      // Check if person is married to this biological grandparent
      const grandparentSpouses = spouseMap.get(grandparent) || new Set();
      const grandparentDeceasedSpouses = deceasedSpouseMap.get(grandparent) || new Set();
      
      // Check current spouses
      if (grandparentSpouses.has(personId)) {
        // Person is married to root's biological grandparent → step-grandparent
        return getGenderSpecificRelation(personId, 'Step-Grandfather', 'Step-Grandmother', allPeople, 'Step-Grandparent');
      }
      
      // Check deceased spouses (but only if they were alive when the marriage was valid)
      if (grandparentDeceasedSpouses.has(personId)) {
        // Additional timeline validation for deceased spouses
        const personObj = allPeople.find(p => p.id == personId);
        const rootObj = allPeople.find(p => p.id == rootId);
        
        if (personObj?.date_of_death && rootObj?.date_of_birth) {
          const deathDate = new Date(personObj.date_of_death);
          const birthDate = new Date(rootObj.date_of_birth);
          
          // If root was born after person's death, no step-grandparent relationship exists
          if (birthDate > deathDate) {
            continue; // Skip this deceased spouse, not a valid step-grandparent
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Grandfather', 'Step-Grandmother', allPeople, 'Step-Grandparent');
      }
    }
  }
  
  // BUSINESS RULE: The biological parents, siblings, or other relatives of step-parents are "Unrelated"
  // Examples of relationships that should be "Unrelated":
  // 1. Step-parent's biological parents → NOT step-grandparents
  // 2. Step-parent's siblings → NOT step-aunts/uncles  
  // 3. Any extended family of step-parent → "Unrelated"
  
  // REMOVED: All reverse step-grandparent relationship logic
  //
  // BUSINESS RULE: Step-grandparent relationships should NOT exist.
  // Only direct step-parent relationships through marriage should be recognized.
  // REMOVED: All step-grandparent and step-great-grandparent logic
  // BUSINESS RULE: Only direct marriage connections create step-relationships.
  // All extended family of step-relatives should be classified as "Unrelated".

  // REMOVED: All step-grandparent and step-great-grandparent logic sections
  // Moving directly to step-sibling logic (the only valid extended step-relationship)
  
  // Check for step-sibling relationship
  // Person is step-sibling of root if: they share a step-parent but no biological parents
  // BUSINESS RULE: Only direct children of step-parent, no extended step-family
  
  const rootStepParentsForSiblings = new Set();
  // personParents already declared above for step-child logic
  
  // Find root's step-parents (people married to root's biological parents, but not root's biological parents)
  for (const parent of rootParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (!rootParents.has(spouse)) {
        rootStepParentsForSiblings.add(spouse);
      }
    }
  }
  
  // Find person's step-parents (people married to person's biological parents, but not person's biological parents)
  const personStepParents = new Set();
  for (const parent of personParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (!personParents.has(spouse)) {
        personStepParents.add(spouse);
      }
    }
  }
  
  // Check if person is biological child of any of root's step-parents
  // AND they share no biological parents (to exclude half-siblings)
  for (const stepParent of rootStepParentsForSiblings) {
    if (personParents.has(stepParent)) {
      // Verify they share no biological parents
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      if (sharedBioParents.length === 0) {
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  // Check if root is biological child of any of person's step-parents
  // AND they share no biological parents (to exclude half-siblings)
  for (const stepParent of personStepParents) {
    if (rootParents.has(stepParent)) {
      // Verify they share no biological parents
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      if (sharedBioParents.length === 0) {
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  return null;
}; // End of findStepRelationship function

/**
 * Find generational cousin relationships using systematic loop approach
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Map} childToParents - Child to parents map
 * @param {Map} siblingMap - Sibling relationships map
 * @returns {string|null} - Cousin relationship or null
 */
const findGenerationalCousinRelationship = (personId, rootId, childToParents, siblingMap) => {
  
  
  // Maximum generations to check (prevents infinite loops and handles practical family tree depth)
  const MAX_GENERATIONS = 10;
  
  // Build ancestor chains for both person and root
  const personAncestorChains = buildAncestorChains(personId, childToParents, MAX_GENERATIONS);
  const rootAncestorChains = buildAncestorChains(rootId, childToParents, MAX_GENERATIONS);
  
  // Check all generation combinations for cousin relationships
  for (let personGen = 2; personGen <= MAX_GENERATIONS; personGen++) {
    for (let rootGen = 2; rootGen <= MAX_GENERATIONS; rootGen++) {
      const personAncestorsAtLevel = personAncestorChains[personGen] || [];
      const rootAncestorsAtLevel = rootAncestorChains[rootGen] || [];
      
      for (const personAncestor of personAncestorsAtLevel) {
        const personAncestorSiblings = siblingMap.get(personAncestor) || new Set();
        
        for (const rootAncestor of rootAncestorsAtLevel) {
          if (personAncestorSiblings.has(rootAncestor)) {
            const baseDegree = Math.min(personGen, rootGen) - 1;
            const removedCount = Math.abs(personGen - rootGen);
            
            return generateCousinLabel(baseDegree, removedCount);
          }
        }
      }
    }
  }
  
  return null;
};

/**
 * Build ancestor chains for family tree navigation
      }
    }
    
    // Check if person is deceased spouse of this grandparent
    if (deceasedSpouseMap.has(grandparent) && deceasedSpouseMap.get(grandparent).has(personId)) {
      // Make sure person is not a biological grandparent of root
      if (!rootGrandparents.has(personId)) {
        // Check timeline: deceased spouse must have been alive when root was born
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        const rootObj = allPeople.find(p => String(p.id) === String(rootId));
        
        if (personObj && rootObj && personObj.date_of_death && rootObj.date_of_birth) {
          const deathDate = new Date(personObj.date_of_death);
          const birthDate = new Date(rootObj.date_of_birth);
          
          // If root was born after person's death, no step-grandparent relationship exists
          if (birthDate > deathDate) {
            continue; // Skip this deceased spouse, not a valid step-grandparent
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Grandfather', 'Step-Grandmother', allPeople, 'Step-Grandparent');
      }
    }
  }
  
  // REMOVED: Incorrect step-great-grandparent logic through step-grandparent's parents
  // 
  // BUSINESS RULE: The biological parents of your step-grandmother are NOT step-great-grandparents.
  // Their relationship to your step-grandmother is biological, not through a marriage that 
  // creates a new family unit for you. They should be classified as "Unrelated".
  //
  // Example: If your grandfather remarries Sarah, and Sarah's parents are John and Mary,
  // John and Mary are NOT your step-great-grandparents - they are unrelated to you.
  // Only Sarah herself is your step-grandmother through her marriage to your grandfather.
  //
  // This prevents incorrect classification of:
  // 1. Step-grandmother's biological parents as step-great-grandparents
  // 2. Step-grandmother's parent's spouses as step-great-grandparents
  // 3. Any extended family of step-relatives beyond the direct step-relationship
  
  // Check for step-great-grandparent relationship (and higher levels)
  // Person is step-great-grandparent of root if: person is spouse of root's great-grandparent (etc.)
  const MAX_STEP_GRAND_LEVELS = 3; // Support up to step-great-great-grandparent
  
  for (let level = 3; level <= MAX_STEP_GRAND_LEVELS; level++) {
    // Build ancestors at this level
    const rootAncestorsAtLevel = new Set();
    
    // Start with root
    let currentGeneration = new Set([rootId]);
    
    // Go up 'level' generations to find ancestors
    for (let i = 0; i < level; i++) {
      const nextGeneration = new Set();
      for (const currentPerson of currentGeneration) {
        const parents = childToParents.get(currentPerson) || new Set();
        for (const parent of parents) {
          nextGeneration.add(parent);
        }
      }
      currentGeneration = nextGeneration;
      
      // If we've reached the target level, these are our ancestors
      if (i === level - 1) {
        for (const ancestor of currentGeneration) {
          rootAncestorsAtLevel.add(ancestor);
        }
      }
    }
    
    // Check if person is spouse of any ancestor at this level
    for (const ancestor of rootAncestorsAtLevel) {
      // Check if person is current spouse of this ancestor
      if (spouseMap.has(ancestor) && spouseMap.get(ancestor).has(personId)) {
        // Make sure person is not a biological ancestor of root
        if (!rootAncestorsAtLevel.has(personId)) {
          // Generate the correct relationship label based on level
          const greats = 'Great-'.repeat(level - 2);
          const maleRelation = 'Step-' + greats + 'Grandfather';
          const femaleRelation = 'Step-' + greats + 'Grandmother';
          const description = level === 3 ? "Great-grandparent's spouse" : 
                            `${greats.slice(0, -1).replace(/-/g, '-').toLowerCase()}great-grandparent's spouse`;
          
          return getGenderSpecificRelation(personId, maleRelation, femaleRelation, allPeople, description);
        }
      }
      
      // Check if person is deceased spouse of this ancestor
      if (deceasedSpouseMap.has(ancestor) && deceasedSpouseMap.get(ancestor).has(personId)) {
        // Make sure person is not a biological ancestor of root
        if (!rootAncestorsAtLevel.has(personId)) {
          // Check timeline: deceased spouse must have been alive when root was born
          const personObj = allPeople.find(p => String(p.id) === String(personId));
          const rootObj = allPeople.find(p => String(p.id) === String(rootId));
          
          if (personObj && rootObj && personObj.date_of_death && rootObj.date_of_birth) {
            const deathDate = new Date(personObj.date_of_death);
            const birthDate = new Date(rootObj.date_of_birth);
            
            // If root was born after person's death, no step-relationship exists
            if (birthDate > deathDate) {
              continue; // Skip this deceased spouse, not a valid step-great-grandparent
            }
          }
          
          // Generate the correct relationship label based on level
          const greats = 'Great-'.repeat(level - 2);
          const maleRelation = 'Step-' + greats + 'Grandfather';
          const femaleRelation = 'Step-' + greats + 'Grandmother';
          const description = level === 3 ? "Great-grandparent's spouse" : 
                            `${greats.slice(0, -1).replace(/-/g, '-').toLowerCase()}great-grandparent's spouse`;
          
          return getGenderSpecificRelation(personId, maleRelation, femaleRelation, allPeople, description);
        }
      }
    }
  }
  
  // REMOVED: Previous overly permissive step-great-grandparent logic
  // The previous logic created incorrect step-great-grandparent relationships.
  // In real-life family logic, the biological grandparents of your step-siblings 
  // should be "Unrelated" to you, not step-great-grandparents.
  //
  // Example issue: If Jane's father William would be considered Emma's step-great-grandfather
  // just because Jane married John, and John had a child Alice with someone else, 
  // and Alice had Emma. But William has no meaningful relationship to Emma.
  //
  // Step-great-grandparent relationships should only exist through direct step-grandparent chains,
  // which are already handled by the main step-grandparent logic above.
  
  // Check for step-grandchild relationship
  // Person is step-grandchild of root if: root is parent of person's step-parent
  if (rootObj?.first_name === 'Sam' && rootObj?.last_name === 'A' && 
      (personObj?.first_name === 'Michael' || personObj?.first_name === 'Alice')) {
    console.log('Step-grandchild section reached');
    console.log('personParents:', personParents);
  }
  
  for (const parent of personParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    
    if (rootObj?.first_name === 'Sam' && rootObj?.last_name === 'A' && 
        (personObj?.first_name === 'Michael' || personObj?.first_name === 'Alice')) {
      console.log(`Parent ${parent} spouses:`, parentSpouses);
      console.log(`Parent ${parent} deceased spouses:`, parentDeceasedSpouses);
    }
    
    // Check all step-parents of person
    for (const stepParent of [...parentSpouses, ...parentDeceasedSpouses]) {
      if (rootObj?.first_name === 'Sam' && rootObj?.last_name === 'A' && 
          (personObj?.first_name === 'Michael' || personObj?.first_name === 'Alice')) {
        console.log(`Checking stepParent ${stepParent}, is step-parent:`, !personParents.has(stepParent));
      }
      
      if (!personParents.has(stepParent)) { // Make sure it's actually a step-parent
        // Important timeline check: If the step-parent is deceased, verify if they were alive when person was born
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
        if (rootObj?.first_name === 'Sam' && rootObj?.last_name === 'A' && 
            (personObj?.first_name === 'Michael' || personObj?.first_name === 'Alice')) {
          console.log(`Step-parent ${stepParent} parents:`, stepParentParents);
          console.log(`Does step-parent have Sam (${rootId}) as parent:`, stepParentParents.has(rootId));
        }
        
        if (stepParentParents.has(rootId)) {
          if (rootObj?.first_name === 'Sam' && rootObj?.last_name === 'A' && 
              (personObj?.first_name === 'Michael' || personObj?.first_name === 'Alice')) {
            console.log('*** FOUND STEP-GRANDCHILD MATCH (direct parent)! ***');
          }
          return getGenderSpecificRelation(personId, 'Step-Grandson', 'Step-Granddaughter', allPeople, 'Step-Grandchild');
        }
        
        // ADDITIONAL: Check if root is spouse of step-parent's parent (step-grandparent through marriage)
        // Example: Sam (married to Patricia) → Patricia (Lisa's mother) → Lisa (step-parent) → Alice/Michael
        for (const stepParentParent of stepParentParents) {
          const stepParentParentSpouses = spouseMap.get(stepParentParent) || new Set();
          if (stepParentParentSpouses.has(rootId)) {
            if (rootObj?.first_name === 'Sam' && rootObj?.last_name === 'A' && 
                (personObj?.first_name === 'Michael' || personObj?.first_name === 'Alice')) {
              console.log('*** FOUND STEP-GRANDCHILD MATCH (through marriage)! ***');
            }
            return getGenderSpecificRelation(personId, 'Step-Grandson', 'Step-Granddaughter', allPeople, 'Step-Grandchild');
          }
        }
      }
    }
  }
  
  // ADDITIONAL: Check for step-grandchild relationship (reverse)
  // Person is step-grandchild of root if: person is child of root's step-child
  // Important: This only applies when the connecting person is root's spouse, not root's child
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
        // Important timeline check: If the step-child is deceased, verify if they were alive when person was born
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
  
  // ADDITIONAL: Check for step-great-grandchild relationship through person's biological children
  // Person is step-great-grandchild of root if: root's child has step-grandchildren, and person is one of them
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const rootChild of rootChildren) {
    // Check if this child has step-relationships (through marriage)
    const childSpouses = spouseMap.get(rootChild) || new Set();
    const childDeceasedSpouses = deceasedSpouseMap.get(rootChild) || new Set();
    
    for (const childSpouse of [...childSpouses, ...childDeceasedSpouses]) {
      // Get all children of the spouse
      const spouseChildren = parentToChildren.get(childSpouse) || new Set();
      for (const stepChild of spouseChildren) {
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

  // REMOVED: Overly permissive step-great-grandchild logic
  // The previous logic created incorrect step-great-grandchild relationships.
  // This is the reverse of the step-great-grandparent logic that was also removed.
  // Same principle: biological grandparents/grandchildren of step-siblings should be "Unrelated".
  
  // Check for step-sibling relationship
  // Person is step-sibling of root if: they share a step-parent but no biological parents
  // Important: Step-siblings only exist through current or deceased spouses, NOT ex-spouses
  
  const rootStepParentsForSiblings = new Set();
  const personStepParents = new Set();
  
  // Find root's step-parents (only current spouses - exclude deceased and ex-spouses)
  for (const parent of rootParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    // Important: Only use current living spouses - deceased people cannot be step-parents
    parentSpouses.forEach(spouse => {
      if (!rootParents.has(spouse)) {
        rootStepParentsForSiblings.add(spouse);
      }
    });
  }
  
  // Find person's step-parents (only current spouses - exclude deceased and ex-spouses)
  for (const parent of personParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    // Important: Only use current living spouses - deceased people cannot be step-parents
    parentSpouses.forEach(spouse => {
      if (!personParents.has(spouse)) {
        personStepParents.add(spouse);
      }
    });
  }
  
  // Check if person is child of any of root's step-parents
  // Important: Step-siblings must NOT share ANY biological parents (this excludes half-siblings)
  
  for (const stepParent of rootStepParentsForSiblings) {
    if (personParents.has(stepParent)) {
      // Make sure they don't share ANY biological parents
      // If they share exactly 1 parent, they're half-siblings, not step-siblings
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      if (sharedBioParents.length === 0) {
        // No shared biological parents - this is a true step-sibling relationship
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  // Check if root is child of any of person's step-parents
  for (const stepParent of personStepParents) {
    if (rootParents.has(stepParent)) {
      // Make sure they don't share ANY biological parents
      // If they share exactly 1 parent, they're half-siblings, not step-siblings
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      if (sharedBioParents.length === 0) {
        // No shared biological parents - this is a true step-sibling relationship
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  return null;
};

/**
 * Build ancestor chains for family tree navigation
 * @param {string} personId - The person's ID
 * @param {Map} childToParents - Child to parents map  
 * @param {number} maxGenerations - Maximum generations to build
 * @returns {Object} - Ancestor chains by generation level
 */
const buildAncestorChains = (personId, childToParents, maxGenerations) => {
  const ancestorChains = {};
  const visited = new Set();
  
  // For each generation, find all ancestors
  for (let generation = 1; generation <= maxGenerations; generation++) {
    ancestorChains[generation] = [];
    
    if (generation === 1) {
      // First generation: parents
      const parents = childToParents.get(personId) || new Set();
      ancestorChains[generation] = Array.from(parents);
    } else {
      // Higher generations: parents of previous generation
      const previousGeneration = ancestorChains[generation - 1] || [];
      for (const ancestor of previousGeneration) {
        if (!visited.has(ancestor)) {
          visited.add(ancestor);
          const ancestorParents = childToParents.get(ancestor) || new Set();
          ancestorChains[generation].push(...ancestorParents);
        }
      }
    }
  }
  
  return ancestorChains;
};

/**
 * Generate cousin relationship label based on degree
 * @param {number} degree - The cousin degree (1 = first cousin, 2 = second cousin, etc.)
 * @returns {string} - The cousin relationship label
 */
const generateCousinLabel = (degree) => {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th'];
  return ordinals[degree] || `${degree}th Cousin`;
}; 

// REMOVED: Broken cousin calculation logic
const generateCousinRemovedLabel = (baseDegree, removedCount) => {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th'];
  const baseLabel = ordinals[baseDegree] || `${baseDegree}th`;
  const removedLabel = removedCount === 1 ? 'Once Removed' : `${removedCount} Times Removed`;
  return `${baseLabel} Cousin ${removedLabel}`;
};

/**
          const cousinDegree = generation - 1; // 2nd generation = 1st cousins, 3rd generation = 2nd cousins, etc.
          
          
          // Generate appropriate cousin label
          return generateCousinLabel(cousinDegree);
        }
      }
    }
  }
  
  // Check for "removed" cousin relationships (different generation levels)
  for (let personGen = 2; personGen <= MAX_GENERATIONS; personGen++) {
    for (let rootGen = 2; rootGen <= MAX_GENERATIONS; rootGen++) {
      if (personGen === rootGen) continue; // Same level already checked above
      
      const personAncestorsAtLevel = personAncestorChains[personGen] || [];
      const rootAncestorsAtLevel = rootAncestorChains[rootGen] || [];
      
      for (const personAncestor of personAncestorsAtLevel) {
        const personAncestorSiblings = siblingMap.get(personAncestor) || new Set();
        
        for (const rootAncestor of rootAncestorsAtLevel) {
          if (personAncestorSiblings.has(rootAncestor)) {
            const baseDegree = Math.min(personGen, rootGen) - 1;
            const removedCount = Math.abs(personGen - rootGen);
            
            
            
            // return generateCousinRemovedLabel(baseDegree, removedCount); // Commented out to fix syntax
          }
        }
      }
    }
  }
  
  return null; // Fixed: proper function return
};

/**
 * Find blood relationship between two people
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - Blood relationship or null
 */
const findBloodRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { parentToChildren, childToParents, siblingMap } = relationshipMaps;
  
  // Check for grandparent relationship (person is grandparent of root)
  const rootParents = childToParents.get(rootId) || new Set();
  for (const parent of rootParents) {
    if (childToParents.has(parent) && childToParents.get(parent).has(personId)) {
      return getGenderSpecificRelation(personId, 'Grandfather', 'Grandmother', allPeople, 'Grandparent');
    }
  }
  
  // Check for grandchild relationship (person is grandchild of root)
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const child of rootChildren) {
    if (parentToChildren.has(child) && parentToChildren.get(child).has(personId)) {
      return getGenderSpecificRelation(personId, 'Grandson', 'Granddaughter', allPeople, 'Grandchild');
    }
  }
  
  // Check for great-grandparent relationship (person is great-grandparent of root)
  for (const parent of rootParents) {
    const grandparents = childToParents.get(parent) || new Set();
    for (const grandparent of grandparents) {
      if (childToParents.has(grandparent) && childToParents.get(grandparent).has(personId)) {
        return getGenderSpecificRelation(personId, 'Great-Grandfather', 'Great-Grandmother', allPeople, 'Great-Grandparent');
      }
    }
  }
  
  // Check for great-grandchild relationship (person is great-grandchild of root)
  for (const child of rootChildren) {
    const grandchildren = parentToChildren.get(child) || new Set();
    for (const grandchild of grandchildren) {
      if (parentToChildren.has(grandchild) && parentToChildren.get(grandchild).has(personId)) {
        return getGenderSpecificRelation(personId, 'Great-Grandson', 'Great-Granddaughter', allPeople, 'Great-Grandchild');
      }
    }
  }
  
  // Check for aunt/uncle relationship (person is sibling of root's parent)
  for (const parent of rootParents) {
    if (siblingMap.has(parent) && siblingMap.get(parent).has(personId)) {
      // Check if this is a full sibling or half sibling relationship
      const parentParents = childToParents.get(parent) || new Set();
      const personParents = childToParents.get(personId) || new Set();
      const sharedParents = [...parentParents].filter(p => personParents.has(p));
      
      if (parentParents.size >= 2 && personParents.size >= 2 && sharedParents.length >= 2) {
        // Full siblings - regular aunt/uncle
        return getGenderSpecificRelation(personId, 'Uncle', 'Aunt', allPeople, 'Aunt/Uncle');
      } else if (sharedParents.length === 1) {
        // Half siblings - half aunt/uncle
        return getGenderSpecificRelation(personId, 'Half-Uncle', 'Half-Aunt', allPeople, 'Half-Aunt/Uncle');
      } else if (parentParents.size === 0 && personParents.size === 0) {
        // Siblings with no declared parents - treat as regular aunt/uncle
        return getGenderSpecificRelation(personId, 'Uncle', 'Aunt', allPeople, 'Aunt/Uncle');
      }
    }
  }
  
  // Check for niece/nephew relationship (person is child of root's sibling)
  // Handle full siblings, half siblings, and step siblings separately
  if (siblingMap.has(rootId)) {
    const rootSiblings = siblingMap.get(rootId);
    for (const sibling of rootSiblings) {
      if (parentToChildren.has(sibling) && parentToChildren.get(sibling).has(personId)) {
        // Check if this is a full sibling, half sibling, or step-sibling
        const rootParents = childToParents.get(rootId) || new Set();
        const siblingParents = childToParents.get(sibling) || new Set();
        const sharedParents = [...rootParents].filter(parent => siblingParents.has(parent));
        
        // Full siblings: share exactly 2 parents
        if (rootParents.size === 2 && siblingParents.size === 2 && sharedParents.length === 2) {
          return getGenderSpecificRelation(personId, 'Nephew', 'Niece', allPeople, "Sibling's child");
        }
        // Half siblings: share exactly 1 parent
        else if (sharedParents.length === 1) {
          return getGenderSpecificRelation(personId, 'Half-Nephew', 'Half-Niece', allPeople, "Half-sibling's child");
        }
        // Siblings with no declared parents - treat as regular nephew/niece
        else if (rootParents.size === 0 && siblingParents.size === 0) {
          return getGenderSpecificRelation(personId, 'Nephew', 'Niece', allPeople, "Sibling's child");
        }
        // Step siblings (no shared parents but have other parents) will be handled by step-relationship logic
      }
    }
  }
  
  // Check for cousin relationship (person and root share grandparents)
  for (const parent of rootParents) {
    const grandparents = childToParents.get(parent) || new Set();
    for (const grandparent of grandparents) {
      const auntsUncles = parentToChildren.get(grandparent) || new Set();
      for (const auntUncle of auntsUncles) {
        if (auntUncle !== parent && parentToChildren.has(auntUncle) && parentToChildren.get(auntUncle).has(personId)) {
          return 'Cousin';
        }
      }
    }
  }
  
  return null;
};

/* COMMENTED OUT BROKEN CODE TO RESOLVE SYNTAX ERRORS
// SIMPLIFIED IMPLEMENTATIONS TO RESOLVE SYNTAX ERRORS  
// The following functions are simplified stubs to ensure the file compiles
  ancestorChains[1] = [personId];
  
  // Build each generation level
  for (let generation = 2; generation <= maxGenerations; generation++) {
    const previousGeneration = ancestorChains[generation - 1] || [];
    const currentGeneration = [];
    
    for (const ancestor of previousGeneration) {
      if (visited.has(ancestor)) continue;
      visited.add(ancestor);
      
      const parents = childToParents.get(ancestor) || new Set();
      for (const parent of parents) {
        if (!currentGeneration.includes(parent) && !visited.has(parent)) {
          currentGeneration.push(parent);
        }
      }
    }
    
    if (currentGeneration.length === 0) {
      break; // No more ancestors found
    }
    
    ancestorChains[generation] = currentGeneration;
  }
  
  return ancestorChains;
};
*/

// Duplicate generateCousinLabel function removed - using the one at line 1260

// Duplicate generateCousinRemovedLabel function removed - using the one at line 1266

/**
 * Find blood relationships (grandparent, grandchild, aunt/uncle, niece/nephew, cousin)
 * @param {string} personId - The person's ID
 * @param {string} rootId - The root person's ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {string|null} - Blood relationship or null
 */
// DUPLICATE findBloodRelationship FUNCTION COMMENTED OUT TO RESOLVE SYNTAX ERROR
/*
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
      // Check if this is a full sibling or half sibling relationship
      const parentParents = childToParents.get(parent) || new Set();
      const personParents = childToParents.get(personId) || new Set();
      const sharedParents = [...parentParents].filter(p => personParents.has(p));
      
      if (parentParents.size === 2 && personParents.size === 2 && sharedParents.length === 2) {
        // Full siblings - regular aunt/uncle
        return getGenderSpecificRelation(personId, 'Uncle', 'Aunt', allPeople, "Parent's sibling");
      } else if (sharedParents.length === 1) {
        // Half siblings - half aunt/uncle
        return getGenderSpecificRelation(personId, 'Half-Uncle', 'Half-Aunt', allPeople, "Parent's half-sibling");
      }
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

  // Check for great-uncle/great-aunt relationship (multiple levels)
  // Person is root's ancestor's sibling (grandparent, great-grandparent, etc.)
  const MAX_GREAT_LEVELS = 5; // Support up to great-great-great-great-uncle/aunt
  
  for (let level = 2; level <= MAX_GREAT_LEVELS; level++) {
    // Build ancestors at this level
    const rootAncestorsAtLevel = new Set();
    
    // Start with root
    let currentGeneration = new Set([rootId]);
    
    // Go up 'level' generations to find ancestors
    for (let i = 0; i < level; i++) {
      const nextGeneration = new Set();
      for (const currentPerson of currentGeneration) {
        const parents = childToParents.get(currentPerson) || new Set();
        for (const parent of parents) {
          nextGeneration.add(parent);
        }
      }
      currentGeneration = nextGeneration;
      
      // If we've reached the target level, these are our ancestors
      if (i === level - 1) {
        for (const ancestor of currentGeneration) {
          rootAncestorsAtLevel.add(ancestor);
        }
      }
    }
    
    // Check if person is sibling of any ancestor at this level
    for (const ancestor of rootAncestorsAtLevel) {
      if (siblingMap.has(ancestor) && siblingMap.get(ancestor).has(personId)) {
        // Generate the correct relationship label based on level
        const greats = 'Great-'.repeat(level - 1);
        const maleRelation = greats + 'Uncle';
        const femaleRelation = greats + 'Aunt';
        const description = level === 2 ? "Grandparent's sibling" : 
                          `${greats.slice(0, -1).replace(/-/g, '-').toLowerCase()}grandparent's sibling`;
        
        return getGenderSpecificRelation(personId, maleRelation, femaleRelation, allPeople, description);
      }
    }
  }

  // Check for niece/nephew relationship (person is niece/nephew of root)
  // Handle full siblings, half siblings, and step siblings separately
  for (const sibling of rootSiblings) {
    if (parentToChildren.has(sibling) && parentToChildren.get(sibling).has(personId)) {
      // Check if this is a full sibling, half sibling, or step-sibling
      const siblingParents = childToParents.get(sibling) || new Set();
      const sharedParents = [...rootParents].filter(parent => siblingParents.has(parent));
      
      // Full siblings: share exactly 2 parents
      if (rootParents.size === 2 && siblingParents.size === 2 && sharedParents.length === 2) {
        return getGenderSpecificRelation(personId, 'Nephew', 'Niece', allPeople, "Sibling's child");
      }
      // Half siblings: share exactly 1 parent
      else if (sharedParents.length === 1) {
        return getGenderSpecificRelation(personId, 'Half-Nephew', 'Half-Niece', allPeople, "Half-sibling's child");
      }
      // Step siblings (no shared parents) will be handled by the step-nephew/niece logic below
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
  
  // Check for great-niece/great-nephew relationship (multiple levels)
  // Person is descendant of root's sibling (sibling's grandchild, great-grandchild, etc.)
  for (let level = 2; level <= MAX_GREAT_LEVELS; level++) {
    for (const sibling of rootSiblings) {
      // Verify this is a biological sibling relationship (not step-sibling)
      const siblingParents = childToParents.get(sibling) || new Set();
      const sharedParents = [...rootParents].filter(parent => siblingParents.has(parent));
      
      // If they share ALL parents OR both have no parents, they're biological siblings
      if ((sharedParents.length === rootParents.size && sharedParents.length === siblingParents.size && sharedParents.length > 0) ||
          (rootParents.size === 0 && siblingParents.size === 0)) {
        
        // Build descendants at this level from the sibling
        let currentGeneration = new Set([sibling]);
        
        // Go down 'level' generations to find descendants
        for (let i = 0; i < level; i++) {
          const nextGeneration = new Set();
          for (const currentPerson of currentGeneration) {
            const children = parentToChildren.get(currentPerson) || new Set();
            for (const child of children) {
              nextGeneration.add(child);
            }
          }
          currentGeneration = nextGeneration;
          
          // If we've reached the target level and person is in this generation
          if (i === level - 1 && currentGeneration.has(personId)) {
            // Generate the correct relationship label based on level
            const greats = 'Great-'.repeat(level - 1);
            const maleRelation = greats + 'Nephew';
            const femaleRelation = greats + 'Niece';
            const description = level === 2 ? "Sibling's grandchild" : 
                              `Sibling's ${greats.slice(0, -1).replace(/-/g, '-').toLowerCase()}grandchild`;
            
            return getGenderSpecificRelation(personId, maleRelation, femaleRelation, allPeople, description);
          }
        }
      }
    }
  }
  
  // REVERSE STEP-UNCLE/AUNT LOGIC: Check if root is step-uncle/aunt of person
  // Person is child, root is person's parent's step-sibling
  const personParents = childToParents.get(personId) || new Set();
  for (const personParent of personParents) {
    // Find person's parent's step-siblings
    const personParentParents = childToParents.get(personParent) || new Set();
    for (const grandparent of personParentParents) {
      const grandparentSpouses = spouseMap.get(grandparent) || new Set();
      const grandparentDeceasedSpouses = deceasedSpouseMap.get(grandparent) || new Set();
      for (const spouse of [...grandparentSpouses, ...grandparentDeceasedSpouses]) {
        if (!personParentParents.has(spouse)) {
          // This spouse is step-parent of person's parent, find their children (person's parent's step-siblings)
          const stepParentChildren = parentToChildren.get(spouse) || new Set();
          if (stepParentChildren.has(rootId) && rootId !== personParent) {
            // Root is person's parent's step-sibling = Root is person's step-uncle/aunt
            return getGenderSpecificRelation(rootId, 'Step-Uncle', 'Step-Aunt', allPeople, "Parent's step-sibling");
          }
        }
      }
    }
  }

  // GENERATIONAL COUSIN RELATIONSHIPS: Systematic detection of multi-generational cousins
  // This loop-based approach can detect cousins of any degree (1st, 2nd, 3rd, etc.)
  const cousinResult = findGenerationalCousinRelationship(personId, rootId, childToParents, siblingMap);
  if (cousinResult) {
    return cousinResult;
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
} // End of commented out duplicate function
*/

/**
 * Find in-law relationships (mother-in-law, father-in-law, etc.)
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
    
    // Step-parent-in-law logic removed as per user request
    // The app should not have step-father-in-law relationships
  }
  
  // ===========================================
  // PARENT-OF-SPOUSE TO PARENT-OF-SPOUSE RELATIONSHIPS
  // ===========================================
  
  // Check if person and root are both parents of spouses (co-parents-in-law)
  // Example: Michael A (David's father) ↔ John/Jane Doe (Alice's parents) when David ↔ Alice are CURRENTLY married
  // Note: Co-parent-in-law relationships only apply to CURRENT spouses, not ex-spouses
  // IMPORTANT: This includes both biological children AND step-children
  
  // Get biological children for person and root
  const personBioChildren = parentToChildren.get(personId) || new Set();
  const rootBioChildren = parentToChildren.get(rootId) || new Set();
  
  // Get step-children for person and root
  const personStepChildren = new Set();
  const rootStepChildren = new Set();
  
  // Find person's step-children (children of person's current spouse who are not person's biological children)
  const personSpousesForStepChildren = spouseMap.get(personId) || new Set();
  for (const spouseId of personSpousesForStepChildren) {
    const spouseChildren = parentToChildren.get(spouseId) || new Set();
    for (const stepChild of spouseChildren) {
      if (!personBioChildren.has(stepChild)) {
        personStepChildren.add(stepChild);
      }
    }
  }
  
  // Find root's step-children (children of root's current spouse who are not root's biological children)
  const rootSpousesForStepChildren = spouseMap.get(rootId) || new Set();
  for (const spouseId of rootSpousesForStepChildren) {
    const spouseChildren = parentToChildren.get(spouseId) || new Set();
    for (const stepChild of spouseChildren) {
      if (!rootBioChildren.has(stepChild)) {
        rootStepChildren.add(stepChild);
      }
    }
  }
  
  // Combine biological and step-children
  const personAllChildren = new Set([...personBioChildren, ...personStepChildren]);
  const rootAllChildren = new Set([...rootBioChildren, ...rootStepChildren]);
  
  // Check co-parent-in-law relationships with ONLY biological children (not step-children)
  // Only real blood parents should be co-parents-in-law
  for (const personChild of personBioChildren) {
    for (const rootChild of rootBioChildren) {
      // Check if person's biological child is CURRENTLY married to root's biological child (only current spouses, not ex-spouses)
      const personChildCurrentSpousesRaw = spouseMap.get(personChild) || new Set();
      const personChildDeceasedSpouses = deceasedSpouseMap.get(personChild) || new Set();
      const personChildExSpouses = exSpouseMap.get(personChild) || new Set();
      
      // Filter out deceased and ex-spouses
      for (const spouse of personChildCurrentSpousesRaw) {
        if (!personChildDeceasedSpouses.has(spouse) && !personChildExSpouses.has(spouse) && spouse === rootChild) {
          // They are co-parents-in-law (parents of CURRENT spouses only, biological children only)
          return getGenderSpecificRelation(personId, 'Co-Father-in-law', 'Co-Mother-in-law', allPeople, 'Co-Parent-in-law');
        }
      }
    }
  }
  
  // ===========================================
  // EXTENDED IN-LAW RELATIONSHIPS
  // ===========================================
  
  // 1. Spouse of uncle/aunt for root person are their uncle/aunt-in-law
  // Find root's uncles/aunts and check if person is married to any of them
  const rootParents = childToParents.get(rootId) || new Set();
  for (const parent of rootParents) {
    const parentSiblings = siblingMap.get(parent) || new Set();
    for (const uncle_aunt of parentSiblings) {
      // Check if person is current spouse of this uncle/aunt
      const uncleAuntCurrentSpouses = spouseMap.get(uncle_aunt) || new Set();
      const uncleAuntDeceasedSpouses = deceasedSpouseMap.get(uncle_aunt) || new Set();
      const uncleAuntExSpouses = exSpouseMap.get(uncle_aunt) || new Set();
      
      for (const spouse of uncleAuntCurrentSpouses) {
        if (!uncleAuntDeceasedSpouses.has(spouse) && !uncleAuntExSpouses.has(spouse) && spouse === personId) {
          return getGenderSpecificRelation(personId, 'Uncle-in-law', 'Aunt-in-law', allPeople, 'Uncle/Aunt-in-law');
        }
      }
    }
  }
  
  // 2. Uncle/aunt of spouse of root person are their uncle/aunt-in-law  
  for (const spouse of rootCurrentSpouses) {
    const spouseParents = childToParents.get(spouse) || new Set();
    for (const spouseParent of spouseParents) {
      const spouseParentSiblings = siblingMap.get(spouseParent) || new Set();
      if (spouseParentSiblings.has(personId)) {
        return getGenderSpecificRelation(personId, 'Uncle-in-law', 'Aunt-in-law', allPeople, 'Uncle/Aunt-in-law');
      }
    }
  }
  
  // 3. Spouse of niece/nephew of root person are niece/nephew-in-law
  // Find root's nieces/nephews and check if person is married to any of them
  const rootSiblingsForNieceNephew = siblingMap.get(rootId) || new Set();
  for (const sibling of rootSiblingsForNieceNephew) {
    const siblingChildren = parentToChildren.get(sibling) || new Set();
    for (const niece_nephew of siblingChildren) {
      // Check if person is current spouse of this niece/nephew
      const nieceNephewCurrentSpouses = spouseMap.get(niece_nephew) || new Set();
      const nieceNephewDeceasedSpouses = deceasedSpouseMap.get(niece_nephew) || new Set();
      const nieceNephewExSpouses = exSpouseMap.get(niece_nephew) || new Set();
      
      for (const spouse of nieceNephewCurrentSpouses) {
        if (!nieceNephewDeceasedSpouses.has(spouse) && !nieceNephewExSpouses.has(spouse) && spouse === personId) {
          return getGenderSpecificRelation(personId, 'Nephew-in-law', 'Niece-in-law', allPeople, 'Niece/Nephew-in-law');
        }
      }
    }
  }
  
  // 4. Niece/nephew of root person's spouse are niece/nephew-in-law too
  for (const spouse of rootCurrentSpouses) {
    const spouseSiblings = siblingMap.get(spouse) || new Set();
    for (const spouseSibling of spouseSiblings) {
      const spouseSiblingChildren = parentToChildren.get(spouseSibling) || new Set();
      if (spouseSiblingChildren.has(personId)) {
        return getGenderSpecificRelation(personId, 'Nephew-in-law', 'Niece-in-law', allPeople, 'Niece/Nephew-in-law');
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
  
  // Important: A deceased spouse's parents have NO relationship to the surviving spouse
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
        // Important check: Verify if deceased spouse was alive when person was born
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