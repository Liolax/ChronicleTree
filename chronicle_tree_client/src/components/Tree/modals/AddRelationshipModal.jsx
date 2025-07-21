import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../UI/Modal';
import RelationshipForm from '../../Forms/RelationshipForm';
import { createRelationship, useFullTree } from '../../../services/people';
import { calculateRelationshipToRoot } from '../../../utils/improvedRelationshipCalculator';
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

  // Enhanced blood relationship detection (same as in RelationshipManager)
  const detectBloodRelationship = (person1Id, person2Id) => {
    if (!treeData?.nodes || !treeData?.edges) {
      return { isBloodRelated: false, relationship: null, degree: null };
    }

    const relationships = treeData.edges.map(edge => ({
      from: edge.source,
      to: edge.target, 
      relationship_type: edge.type || edge.relationship_type,
      is_ex: edge.is_ex,
      is_deceased: edge.is_deceased
    }));

    const relationshipToRoot = calculateRelationshipToRoot(person2Id, person1Id, relationships, treeData.nodes);
    
    const bloodRelationships = [
      'Parent', 'Child', 'Father', 'Mother', 'Son', 'Daughter',
      'Brother', 'Sister', 'Sibling',
      'Grandfather', 'Grandmother', 'Grandparent', 'Grandson', 'Granddaughter', 'Grandchild',
      'Great-Grandfather', 'Great-Grandmother', 'Great-Grandparent', 'Great-Grandson', 'Great-Granddaughter', 'Great-Grandchild',
      'Uncle', 'Aunt', 'Nephew', 'Niece',
      '1st Cousin', '2nd Cousin', 'Cousin'
    ];

    const isBloodRelated = bloodRelationships.some(rel => 
      relationshipToRoot && relationshipToRoot.toLowerCase().includes(rel.toLowerCase())
    );

    return {
      isBloodRelated,
      relationship: relationshipToRoot,
      degree: isBloodRelated ? 1 : null
    };
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
    
    // Enhanced validation for spouses - prevent marriage between blood relatives
    if (type === 'spouse') {
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot marry blood relative (${bloodCheck.relationship})` 
        };
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
