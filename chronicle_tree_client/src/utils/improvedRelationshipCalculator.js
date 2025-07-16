/**
 * Improved Relationship Calculator Utility
 * Handles complex family relationships including in-law relationships
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

  // Build comprehensive relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships);
  
  // Find the relationship using improved algorithm
  const relationship = findRelationship(
    person.id,
    rootPerson.id,
    relationshipMaps,
    allPeople
  );

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
  const spouseMap = new Map();
  const exSpouseMap = new Map();
  const siblingMap = new Map();

  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    switch (rel.type) {
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
          exSpouseMap.set(source, target);
          exSpouseMap.set(target, source);
        } else {
          spouseMap.set(source, target);
          spouseMap.set(target, source);
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
    return getGenderSpecificRelation(personId, 'Father', 'Mother', allPeople);
  }
  
  // Check if person is root's child
  if (parentToChildren.has(rootId) && parentToChildren.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Son', 'Daughter', allPeople);
  }
  
  // Check if person is root's spouse
  if (spouseMap.has(rootId) && spouseMap.get(rootId) === personId) {
    return getGenderSpecificRelation(personId, 'Husband', 'Wife', allPeople);
  }
  
  // Check if person is root's ex-spouse
  if (exSpouseMap.has(rootId) && exSpouseMap.get(rootId) === personId) {
    return getGenderSpecificRelation(personId, 'Ex-Husband', 'Ex-Wife', allPeople);
  }
  
  // Check if person is root's sibling
  if (siblingMap.has(rootId) && siblingMap.get(rootId).has(personId)) {
    return getGenderSpecificRelation(personId, 'Brother', 'Sister', allPeople);
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
      return getGenderSpecificRelation(personId, 'Grandfather', 'Grandmother', allPeople);
    }
  }
  
  // Check for grandchild relationship
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const child of rootChildren) {
    if (parentToChildren.has(child) && parentToChildren.get(child).has(personId)) {
      return getGenderSpecificRelation(personId, 'Grandson', 'Granddaughter', allPeople);
    }
  }
  
  // Check for aunt/uncle relationship (person is aunt/uncle of root)
  const rootSiblings = siblingMap.get(rootId) || new Set();
  
  // Check if person is root's parent's sibling (person is root's aunt/uncle)
  for (const parent of rootParents) {
    if (siblingMap.has(parent) && siblingMap.get(parent).has(personId)) {
      // Person is sibling of root's parent, so person is root's aunt/uncle
      return getGenderSpecificRelation(personId, 'Uncle', 'Aunt', allPeople);
    }
  }
  
  // Check for niece/nephew relationship (person is niece/nephew of root)
  for (const sibling of rootSiblings) {
    if (parentToChildren.has(sibling) && parentToChildren.get(sibling).has(personId)) {
      // Person is child of root's sibling, so person is root's niece/nephew
      return getGenderSpecificRelation(personId, 'Nephew', 'Niece', allPeople);
    }
  }
  
  // Check for cousin relationship
  // Cousins are children of siblings
  // Person and root are cousins if their parents are siblings
  const personParents = childToParents.get(personId) || new Set();
  for (const personParent of personParents) {
    const personParentSiblings = siblingMap.get(personParent) || new Set();
    for (const rootParent of rootParents) {
      if (personParentSiblings.has(rootParent)) {
        // Person's parent is sibling of root's parent, so person and root are cousins
        return 'Cousin';
      }
    }
  }
  
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
  const { parentToChildren, childToParents, spouseMap, exSpouseMap, siblingMap } = relationshipMaps;
  
  // Get all spouses and ex-spouses of root
  const rootSpouses = new Set();
  if (spouseMap.has(rootId)) {
    rootSpouses.add(spouseMap.get(rootId));
  }
  if (exSpouseMap.has(rootId)) {
    rootSpouses.add(exSpouseMap.get(rootId));
  }
  
  // Check if person is parent of root's spouse (parent-in-law)
  for (const spouse of rootSpouses) {
    if (childToParents.has(spouse) && childToParents.get(spouse).has(personId)) {
      return getGenderSpecificRelation(personId, 'Father-in-law', 'Mother-in-law', allPeople);
    }
  }
  
  // Check if person is child of root's spouse (child-in-law)
  for (const spouse of rootSpouses) {
    if (parentToChildren.has(spouse) && parentToChildren.get(spouse).has(personId)) {
      return getGenderSpecificRelation(personId, 'Son-in-law', 'Daughter-in-law', allPeople);
    }
  }
  
  // Check if person is sibling of root's spouse (sibling-in-law)
  for (const spouse of rootSpouses) {
    if (siblingMap.has(spouse) && siblingMap.get(spouse).has(personId)) {
      return getGenderSpecificRelation(personId, 'Brother-in-law', 'Sister-in-law', allPeople);
    }
  }
  
  // Check if person is spouse of root's sibling (sibling-in-law)
  const rootSiblings = siblingMap.get(rootId) || new Set();
  for (const sibling of rootSiblings) {
    if (spouseMap.has(sibling) && spouseMap.get(sibling) === personId) {
      return getGenderSpecificRelation(personId, 'Brother-in-law', 'Sister-in-law', allPeople);
    }
    if (exSpouseMap.has(sibling) && exSpouseMap.get(sibling) === personId) {
      return getGenderSpecificRelation(personId, 'Brother-in-law', 'Sister-in-law', allPeople);
    }
  }
  
  // Check if person is spouse of root's child (child-in-law)
  const rootChildren = parentToChildren.get(rootId) || new Set();
  for (const child of rootChildren) {
    if (spouseMap.has(child) && spouseMap.get(child) === personId) {
      return getGenderSpecificRelation(personId, 'Son-in-law', 'Daughter-in-law', allPeople);
    }
    if (exSpouseMap.has(child) && exSpouseMap.get(child) === personId) {
      return getGenderSpecificRelation(personId, 'Son-in-law', 'Daughter-in-law', allPeople);
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
 * @returns {string} - Gender-specific relationship term
 */
const getGenderSpecificRelation = (personId, maleRelation, femaleRelation, allPeople) => {
  const person = allPeople.find(p => String(p.id) === String(personId));
  if (person && person.gender) {
    return person.gender.toLowerCase() === 'female' ? femaleRelation : maleRelation;
  }
  return maleRelation; // Default to male if gender not found
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