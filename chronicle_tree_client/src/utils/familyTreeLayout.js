// Enhanced Family Tree Layout Algorithm
// Provides hierarchical positioning with intelligent spacing, family-aware positioning,
// color-coded branches, and non-colliding edges

/**
 * Generate unique colors for different family branches
 * @param {number} index - Branch index
 * @returns {string} - Color hex code
 */
export const generateBranchColor = (index) => {
  const colors = [
    '#6366f1', // indigo
    '#f59e42', // orange
    '#ef4444', // red
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f97316', // orange-500
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#ec4899', // pink
    '#64748b', // slate
    '#dc2626', // red-600
    '#059669', // emerald-600
    '#7c3aed', // violet-600
    '#ea580c', // orange-600
    '#0891b2', // cyan-600
    '#65a30d', // lime-600
  ];
  return colors[index % colors.length];
};

/**
 * Calculate generation for each person based on parent-child relationships
 * @param {Array} nodes - Array of person nodes
 * @param {Array} edges - Array of relationship edges
 * @returns {Object} - Map of person id to generation number
 */
export const calculateGenerations = (nodes, edges) => {
  const childToParents = {};
  const parentToChildren = {};
  const spouseRelations = {};
  
  // Build parent-child relationships and spouse relationships
  edges.forEach(edge => {
    if (edge.type === 'parent' || edge.type === 'child') {
      const parentId = edge.type === 'parent' ? edge.source : edge.target;
      const childId = edge.type === 'parent' ? edge.target : edge.source;
      
      if (!childToParents[childId]) childToParents[childId] = [];
      if (!parentToChildren[parentId]) parentToChildren[parentId] = [];
      
      childToParents[childId].push(parentId);
      parentToChildren[parentId].push(childId);
    } else if (edge.type === 'spouse') {
      // Track spouse relationships
      const person1 = edge.source;
      const person2 = edge.target;
      
      if (!spouseRelations[person1]) spouseRelations[person1] = [];
      if (!spouseRelations[person2]) spouseRelations[person2] = [];
      
      spouseRelations[person1].push(person2);
      spouseRelations[person2].push(person1);
    }
  });
  
  // Find root nodes (those with no parents)
  const rootIds = nodes
    .filter(node => !childToParents[node.id] || childToParents[node.id].length === 0)
    .map(node => node.id);
  
  // Calculate initial generations using BFS
  const generationMap = {};
  const visited = new Set();
  
  // First pass: process roots and their descendants
  let queue = rootIds.map(id => ({ id, generation: 0 }));
  
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    generationMap[id] = generation;
    
    // Add children to queue with next generation
    (parentToChildren[id] || []).forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, generation: generation + 1 });
      }
    });
  }
  
  // Second pass: adjust spouse generations and propagate to children
  const adjustGenerations = () => {
    let changed = false;
    
    // First, adjust spouse generations
    Object.keys(spouseRelations).forEach(personId => {
      const personGen = generationMap[personId];
      
      spouseRelations[personId].forEach(spouseId => {
        const spouseGen = generationMap[spouseId];
        
        // If spouse generations don't match, adjust to the higher generation
        if (personGen !== undefined && spouseGen !== undefined) {
          const targetGen = Math.max(personGen, spouseGen);
          
          if (generationMap[personId] !== targetGen) {
            generationMap[personId] = targetGen;
            changed = true;
          }
          
          if (generationMap[spouseId] !== targetGen) {
            generationMap[spouseId] = targetGen;
            changed = true;
          }
        }
      });
    });
    
    // Then, adjust children generations based on their parents' max generation
    Object.keys(childToParents).forEach(childId => {
      const parents = childToParents[childId];
      if (parents.length > 0) {
        const maxParentGen = Math.max(...parents.map(parentId => generationMap[parentId] || 0));
        const expectedChildGen = maxParentGen + 1;
        
        if (generationMap[childId] !== expectedChildGen) {
          generationMap[childId] = expectedChildGen;
          changed = true;
        }
      }
    });
    
    return changed;
  };
  
  // Keep adjusting until no more changes
  let maxIterations = 10;
  while (adjustGenerations() && maxIterations-- > 0) {
    // Continue until convergence
  }
  
  return generationMap;
};

