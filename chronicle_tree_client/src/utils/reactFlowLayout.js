// React Flow Family Tree Layout Utility
// Simplified, intuitive top-down family tree layout using react-flow features

import { Position } from '@xyflow/react';

/**
 * Transform family data into react-flow nodes and edges with top-down layout
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects  
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - { nodes, edges } for react-flow
 */
export const transformFamilyData = (persons, relationships, handlers = {}) => {
  if (!persons || !relationships) {
    return { nodes: [], edges: [] };
  }

  // Create nodes from persons
  const nodes = persons.map(person => ({
    id: String(person.id),
    type: 'personCard',
    data: { 
      person,
      ...handlers
    },
    position: { x: 0, y: 0 }, // Will be positioned by layout
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    draggable: true,
  }));

  // Create edges from relationships
  const edges = relationships.map((relationship, index) => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    
    // Determine if this is a direct sibling relationship (no shared parents)
    let effectiveType = relationship.type;
    if (isSiblingType(relationship.type)) {
      const isDirectSibling = checkIsDirectSibling(source, target, relationships);
      if (isDirectSibling) {
        effectiveType = 'direct_sibling';
      } else {
        // Regular siblings (with shared parents)
        effectiveType = 'sibling';
      }
    }
    
    return {
      id: `edge-${source}-${target}-${index}`,
      source,
      target,
      type: 'smoothstep',
      animated: false,
      label: getRelationshipLabel(effectiveType),
      style: getEdgeStyle(effectiveType),
      markerEnd: getMarkerEnd(effectiveType),
      data: { relationship, effectiveType }
    };
  });

  return { nodes, edges };
};

/**
 * Check if relationship type is a sibling type
 * @param {string} type - Relationship type
 * @returns {boolean} - True if sibling type
 */
const isSiblingType = (type) => {
  return ['sibling', 'brother', 'sister', 'Brother', 'Sister'].includes(type);
};

/**
 * Check if two people are direct siblings (no shared parents)
 * @param {string} person1Id - First person ID
 * @param {string} person2Id - Second person ID  
 * @param {Array} relationships - All relationships
 * @returns {boolean} - True if direct siblings (no shared parents)
 */
const checkIsDirectSibling = (person1Id, person2Id, relationships) => {
  // Find parents of person1
  const person1Parents = new Set();
  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    if (source === person1Id && rel.type === 'parent') {
      person1Parents.add(target);
    } else if (target === person1Id && rel.type === 'child') {
      person1Parents.add(source);
    }
  });
  
  // Find parents of person2
  const person2Parents = new Set();
  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    if (source === person2Id && rel.type === 'parent') {
      person2Parents.add(target);
    } else if (target === person2Id && rel.type === 'child') {
      person2Parents.add(source);
    }
  });
  
  // Check if they share any parents
  const sharedParents = [...person1Parents].filter(parent => person2Parents.has(parent));
  
  // Direct siblings = siblings with no shared parents
  return sharedParents.length === 0;
};

/**
 * Get relationship label for display
 * @param {string} type - Relationship type
 * @returns {string} - Display label
 */
const getRelationshipLabel = (type) => {
  const labels = {
    parent: 'Parent',
    child: 'Child', 
    spouse: 'Spouse',
    ex_spouse: 'Ex-Spouse',
    sibling: 'Sibling',
    direct_sibling: 'Sibling',
    cousin: 'Cousin',
    grandparent: 'Grandparent',
    grandchild: 'Grandchild'
  };
  return labels[type] || type;
};

/**
 * Get edge styling based on relationship type
 * @param {string} type - Relationship type
 * @returns {Object} - Style object
 */
const getEdgeStyle = (type) => {
  const styles = {
    spouse: {
      stroke: '#f59e42',
      strokeWidth: 3,
      strokeDasharray: '5 5'
    },
    ex_spouse: {
      stroke: '#ef4444',
      strokeWidth: 2,
      strokeDasharray: '10 5'
    },
    parent: {
      stroke: '#6366f1',
      strokeWidth: 2
    },
    child: {
      stroke: '#6366f1',
      strokeWidth: 2
    },
    sibling: {
      stroke: '#10b981',
      strokeWidth: 2,
      strokeDasharray: '3 3'
    },
    direct_sibling: {
      stroke: '#3b82f6', // Blue color for direct sibling connections
      strokeWidth: 2,
      strokeDasharray: '2 6' // Dotted pattern (shorter dashes, longer gaps)
    },
    cousin: {
      stroke: '#8b5cf6',
      strokeWidth: 1,
      strokeDasharray: '2 2'
    },
    grandparent: {
      stroke: '#84cc16',
      strokeWidth: 2
    },
    grandchild: {
      stroke: '#84cc16',
      strokeWidth: 2
    }
  };
  
  return styles[type] || {
    stroke: '#64748b',
    strokeWidth: 2
  };
};

