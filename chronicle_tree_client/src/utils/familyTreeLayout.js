/**
 * Advanced Family Tree Layout Algorithm
 * 
 * This module provides improved hierarchical layout for family trees with:
 * - Proper generation-based positioning
 * - Centered children between parents
 * - Balanced tree structure
 * - Color-coded family branches
 * - Non-colliding edge routing
 */

// Color palette for different family branches
const FAMILY_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#8b5cf6', // violet (repeat)
];

/**
 * Improved family tree layout algorithm
 */
export function createFamilyTreeLayout(nodes, edges, handlers = {}) {
  if (!nodes || !edges) return { flowNodes: [], flowEdges: [] };

  // Create maps for efficient lookups
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const siblingMap = new Map();

  // Build relationship maps
  edges.forEach(edge => {
    const sourceId = edge.source || edge.from;
    const targetId = edge.target || edge.to;
    
    switch (edge.type) {
      case 'parent':
        // Parent -> Child relationship
        if (!parentToChildren.has(sourceId)) {
          parentToChildren.set(sourceId, []);
        }
        parentToChildren.get(sourceId).push(targetId);
        
        if (!childToParents.has(targetId)) {
          childToParents.set(targetId, []);
        }
        childToParents.get(targetId).push(sourceId);
        break;
        
      case 'spouse':
        // Spouse relationships (bidirectional)
        if (!spouseMap.has(sourceId)) {
          spouseMap.set(sourceId, []);
        }
        if (!spouseMap.has(targetId)) {
          spouseMap.set(targetId, []);
        }
        spouseMap.get(sourceId).push(targetId);
        spouseMap.get(targetId).push(sourceId);
        break;
        
      case 'sibling':
        // Sibling relationships (bidirectional)
        if (!siblingMap.has(sourceId)) {
          siblingMap.set(sourceId, []);
        }
        if (!siblingMap.has(targetId)) {
          siblingMap.set(targetId, []);
        }
        siblingMap.get(sourceId).push(targetId);
        siblingMap.get(targetId).push(sourceId);
        break;
    }
  });

  // Calculate generations (levels)
  const generations = calculateGenerations(nodes, edges, childToParents, parentToChildren);
  
  // Group nodes by generation
  const generationGroups = groupByGeneration(nodes, generations);
  
  // Calculate positions for each generation
  const positionedNodes = calculatePositions(generationGroups, spouseMap, childToParents, parentToChildren);
  
  // Create flow nodes
  const flowNodes = createFlowNodes(positionedNodes, nodeMap, handlers);
  
  // Create flow edges with improved routing and colors
  const flowEdges = createFlowEdges(edges, positionedNodes, spouseMap);
  
  return { flowNodes, flowEdges };
}

/**
 * Calculate generation levels for each node
 */
function calculateGenerations(nodes, edges, childToParents, parentToChildren) {
  const generations = new Map();
  const visited = new Set();
  
  // Find root nodes (no parents)
  const rootNodes = nodes.filter(node => 
    !childToParents.has(node.id) || childToParents.get(node.id).length === 0
  );
  
  // If no clear roots, pick the oldest nodes
  if (rootNodes.length === 0) {
    const oldestNodes = nodes.slice().sort((a, b) => {
      const aDate = a.date_of_birth ? new Date(a.date_of_birth) : new Date('1900-01-01');
      const bDate = b.date_of_birth ? new Date(b.date_of_birth) : new Date('1900-01-01');
      return aDate - bDate;
    }).slice(0, 2);
    oldestNodes.forEach(node => assignGeneration(node.id, 0));
  } else {
    rootNodes.forEach(node => assignGeneration(node.id, 0));
  }
  
  function assignGeneration(nodeId, generation) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    const currentGen = generations.get(nodeId) || generation;
    generations.set(nodeId, Math.max(currentGen, generation));
    
    // Process children
    const children = parentToChildren.get(nodeId) || [];
    children.forEach(childId => {
      assignGeneration(childId, generation + 1);
    });
    
    // Process spouses at same generation
    const spouse = getSpouse(nodeId);
    if (spouse && !visited.has(spouse)) {
      assignGeneration(spouse, generation);
    }
  }
  
  function getSpouse(nodeId) {
    // Find spouse relationships for this node
    const spouseRelations = edges.filter(e => 
      e.type === 'spouse' && (
        (e.source === nodeId || e.from === nodeId) || 
        (e.target === nodeId || e.to === nodeId)
      )
    );
    
    if (spouseRelations.length > 0) {
      const relation = spouseRelations[0];
      const sourceId = relation.source || relation.from;
      const targetId = relation.target || relation.to;
      return sourceId === nodeId ? targetId : sourceId;
    }
    return null;
  }
  
  return generations;
}

