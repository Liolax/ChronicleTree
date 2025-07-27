/**
 * Advanced Node Hierarchy System for Family Tree
 * Provides visual hierarchy based on generation, relationship importance, and family structure
 */

/**
 * Enhanced node styling with full hierarchy system
 * @param {Object} node - The node to enhance
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} allPeople - Array of all people
 * @param {string} rootPersonId - ID of the root person
 * @param {Map} generations - Generation mapping
 * @returns {Object} - Enhanced node with hierarchy styling
 */
export function applyNodeHierarchy(node, relationshipMaps, allPeople, rootPersonId, generations) {
  const enhancedNode = { ...node };
  const personId = node.id;
  
  // Determine hierarchy level and relationship context
  const hierarchyContext = analyzeNodeHierarchy(personId, rootPersonId, relationshipMaps, generations);
  
  // Apply visual styling based on hierarchy
  const hierarchyStyle = getHierarchyStyle(hierarchyContext);
  
  // Merge with existing style
  enhancedNode.style = {
    ...enhancedNode.style,
    ...hierarchyStyle.nodeStyle,
  };
  
  // Add hierarchy data for component use
  enhancedNode.data = {
    ...enhancedNode.data,
    hierarchy: hierarchyContext,
    hierarchyStyles: hierarchyStyle,
  };
  
  return enhancedNode;
}

/**
 * Analyze the hierarchical position and importance of a node
 * @param {string} personId - ID of the person
 * @param {string} rootPersonId - ID of the root person
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Map} generations - Generation mapping
 * @returns {Object} - Hierarchy context information
 */
function analyzeNodeHierarchy(personId, rootPersonId, relationshipMaps, generations) {
  const generation = generations.get(personId) || 0;
  const rootGeneration = generations.get(rootPersonId) || 0;
  const generationDistance = Math.abs(generation - rootGeneration);
  
  // Determine relationship importance
  const importance = calculateRelationshipImportance(personId, rootPersonId, relationshipMaps);
  
  // Determine family role
  const familyRole = determineFamilyRole(personId, rootPersonId, relationshipMaps, generation, rootGeneration);
  
  // Determine visual tier
  const visualTier = determineVisualTier(importance, generationDistance, familyRole);
  
  return {
    personId,
    generation,
    rootGeneration,
    generationDistance,
    importance,
    familyRole,
    visualTier,
    isRoot: personId === rootPersonId,
    isDirectFamily: importance >= 8,
    isExtendedFamily: importance >= 5 && importance < 8,
    isDistantFamily: importance < 5,
  };
}

/**
 * Calculate the relationship importance score (0-10)
 * @param {string} personId - ID of the person
 * @param {string} rootPersonId - ID of the root person
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {number} - Importance score (0-10)
 */
function calculateRelationshipImportance(personId, rootPersonId, relationshipMaps) {
  if (personId === rootPersonId) return 10; // Root person
  
  let score = 0;
  
  // Direct relationships (high importance)
  if (relationshipMaps.parentToChildren?.get(rootPersonId)?.has(personId)) score += 9; // Child
  if (relationshipMaps.childToParents?.get(rootPersonId)?.has(personId)) score += 9; // Parent
  if (relationshipMaps.spouseMap?.get(rootPersonId) === personId) score += 9; // Current spouse
  
  // Secondary relationships (medium-high importance)
  if (relationshipMaps.siblingMap?.get(rootPersonId)?.has(personId)) score += 7; // Sibling
  if (relationshipMaps.exSpouseMap?.get(rootPersonId)?.has(personId)) score += 6; // Ex-spouse
  
  // Extended family (medium importance)
  // Grandparents/Grandchildren
  const rootParents = relationshipMaps.childToParents?.get(rootPersonId) || new Set();
  for (const parent of rootParents) {
    if (relationshipMaps.childToParents?.get(parent)?.has(personId)) score += 6; // Grandparent
  }
  
  const rootChildren = relationshipMaps.parentToChildren?.get(rootPersonId) || new Set();
  for (const child of rootChildren) {
    if (relationshipMaps.parentToChildren?.get(child)?.has(personId)) score += 6; // Grandchild
  }
  
  // Aunts/Uncles/Nieces/Nephews
  for (const parent of rootParents) {
    if (relationshipMaps.siblingMap?.get(parent)?.has(personId)) score += 5; // Aunt/Uncle
  }
  
  const rootSiblings = relationshipMaps.siblingMap?.get(rootPersonId) || new Set();
  for (const sibling of rootSiblings) {
    if (relationshipMaps.parentToChildren?.get(sibling)?.has(personId)) score += 5; // Niece/Nephew
  }
  
  // In-laws (medium importance)
  const rootSpouse = relationshipMaps.spouseMap?.get(rootPersonId);
  if (rootSpouse) {
    if (relationshipMaps.childToParents?.get(rootSpouse)?.has(personId)) score += 4; // In-law parent
    if (relationshipMaps.siblingMap?.get(rootSpouse)?.has(personId)) score += 4; // In-law sibling
  }
  
  return Math.min(score, 10);
}

