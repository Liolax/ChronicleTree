/**
 * Visual Configuration Module
 * Applies styling and visual enhancements to improve tree readability
 * Handles complex relationship visual indicators
 */

/**
 * Node Visual Enhancement Function
 * Applies styling based on the complexity of person's relationships
 * @param {Object} node - The node to style
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} edges - Array of edges
 * @returns {Object} - Enhanced node with visual styling
 */
export function enhanceNodeVisuals(node, relationshipMaps, edges) {
  const enhancedNode = { ...node };
  
  // Calculate how many relationships this person has
  const complexity = calculateRelationshipComplexity(node.id, relationshipMaps, edges);
  
  // Style the node based on relationship complexity
  enhancedNode.style = {
    ...enhancedNode.style,
    ...getComplexityBasedStyle(complexity),
  };
  
  // Add special visual markers for highly connected people
  if (complexity.isComplex) {
    enhancedNode.data = {
      ...enhancedNode.data,
      hasComplexRelationships: true,
      relationshipCount: complexity.relationshipCount,
      relationshipTypes: complexity.types,
    };
  }
  
  return enhancedNode;
}

/**
 * Determine the actual relationship type from edge ID and properties
 * @param {Object} edge - The edge to analyze
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {string} - The relationship type
 */
function determineRelationshipType(edge, relationshipMaps) {
  const edgeId = edge.id;
  const sourceId = edge.source;
  const targetId = edge.target;
  
  // Check edge ID patterns to determine relationship type
  if (edgeId.startsWith('parent-')) {
    // For parent-child relationships, we use "parent" as the canonical type
    // since both directions represent the same relationship in the legend
    return 'parent';
  }
  
  if (edgeId.startsWith('spouse-')) {
    // Check the current edge style/color to determine spouse type
    const currentColor = edge.style?.stroke;
    
    // Match colors from existing Connection Legend
    if (currentColor === '#ec4899') return 'spouse'; // Pink = current spouse
    if (currentColor === '#9ca3af') return 'ex-spouse'; // Gray = ex-spouse  
    if (currentColor === '#000000') return 'late-spouse'; // Black = late spouse
    
    return 'spouse'; // Default to current spouse
  }
  
  if (edgeId.startsWith('sibling-')) {
    // Check if these are siblings with no parents
    const sourceParents = relationshipMaps.childToParents?.get(sourceId);
    const targetParents = relationshipMaps.childToParents?.get(targetId);
    
    const sourceHasNoParents = !sourceParents || sourceParents.size === 0;
    const targetHasNoParents = !targetParents || targetParents.size === 0;
    
    if (sourceHasNoParents && targetHasNoParents) {
      return 'sibling-no-parents';
    }
    
    return 'sibling';
  }
  
  // Check relationship maps for other types
  if (relationshipMaps.parentToChildren?.get(sourceId)?.has(targetId)) {
    return 'parent';
  }
  
  if (relationshipMaps.childToParents?.get(targetId)?.has(sourceId)) {
    return 'child';
  }
  
  if (relationshipMaps.spouseMap?.get(sourceId) === targetId) {
    return 'spouse';
  }
  
  if (relationshipMaps.exSpouseMap?.get(sourceId)?.has(targetId)) {
    return 'ex-spouse';
  }
  
  if (relationshipMaps.siblingMap?.get(sourceId)?.has(targetId)) {
    return 'sibling';
  }
  
  return 'unknown';
}

/**
 * Calculate the relationship complexity of a node
 * @param {string} nodeId - ID of the node
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} edges - Array of edges
 * @returns {Object} - Complexity information
 */
function calculateRelationshipComplexity(nodeId, relationshipMaps, edges) {
  let relationshipCount = 0;
  const relationshipTypes = new Set();
  
  // Count direct relationships
  if (relationshipMaps.parentToChildren?.has(nodeId)) {
    relationshipCount++;
    relationshipTypes.add('parent');
  }
  
  if (relationshipMaps.childToParents?.has(nodeId)) {
    relationshipCount++;
    relationshipTypes.add('child');
  }
  
  if (relationshipMaps.spouseMap?.has(nodeId)) {
    relationshipCount++;
    relationshipTypes.add('spouse');
  }
  
  if (relationshipMaps.siblingMap?.has(nodeId)) {
    relationshipCount++;
    relationshipTypes.add('sibling');
  }
  
  if (relationshipMaps.exSpouseMap?.has(nodeId)) {
    relationshipCount++;
    relationshipTypes.add('ex-spouse');
  }
  
  // Count edge-based relationships
  const edgeTypes = new Set();
  edges.forEach(edge => {
    if (edge.source === nodeId || edge.target === nodeId) {
      const relType = edge.data?.relationshipType || edge.type || 'connection';
      edgeTypes.add(relType);
    }
  });
  
  const totalTypes = new Set([...relationshipTypes, ...edgeTypes]);
  
  return {
    relationshipCount,
    edgeCount: edgeTypes.size,
    totalRelationshipTypes: totalTypes.size,
    types: Array.from(totalTypes),
    isComplex: relationshipCount >= 3 || totalTypes.size >= 4,
    isHighlyComplex: relationshipCount >= 4 || totalTypes.size >= 6
  };
}