/**
 * Group couples based on spouse relationships
 * @param {Array} nodes - Array of person nodes
 * @param {Array} edges - Array of relationship edges
 * @returns {Object} - Contains coupleGroups array and nodeToCoupleIdx map
 */
export const groupCouples = (nodes, edges) => {
  const spouseEdges = edges.filter(edge => edge.type === 'spouse');
  const coupleGroups = [];
  const coupled = new Set();
  
  spouseEdges.forEach(edge => {
    const personA = String(edge.source);
    const personB = String(edge.target);
    
    if (!coupled.has(personA) && !coupled.has(personB)) {
      coupleGroups.push([personA, personB]);
      coupled.add(personA);
      coupled.add(personB);
    }
  });
  
  const nodeToCoupleIdx = {};
  coupleGroups.forEach((group, idx) => {
    group.forEach(id => {
      nodeToCoupleIdx[id] = idx;
    });
  });
  
  return { coupleGroups, nodeToCoupleIdx };
};

/**
 * Calculate intelligent spacing for family-aware positioning
 * @param {Object} generationGroups - Nodes grouped by generation
 * @param {Object} nodeToCoupleIdx - Map of node to couple index
 * @param {Object} coupleGroups - Array of couple groups
 * @returns {Object} - Spacing configuration
 */
export const calculateIntelligentSpacing = (generationGroups, nodeToCoupleIdx, coupleGroups) => {
  const maxGenerationWidth = Math.max(
    ...Object.values(generationGroups).map(group => {
      const couples = coupleGroups.filter(couple => 
        couple.some(id => group.some(node => String(node.id) === id))
      );
      const singles = group.filter(node => 
        nodeToCoupleIdx[node.id] === undefined
      );
      return couples.length * 2 + singles.length;
    })
  );
  
  const baseSpacing = 200;
  const coupleSpacing = 150;
  const generationSpacing = 300;
  
  return {
    nodeSpacing: Math.max(baseSpacing, 1200 / maxGenerationWidth),
    coupleSpacing,
    generationSpacing,
    maxWidth: maxGenerationWidth * baseSpacing
  };
};

/**
 * Center children between their parents
 * @param {Array} flowNodes - Array of positioned nodes
 * @param {Object} childToParents - Map of child to parent relationships
 * @returns {Array} - Updated flow nodes with centered children
 */
export const centerChildrenBetweenParents = (flowNodes, childToParents) => {
  const idToNode = Object.fromEntries(flowNodes.map(node => [node.id, node]));
  
  flowNodes.forEach(node => {
    const parents = (childToParents[node.id] || [])
      .map(parentId => idToNode[parentId])
      .filter(Boolean);
    
    if (parents.length > 1) {
      // Center between multiple parents
      const avgX = parents.reduce((sum, parent) => sum + parent.position.x, 0) / parents.length;
      node.position.x = avgX;
    } else if (parents.length === 1) {
      // Single parent: slight offset to avoid overlap
      const parent = parents[0];
      const siblings = Object.keys(childToParents).filter(childId => 
        childToParents[childId].includes(parent.id) && childId !== node.id
      );
      
      if (siblings.length > 0) {
        const offset = (siblings.indexOf(node.id) - siblings.length / 2) * 100;
        node.position.x = parent.position.x + offset;
      }
    }
  });
  
  return flowNodes;
};

/**
 * Create color-coded edges with branch-specific colors
 * @param {Array} edges - Array of relationship edges
 * @param {Array} nodes - Array of person nodes
 * @returns {Array} - Array of styled flow edges
 */
