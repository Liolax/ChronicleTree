import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../UI/Modal';
import RelationshipForm from '../../Forms/RelationshipForm';
import { createRelationship, useFullTree } from '../../../services/people';
import { calculateRelationshipToRoot, detectAnyBloodRelationship } from '../../../utils/improvedRelationshipCalculator';
import { showValidationAlert } from '../../../utils/validationAlerts';

const RELATIONSHIP_TYPE_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
];

const AddRelationshipModal = ({ isOpen = true, onClose, people }) => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [warning, setWarning] = useState('');
  
  // Get full tree data for blood relationship validation
  const { data: treeData } = useFullTree();

  const { mutate, isLoading } = useMutation(createRelationship, {
    onSuccess: () => {
      queryClient.invalidateQueries(['people']);
      queryClient.invalidateQueries(['tree']);
      queryClient.invalidateQueries(['full-tree']);
      onClose();
    },
    onError: (error) => {
      console.error("Error creating relationship:", error);
      const errorMessage = error?.response?.data?.errors?.[0] || 'Failed to create relationship. Please try again.';
      setWarning(errorMessage);
    },
  });

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
      console.log(`🩸 BLOOD RELATIONSHIP DETECTED (Modal): Person ${person1Id} and ${person2Id} are related as ${bloodResult.relationship} (depth: ${bloodResult.depth})`);
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
        console.log(`✅ IN-LAW RELATIONSHIP ALLOWED (Modal): Person ${person1Id} and ${person2Id} are related as ${calculatedRelation} - NOT blood relatives`);
        return { isBloodRelated: false, relationship: calculatedRelation, degree: null };
      }
    }

    return { isBloodRelated: false, relationship: null, degree: null };
  };

  // Helper to check if a person is an ex or deceased spouse's relative (but not blood related to current person)
  // ✅ COMPLEX REMARRIAGE SCENARIOS SUPPORTED:
  // - Marrying ex-spouse's sibling (if no blood relation)
  // - Marrying deceased spouse's relative (if no blood relation)
  // ❌ ALWAYS PREVENTED: Any blood relative regardless of previous marriages
  const isAllowedRemarriageRelative = (currentPersonId, candidateId) => {
    const currentPerson = people.find(p => p.id === parseInt(currentPersonId));
    if (!currentPerson?.relatives) return false;
    
    // Get all ex-spouses and deceased spouses of the current person
    const exAndDeceasedSpouses = currentPerson.relatives.filter(rel => 
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
          const bloodCheck = detectBloodRelationship(currentPersonId, candidateId);
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
    
    if (relationshipType === 'spouse') {
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
    
    return { valid: true };
  };

  // Enhanced relationship constraint validation
  const validateRelationshipConstraints = (person1Id, person2Id, type) => {
    const person1 = people.find(p => p.id === parseInt(person1Id));
    const person2 = people.find(p => p.id === parseInt(person2Id));
    
    if (!person1 || !person2) return { valid: false, reason: 'Person not found' };

    // Age validation
    const ageCheck = validateAgeConstraint(person1, person2, type);
    if (!ageCheck.valid) {
      return ageCheck;
    }

    // Blood relationship detection
    const bloodCheck = detectBloodRelationship(person1Id, person2Id);
    
    // Enhanced validation for children - prevent shared children between blood relatives
    if (type === 'child') {
      if (bloodCheck.isBloodRelated) {
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
      
      // ✅ COMPLEX REMARRIAGE SCENARIOS - Allow these specific cases:
      // 1. Marrying ex-spouse's sibling (if no blood relation to current person)
      // 2. Marrying deceased spouse's relative (if no blood relation to current person)
      const isRemarriageRelative = isAllowedRemarriageRelative(person1Id, person2Id);
      if (isRemarriageRelative) {
        // Double-check no blood relationship exists (this should already be verified in isAllowedRemarriageRelative)
        const finalBloodCheck = detectBloodRelationship(person1Id, person2Id);
        if (finalBloodCheck.isBloodRelated) {
          return { 
            valid: false, 
            reason: `Cannot marry ${person2.first_name} ${person2.last_name} - blood relationship detected (${finalBloodCheck.relationship})` 
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
      // Check if person2 already has 2 parents
      const person2Parents = person2.relatives?.filter(rel => rel.relationship_type === 'parent' && !rel.isStep) || [];
      if (person2Parents.length >= 2) {
        return { valid: false, reason: 'Person already has maximum number of biological parents (2)' };
      }
    }
    
    return { valid: true };
  };

  // Filter people based on selected relationship type and constraints
  const getFilteredPeople = (type) => {
    if (!type) return people;
    
    return people.filter(p => {
      const constraintCheck = validateRelationshipConstraints(selectedPerson?.id, p.id, type);
      return constraintCheck.valid;
    });
  };

  const handleSubmit = (data) => {
    setWarning('');
    
    // Validate relationship constraints before submitting
    const validation = validateRelationshipConstraints(data.selectedId, selectedPerson?.id, selectedType);
    if (!validation.valid) {
      // Determine alert type based on validation reason
      let alertType = 'invalidRelationship';
      let alertDetails = {};
      
      if (validation.reason.includes('marriage age') || validation.reason.includes('16 years')) {
        alertType = 'marriageAge';
      } else if (validation.reason.includes('blood relative') || validation.reason.includes('Blood relatives')) {
        alertType = 'bloodRelatives';
        alertDetails = { relationship: selectedType };
      } else if (validation.reason.includes('maximum') || validation.reason.includes('biological parents')) {
        alertType = 'maxParents';
        const targetPerson = people.find(p => p.id === parseInt(data.selectedId));
        alertDetails = { targetName: targetPerson ? `${targetPerson.first_name} ${targetPerson.last_name}` : 'Person' };
      } else if (validation.reason.includes('birth date')) {
        alertType = 'missingData';
      }
      
      showValidationAlert(alertType, alertDetails);
      setWarning(validation.reason);
      return;
    }
    
    const relationshipData = {
      person_id: selectedPerson?.id,
      relative_id: data.selectedId,
      relationship_type: selectedType,
      is_ex: data.is_ex,
    };
    mutate(relationshipData);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Relationship">
      <div className="space-y-4">
        {warning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{warning}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="selectedPerson" className="block text-sm font-medium text-gray-700">
            Select First Person
          </label>
          <select
            id="selectedPerson"
            value={selectedPerson?.id || ''}
            onChange={(e) => {
              const personId = e.target.value;
              const person = people.find(p => p.id === parseInt(personId));
              setSelectedPerson(person);
              setSelectedType(''); // Reset relationship type when person changes
              setWarning(''); // Clear any warnings
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Person</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.first_name} {person.last_name}
              </option>
            ))}
          </select>
        </div>

        {selectedPerson && (
          <div>
            <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700">
              Relationship Type
            </label>
            <select
              id="relationshipType"
              value={selectedType}
              onChange={handleTypeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select Relationship Type</option>
              {RELATIONSHIP_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPerson && selectedType && (
          <RelationshipForm 
            onSubmit={handleSubmit} 
            onCancel={onClose} 
            people={getFilteredPeople(selectedType)}
            allPeople={people}
            selectedPerson={selectedPerson}
            type={selectedType}
            isLoading={isLoading} 
            cancelVariant="grey"
          />
        )}
      </div>
    </Modal>
  );
};

export default AddRelationshipModal;
