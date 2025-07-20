import { Position } from '@xyflow/react';
/**
 * Collect all connected persons and relationships for a given root
 * Ensures siblings, spouses, and all relevant connections are included
 * @param {string|number} rootId - The root person ID
 * @param {Array} allPersons - All person objects
 * @param {Array} allRelationships - All relationship objects
 * @returns {Object} - { persons, relationships }
 */
export function collectConnectedFamily(rootId, allPersons, allRelationships) {
  // Build a map from person ID to relationships
  const relMap = new Map();
  allRelationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    if (!relMap.has(source)) {
      relMap.set(source, []);
    }
    if (!relMap.has(target)) {
      relMap.set(target, []);
    }
    relMap.get(source).push(rel);
    relMap.get(target).push(rel);
  });

  // Enhanced logic: BFS to collect all connected persons
  const visited = new Set();
  const queue = [String(rootId)];
  const connectedPersons = [];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const person = allPersons.find(p => String(p.id) === currentId);
    if (person) connectedPersons.push(person);
    
    // Find relationships for currentId and add connected persons to queue
    if (typeof relMap !== 'undefined' && relMap.get) {
      (relMap.get(currentId) || []).forEach(rel => {
        const source = String(rel.source || rel.from);
        const target = String(rel.target || rel.to);
        if (!visited.has(source)) queue.push(source);
        if (!visited.has(target)) queue.push(target);
      });
    } else {
      allRelationships.forEach(rel => {
        const source = String(rel.source || rel.from);
        const target = String(rel.target || rel.to);
        if (source === currentId && !visited.has(target)) {
          queue.push(target);
        } else if (target === currentId && !visited.has(source)) {
          queue.push(source);
        }
      });
    }
  }

  // Always include sibling relationships for the root
  const rootPerson = allPersons.find(p => String(p.id) === String(rootId));
  if (rootPerson) {
    // Find all persons with the same parents as rootPerson
    const parentIds = [rootPerson.father_id, rootPerson.mother_id].filter(Boolean);
    if (parentIds.length) {
      // Siblings: persons with same parents, not the root
      const siblings = allPersons.filter(p =>
        String(p.id) !== String(rootId) &&
        parentIds.includes(p.father_id) &&
        parentIds.includes(p.mother_id)
      );
      siblings.forEach(sibling => {
        // Add sibling if not already present
        if (!connectedPersons.some(p => String(p.id) === String(sibling.id))) {
          connectedPersons.push(sibling);
        }
      });
    }
  }

  // Now collect ALL relationships between the connected persons
  const connectedPersonIds = new Set(connectedPersons.map(p => String(p.id)));
  const connectedRelationships = allRelationships.filter(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    return connectedPersonIds.has(source) && connectedPersonIds.has(target);
  });

  // Return only connected persons and relationships
  return {
    persons: connectedPersons,
    relationships: connectedRelationships,
  };
}
export const createFamilyTreeLayout = (persons, relationships, handlers = {}) => {
  // Debug: Print incoming persons and relationships
  console.log('createFamilyTreeLayout: persons:', persons);
  console.log('createFamilyTreeLayout: relationships:', relationships);
  if (!persons || !relationships) {
    return { nodes: [], edges: [] };
  }

  // Step 1: Build relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships);
  
  // Step 2: Find root nodes (people with no parents)
  const rootNodes = findRootNodes(persons, relationshipMaps.childToParents);
  console.log('createFamilyTreeLayout: computed rootNodes:', rootNodes);
  
  // Step 3: Calculate generations for each person
  const generations = calculateGenerations(persons, relationshipMaps.childToParents, rootNodes);
  
  // Step 4: Create nodes with hierarchical positioning
  const nodes = createHierarchicalNodes(persons, generations, relationshipMaps.spouseMap, handlers);
  
  // Step 5: Create simplified edges (no duplication)
  const edges = createSimplifiedEdges(relationships, relationshipMaps);
  
  return { nodes, edges };
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
        // Only include current spouses in the spouse map for positioning
        // Ex-spouses and deceased spouses should not be positioned as couples
        if (!rel.is_ex && !rel.is_deceased) {
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

  // Debug: Log spouse relationship processing
  console.log('Spouse relationships:');
  const spouseRels = relationships.filter(rel => (rel.type || rel.relationship_type) === 'spouse');
  spouseRels.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    const status = rel.is_deceased ? 'deceased' : (rel.is_ex ? 'ex' : 'current');
    console.log(`  ${source} <-> ${target} (${status}) - Raw:`, rel);
  });
  
  console.log('Current spouse map (for positioning):');
  spouseMap.forEach((targetId, sourceId) => {
    console.log(`  ${sourceId} -> ${targetId}`);
  });

  return {
    parentToChildren,
    childToParents,
    spouseMap,
    siblingMap
  };
};

