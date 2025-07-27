/**
 * Full Tree Hierarchy System - Complete Family Display Module
 * Organizes entire family tree when no specific root person is selected
 * Uses natural hierarchy detection and generational organization
 */

// Import relationship mapping utilities for consistency
import { preventNodeOverlap } from './antiOverlapLayout.js';

/**
 * Full Tree Layout Generator
 * Creates comprehensive family tree layout without a specific root person
 * @param {Array} people - Array of all people
 * @param {Array} relationships - Array of all relationships
 * @param {Object} handlers - Event handlers for nodes
 * @param {Function} buildRelationshipMaps - Function to build relationship maps
 * @returns {Object} - { nodes, edges } for complete family tree
 */
export function createFullTreeLayout(people, relationships, handlers, buildRelationshipMaps = null) {
  console.log('Creating full tree layout for', people.length, 'people');
  
  // Phase 1: Initialize relationship mapping system
  let relationshipMaps;
  if (buildRelationshipMaps) {
    relationshipMaps = buildRelationshipMaps(relationships, people);
  } else {
    // Fallback: create basic relationship maps
    relationshipMaps = createBasicRelationshipMaps(relationships, people);
  }
  
  // Step 2: Find natural tree roots (oldest generation with most connections)
  const naturalRoots = findNaturalTreeRoots(people, relationshipMaps);
  
  // Step 3: Calculate generations for the entire tree
  const generations = calculateFullTreeGenerations(people, relationshipMaps, naturalRoots);
  
  // Step 4: Create family clusters (group related families)
  const familyClusters = createFamilyClusters(people, relationshipMaps, generations);
  
  // Step 5: Create nodes with full tree positioning
  const nodes = createFullTreeNodes(people, familyClusters, generations, relationshipMaps, handlers);
  
  // Step 6: Create edges for the full tree
  const edges = createFullTreeEdges(relationships, relationshipMaps, people);
  
  // Step 7: Apply anti-overlap positioning to prevent overlapping nodes
  const antiOverlapNodes = preventNodeOverlap(nodes, edges, relationshipMaps, people);
  
  // Step 8: Apply full tree spacing optimizations
  const finalNodes = applyFullTreeSpacing(antiOverlapNodes, edges, relationshipMaps);
  
  console.log('Full tree layout created:', finalNodes.length, 'nodes,', edges.length, 'edges');
  
  return { nodes: finalNodes, edges };
}

/**
 * Find natural root nodes for the family tree (oldest ancestors with most descendants)
 * @param {Array} people - Array of all people
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Array of natural root person IDs
 */
function findNaturalTreeRoots(people, relationshipMaps) {
  const candidates = [];
  
  // Find people with no parents (potential roots)
  people.forEach(person => {
    const personId = String(person.id);
    const parents = relationshipMaps.childToParents.get(personId);
    
    if (!parents || parents.size === 0) {
      // Count descendants to determine importance
      const descendantCount = countDescendants(personId, relationshipMaps);
      const connectionCount = countTotalConnections(personId, relationshipMaps);
      
      candidates.push({
        personId,
        person,
        descendantCount,
        connectionCount,
        birthYear: person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : 0,
        score: descendantCount * 3 + connectionCount * 2 + (person.date_of_birth ? 1 : 0)
      });
    }
  });
  
  // Sort by score (most important first)
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.birthYear !== b.birthYear) return a.birthYear - b.birthYear; // Older first
    return a.person.first_name.localeCompare(b.person.first_name);
  });
  
  console.log('Natural root candidates:', candidates.map(c => `${c.person.first_name} (score: ${c.score})`));
  
  // Return top candidates (limit to avoid too many separate trees)
  return candidates.slice(0, Math.min(5, candidates.length)).map(c => c.personId);
}

/**
 * Count total descendants of a person
 * @param {string} personId - Person ID
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {number} - Number of descendants
 */
function countDescendants(personId, relationshipMaps) {
  const visited = new Set();
  const queue = [personId];
  let count = 0;
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    const children = relationshipMaps.parentToChildren.get(currentId) || new Set();
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push(childId);
        count++;
      }
    });
  }
  
  return count;
}

