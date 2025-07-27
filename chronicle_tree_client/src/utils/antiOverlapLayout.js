/**
 * Anti-Overlap System - Advanced Algorithm Implementation
 * Prevents family tree nodes from overlapping each other
 * Uses collision detection and force-based positioning
 */

/**
 * Main Overlap Prevention Function
 * Detects and resolves overlapping nodes in the family tree layout
 * Uses iterative positioning with collision detection algorithms
 * @param {Array} nodes - Tree nodes that might be overlapping
 * @param {Array} edges - Connection lines between nodes
 * @param {Object} relationshipMaps - Lookup tables for family relationships
 * @param {Array} persons - Person data from database
 * @returns {Array} - Fixed node positions with no overlaps
 */
export function preventNodeOverlap(nodes, edges, relationshipMaps, persons) {
  // Layout configuration constants for node spacing
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 120;
  const MIN_HORIZONTAL_SPACING = 80;  // Increased minimum space between nodes horizontally
  const MIN_VERTICAL_SPACING = 60;    // Increased minimum space between nodes vertically
  const COMPLEX_RELATIONSHIP_SPACING = 160; // Increased extra spacing for complex relationships
  
  // Step 1: Identify nodes with complex relationships
  const complexNodes = identifyComplexRelationshipNodes(nodes, edges, relationshipMaps, persons);
  
  // Step 2: Detect collisions
  const collisions = detectCollisions(nodes, NODE_WIDTH, NODE_HEIGHT, MIN_HORIZONTAL_SPACING, MIN_VERTICAL_SPACING);
  
  // Step 3: Resolve collisions using multiple iterations of force-directed adjustment
  let adjustedNodes = [...nodes];
  let iterations = 0;
  const maxIterations = 5;
  
  // Apply multiple iterations until no collisions remain or max iterations reached
  while (iterations < maxIterations) {
    const currentCollisions = detectCollisions(adjustedNodes, NODE_WIDTH, NODE_HEIGHT, MIN_HORIZONTAL_SPACING, MIN_VERTICAL_SPACING);
    
    if (currentCollisions.length === 0) {
      break; // No more collisions, we're done
    }
    
    adjustedNodes = resolveCollisions(adjustedNodes, currentCollisions, complexNodes, MIN_HORIZONTAL_SPACING);
    iterations++;
  }
  
  // Step 4: Fine-tune positioning for visual balance
  const balancedNodes = balanceNodePositions(adjustedNodes, NODE_WIDTH, MIN_HORIZONTAL_SPACING);
  
  return balancedNodes;
}

/**
 * Identify nodes that have complex relationships (step-grandparent + great-uncle, etc.)
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges  
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} persons - Array of person objects
 * @returns {Set} - Set of node IDs with complex relationships
 */
function identifyComplexRelationshipNodes(nodes, edges, relationshipMaps, persons) {
  const complexNodes = new Set();
  
  // Count relationship types for each person
  const relationshipCounts = new Map();
  
  nodes.forEach(node => {
    const personId = node.id;
    let relationshipTypes = new Set();
    
    // Check edges to count different relationship types
    edges.forEach(edge => {
      if (edge.source === personId || edge.target === personId) {
        const relationshipType = edge.data?.relationshipType || edge.type || 'unknown';
        relationshipTypes.add(relationshipType);
      }
    });
    
    // Also check for multiple roles (grandparent AND uncle, etc.)
    const person = persons.find(p => String(p.id) === personId);
    if (person) {
      // Count different relationship paths this person has
      let pathCount = 0;
      
      // Check if person is in multiple maps (parent, spouse, sibling simultaneously)
      if (relationshipMaps.parentToChildren?.has(personId)) pathCount++;
      if (relationshipMaps.childToParents?.has(personId)) pathCount++;
      if (relationshipMaps.spouseMap?.has(personId)) pathCount++;
      if (relationshipMaps.siblingMap?.has(personId)) pathCount++;
      
      // If person has 3+ relationship types or 4+ relationship paths, mark as complex
      if (relationshipTypes.size >= 3 || pathCount >= 4) {
        complexNodes.add(personId);
      }
    }
    
    relationshipCounts.set(personId, relationshipTypes.size);
  });
  
  return complexNodes;
}

/**
 * Detect collision between nodes based on their positions and sizes
 * @param {Array} nodes - Array of nodes with position data
 * @param {number} nodeWidth - Width of each node
 * @param {number} nodeHeight - Height of each node
 * @param {number} minHSpacing - Minimum horizontal spacing
 * @param {number} minVSpacing - Minimum vertical spacing
 * @returns {Array} - Array of collision pairs
 */