/**
 * Determine the family role of a person
 * @param {string} personId - ID of the person
 * @param {string} rootPersonId - ID of the root person
 * @param {Object} relationshipMaps - Relationship maps
 * @param {number} generation - Person's generation
 * @param {number} rootGeneration - Root's generation
 * @returns {string} - Family role
 */
function determineFamilyRole(personId, rootPersonId, relationshipMaps, generation, rootGeneration) {
  if (personId === rootPersonId) return 'root';
  
  // Direct relationships
  if (relationshipMaps.parentToChildren?.get(rootPersonId)?.has(personId)) return 'child';
  if (relationshipMaps.childToParents?.get(rootPersonId)?.has(personId)) return 'parent';
  if (relationshipMaps.spouseMap?.get(rootPersonId) === personId) return 'spouse';
  if (relationshipMaps.siblingMap?.get(rootPersonId)?.has(personId)) return 'sibling';
  
  // Generational roles
  const genDiff = generation - rootGeneration;
  if (genDiff < -1) return 'ancestor'; // Older generations
  if (genDiff > 1) return 'descendant'; // Younger generations
  if (genDiff === 0) return 'peer'; // Same generation
  
  return 'extended';
}

/**
 * Determine visual tier based on importance and context
 * @param {number} importance - Importance score
 * @param {number} generationDistance - Distance from root generation
 * @param {string} familyRole - Family role
 * @returns {number} - Visual tier (1-5, 1 being most prominent)
 */
function determineVisualTier(importance, generationDistance, familyRole) {
  if (familyRole === 'root') return 1; // Most prominent
  if (importance >= 9) return 2; // Direct family (children, parents, current spouse)
  if (importance >= 7) return 3; // Close family (siblings, ex-spouse)
  if (importance >= 5) return 4; // Extended family (aunts, uncles, grandparents)
  return 5; // Distant family
}

/**
 * Get visual styling based on hierarchy context
 * @param {Object} hierarchyContext - Hierarchy analysis results
 * @returns {Object} - Styling configuration
 */
function getHierarchyStyle(hierarchyContext) {
  const { visualTier, familyRole, generation, generationDistance, isRoot } = hierarchyContext;
  
  // Base styles for each tier
  const tierStyles = {
    1: { // Root person
      background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
      border: '3px solid #f59e0b',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3), 0 0 0 4px rgba(245, 158, 11, 0.1)',
      transform: 'scale(1.1)',
      zIndex: 1000,
      borderRadius: '20px',
    },
    2: { // Direct family (children, parents, current spouse)
      background: 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
      border: '2.5px solid #7c3aed',
      boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25), 0 0 0 3px rgba(124, 58, 237, 0.1)',
      transform: 'scale(1.05)',
      zIndex: 900,
      borderRadius: '18px',
    },
    3: { // Close family (siblings, ex-spouse)
      background: 'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)',
      border: '2px solid #2563eb',
      boxShadow: '0 6px 15px rgba(37, 99, 235, 0.2)',
      transform: 'scale(1.02)',
      zIndex: 800,
      borderRadius: '16px',
    },
    4: { // Extended family (aunts, uncles, grandparents)
      background: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
      border: '2px solid #059669',
      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
      zIndex: 700,
      borderRadius: '14px',
    },
    5: { // Distant family
      background: 'linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%)',
      border: '1.5px solid #6b7280',
      boxShadow: '0 2px 8px rgba(107, 114, 128, 0.1)',
      zIndex: 600,
      borderRadius: '12px',
    },
  };
  
  const baseStyle = tierStyles[visualTier] || tierStyles[5];
  
  // Role-specific modifications
  const roleModifications = getRoleModifications(familyRole);
  
  // Generation-based modifications
  const generationModifications = getGenerationModifications(generation, generationDistance);
  
  // Combine all styles
  const nodeStyle = {
    ...baseStyle,
    ...roleModifications,
    ...generationModifications,
    width: getNodeWidth(visualTier),
    height: getNodeHeight(visualTier),
    fontSize: getFontSize(visualTier),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };
  
  return {
    nodeStyle,
    tier: visualTier,
    importance: hierarchyContext.importance,
  };
}

/**
 * Get role-specific style modifications
 * @param {string} familyRole - Family role
 * @returns {Object} - Style modifications
 */
