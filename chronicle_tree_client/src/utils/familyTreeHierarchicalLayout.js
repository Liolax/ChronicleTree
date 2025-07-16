/**
 * Enhanced Family Tree Hierarchical Layout
 * Creates a clean, top-down hierarchical family tree structure
 * Reduces visual clutter and improves user experience
 */

import { Position } from '@xyflow/react';

/**
 * Transform family data into a hierarchical tree structure
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects  
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - { nodes, edges } for react-flow
 */
export const createFamilyTreeLayout = (persons, relationships, handlers = {}) => {
  if (!persons || !relationships) {
    return { nodes: [], edges: [] };
  }

  // Step 1: Build relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships);
  
  // Step 2: Find root nodes (people with no parents)
  const rootNodes = findRootNodes(persons, relationshipMaps.childToParents);
  
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
  const SPOUSE_SPACING = 300;     // Optimal spacing between spouses
  const SIBLING_SPACING = 420;    // Increased spacing between siblings for better clarity

  // Position nodes generation by generation
  for (const [generation, generationPersons] of generationGroups) {
    const y = generation * GENERATION_HEIGHT;
    const processedPersons = new Set();

    // Calculate total width needed for this generation with proper spacing
    const coupleCount = Math.floor(generationPersons.length / 2);
    const singleCount = generationPersons.length % 2;
    const totalWidth = (coupleCount * (NODE_WIDTH + SPOUSE_SPACING)) + (singleCount * NODE_WIDTH) + ((coupleCount + singleCount - 1) * (SIBLING_SPACING - NODE_WIDTH));
    const startX = -totalWidth / 2;
    let xOffset = startX;

    generationPersons.forEach(person => {
      const personId = String(person.id);
      
      if (processedPersons.has(personId)) return;

      const spouseId = spouseMap.get(personId);
      const spouse = spouseId ? generationPersons.find(p => String(p.id) === spouseId) : null;

      if (spouse && !processedPersons.has(spouseId)) {
        // Position spouse pair
        nodes.push(createPersonNode(person, xOffset, y, handlers));
        nodes.push(createPersonNode(spouse, xOffset + SPOUSE_SPACING, y, handlers));
        
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
  const parentRelationships = relationships.filter(rel => rel.type === 'parent');
  const spouseRelationships = relationships.filter(rel => rel.type === 'spouse');
  const siblingRelationships = relationships.filter(rel => rel.type === 'sibling');

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
      // Determine if this is an ex-spouse relationship
      const isEx = relationship.is_ex === true;
      
      edges.push({
        id: connectionKey,
        source,
        target,
        type: 'straight',
        animated: false,
        style: {
          stroke: isEx ? '#9ca3af' : '#ec4899', // Grey for ex-spouse, pink for current spouse
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
    if (rel.type === 'parent') {
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
};