/**
 * Find root nodes (people with no parents)
 * @param {Array} persons - Array of person objects
 * @param {Map} childToParents - Map of child to parents
 * @returns {Array} - Array of root person IDs
 */
const findRootNodes = (persons, childToParents) => {
  return persons
    .filter(person => !childToParents.has(String(person.id)))
    .map(person => String(person.id));
};

/**
 * Calculate generation level for each person using BFS
 * @param {Array} persons - Array of person objects
 * @param {Map} childToParents - Map of child to parents
 * @param {Array} rootNodes - Array of root node IDs
 * @returns {Map} - Map of person ID to generation level
 */
const calculateGenerations = (persons, childToParents, rootNodes) => {
  const generations = new Map();
  const visited = new Set();
  const queue = [];

  // Start with root nodes at generation 0
  rootNodes.forEach(rootId => {
    queue.push({ id: rootId, generation: 0 });
  });

  // BFS to assign generations
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    generations.set(id, generation);
    
    // Add children to next generation
    const children = getChildrenOfPerson(id, childToParents);
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, generation: generation + 1 });
      }
    });
  }

  // Handle any unvisited nodes (orphaned nodes)
  persons.forEach(person => {
    const id = String(person.id);
    if (!generations.has(id)) {
      generations.set(id, 0);
    }
  });

  return generations;
};

/**
 * Get children of a person
 * @param {string} personId - Person ID
 * @param {Map} childToParents - Map of child to parents
 * @returns {Array} - Array of child IDs
 */
const getChildrenOfPerson = (personId, childToParents) => {
  const children = [];
  for (const [childId, parents] of childToParents) {
    if (parents.has(personId)) {
      children.push(childId);
    }
  }
  return children;
};

/**
 * Create nodes with hierarchical positioning
 * @param {Array} persons - Array of person objects
 * @param {Map} generations - Map of person ID to generation
 * @param {Map} spouseMap - Map of spouse relationships
 * @param {Object} handlers - Event handlers
 * @returns {Array} - Array of positioned nodes
 */