function detectCollisions(nodes, nodeWidth, nodeHeight, minHSpacing, minVSpacing) {
  const collisions = [];
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      
      // Calculate actual bounds of each node
      const boundsA = {
        left: nodeA.position.x - nodeWidth / 2,
        right: nodeA.position.x + nodeWidth / 2,
        top: nodeA.position.y - nodeHeight / 2,
        bottom: nodeA.position.y + nodeHeight / 2
      };
      
      const boundsB = {
        left: nodeB.position.x - nodeWidth / 2,
        right: nodeB.position.x + nodeWidth / 2,
        top: nodeB.position.y - nodeHeight / 2,
        bottom: nodeB.position.y + nodeHeight / 2
      };
      
      // Check for overlap with minimum spacing buffer
      const horizontalOverlap = (boundsA.right + minHSpacing > boundsB.left) && 
                               (boundsB.right + minHSpacing > boundsA.left);
      const verticalOverlap = (boundsA.bottom + minVSpacing > boundsB.top) && 
                             (boundsB.bottom + minVSpacing > boundsA.top);
      
      if (horizontalOverlap && verticalOverlap) {
        collisions.push({
          nodeA: nodeA,
          nodeB: nodeB,
          distance: calculateDistance(nodeA.position, nodeB.position),
          severity: calculateCollisionSeverity(boundsA, boundsB, minHSpacing, minVSpacing)
        });
      }
    }
  }
  
  return collisions.sort((a, b) => b.severity - a.severity); // Sort by severity (worst first)
}

/**
 * Calculate distance between two positions
 * @param {Object} pos1 - Position {x, y}
 * @param {Object} pos2 - Position {x, y}
 * @returns {number} - Euclidean distance
 */
function calculateDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate how severe a collision is (higher = worse)
 * @param {Object} boundsA - Bounds of node A
 * @param {Object} boundsB - Bounds of node B
 * @param {number} minHSpacing - Minimum horizontal spacing
 * @param {number} minVSpacing - Minimum vertical spacing
 * @returns {number} - Severity score
 */
function calculateCollisionSeverity(boundsA, boundsB, minHSpacing, minVSpacing) {
  const hOverlap = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left) + minHSpacing;
  const vOverlap = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top) + minVSpacing;
  
  return Math.max(0, hOverlap) * Math.max(0, vOverlap); // Area of overlap
}

/**
 * Resolve collisions using force-directed adjustment
 * @param {Array} nodes - Array of nodes
 * @param {Array} collisions - Array of collision data
 * @param {Set} complexNodes - Set of complex relationship node IDs
 * @param {number} minHSpacing - Minimum horizontal spacing
 * @returns {Array} - Nodes with adjusted positions
 */
function resolveCollisions(nodes, collisions, complexNodes, minHSpacing) {
  const adjustedNodes = nodes.map(node => ({ ...node, position: { ...node.position } }));
  const nodeMap = new Map(adjustedNodes.map(node => [node.id, node]));
  
  // Apply force-directed adjustments for each collision
  collisions.forEach(collision => {
    const nodeA = nodeMap.get(collision.nodeA.id);
    const nodeB = nodeMap.get(collision.nodeB.id);
    
    if (!nodeA || !nodeB) return;
    
    // Calculate force vector to separate nodes
    const dx = nodeB.position.x - nodeA.position.x;
    const dy = nodeB.position.y - nodeA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 0.001) return; // Avoid division by zero
    
    // Determine required separation distance
    let requiredDistance = minHSpacing + 280; // Node width + spacing
    
    // Add extra spacing for complex relationship nodes
    if (complexNodes.has(nodeA.id) || complexNodes.has(nodeB.id)) {
      requiredDistance += 160; // Extra spacing for complex relationships
    }
    
    // Additional spacing if both nodes are complex
    if (complexNodes.has(nodeA.id) && complexNodes.has(nodeB.id)) {
      requiredDistance += 80; // Even more spacing when both are complex
    }
    
    // Calculate adjustment needed
    const adjustment = (requiredDistance - distance) / 2;
    
    if (adjustment > 0) {
      // Normalize direction vector
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // Apply opposing forces to separate the nodes (more aggressive)
      nodeA.position.x -= dirX * adjustment * 1.2; // 120% of adjustment for stronger separation
      nodeA.position.y -= dirY * adjustment * 0.4; // Slightly more vertical adjustment
      
      nodeB.position.x += dirX * adjustment * 1.2;
      nodeB.position.y += dirY * adjustment * 0.4;
    }
  });
  
  return adjustedNodes;
}