/**
 * Count total connections (all relationship types) for a person
 * @param {string} personId - Person ID
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {number} - Number of connections
 */
function countTotalConnections(personId, relationshipMaps) {
  let count = 0;
  
  // Children
  const children = relationshipMaps.parentToChildren.get(personId);
  if (children) count += children.size;
  
  // Parents
  const parents = relationshipMaps.childToParents.get(personId);
  if (parents) count += parents.size;
  
  // Siblings
  const siblings = relationshipMaps.siblingMap.get(personId);
  if (siblings) count += siblings.size;
  
  // Spouses
  const spouses = relationshipMaps.spouseMap.get(personId);
  if (spouses) count += 1;
  
  const exSpouses = relationshipMaps.exSpouseMap.get(personId);
  if (exSpouses) count += exSpouses.size;
  
  return count;
}

/**
 * Calculate generations for the entire tree using multiple root points
 * @param {Array} people - Array of all people
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} naturalRoots - Array of natural root IDs
 * @returns {Map} - Map of personId -> generation number
 */
function calculateFullTreeGenerations(people, relationshipMaps, naturalRoots) {
  const generations = new Map();
  const visited = new Set();
  
  // Start from each natural root
  naturalRoots.forEach((rootId, rootIndex) => {
    if (visited.has(rootId)) return;
    
    // Use BFS to assign generations from this root
    const queue = [{ personId: rootId, generation: rootIndex * 3 }]; // Further reduced spacing between family trees
    
    while (queue.length > 0) {
      const { personId, generation } = queue.shift();
      
      if (visited.has(personId)) continue;
      visited.add(personId);
      generations.set(personId, generation);
      
      // Add children (next generation down)
      const children = relationshipMaps.parentToChildren.get(personId) || new Set();
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ personId: childId, generation: generation + 1 });
        }
      });
      
      // Add spouses (same generation)
      const spouse = relationshipMaps.spouseMap.get(personId);
      if (spouse && !visited.has(spouse)) {
        queue.push({ personId: spouse, generation: generation });
      }
      
      // Add siblings (same generation)
      const siblings = relationshipMaps.siblingMap.get(personId) || new Set();
      siblings.forEach(siblingId => {
        if (!visited.has(siblingId)) {
          queue.push({ personId: siblingId, generation: generation });
        }
      });
    }
  });
  
  // Handle orphaned nodes (people not connected to any root)
  people.forEach(person => {
    const personId = String(person.id);
    if (!generations.has(personId)) {
      // Assign to a default generation based on birth year or connections
      const defaultGeneration = estimateGenerationFromBirthYear(person) || 100; // Far right
      generations.set(personId, defaultGeneration);
    }
  });
  
  return generations;
}

/**
 * Estimate generation from birth year
 * @param {Object} person - Person object
 * @returns {number} - Estimated generation
 */
function estimateGenerationFromBirthYear(person) {
  if (!person.date_of_birth) return null;
  
  const birthYear = new Date(person.date_of_birth).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  
  // Rough generation estimate (25 years per generation)
  return Math.floor(age / 25);
}

/**
 * Create family clusters to group related people
 * @param {Array} people - Array of all people
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Map} generations - Generation mapping
 * @returns {Map} - Map of clusterId -> { people, generation, centerX }
 */
function createFamilyClusters(people, relationshipMaps, generations) {
  const clusters = new Map();
  const assigned = new Set();
  let clusterId = 0;
  
  // Group by generation first
  const generationGroups = new Map();
  people.forEach(person => {
    const personId = String(person.id);
    const generation = generations.get(personId) || 0;
    
    if (!generationGroups.has(generation)) {
      generationGroups.set(generation, []);
    }
    generationGroups.get(generation).push(person);
  });
  
  // Create clusters within each generation
  generationGroups.forEach((generationPeople, generation) => {
    const subClusters = groupByFamilyConnections(generationPeople, relationshipMaps);
    
    subClusters.forEach(cluster => {
      clusters.set(clusterId++, {
        people: cluster,
        generation: generation,
        centerX: 0, // Will be calculated later
        size: cluster.length
      });
    });
  });
  
  return clusters;
}

/**
 * Group people by family connections (siblings, spouses)
 * @param {Array} people - People in the same generation
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Array of family clusters
 */