const createHierarchicalNodes = (persons, generations, spouseMap, handlers) => {
  const nodes = [];
  const generationGroups = new Map();

  // Group persons by generation
  persons.forEach(person => {
    const id = String(person.id);
    const generation = generations.get(id) || 0;
    
    if (!generationGroups.has(generation)) {
      generationGroups.set(generation, []);
    }
    generationGroups.get(generation).push(person);
  });

  // Layout constants - enhanced spacing for better visual hierarchy
  const GENERATION_HEIGHT = 450;  // Increased vertical spacing between generations
  const NODE_WIDTH = 280;
  const NODE_MARGIN = 40;
  const currentSpouseSpacing = NODE_WIDTH + NODE_MARGIN; // 320, prevents overlap
  const exSpouseSpacing = 120;
  const lateSpouseSpacing = 70;
  const SIBLING_SPACING = 420;    // Increased spacing between siblings for better clarity

  function getSpouseSpacing(spouseType) {
    switch (spouseType) {
      case "current":
        return currentSpouseSpacing;
      case "ex":
        return exSpouseSpacing;
      case "late":
        return lateSpouseSpacing;
      default:
        return NODE_WIDTH + NODE_MARGIN;
    }
  }

  // Position nodes generation by generation
  for (const [generation, generationPersons] of generationGroups) {
    const y = generation * GENERATION_HEIGHT;
    const processedPersons = new Set();

    // Calculate total width needed for this generation with proper spacing
    const coupleCount = Math.floor(generationPersons.length / 2);
    const singleCount = generationPersons.length % 2;
    const totalWidth = (coupleCount * (NODE_WIDTH + SIBLING_SPACING)) + (singleCount * NODE_WIDTH) + ((coupleCount + singleCount - 1) * (SIBLING_SPACING - NODE_WIDTH));
    const startX = -totalWidth / 2;
    let xOffset = startX;

    generationPersons.forEach(person => {
      const personId = String(person.id);
      if (processedPersons.has(personId)) return;
      const spouseId = spouseMap.get(personId);
      const spouse = spouseId ? generationPersons.find(p => String(p.id) === spouseId) : null;
      if (spouse && !processedPersons.has(spouseId)) {
        // Determine spouse type for spacing
        let spouseType = "current";
        if (spouse.is_ex) spouseType = "ex";
        else if (spouse.date_of_death || spouse.is_deceased) spouseType = "late";
        const spacing = getSpouseSpacing(spouseType);
        // Position spouse pair
        nodes.push(createPersonNode(person, xOffset, y, handlers));
        nodes.push(createPersonNode(spouse, xOffset + spacing, y, handlers));
        processedPersons.add(personId);
        processedPersons.add(spouseId);
        xOffset += SIBLING_SPACING;
      } else {
        // Position single person
        nodes.push(createPersonNode(person, xOffset, y, handlers));
        processedPersons.add(personId);
        xOffset += SIBLING_SPACING;
      }
    });
  }

  // Identify unrelated node ids (not connected to any other node by parent, spouse, sibling)
  const connectedIds = new Set();
  nodes.forEach(node => {
    // If node has any edge, it's considered connected
    // We'll mark all nodes as connected except those with no relationships
    // But for minimal change, let's just use persons with no parents, spouses, or siblings
    const person = persons.find(p => String(p.id) === node.id);
    if (!person) return;
    let hasRelation = false;
    // Check parent
    if (person.father_id || person.mother_id) hasRelation = true;
    // Check spouse
    if (spouseMap.has(String(person.id))) hasRelation = true;
    // Check siblings (if any)
    // Sibling logic is not perfect here, but we can skip for now
    if (hasRelation) connectedIds.add(node.id);
  });
  const unrelatedNodeIds = nodes.map(n => n.id).filter(id => !connectedIds.has(id));

  // Overlap avoidance function
  function avoidNodeOverlap(nodes, unrelatedNodeIds, nodeWidth = 220, nodeHeight = 150, margin = 30) {
    const isOverlapping = (nodeA, nodeB) => {
      return (
        Math.abs(nodeA.position.x - nodeB.position.x) < nodeWidth + margin &&
        Math.abs(nodeA.position.y - nodeB.position.y) < nodeHeight + margin
      );
    };
    unrelatedNodeIds.forEach((unrelatedId) => {
      const node = nodes.find((n) => n.id === unrelatedId);
      if (!node) return;
      let overlapped;
      do {
        overlapped = nodes.some(
          (other) =>
            other.id !== node.id && isOverlapping(node, other)
        );
        if (overlapped) {
          // Nudge to the right
          node.position.x += nodeWidth + margin;
        }
      } while (overlapped);
    });
    return nodes;
  }

  // Nudge unrelated nodes to avoid overlap
  avoidNodeOverlap(nodes, unrelatedNodeIds);

  return nodes;
};

/**
 * Create a person node
 * @param {Object} person - Person object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} handlers - Event handlers
 * @returns {Object} - React Flow node
 */