/**
 * Get visual styling based on relationship complexity
 * @param {Object} complexity - Complexity information
 * @returns {Object} - CSS style object
 */
function getComplexityBasedStyle(complexity) {
  const baseStyle = {
    transition: 'all 0.3s ease',
  };
  
  if (complexity.isHighlyComplex) {
    // Highly complex nodes get distinctive styling
    return {
      ...baseStyle,
      border: '3px solid #dc2626',
      boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      borderRadius: '12px',
    };
  } else if (complexity.isComplex) {
    // Complex nodes get moderate highlighting
    return {
      ...baseStyle,
      border: '2px solid #f59e0b',
      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)',
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderRadius: '8px',
    };
  }
  
  // Simple nodes get standard styling
  return {
    ...baseStyle,
    border: '1px solid #d1d5db',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '6px',
  };
}

/**
 * Enhanced edge styling for better relationship visualization
 * @param {Array} edges - Array of edges
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Enhanced edges with better styling
 */
export function enhanceEdgeVisuals(edges, relationshipMaps) {
  return edges.map(edge => {
    const enhancedEdge = { ...edge };
    
    // Determine the actual relationship type from the edge ID and properties
    const relationshipType = determineRelationshipType(edge, relationshipMaps);
    
    // Determine edge importance and complexity
    const edgeComplexity = getEdgeComplexity(edge, relationshipMaps);
    edgeComplexity.relationshipType = relationshipType;
    edgeComplexity.color = getRelationshipColor(relationshipType);
    edgeComplexity.weight = getRelationshipWeight(relationshipType);
    
    // Apply styling based on relationship type and complexity
    const relationshipStyle = getEdgeStyle(relationshipType, edgeComplexity);
    
    enhancedEdge.style = {
      ...enhancedEdge.style,
      ...relationshipStyle,
    };
    
    // Update marker color to match relationship
    if (enhancedEdge.markerEnd) {
      enhancedEdge.markerEnd = {
        ...enhancedEdge.markerEnd,
        color: edgeComplexity.color,
      };
    }
    
    // Store relationship type in edge data for debugging
    enhancedEdge.data = {
      ...enhancedEdge.data,
      relationshipType: relationshipType,
    };
    
    return enhancedEdge;
  });
}

/**
 * Determine edge complexity based on relationship type
 * @param {Object} edge - The edge to analyze
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Object} - Complexity information
 */
function getEdgeComplexity(edge, relationshipMaps) {
  const sourceId = edge.source;
  const targetId = edge.target;
  
  // Count how many different relationship types exist between these nodes
  let connectionCount = 0;
  
  // Check if they have multiple relationship types
  if (relationshipMaps.parentToChildren?.get(sourceId)?.has(targetId)) connectionCount++;
  if (relationshipMaps.childToParents?.get(sourceId)?.has(targetId)) connectionCount++;
  if (relationshipMaps.spouseMap?.get(sourceId) === targetId) connectionCount++;
  if (relationshipMaps.siblingMap?.get(sourceId)?.has(targetId)) connectionCount++;
  
  const relationshipType = edge.type || edge.data?.relationshipType || 'unknown';
  
  return {
    connectionCount,
    isComplex: connectionCount >= 2,
    relationshipType,
    color: getRelationshipColor(relationshipType),
    weight: getRelationshipWeight(relationshipType)
  };
}

/**
 * Get visual styling for edges based on relationship type - Updated to match Connection Legend
 * @param {string} relationshipType - Type of relationship
 * @param {Object} complexity - Complexity information
 * @returns {Object} - CSS style object for edges
 */
