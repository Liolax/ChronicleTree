import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { usePerson, useFullTree } from '../../services/people';
import { calculateRelationshipToRoot } from '../../utils/improvedRelationshipCalculator';

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

  // Enhanced blood relationship detection for validation
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

  // Enhanced relationship validation for spouse date editing
  const validateSpouseRelationshipConstraints = (newBirthDate, newDeathDate) => {
    const spouses = detailedPerson?.relatives?.filter(rel => rel.relationship_type === 'spouse') || [];
    const warnings = [];

    for (const spouse of spouses) {
      // Check for blood relationship violations when editing dates
      const bloodCheck = detectBloodRelationship(person.id, spouse.id);
      if (bloodCheck.isBloodRelated) {
        warnings.push(`⚠️ Blood Relationship Warning:\n\n${person.first_name} ${person.last_name} is married to ${spouse.first_name} ${spouse.last_name}, but they are blood relatives (${bloodCheck.relationship}).\n\nThis relationship should be reviewed for appropriateness.`);
      }

      // Check for impossible spouse relationships based on birth dates
      if (newBirthDate && spouse.date_of_death) {
        const personBirth = new Date(newBirthDate);
        const spouseDeath = new Date(spouse.date_of_death);
        if (personBirth > spouseDeath) {
          warnings.push(`⚠️ Timeline Warning:\n\n${person.first_name} ${person.last_name} would be born after their spouse ${spouse.first_name} ${spouse.last_name} died.\n\nBirth: ${newBirthDate}\nSpouse died: ${spouse.date_of_death}\n\nThis creates an impossible relationship timeline.`);
        }
      }

      // Check for impossible spouse relationships based on death dates
      if (newDeathDate && spouse.date_of_birth) {
        const personDeath = new Date(newDeathDate);
        const spouseBirth = new Date(spouse.date_of_birth);
        if (personDeath < spouseBirth) {
          warnings.push(`⚠️ Timeline Warning:\n\n${person.first_name} ${person.last_name} would have died before their spouse ${spouse.first_name} ${spouse.last_name} was born.\n\nDeath: ${newDeathDate}\nSpouse born: ${spouse.date_of_birth}\n\nThis creates an impossible relationship timeline.`);
        }
      }
    }

    return warnings;
  };

  // Reset death date when 'Deceased' is unchecked
  React.useEffect(() => {
    if (!isDeceased) {
      reset(prev => ({
        ...prev,
        deathDate: ''
      }));
    }
  }, [isDeceased, reset]);

  const onSubmit = (data) => {
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
                        alert(`⚠️ Birth Date Validation Error:\n\nThe new birth date would make ${person.first_name} ${person.last_name} ${Math.abs(ageDiff).toFixed(1)} years YOUNGER than their child ${child.first_name} ${child.last_name}.\n\nPlease choose a birth date that maintains at least 12 years difference with all children.`);
                      }, 100);
                      return `Cannot be younger than child ${child.first_name} ${child.last_name}`;
                    } else {
                      setTimeout(() => {
                        alert(`⚠️ Birth Date Validation Error:\n\nThe new birth date would make ${person.first_name} ${person.last_name} only ${ageDiff.toFixed(1)} years older than their child ${child.first_name} ${child.last_name}.\n\nA parent must be at least 12 years older than their child.`);
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
                        alert(`⚠️ Birth Date Validation Error:\n\nThe new birth date would make ${person.first_name} ${person.last_name} ${Math.abs(ageDiff).toFixed(1)} years OLDER than their parent ${parent.first_name} ${parent.last_name}.\n\nA child cannot be older than their parent.`);
                      }, 100);
                      return `Cannot be older than parent ${parent.first_name} ${parent.last_name}`;
                    } else {
                      setTimeout(() => {
                        alert(`⚠️ Birth Date Validation Error:\n\nThe new birth date would make parent ${parent.first_name} ${parent.last_name} only ${ageDiff.toFixed(1)} years older than ${person.first_name} ${person.last_name}.\n\nA parent must be at least 12 years older than their child.`);
                      }, 100);
                      return `Parent ${parent.first_name} ${parent.last_name} must be at least 12 years older`;
                    }
                  }
                }
              }
            }
            
            // Enhanced validation - check for blood relationship and spouse constraint violations
            const spouseWarnings = validateSpouseRelationshipConstraints(value, watch('deathDate'));
            if (spouseWarnings.length > 0) {
              // Show warnings for review but don't block the edit (user may need to fix legacy data)
              setTimeout(() => {
                spouseWarnings.forEach(warning => alert(warning));
              }, 100);
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
          {...register('isDeceased')}
          className="h-4 w-4 rounded mr-2"
        />
        <label htmlFor="isDeceased" className="text-sm">Deceased</label>
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
                      alert(`⚠️ Death Date Validation Error:\n\nThe death date would be before the birth of ${person.first_name} ${person.last_name}'s child ${child.first_name} ${child.last_name}.\n\nChild born: ${child.date_of_birth}\nProposed death date: ${value}\n\nA parent cannot die before their child is born.`);
                    }, 100);
                    return `Cannot die before child ${child.first_name} ${child.last_name} was born`;
                  }
                }
              }
            }
            
            // Enhanced validation - check for blood relationship and spouse constraint violations
            const spouseWarnings = validateSpouseRelationshipConstraints(watch('birthDate'), value);
            if (spouseWarnings.length > 0) {
              // Show warnings for review but don't block the edit (user may need to fix legacy data)
              setTimeout(() => {
                spouseWarnings.forEach(warning => alert(warning));
              }, 100);
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