function getRoleModifications(familyRole) {
  const roleStyles = {
    root: {
      borderStyle: 'solid',
      borderWidth: '4px',
    },
    spouse: {
      borderStyle: 'dashed',
      borderWidth: '3px',
    },
    child: {
      borderTopWidth: '4px',
      borderTopStyle: 'double',
    },
    parent: {
      borderBottomWidth: '4px',
      borderBottomStyle: 'double',
    },
    sibling: {
      borderLeftWidth: '4px',
      borderRightWidth: '4px',
    },
    ancestor: {
      opacity: 0.9,
      filter: 'sepia(10%)',
    },
    descendant: {
      opacity: 0.95,
      filter: 'brightness(1.05)',
    },
  };
  
  return roleStyles[familyRole] || {};
}

/**
 * Get generation-based style modifications
 * @param {number} generation - Generation number
 * @param {number} generationDistance - Distance from root generation
 * @returns {Object} - Style modifications
 */
function getGenerationModifications(generation, generationDistance) {
  // Subtle generation indicators
  const modifications = {};
  
  // Add subtle generation-based opacity and scale
  if (generationDistance > 2) {
    modifications.opacity = Math.max(0.7, 1 - (generationDistance * 0.1));
    modifications.transform = `scale(${Math.max(0.9, 1 - (generationDistance * 0.05))})`;
  }
  
  // Add generation indicator border
  if (generationDistance >= 1) {
    modifications.borderBottomColor = getGenerationColor(generation);
    modifications.borderBottomWidth = '3px';
  }
  
  return modifications;
}

/**
 * Get color for generation indicator
 * @param {number} generation - Generation number
 * @returns {string} - CSS color
 */
function getGenerationColor(generation) {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
  ];
  
  return colors[Math.abs(generation) % colors.length];
}

/**
 * Get node width based on visual tier
 * @param {number} tier - Visual tier
 * @returns {string} - CSS width
 */
function getNodeWidth(tier) {
  const widths = {
    1: '280px', // Root
    2: '260px', // Direct family
    3: '240px', // Close family
    4: '220px', // Extended family
    5: '200px', // Distant family
  };
  
  return widths[tier] || widths[5];
}

/**
 * Get node height based on visual tier
 * @param {number} tier - Visual tier
 * @returns {string} - CSS height
 */
function getNodeHeight(tier) {
  const heights = {
    1: 'auto', // Root (flexible)
    2: 'auto', // Direct family
    3: 'auto', // Close family
    4: 'auto', // Extended family
    5: 'auto', // Distant family
  };
  
  return heights[tier] || heights[5];
}

/**
 * Get font size based on visual tier
 * @param {number} tier - Visual tier
 * @returns {string} - CSS font size
 */
function getFontSize(tier) {
  const sizes = {
    1: '18px', // Root
    2: '16px', // Direct family
    3: '15px', // Close family
    4: '14px', // Extended family
    5: '13px', // Distant family
  };
  
  return sizes[tier] || sizes[5];
}

/**
 * Apply hierarchy-based positioning adjustments
 * @param {Array} nodes - Array of nodes
 * @param {Object} relationshipMaps - Relationship maps
 * @param {string} rootPersonId - Root person ID
 * @returns {Array} - Nodes with adjusted positions
 */
export function applyHierarchicalPositioning(nodes, relationshipMaps, rootPersonId) {
  const adjustedNodes = nodes.map(node => ({ ...node, position: { ...node.position } }));
  
  // Find the root node
  const rootNode = adjustedNodes.find(n => n.id === rootPersonId);
  if (!rootNode) return adjustedNodes;
  
  // Apply tier-based positioning adjustments
  adjustedNodes.forEach(node => {
    const tier = node.data?.hierarchy?.visualTier || 5;
    
    // Higher tier nodes get priority positioning (closer to center)
    if (tier <= 2 && node.id !== rootPersonId) {
      // Move important nodes slightly toward root
      const dx = rootNode.position.x - node.position.x;
      const dy = rootNode.position.y - node.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const pullFactor = tier === 2 ? 0.05 : 0.03;
        node.position.x += dx * pullFactor;
        node.position.y += dy * pullFactor;
      }
    }
    
    // Add slight tier-based vertical offset for visual depth
    const tierOffset = (tier - 3) * 5; // Tiers 1-2 slightly up, 4-5 slightly down
    node.position.y += tierOffset;
  });
  
  return adjustedNodes;
}

/**
 * Enhanced node data with hierarchy information
 * @param {Object} node - The node to enhance
 * @param {Object} person - Person data
 * @param {Object} hierarchyContext - Hierarchy context
 * @returns {Object} - Enhanced node data
 */
export function enhanceNodeData(node, person, hierarchyContext) {
  return {
    ...node.data,
    hierarchy: hierarchyContext,
    person: {
      ...person,
      hierarchyLevel: hierarchyContext.visualTier,
      familyRole: hierarchyContext.familyRole,
      importance: hierarchyContext.importance,
    },
    displayPriority: 6 - hierarchyContext.visualTier, // Higher priority = higher number
  };
}