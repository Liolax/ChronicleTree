/**
 * Improved Tree Layout with Grid-Based Positioning
 * Addresses positioning issues with a more structured approach
 */

import { Position } from '@xyflow/react';

/**
 * Create improved tree layout with grid-based positioning
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects  
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - { flowNodes, flowEdges } for react-flow
 */
export const createImprovedTreeLayout = (persons, relationships, handlers = {}) => {
  if (!persons || !relationships) {
    return { flowNodes: [], flowEdges: [] };
  }

  // Build relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships);
  
  // Find root nodes (people with no parents)
  const rootNodes = findRootNodes(persons, relationshipMaps.childToParents);
  
  // Calculate generations for each person
  const generations = calculateGenerations(persons, relationshipMaps.childToParents, rootNodes);
  
  // Group people by generation
  const generationGroups = groupByGeneration(persons, generations);
  
  // Create grid-based positioning
  const gridLayout = createGridLayout(generationGroups, relationshipMaps.spouseMap, relationshipMaps.siblingMap);
  
  // Create nodes with improved positioning
  const nodes = createGridNodes(persons, gridLayout, handlers);
  
  // Create edges with proper styling
  const edges = createStyledEdges(relationships, relationshipMaps);
  
  return { flowNodes: nodes, flowEdges: edges };
};

/**
 * Build relationship maps for efficient lookups
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
 * Find root nodes (people with no parents)
 */
const findRootNodes = (persons, childToParents) => {
  return persons
    .filter(person => !childToParents.has(String(person.id)))
    .map(person => String(person.id));
};

/**
 * Calculate generations for each person
 */
const calculateGenerations = (persons, childToParents, rootNodes) => {
  const generations = new Map();
  const visited = new Set();
  
  // BFS to assign generations
  const queue = rootNodes.map(id => ({ id, generation: 0 }));
  
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    generations.set(id, generation);
    
    // Add children to queue
    const person = persons.find(p => String(p.id) === id);
    if (person) {
      // Find children through relationships
      const children = persons.filter(p => 
        childToParents.has(String(p.id)) && 
        childToParents.get(String(p.id)).has(id)
      );
      
      children.forEach(child => {
        if (!visited.has(String(child.id))) {
          queue.push({ id: String(child.id), generation: generation + 1 });
        }
      });
    }
  }
  
  return generations;
};

/**
 * Group people by generation
 */
const groupByGeneration = (persons, generations) => {
  const groups = new Map();
  
  persons.forEach(person => {
    const generation = generations.get(String(person.id)) || 0;
    if (!groups.has(generation)) {
      groups.set(generation, []);
    }
    groups.get(generation).push(person);
  });
  
  return groups;
};

/**
 * Create grid layout with better positioning
 */
const createGridLayout = (generationGroups, spouseMap, siblingMap) => {
  const layout = new Map();
  const GRID_WIDTH = 350;  // Increased spacing for better visibility
  const GRID_HEIGHT = 200; // Increased vertical spacing
  
  // Sort generations
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
  
  sortedGenerations.forEach(generation => {
    const people = generationGroups.get(generation);
    const y = generation * GRID_HEIGHT;
    
    // Group couples and siblings together
    const processed = new Set();
    const groups = [];
    
    people.forEach(person => {
      if (processed.has(String(person.id))) return;
      
      const group = [person];
      processed.add(String(person.id));
      
      // Add spouse if exists
      const spouseId = spouseMap.get(String(person.id));
      if (spouseId) {
        const spouse = people.find(p => String(p.id) === spouseId);
        if (spouse && !processed.has(spouseId)) {
          group.push(spouse);
          processed.add(spouseId);
        }
      }
      
      // Add siblings
      const siblings = siblingMap.get(String(person.id)) || new Set();
      siblings.forEach(siblingId => {
        const sibling = people.find(p => String(p.id) === siblingId);
        if (sibling && !processed.has(siblingId)) {
          group.push(sibling);
          processed.add(siblingId);
        }
      });
      
      groups.push(group);
    });
    
    // Position groups
    let currentX = 0;
    groups.forEach(group => {
      group.forEach((person, index) => {
        const x = currentX + (index * 180); // Closer spacing within groups
        layout.set(String(person.id), { x, y });
      });
      currentX += (group.length * 180) + 100; // Gap between groups
    });
  });
  
  return layout;
};

/**
 * Create nodes with grid positioning
 */
const createGridNodes = (persons, gridLayout, handlers) => {
  return persons.map(person => {
    const position = gridLayout.get(String(person.id)) || { x: 0, y: 0 };
    
    return {
      id: String(person.id),
      type: 'custom',
      data: { person, ...handlers },
      position,
      draggable: true,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });
};

/**
 * Create styled edges with proper visual distinction
 */
const createStyledEdges = (relationships, relationshipMaps) => {
  const edges = [];
  const processed = new Set();
  
  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    const edgeKey = `${source}-${target}`;
    const reverseKey = `${target}-${source}`;
    
    // Avoid duplicate edges
    if (processed.has(edgeKey) || processed.has(reverseKey)) {
      return;
    }
    
    let style = { strokeWidth: 2 };
    let label = '';
    let animated = false;
    
    switch (rel.type) {
      case 'parent':
        style.stroke = '#6366f1'; // Blue for parent-child
        label = 'Parent';
        break;
        
      case 'spouse':
        style.stroke = rel.is_ex ? '#9ca3af' : '#ec4899'; // Grey for ex, pink for current
        style.strokeWidth = 3;
        style.strokeDasharray = '5 5';
        label = rel.is_ex ? 'Ex-Spouse' : 'Spouse';
        animated = !rel.is_ex;
        break;
        
      case 'sibling':
        style.stroke = '#10b981'; // Green for siblings
        style.strokeDasharray = '3 3';
        label = 'Sibling';
        break;
        
      default:
        style.stroke = '#6b7280'; // Default grey
        break;
    }
    
    edges.push({
      id: `${source}-${target}`,
      source,
      target,
      type: 'smoothstep',
      style,
      label,
      animated,
      labelStyle: { fontSize: 12, fontWeight: 'bold' },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#ffffff', color: '#374151', fillOpacity: 0.9 }
    });
    
    processed.add(edgeKey);
  });
  
  return edges;
};