export const createColorCodedEdges = (edges, nodes) => {
  const nodeIds = new Set(nodes.map(node => String(node.id)));
  
  // Filter valid edges
  const validEdges = edges.filter(edge => {
    const source = String(edge.source || edge.from);
    const target = String(edge.target || edge.to);
    return nodeIds.has(source) && nodeIds.has(target);
  });
  
  // Group edges by family branches
  const familyBranches = new Map();
  let branchIndex = 0;
  
  validEdges.forEach(edge => {
    const source = String(edge.source || edge.from);
    const target = String(edge.target || edge.to);
    const edgeKey = `${source}-${target}`;
    
    if (!familyBranches.has(edgeKey)) {
      familyBranches.set(edgeKey, branchIndex++);
    }
  });
  
  // Create styled edges
  const flowEdges = validEdges.map((edge, index) => {
    const source = String(edge.source || edge.from);
    const target = String(edge.target || edge.to);
    const edgeKey = `${source}-${target}`;
    const branchIdx = familyBranches.get(edgeKey);
    
    let edgeStyle = {
      stroke: generateBranchColor(branchIdx),
      strokeWidth: edge.type === 'spouse' ? 3 : 2,
    };
    
    // Different styles for different relationship types
    if (edge.type === 'spouse') {
      edgeStyle = {
        ...edgeStyle,
        strokeDasharray: '5 5',
      };
    } else if (edge.type === 'parent' || edge.type === 'child') {
      edgeStyle = {
        ...edgeStyle,
        strokeWidth: 2,
      };
    }
    
    return {
      id: `edge-${source}-${target}-${index}`,
      source,
      target,
      type: 'smoothstep',
      animated: false,
      style: edgeStyle,
      label: edge.type,
      markerEnd: edge.type === 'parent' ? {
        type: 'arrowclosed',
        color: edgeStyle.stroke,
      } : undefined,
    };
  });
  
  return flowEdges;
};

/**
 * Enhanced Family Tree Layout Algorithm
 * @param {Array} nodes - Array of person nodes
 * @param {Array} edges - Array of relationship edges
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - Flow nodes and edges with enhanced layout
 */
export const familyTreeLayout = (nodes, edges, handlers = {}) => {
  if (!nodes || !edges) {
    return { flowNodes: [], flowEdges: [] };
  }
  
  // Step 1: Calculate generations
  const generationMap = calculateGenerations(nodes, edges);
  
  // Step 2: Group nodes by generation
  const generationGroups = {};
  nodes.forEach(node => {
    const generation = generationMap[node.id] ?? 0;
    if (!generationGroups[generation]) {
      generationGroups[generation] = [];
    }
    generationGroups[generation].push(node);
  });
  
  // Step 3: Group couples
  const { coupleGroups, nodeToCoupleIdx } = groupCouples(nodes, edges);
  
  // Step 4: Calculate intelligent spacing
  const spacing = calculateIntelligentSpacing(generationGroups, nodeToCoupleIdx, coupleGroups);
  
  // Step 5: Position nodes with family-aware spacing
  const flowNodes = [];
  
  Object.entries(generationGroups).forEach(([generation, group]) => {
    const gen = parseInt(generation);
    const couples = [];
    const singles = [];
    
    // Separate couples and singles
    group.forEach(node => {
      if (nodeToCoupleIdx[node.id] !== undefined) {
        const coupleIdx = nodeToCoupleIdx[node.id];
        if (!couples[coupleIdx]) couples[coupleIdx] = [];
        couples[coupleIdx].push(node);
      } else {
        singles.push(node);
      }
    });
    
    let currentX = -(spacing.maxWidth / 2);
    
    // Position couples
    couples.forEach(couple => {
      if (couple && couple.length > 0) {
        couple.forEach((node, index) => {
          flowNodes.push({
            id: String(node.id),
            type: 'custom',
            data: { person: node, ...handlers },
            position: {
              x: currentX + (index * spacing.coupleSpacing),
              y: gen * spacing.generationSpacing
            },
            draggable: true,
          });
        });
        currentX += spacing.nodeSpacing;
      }
    });
    
    // Position singles
    singles.forEach(node => {
      flowNodes.push({
        id: String(node.id),
        type: 'custom',
        data: { person: node, ...handlers },
        position: {
          x: currentX,
          y: gen * spacing.generationSpacing
        },
        draggable: true,
      });
      currentX += spacing.nodeSpacing;
    });
  });
  
  // Step 6: Center children between parents
  const childToParents = {};
  edges.forEach(edge => {
    if (edge.type === 'parent' || edge.type === 'child') {
      const parentId = edge.type === 'parent' ? edge.source : edge.target;
      const childId = edge.type === 'parent' ? edge.target : edge.source;
      
      if (!childToParents[childId]) childToParents[childId] = [];
      childToParents[childId].push(parentId);
    }
  });
  
  const centeredNodes = centerChildrenBetweenParents(flowNodes, childToParents);
  
  // Step 7: Create color-coded edges
  const flowEdges = createColorCodedEdges(edges, nodes);
  
  return {
    flowNodes: centeredNodes,
    flowEdges,
  };
};

export default familyTreeLayout;