/**
 * Visual configuration for family tree to enhance readability
 * Especially for complex relationships that tend to overlap
 */

/**
 * Enhanced visual styling for nodes based on relationship complexity
 * @param {Object} node - The node to style
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} edges - Array of edges
 * @returns {Object} - Enhanced node with visual styling
 */
export function enhanceNodeVisuals(node, relationshipMaps, edges) {
  const enhancedNode = { ...node };
  
  // Determine relationship complexity for this node
  const complexity = calculateRelationshipComplexity(node.id, relationshipMaps, edges);
  
  // Apply visual enhancements based on complexity
  enhancedNode.style = {
    ...enhancedNode.style,
    ...getComplexityBasedStyle(complexity),
  };
  
  // Add visual indicators for complex relationships
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
    
    // Determine edge importance and complexity
    const edgeComplexity = getEdgeComplexity(edge, relationshipMaps);
    
    // Apply styling based on relationship type and complexity
    enhancedEdge.style = {
      ...enhancedEdge.style,
      ...getEdgeStyle(edge.type || edge.data?.relationshipType, edgeComplexity),
    };
    
    // Add visual markers for complex connections
    if (edgeComplexity.isComplex) {
      enhancedEdge.markerEnd = {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: edgeComplexity.color,
      };
    }
    
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
 * Get visual styling for edges based on relationship type
 * @param {string} relationshipType - Type of relationship
 * @param {Object} complexity - Complexity information
 * @returns {Object} - CSS style object for edges
 */
function getEdgeStyle(relationshipType, complexity) {
  const baseStyle = {
    strokeWidth: complexity.weight,
    stroke: complexity.color,
    opacity: complexity.isComplex ? 0.9 : 0.7,
  };
  
  // Special styling for different relationship types
  switch (relationshipType) {
    case 'parent':
    case 'child':
      return {
        ...baseStyle,
        strokeDasharray: '0', // Solid line for parent-child
      };
    
    case 'spouse':
      return {
        ...baseStyle,
        strokeDasharray: '0',
        strokeWidth: complexity.weight + 1, // Thicker for spouses
      };
    
    case 'sibling':
      return {
        ...baseStyle,
        strokeDasharray: '5,5', // Dashed for siblings
      };
    
    case 'step':
    case 'step-parent':
    case 'step-child':
      return {
        ...baseStyle,
        strokeDasharray: '10,5,2,5', // Dash-dot for step relationships
      };
    
    default:
      return baseStyle;
  }
}

/**
 * Get color for relationship type
 * @param {string} relationshipType - Type of relationship
 * @returns {string} - CSS color value
 */
function getRelationshipColor(relationshipType) {
  const colorMap = {
    'parent': '#dc2626',     // Red for parent-child
    'child': '#dc2626',
    'spouse': '#059669',     // Green for marriage
    'sibling': '#2563eb',    // Blue for siblings
    'step': '#f59e0b',       // Orange for step relationships
    'step-parent': '#f59e0b',
    'step-child': '#f59e0b',
    'ex-spouse': '#9333ea',  // Purple for ex relationships
    'deceased': '#6b7280',   // Gray for deceased
  };
  
  return colorMap[relationshipType] || '#6b7280';
}

/**
 * Get stroke weight for relationship type
 * @param {string} relationshipType - Type of relationship
 * @returns {number} - Stroke width
 */
function getRelationshipWeight(relationshipType) {
  const weightMap = {
    'parent': 3,
    'child': 3,
    'spouse': 4,
    'sibling': 2,
    'step': 2,
    'step-parent': 2,
    'step-child': 2,
    'ex-spouse': 2,
    'deceased': 1,
  };
  
  return weightMap[relationshipType] || 1;
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