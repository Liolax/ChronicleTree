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
      const errorMessage = error?.response?.data?.errors?.[0] || 'Failed to create relationship. Please try again.';
      setWarning(errorMessage);
    },
  });

  // Check if two people are blood relatives (sharing genetic material)
  const detectBloodRelationship = (person1Id, person2Id) => {
    if (!treeData?.nodes || !treeData?.edges) {
      return { isBloodRelated: false, relationship: null, degree: null };
    }

    // Convert the tree structure data into a format our calculator can use
    const relationships = treeData.edges.map(edge => ({
      from: edge.source,
      to: edge.target, 
      relationship_type: edge.type || edge.relationship_type,
      is_ex: edge.is_ex,
      is_deceased: edge.is_deceased
    }));

    // Check for any blood relationship between these two people
    const bloodResult = detectAnyBloodRelationship(person1Id, person2Id, relationships, treeData.nodes);
    
    if (bloodResult.isBloodRelated) {
      return {
        isBloodRelated: true,
        relationship: bloodResult.relationship,
        degree: bloodResult.depth
      };
    }

    // Double-check our results using a different calculation method
    const calculatedRelation = calculateRelationshipToRoot(
      { id: person2Id }, 
      { id: person1Id }, 
      treeData.nodes, 
      relationships
    );
    
    // Make sure we're not mistaking in-law relationships for blood relationships
    if (calculatedRelation && calculatedRelation !== 'Unrelated') {
      const lowerRelation = calculatedRelation.toLowerCase();
      // These relationship types are not blood relationships
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

  // Helper function to determine if someone can marry a relative of their ex or deceased spouse
  // This handles complex remarriage situations like:
  // - Marrying an ex-spouse's sibling (allowed if no blood relation exists)
  // - Marrying a deceased spouse's relative (allowed if no blood relation exists)
  // Note: Blood relatives are always prevented from marrying, regardless of previous marriages
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
            return true; // Allowed - relative of ex/deceased spouse but not blood related to current person
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

  // Validate whether a relationship is allowed based on various rules and constraints
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
    
    // Validation for parent-child relationships
    if (type === 'child') {
      // 1. Important: Prevent any blood relative from becoming a child
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot add blood relative (${bloodCheck.relationship}) as child - would create invalid family structure` 
        };
      }
      
      // 2. Check that the ages make sense for a parent-child relationship
      if (person1.date_of_birth && person2.date_of_birth) {
        const person1Birth = new Date(person1.date_of_birth);
        const person2Birth = new Date(person2.date_of_birth);
        const ageGapYears = (person2Birth.getTime() - person1Birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Child must be at least 12 years younger
        if (ageGapYears < 12) {
          return { 
            valid: false, 
            reason: `${person2.first_name} ${person2.last_name} is not young enough to be child (${ageGapYears.toFixed(1)} year age gap, minimum 12 years required)` 
          };
        }
        
        // Prevent unrealistic age gaps (over 60 years between parent and child)
        if (ageGapYears > 60) {
          return { 
            valid: false, 
            reason: `Age gap too large (${ageGapYears.toFixed(1)} years) - unlikely parent-child relationship` 
          };
        }
      }
      
      // 3. Check if person2 already has 2 biological parents
      const person2Parents = person2.relatives?.filter(rel => rel.relationship_type === 'parent' && !rel.isStep) || [];
      if (person2Parents.length >= 2) {
        return { 
          valid: false, 
          reason: `${person2.first_name} ${person2.last_name} already has maximum number of biological parents (2)` 
        };
      }
    }
    
    // Validation for spouse relationships, including complex remarriage situations
    if (type === 'spouse') {
      // Always prevent marriage between blood relatives regardless of previous marriages
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot marry blood relative (${bloodCheck.relationship}) - incestuous relationships are prohibited` 
        };
      }
      
      // Allow these specific remarriage scenarios:
      // 1. Marrying ex-spouse's sibling (if no blood relation to current person)
      // 2. Marrying deceased spouse's relative (if no blood relation to current person)
      const isRemarriageRelative = isAllowedRemarriageRelative(person1Id, person2Id);
      if (isRemarriageRelative) {
        // Double-check no blood relationship exists (safety check)
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
    
    // Validation for sibling relationships
    if (type === 'sibling') {
      // 1. Prevent people from different generations from being siblings
      if (bloodCheck.isBloodRelated) {
        const relationship = bloodCheck.relationship || '';
        const lowerRel = relationship.toLowerCase();
        
        // Block all relationships between different generations
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
        
        // Block people who are already siblings
        if (lowerRel.includes('sibling') || lowerRel.includes('brother') || lowerRel.includes('sister')) {
          return { 
            valid: false, 
            reason: `Already siblings with ${person2.first_name} ${person2.last_name}` 
          };
        }
        
        // Block cousin relationships (conservative approach to avoid confusion)
        if (lowerRel.includes('cousin')) {
          return { 
            valid: false, 
            reason: `Cannot be siblings with ${bloodCheck.relationship.toLowerCase()} - blood relatives should not be step-siblings` 
          };
        }
      }
      
      // 2. Check that the age difference is reasonable for siblings
      if (person1.date_of_birth && person2.date_of_birth) {
        const person1Birth = new Date(person1.date_of_birth);
        const person2Birth = new Date(person2.date_of_birth);
        const ageGapYears = Math.abs((person2Birth.getTime() - person1Birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        
        // Siblings typically don't have more than a 25-year age gap
        if (ageGapYears > 25) {
          return { 
            valid: false, 
            reason: `Age gap too large for siblings (${ageGapYears.toFixed(1)} years) - unlikely to share parents` 
          };
        }
      }
      
      // 3. Check that both people were alive at the same time (for biological siblings)
      if (person1.date_of_birth && person2.date_of_birth) {
        const person1Birth = new Date(person1.date_of_birth);
        const person2Birth = new Date(person2.date_of_birth);
        
        // Check if one person died before the other was born
        if (person1.date_of_death) {
          const person1Death = new Date(person1.date_of_death);
          if (person2Birth > person1Death) {
            return { 
              valid: false, 
              reason: `${person1.first_name} ${person1.last_name} died before ${person2.first_name} ${person2.last_name} was born - cannot be biological siblings` 
            };
          }
        }
        
        if (person2.date_of_death) {
          const person2Death = new Date(person2.date_of_death);
          if (person1Birth > person2Death) {
            return { 
              valid: false, 
              reason: `${person2.first_name} ${person2.last_name} died before ${person1.first_name} ${person1.last_name} was born - cannot be biological siblings` 
            };
          }
        }
      }
    }
    
    // Validation for parent-child relationships
    if (type === 'parent') {
      // 1. Check if person2 already has 2 biological parents
      const person2Parents = person2.relatives?.filter(rel => rel.relationship_type === 'parent' && !rel.isStep) || [];
      if (person2Parents.length >= 2) {
        return { valid: false, reason: 'Person already has maximum number of biological parents (2)' };
      }
      
      // 2. Important: Prevent any blood relative from becoming a parent
      if (bloodCheck.isBloodRelated) {
        return { 
          valid: false, 
          reason: `Cannot add blood relative (${bloodCheck.relationship}) as parent - would create invalid family structure` 
        };
      }
      
      // 3. Check that the ages make sense for a parent-child relationship
      if (person1.date_of_birth && person2.date_of_birth) {
        const person1Birth = new Date(person1.date_of_birth);
        const person2Birth = new Date(person2.date_of_birth);
        const ageGapYears = (person2Birth.getTime() - person1Birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Parent must be at least 12 years older than the child
        if (ageGapYears < 12) {
          return { 
            valid: false, 
            reason: `${person1.first_name} ${person1.last_name} is not old enough to be parent (${ageGapYears.toFixed(1)} year age gap, minimum 12 years required)` 
          };
        }
        
        // Prevent unrealistic age gaps (over 60 years between parent and child)
        if (ageGapYears > 60) {
          return { 
            valid: false, 
            reason: `Age gap too large (${ageGapYears.toFixed(1)} years) - unlikely parent-child relationship` 
          };
        }
      }
      
      // 4. Prevent deceased people from being parents of people born after their death
      if (person1.date_of_death && person2.date_of_birth) {
        const person1Death = new Date(person1.date_of_death);
        const person2Birth = new Date(person2.date_of_birth);
        
        if (person2Birth > person1Death) {
          return { 
            valid: false, 
            reason: `${person1.first_name} ${person1.last_name} died before ${person2.first_name} ${person2.last_name} was born - cannot be parent` 
          };
        }
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
      // Determine what type of error message to show based on the validation failure
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
