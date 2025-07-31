import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { usePerson, useFullTree } from '../../services/people';
import { calculateRelationshipToRoot } from '../../utils/improvedRelationshipCalculator';
import { showValidationAlert, validateMarriageAge, showFormError } from '../../utils/validationAlerts';

const EditPersonForm = ({ person, onSave, onCancel }) => {
  // Fetch detailed person data including relationships
  const { data: detailedPerson } = usePerson(person?.id);
  const { data: treeData } = useFullTree();

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      firstName: person?.first_name || '',
      lastName: person?.last_name || '',
      birthDate: person?.date_of_birth ? person.date_of_birth.slice(0, 10) : '',
      deathDate: person?.date_of_death ? person.date_of_death.slice(0, 10) : '',
      isDeceased: !!person?.date_of_death,
      gender: person?.gender || '',
    },
  });

  React.useEffect(() => {
    reset({
      firstName: person?.first_name || '',
      lastName: person?.last_name || '',
      birthDate: person?.date_of_birth ? person.date_of_birth.slice(0, 10) : '',
      deathDate: person?.date_of_death ? person.date_of_death.slice(0, 10) : '',
      isDeceased: !!person?.date_of_death,
      gender: person?.gender || '',
    });
  }, [person, reset]);

  const isDeceased = watch('isDeceased');

  // Check if setting person as alive would create marriage conflict
  const checkMarriageConflict = () => {
    if (!detailedPerson?.relatives || !treeData?.edges) {
      return { hasConflict: false };
    }

    // Find current spouses of this person
    const currentSpouses = detailedPerson.relatives.filter(rel => 
      rel.relationship_type === 'spouse' && !rel.is_ex
    );

    for (const spouse of currentSpouses) {
      // Check if this spouse has other current marriages (excluding the one with this person)
      const spouseOtherMarriages = treeData.edges.filter(edge => 
        (edge.source === spouse.id || edge.target === spouse.id) &&
        (edge.type === 'spouse' || edge.relationship_type === 'spouse') &&
        !edge.is_ex &&
        edge.source !== person.id &&
        edge.target !== person.id
      );

      if (spouseOtherMarriages.length > 0) {
        return {
          hasConflict: true,
          spouseName: `${spouse.first_name} ${spouse.last_name}`,
          conflictCount: spouseOtherMarriages.length
        };
      }
    }

    return { hasConflict: false };
  };

  // Check if two people are blood relatives
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


  // Clear death date when person is marked as alive
  React.useEffect(() => {
    if (!isDeceased) {
      reset(prev => ({
        ...prev,
        deathDate: ''
      }));
    }
  }, [isDeceased, reset]);

  const onSubmit = (data) => {
    // Check for marriage conflicts before saving
    if (person?.date_of_death && !data.isDeceased) {
      const conflict = checkMarriageConflict();
      if (conflict.hasConflict) {
        showValidationAlert('marriageConflict', { 
          spouseName: conflict.spouseName 
        });
        return; // Don't submit form
      }
    }
    
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 max-h-[340px] overflow-y-auto">
      <Input
        label="First Name"
        {...register('firstName', { required: 'First name is required' })}
        error={errors.firstName}
      />
      <Input
        label="Last Name"
        {...register('lastName', { required: 'Last name is required' })}
        error={errors.lastName}
      />
      <Input
        label="Birth Date"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        {...register('birthDate', {
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Birth date cannot be in the future';
            
            // Check against death date
            const deathDate = watch('deathDate');
            if (value && deathDate && new Date(value) > new Date(deathDate)) {
              return 'Birth date cannot be after death date';
            }
            
            // Validate against existing children (if person is parent)
            const children = detailedPerson?.relatives?.filter(rel => rel.relationship_type === 'child') || 
                           person?.children || [];
            if (value && children.length > 0) {
              const birthDate = new Date(value);
              for (const child of children) {
                if (child.date_of_birth) {
                  const childBirth = new Date(child.date_of_birth);
                  const ageDiff = (childBirth - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
                  
                  if (ageDiff < 12) {
                    if (ageDiff < 0) {
                      setTimeout(() => {
                        showFormError('birthDateYounger', person, child);
                      }, 100);
                      return `Cannot be younger than child ${child.first_name} ${child.last_name}`;
                    } else {
                      setTimeout(() => {
                        showFormError('birthDateTooClose', { ...person, ageDiff }, child);
                      }, 100);
                      return `Must be at least 12 years older than child ${child.first_name} ${child.last_name}`;
                    }
                  }
                }
              }
            }
            
            // Validate against existing parents (if person is child)
            const parents = detailedPerson?.relatives?.filter(rel => rel.relationship_type === 'parent') || 
                          person?.parents || [];
            if (value && parents.length > 0) {
              const birthDate = new Date(value);
              for (const parent of parents) {
                if (parent.date_of_birth) {
                  const parentBirth = new Date(parent.date_of_birth);
                  const ageDiff = (birthDate - parentBirth) / (365.25 * 24 * 60 * 60 * 1000);
                  
                  if (ageDiff < 12) {
                    if (ageDiff < 0) {
                      setTimeout(() => {
                        showFormError('parentAgeError', person, {}, parent);
                      }, 100);
                      return `Cannot be older than parent ${parent.first_name} ${parent.last_name}`;
                    } else {
                      setTimeout(() => {
                        showFormError('parentAgeTooClose', person, {}, { ...parent, ageDiff });
                      }, 100);
                      return `Parent ${parent.first_name} ${parent.last_name} must be at least 12 years older`;
                    }
                  }
                }
              }
            }
            
            // Check spouse constraints
            const spouses = detailedPerson?.relatives?.filter(rel => rel.relationship_type === 'spouse') || [];
            for (const spouse of spouses) {
              // Check marriage age only if both have birth dates
              if (value && spouse.date_of_birth) {
                const currentDate = new Date();
                const personAge = (currentDate - new Date(value)) / (1000 * 60 * 60 * 24 * 365.25);
                const spouseAge = (currentDate - new Date(spouse.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25);
                
                if (personAge < 16) {
                  setTimeout(() => {
                    showFormError('marriageAge', { ...person, age: personAge.toFixed(1) });
                  }, 100);
                  return 'Too young to be married';
                }
              }
              
              // Check blood relationship
              const bloodCheck = detectBloodRelationship(person.id, spouse.id);
              if (bloodCheck.isBloodRelated) {
                setTimeout(() => showValidationAlert('bloodRelatives', { relationship: 'spouse' }), 100);
                return 'Blood relatives cannot marry';
              }
            }
            
            return true;
          }
        })}
        error={errors.birthDate}
      />
      <div className="flex items-center">
        <input
          id="isDeceased"
          type="checkbox"
          {...register('isDeceased', {
            validate: value => {
              // Check if setting person as alive would cause problems
              if (person?.date_of_death && !value) {
                const conflict = checkMarriageConflict();
                if (conflict.hasConflict) {
                  setTimeout(() => {
                    showValidationAlert('marriageConflict', { 
                      spouseName: conflict.spouseName 
                    });
                  }, 100);
                  return `Cannot set as alive - spouse ${conflict.spouseName} has another current marriage`;
                }
              }
              return true;
            }
          })}
          className="h-4 w-4 rounded mr-2"
        />
        <label htmlFor="isDeceased" className="text-sm">Deceased</label>
        {errors.isDeceased && (
          <span className="text-red-500 text-xs ml-2">{errors.isDeceased.message}</span>
        )}
      </div>
      <Input
        label="Death Date"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        {...register('deathDate', {
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Death date cannot be in the future';
            
            // Check against birth date
            const birthDate = watch('birthDate');
            if (value && birthDate && new Date(value) < new Date(birthDate)) {
              return 'Death date cannot be before birth date';
            }
            
            // Validate against existing children (cannot die before children are born)
            const children = detailedPerson?.relatives?.filter(rel => rel.relationship_type === 'child') || 
                           person?.children || [];
            if (value && children.length > 0) {
              const deathDate = new Date(value);
              for (const child of children) {
                if (child.date_of_birth) {
                  const childBirth = new Date(child.date_of_birth);
                  
                  if (deathDate < childBirth) {
                    setTimeout(() => {
                      showFormError('deathDateError', person, child);
                    }, 100);
                    return `Cannot die before child ${child.first_name} ${child.last_name} was born`;
                  }
                }
              }
            }
            
            // Check timeline constraints
            const spouses = detailedPerson?.relatives?.filter(rel => rel.relationship_type === 'spouse') || [];
            for (const spouse of spouses) {
              if (spouse.date_of_birth) {
                const personDeath = new Date(value);
                const spouseBirth = new Date(spouse.date_of_birth);
                if (personDeath < spouseBirth) {
                  setTimeout(() => showValidationAlert('timeline'), 100);
                  return 'Timeline validation failed';
                }
              }
            }
            
            return true;
          }
        })}
        error={errors.deathDate}
        disabled={!isDeceased}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          id="gender"
          {...register('gender', { required: 'Gender is required' })}
          className="mt-1 block w-full pl-3 pr-10 py-2 border border-app-accent focus:outline-none focus:ring-app-accent focus:border-app-accent sm:text-sm rounded-md bg-white"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <Button type="button" onClick={onCancel} variant="grey">
          Cancel
        </Button>
        <Button type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};

export default EditPersonForm;
