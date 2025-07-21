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
    console.log('[findStepRelationships] Missing required data');
    return { stepParents: [], stepChildren: [] };
  }

  console.log('[findStepRelationships] Processing for:', person.full_name, 'ID:', person.id);
  
  const relationshipMaps = buildRelationshipMaps(relationships, allPeople);
  const { childToParents, parentToChildren, spouseMap, deceasedSpouseMap, exSpouseMap } = relationshipMaps;
  
  console.log('[findStepRelationships] Relationship maps:', {
    spouseMapSize: spouseMap.size,
    exSpouseMapSize: exSpouseMap.size,
    deceasedSpouseMapSize: deceasedSpouseMap.size
  });
  
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
  
  console.log('[findStepRelationships] Person spouses:', {
    personId: person.id,
    currentSpouses: Array.from(personCurrentSpouses),
    exSpouses: Array.from(personExSpouses),
    deceasedSpouses: Array.from(personDeceasedSpouses),
    allSpouses: Array.from(allPersonSpouses)
  });
  
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

  return { stepParents, stepChildren };
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
      console.log(`🩸 BLOOD RELATIONSHIP DETECTED: Person ${person1Id} and ${person2Id} are related as ${bloodResult.relationship} (depth: ${bloodResult.depth})`);
      return {
        isBloodRelated: true,
        relationship: bloodResult.relationship,
        degree: bloodResult.depth
      };
    }

    return { isBloodRelated: false, relationship: null, degree: null };
  };

  // Helper to check if a person is an ex or deceased spouse's relative (but not blood related to current person)
  // ✅ COMPLEX REMARRIAGE SCENARIOS SUPPORTED:
  // - Marrying ex-spouse's sibling (if no blood relation)
  // - Marrying deceased spouse's relative (if no blood relation)
  // ❌ ALWAYS PREVENTED: Any blood relative regardless of previous marriages
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
          // CRITICAL: Ensure candidate is not blood related to current person
          const bloodCheck = detectBloodRelationship(person.id, candidateId);
          if (!bloodCheck.isBloodRelated) {
            const spouseStatus = spouse.is_ex ? 'ex-spouse' : 'deceased spouse';
            const candidatePerson = people.find(p => p.id === candidateId);
            const spouseRelType = spousePerson.relatives.find(rel => rel.id === candidateId)?.relationship_type;
            
            console.log(`✅ ALLOWED REMARRIAGE: ${candidatePerson?.first_name} ${candidatePerson?.last_name} is ${spouseRelType} of ${spouseStatus} ${spousePerson.first_name} ${spousePerson.last_name}, with no blood relation to current person`);
            return true; // ✅ Allowed - relative of ex/deceased spouse but not blood related to current person
          } else {
            console.log(`❌ BLOCKED REMARRIAGE: Blood relationship detected - ${bloodCheck.relationship}`);
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
      // When adding parent: selected person (child) should be at least 12 years younger
      if (person2Birth <= person1Birth) {
        return { valid: false, reason: 'Parent must be older than child' };
      }
      if (ageGapInYears < 12) {
        return { valid: false, reason: 'Parent must be at least 12 years older than child' };
      }
    } else if (relationshipType === 'child') {
      // When adding child: selected person (parent) should be at least 12 years older  
      if (person1Birth <= person2Birth) {
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
    
    // Enhanced validation for children - prevent shared children between blood relatives
    if (type === 'child') {
      if (bloodCheck.isBloodRelated) {
        // Blood relatives cannot have shared children
        return { 
          valid: false, 
          reason: `Blood relatives (${bloodCheck.relationship}) cannot have shared children` 
        };
      }
    }
    
    // Enhanced validation for spouses - complex remarriage scenarios
    if (type === 'spouse') {
      // ALWAYS prevent marriage between blood relatives regardless of previous marriages
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
      
      // Check for deceased spouse constraint for current spouses
      const candidateRels = candidate.relatives || [];
      const candidateSpouses = candidateRels.filter(rel => rel.relationship_type === 'spouse');
      const hasCurrentSpouse = candidateSpouses.some(rel => !rel.is_ex && !people.find(p => p.id === rel.id)?.date_of_death);
      if (hasCurrentSpouse) {
        return { valid: false, reason: 'Person already has a current spouse' };
      }
      
      // ✅ COMPLEX REMARRIAGE SCENARIOS - Allow these specific cases:
      // 1. Marrying ex-spouse's sibling (if no blood relation to current person)
      // 2. Marrying deceased spouse's relative (if no blood relation to current person)
      const isRemarriageRelative = isAllowedRemarriageRelative(candidateId);
      if (isRemarriageRelative) {
        // Double-check no blood relationship exists (this should already be verified in isAllowedRemarriageRelative)
        const finalBloodCheck = detectBloodRelationship(person.id, candidateId);
        if (finalBloodCheck.isBloodRelated) {
          return { 
            valid: false, 
            reason: `Cannot marry ${candidate.first_name} ${candidate.last_name} - blood relationship detected (${finalBloodCheck.relationship})` 
          };
        }
        // If we reach here, this is an allowed remarriage scenario
        return { valid: true };
      }
    }
    
    // Enhanced validation for siblings - prevent parents/uncles/aunts from being siblings
    if (type === 'sibling') {
      if (bloodCheck.isBloodRelated) {
        const relationship = bloodCheck.relationship || '';
        if (relationship.includes('Parent') || relationship.includes('Child') || 
            relationship.includes('Uncle') || relationship.includes('Aunt') ||
            relationship.includes('Nephew') || relationship.includes('Niece') ||
            relationship.includes('Grandparent') || relationship.includes('Grandchild')) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${bloodCheck.relationship.toLowerCase()}` 
          };
        }
      }
    }
    
    // Prevent adding more than 2 biological parents
    if (type === 'parent') {
      const biologicalParents = existingRels.filter(rel => rel.relationship_type === 'parent' && !rel.isStep);
      if (biologicalParents.length >= 2) {
        return { valid: false, reason: 'Person already has maximum number of biological parents (2)' };
      }
      
      // Prevent child from becoming parent (should be caught by blood relationship check)
      if (bloodCheck.isBloodRelated && bloodCheck.relationship && 
          (bloodCheck.relationship.includes('Child') || bloodCheck.relationship.includes('Grandchild'))) {
        return { 
          valid: false, 
          reason: `Cannot add ${bloodCheck.relationship.toLowerCase()} as parent` 
        };
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
    
    return people.filter(p => {
      // Basic exclusion (self and already related)
      if (excludeIds.includes(p.id)) return false;
      
      // Full relationship constraints check when tree data is available
      const constraintCheck = checkRelationshipConstraints(p.id, type);
      
      return constraintCheck.valid;
    });
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
        payload = {
          person_id: person.id,
          relative_id: data.selectedId,
          relationship_type: 'spouse',
        };
      } else if (addType === 'sibling') {
        payload = {
          person_id: person.id,
          relative_id: data.selectedId,
          relationship_type: 'sibling',
        };
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
  
  // Calculate and add step relationships
  console.log('[RelationshipManager] Debug treeData structure:', treeData);
  if (treeData?.nodes && treeData?.edges && person) {
    console.log('[RelationshipManager] Calculating step relationships for:', person.full_name);
    console.log('[RelationshipManager] TreeData:', { peopleCount: treeData.nodes.length, relationshipsCount: treeData.edges.length });
    console.log('[RelationshipManager] Sample edges:', treeData.edges.slice(0, 3));
    
    // Convert edges to relationships format that buildRelationshipMaps expects
    const relationships = treeData.edges.map(edge => ({
      from: edge.source,
      to: edge.target, 
      relationship_type: edge.type || edge.relationship_type,
      is_ex: edge.is_ex,
      is_deceased: edge.is_deceased
    }));
    
    const { stepParents, stepChildren } = findStepRelationships(person, treeData.nodes, relationships);
    
    console.log('[RelationshipManager] Found step relationships:', { stepParents, stepChildren });
    
    // Add step-parents to parent group
    if (stepParents.length > 0) {
      console.log('[RelationshipManager] Adding step-parents:', stepParents);
      mergedGroups.parent = [...mergedGroups.parent, ...stepParents];
    }
    
    // Add step-children to child group  
    if (stepChildren.length > 0) {
      console.log('[RelationshipManager] Adding step-children:', stepChildren);
      mergedGroups.child = [...mergedGroups.child, ...stepChildren];
    }
  } else {
    console.log('[RelationshipManager] Missing data for step calculations:', {
      hasTreeData: !!treeData,
      hasPeople: !!treeData?.nodes,
      hasRelationships: !!treeData?.edges,
      hasPerson: !!person
    });
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
            // Only consider biological spouses (not step-spouses) for forcing ex status
            forceEx = rels.some(rel => !rel.is_ex && !rel.isStep);
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