function getEdgeStyle(relationshipType, complexity) {
  const baseStyle = {
    strokeWidth: complexity.weight,
    stroke: complexity.color,
    opacity: complexity.isComplex ? 0.9 : 0.8,
  };
  
  // Special styling matching your Connection Legend exactly
  switch (relationshipType) {
    case 'parent':
    case 'child':
      return {
        ...baseStyle,
        strokeDasharray: '0', // Solid line for parent-child (matches legend)
      };
    
    case 'spouse':
    case 'current-spouse':
      return {
        ...baseStyle,
        strokeDasharray: '5,3', // Dashed for current spouse (matches legend)
        strokeWidth: complexity.weight,
      };
    
    case 'ex-spouse':
      return {
        ...baseStyle,
        strokeDasharray: '5,3', // Dashed for ex-spouse (matches legend)
      };
    
    case 'late-spouse':
    case 'deceased-spouse':
      return {
        ...baseStyle,
        strokeDasharray: '5,3', // Dashed for late spouse (matches legend)
      };
    
    case 'sibling':
    case 'sibling-no-parents':
      return {
        ...baseStyle,
        strokeDasharray: '2,2', // Dotted for siblings no parents (matches legend)
      };
    
    case 'half-sibling':
      return {
        ...baseStyle,
        strokeDasharray: '3,2', // Different pattern for half-siblings
      };
    
    case 'step':
    case 'step-parent':
    case 'step-child':
    case 'step-sibling':
      return {
        ...baseStyle,
        strokeDasharray: '8,3,2,3', // Dash-dot for step relationships
      };
    
    default:
      return baseStyle;
  }
}

/**
 * Get color for relationship type - Updated to match Connection Legend
 * @param {string} relationshipType - Type of relationship
 * @returns {string} - CSS color value
 */
function getRelationshipColor(relationshipType) {
  const colorMap = {
    // Match your Connection Legend colors exactly
    'parent': '#6366f1',     // Indigo for parent-child (matches your legend)
    'child': '#6366f1',      // Indigo for parent-child (matches your legend)
    'spouse': '#ec4899',     // Pink for current spouse (matches your legend)
    'current-spouse': '#ec4899', // Pink for current spouse
    'ex-spouse': '#9ca3af',  // Gray for ex-spouse (matches your legend)
    'late-spouse': '#000000', // Black for late spouse (matches your legend)
    'deceased-spouse': '#000000', // Black for deceased spouse
    'sibling': '#3b82f6',    // Blue for siblings no parents (matches your legend)
    'sibling-no-parents': '#3b82f6', // Blue for siblings no parents
    
    // Additional relationship types
    'step': '#f59e0b',       // Orange for step relationships (complementary)
    'step-parent': '#f59e0b',
    'step-child': '#f59e0b',
    'step-sibling': '#f59e0b',
    'half-sibling': '#7c3aed', // Purple for half-siblings (distinct from full siblings)
    'adopted': '#10b981',    // Green for adopted relationships
    'foster': '#f97316',     // Orange for foster relationships
  };
  
  return colorMap[relationshipType] || '#6b7280'; // Default gray
}

/**
 * Get stroke weight for relationship type - Updated for better visual hierarchy
 * @param {string} relationshipType - Type of relationship
 * @returns {number} - Stroke width
 */
function getRelationshipWeight(relationshipType) {
  const weightMap = {
    // Primary relationships - thicker lines
    'parent': 2.5,
    'child': 2.5,
    'spouse': 2.5,
    'current-spouse': 2.5,
    
    // Secondary relationships - medium lines
    'sibling': 2,
    'sibling-no-parents': 2,
    'ex-spouse': 2,
    'late-spouse': 2,
    'deceased-spouse': 2,
    'half-sibling': 2,
    
    // Tertiary relationships - thinner lines
    'step': 1.5,
    'step-parent': 1.5,
    'step-child': 1.5,
    'step-sibling': 1.5,
    'adopted': 1.5,
    'foster': 1.5,
  };
  
  return weightMap[relationshipType] || 1.5;
}

/**
 * Apply spacing adjustments based on visual complexity
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Nodes with visual-complexity-based spacing
 */
export function applyVisualComplexitySpacing(nodes, edges, relationshipMaps) {
  const adjustedNodes = nodes.map(node => ({ ...node, position: { ...node.position } }));
  
  // Find visually complex nodes
  const complexNodes = adjustedNodes.filter(node => {
    const complexity = calculateRelationshipComplexity(node.id, relationshipMaps, edges);
    return complexity.isComplex || complexity.isHighlyComplex;
  });
  
  // Add extra spacing around complex nodes
  complexNodes.forEach(complexNode => {
    const extraSpacing = 40;
    
    // Find nearby nodes and push them away
    adjustedNodes.forEach(otherNode => {
      if (otherNode.id === complexNode.id) return;
      
      const distance = Math.sqrt(
        Math.pow(otherNode.position.x - complexNode.position.x, 2) +
        Math.pow(otherNode.position.y - complexNode.position.y, 2)
      );
      
      // If nodes are too close, add spacing
      if (distance < 400) {
        const dx = otherNode.position.x - complexNode.position.x;
        const dy = otherNode.position.y - complexNode.position.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Primarily horizontal separation
          otherNode.position.x += dx > 0 ? extraSpacing : -extraSpacing;
        } else {
          // Primarily vertical separation  
          otherNode.position.y += dy > 0 ? extraSpacing / 2 : -extraSpacing / 2;
        }
      }
    });
  });
  
  return adjustedNodes;
}