const createPersonNode = (person, x, y, handlers) => {
  return {
    id: String(person.id),
    type: 'personCard',
    data: { 
      person,
      ...handlers
    },
    position: { x, y },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    draggable: true,
  };
};

/**
 * Create simplified edges with no duplication and better visual clarity
 * @param {Array} relationships - Array of relationship objects
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Array of simplified edges
 */
const createSimplifiedEdges = (relationships, relationshipMaps) => {
  const edges = [];
  const processedConnections = new Set();

  // Group relationships by type for better processing
  const parentRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'parent');
  const spouseRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'spouse');
  const siblingRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'sibling');

  // Enhanced Debug: Print all sibling relationships and sibling map for verification
  if (siblingRelationships.length > 0) {
    console.log('Sibling relationships:');
    siblingRelationships.forEach(rel => {
      console.log(`Sibling: ${rel.source || rel.from} <-> ${rel.target || rel.to}`);
    });
    // Print sibling map for each person
    if (relationshipMaps && relationshipMaps.siblingMap) {
      console.log('SiblingMap breakdown:');
      for (const [personId, siblingsSet] of relationshipMaps.siblingMap.entries()) {
        console.log(`Person ${personId} has siblings: [${Array.from(siblingsSet).join(', ')}]`);
      }
    }
  }

  // Process parent relationships - only create one edge per parent-child pair
  parentRelationships.forEach(relationship => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    const connectionKey = `parent-${source}-${target}`;

    if (!processedConnections.has(connectionKey)) {
      edges.push({
        id: connectionKey,
        source,
        target,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#6366f1',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#6366f1'
        }
      });
      processedConnections.add(connectionKey);
    }
  });

  // Process spouse relationships - create horizontal connections
  spouseRelationships.forEach(relationship => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    const connectionKey = `spouse-${Math.min(source, target)}-${Math.max(source, target)}`;

    if (!processedConnections.has(connectionKey)) {
      // Determine the relationship status and color
      const isEx = relationship.is_ex === true;
      const isDeceased = relationship.is_deceased === true;
      
      // Choose color based on relationship status
      let strokeColor = '#ec4899'; // Default: pink for current spouse
      if (isDeceased) {
        strokeColor = '#000000'; // Black for deceased spouse
      } else if (isEx) {
        strokeColor = '#9ca3af'; // Grey for ex-spouse
      }
      
      edges.push({
        id: connectionKey,
        source,
        target,
        type: 'straight',
        animated: false,
        style: {
          stroke: strokeColor,
          strokeWidth: 3,
          strokeDasharray: '5 5'
        }
      });
      processedConnections.add(connectionKey);
    }
  });

  // Note: Sibling relationships are not visually connected with edges
  // Sibling relationships are inferred from the hierarchical layout positioning

  return edges;
};

/**
 * Center children between their parents
 * @param {Array} nodes - Array of nodes
 * @param {Array} relationships - Array of relationship objects
 * @returns {Array} - Updated nodes with centered children
 */
export const centerChildrenBetweenParents = (nodes, relationships) => {
  const nodeMap = new Map();
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
  });

  // Build child to parents map
  const childToParents = new Map();
  relationships.forEach(rel => {
    if ((rel.type || rel.relationship_type) === 'parent') {
      const parentId = String(rel.source || rel.from);
      const childId = String(rel.target || rel.to);
      
      if (!childToParents.has(childId)) {
        childToParents.set(childId, []);
      }
      childToParents.get(childId).push(parentId);
    }
  });

  // Adjust child positions to be centered between parents
  for (const [childId, parentIds] of childToParents) {
    if (parentIds.length > 1) {
      const child = nodeMap.get(childId);
      if (!child) continue;

      const parentNodes = parentIds
        .map(parentId => nodeMap.get(parentId))
        .filter(Boolean);

      if (parentNodes.length > 1) {
        const avgX = parentNodes.reduce((sum, parent) => sum + parent.position.x, 0) / parentNodes.length;
        child.position.x = avgX;
      }
    }
  }

  return nodes;
}