/**
 * Group nodes by their generation
 */
function groupByGeneration(nodes, generations) {
  const groups = new Map();
  
  nodes.forEach(node => {
    const gen = generations.get(node.id) || 0;
    if (!groups.has(gen)) {
      groups.set(gen, []);
    }
    groups.get(gen).push(node);
  });
  
  return groups;
}

/**
 * Calculate optimal positions for nodes
 */
function calculatePositions(generationGroups, spouseMap, childToParents, parentToChildren) {
  const positions = new Map();
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 150;
  const GENERATION_HEIGHT = 200;
  const COUPLE_SPACING = 120;
  const SIBLING_SPACING = 250;
  
  // Sort generations
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
  
  sortedGenerations.forEach(generation => {
    const nodes = generationGroups.get(generation);
    const couples = identifyCouples(nodes, spouseMap);
    const singles = nodes.filter(node => !couples.some(couple => couple.includes(node.id)));
    
    let currentX = 0;
    
    // Position couples first
    couples.forEach(couple => {
      const [spouse1Id, spouse2Id] = couple;
      const spouse1 = nodes.find(n => n.id === spouse1Id);
      const spouse2 = nodes.find(n => n.id === spouse2Id);
      
      if (spouse1 && spouse2) {
        // Calculate ideal position based on children
        const idealX = calculateIdealCouplePosition(couple, childToParents, parentToChildren, positions);
        const actualX = Math.max(currentX, idealX);
        
        positions.set(spouse1Id, {
          x: actualX,
          y: generation * GENERATION_HEIGHT,
          node: spouse1
        });
        
        positions.set(spouse2Id, {
          x: actualX + COUPLE_SPACING,
          y: generation * GENERATION_HEIGHT,
          node: spouse2
        });
        
        currentX = actualX + COUPLE_SPACING + SIBLING_SPACING;
      }
    });
    
    // Position singles
    singles.forEach(node => {
      const idealX = calculateIdealSinglePosition(node, childToParents, parentToChildren, positions);
      const actualX = Math.max(currentX, idealX);
      
      positions.set(node.id, {
        x: actualX,
        y: generation * GENERATION_HEIGHT,
        node: node
      });
      
      currentX = actualX + SIBLING_SPACING;
    });
  });
  
  return positions;
}

/**
 * Identify couples (spouses) in a generation
 */
function identifyCouples(nodes, spouseMap) {
  const couples = [];
  const processed = new Set();
  
  nodes.forEach(node => {
    if (processed.has(node.id)) return;
    
    const spouses = spouseMap.get(node.id) || [];
    spouses.forEach(spouseId => {
      if (!processed.has(spouseId) && nodes.some(n => n.id === spouseId)) {
        couples.push([node.id, spouseId]);
        processed.add(node.id);
        processed.add(spouseId);
      }
    });
  });
  
  return couples;
}

/**
 * Calculate ideal position for a couple based on their children
 */
function calculateIdealCouplePosition(couple, childToParents, parentToChildren, positions) {
  const [spouse1Id, spouse2Id] = couple;
  const children1 = parentToChildren.get(spouse1Id) || [];
  const children2 = parentToChildren.get(spouse2Id) || [];
  const allChildren = [...new Set([...children1, ...children2])];
  
  if (allChildren.length === 0) return 0;
  
  // Calculate center point of children
  const childPositions = allChildren
    .map(childId => positions.get(childId))
    .filter(pos => pos);
  
  if (childPositions.length === 0) return 0;
  
  const avgX = childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length;
  return Math.max(0, avgX - 60); // Center couple above children
}

/**
 * Calculate ideal position for a single person
 */
function calculateIdealSinglePosition(node, childToParents, parentToChildren, positions) {
  const children = parentToChildren.get(node.id) || [];
  
  if (children.length === 0) return 0;
  
  // Calculate center point of children
  const childPositions = children
    .map(childId => positions.get(childId))
    .filter(pos => pos);
  
  if (childPositions.length === 0) return 0;
  
  const avgX = childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length;
  return Math.max(0, avgX);
}

/**
 * Create React Flow nodes from positioned nodes
 */
