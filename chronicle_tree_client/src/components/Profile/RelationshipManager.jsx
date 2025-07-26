import React, { useState } from 'react';
import RelationshipForm from '../Forms/RelationshipForm';
import { createRelationship, deletePerson, getPerson, useToggleSpouseEx, useFullTree } from '../../services/people';
import { FaUsers, FaPlus, FaTrash, FaUserFriends, FaChild, FaVenusMars, FaUserTie, FaUserEdit } from 'react-icons/fa';
import DeletePersonModal from '../UI/DeletePersonModal';
import { buildRelationshipMaps, calculateRelationshipToRoot, detectAnyBloodRelationship } from '../../utils/improvedRelationshipCalculator';

const RELATIONSHIP_LABELS = {
  parent: 'Parents',
  child: 'Children',
  spouse: 'Spouses',
  sibling: 'Siblings',
};

const IN_LAW_LABELS = {
  parents_in_law: 'Parents-in-law',
  children_in_law: 'Children-in-law',
  siblings_in_law: 'Siblings-in-law',
};

function groupRelatives(person) {
  const groups = { parent: [], child: [], spouse: [], sibling: [] };
  if (person?.relatives) {
    person.relatives.forEach(rel => {
      if (groups[rel.relationship_type]) {
        groups[rel.relationship_type].push(rel);
      }
    });
  }
  
  // Add half-siblings to the siblings group with (half) annotation
  if (person?.half_siblings) {
    const halfSiblingsWithAnnotation = person.half_siblings.map(hs => ({
      ...hs,
      relationship_type: 'sibling',
      full_name: `${hs.first_name} ${hs.last_name} (half)`,
      isHalfSibling: true
    }));
    groups.sibling = [...groups.sibling, ...halfSiblingsWithAnnotation];
  }
  
  // Add step-siblings to the siblings group with (step) annotation
  if (person?.step_siblings) {
    const stepSiblingsWithAnnotation = person.step_siblings.map(ss => ({
      ...ss,
      relationship_type: 'sibling',
      full_name: `${ss.first_name} ${ss.last_name} (step)`,
      isStepSibling: true
    }));
    groups.sibling = [...groups.sibling, ...stepSiblingsWithAnnotation];
  }
  
  return groups;
}

// Merge in-laws into main relationship groups with inLaw flag
function mergeInLaws(groups, inLaws) {
  const merged = { ...groups };
  if (inLaws.parents_in_law) {
    merged.parent = [
      ...merged.parent,
      ...inLaws.parents_in_law.map(p => ({ ...p, inLaw: true }))
    ];
  }
  if (inLaws.children_in_law) {
    merged.child = [
      ...merged.child,
      ...inLaws.children_in_law.map(p => ({ ...p, inLaw: true }))
    ];
  }
  if (inLaws.siblings_in_law) {
    merged.sibling = [
      ...merged.sibling,
      ...inLaws.siblings_in_law.map(p => ({ ...p, inLaw: true }))
    ];
  }
  return merged;
}

// Helper function to find step relationships for a person
function findStepRelationships(person, allPeople, relationships) {
  if (!person || !allPeople || !relationships) {
    return { stepParents: [], stepChildren: [] };
  }

  
  const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
  const { childToParents, parentToChildren, spouseMap, deceasedSpouseMap, exSpouseMap } = relationshipMaps;
  
  
  const stepParents = [];
  const stepChildren = [];
  
  // Find step-parents: People who are married to person's biological parents but are not person's biological parents
  const personParents = childToParents.get(String(person.id)) || new Set();
  
  for (const parent of personParents) {
    // Check current spouses of this parent
    const parentCurrentSpouses = spouseMap.get(parent) || new Set();
    
    for (const spouse of parentCurrentSpouses) {
      // Make sure the spouse is not a biological parent of the person
      if (!personParents.has(spouse)) {
        const spousePerson = allPeople.find(p => String(p.id) === spouse);
        if (spousePerson) {
          stepParents.push({
            ...spousePerson,
            id: spousePerson.id,
            full_name: `${spousePerson.first_name} ${spousePerson.last_name}`,
            relationship_type: 'parent',
            isStep: true
          });
        }
      }
    }
    
    // Check deceased spouses of this parent
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    for (const spouse of parentDeceasedSpouses) {
      if (!personParents.has(spouse)) {
        const spousePerson = allPeople.find(p => String(p.id) === spouse);
        if (spousePerson) {
          // Check if step relationship is valid (deceased spouse was alive when person was born)
          if (spousePerson.date_of_death && person.date_of_birth) {
            const deathDate = new Date(spousePerson.date_of_death);
            const birthDate = new Date(person.date_of_birth);
            if (birthDate > deathDate) {
              continue; // Skip this deceased spouse
            }
          }
          
          stepParents.push({
            ...spousePerson,
            id: spousePerson.id,
            full_name: `${spousePerson.first_name} ${spousePerson.last_name}`,
            relationship_type: 'parent',
            isStep: true
          });
        }
      }
    }
  }

  // Find step-children: People whose biological parent is married to this person, but this person is not their biological parent
  // Only consider current spouses and deceased spouses (not ex-spouses, as step relationships end with divorce)
  const personCurrentSpouses = spouseMap.get(String(person.id)) || new Set();
  const personDeceasedSpouses = deceasedSpouseMap.get(String(person.id)) || new Set();
  const personExSpouses = exSpouseMap.get(String(person.id)) || new Set();
  const allPersonSpouses = new Set([...personCurrentSpouses, ...personDeceasedSpouses]);
  
  
  for (const spouse of allPersonSpouses) {
    const spouseChildren = parentToChildren.get(spouse) || new Set();
    for (const child of spouseChildren) {
      // Make sure this person is not a biological parent of the child
      const childParents = childToParents.get(child) || new Set();
      if (!childParents.has(String(person.id))) {
        const childPerson = allPeople.find(p => String(p.id) === child);
        if (childPerson) {
          // Check if step relationship is valid for deceased spouse relationships
          if (personDeceasedSpouses.has(spouse) && person.date_of_death && childPerson.date_of_birth) {
            const deathDate = new Date(person.date_of_death);
            const birthDate = new Date(childPerson.date_of_birth);
            if (birthDate > deathDate) {
              continue; // Skip this child
            }
          }
          
          stepChildren.push({
            ...childPerson,
            id: childPerson.id,
            full_name: `${childPerson.first_name} ${childPerson.last_name}`,
            relationship_type: 'child',
            isStep: true
          });
        }
      }
    }
  }

  // Find step-siblings: People who share at least one parent (step or biological) with this person, 
  // but don't share ALL biological parents (making them step-siblings, not full siblings)
  const stepSiblings = [];
  
  // Get all parents of this person (biological parents)
  const allPersonParents = [...personParents];
  
  // Also check children of person's biological parents' spouses (step-siblings through person's biological parent)
  for (const parentId of personParents) {
    // Get current and deceased spouses of this biological parent
    const parentSpouses = new Set([
      ...(spouseMap.get(parentId) || new Set()),
      ...(deceasedSpouseMap.get(parentId) || new Set())
    ]);
    
    for (const spouseId of parentSpouses) {
      // Find children of this spouse who are not children of the biological parent
      const spouseChildren = parentToChildren.get(spouseId) || new Set();
      for (const childId of spouseChildren) {
        if (String(childId) !== String(person.id)) {
          const childParents = childToParents.get(String(childId)) || new Set();
          // This child is a step-sibling if they have the spouse as parent but not the biological parent
          if (childParents.has(spouseId) && !childParents.has(parentId)) {
            const siblingPerson = allPeople.find(p => String(p.id) === String(childId));
            if (siblingPerson && !stepSiblings.find(s => s.id === siblingPerson.id)) {
              stepSiblings.push({
                ...siblingPerson,
                id: siblingPerson.id,
                full_name: `${siblingPerson.first_name} ${siblingPerson.last_name}`,
                relationship_type: 'sibling',
                isStep: true
              });
            }
          }
        }
      }
    }
  }
  
  // Also check step-parents' other children (step-siblings through person's step-parent)
  for (const stepParent of stepParents) {
    const stepParentChildren = parentToChildren.get(String(stepParent.id)) || new Set();
    for (const siblingId of stepParentChildren) {
      if (String(siblingId) !== String(person.id)) {
        const siblingPerson = allPeople.find(p => String(p.id) === String(siblingId));
        if (siblingPerson && !stepSiblings.find(s => s.id === siblingPerson.id)) {
          stepSiblings.push({
            ...siblingPerson,
            id: siblingPerson.id,
            full_name: `${siblingPerson.first_name} ${siblingPerson.last_name}`,
            relationship_type: 'sibling',
            isStep: true
          });
        }
      }
    }
  }

  
  return { stepParents, stepChildren, stepSiblings };
}