/**
 * Get marker end for relationship type
 * @param {string} type - Relationship type
 * @returns {Object|undefined} - Marker object or undefined
 */
const getMarkerEnd = (type) => {
  if (type === 'parent' || type === 'grandparent') {
    return {
      type: 'arrowclosed',
      width: 20,
      height: 20,
      color: '#6366f1'
    };
  }
  return undefined;
};

/**
 * Apply automatic hierarchical layout using react-flow's dagre
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @returns {Array} - Positioned nodes
 */
export const applyHierarchicalLayout = (nodes, edges) => {
  if (!nodes.length) return nodes;
  
  const generationMap = calculateGenerations(nodes, edges);
  const spouseMap = createSpouseMap(edges);
  const generations = {};
  
  // Group nodes by generation
  nodes.forEach(node => {
    const gen = generationMap[node.id] || 0;
    if (!generations[gen]) generations[gen] = [];
    generations[gen].push(node);
  });
  
  // Position nodes with better spacing
  const GENERATION_HEIGHT = 280;
  const NODE_WIDTH = 280;
  const SPOUSE_OFFSET = 140;
  
  Object.entries(generations).forEach(([gen, genNodes]) => {
    const generation = parseInt(gen);
    const processedNodes = new Set();
    let currentX = 0;
    
    // Calculate starting position to center the generation
    const totalWidth = genNodes.length * NODE_WIDTH;
    const startX = -totalWidth / 2;
    let xOffset = startX;
    
    genNodes.forEach((node) => {
      if (processedNodes.has(node.id)) return;
      
      const spouseId = spouseMap[node.id];
      if (spouseId && genNodes.find(n => n.id === spouseId)) {
        // Position spouse pair
        const spouse = genNodes.find(n => n.id === spouseId);
        
        node.position = {
          x: xOffset,
          y: generation * GENERATION_HEIGHT
        };
        
        spouse.position = {
          x: xOffset + SPOUSE_OFFSET,
          y: generation * GENERATION_HEIGHT
        };
        
        processedNodes.add(node.id);
        processedNodes.add(spouseId);
        xOffset += NODE_WIDTH;
      } else {
        // Position single node
        node.position = {
          x: xOffset,
          y: generation * GENERATION_HEIGHT
        };
        
        processedNodes.add(node.id);
        xOffset += NODE_WIDTH;
      }
    });
  });
  
  // Center children between their parents
  return centerChildrenBetweenParents(nodes, edges);
};

/**
 * Create a map of spouse relationships
 * @param {Array} edges - Array of edges
 * @returns {Object} - Map of person id to spouse id
 */
const createSpouseMap = (edges) => {
  const spouseMap = {};
  edges.forEach(edge => {
    if (edge.type === 'spouse') {
      spouseMap[edge.source] = edge.target;
      spouseMap[edge.target] = edge.source;
    }
  });
  return spouseMap;
};

/**
 * Center children between their parents
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @returns {Array} - Updated nodes
 */
const centerChildrenBetweenParents = (nodes, edges) => {
  const nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.id] = node;
  });
  
  const childToParents = {};
  edges.forEach(edge => {
    if (edge.type === 'parent') {
      const childId = edge.target;
      const parentId = edge.source;
      
      if (!childToParents[childId]) childToParents[childId] = [];
      childToParents[childId].push(parentId);
    }
  });
  
  // Adjust child positions to be centered between parents
  Object.entries(childToParents).forEach(([childId, parentIds]) => {
    if (parentIds.length > 1) {
      const child = nodeMap[childId];
      const parents = parentIds.map(id => nodeMap[id]).filter(Boolean);
      
      if (parents.length > 1) {
        const avgX = parents.reduce((sum, parent) => sum + parent.position.x, 0) / parents.length;
        child.position.x = avgX;
      }
    }
  });
  
  return nodes;
};

/**
 * Calculate generation for each person
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @returns {Object} - Map of node id to generation
 */
const calculateGenerations = (nodes, edges) => {
  const generations = {};
  const childToParents = {};
  
  // Build parent-child relationships
  edges.forEach(edge => {
    if (edge.type === 'parent') {
      const childId = edge.target;
      const parentId = edge.source;
      
      if (!childToParents[childId]) childToParents[childId] = [];
      childToParents[childId].push(parentId);
    }
  });
  
  // Find root nodes (no parents)
  const rootNodes = nodes.filter(node => !childToParents[node.id]);
  
  // BFS to assign generations
  const queue = rootNodes.map(node => ({ id: node.id, generation: 0 }));
  const visited = new Set();
  
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    generations[id] = generation;
    
    // Add children to queue
    edges.forEach(edge => {
      if (edge.type === 'parent' && edge.source === id) {
        const childId = edge.target;
        if (!visited.has(childId)) {
          queue.push({ id: childId, generation: generation + 1 });
        }
      }
    });
  }
  
  return generations;
};