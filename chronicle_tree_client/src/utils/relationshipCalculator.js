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

  return {
    parentToChildren,
    childToParents,
    spouseMap,
    siblingMap
  };
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
    
    // Check parent relationships
    const parents = childToParents.get(id);
    if (parents) {
      for (const parentId of parents) {
        if (!visited.has(parentId)) {
          queue.push({
            id: parentId,
            path: [...path, { type: 'parent', from: id, to: parentId }]
          });
        }
      }
    }
    
    // Check child relationships
    const children = parentToChildren.get(id);
    if (children) {
      for (const childId of children) {
        if (!visited.has(childId)) {
          queue.push({
            id: childId,
            path: [...path, { type: 'child', from: id, to: childId }]
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
  
  // Direct relationships
  if (path.length === 1) {
    const rel = path[0];
    switch (rel.type) {
      case 'parent':
        // If path goes from person to root via parent relationship,
        // it means person is the parent of someone who leads to root
        return rel.from === String(person.id) ? 'Child' : 'Parent';
      case 'child':
        // If path goes from person to root via child relationship,
        // it means person is the child of someone who leads to root
        return rel.from === String(person.id) ? 'Parent' : 'Child';
      case 'spouse':
        return 'Spouse';
      case 'sibling':
        return 'Sibling';
    }
  }
  
  // Multi-step relationships - analyze the path more carefully
  let generationsFromRoot = 0;
  let hasSpouse = false;
  let hasSibling = false;
  
  // Walk through the path from person to root
  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    const isPersonTheSource = step.from === String(person.id);
    
    if (step.type === 'parent') {
      // If person is the source of a parent relationship, they are going up the tree
      // If person is the target of a parent relationship, they are going down the tree
      generationsFromRoot += isPersonTheSource ? 1 : -1;
    } else if (step.type === 'child') {
      // If person is the source of a child relationship, they are going down the tree
      // If person is the target of a child relationship, they are going up the tree
      generationsFromRoot += isPersonTheSource ? -1 : 1;
    } else if (step.type === 'spouse') {
      hasSpouse = true;
    } else if (step.type === 'sibling') {
      hasSibling = true;
    }
  }
  
  // Generate relationship description based on generational difference
  if (generationsFromRoot > 0) {
    // Person is generations above root (older generation)
    if (generationsFromRoot === 1) {
      return hasSibling ? 'Parent\'s Sibling' : 'Parent';
    } else if (generationsFromRoot === 2) {
      return hasSibling ? 'Grandparent\'s Sibling' : 'Grandparent';
    } else {
      return `${generationsFromRoot} generations up`;
    }
  } else if (generationsFromRoot < 0) {
    // Person is generations below root (younger generation)
    const absGenerations = Math.abs(generationsFromRoot);
    if (absGenerations === 1) {
      return hasSibling ? 'Child\'s Sibling' : 'Child';
    } else if (absGenerations === 2) {
      return hasSibling ? 'Grandchild\'s Sibling' : 'Grandchild';
    } else {
      return `${absGenerations} generations down`;
    }
  } else {
    // Same generation
    if (hasSibling) {
      return 'Sibling';
    } else if (hasSpouse) {
      return 'Spouse';
    } else {
      return 'Same Generation';
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