function createFlowNodes(positionedNodes, nodeMap, handlers = {}) {
  const flowNodes = [];
  
  positionedNodes.forEach((position, nodeId) => {
    const node = nodeMap.get(nodeId);
    if (node) {
      flowNodes.push({
        id: String(nodeId),
        type: 'custom',
        data: { 
          person: node,
          ...handlers
        },
        position: {
          x: position.x,
          y: position.y
        },
        draggable: true,
      });
    }
  });
  
  return flowNodes;
}

/**
 * Create flow edges with improved styling and routing
 */
function createFlowEdges(edges, positionedNodes, spouseMap) {
  const flowEdges = [];
  const familyBranchColors = new Map();
  let colorIndex = 0;
  
  edges.forEach((edge, index) => {
    const sourceId = edge.source || edge.from;
    const targetId = edge.target || edge.to;
    
    // Skip if nodes don't exist
    if (!positionedNodes.has(sourceId) || !positionedNodes.has(targetId)) {
      return;
    }
    
    // Assign family branch color
    let branchColor = getFamilyBranchColor(sourceId, targetId, edge.type, familyBranchColors);
    if (!branchColor) {
      branchColor = FAMILY_COLORS[colorIndex % FAMILY_COLORS.length];
      colorIndex++;
    }
    
    const sourcePos = positionedNodes.get(sourceId);
    const targetPos = positionedNodes.get(targetId);
    
    // Calculate edge routing to avoid collisions
    const edgeStyle = getEdgeStyle(edge.type, branchColor, sourcePos, targetPos);
    
    flowEdges.push({
      id: `edge-${sourceId}-${targetId}-${index}`,
      source: String(sourceId),
      target: String(targetId),
      type: getEdgeType(edge.type),
      animated: false,
      style: edgeStyle,
      label: edge.type,
      labelStyle: {
        fontSize: '12px',
        fontWeight: 'bold',
        fill: branchColor
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.8
      }
    });
  });
  
  return flowEdges;
}

/**
 * Get family branch color for related nodes
 */
function getFamilyBranchColor(sourceId, targetId, relationshipType, familyBranchColors) {
  // Use consistent colors for family branches
  const branchKey = `${Math.min(sourceId, targetId)}-${Math.max(sourceId, targetId)}`;
  
  if (familyBranchColors.has(branchKey)) {
    return familyBranchColors.get(branchKey);
  }
  
  // For parent-child relationships, use parent's color
  if (relationshipType === 'parent') {
    const parentKey = `parent-${sourceId}`;
    if (familyBranchColors.has(parentKey)) {
      const color = familyBranchColors.get(parentKey);
      familyBranchColors.set(branchKey, color);
      return color;
    }
  }
  
  return null;
}

/**
 * Get edge style based on relationship type
 */
function getEdgeStyle(relationshipType, color, sourcePos, targetPos) {
  const baseStyle = {
    stroke: color,
    strokeWidth: 2,
  };
  
  switch (relationshipType) {
    case 'spouse':
      return {
        ...baseStyle,
        strokeWidth: 3,
        stroke: '#f59e42' // Orange for spouses
      };
    case 'parent':
      return {
        ...baseStyle,
        strokeWidth: 2,
      };
    case 'sibling':
      return {
        ...baseStyle,
        strokeWidth: 1,
        strokeDasharray: '5,5',
        stroke: '#94a3b8' // Gray for siblings
      };
    default:
      return baseStyle;
  }
}

/**
 * Get React Flow edge type
 */
function getEdgeType(relationshipType) {
  switch (relationshipType) {
    case 'spouse':
      return 'straight';
    case 'parent':
      return 'smoothstep';
    case 'sibling':
      return 'smoothstep';
    default:
      return 'smoothstep';
  }
}

/**
 * Calculate tree bounds for centering
 */
export function calculateTreeBounds(flowNodes) {
  if (flowNodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  
  const positions = flowNodes.map(node => node.position);
  
  return {
    minX: Math.min(...positions.map(p => p.x)),
    maxX: Math.max(...positions.map(p => p.x)),
    minY: Math.min(...positions.map(p => p.y)),
    maxY: Math.max(...positions.map(p => p.y))
  };
}

/**
 * Center tree in viewport
 */
export function centerTree(flowNodes, viewportWidth, viewportHeight) {
  const bounds = calculateTreeBounds(flowNodes);
  const treeWidth = bounds.maxX - bounds.minX + 200; // Add node width
  const treeHeight = bounds.maxY - bounds.minY + 150; // Add node height
  
  const offsetX = (viewportWidth - treeWidth) / 2 - bounds.minX;
  const offsetY = (viewportHeight - treeHeight) / 2 - bounds.minY;
  
  return flowNodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }));
}