import { Position } from '@xyflow/react';
/**
 * Collect all connected persons and relationships for a given root
 * Ensures siblings, spouses, and all relevant connections are included
 * @param {string|number} rootId - The root person ID
 * @param {Array} allPersons - All person objects
 * @param {Array} allRelationships - All relationship objects
 * @returns {Object} - { persons, relationships }
 */
export function collectConnectedFamily(rootId, allPersons, allRelationships) {
  // Build a map from person ID to relationships
  const relMap = new Map();
  allRelationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    
    if (!relMap.has(source)) {
      relMap.set(source, []);
    }
    if (!relMap.has(target)) {
      relMap.set(target, []);
    }
    relMap.get(source).push(rel);
    relMap.get(target).push(rel);
  });

  // Enhanced logic: BFS to collect all connected persons
  const visited = new Set();
  const queue = [String(rootId)];
  const connectedPersons = [];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const person = allPersons.find(p => String(p.id) === currentId);
    if (person) connectedPersons.push(person);
    
    // Find relationships for currentId and add connected persons to queue
    if (typeof relMap !== 'undefined' && relMap.get) {
      (relMap.get(currentId) || []).forEach(rel => {
        const source = String(rel.source || rel.from);
        const target = String(rel.target || rel.to);
        if (!visited.has(source)) queue.push(source);
        if (!visited.has(target)) queue.push(target);
      });
    } else {
      allRelationships.forEach(rel => {
        const source = String(rel.source || rel.from);
        const target = String(rel.target || rel.to);
        if (source === currentId && !visited.has(target)) {
          queue.push(target);
        } else if (target === currentId && !visited.has(source)) {
          queue.push(source);
        }
      });
    }
  }

  // Always include sibling relationships for the root
  const rootPerson = allPersons.find(p => String(p.id) === String(rootId));
  if (rootPerson) {
    // Find all persons with the same parents as rootPerson
    const parentIds = [rootPerson.father_id, rootPerson.mother_id].filter(Boolean);
    if (parentIds.length) {
      // Siblings: persons with same parents, not the root
      const siblings = allPersons.filter(p =>
        String(p.id) !== String(rootId) &&
        parentIds.includes(p.father_id) &&
        parentIds.includes(p.mother_id)
      );
      siblings.forEach(sibling => {
        // Add sibling if not already present
        if (!connectedPersons.some(p => String(p.id) === String(sibling.id))) {
          connectedPersons.push(sibling);
        }
      });
    }
  }

  // Now collect ALL relationships between the connected persons
  const connectedPersonIds = new Set(connectedPersons.map(p => String(p.id)));
  const connectedRelationships = allRelationships.filter(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    return connectedPersonIds.has(source) && connectedPersonIds.has(target);
  });

  // Return only connected persons and relationships
  return {
    persons: connectedPersons,
    relationships: connectedRelationships,
  };
}
export const createFamilyTreeLayout = (persons, relationships, handlers = {}, rootPersonId = null) => {
  // Debug: Print incoming persons and relationships
  if (!persons || !relationships) {
    return { nodes: [], edges: [] };
  }

  // Step 1: Build relationship maps
  const relationshipMaps = buildRelationshipMaps(relationships, persons);

  // --- DEBUG: Print parent/child relationships for root and parents ---
  if (rootPersonId) {
    const rootId = String(rootPersonId);
    const rootPerson = persons.find(p => String(p.id) === rootId);
    if (rootPerson) {
      const parentIds = relationshipMaps.childToParents.get(rootId);
      console.log('[FAMILY TREE DEBUG] Root person:', rootPerson.first_name, rootPerson.last_name, '(', rootId, ')');
      console.log('[FAMILY TREE DEBUG] Parent IDs of root:', parentIds ? Array.from(parentIds) : 'None');
      if (parentIds) {
        Array.from(parentIds).forEach(parentId => {
          const parent = persons.find(p => String(p.id) === parentId);
          if (parent) {
            const grandparentIds = relationshipMaps.childToParents.get(parentId);
            console.log('[FAMILY TREE DEBUG] Parent:', parent.first_name, parent.last_name, '(', parentId, ')');
            console.log('[FAMILY TREE DEBUG] Parent IDs of parent:', grandparentIds ? Array.from(grandparentIds) : 'None');
          }
        });
      }
    }
  }

  // Step 2: Determine root nodes - use selected root person if provided, otherwise find natural roots
  let rootNodes;
  if (rootPersonId) {
    // Use the selected root person as the only root
    rootNodes = [String(rootPersonId)];
  } else {
    // Find root nodes (people with no parents)
    rootNodes = findRootNodes(persons, relationshipMaps.childToParents);
  }

  // Step 3: Calculate generations for each person
  const generations = calculateGenerations(persons, relationshipMaps.childToParents, rootNodes, relationshipMaps.parentToChildren, relationshipMaps.spouseMap);

  // Step 4: Create nodes with hierarchical positioning (prioritize rootPersonId)
  const nodes = createHierarchicalNodes(persons, generations, relationshipMaps.spouseMap, handlers, rootPersonId, relationshipMaps.childToParents);

  // Step 5: Create simplified edges (no duplication)
  const edges = createSimplifiedEdges(relationships, relationshipMaps);

  return { nodes, edges };
};