/**
 * Balance node positions for better visual alignment
 * @param {Array} nodes - Array of nodes with adjusted positions
 * @param {number} nodeWidth - Width of nodes
 * @param {number} minHSpacing - Minimum horizontal spacing
 * @returns {Array} - Nodes with balanced positions
 */
function balanceNodePositions(nodes, nodeWidth, minHSpacing) {
  // Group nodes by approximate Y position (generation)
  const generations = new Map();
  
  nodes.forEach(node => {
    const roundedY = Math.round(node.position.y / 450) * 450; // Round to generation levels
    if (!generations.has(roundedY)) {
      generations.set(roundedY, []);
    }
    generations.get(roundedY).push(node);
  });
  
  // Balance each generation horizontally
  generations.forEach((generationNodes, y) => {
    // Sort nodes by X position
    generationNodes.sort((a, b) => a.position.x - b.position.x);
    
    // Calculate total width needed and center the generation
    const totalNodes = generationNodes.length;
    const totalWidth = (totalNodes - 1) * (nodeWidth + minHSpacing);
    const startX = -totalWidth / 2;
    
    // Reposition nodes with consistent spacing
    generationNodes.forEach((node, index) => {
      node.position.x = startX + index * (nodeWidth + minHSpacing);
      node.position.y = y; // Ensure consistent Y position
    });
  });
  
  return nodes;
}

/**
 * Apply additional spacing for specific relationship combinations
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Nodes with relationship-specific spacing
 */
export function applyRelationshipSpacing(nodes, edges, relationshipMaps) {
  const adjustedNodes = nodes.map(node => ({ ...node, position: { ...node.position } }));
  
  // Identify problematic relationship combinations
  const problematicPairs = findProblematicRelationshipPairs(nodes, edges, relationshipMaps);
  
  // Apply extra spacing for problematic pairs
  problematicPairs.forEach(pair => {
    const nodeA = adjustedNodes.find(n => n.id === pair.nodeA);
    const nodeB = adjustedNodes.find(n => n.id === pair.nodeB);
    
    if (nodeA && nodeB) {
      // Add horizontal spacing between problematic pairs
      const midX = (nodeA.position.x + nodeB.position.x) / 2;
      const extraSpacing = 100;
      
      if (nodeA.position.x < midX) {
        nodeA.position.x -= extraSpacing / 2;
        nodeB.position.x += extraSpacing / 2;
      } else {
        nodeA.position.x += extraSpacing / 2;
        nodeB.position.x -= extraSpacing / 2;
      }
    }
  });
  
  return adjustedNodes;
}

/**
 * Find pairs of nodes with problematic relationship combinations
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Array of problematic node pairs
 */
function findProblematicRelationshipPairs(nodes, edges, relationshipMaps) {
  const problematicPairs = [];
  
  // Define problematic relationship combinations
  const problematicCombinations = [
    ['grandparent', 'step-grandparent'],
    ['uncle', 'great-uncle'],
    ['grandparent', 'great-uncle'],
    ['step-parent', 'uncle']
  ];
  
  // Check each pair of nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      
      // Get relationship types between these nodes
      const relationshipsAB = getRelationshipTypes(nodeA.id, nodeB.id, edges);
      
      // Check if this pair has problematic relationship combinations
      problematicCombinations.forEach(combination => {
        const hasFirstType = relationshipsAB.some(rel => rel.includes(combination[0]));
        const hasSecondType = relationshipsAB.some(rel => rel.includes(combination[1]));
        
        if (hasFirstType && hasSecondType) {
          problematicPairs.push({
            nodeA: nodeA.id,
            nodeB: nodeB.id,
            relationships: relationshipsAB
          });
        }
      });
    }
  }
  
  return problematicPairs;
}

/**
 * Get relationship types between two nodes
 * @param {string} nodeAId - ID of first node
 * @param {string} nodeBId - ID of second node
 * @param {Array} edges - Array of edges
 * @returns {Array} - Array of relationship type strings
 */
function getRelationshipTypes(nodeAId, nodeBId, edges) {
  const relationships = [];
  
  edges.forEach(edge => {
    if ((edge.source === nodeAId && edge.target === nodeBId) ||
        (edge.source === nodeBId && edge.target === nodeAId)) {
      const relationshipType = edge.data?.relationshipType || edge.type || 'unknown';
      relationships.push(relationshipType.toLowerCase());
    }
  });
  
  return relationships;
}