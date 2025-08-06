import { Position } from '@xyflow/react';
import { preventNodeOverlap, applyRelationshipSpacing } from './antiOverlapLayout.js';
import { enhanceNodeVisuals, enhanceEdgeVisuals, applyVisualComplexitySpacing } from './visualConfiguration.js';

/**
 * Determines if a spouse should be marked as "late" based on the rules:
 * - If only ONE spouse is deceased → mark as "late spouse"
 * - If BOTH spouses are deceased AND no new marriages → NOT marked as "late" (married in heaven)
 */
function shouldMarkAsLateSpouse(person1, person2, allRelationships = []) {
  const person1Deceased = person1.date_of_death || person1.is_deceased;
  const person2Deceased = person2.date_of_death || person2.is_deceased;
  
  // If neither is deceased, not a late spouse
  if (!person1Deceased && !person2Deceased) {
    return false;
  }
  
  // If only one is deceased, mark as late spouse
  if (person1Deceased && !person2Deceased) {
    return true;
  }
  if (!person1Deceased && person2Deceased) {
    return true;
  }
  
  // If both are deceased, check if either had subsequent marriages
  // If no subsequent marriages, they're "married in heaven" (not marked as late)
  if (person1Deceased && person2Deceased) {
    // For now, if both are deceased, don't mark as late (married in heaven)
    // TODO: Add logic to check for subsequent marriages if needed
    return false;
  }
  
  return false;
}
/**
 * Collects all family members connected to a root person using breadth-first search
 * Traverses the family network to find everyone related to the starting person
 * @param {string|number} rootId - The starting person for the family tree
 * @param {Array} allPersons - Complete list of people in the database
 * @param {Array} allRelationships - Complete list of family relationships
 * @returns {Object} - Connected family members and their relationships
 */
export function collectConnectedFamily(rootId, allPersons, allRelationships) {
  // Build lookup table for efficient relationship searches
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

  // Use breadth-first search to traverse family connections
  const visited = new Set();
  const queue = [String(rootId)];
  const connectedPersons = [];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const person = allPersons.find(p => String(p.id) === currentId);
    if (person) connectedPersons.push(person);
    
    // Add connected relatives to search queue
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

  // Step 3: Filter relationships to only include connected family members
  const connectedPersonIds = new Set(connectedPersons.map(p => String(p.id)));
  const connectedRelationships = allRelationships.filter(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    return connectedPersonIds.has(source) && connectedPersonIds.has(target);
  });

  // Return the complete connected family network
  return {
    persons: connectedPersons,
    relationships: connectedRelationships,
  };
}
export const createFamilyTreeLayout = (persons, relationships, handlers = {}, rootPersonId = null) => {
  // Input validation - defensive programming practice
  if (!persons || !relationships) {
    return { nodes: [], edges: [] };
  }

  // Phase 1: Create data structures for efficient relationship lookups
  const relationshipMaps = buildRelationshipMaps(relationships, persons);
  
  // Phase 2: Determine tree root - either user-selected or automatically detected
  let rootNodes;
  let useAgeBasedGenerations = false;
  
  if (rootPersonId) {
    // Use the selected root person as the only root
    rootNodes = [String(rootPersonId)];
  } else {
    // Full tree mode: Use relationship-based generations with multiple root nodes
    // This provides better family hierarchy than age-based grouping
    useAgeBasedGenerations = false;
    rootNodes = findRootNodes(persons, relationshipMaps.childToParents);
  }

  // Step 3: Calculate generations for each person
  let generations;
  if (useAgeBasedGenerations) {
    // Full tree mode: Use age-based generational grouping
    generations = calculateAgeBasedGenerations(persons, relationships);
  } else {
    // Root-based mode: Use relationship-based generations
    generations = calculateGenerations(persons, relationshipMaps.childToParents, rootNodes, relationshipMaps.parentToChildren, relationshipMaps.spouseMap, relationshipMaps.exSpouseMap, relationships);
  }

  // Step 4: Create nodes with hierarchical positioning (prioritize rootPersonId)
  const nodes = createHierarchicalNodes(persons, generations, relationshipMaps.spouseMap, handlers, rootPersonId, relationshipMaps.childToParents);

  // Step 5: Create simplified edges (no duplication)
  const edges = createSimplifiedEdges(relationships, relationshipMaps, persons);
  

  // Step 6: Apply anti-overlap positioning to prevent overlapping nodes
  
  // Pass generation information to anti-overlap system to preserve hierarchy
  const generationLookup = new Map();
  nodes.forEach(node => {
    const person = persons.find(p => String(p.id) === node.id);
    if (person) {
      const generation = generations.get(String(person.id));
      generationLookup.set(node.id, generation);
    }
  });
  
  
  const antiOverlapNodes = preventNodeOverlap(nodes, edges, relationshipMaps, persons, generationLookup);
  
  
  
  // Step 7: Apply relationship-specific spacing adjustments
  
  const spacedNodes = applyRelationshipSpacing(antiOverlapNodes, edges, relationshipMaps);
  
  
  // Step 8: Apply visual complexity spacing for better readability
  
  const visuallySpacedNodes = applyVisualComplexitySpacing(spacedNodes, edges, relationshipMaps);
  
  
  // Step 9: Enhance node visuals based on relationship complexity
  const enhancedNodes = visuallySpacedNodes.map(node => 
    enhanceNodeVisuals(node, relationshipMaps, edges)
  );
  
  
  // Step 10: Enhance edge visuals for better relationship visualization
  const enhancedEdges = enhanceEdgeVisuals(edges, relationshipMaps);


  return { nodes: enhancedNodes, edges: enhancedEdges };
};