/**
 * Build relationship maps for efficient lookups
 * @param {Array} relationships - Array of relationship objects
 * @param {Array} persons - Array of person objects  
 * @returns {Object} - Maps for different relationship types
 */
const buildRelationshipMaps = (relationships, persons) => {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const spouseMap = new Map();
  const siblingMap = new Map();
  
  // DEBUG: Show what data we're working with
  console.log('\n--- DEBUG: buildRelationshipMaps Input ---');
  console.log('persons count:', persons.length);
  console.log('relationships count:', relationships.length);
  console.log('person IDs:', persons.map(p => p.id));
  console.log('---------------------------------------\n');
  

  let totalParentRels = 0;
  let skippedMissingPerson = 0;
  let skippedInverted = 0;
  let skippedMissingDates = 0;
  let addedToMaps = 0;

  relationships.forEach(rel => {
    let source = String(rel.source || rel.from);
    let target = String(rel.target || rel.to);

    // Support both 'type' and 'relationship_type' field names for flexibility
    const relationshipType = rel.type || rel.relationship_type;

    switch (relationshipType) {
      case 'parent':
        totalParentRels++;
        // Validate relationship based on birth dates to prevent inverted hierarchies
        let sourcePerson = persons.find(p => String(p.id) === source);
        let targetPerson = persons.find(p => String(p.id) === target);

        // DEBUG: Check for Bob Anderson relationships
        if (source === '5' || target === '5') {
          console.log(`DEBUG RELATIONSHIP ${source} -> ${target}:`);
          console.log(`  Source (${source}):`, sourcePerson ? { name: `${sourcePerson.first_name} ${sourcePerson.last_name}`, dob: sourcePerson.date_of_birth } : 'Not found');
          console.log(`  Target (${target}):`, targetPerson ? { name: `${targetPerson.first_name} ${targetPerson.last_name}`, dob: targetPerson.date_of_birth } : 'Not found');
        }

        // Skip relationships where one or both persons are not found
        if (!sourcePerson || !targetPerson) {
          skippedMissingPerson++;
          if (source === '5' || target === '5') {
            console.warn(`Skipping relationship with missing person: ${source} -> ${target} (source found: ${!!sourcePerson}, target found: ${!!targetPerson})`);
          }
          return; // Skip to next relationship
        }

        // Only invert if the relationship is truly inverted (parent is younger than child and the relationship is not already child->parent)
        if (sourcePerson.date_of_birth && targetPerson.date_of_birth) {
          const sourceBirthYear = new Date(sourcePerson.date_of_birth).getFullYear();
          const targetBirthYear = new Date(targetPerson.date_of_birth).getFullYear();

          // DEBUG for Bob Anderson
          if (source === '5' || target === '5') {
            console.log(`  Source Year: ${sourceBirthYear}, Target Year: ${targetBirthYear}`);
            console.log(`  sourceBirthYear > targetBirthYear: ${sourceBirthYear > targetBirthYear} (inverted if true)`);
          }

          // Only swap if the relationship is not already child->parent (i.e., if the data is not already inverted)
          // If the relationship is already child->parent, do not swap
          // If the relationship is parent->child but parent is younger, swap
          // Heuristic: If the relationship is marked as parent, but the source is younger, and the target is not a parent of the source, swap
          if (sourceBirthYear > targetBirthYear) {
            // Check if the target is already a parent of the source (i.e., the data is already inverted)
            const targetIsParentOfSource = relationships.some(r => {
              const rType = r.type || r.relationship_type;
              const rSource = String(r.source || r.from);
              const rTarget = String(r.target || r.to);
              return rType === 'parent' && rSource === target && rTarget === source;
            });
            if (!targetIsParentOfSource) {
              skippedInverted++;
              console.warn(`Fixing inverted relationship: ${sourcePerson.first_name} ${sourcePerson.last_name} (born ${sourceBirthYear}) marked as parent of ${targetPerson.first_name} ${targetPerson.last_name} (born ${targetBirthYear}). Swapping: ${target} -> ${source}`);
              // Swap source and target to fix the inversion
              const tempSource = source;
              source = target;
              target = tempSource;
              // Also swap the person objects for consistency
              const tempSourcePerson = sourcePerson;
              sourcePerson = targetPerson;
              targetPerson = tempSourcePerson;
            }
          }
        } else {
          skippedMissingDates++;
          if (source === '5' || target === '5') {
            console.log('  One or both birth dates are missing for this relationship.');
          }
        }

        // Parent -> Child relationship (only if not inverted)
        if (source === '5' || target === '5') {
          console.log(`  ADDING to maps: ${source} -> ${target}`);
        }

        addedToMaps++;
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
        // Only include current spouses in the spouse map for positioning
        // Ex-spouses and deceased spouses should not be positioned as couples
        if (!rel.is_ex && !rel.is_deceased) {
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


  // DEBUG: Check maps for Bob Anderson after processing
  const bobId = '5';
  console.log(`\n--- DEBUG: Bob Anderson (${bobId}) Maps After Processing ---`);
  console.log(`  parentToChildren for Bob:`, parentToChildren.has(bobId) ? Array.from(parentToChildren.get(bobId)) : 'N/A');
  console.log(`  childToParents for Bob:`, childToParents.has(bobId) ? Array.from(childToParents.get(bobId)) : 'N/A');
  console.log('---------------------------------------------------\n');
  
  // DEBUG: Show filtering statistics
  console.log('\n--- DEBUG: Relationship Filtering Statistics ---');
  console.log(`Total parent relationships processed: ${totalParentRels}`);
  console.log(`Skipped (missing person): ${skippedMissingPerson}`);
  console.log(`Skipped (inverted dates): ${skippedInverted}`);
  console.log(`Skipped (missing dates): ${skippedMissingDates}`);
  console.log(`Successfully added to maps: ${addedToMaps}`);
  console.log('----------------------------------------------------\n');
  
  // DEBUG: Show all relationship maps
  console.log('\n--- DEBUG: All Relationship Maps ---');
  console.log('parentToChildren:', Array.from(parentToChildren.entries()).map(([k,v]) => [k, Array.from(v)]));
  console.log('childToParents:', Array.from(childToParents.entries()).map(([k,v]) => [k, Array.from(v)]));
  console.log('----------------------------------------\n');

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
const calculateGenerations = (persons, childToParents, rootNodes, parentToChildren, spouseMap = null) => {
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
    
    // Add spouse to SAME generation (very important!)
    if (spouseMap && spouseMap.has(id)) {
      const spouseId = spouseMap.get(id);
      if (!visited.has(spouseId)) {
        queue.push({ id: spouseId, generation: generation }); // Same generation as spouse
      }
    }
    
    // Add children to next generation (lower/positive generations)
    if (parentToChildren && parentToChildren.has(id)) {
      const children = parentToChildren.get(id);
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, generation: generation + 1 });
        }
      });
    }
    
    // Add parents to previous generation (higher/negative generations)
    if (childToParents && childToParents.has(id)) {
      const parents = childToParents.get(id);
      parents.forEach(parentId => {
        if (!visited.has(parentId)) {
          queue.push({ id: parentId, generation: generation - 1 });
        }
      });
    }
  }

  // Handle any unvisited nodes (orphaned nodes)
  persons.forEach(person => {
    const id = String(person.id);
    if (!generations.has(id)) {
      generations.set(id, 999); // Put orphaned nodes far from root
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
const createHierarchicalNodes = (persons, generations, spouseMap, handlers, rootPersonId = null, childToParents = null) => {
  const nodes = [];
  const generationGroups = new Map();

  // Group persons by generation
  persons.forEach(person => {
    const id = String(person.id);
    let generation = generations.get(id) || 0;

    // --- ENHANCED WORKAROUND: Always group a deceased grandparent (like Molly) in the grandparent generation if:
    // 1. They are a spouse of a grandparent (spouse is in grandparent generation)
    // 2. OR they are a parent of a parent of the root (i.e., a true biological grandparent)
    let forceGrandparentGen = null;
    if (rootPersonId && childToParents) {
      const rootId = String(rootPersonId);
      // Get root's parents
      const rootParentIds = childToParents.get(rootId) ? Array.from(childToParents.get(rootId)) : [];
      // For each parent, get their parents (grandparents)
      let grandparentIds = [];
      rootParentIds.forEach(parentId => {
        const gps = childToParents.get(parentId);
        if (gps) grandparentIds.push(...Array.from(gps));
      });
      // If this person is a grandparent of the root, force their generation to match their spouse (if spouse is also a grandparent)
      if (grandparentIds.includes(id)) {
        // Find the minimum generation among all grandparents
        let minGrandGen = generation;
        grandparentIds.forEach(gpid => {
          if (generations.has(gpid)) {
            minGrandGen = Math.min(minGrandGen, generations.get(gpid));
          }
        });
        forceGrandparentGen = minGrandGen;
      }
    }

    // Also, if person is deceased and their spouse is in a lower generation, group them together
    if ((person.is_deceased || person.date_of_death) && spouseMap) {
      const spouseId = spouseMap.get(id);
      if (spouseId && generations.has(spouseId)) {
        const spouseGen = generations.get(spouseId);
        if (spouseGen < generation) {
          forceGrandparentGen = forceGrandparentGen !== null ? Math.min(forceGrandparentGen, spouseGen) : spouseGen;
        }
      }
    }

    if (forceGrandparentGen !== null) {
      generation = forceGrandparentGen;
    }

    if (!generationGroups.has(generation)) {
      generationGroups.set(generation, []);
    }
    generationGroups.get(generation).push(person);
  });

  // Sort each generation to prioritize root person first, then oldest person first (leftmost position)
  for (const [generation, generationPersons] of generationGroups) {
    generationPersons.sort((a, b) => {
      // If rootPersonId is specified, prioritize it first in its generation
      if (rootPersonId) {
        const aIsRoot = String(a.id) === String(rootPersonId);
        const bIsRoot = String(b.id) === String(rootPersonId);
        if (aIsRoot && !bIsRoot) return -1; // Root person comes first
        if (!aIsRoot && bIsRoot) return 1;  // Root person comes first
      }
      
      // Sort by birth date (oldest first)
      if (a.date_of_birth && b.date_of_birth) {
        const dateA = new Date(a.date_of_birth);
        const dateB = new Date(b.date_of_birth);
        return dateA.getTime() - dateB.getTime(); // Older person (earlier date) comes first
      }
      // If one has birth date and other doesn't, prioritize the one with birth date
      if (a.date_of_birth && !b.date_of_birth) return -1;
      if (!a.date_of_birth && b.date_of_birth) return 1;
      // If neither has birth date, sort by name for consistent ordering
      return (a.first_name + ' ' + a.last_name).localeCompare(b.first_name + ' ' + b.last_name);
    });
  }

  // Layout constants - enhanced spacing for better visual hierarchy
  const GENERATION_HEIGHT = 450;  // Increased vertical spacing between generations
  const NODE_WIDTH = 280;
  const NODE_MARGIN = 40;
  const currentSpouseSpacing = NODE_WIDTH + 50;  // 330, close spacing for current spouses
  const exSpouseSpacing = 120;
  const lateSpouseSpacing = 70;
  const SIBLING_SPACING = 460;    // Comfortable spacing for siblings from same parents
  const COUSIN_SPACING = 420;     // Closer spacing between different families (cousins)

  function getSpouseSpacing(spouseType) {
    switch (spouseType) {
      case "current":
        return currentSpouseSpacing;
      case "ex":
        return exSpouseSpacing;
      case "late":
        return lateSpouseSpacing;
      default:
        return NODE_WIDTH + NODE_MARGIN;
    }
  }

  // Find the minimum generation to adjust Y positioning
  const minGeneration = Math.min(...generationGroups.keys());
  
  // Create sorted generation array for consistent positioning
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
  
  // Position nodes generation by generation
  for (const [generation, generationPersons] of generationGroups) {
    // Calculate Y position based on the index in sorted generations (more compact)
    const generationIndex = sortedGenerations.indexOf(generation);
    const y = generationIndex * GENERATION_HEIGHT;
    const processedPersons = new Set();

    // Calculate total width needed for this generation with proper spacing
    const coupleCount = Math.floor(generationPersons.length / 2);
    const singleCount = generationPersons.length % 2;
    const totalWidth = (coupleCount * (NODE_WIDTH + SIBLING_SPACING)) + (singleCount * NODE_WIDTH) + ((coupleCount + singleCount - 1) * (SIBLING_SPACING - NODE_WIDTH));
    const startX = -totalWidth / 2;
    let xOffset = startX;

    // Group people by their parents (sibling groups)
    const siblingGroups = new Map(); // parentKey -> [siblings]
    const orphans = []; // people with no parents

    generationPersons.forEach(person => {
      const personId = String(person.id);
      const parents = childToParents && childToParents.get ? childToParents.get(personId) : null;
      
      if (parents && parents.size > 0) {
        // Create a key from sorted parent IDs
        const parentKey = Array.from(parents).sort().join('-');
        if (!siblingGroups.has(parentKey)) {
          siblingGroups.set(parentKey, []);
        }
        siblingGroups.get(parentKey).push(person);
      } else {
        orphans.push(person);
      }
    });

    // Position each sibling group
    Array.from(siblingGroups.values()).forEach((siblings, groupIndex) => {
      if (groupIndex > 0) {
        xOffset += COUSIN_SPACING; // Gap between different families
      }

      siblings.forEach(person => {
        const personId = String(person.id);
        if (processedPersons.has(personId)) return;
        
        const spouseId = spouseMap.get(personId);
        const spouse = spouseId ? siblings.find(p => String(p.id) === spouseId) : null;
        
        if (spouse && !processedPersons.has(spouseId)) {
          // Determine spouse type for spacing
          let spouseType = "current";
          if (spouse.is_ex) spouseType = "ex";
          else if (spouse.date_of_death || spouse.is_deceased) spouseType = "late";
          const spacing = getSpouseSpacing(spouseType);
          
          // Position spouse pair
          nodes.push(createPersonNode(person, xOffset, y, handlers));
          nodes.push(createPersonNode(spouse, xOffset + spacing, y, handlers));
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
    });

    // Position orphans (people with no parents) at the end
    if (orphans.length > 0 && siblingGroups.size > 0) {
      xOffset += COUSIN_SPACING; // Gap before orphans
    }
    
    orphans.forEach(person => {
      const personId = String(person.id);
      if (!processedPersons.has(personId)) {
        nodes.push(createPersonNode(person, xOffset, y, handlers));
        processedPersons.add(personId);
        xOffset += SIBLING_SPACING;
      }
    });
  }

  // Identify unrelated node ids (not connected to any other node by parent, spouse, sibling)
  const connectedIds = new Set();
  nodes.forEach(node => {
    // If node has any edge, it's considered connected
    // We'll mark all nodes as connected except those with no relationships
    // But for minimal change, let's just use persons with no parents, spouses, or siblings
    const person = persons.find(p => String(p.id) === node.id);
    if (!person) return;
    let hasRelation = false;
    // Check parent
    if (person.father_id || person.mother_id) hasRelation = true;
    // Check spouse
    if (spouseMap.has(String(person.id))) hasRelation = true;
    // Check siblings (if any)
    // Sibling logic is not perfect here, but we can skip for now
    if (hasRelation) connectedIds.add(node.id);
  });
  const unrelatedNodeIds = nodes.map(n => n.id).filter(id => !connectedIds.has(id));

  // Enhanced overlap avoidance function
  function avoidNodeOverlap(nodes, unrelatedNodeIds, nodeWidth = 240, nodeHeight = 180, margin = 40) {
    const isOverlapping = (nodeA, nodeB) => {
      return (
        Math.abs(nodeA.position.x - nodeB.position.x) < nodeWidth + margin &&
        Math.abs(nodeA.position.y - nodeB.position.y) < nodeHeight + margin
      );
    };
    
    // Apply overlap detection to all nodes, not just unrelated ones
    const allNodeIds = nodes.map(n => n.id);
    
    allNodeIds.forEach((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      let overlapped;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops
      
      do {
        overlapped = nodes.some(
          (other) =>
            other.id !== node.id && isOverlapping(node, other)
        );
        if (overlapped) {
          // Try different nudge directions to better distribute nodes
          if (attempts % 3 === 0) {
            node.position.x += nodeWidth + margin;
          } else if (attempts % 3 === 1) {
            node.position.y += nodeHeight + margin;
          } else {
            node.position.x -= nodeWidth + margin;
          }
          attempts++;
        }
      } while (overlapped && attempts < maxAttempts);
    });
    return nodes;
  }

  // Nudge unrelated nodes to avoid overlap
  avoidNodeOverlap(nodes, unrelatedNodeIds);

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
  const parentRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'parent');
  const spouseRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'spouse');
  const siblingRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'sibling');


  // Process parent relationships from corrected relationship maps
  // Use the corrected parentToChildren map instead of raw relationships
  relationshipMaps.parentToChildren.forEach((children, parentId) => {
    children.forEach(childId => {
      const connectionKey = `parent-${parentId}-${childId}`;
      // DEBUG: Log parent/child edge creation
      if (typeof window !== 'undefined' && window.console) {
        console.log('[FAMILY TREE DEBUG] Creating parent edge:', { parentId, childId });
      }
      if (!processedConnections.has(connectionKey)) {
        edges.push({
          id: connectionKey,
          source: parentId,
          target: childId,
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
  });

  // Process spouse relationships - create horizontal connections
  spouseRelationships.forEach(relationship => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    const connectionKey = `spouse-${Math.min(source, target)}-${Math.max(source, target)}`;

    if (!processedConnections.has(connectionKey)) {
      // Determine the relationship status and color
      const isEx = relationship.is_ex === true;
      const isDeceased = relationship.is_deceased === true;
      // Choose color based on relationship status
      let strokeColor = '#ec4899'; // Default: pink for current spouse
      if (isDeceased) {
        strokeColor = '#000000'; // Black for deceased spouse
      } else if (isEx) {
        strokeColor = '#9ca3af'; // Grey for ex-spouse
      }
      edges.push({
        id: connectionKey,
        source,
        target,
        type: 'straight',
        animated: false,
        style: {
          stroke: strokeColor,
          strokeWidth: 3,
          strokeDasharray: '5 5'
        }
      });
      processedConnections.add(connectionKey);
    }
  });

  // REMOVED: AUTO-INFER STEP-GRANDPARENT EDGES
  // Step-grandparent relationships should only be shown in text labels via the relationship calculator,
  // not as visual connectors. Visual connectors should only represent direct biological relationships
  // and formal spouse relationships. Step-relationships are inferred and displayed as text only.

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
    if ((rel.type || rel.relationship_type) === 'parent') {
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
}
