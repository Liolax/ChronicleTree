/**
 * Relationship Calculator Utility
 * Calculates relationships between people in a family tree
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

  // Build relationship maps for efficient lookups
  const relationshipMaps = buildRelationshipMaps(relationships);
  
  // Find the relationship path from person to root
  const relationshipPath = findRelationshipPath(
    person.id,
    rootPerson.id,
    relationshipMaps,
    allPeople
  );

  if (!relationshipPath) {
    return 'Unrelated';
  }

  return interpretRelationshipPath(relationshipPath, person, rootPerson, allPeople);
};

/**
 * Build relationship maps for efficient lookups
 * @param {Array} relationships - Array of relationship objects
 * @returns {Object} - Maps for different relationship types
 */
const buildRelationshipMaps = (relationships) => {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
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
        spouseMap.set(source, target);
        spouseMap.set(target, source);
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

  // After processing all relationships, infer sibling relationships from shared parents
  inferSiblingRelationships(parentToChildren, childToParents, siblingMap);

  return {
    parentToChildren,
    childToParents,
    spouseMap,
    siblingMap
  };
};

/**
 * Infer sibling relationships from shared parents
 * @param {Map} parentToChildren - Map of parent to their children
 * @param {Map} childToParents - Map of child to their parents
 * @param {Map} siblingMap - Map to update with inferred sibling relationships
 */
const inferSiblingRelationships = (parentToChildren, childToParents, siblingMap) => {
  // For each parent, find all their children and mark them as siblings
  for (const [parent, children] of parentToChildren) {
    const childArray = Array.from(children);
    
    // Each child is a sibling of every other child of the same parent
    for (let i = 0; i < childArray.length; i++) {
      for (let j = i + 1; j < childArray.length; j++) {
        const child1 = childArray[i];
        const child2 = childArray[j];
        
        // Add sibling relationship if not already present
        if (!siblingMap.has(child1)) {
          siblingMap.set(child1, new Set());
        }
        if (!siblingMap.has(child2)) {
          siblingMap.set(child2, new Set());
        }
        
        siblingMap.get(child1).add(child2);
        siblingMap.get(child2).add(child1);
      }
    }
  }
};

/**
 * Find the relationship path between two people using BFS
 * @param {string} fromId - Starting person ID
 * @param {string} toId - Target person ID
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @returns {Array|null} - Path of relationships or null if not found
 */
const findRelationshipPath = (fromId, toId, relationshipMaps, allPeople) => {
  const { parentToChildren, childToParents, spouseMap, siblingMap } = relationshipMaps;
  
  const queue = [{ id: String(fromId), path: [] }];
  const visited = new Set();
  
  while (queue.length > 0) {
    const { id, path } = queue.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    if (id === String(toId)) {
      return path;
    }
    
    // Check parent relationships (going UP the tree)
    const parents = childToParents.get(id);
    if (parents) {
      for (const parentId of parents) {
        if (!visited.has(parentId)) {
          queue.push({
            id: parentId,
            path: [...path, { type: 'child_to_parent', from: id, to: parentId }]
          });
        }
      }
    }
    
    // Check child relationships (going DOWN the tree)
    const children = parentToChildren.get(id);
    if (children) {
      for (const childId of children) {
        if (!visited.has(childId)) {
          queue.push({
            id: childId,
            path: [...path, { type: 'parent_to_child', from: id, to: childId }]
          });
        }
      }
    }
    
    // Check spouse relationships
    const spouse = spouseMap.get(id);
    if (spouse && !visited.has(spouse)) {
      queue.push({
        id: spouse,
        path: [...path, { type: 'spouse', from: id, to: spouse }]
      });
    }
    
    // Check sibling relationships
    const siblings = siblingMap.get(id);
    if (siblings) {
      for (const siblingId of siblings) {
        if (!visited.has(siblingId)) {
          queue.push({
            id: siblingId,
            path: [...path, { type: 'sibling', from: id, to: siblingId }]
          });
        }
      }
    }
  }
  
  return null;
};

/**
 * Interpret the relationship path to generate a human-readable description
 * @param {Array} path - Array of relationship steps
 * @param {Object} person - The person to describe
 * @param {Object} rootPerson - The root person
 * @param {Array} allPeople - Array of all people
 * @returns {string} - Human-readable relationship description
 */
const interpretRelationshipPath = (path, person, rootPerson, allPeople) => {
  if (!path || path.length === 0) return 'Unrelated';
  
  // Helper function to get gender-specific relationship term
  const getGenderSpecificTerm = (maleTitle, femaleTitle) => {
    const personGender = person.gender?.toLowerCase();
    return personGender === 'female' ? femaleTitle : maleTitle;
  };
  
  // Direct relationships
  if (path.length === 1) {
    const rel = path[0];
    switch (rel.type) {
      case 'child_to_parent':
        // Person went up to root, so person is child of root
        return getGenderSpecificTerm('Son', 'Daughter');
      case 'parent_to_child':
        // Person went down to root, so person is parent of root
        return getGenderSpecificTerm('Father', 'Mother');
      case 'spouse':
        return getGenderSpecificTerm('Husband', 'Wife');
      case 'sibling':
        return getGenderSpecificTerm('Brother', 'Sister');
    }
  }
  
  // For multi-step relationships, count the generational steps
  let generationSteps = 0;
  let hasSpouse = false;
  let hasSibling = false;
  
  for (const step of path) {
    if (step.type === 'child_to_parent') {
      generationSteps++; // Going up generations
    } else if (step.type === 'parent_to_child') {
      generationSteps--; // Going down generations
    } else if (step.type === 'spouse') {
      hasSpouse = true;
    } else if (step.type === 'sibling') {
      hasSibling = true;
    }
  }
  
  // Generate relationship description
  if (generationSteps > 0) {
    // Person is in older generation (ancestor)
    if (generationSteps === 1) {
      return hasSibling ? 
        getGenderSpecificTerm('Uncle', 'Aunt') : 
        getGenderSpecificTerm('Father', 'Mother');
    } else if (generationSteps === 2) {
      return hasSibling ? 
        'Great ' + getGenderSpecificTerm('Uncle', 'Aunt') : 
        getGenderSpecificTerm('Grandfather', 'Grandmother');
    } else {
      return `${generationSteps} generations older`;
    }
  } else if (generationSteps < 0) {
    // Person is in younger generation (descendant)
    const absGenerations = Math.abs(generationSteps);
    if (absGenerations === 1) {
      return hasSibling ? 
        getGenderSpecificTerm('Nephew', 'Niece') : 
        getGenderSpecificTerm('Son', 'Daughter');
    } else if (absGenerations === 2) {
      return hasSibling ? 
        'Grand ' + getGenderSpecificTerm('Nephew', 'Niece') : 
        getGenderSpecificTerm('Grandson', 'Granddaughter');
    } else {
      return `${absGenerations} generations younger`;
    }
  } else {
    // Same generation
    if (hasSibling) {
      return getGenderSpecificTerm('Brother', 'Sister');
    } else if (hasSpouse) {
      return getGenderSpecificTerm('Husband', 'Wife');
    } else {
      return 'Cousin'; // Default for same generation
    }
  }
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