/**
 * Age-Based Generation Calculator - Advanced Feature
 * Organizes family members by birth year ranges rather than relationship hierarchy
 * Includes spouse alignment and parent-child validation logic
 * @param {Array} persons - List of family members with birth dates
 * @param {Array} relationships - Family connections (marriages, parent-child)
 * @returns {Map} - Maps each person to their generational level (0 = oldest)
 */
function calculateAgeBasedGenerations(persons, relationships) {
  const generations = new Map();
  
  // Build lookup tables - optimization technique for faster relationship searches
  const spouseMap = new Map();
  const parentToChildren = new Map();
  const childToParents = new Map();
  
  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    const relationshipType = rel.type || rel.relationship_type;
    
    if (relationshipType === 'spouse' && !rel.is_ex) {
      spouseMap.set(source, target);
      spouseMap.set(target, source);
    } else if (relationshipType === 'parent') {
      // Fix data inconsistencies - some relationships were entered backwards
      const sourcePerson = persons.find(p => String(p.id) === source);
      const targetPerson = persons.find(p => String(p.id) === target);
      
      // Data validation - check if parent is actually older than child
      if (sourcePerson && targetPerson && sourcePerson.date_of_birth && targetPerson.date_of_birth) {
        const sourceBirthYear = new Date(sourcePerson.date_of_birth).getFullYear();
        const targetBirthYear = new Date(targetPerson.date_of_birth).getFullYear();
        
        // Found a backwards relationship - fix it by swapping
        if (sourceBirthYear > targetBirthYear) {
          // Check if we already have the correct relationship
          const alreadyCorrect = relationships.some(r => {
            const rType = r.type || r.relationship_type;
            const rSource = String(r.source || r.from);
            const rTarget = String(r.target || r.to);
            return rType === 'parent' && rSource === target && rTarget === source;
          });
          
          if (!alreadyCorrect) {
            // Swap to correct the relationship
            const tempSource = source;
            const correctedParent = target;
            const correctedChild = tempSource;
            
            if (!parentToChildren.has(correctedParent)) {
              parentToChildren.set(correctedParent, new Set());
            }
            parentToChildren.get(correctedParent).add(correctedChild);
            
            if (!childToParents.has(correctedChild)) {
              childToParents.set(correctedChild, new Set());
            }
            childToParents.get(correctedChild).add(correctedParent);
            return;
          }
        }
      }
      
      // Normal case - parent is older than child
      if (!parentToChildren.has(source)) {
        parentToChildren.set(source, new Set());
      }
      parentToChildren.get(source).add(target);
      
      if (!childToParents.has(target)) {
        childToParents.set(target, new Set());
      }
      childToParents.get(target).add(source);
    } else if (relationshipType === 'child') {
      // Child relationship (reverse of parent)
      if (!parentToChildren.has(target)) {
        parentToChildren.set(target, new Set());
      }
      parentToChildren.get(target).add(source);
      
      if (!childToParents.has(source)) {
        childToParents.set(source, new Set());
      }
      childToParents.get(source).add(target);
    }
  });
  
  // Get birth years for all people with dates
  const birthYears = persons
    .filter(person => person.date_of_birth)
    .map(person => ({
      id: String(person.id),
      birthYear: new Date(person.date_of_birth).getFullYear(),
      person
    }))
    .sort((a, b) => a.birthYear - b.birthYear);
  
  if (birthYears.length === 0) {
    // If no birth dates, assign all to same generation
    persons.forEach(person => {
      generations.set(String(person.id), 0);
    });
    return generations;
  }
  
  // Research shows 25-year spans work well as typical generation length
  const GENERATION_SPAN = 25;
  const oldestYear = birthYears[0].birthYear;
  
  // First pass: Group people by birth year ranges
  birthYears.forEach(({ id, birthYear }) => {
    const generationLevel = Math.floor((birthYear - oldestYear) / GENERATION_SPAN);
    generations.set(id, generationLevel);
  });
  
  // Handle missing data - some people don't have birth dates in our database
  persons.forEach(person => {
    const personId = String(person.id);
    if (!generations.has(personId)) {
      // Smart fallback - use family relationships to guess generation
      const spouse = spouseMap.get(personId);
      if (spouse && generations.has(spouse)) {
        generations.set(personId, generations.get(spouse));
      } else {
        // Assign to middle generation as fallback
        const maxGeneration = Math.max(...Array.from(generations.values()));
        generations.set(personId, Math.floor(maxGeneration / 2));
      }
    }
  });
  
  // Second pass: Make sure married couples are on the same level
  let spouseAlignmentChanged = true;
  let iterations = 0;
  const maxIterations = 10;
  
  while (spouseAlignmentChanged && iterations < maxIterations) {
    spouseAlignmentChanged = false;
    iterations++;
    
    spouseMap.forEach((spouseId, personId) => {
      if (generations.has(personId) && generations.has(spouseId)) {
        const personGen = generations.get(personId);
        const spouseGen = generations.get(spouseId);
        
        if (personGen !== spouseGen) {
          // Decide which generation level makes more sense
          const person = persons.find(p => String(p.id) === personId);
          const spouse = persons.find(p => String(p.id) === spouseId);
          
          let targetGen = Math.min(personGen, spouseGen); // Default to older generation
          
          // If both have birth dates, use the one that makes more chronological sense
          if (person?.date_of_birth && spouse?.date_of_birth) {
            const personBirthYear = new Date(person.date_of_birth).getFullYear();
            const spouseBirthYear = new Date(spouse.date_of_birth).getFullYear();
            const avgBirthYear = (personBirthYear + spouseBirthYear) / 2;
            targetGen = Math.floor((avgBirthYear - oldestYear) / GENERATION_SPAN);
          }
          
          generations.set(personId, targetGen);
          generations.set(spouseId, targetGen);
          spouseAlignmentChanged = true;
        }
      }
    });
  }
  
  // Third pass: Ensure parent-child hierarchy while preserving age grouping
  // Only adjust when age difference is significant to maintain clustering
  let parentChildAlignmentChanged = true;
  iterations = 0;
  
  while (parentChildAlignmentChanged && iterations < maxIterations) {
    parentChildAlignmentChanged = false;
    iterations++;
    
    parentToChildren.forEach((children, parentId) => {
      if (!generations.has(parentId)) return;
      
      const parentGen = generations.get(parentId);
      const parent = persons.find(p => String(p.id) === parentId);
      
      children.forEach(childId => {
        if (!generations.has(childId)) return;
        
        const childGen = generations.get(childId);
        const child = persons.find(p => String(p.id) === childId);
        
        // Check if parent-child hierarchy needs fixing
        if (parentGen >= childGen) {
          // Only adjust if there's a meaningful age gap (15+ years)
          let shouldAdjust = true;
          
          if (parent?.date_of_birth && child?.date_of_birth) {
            const parentBirthYear = new Date(parent.date_of_birth).getFullYear();
            const childBirthYear = new Date(child.date_of_birth).getFullYear();
            const ageDifference = childBirthYear - parentBirthYear;
            
            // Don't adjust for small age gaps - preserves age-based clustering
            if (ageDifference < 15) {
              shouldAdjust = false;
            }
          }
          
          if (shouldAdjust) {
            const newParentGen = Math.max(0, childGen - 1);
            generations.set(parentId, newParentGen);
            parentChildAlignmentChanged = true;
            
            // Also adjust parent's spouse if they exist
            const parentSpouse = spouseMap.get(parentId);
            if (parentSpouse && generations.has(parentSpouse)) {
              generations.set(parentSpouse, newParentGen);
            }
          }
        }
      });
    });
  }
  
  return generations;
}

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
  const exSpouseMap = new Map();
  const siblingMap = new Map();
  
  


  relationships.forEach(rel => {
    let source = String(rel.source || rel.from);
    let target = String(rel.target || rel.to);

    // Support both 'type' and 'relationship_type' field names for flexibility
    const relationshipType = rel.type || rel.relationship_type;

    switch (relationshipType) {
      case 'parent': {
        // Validate relationship based on birth dates to prevent inverted hierarchies
        let sourcePerson = persons.find(p => String(p.id) === source);
        let targetPerson = persons.find(p => String(p.id) === target);

        // Skip relationships where one or both persons are not found
        if (!sourcePerson || !targetPerson) {
          return; // Skip to next relationship
        }

        // Only invert if the relationship is truly inverted (parent is younger than child and the relationship is not already child->parent)
        if (sourcePerson.date_of_birth && targetPerson.date_of_birth) {
          const sourceBirthYear = new Date(sourcePerson.date_of_birth).getFullYear();
          const targetBirthYear = new Date(targetPerson.date_of_birth).getFullYear();

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
        }

        // Parent -> Child relationship (only if not inverted)
        if (!parentToChildren.has(source)) {
          parentToChildren.set(source, new Set());
        }
        parentToChildren.get(source).add(target);

        if (!childToParents.has(target)) {
          childToParents.set(target, new Set());
        }
        childToParents.get(target).add(source);
        break;
      }
        
      case 'spouse': {
        // Only include current spouses in the spouse map for positioning
        // Ex-spouses and deceased spouses should not be positioned as couples
        // Also check if either person is actually deceased
        const sourcePersonForSpouse = persons.find(p => String(p.id) === source);
        const targetPersonForSpouse = persons.find(p => String(p.id) === target);
        const isActuallyDeceased = (sourcePersonForSpouse?.date_of_death || sourcePersonForSpouse?.is_deceased) || 
                                  (targetPersonForSpouse?.date_of_death || targetPersonForSpouse?.is_deceased);
        
        if (!rel.is_ex && (!isActuallyDeceased || rel.is_deceased)) {
          // Include current spouses AND legitimate late spouses (is_deceased: true)
          // Exclude ex-spouses and posthumous marriages (deceased but not marked as legitimate late spouse)
          spouseMap.set(source, target);
          spouseMap.set(target, source);
        } else if (rel.is_ex || (isActuallyDeceased && !rel.is_deceased)) {
          // Add ex-spouses and posthumous marriages to exSpouseMap
          // Posthumous marriages are deceased people but NOT marked as legitimate late spouse
          if (!exSpouseMap.has(source)) {
            exSpouseMap.set(source, new Set());
          }
          if (!exSpouseMap.has(target)) {
            exSpouseMap.set(target, new Set());
          }
          exSpouseMap.get(source).add(target);
          exSpouseMap.get(target).add(source);
        }
        break;
      }
        
      case 'sibling':
      case 'brother':
      case 'sister':
      case 'Brother':
      case 'Sister':
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

// Find people who don't have parents (the top of each family tree)
const findRootNodes = (persons, childToParents) => {
  return persons
    .filter(person => !childToParents.has(String(person.id)))
    .map(person => String(person.id));
};

// Figure out which people belong to the same family
// So we don't put everyone at the top level
const groupFamilyTrees = (persons, childToParents, parentToChildren, spouseMap, rootNodes) => {
  const familyGroups = [];
  const visited = new Set();
  
  // Start from each root person and find everyone connected to them
  rootNodes.forEach(rootId => {
    if (visited.has(rootId)) return;
    
    const familyGroup = new Set();
    const queue = [rootId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (visited.has(currentId) || familyGroup.has(currentId)) continue;
      
      visited.add(currentId);
      familyGroup.add(currentId);
      
      // Grab all the relatives of this person
      if (parentToChildren.has(currentId)) {
        parentToChildren.get(currentId).forEach(childId => {
          if (!visited.has(childId)) queue.push(childId);
        });
      }
      
      if (childToParents.has(currentId)) {
        childToParents.get(currentId).forEach(parentId => {
          if (!visited.has(parentId)) queue.push(parentId);
        });
      }
      
      if (spouseMap && spouseMap.has(currentId)) {
        const spouseId = spouseMap.get(currentId);
        if (!visited.has(spouseId)) queue.push(spouseId);
      }
    }
    
    if (familyGroup.size > 0) {
      familyGroups.push({
        rootId: rootId,
        members: Array.from(familyGroup),
        size: familyGroup.size
      });
    }
  });
  
  // Put bigger families first, then older people
  familyGroups.sort((a, b) => {
    const sizeComparison = b.size - a.size;
    if (sizeComparison !== 0) return sizeComparison;
    
    const rootPersonA = persons.find(p => String(p.id) === a.rootId);
    const rootPersonB = persons.find(p => String(p.id) === b.rootId);
    
    const ageA = rootPersonA?.date_of_birth ? new Date(rootPersonA.date_of_birth).getFullYear() : 9999;
    const ageB = rootPersonB?.date_of_birth ? new Date(rootPersonB.date_of_birth).getFullYear() : 9999;
    
    return ageA - ageB;
  });
  
  return familyGroups;
};

// This function figures out what generation each person should be on
const calculateGenerations = (persons, childToParents, rootNodes, parentToChildren, spouseMap = null, exSpouseMap = null, relationships = []) => {
  const generations = new Map();
  const visited = new Set();
  const queue = [];

  // If we have only one root node (user selected specific person), use simple BFS
  // If we have multiple root nodes (full tree mode), use family grouping
  if (rootNodes.length === 1) {
    // Simple BFS from single selected root
    const singleRoot = rootNodes[0];
    
    // Make sure we start fresh with just the person we picked
    queue.length = 0;
    queue.push({ id: singleRoot, generation: 0 });
    
    // const rootPerson = persons.find(p => String(p.id) === singleRoot);
    
    // Simple BFS traversal without family grouping complexity
    while (queue.length > 0) {
      const { id, generation } = queue.shift();
      
      if (visited.has(id)) {
        continue;
      }
      visited.add(id);
      
      // Don't override if already assigned (prevent duplicate processing)
      if (generations.has(id)) {
        continue;
      }
      
      generations.set(id, generation);
      
      const currentPerson = persons.find(p => String(p.id) === id);
      
      
      // Add spouses to same generation
      if (spouseMap && spouseMap.has(id)) {
        const spouseId = spouseMap.get(id);
        if (!visited.has(spouseId)) {
          queue.push({ id: spouseId, generation: generation });
        }
      }
      
      // Add ex-spouses to same generation
      if (exSpouseMap && exSpouseMap.has(id)) {
        const exSpouses = exSpouseMap.get(id);
        exSpouses.forEach(exSpouseId => {
          if (!visited.has(exSpouseId)) {
            queue.push({ id: exSpouseId, generation: generation });
          }
        });
      }
      
      // Add children to next generation
      if (parentToChildren && parentToChildren.has(id)) {
        const children = parentToChildren.get(id);
        children.forEach(childId => {
          if (!visited.has(childId)) {
            queue.push({ id: childId, generation: generation + 1 });
          }
        });
      }
      
      // Add parents to previous generation
      if (childToParents && childToParents.has(id)) {
        const parents = childToParents.get(id);
        
        parents.forEach(parentId => {
          if (!visited.has(parentId)) {
            // const parent = persons.find(p => String(p.id) === parentId);
            
            // Parents are always one generation above their children
            const parentGeneration = generation - 1;
            
            queue.push({ id: parentId, generation: parentGeneration });
          }
        });
      }
      
      // Add siblings to same generation
      if (relationships && relationships.length > 0) {
        relationships.forEach(rel => {
          const source = String(rel.source || rel.from);
          const target = String(rel.target || rel.to);
          const type = rel.type || rel.relationship_type;
          
          if (['sibling', 'brother', 'sister', 'Brother', 'Sister'].includes(type)) {
            if (source === id && !visited.has(target)) {
              queue.push({ id: target, generation: generation });
            }
            else if (target === id && !visited.has(source)) {
              queue.push({ id: source, generation: generation });
            }
          }
        });
      }
    }
  } else {
    // Multiple root nodes - use family grouping logic
    const familyGroups = groupFamilyTrees(persons, childToParents, parentToChildren, spouseMap, rootNodes);
    
    // Need to separate different families so they don't all end up at generation 0
    let generationOffset = 0;
    const GENERATION_SPACING = 10; // Put some space between unrelated families
  
  familyGroups.forEach((familyGroup) => {
    // Start this family tree at the current offset
    queue.push({ id: familyGroup.rootId, generation: generationOffset });
    
    // Process this entire family tree
    const familyVisited = new Set();
    
    while (queue.length > 0) {
      const { id, generation } = queue.shift();
      
      if (visited.has(id) || familyVisited.has(id)) continue;
      visited.add(id);
      familyVisited.add(id);
      
      generations.set(id, generation);
      
      // Only process relationships within this family group
      if (!familyGroup.members.includes(id)) continue;
      
      // Spouses should be on the same level as each other
      if (spouseMap && spouseMap.has(id)) {
        const spouseId = spouseMap.get(id);
        if (!visited.has(spouseId) && familyGroup.members.includes(spouseId)) {
          queue.push({ id: spouseId, generation: generation });
        }
      }
      
      // Ex-spouses also go on same level (usually same age anyway)
      if (exSpouseMap && exSpouseMap.has(id)) {
        const exSpouses = exSpouseMap.get(id);
        exSpouses.forEach(exSpouseId => {
          if (!visited.has(exSpouseId) && familyGroup.members.includes(exSpouseId)) {
            queue.push({ id: exSpouseId, generation: generation });
          }
        });
      }
      
      // Children go one level down
      if (parentToChildren && parentToChildren.has(id)) {
        const children = parentToChildren.get(id);
        
        children.forEach(childId => {
          if (!visited.has(childId) && familyGroup.members.includes(childId)) {
            queue.push({ id: childId, generation: generation + 1 });
          }
        });
      }
      
      // Parents go one level up
      if (childToParents && childToParents.has(id)) {
        const parents = childToParents.get(id);
        parents.forEach(parentId => {
          if (!visited.has(parentId) && familyGroup.members.includes(parentId)) {
            queue.push({ id: parentId, generation: generation - 1 });
          }
        });
      }
      
      // Siblings stay on same level
      if (relationships && relationships.length > 0) {
        relationships.forEach(rel => {
          const source = String(rel.source || rel.from);
          const target = String(rel.target || rel.to);
          const type = rel.type || rel.relationship_type;
          
          if (['sibling', 'brother', 'sister', 'Brother', 'Sister'].includes(type)) {
            if (source === id && !visited.has(target) && familyGroup.members.includes(target)) {
              queue.push({ id: target, generation: generation });
            }
            else if (target === id && !visited.has(source) && familyGroup.members.includes(source)) {
              queue.push({ id: source, generation: generation });
            }
          }
        });
      }
    }
    
    // Figure out how much space this family took up
    // So we can put the next family below it
    const familyGenerations = familyGroup.members
      .filter(memberId => generations.has(memberId))
      .map(memberId => generations.get(memberId));
    
    if (familyGenerations.length > 0) {
      // const minGen = Math.min(...familyGenerations);
      const maxGen = Math.max(...familyGenerations);
      generationOffset = maxGen + GENERATION_SPACING;
    }
  });
  } // End of multiple root mode
  
  // Common post-processing for both single and multiple root modes
  // If someone didn't get assigned to any family group, put them way down
  persons.forEach(person => {
    const id = String(person.id);
    if (!generations.has(id)) {
      generations.set(id, 999);
    }
  });

  // Sometimes spouses end up on different levels by mistake
  // Need to fix that but be careful not to mess up parent-child stuff
  if (spouseMap) {
    let changed = true;
    while (changed) {
      changed = false;
      spouseMap.forEach((spouseId, personId) => {
        if (generations.has(personId) && generations.has(spouseId)) {
          const personGen = generations.get(personId);
          const spouseGen = generations.get(spouseId);
          
          if (personGen !== spouseGen) {
            // Check if aligning spouses would break parent-child relationships
            const wouldBreakHierarchy = checkIfSpouseAlignmentBreaksHierarchy(
              personId, spouseId, personGen, spouseGen, 
              childToParents, parentToChildren, generations, persons
            );
            
            if (!wouldBreakHierarchy) {
              // Use the minimum generation (higher in hierarchy) for both spouses
              const minGen = Math.min(personGen, spouseGen);
              
              generations.set(personId, minGen);
              generations.set(spouseId, minGen);
              changed = true;
            }
          }
        }
      });
    }
  }

  // Make sure parents of the same child are on the same level
  // Even if they are not married, people who have a child together should be at the same generation
  // This runs MULTIPLE times to ensure all co-parent relationships are properly aligned
  if (childToParents) {
    // Run co-parent alignment multiple passes to handle complex interactions
    for (let pass = 0; pass < 3; pass++) {
      let changed = true;
      let iterations = 0;
      const maxIterations = 10; // Prevent infinite loops
      
      while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;
        
        // First align co-parents
        childToParents.forEach((parents) => {
          if (parents.size >= 2) {
            // Get all parents of this child
            const parentList = Array.from(parents);
            const parentGens = parentList.map(parentId => generations.get(parentId)).filter(gen => gen !== undefined);
            
            if (parentGens.length >= 2) {
              // All co-parents should be at the same generation level
              // Use the minimum generation (higher in hierarchy)
              const minGen = Math.min(...parentGens);
              
              parentList.forEach(parentId => {
                if (generations.has(parentId)) {
                  const currentGen = generations.get(parentId);
                  if (currentGen !== minGen) {
                    generations.set(parentId, minGen);
                    changed = true;
                  }
                }
              });
            }
          }
        });
        
        // Then apply spouse alignment to maintain spouse consistency
        if (spouseMap) {
          spouseMap.forEach((spouseId, personId) => {
            if (generations.has(personId) && generations.has(spouseId)) {
              const personGen = generations.get(personId);
              const spouseGen = generations.get(spouseId);
              
              if (personGen !== spouseGen) {
                const minGen = Math.min(personGen, spouseGen);
                generations.set(personId, minGen);
                generations.set(spouseId, minGen);
                changed = true;
              }
            }
          });
        }
      }
    }
  }

  // Fix up in-law positioning so families line up better
  // This handles parents-in-law, uncle-in-law, and other same-generation relationships
  let generationChanged = true;
  let genIterations = 0;
  const maxGenIterations = 8; // Increased iterations for complex cases
  
  while (generationChanged && genIterations < maxGenIterations) {
    generationChanged = false;
    genIterations++;
    
    // Put all siblings on same level
    // Do sibling alignment first to establish baseline
    const siblingRelationships = relationships.filter(rel => {
      const type = rel.type || rel.relationship_type;
      return ['sibling', 'brother', 'sister', 'Brother', 'Sister'].includes(type);
    });
    
    siblingRelationships.forEach(rel => {
      const source = String(rel.source || rel.from);
      const target = String(rel.target || rel.to);
      
      if (generations.has(source) && generations.has(target)) {
        const sourceGen = generations.get(source);
        const targetGen = generations.get(target);
        
        if (sourceGen !== targetGen) {
          const minGen = Math.min(sourceGen, targetGen);
          generations.set(source, minGen);
          generations.set(target, minGen);
          generationChanged = true;
        }
      }
    });
    
    // Keep married people together
    if (spouseMap) {
      spouseMap.forEach((spouseId, personId) => {
        if (generations.has(personId) && generations.has(spouseId)) {
          const personGen = generations.get(personId);
          const spouseGen = generations.get(spouseId);
          
          if (personGen !== spouseGen) {
            const minGen = Math.min(personGen, spouseGen);
            generations.set(personId, minGen);
            generations.set(spouseId, minGen);
            generationChanged = true;
          }
        }
      });
    }
    
    // Make sure both sets of parents are on same level
    // This must run AFTER sibling/spouse alignment to override any conflicts
    if (spouseMap) {
      spouseMap.forEach((spouseId, personId) => {
        if (generations.has(personId) && generations.has(spouseId)) {
          // Get parents of both spouses
          const personParents = Array.from(childToParents.get(personId) || []);
          const spouseParents = Array.from(childToParents.get(spouseId) || []);
          
          // Combine all parents from both spouses
          const allParents = [...personParents, ...spouseParents];
          
          if (allParents.length >= 2) {
            // Get all current generation assignments for these parents
            const parentGenerations = allParents
              .map(parentId => generations.get(parentId))
              .filter(gen => gen !== undefined);
            
            if (parentGenerations.length >= 2) {
              // Get the spouse pair's generation to determine where parents should be
              const spouseGeneration = Math.max(generations.get(personId), generations.get(spouseId));
              // Parents should be one generation above their children
              const targetGeneration = spouseGeneration - 1;
              
              // Don't move parents if they would conflict with existing root positioning
              // Check if any parent is already positioned correctly relative to other children
              const shouldSkipAlignment = allParents.some(parentId => {
                if (!generations.has(parentId)) return false;
                const parentGen = generations.get(parentId);
                
                // Check if this parent has other children at correct generational distance
                if (parentToChildren && parentToChildren.has(parentId)) {
                  const parentChildren = Array.from(parentToChildren.get(parentId) || []);
                  const hasCorrectlyPositionedChild = parentChildren.some(childId => {
                    const childGen = generations.get(childId);
                    return childGen !== undefined && childGen === parentGen + 1;
                  });
                  return hasCorrectlyPositionedChild;
                }
                return false;
              });
              
              if (shouldSkipAlignment) {
                return;
              }
              
              // FORCEFULLY align all parents to this generation (parent-in-law priority)
              allParents.forEach(parentId => {
                if (generations.has(parentId)) {
                  const currentGen = generations.get(parentId);
                  if (currentGen !== targetGeneration) {
                    generations.set(parentId, targetGeneration);
                    generationChanged = true;
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  // Last chance to fix parent-in-law positioning
  // This ensures that parents of married couples are ALWAYS at the same generation
  if (spouseMap) {
    spouseMap.forEach((spouseId, personId) => {
      if (generations.has(personId) && generations.has(spouseId)) {
        const personParents = Array.from(childToParents.get(personId) || []);
        const spouseParents = Array.from(childToParents.get(spouseId) || []);
        const allParents = [...personParents, ...spouseParents];
        
        if (allParents.length >= 2) {
          const parentGenerations = allParents
            .map(parentId => generations.get(parentId))
            .filter(gen => gen !== undefined);
          
          if (parentGenerations.length >= 2) {
            // Get the spouse pair's generation to determine where parents should be
            const spouseGeneration = Math.max(generations.get(personId), generations.get(spouseId));
            // Parents should be one generation above their children
            const targetGeneration = spouseGeneration - 1;
            
            // Don't move parents if they would conflict with existing root positioning
            const shouldSkipAlignment = allParents.some(parentId => {
              if (!generations.has(parentId)) return false;
              const parentGen = generations.get(parentId);
              
              // Check if this parent has other children at correct generational distance
              if (parentToChildren && parentToChildren.has(parentId)) {
                const parentChildren = Array.from(parentToChildren.get(parentId) || []);
                const hasCorrectlyPositionedChild = parentChildren.some(childId => {
                  const childGen = generations.get(childId);
                  return childGen !== undefined && childGen === parentGen + 1;
                });
                return hasCorrectlyPositionedChild;
              }
              return false;
            });
            
            if (shouldSkipAlignment) {
              return;
            }
            
            // FORCE all parents to the same generation (overrides all other alignments)
            allParents.forEach(parentId => {
              if (generations.has(parentId)) {
                generations.set(parentId, targetGeneration);
              }
            });
          }
        }
      }
    });
  }

  // Final validation: enforce parent-child generation relationships
  // Children must ALWAYS be one generation below their parents
  // Run multiple passes to handle cascading effects
  
  if (childToParents) {
    for (let pass = 0; pass < 3; pass++) {
      let changed = false;
      
      childToParents.forEach((parents, childId) => {
        if (generations.has(childId)) {
          const childGeneration = generations.get(childId);
          
          parents.forEach(parentId => {
            if (generations.has(parentId)) {
              const parentGeneration = generations.get(parentId);
              
              // Parent must be exactly one generation above child (lower number = higher in tree)
              // If parent generation >= child generation, move child down
              if (parentGeneration >= childGeneration) {
                const newChildGeneration = parentGeneration + 1;
                const person = persons.find(p => String(p.id) === childId);
                const parent = persons.find(p => String(p.id) === parentId);
                generations.set(childId, newChildGeneration);
                changed = true;
              }
            }
          });
        }
      });
      
      if (!changed) break; // Stop if no changes were made
    }
  }


  return generations;
};

/**
 * Check if aligning spouses to the same generation would break parent-child hierarchies
 * @param {string} personId - First spouse ID
 * @param {string} spouseId - Second spouse ID  
 * @param {number} personGen - Person's current generation
 * @param {number} spouseGen - Spouse's current generation
 * @param {Map} childToParents - Child to parents mapping
 * @param {Map} parentToChildren - Parent to children mapping
 * @param {Map} generations - Current generation assignments
 * @param {Array} persons - All persons data
 * @returns {boolean} - True if alignment would break hierarchy
 */
const checkIfSpouseAlignmentBreaksHierarchy = (
  personId, spouseId, personGen, spouseGen, 
  childToParents, parentToChildren, generations, persons
) => {
  const minGen = Math.min(personGen, spouseGen);
  
  // Check if moving either person to minGen would violate parent-child rules
  const checkPerson = (id, newGen) => {
    // Check if person's parents would be at same or lower generation
    const parents = childToParents.get(id) || new Set();
    for (const parentId of parents) {
      const parentGen = generations.get(parentId);
      if (parentGen !== undefined && parentGen >= newGen) {
        return true; // Would break hierarchy - parent at same/lower level than child
      }
    }
    
    // Check if person's children would be at same or higher generation
    const children = parentToChildren.get(id) || new Set();
    for (const childId of children) {
      const childGen = generations.get(childId);
      if (childGen !== undefined && childGen <= newGen) {
        return true; // Would break hierarchy - child at same/higher level than parent
      }
    }
    
    return false;
  };
  
  // Check both spouses
  if (personGen !== minGen && checkPerson(personId, minGen)) {
    return true;
  }
  if (spouseGen !== minGen && checkPerson(spouseId, minGen)) {
    return true;
  }
  
  return false;
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

    // Special handling: Always group a deceased grandparent in the correct generation if:
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

  // Layout constants - spacing values for better visual organization
  const GENERATION_HEIGHT = 450;  // Vertical spacing between generations
  const NODE_WIDTH = 280;
  const NODE_MARGIN = 40;
  const currentSpouseSpacing = NODE_WIDTH + 50;  // 330, close spacing for current spouses
  const exSpouseSpacing = NODE_WIDTH + 80;       // 360, more distance for ex-spouses
  const lateSpouseSpacing = NODE_WIDTH + 70;     // 350, slightly more than current spouse
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
    const siblingGroups = new Map(); // ParentKey -> [siblings]
    const orphans = []; // People with no parents

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
        const spouse = spouseId ? generationPersons.find(p => String(p.id) === spouseId) : null;
        
        if (spouse && !processedPersons.has(spouseId)) {
          // Determine spouse type for spacing
          let spouseType = "current";
          if (spouse.is_ex) spouseType = "ex";
          else if (shouldMarkAsLateSpouse(person, spouse)) spouseType = "late";
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
      if (processedPersons.has(personId)) return;
      
      const spouseId = spouseMap.get(personId);
      const spouse = spouseId ? generationPersons.find(p => String(p.id) === spouseId) : null;
      
      if (spouse && !processedPersons.has(spouseId)) {
        // Determine spouse type for spacing
        let spouseType = "current";
        if (spouse.is_ex) spouseType = "ex";
        else if (shouldMarkAsLateSpouse(person, spouse)) spouseType = "late";
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

  // Function to prevent nodes from overlapping each other on the screen
  function avoidNodeOverlap(nodes, unrelatedNodeIds, nodeWidth = 240, nodeHeight = 180, margin = 40) {
    // Build spouse pairs for coordinated movement
    const spousePairs = new Map(); // PersonId -> spouseId
    nodes.forEach(node => {
      const personId = node.id;
      // Find spouse from the original spouseMap built during relationship processing
      // We'll reconstruct this from nodes that are close together horizontally and at same y
      const potentialSpouse = nodes.find(other => 
        other.id !== personId &&
        Math.abs(other.position.y - node.position.y) < 10 && // Same generation
        Math.abs(other.position.x - node.position.x) <= 400 && // Close horizontally (spouse distance)
        Math.abs(other.position.x - node.position.x) > 200 // But not too close (not the same person)
      );
      if (potentialSpouse && !spousePairs.has(personId) && !spousePairs.has(potentialSpouse.id)) {
        spousePairs.set(personId, potentialSpouse.id);
        spousePairs.set(potentialSpouse.id, personId);
      }
    });

    // Build co-parent groups for coordinated movement
    // Co-parents should move together to maintain same generation level
    const coParentGroups = new Map(); // PersonId -> Set of co-parent IDs
    if (childToParents) {
      childToParents.forEach((parents, childId) => {
        if (parents.size >= 2) {
          const parentList = Array.from(parents);
          // Each parent should know about all their co-parents
          parentList.forEach(parentId => {
            if (!coParentGroups.has(parentId)) {
              coParentGroups.set(parentId, new Set());
            }
            parentList.forEach(otherParentId => {
              if (otherParentId !== parentId) {
                coParentGroups.get(parentId).add(otherParentId);
              }
            });
          });
        }
      });
    }
    const isOverlapping = (nodeA, nodeB) => {
      return (
        Math.abs(nodeA.position.x - nodeB.position.x) < nodeWidth + margin &&
        Math.abs(nodeA.position.y - nodeB.position.y) < nodeHeight + margin
      );
    };
    
    // Apply overlap detection to all nodes, not just unrelated ones
    const allNodeIds = nodes.map(n => n.id);
    const processedNodes = new Set(); // Track nodes already moved to avoid double-processing spouse pairs
    
    allNodeIds.forEach((nodeId) => {
      if (processedNodes.has(nodeId)) return; // Skip if already processed as part of a spouse pair
      
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      
      const spouseId = spousePairs.get(nodeId);
      const spouse = spouseId ? nodes.find(n => n.id === spouseId) : null;
      
      let overlapped;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops
      
      do {
        overlapped = nodes.some(
          (other) =>
            other.id !== node.id && 
            (!spouse || other.id !== spouse.id) && // Don't consider spouse as overlapping
            isOverlapping(node, other)
        );
        
        if (overlapped) {
          // Move node, spouse, and co-parents together
          const deltaX = attempts % 3 === 0 ? nodeWidth + margin : 
                       attempts % 3 === 2 ? -(nodeWidth + margin) : 0;
          const deltaY = attempts % 3 === 1 ? nodeHeight + margin : 0;
          
          // Collect all nodes that should move together
          const nodesToMove = new Set([nodeId]);
          
          // Add spouse
          if (spouse) {
            nodesToMove.add(spouse.id);
          }
          
          // Add co-parents (people who share children with this person)
          if (coParentGroups.has(nodeId)) {
            coParentGroups.get(nodeId).forEach(coParentId => {
              nodesToMove.add(coParentId);
              // Also add the co-parent's spouse if they have one
              const coParentSpouseId = spousePairs.get(coParentId);
              if (coParentSpouseId) {
                nodesToMove.add(coParentSpouseId);
              }
            });
          }
          
          // Move all nodes in the group together
          nodesToMove.forEach(moveNodeId => {
            const moveNode = nodes.find(n => n.id === moveNodeId);
            if (moveNode) {
              moveNode.position.x += deltaX;
              moveNode.position.y += deltaY;
            }
          });
          
          attempts++;
        }
      } while (overlapped && attempts < maxAttempts);
      
      processedNodes.add(nodeId);
      if (spouseId) processedNodes.add(spouseId); // Mark spouse as processed too
    });
    return nodes;
  }

  // Nudge unrelated nodes to avoid overlap - DISABLED: conflicts with external anti-overlap system
  // avoidNodeOverlap(nodes, unrelatedNodeIds);

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
 * @param {Array} persons - Array of person objects for checking deceased status
 * @returns {Array} - Array of simplified edges
 */
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
    const type = rel.type || rel.relationship_type;
    
    if (source === person1Id && type === 'parent') {
      person1Parents.add(target);
    } else if (target === person1Id && type === 'child') {
      person1Parents.add(source);
    }
  });
  
  // Find parents of person2
  const person2Parents = new Set();
  relationships.forEach(rel => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    const type = rel.type || rel.relationship_type;
    
    if (source === person2Id && type === 'parent') {
      person2Parents.add(target);
    } else if (target === person2Id && type === 'child') {
      person2Parents.add(source);
    }
  });
  
  // Check if they share any parents
  const sharedParents = [...person1Parents].filter(parent => person2Parents.has(parent));
  
  // Direct siblings = siblings with no shared parents
  return sharedParents.length === 0;
};

const createSimplifiedEdges = (relationships, relationshipMaps, persons) => {
  const edges = [];
  const processedConnections = new Set();

  // Group relationships by type for better processing
  const parentRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'parent');
  const spouseRelationships = relationships.filter(rel => (rel.type || rel.relationship_type) === 'spouse');
  const siblingRelationships = relationships.filter(rel => {
    const type = rel.type || rel.relationship_type;
    return ['sibling', 'brother', 'sister', 'Brother', 'Sister'].includes(type);
  });


  // Process parent relationships from corrected relationship maps
  // Use the corrected parentToChildren map instead of raw relationships
  relationshipMaps.parentToChildren.forEach((children, parentId) => {
    children.forEach(childId => {
      const connectionKey = `parent-${parentId}-${childId}`;
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
      
      // Also check if either person in the relationship is deceased
      const sourcePerson = persons.find(p => String(p.id) === source);
      const targetPerson = persons.find(p => String(p.id) === target);
      const eitherPersonDeceased = (sourcePerson?.date_of_death || sourcePerson?.is_deceased) || 
                                  (targetPerson?.date_of_death || targetPerson?.is_deceased);
      
      // Choose color based on relationship status
      let strokeColor = '#ec4899'; // Default: pink for current spouse
      
      // Only real deceased spouses get the black line
      // Posthumous marriages should be treated as ex-spouse (grey)
      if (isEx) {
        strokeColor = '#9ca3af'; // Grey for ex-spouse
      } else if (isDeceased) {
        strokeColor = '#000000'; // Black for legitimate late spouse (married before death)
      } else if (eitherPersonDeceased) {
        // If either person is deceased but relationship is NOT marked as legitimate late spouse,
        // Treat as ex-spouse (this handles posthumous marriages like Sam-Molly)
        strokeColor = '#9ca3af'; // Grey for posthumous marriages treated as ex-spouse
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

  // Process sibling relationships - only show connectors for direct siblings (no shared parents)
  // Regular siblings with shared parents are already connected through positioning via their parents
  siblingRelationships.forEach(relationship => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    const connectionKey = `sibling-${Math.min(source, target)}-${Math.max(source, target)}`;

    if (!processedConnections.has(connectionKey)) {
      // Check if these siblings have shared parents (regular siblings) or no shared parents (direct siblings)
      const isDirectSibling = checkIsDirectSibling(source, target, relationships);
      
      // Only create visual connectors for direct siblings (no shared parents)
      // Regular siblings with shared parents are shown through positioning
      if (isDirectSibling) {
        edges.push({
          id: connectionKey,
          source,
          target,
          type: 'straight',
          animated: false,
          style: {
            stroke: '#3b82f6', // Blue dotted for direct siblings (no shared parents)
            strokeWidth: 2,
            strokeDasharray: '2 6'
          }
        });
        processedConnections.add(connectionKey);
      }
      // Regular siblings with shared parents get no visual connector
      // Their relationship is shown through positioning via their shared parents
    }
  });

  // Step-grandparent relationships are not shown as visual lines
  // Step-grandparent relationships are only shown in text labels via the relationship calculator,
  // Not as visual connectors. Visual connectors only represent direct biological relationships
  // And formal spouse relationships. Step-relationships are inferred and displayed as text only.

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