const RelationshipManager = ({ person, people = [], onRelationshipAdded, onRelationshipDeleted }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingDeletePerson, setPendingDeletePerson] = useState(null);
  const [pendingDeleteRelationships, setPendingDeleteRelationships] = useState({});
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const toggleSpouseExMutation = useToggleSpouseEx();
  
  // Get full tree data to calculate step relationships
  const { data: treeData } = useFullTree();

  // Helper to get IDs of already-related people for a given type
  const getRelatedIds = (type) => {
    if (!person?.relatives) return [];
    
    // For spouses, exclude anyone who was ever married to this person (including deceased spouses)
    if (type === 'spouse') {
      return person.relatives.filter(rel => rel.relationship_type === type).map(rel => rel.id);
    }
    
    return person.relatives.filter(rel => rel.relationship_type === type).map(rel => rel.id);
  };

  // Enhanced blood relationship detection using comprehensive algorithm
  const detectBloodRelationship = (person1Id, person2Id) => {
    if (!treeData?.nodes || !treeData?.edges) {
      return { isBloodRelated: false, relationship: null, degree: null };
    }

    // Convert edges to relationships format for the enhanced detector
    const relationships = treeData.edges.map(edge => ({
      from: edge.source,
      to: edge.target, 
      relationship_type: edge.type || edge.relationship_type,
      is_ex: edge.is_ex,
      is_deceased: edge.is_deceased
    }));

    // Use the comprehensive blood relationship detector that catches ALL blood relations
    const bloodResult = detectAnyBloodRelationship(person1Id, person2Id, relationships, treeData.nodes);
    
    if (bloodResult.isBloodRelated) {
      return {
        isBloodRelated: true,
        relationship: bloodResult.relationship,
        degree: bloodResult.depth
      };
    }

    // Additional check: Use the traditional relationship calculator and verify it's not incorrectly flagging in-laws
    const calculatedRelation = calculateRelationshipToRoot(
      { id: person2Id }, 
      { id: person1Id }, 
      treeData.nodes, 
      relationships
    );
    
    // Double-check that in-law relationships are not being flagged as blood relationships
    if (calculatedRelation && calculatedRelation !== 'Unrelated') {
      const lowerRelation = calculatedRelation.toLowerCase();
      // If it contains in-law, co-, step-, ex-, or late - it's NOT a blood relationship
      if (lowerRelation.includes('in-law') || 
          lowerRelation.includes('co-') || 
          lowerRelation.includes('step-') ||
          lowerRelation.includes('ex-') ||
          lowerRelation.includes('late ')) {
        return { isBloodRelated: false, relationship: calculatedRelation, degree: null };
      }
    }

    return { isBloodRelated: false, relationship: null, degree: null };
  };

  // Helper to check if a person is an ex or deceased spouse's relative (but not blood related to current person)
  // This function handles complex remarriage scenarios where someone might marry:
  // - An ex-spouse's sibling (if no blood relation exists)
  // - A deceased spouse's relative (if no blood relation exists)
  // Note: Blood relatives are always prevented from marrying regardless of previous marriages
  const isAllowedRemarriageRelative = (candidateId) => {
    if (!person?.relatives) return false;
    
    // Get all ex-spouses and deceased spouses of the current person
    const exAndDeceasedSpouses = person.relatives.filter(rel => 
      rel.relationship_type === 'spouse' && (rel.is_ex || people.find(p => p.id === rel.id)?.date_of_death)
    );

    if (exAndDeceasedSpouses.length === 0) return false;

    // Check if candidate is a relative of any ex or deceased spouse
    for (const spouse of exAndDeceasedSpouses) {
      const spousePerson = people.find(p => p.id === spouse.id);
      if (spousePerson?.relatives) {
        // Check if candidate is a relative of this ex/deceased spouse
        const isRelativeOfSpouse = spousePerson.relatives.some(rel => rel.id === candidateId);
        if (isRelativeOfSpouse) {
          // Important: Ensure candidate is not blood related to current person
          const bloodCheck = detectBloodRelationship(person.id, candidateId);
          if (!bloodCheck.isBloodRelated) {
            const spouseStatus = spouse.is_ex ? 'ex-spouse' : 'deceased spouse';
            const candidatePerson = people.find(p => p.id === candidateId);
            const spouseRelType = spousePerson.relatives.find(rel => rel.id === candidateId)?.relationship_type;
            
            return true; // Allowed - relative of ex/deceased spouse but not blood related to current person
          } else {
          }
        }
      }
    }

    return false;
  };

  // Helper to validate age constraints for relationships
  const validateAgeConstraint = (person1, person2, relationshipType) => {
    // For spouse relationships, require birth dates to validate marriage age
    if (relationshipType === 'spouse') {
      if (!person1?.date_of_birth) {
        return { valid: false, reason: `${person1?.first_name || 'Person'} ${person1?.last_name || ''} must have a birth date for marriage validation` };
      }
      if (!person2?.date_of_birth) {
        return { valid: false, reason: `${person2?.first_name || 'Person'} ${person2?.last_name || ''} must have a birth date for marriage validation` };
      }
    } else if (!person1?.date_of_birth || !person2?.date_of_birth) {
      return { valid: true }; // Allow if birth dates are unknown for non-spouse relationships
    }
    
    const person1Birth = new Date(person1.date_of_birth);
    const person2Birth = new Date(person2.date_of_birth);
    const ageGapInYears = Math.abs(person1Birth.getTime() - person2Birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (relationshipType === 'parent') {
      // When adding parent: candidate (person2) should be older than current person (person1)
      if (person2Birth >= person1Birth) {
        return { valid: false, reason: 'Parent must be older than child' };
      }
      if (ageGapInYears < 12) {
        return { valid: false, reason: 'Parent must be at least 12 years older than child' };
      }
    } else if (relationshipType === 'child') {
      // When adding child: current person (person1) should be older than candidate (person2)  
      if (person1Birth >= person2Birth) {
        return { valid: false, reason: 'Child must be younger than parent' };
      }
      if (ageGapInYears < 12) {
        return { valid: false, reason: 'Child must be at least 12 years younger than parent' };
      }
    } else if (relationshipType === 'spouse') {
      // Minimum marriage age validation - both people must be at least 16 years old
      const currentDate = new Date();
      const person1Age = (currentDate.getTime() - person1Birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      const person2Age = (currentDate.getTime() - person2Birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      if (person1Age < 16) {
        return { valid: false, reason: `${person1.first_name} ${person1.last_name} is only ${person1Age.toFixed(1)} years old. Minimum marriage age is 16 years` };
      }
      if (person2Age < 16) {
        return { valid: false, reason: `${person2.first_name} ${person2.last_name} is only ${person2Age.toFixed(1)} years old. Minimum marriage age is 16 years` };
      }
    }
    // Note: Siblings, aunts/uncles can have flexible age differences
    return { valid: true };
  };

  // Helper to check existing relationship constraints
  const checkRelationshipConstraints = (candidateId, type) => {
    const candidate = people.find(p => p.id === candidateId);
    if (!candidate) return { valid: false, reason: 'Person not found' };
    
    // Age validation
    const ageCheck = validateAgeConstraint(person, candidate, type);
    if (!ageCheck.valid) {
      return ageCheck;
    }
    
    // Blood relationship detection - only if tree data is available
    const bloodCheck = detectBloodRelationship(person.id, candidateId);
    
    // Check for existing relationships that would prevent this new relationship
    const existingRels = person.relatives || [];
    
    // Child relationship validation with comprehensive filtering  
    if (type === 'child') {
      // 1. Prevent any blood relative from becoming a child
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot add blood relative (${bloodCheck.relationship}) as child - would create invalid family structure` 
        };
      }
      
      // 2. Prevent anyone who is already an ancestor from becoming a child (generational impossibility)
      const candidateRels = candidate.relatives || [];
      const isAlreadyAncestor = candidateRels.some(rel => 
        rel.id === person.id && 
        ['parent', 'grandparent'].includes(rel.relationship_type)
      );
      if (isAlreadyAncestor) {
        return { 
          valid: false, 
          reason: `Cannot add ${candidate.first_name} ${candidate.last_name} as child - they are already your ancestor` 
        };
      }
      
      // 3. Prevent people from same generation from being parent-child
      if (bloodCheck.relationship) {
        const rel = bloodCheck.relationship.toLowerCase();
        if (rel.includes('sibling') || rel.includes('cousin') || 
            rel.includes('brother') || rel.includes('sister')) {
          return { 
            valid: false, 
            reason: `Cannot add ${bloodCheck.relationship.toLowerCase()} as child - same generation relationship` 
          };
        }
      }
      
      // 4. Enhanced age validation for child relationships
      if (person.date_of_birth && candidate.date_of_birth) {
        const personBirth = new Date(person.date_of_birth);
        const candidateBirth = new Date(candidate.date_of_birth);
        const ageGapYears = (candidateBirth.getTime() - personBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Child must be at least 12 years younger
        if (ageGapYears < 12) {
          return { 
            valid: false, 
            reason: `${candidate.first_name} ${candidate.last_name} is not young enough to be child (${ageGapYears.toFixed(1)} year age gap, minimum 12 years required)` 
          };
        }
        
        // Prevent unrealistic age gaps (over 60 years)
        if (ageGapYears > 60) {
          return { 
            valid: false, 
            reason: `Age gap too large (${ageGapYears.toFixed(1)} years) - unlikely parent-child relationship` 
          };
        }
      }
      
      // 5. Prevent deceased people from having children born after their death
      if (person.date_of_death && candidate.date_of_birth) {
        const personDeath = new Date(person.date_of_death);
        const candidateBirth = new Date(candidate.date_of_birth);
        
        if (candidateBirth > personDeath) {
          return { 
            valid: false, 
            reason: `${person.first_name} ${person.last_name} died before ${candidate.first_name} ${candidate.last_name} was born - cannot be parent` 
          };
        }
      }
      
      // 6. Check if candidate already has 2 biological parents
      const candidateParents = candidate.relatives?.filter(rel => rel.relationship_type === 'parent' && !rel.isStep) || [];
      if (candidateParents.length >= 2) {
        return { 
          valid: false, 
          reason: `${candidate.first_name} ${candidate.last_name} already has maximum number of biological parents (2)` 
        };
      }
      
      // 7. Prevent adding someone as child if their children are married to person's children
      // This would create impossible family structures (grandchild being both great-grandchild and grandchild)
      const personChildren = existingRels.filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
      const candidateChildren = (candidate.relatives || []).filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
      
      for (const personChildId of personChildren) {
        const personChild = people.find(p => p.id === personChildId);
        if (personChild) {
          // Check if person's child is married to candidate's child
          const personChildSpouses = (personChild.relatives || []).filter(rel => rel.relationship_type === 'spouse').map(rel => rel.id);
          const marriedToCandidateChild = personChildSpouses.some(spouseId => candidateChildren.includes(spouseId));
          
          if (marriedToCandidateChild) {
            const candidateChild = people.find(p => candidateChildren.includes(p.id) && personChildSpouses.includes(p.id));
            return { 
              valid: false, 
              reason: `Cannot add ${candidate.first_name} ${candidate.last_name} as child - your child ${personChild.first_name} is married to their child ${candidateChild?.first_name || 'someone'}. This would create impossible family relationships where the same person has conflicting generational positions.` 
            };
          }
        }
      }
    }
    
    // Enhanced validation for spouses - allow marriage unless blood-related or other conflicts
    if (type === 'spouse') {
      // ALWAYS prevent marriage between blood relatives
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot marry blood relative (${bloodCheck.relationship}) - incestuous relationships are prohibited` 
        };
      }
      
      // Prevent parent-child from becoming spouses (redundant with blood check but kept for clarity)
      const isParent = existingRels.some(rel => rel.id === candidateId && rel.relationship_type === 'parent');
      const isChild = existingRels.some(rel => rel.id === candidateId && rel.relationship_type === 'child');
      if (isParent || isChild) {
        return { valid: false, reason: 'Cannot marry parent or child' };
      }
      
      // Allow people with current spouses (they'll be marked as ex automatically)
      // No need to filter them out - the UI will handle forcing ex status
      
      // If no blood relationship and no current spouse conflict, marriage is allowed
      // This includes deceased people, ex-spouse relatives, and anyone else without blood relations
      return { valid: true };
    }
    
    // Sibling relationship validation with comprehensive filtering
    if (type === 'sibling') {
      // 1. Prevent any current/former spouse from becoming sibling (would be inappropriate)
      const candidateRels = candidate.relatives || [];
      const personRels = person.relatives || [];
      
      // Check if candidate was ever person's spouse (current, ex, or deceased)
      const wasSpouse = candidateRels.some(rel => 
        rel.id === person.id && rel.relationship_type === 'spouse'
      ) || personRels.some(rel => 
        rel.id === candidate.id && rel.relationship_type === 'spouse'
      );
      
      if (wasSpouse) {
        return { 
          valid: false, 
          reason: `Cannot be siblings with former spouse ${candidate.first_name} ${candidate.last_name} - would be incestuous` 
        };
      }
      
      // 1a. Prevent people who share children from becoming siblings
      // If two people have shared children, they've been in a romantic relationship
      const personChildren = personRels.filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
      const candidateChildren = candidateRels.filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
      const sharedChildren = personChildren.filter(childId => candidateChildren.includes(childId));
      
      if (sharedChildren.length > 0) {
        return { 
          valid: false, 
          reason: `Cannot be siblings with ${candidate.first_name} ${candidate.last_name} - they share children, indicating a past romantic relationship` 
        };
      }
      
      // 2. Check for downstream relationship conflicts
      // If making this person a sibling would create inappropriate relationships elsewhere, block it
      const wouldCreateIncest = checkSiblingRelationshipConflicts(person, candidate, people);
      if (wouldCreateIncest.hasConflict) {
        return { 
          valid: false, 
          reason: wouldCreateIncest.reason
        };
      }
      
      // 3. Prevent direct ancestors/descendants from being siblings
      if (bloodCheck.isBloodRelated) {
        const relationship = bloodCheck.relationship || '';
        const lowerRel = relationship.toLowerCase();
        
        // Block all ancestor-descendant relationships
        if (lowerRel.includes('parent') || lowerRel.includes('child') || 
            lowerRel.includes('father') || lowerRel.includes('mother') ||
            lowerRel.includes('son') || lowerRel.includes('daughter') ||
            lowerRel.includes('grandparent') || lowerRel.includes('grandchild') ||
            lowerRel.includes('grandfather') || lowerRel.includes('grandmother') ||
            lowerRel.includes('grandson') || lowerRel.includes('granddaughter') ||
            lowerRel.includes('great-grand')) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${bloodCheck.relationship.toLowerCase()} - different generations` 
          };
        }
        
        // Block uncle/aunt-nephew/niece relationships (different generations)
        if (lowerRel.includes('uncle') || lowerRel.includes('aunt') ||
            lowerRel.includes('nephew') || lowerRel.includes('niece')) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${bloodCheck.relationship.toLowerCase()} - different generations` 
          };
        }
        
        // Allow existing siblings (this handles the case where they're already siblings)
        if (lowerRel.includes('sibling') || lowerRel.includes('brother') || lowerRel.includes('sister')) {
          return { 
            valid: false, 
            reason: `Already siblings with ${candidate.first_name} ${candidate.last_name}` 
          };
        }
        
        // Allow cousins to become step-siblings if they share step-parents
        // But for now, we'll be conservative and block cousin relationships
        if (lowerRel.includes('cousin')) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${bloodCheck.relationship.toLowerCase()} - blood relatives should not be step-siblings` 
          };
        }
      }
      
      // 3. Age validation for siblings - should be within reasonable range
      if (person.date_of_birth && candidate.date_of_birth) {
        const personBirth = new Date(person.date_of_birth);
        const candidateBirth = new Date(candidate.date_of_birth);
        const ageGapYears = Math.abs((candidateBirth.getTime() - personBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        
        // Siblings should not have more than 25-year age gap (very conservative)
        if (ageGapYears > 25) {
          return { 
            valid: false, 
            reason: `Age gap too large for siblings (${ageGapYears.toFixed(1)} years) - unlikely to share parents` 
          };
        }
      }
      
      // 4. Check for existing parent relationships that would prevent sibling relationship
      const candidateRelationships = candidate.relatives || [];
      const personRelationships = person.relatives || [];
      
      // If candidate is already person's parent or child, they can't be siblings
      const isParentChild = candidateRelationships.some(rel => 
        rel.id === person.id && ['parent', 'child'].includes(rel.relationship_type)
      ) || personRelationships.some(rel => 
        rel.id === candidate.id && ['parent', 'child'].includes(rel.relationship_type)
      );
      
      if (isParentChild) {
        return { 
          valid: false, 
          reason: `Cannot be siblings - already have parent-child relationship with ${candidate.first_name} ${candidate.last_name}` 
        };
      }
      
      // 5. Check for step-relationship conflicts using tree data
      
      if (treeData && treeData.nodes && treeData.edges) {
        // Use the same relationship mapping format as the display logic
        const relationships = treeData.edges.map(edge => ({
          from: edge.source,
          to: edge.target, 
          relationship_type: edge.type || edge.relationship_type,
          is_ex: edge.is_ex,
          is_deceased: edge.is_deceased
        }));
        
        const { stepParents, stepChildren } = findStepRelationships(person, treeData.nodes, relationships);
        
        // Check if candidate is a step-parent
        const isStepParent = stepParents.some(sp => sp.id === candidate.id);
        if (isStepParent) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${candidate.first_name} ${candidate.last_name} - they are your step-parent` 
          };
        }
        
        // Check if candidate is a step-child
        const isStepChild = stepChildren.some(sc => sc.id === candidate.id);
        if (isStepChild) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${candidate.first_name} ${candidate.last_name} - they are your step-child` 
          };
        }
      }
      
      // 6. Timeline validation - siblings should have overlapping lifespans or reasonable birth timing
      if (person.date_of_birth && candidate.date_of_birth) {
        const personBirth = new Date(person.date_of_birth);
        const candidateBirth = new Date(candidate.date_of_birth);
        
        // Check if one died before the other was born (impossible for biological siblings)
        if (person.date_of_death) {
          const personDeath = new Date(person.date_of_death);
          if (candidateBirth > personDeath) {
            return { 
              valid: false, 
              reason: `${person.first_name} ${person.last_name} died before ${candidate.first_name} ${candidate.last_name} was born - cannot be biological siblings` 
            };
          }
        }
        
        if (candidate.date_of_death) {
          const candidateDeath = new Date(candidate.date_of_death);
          if (personBirth > candidateDeath) {
            return { 
              valid: false, 
              reason: `${candidate.first_name} ${candidate.last_name} died before ${person.first_name} ${person.last_name} was born - cannot be biological siblings` 
            };
          }
        }
      }
      
      // 6. Parent compatibility validation  
      // Only block if BOTH people have 2 complete different blood parents
      const personParents = person.relatives?.filter(rel => rel.relationship_type === 'parent') || [];
      const candidateParents = candidate.relatives?.filter(rel => rel.relationship_type === 'parent') || [];
      
      if (personParents.length === 2 && candidateParents.length === 2) {
        const personParentIds = personParents.map(p => p.id).sort();
        const candidateParentIds = candidateParents.map(p => p.id).sort();
        const sharedParents = personParentIds.filter(id => candidateParentIds.includes(id));
        
        if (sharedParents.length === 0) {
          // No shared parents - let backend handle detailed step-relationship validation
          return { 
            valid: false, 
            reason: `${candidate.first_name} ${candidate.last_name} has 2 complete different blood parents - cannot be siblings unless their parents are married to each other` 
          };
        }
      }
      
      // Age compatibility check for all cases
      if (person.date_of_birth && candidate.date_of_birth) {
        const personBirth = new Date(person.date_of_birth);
        const candidateBirth = new Date(candidate.date_of_birth);
        const ageGapYears = Math.abs((candidateBirth.getTime() - personBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        
        if (ageGapYears > 25) {
          return { 
            valid: false, 
            reason: `Age gap too large (${ageGapYears.toFixed(1)} years) for sibling relationship` 
          };
        }
      }
    }
    
    // Parent relationship validation with comprehensive filtering
    if (type === 'parent') {
      // 1. Check if current person already has 2 biological parents
      const currentPersonParents = existingRels.filter(rel => rel.relationship_type === 'parent' && !rel.isStep);
      if (currentPersonParents.length >= 2) {
        return { valid: false, reason: 'Person already has maximum number of biological parents (2)' };
      }
      
      // 2. Prevent any blood relative from becoming a parent
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot add blood relative (${bloodCheck.relationship}) as parent - would create invalid family structure` 
        };
      }
      
      // 2a. Prevent co-parents-in-law from becoming parents (would create inappropriate family structure)
      // Scenario 1: Direct co-parents - If this candidate shares children with the current person
      const personChildren = existingRels.filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
      const candidateChildren = (candidate.relatives || []).filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
      const sharedChildren = personChildren.filter(childId => candidateChildren.includes(childId));
      
      if (sharedChildren.length > 0) {
        const sharedChildNames = people.filter(p => sharedChildren.includes(p.id)).map(p => `${p.first_name} ${p.last_name}`);
        return { 
          valid: false, 
          reason: `Cannot add ${candidate.first_name} ${candidate.last_name} as parent - you are co-parents of ${sharedChildNames.join(', ')}. If they became your parent, it would mean siblings' children have children together, which is inappropriate.` 
        };
      }

      // Scenario 2: Parent of someone who shares children with person's children
      // If candidate's child shares children with person's child, candidate cannot be person's parent
      for (const personChildId of personChildren) {
        const personChild = people.find(p => p.id === personChildId);
        if (personChild) {
          const personChildChildren = (personChild.relatives || []).filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
          
          for (const candidateChildId of candidateChildren) {
            const candidateChild = people.find(p => p.id === candidateChildId);
            if (candidateChild) {
              const candidateChildChildren = (candidateChild.relatives || []).filter(rel => rel.relationship_type === 'child').map(rel => rel.id);
              const sharedGrandchildren = personChildChildren.filter(grandchildId => candidateChildChildren.includes(grandchildId));
              
              if (sharedGrandchildren.length > 0) {
                const sharedGrandchildNames = people.filter(p => sharedGrandchildren.includes(p.id)).map(p => `${p.first_name} ${p.last_name}`);
                return { 
                  valid: false, 
                  reason: `Cannot add ${candidate.first_name} ${candidate.last_name} as parent - your child ${personChild.first_name} and their child ${candidateChild.first_name} share children (${sharedGrandchildNames.join(', ')}). If they became your parent, it would mean cousins have children together, which is inappropriate.` 
                };
              }
            }
          }
        }
      }
      
      // 3. Prevent anyone who is already a descendant from becoming a parent (generational impossibility)
      const candidateRels = candidate.relatives || [];
      const isAlreadyDescendant = candidateRels.some(rel => 
        rel.id === person.id && 
        ['child', 'grandchild'].includes(rel.relationship_type)
      );
      if (isAlreadyDescendant) {
        return { 
          valid: false, 
          reason: `Cannot add ${candidate.first_name} ${candidate.last_name} as parent - they are already your descendant` 
        };
      }
      
      // 4. Prevent people from same generation from being parent-child
      // Check if candidate is sibling, cousin, or same-generation relative
      if (bloodCheck.relationship) {
        const rel = bloodCheck.relationship.toLowerCase();
        if (rel.includes('sibling') || rel.includes('cousin') || 
            rel.includes('brother') || rel.includes('sister')) {
          return { 
            valid: false, 
            reason: `Cannot add ${bloodCheck.relationship.toLowerCase()} as parent - same generation relationship` 
          };
        }
      }
      
      // 5. Enhanced age validation for parent relationships
      if (person.date_of_birth && candidate.date_of_birth) {
        const personBirth = new Date(person.date_of_birth);
        const candidateBirth = new Date(candidate.date_of_birth);
        const ageGapYears = (candidateBirth.getTime() - personBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Parent must be at least 12 years older than child (negative means parent is older)
        if (ageGapYears < 12) {
          if (ageGapYears < 0) {
            // Negative means candidate is older than person - this should be ALLOWED for parents!
            // Only block if the age gap is not large enough
            if (Math.abs(ageGapYears) < 12) {
              return { 
                valid: false, 
                reason: `${candidate.first_name} ${candidate.last_name} is only ${Math.abs(ageGapYears).toFixed(1)} years older than child (minimum 12 years required)` 
              };
            }
            // If age gap is >= 12 years, this should pass (don't return false here)
          } else {
            // Positive means candidate is younger than person - definitely wrong for parent
            return { 
              valid: false, 
              reason: `${candidate.first_name} ${candidate.last_name} is ${ageGapYears.toFixed(1)} years younger than child - cannot be parent` 
            };
          }
        }
        
        // Prevent unrealistic age gaps (over 60 years)
        if (Math.abs(ageGapYears) > 60) {
          return { 
            valid: false, 
            reason: `Age gap too large (${Math.abs(ageGapYears).toFixed(1)} years) - unlikely parent-child relationship` 
          };
        }
      }
      
      // 6. Prevent deceased people from being parents of people born after their death
      if (candidate.date_of_death && person.date_of_birth) {
        const candidateDeath = new Date(candidate.date_of_death);
        const personBirth = new Date(person.date_of_birth);
        
        if (personBirth > candidateDeath) {
          return { 
            valid: false, 
            reason: `${candidate.first_name} ${candidate.last_name} died before ${person.first_name} ${person.last_name} was born - cannot be parent` 
          };
        }
      }
    }
    
    return { valid: true };
  };

  // Helper to get detailed filtering information for user alerts
  const getFilteringInfo = (type) => {
    const excludeIds = [person.id, ...getRelatedIds(type)];
    const filteringReasons = {
      alreadyRelated: [],
      ageConstraints: [],
      bloodRelationships: [],
      marriageAge: [],
      relationshipLimits: [],
      missingData: []
    };
    
    people.forEach(p => {
      if (p.id === person.id) return; // Skip self
      
      // Check if already related
      if (excludeIds.includes(p.id)) {
        filteringReasons.alreadyRelated.push(`${p.first_name} ${p.last_name} (already related)`);
        return;
      }
      
      // Check relationship constraints and categorize reasons
      const constraintCheck = checkRelationshipConstraints(p.id, type);
      if (!constraintCheck.valid) {
        const reason = constraintCheck.reason;
        if (reason.includes('marriage age') || reason.includes('16 years')) {
          filteringReasons.marriageAge.push(`${p.first_name} ${p.last_name} (${reason})`);
        } else if (reason.includes('blood relative') || reason.includes('Blood relatives')) {
          filteringReasons.bloodRelationships.push(`${p.first_name} ${p.last_name} (${reason})`);
        } else if (reason.includes('12 years older') || reason.includes('age')) {
          filteringReasons.ageConstraints.push(`${p.first_name} ${p.last_name} (${reason})`);
        } else if (reason.includes('maximum') || reason.includes('already has')) {
          filteringReasons.relationshipLimits.push(`${p.first_name} ${p.last_name} (${reason})`);
        } else if (reason.includes('birth date')) {
          filteringReasons.missingData.push(`${p.first_name} ${p.last_name} (${reason})`);
        } else {
          filteringReasons.bloodRelationships.push(`${p.first_name} ${p.last_name} (${reason})`);
        }
      }
    });
    
    return filteringReasons;
  };

  // Show detailed filtering alert to help users understand what's being filtered
  const showFilteringAlert = (type) => {
    const filteringInfo = getFilteringInfo(type);
    const totalFiltered = Object.values(filteringInfo).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalFiltered === 0) return;
    
    let alertMessage = `🔍 RELATIONSHIP FILTERING INFORMATION\n\n`;
    alertMessage += `Adding ${type} relationship for ${person.first_name} ${person.last_name}\n\n`;
    alertMessage += `${totalFiltered} people have been filtered out for the following reasons:\n\n`;
    
    if (filteringInfo.marriageAge.length > 0) {
      alertMessage += `👶 MARRIAGE AGE RESTRICTIONS (${filteringInfo.marriageAge.length} people):\n`;
      alertMessage += `• Minimum marriage age is 16 years\n`;
      filteringInfo.marriageAge.slice(0, 3).forEach(item => alertMessage += `  - ${item}\n`);
      if (filteringInfo.marriageAge.length > 3) {
        alertMessage += `  - And ${filteringInfo.marriageAge.length - 3} more...\n`;
      }
      alertMessage += `\n`;
    }
    
    if (filteringInfo.bloodRelationships.length > 0) {
      alertMessage += `🧬 BLOOD RELATIONSHIP RESTRICTIONS (${filteringInfo.bloodRelationships.length} people):\n`;
      alertMessage += `• Blood relatives cannot marry or have shared children\n`;
      filteringInfo.bloodRelationships.slice(0, 3).forEach(item => alertMessage += `  - ${item}\n`);
      if (filteringInfo.bloodRelationships.length > 3) {
        alertMessage += `  - And ${filteringInfo.bloodRelationships.length - 3} more...\n`;
      }
      alertMessage += `\n`;
    }
    
    if (filteringInfo.ageConstraints.length > 0) {
      alertMessage += `📅 AGE CONSTRAINTS (${filteringInfo.ageConstraints.length} people):\n`;
      alertMessage += `• Parents must be 12+ years older than children\n`;
      filteringInfo.ageConstraints.slice(0, 3).forEach(item => alertMessage += `  - ${item}\n`);
      if (filteringInfo.ageConstraints.length > 3) {
        alertMessage += `  - And ${filteringInfo.ageConstraints.length - 3} more...\n`;
      }
      alertMessage += `\n`;
    }
    
    if (filteringInfo.relationshipLimits.length > 0) {
      alertMessage += `👥 RELATIONSHIP LIMITS (${filteringInfo.relationshipLimits.length} people):\n`;
      alertMessage += `• Max 2 parents, 1 current spouse per person\n`;
      filteringInfo.relationshipLimits.slice(0, 3).forEach(item => alertMessage += `  - ${item}\n`);
      if (filteringInfo.relationshipLimits.length > 3) {
        alertMessage += `  - And ${filteringInfo.relationshipLimits.length - 3} more...\n`;
      }
      alertMessage += `\n`;
    }
    
    if (filteringInfo.missingData.length > 0) {
      alertMessage += `📋 MISSING REQUIRED DATA (${filteringInfo.missingData.length} people):\n`;
      alertMessage += `• Birth dates required for marriage validation\n`;
      filteringInfo.missingData.slice(0, 3).forEach(item => alertMessage += `  - ${item}\n`);
      if (filteringInfo.missingData.length > 3) {
        alertMessage += `  - And ${filteringInfo.missingData.length - 3} more...\n`;
      }
      alertMessage += `\n`;
    }
    
    if (filteringInfo.alreadyRelated.length > 0) {
      alertMessage += `🔗 ALREADY RELATED (${filteringInfo.alreadyRelated.length} people):\n`;
      filteringInfo.alreadyRelated.slice(0, 3).forEach(item => alertMessage += `  - ${item}\n`);
      if (filteringInfo.alreadyRelated.length > 3) {
        alertMessage += `  - And ${filteringInfo.alreadyRelated.length - 3} more...\n`;
      }
      alertMessage += `\n`;
    }
    
    alertMessage += `💡 TIP: To add filtered people, you may need to:\n`;
    alertMessage += `• Add missing birth dates\n`;
    alertMessage += `• Wait for people to reach minimum age\n`;
    alertMessage += `• Review family relationship structure\n`;
    
    alert(alertMessage);
  };

  // Filter people for each relationship type with enhanced constraints
  const getSelectablePeople = (type) => {
    const excludeIds = [person.id, ...getRelatedIds(type)];
    
    // If tree data is not loaded yet, use basic filtering plus existing relationships check
    // This prevents showing empty lists while tree data loads but still validates existing relationships
    if (!treeData?.nodes || !treeData?.edges) {
      return people.filter(p => {
        // Basic exclusion (self and already related)
        if (excludeIds.includes(p.id)) return false;
        
        // Basic relationship constraints using existing relationships only (no tree data needed)
        const existingRels = person.relatives || [];
        
        // Check if this person is already in a conflicting relationship
        const conflictingRel = existingRels.find(rel => {
          if (rel.id !== p.id) return false;
          
          // Prevent obvious conflicts: can't be parent and sibling, etc.
          if (type === 'sibling' && (rel.relationship_type === 'parent' || rel.relationship_type === 'child')) {
            return true;
          }
          if (type === 'parent' && rel.relationship_type === 'child') {
            return true;
          }
          if (type === 'child' && rel.relationship_type === 'parent') {
            return true;
          }
          return false;
        });
        
        return !conflictingRel;
      });
    }
    
    const filtered = people.filter(p => {
      // Basic exclusion (self and already related)
      if (excludeIds.includes(p.id)) return false;
      
      // Full relationship constraints check when tree data is available
      const constraintCheck = checkRelationshipConstraints(p.id, type);
      
      
      return constraintCheck.valid;
    });
    
    return filtered;
  };

  // Check if making two people siblings would create inappropriate relationships elsewhere
  const checkSiblingRelationshipConflicts = (person1, person2, allPeople) => {
    // If person1 and person2 become siblings, then:
    // - person1's children become person2's nephews/nieces
    // - person2's children become person1's nephews/nieces
    
    // Get all descendants of both people
    const person1Descendants = getAllDescendants(person1, allPeople);
    const person2Descendants = getAllDescendants(person2, allPeople);
    
    // Check if any descendants are married to each other (mutual descendants)
    for (const desc1 of person1Descendants) {
      for (const desc2 of person2Descendants) {
        // Check if desc1 and desc2 are married
        const desc1Rels = desc1.relatives || [];
        const areMarried = desc1Rels.some(rel => 
          rel.id === desc2.id && rel.relationship_type === 'spouse' && !rel.is_ex
        );
        
        if (areMarried) {
          return {
            hasConflict: true,
            reason: `Cannot be siblings - would create uncle-niece relationship: ${desc1.first_name} ${desc1.last_name} (${person1.first_name}'s descendant) is married to ${desc2.first_name} ${desc2.last_name} (${person2.first_name}'s descendant)`
          };
        }
      }
    }
    
    // Check if person2 is married to any of person1's descendants
    // This catches cases like Robert's granddaughter Alice being married to David
    const person2Rels = person2.relatives || [];
    for (const descendant of person1Descendants) {
      const isMarriedToDescendant = person2Rels.some(rel => 
        rel.id === descendant.id && rel.relationship_type === 'spouse' && !rel.is_ex
      );
      
      if (isMarriedToDescendant) {
        return {
          hasConflict: true,
          reason: `Cannot be siblings - ${person2.first_name} ${person2.last_name} is married to ${descendant.first_name} ${descendant.last_name} (${person1.first_name}'s descendant), would create inappropriate uncle-niece marriage`
        };
      }
    }
    
    // Check if person1 is married to any of person2's descendants
    // This catches the reverse case
    const person1Rels = person1.relatives || [];
    for (const descendant of person2Descendants) {
      const isMarriedToDescendant = person1Rels.some(rel => 
        rel.id === descendant.id && rel.relationship_type === 'spouse' && !rel.is_ex
      );
      
      if (isMarriedToDescendant) {
        return {
          hasConflict: true,
          reason: `Cannot be siblings - ${person1.first_name} ${person1.last_name} is married to ${descendant.first_name} ${descendant.last_name} (${person2.first_name}'s descendant), would create inappropriate uncle-niece marriage`
        };
      }
    }
    
    // Check for existing in-law relationships that would become problematic
    // If person2 is parent of person1's child's spouse, they can't become siblings
    const person1Children = person1Rels.filter(rel => rel.relationship_type === 'child');
    
    for (const child of person1Children) {
      const childPerson = allPeople.find(p => p.id === child.id);
      if (childPerson) {
        const childSpouses = (childPerson.relatives || []).filter(rel => 
          rel.relationship_type === 'spouse' && !rel.is_ex
        );
        
        for (const spouse of childSpouses) {
          const spousePerson = allPeople.find(p => p.id === spouse.id);
          if (spousePerson) {
            // Check if person2 is this spouse's parent
            const spouseParents = (spousePerson.relatives || []).filter(rel => 
              rel.relationship_type === 'parent'
            );
            
            if (spouseParents.some(parent => parent.id === person2.id)) {
              return {
                hasConflict: true,
                reason: `Cannot be siblings - ${person2.first_name} ${person2.last_name} is parent of ${person1.first_name} ${person1.last_name}'s child's spouse (would create inappropriate in-law relationship)`
              };
            }
          }
        }
      }
    }
    
    return { hasConflict: false };
  };
  
  // Helper to get all descendants of a person (children, grandchildren, etc.)
  const getAllDescendants = (person, allPeople, visited = new Set()) => {
    if (visited.has(person.id)) return []; // Prevent infinite loops
    visited.add(person.id);
    
    const descendants = [];
    const personRels = person.relatives || [];
    const children = personRels.filter(rel => rel.relationship_type === 'child');
    
    for (const child of children) {
      const childPerson = allPeople.find(p => p.id === child.id);
      if (childPerson) {
        descendants.push(childPerson);
        // Recursively get grandchildren, great-grandchildren, etc.
        descendants.push(...getAllDescendants(childPerson, allPeople, new Set(visited)));
      }
    }
    
    return descendants;
  };

  // Helper to get in-law relationships
  const getInLaws = () => {
    return {
      parents_in_law: person.parents_in_law || [],
      children_in_law: person.children_in_law || [],
      siblings_in_law: person.siblings_in_law || [],
    };
  };

  // Custom handleAdd for each type
  const handleAdd = async (data) => {
    setIsLoading(true);
    setWarning('');
    try {
      // Check for duplicate relationship
      const alreadyRelated = getRelatedIds(addType).includes(data.selectedId);
      if (alreadyRelated) {
        setWarning('This person is already related as ' + RELATIONSHIP_LABELS[addType].slice(0, -1) + '.');
        setIsLoading(false);
        return;
      }
      let payload;
      if (addType === 'parent') {
        payload = {
          person_id: data.selectedId,
          relative_id: person.id,
          relationship_type: 'child',
        };
      } else if (addType === 'child') {
        payload = {
          person_id: person.id,
          relative_id: data.selectedId,
          relationship_type: 'child',
        };
      } else if (addType === 'spouse') {
        const selectedPerson = people.find(p => p.id === parseInt(data.selectedId));
        
        payload = {
          person_id: person.id,
          relative_id: data.selectedId,
          relationship_type: 'spouse',
        };
        
        // Automatically handle special spouse scenarios
        if (selectedPerson) {
          // If the person is deceased, mark as deceased spouse
          if (selectedPerson.date_of_death) {
            payload.is_deceased = true;
          }
          
          // If the person has a current spouse, mark as ex-spouse
          const selectedPersonSpouses = (selectedPerson.relatives || []).filter(rel => rel.relationship_type === 'spouse');
          const hasCurrentSpouse = selectedPersonSpouses.some(rel => {
            const spousePerson = people.find(p => p.id === rel.id);
            // Current spouse = not ex, not deceased, and the spouse person is not deceased
            return !rel.is_ex && !rel.is_deceased && !spousePerson?.date_of_death;
          });
          
          if (hasCurrentSpouse || data.forceEx) {
            payload.is_ex = true;
          }
        }
      } else if (addType === 'sibling') {
        payload = {
          person_id: person.id,
          relative_id: data.selectedId,
          relationship_type: 'sibling',
        };
        
        // Add shared parent for half-siblings
        if (data.shared_parent_id) {
          payload.shared_parent_id = data.shared_parent_id;
        }
      }
      await createRelationship(payload);
      setShowAdd(false);
      setAddType(null);
      if (onRelationshipAdded) onRelationshipAdded();
    } catch (err) {
      const errorMsg = err?.response?.data?.errors?.[0];
      if (errorMsg) {
        setWarning(errorMsg);
      } else {
        setWarning('Unable to create this relationship. Please check the selected people and relationship type.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get all relationships for a person
  const getAllRelationships = (targetPerson) => {
    const rels = groupRelatives(targetPerson);
    const inLaws = getInLaws();
    return {
      Parents: rels.parent,
      Children: rels.child,
      Spouses: rels.spouse,
      Siblings: rels.sibling,
      'Parents-in-law': inLaws.parents_in_law,
      'Children-in-law': inLaws.children_in_law,
      'Siblings-in-law': inLaws.siblings_in_law,
    };
  };

  // Show DeletePersonModal before deleting a person from relationships
  const handleDelete = async (relId) => {
    setIsLoading(true);
    try {
      // Fetch full person for modal
      const data = await getPerson(relId);
      setPendingDeleteId(relId);
      setPendingDeletePerson(data);
      setPendingDeleteRelationships(getAllRelationships(data));
      setShowDeleteModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm delete from modal
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePerson(pendingDeleteId);
      setShowDeleteModal(false);
      setPendingDeleteId(null);
      setPendingDeletePerson(null);
      setPendingDeleteRelationships({});
      if (onRelationshipDeleted) onRelationshipDeleted();
    } finally {
      setIsDeleting(false);
    }
  };

  const groups = groupRelatives(person);
  const inLaws = getInLaws();
  let mergedGroups = mergeInLaws(groups, inLaws);
  
  // Calculate step-parents and step-children (but not step-siblings - those come from backend)
  if (treeData?.nodes && treeData?.edges && person) {
    
    // Convert edges to relationships format that buildRelationshipMaps expects
    const relationships = treeData.edges.map(edge => ({
      from: edge.source,
      to: edge.target, 
      relationship_type: edge.type || edge.relationship_type,
      is_ex: edge.is_ex,
      is_deceased: edge.is_deceased
    }));
    
    const { stepParents, stepChildren, stepSiblings } = findStepRelationships(person, treeData.nodes, relationships);
    
    
    // Add step-parents to parent group
    if (stepParents.length > 0) {
      mergedGroups.parent = [...mergedGroups.parent, ...stepParents];
    }
    
    // Add step-children to child group
    if (stepChildren.length > 0) {
      mergedGroups.child = [...mergedGroups.child, ...stepChildren];
    }
    
    // NOTE: We do NOT add step-siblings here because they're now provided by the backend
    // and we had issues with Michael being incorrectly classified as a step-sibling
    // when he should be a half-sibling
    
  }

  return (
    <section className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
      <div className="flex items-center pb-2 border-b mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaUsers className="text-blue-400" /> Relationships
        </h2>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Manage parents, spouses, children, siblings, steps and in-laws. Click add or delete to modify.</p>
        {/* Existing relationships (detailed, editable) */}
        {Object.entries(mergedGroups).map(([type, rels]) => {
          let canAdd = false;
          let forceEx = false;
          if (type === 'parent') {
            // Only count biological parents (not step-parents) for the limit of 2
            const biologicalParents = rels.filter(rel => !rel.isStep);
            canAdd = biologicalParents.length < 2;
          } else if (type === 'spouse') {
            // Always show add button for spouse, but force ex if a current spouse exists
            canAdd = true;
            // Only force ex if there's a living current spouse (not deceased)
            forceEx = rels.some(rel => {
              const spousePerson = people.find(p => p.id === rel.id);
              return !rel.is_ex && !rel.isStep && !spousePerson?.date_of_death;
            });
          } else {
            canAdd = true;
          }
          // Always show add button for spouse, but RelationshipForm will force ex if needed
          const showAddButton = canAdd;
          return (
            <div key={type} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                  {type === 'parent' && <FaUserTie />} 
                  {type === 'child' && <FaChild />} 
                  {type === 'spouse' && <FaVenusMars />} 
                  {type === 'sibling' && <FaUserFriends />} 
                  {RELATIONSHIP_LABELS[type]}
                </h4>
                {showAddButton && (
                  <button
                    className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100 text-blue-600 text-xs"
                    title={`Add ${RELATIONSHIP_LABELS[type].toLowerCase().slice(0, -1)}${type === 'spouse' && forceEx ? ' (ex only)' : ''}`}
                    onClick={() => { 
                      const selectablePeople = getSelectablePeople(type);
                      if (selectablePeople.length === 0) {
                        showFilteringAlert(type);
                      } else {
                        setShowAdd(true); 
                        setAddType(type); 
                      }
                    }}
                  >
                    <FaPlus />
                  </button>
                )}
                {showAddButton && getSelectablePeople(type).length === 0 && (
                  <button
                    className="bg-yellow-50 border border-yellow-300 rounded-full p-1 shadow hover:bg-yellow-100 text-yellow-600 text-xs ml-1"
                    title="Why can't I add anyone? Click for details"
                    onClick={() => showFilteringAlert(type)}
                  >
                    ❓
                  </button>
                )}
              </div>
              {rels.length > 0 ? (
                <ul className="space-y-1">
                  {rels.map(rel => (
                    <li key={rel.id + (rel.inLaw ? '-inlaw' : '') + (rel.isStep ? '-step' : '')} className="flex items-center justify-between bg-white rounded px-3 py-2 border border-slate-100">
                      <span className="flex items-center gap-2">
                        {/* Check if spouse is deceased based on date_of_death */}
                        {(() => {
                          const spousePerson = people.find(p => p.id === rel.id);
                          const isDeceased = spousePerson && spousePerson.date_of_death;
                          const deathYear = isDeceased ? new Date(spousePerson.date_of_death).getFullYear() : null;
                          
                          if (type === 'spouse' && rel.is_ex) {
                            // Ex-spouse: Only show "ex" regardless of whether they died later
                            return (
                              <span className="font-medium text-red-500 line-through">
                                <a href={`/profile/${rel.id}`} className="hover:underline text-gray-800">{rel.full_name}</a> (ex)
                              </span>
                            );
                          } else if (type === 'spouse' && isDeceased) {
                            // Current spouse who died: Show "deceased in [year]" - all gray
                            return (
                              <span className="font-medium text-gray-600">
                                <a href={`/profile/${rel.id}`} className="hover:underline text-gray-600 hover:text-gray-800">{rel.full_name}</a> (deceased in {deathYear})
                              </span>
                            );
                          } else {
                            return (
                              <span className="font-medium">
                                <a href={`/profile/${rel.id}`} className="hover:underline text-gray-800">{rel.full_name}</a>
                                {rel.inLaw && ' (in-law)'}
                                {rel.isStep && ' (step)'}
                              </span>
                            );
                          }
                        })()}
                        {/* Edit icon for spouse to toggle ex status */}
                        {type === 'spouse' && !rel.inLaw && !rel.isStep && (
                          <button
                            type="button"
                            className={
                              'ml-2 text-blue-500' +
                              (toggleLoadingId === rel.relationship_id || isDeleting || showDeleteModal
                                ? ' opacity-50 cursor-not-allowed'
                                : ' hover:text-blue-700')
                            }
                            title={rel.is_ex ? 'Mark as current spouse' : 'Mark as ex-spouse'}
                            disabled={toggleLoadingId === rel.relationship_id || isDeleting || showDeleteModal}
                            onClick={async (event) => {
                              if (toggleLoadingId === rel.relationship_id || isDeleting || showDeleteModal) return;
                              event.preventDefault();
                              event.stopPropagation();
                              setWarning('');
                              setToggleLoadingId(rel.relationship_id);
                              
                              try {
                                // Enhanced validation - check for blood relationship before toggling
                                const bloodCheck = detectBloodRelationship(person.id, rel.id);
                                if (bloodCheck.isBloodRelated) {
                                  const action = rel.is_ex ? 'remarry' : 'divorce';
                                  const confirmMsg = `⚠️ Blood Relationship Warning\n\n${person.first_name} ${person.last_name} and ${rel.full_name} are blood relatives (${bloodCheck.relationship}).\n\nDo you want to ${action} them anyway?\n\nNote: Marriage between blood relatives is generally inappropriate.`;
                                  
                                  if (!confirm(confirmMsg)) {
                                    setToggleLoadingId(null);
                                    return;
                                  }
                                }
                                
                                await toggleSpouseExMutation.mutateAsync(rel.relationship_id);
                                if (onRelationshipAdded) onRelationshipAdded();
                              } catch (err) {
                                setWarning(
                                  err?.response?.data?.errors?.[0] ||
                                  'Failed to toggle ex-spouse status. Please try again.'
                                );
                              } finally {
                                setToggleLoadingId(null);
                              }
                            }}
                          >
                            <FaUserEdit />
                          </button>
                        )}
                      </span>
                      <div className="flex gap-2">
                        {/* Only show delete button for non-step relationships */}
                        {!rel.isStep && (
                          <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 text-red-500 text-xs" onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleDelete(rel.id); }} title="Delete Relationship">
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 ml-2">No {RELATIONSHIP_LABELS[type].toLowerCase()} found.</p>
              )}
              {showAdd && addType === type && (
                <div className="mt-4">
                  {warning && <div className="text-red-500 mb-2">{warning}</div>}
                  <RelationshipForm
                    type={type}
                    people={getSelectablePeople(type)}
                    allPeople={people}
                    selectedPerson={person}
                    onSubmit={async (data) => {
                      // If adding a spouse and a current spouse exists, force ex
                      if (type === 'spouse' && forceEx) {
                        data.forceEx = true;
                      }
                      await handleAdd(data);
                    }}
                    onCancel={() => { setShowAdd(false); setAddType(null); setWarning(''); }}
                    isLoading={isLoading}
                    forceEx={forceEx}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showDeleteModal && pendingDeletePerson && (
        <DeletePersonModal
          person={pendingDeletePerson}
          relationships={pendingDeleteRelationships}
          onConfirm={confirmDelete}
          onCancel={() => { setShowDeleteModal(false); setPendingDeleteId(null); setPendingDeletePerson(null); setPendingDeleteRelationships({}); }}
          isLoading={isDeleting}
        />
      )}
    </section>
  );
};

export default RelationshipManager;