function groupByFamilyConnections(people, relationshipMaps) {
  const clusters = [];
  const assigned = new Set();
  
  people.forEach(person => {
    const personId = String(person.id);
    if (assigned.has(personId)) return;
    
    // Find all connected family members in this generation
    const cluster = findConnectedFamily(personId, people, relationshipMaps, assigned);
    if (cluster.length > 0) {
      clusters.push(cluster);
    }
  });
  
  return clusters;
}

/**
 * Find all family members connected to a person in the same generation
 * @param {string} startPersonId - Starting person ID
 * @param {Array} people - People to search within
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Set} assigned - Already assigned people
 * @returns {Array} - Connected family members
 */
function findConnectedFamily(startPersonId, people, relationshipMaps, assigned) {
  const cluster = [];
  const queue = [startPersonId];
  const visited = new Set();
  
  while (queue.length > 0) {
    const personId = queue.shift();
    if (visited.has(personId) || assigned.has(personId)) continue;
    
    const person = people.find(p => String(p.id) === personId);
    if (!person) continue;
    
    visited.add(personId);
    assigned.add(personId);
    cluster.push(person);
    
    // Add connected people in same generation
    // Spouses
    const spouse = relationshipMaps.spouseMap.get(personId);
    if (spouse && !visited.has(spouse)) {
      queue.push(spouse);
    }
    
    // Siblings
    const siblings = relationshipMaps.siblingMap.get(personId) || new Set();
    siblings.forEach(siblingId => {
      if (!visited.has(siblingId)) {
        queue.push(siblingId);
      }
    });
    
    // Ex-spouses (same generation)
    const exSpouses = relationshipMaps.exSpouseMap.get(personId) || new Set();
    exSpouses.forEach(exSpouseId => {
      if (!visited.has(exSpouseId)) {
        queue.push(exSpouseId);
      }
    });
  }
  
  return cluster;
}

/**
 * Create nodes for the full tree layout
 * @param {Array} people - Array of all people
 * @param {Map} familyClusters - Family clusters
 * @param {Map} generations - Generations mapping
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Object} handlers - Event handlers
 * @returns {Array} - Array of positioned nodes
 */
function createFullTreeNodes(people, familyClusters, generations, relationshipMaps, handlers) {
  const nodes = [];
  
  // Layout constants - compact vertical spacing, safe horizontal spacing
  const GENERATION_HEIGHT = 140; // Further reduced vertical spacing for compact tree
  const CLUSTER_WIDTH = 80; // Tighter cluster width for better grouping  
  const NODE_SPACING = 310; // Optimized horizontal spacing
  
  // Sort clusters by generation
  const sortedClusters = Array.from(familyClusters.entries())
    .sort(([, a], [, b]) => a.generation - b.generation);
  
  // Calculate cluster positions
  const generationCenters = new Map();
  sortedClusters.forEach(([clusterId, cluster]) => {
    const generation = cluster.generation;
    
    if (!generationCenters.has(generation)) {
      generationCenters.set(generation, 0);
    }
    
    const centerX = generationCenters.get(generation);
    cluster.centerX = centerX;
    
    // Update next center position - ensure adequate spacing for family groups
    const clusterSpacing = Math.max(CLUSTER_WIDTH, cluster.size * 100); // Increased cluster separation
    generationCenters.set(generation, centerX + (cluster.size * NODE_SPACING) + clusterSpacing);
  });
  
  // Position nodes within clusters - Classic genealogical tree style
  sortedClusters.forEach(([clusterId, cluster]) => {
    // Classic approach: Clear generational rows
    const y = cluster.generation * GENERATION_HEIGHT;
    let x = cluster.centerX;
    
    // Sort people within cluster for consistent ordering - group spouses together
    const sortedPeople = cluster.people.sort((a, b) => {
      // First prioritize spouses to be adjacent
      const aId = String(a.id);
      const bId = String(b.id);
      const aSpouse = relationshipMaps.spouseMap.get(aId);
      const bSpouse = relationshipMaps.spouseMap.get(bId);
      
      // If A is spouse of someone in cluster, prioritize
      if (aSpouse && cluster.people.some(p => String(p.id) === aSpouse)) return -1;
      if (bSpouse && cluster.people.some(p => String(p.id) === bSpouse)) return 1;
      
      // Then by importance/connections
      const aConnections = countTotalConnections(aId, relationshipMaps);
      const bConnections = countTotalConnections(bId, relationshipMaps);
      if (aConnections !== bConnections) return bConnections - aConnections;
      
      // Then by age
      const aBirthYear = a.date_of_birth ? new Date(a.date_of_birth).getFullYear() : 0;
      const bBirthYear = b.date_of_birth ? new Date(b.date_of_birth).getFullYear() : 0;
      if (aBirthYear !== bBirthYear) return aBirthYear - bBirthYear;
      
      // Finally by name
      return a.first_name.localeCompare(b.first_name);
    });
    
    // Create nodes for this cluster with special spouse spacing
    let currentX = x;
    sortedPeople.forEach((person, index) => {
      const personId = String(person.id);
      let nodeX = currentX;
      
      // Check if this person is a spouse of the previous person
      if (index > 0) {
        const prevPersonId = String(sortedPeople[index - 1].id);
        const isSpouseOfPrevious = relationshipMaps.spouseMap.get(personId) === prevPersonId ||
                                  relationshipMaps.spouseMap.get(prevPersonId) === personId;
        
        if (isSpouseOfPrevious) {
          // Place spouses closer but not too close to avoid overlap (300px minimum for node width)
          currentX += 300;
        } else {
          // Normal spacing for non-spouses
          currentX += NODE_SPACING;
        }
      }
      
      nodeX = currentX;
      
      // Determine node importance for styling
      const importance = countTotalConnections(String(person.id), relationshipMaps);
      const nodeStyle = getFullTreeNodeStyle(importance, cluster.generation);
      
      nodes.push({
        id: String(person.id),
        type: 'personCard',
        position: { x: nodeX, y: y },
        data: {
          person: {
            ...person,
            relation: null, // No specific relation in full tree view
          },
          onEdit: handlers.onEdit,
          onDelete: handlers.onDelete,
          onPersonCardOpen: handlers.onPersonCardOpen,
          onRestructure: handlers.onRestructure,
          fullTreeMode: true,
          importance: importance,
          generation: cluster.generation,
          clusterId: clusterId,
        },
        style: nodeStyle,
      });
      
      // Always update currentX for next person to ensure unique positions
      if (index === 0) {
        currentX += NODE_SPACING;
      } else {
        // Ensure we advance for the next person with minimum spacing
        currentX = Math.max(currentX, nodeX + 300); // Minimum 300px between nodes
      }
    });
  });
  
  return nodes;
}

/**
 * Get node styling for full tree based on importance and generation
 * @param {number} importance - Connection importance score
 * @param {number} generation - Generation number
 * @returns {Object} - Node style object
 */
function getFullTreeNodeStyle(importance, generation) {
  // Base style
  let style = {
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '280px',
    transition: 'all 0.3s ease',
  };
  
  // Importance-based styling
  if (importance >= 8) {
    // Highly connected (family patriarchs/matriarchs)
    style = {
      ...style,
      background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
      border: '3px solid #f59e0b',
      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
      transform: 'scale(1.05)',
    };
  } else if (importance >= 5) {
    // Well connected (family cores)
    style = {
      ...style,
      background: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)',
      border: '2px solid #8b5cf6',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
    };
  } else if (importance >= 2) {
    // Moderately connected
    style = {
      ...style,
      background: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)',
      border: '2px solid #3b82f6',
      boxShadow: '0 3px 12px rgba(59, 130, 246, 0.15)',
    };
  }
  
  // Generation-based modifications (subtle)
  if (generation <= 0) {
    // Oldest generations
    style.opacity = 0.95;
    style.filter = 'sepia(5%)';
  }
  
  return style;
}

/**
 * Create edges for full tree layout - Classic genealogical tree style with minimal connectors
 * @param {Array} relationships - All relationships
 * @param {Object} relationshipMaps - Relationship maps
 * @param {Array} people - All people
 * @returns {Array} - Array of edges
 */
function createFullTreeEdges(relationships, relationshipMaps, people) {
  const edges = [];
  const processedConnections = new Set();
  
  // Classic family tree approach: Clear but simple parent-child connections
  relationshipMaps.parentToChildren.forEach((children, parentId) => {
    children.forEach(childId => {
      const connectionKey = `lineage-${parentId}-${childId}`;
      if (!processedConnections.has(connectionKey)) {
        edges.push({
          id: connectionKey,
          source: parentId,
          target: childId,
          type: 'straight',
          style: {
            stroke: '#9ca3af',      // Visible gray - can clearly see
            strokeWidth: 1.5,       // Thin but visible line
            opacity: 0.8,           // Clear visibility
          },
          // No arrows in classic trees - just connecting lines
        });
        processedConnections.add(connectionKey);
      }
    });
  });
  
  // Classic genealogical approach: NO spouse connectors
  // In traditional family trees, marriages are shown by positioning couples side-by-side
  // and having their children positioned below them centrally
  // This is cleaner and more traditional than drawing lines between spouses
  
  // Classic approach: No sibling lines - positioning shows sibling relationships
  // Siblings are naturally grouped by being in same generation/row
  
  return edges;
}

/**
 * Apply spacing optimizations for full tree layout
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @param {Object} relationshipMaps - Relationship maps
 * @returns {Array} - Optimized nodes
 */
function applyFullTreeSpacing(nodes, edges, relationshipMaps) {
  // Apply anti-overlap with full tree considerations
  let adjustedNodes = [...nodes];
  
  // Group by generation for better spacing
  const generationGroups = new Map();
  adjustedNodes.forEach(node => {
    const generation = node.data.generation || 0;
    if (!generationGroups.has(generation)) {
      generationGroups.set(generation, []);
    }
    generationGroups.get(generation).push(node);
  });
  
  // Apply even spacing within each generation
  generationGroups.forEach((genNodes, generation) => {
    if (genNodes.length <= 1) return;
    
    // Sort by current X position
    genNodes.sort((a, b) => a.position.x - b.position.x);
    
    // Calculate optimal spacing - ensure no overlaps but more compact
    const minSpacing = 300; // Reduced to 300 for more compact layout (node width 280px + 20px buffer)
    const totalWidth = (genNodes.length - 1) * minSpacing;
    const startX = -totalWidth / 2;
    
    // Redistribute nodes with even spacing, but group family clusters closer
    genNodes.forEach((node, index) => {
      node.position.x = startX + (index * minSpacing);
      
      // Apply cluster-based adjustment - but ensure minimum spacing
      const clusterId = node.data?.clusterId;
      if (clusterId !== undefined && index > 0) {
        // Ensure minimum distance from previous node
        const prevNode = genNodes[index - 1];
        const distance = node.position.x - prevNode.position.x;
        if (distance < 300) {
          // Force minimum 300px spacing to prevent overlaps
          node.position.x = prevNode.position.x + 300;
        }
      }
    });
  });
  
  // Final pass: ensure absolutely no overlapping positions
  const finalNodes = [...adjustedNodes];
  for (let i = 1; i < finalNodes.length; i++) {
    for (let j = 0; j < i; j++) {
      const nodeA = finalNodes[i];
      const nodeB = finalNodes[j];
      
      // Check if nodes are in exact same position
      if (Math.abs(nodeA.position.x - nodeB.position.x) < 10 && 
          Math.abs(nodeA.position.y - nodeB.position.y) < 10) {
        // Move node A to the right by 300px
        nodeA.position.x = nodeB.position.x + 300;
      }
    }
  }
  
  return finalNodes;
}

/**
 * Create basic relationship maps (fallback if external function not provided)
 * @param {Array} relationships - Array of relationships
 * @param {Array} people - Array of people
 * @returns {Object} - Basic relationship maps
 */
function createBasicRelationshipMaps(relationships, people) {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const exSpouseMap = new Map();
  const siblingMap = new Map();

  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    const relationshipType = rel.type || rel.relationship_type;

    switch (relationshipType) {
      case 'parent':
        // Add to parent-child maps
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
          // Ex-spouse
          if (!exSpouseMap.has(source)) {
            exSpouseMap.set(source, new Set());
          }
          exSpouseMap.get(source).add(target);
        } else {
          // Current spouse
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
}

