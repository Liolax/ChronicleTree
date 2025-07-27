import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { useCurrentUser } from '../../services/users';
import { showValidationAlert, validateMarriageAge, validateParentChildAge } from '../../utils/validationAlerts';

const RELATIONSHIP_TYPES = [
  { value: '', label: 'Relationship Type' },
  { value: 'parent', label: 'Parent of selected person' },
  { value: 'child', label: 'Child of selected person' },
  { value: 'spouse', label: 'Spouse of selected person' },
  { value: 'sibling', label: 'Sibling of selected person' },
];

const PersonForm = ({ person, onSubmit, onCancel, isLoading, people = [], isFirstPerson = false }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (person) {
      reset({
        firstName: person.first_name || '',
        lastName: person.last_name || '',
        date_of_birth: person.date_of_birth || '',
        date_of_death: person.date_of_death || '',
        gender: person.gender || '',
        isDeceased: !!person.is_deceased,
        relationType: '',
        relatedPersonId: '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        date_of_birth: '',
        date_of_death: '',
        gender: '',
        isDeceased: false,
        relationType: '',
        relatedPersonId: '',
      });
    }
  }, [person, reset]);

  const isDeceased = watch('isDeceased');
  useEffect(() => {
    if (!isDeceased) setValue('date_of_death', '');
  }, [isDeceased, setValue]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const relationType = watch('relationType');

  // Blood relationship validation not needed for new person creation
  // Main validation logic is handled in backend and relationship modal

  // Relationship validation function for form constraints
  const validateBloodRelationshipConstraints = (selectedPersonId, newPersonBirthDate, relationshipType) => {
    if (!selectedPersonId || !relationshipType) return { valid: true };
    
    const selectedPerson = filteredPeople.find(p => String(p.id) === String(selectedPersonId));
    if (!selectedPerson) return { valid: true };

    // Validate logical constraints for the selected relationship type
    // Blood relationship checks happen after person creation
    
    // Validation for child relationships
    if (relationshipType === 'child') {
      // Check if selected person (who will be parent) already has 2 biological parents
      // This doesn't apply here since we're adding a child, not a parent
    }
    
    // Validation for parent relationships
    if (relationshipType === 'parent') {
      // Check if selected person (who will be child) already has 2 biological parents
      const selectedPersonParents = selectedPerson.relatives?.filter(rel => rel.relationship_type === 'parent' && !rel.isStep) || [];
      if (selectedPersonParents.length >= 2) {
        return { 
          valid: false, 
          reason: `${selectedPerson.first_name} ${selectedPerson.last_name} already has 2 biological parents. A person can only have 2 biological parents.` 
        };
      }
    }
    
    return { valid: true };
  };

  // Filter people to show only those belonging to the current user
  // For test/demo data, if user_id is missing, show all except self
  const filteredPeople = people.filter(p => {
    // Exclude the person being edited (self)
    if (person && p.id === person.id) return false;
    
    // Since the API doesn't return user_id field in people data,
    // and the people endpoint already filters by current user,
    // we can show all people except self
    return true;
  });


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[340px] overflow-y-auto">
      {/* Removed form intro and heading for Add Person */}
      {!person && (
        <div className="text-sm text-gray-600 mb-2">Required fields are marked with <span className='text-red-500'>*</span>.</div>
      )}
      <Input
        label="First Name"
        id="firstName"
        placeholder="Enter first name"
        {...register('firstName', { required: 'First name is required' })}
        error={errors.firstName}
      />
      <Input
        label="Last Name"
        id="lastName"
        placeholder="Enter last name"
        {...register('lastName', { required: 'Last name is required' })}
        error={errors.lastName}
      />
      <Input
        label="Birth Date"
        id="date_of_birth"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        value={watch('date_of_birth') ? watch('date_of_birth').slice(0, 10) : ''}
        {...register('date_of_birth', { 
          required: 'Birth date is required',
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Birth date cannot be in the future';
            
            // Temporal validation for parent-child relationships
            const relationType = watch('relationType');
            const relatedPersonId = watch('relatedPersonId');
            
            if (value && relationType === 'child' && relatedPersonId) {
              const selectedPerson = filteredPeople.find(p => String(p.id) === String(relatedPersonId));
              if (selectedPerson && selectedPerson.date_of_death) {
                const birthDate = new Date(value);
                const parentDeathDate = new Date(selectedPerson.date_of_death);
                if (birthDate > parentDeathDate) {
                  // Show alert for immediate user feedback
                  setTimeout(() => {
                    alert(`⚠️ Temporal Validation Error:\n\nCannot add child born after parent's death.\n\n${selectedPerson.first_name} ${selectedPerson.last_name} died on ${selectedPerson.date_of_death}, but the birth date you entered is ${value}.\n\nPlease choose a birth date before the parent's death date.`);
                  }, 100);
                  
                  return `Cannot add child born after parent's death (${selectedPerson.first_name} ${selectedPerson.last_name} died ${selectedPerson.date_of_death})`;
                }
              }
            }
            
            return true;
          }
        })}
        error={errors.date_of_birth}
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
        id="date_of_death"
        type="date"
        max={new Date().toISOString().split('T')[0]}
        value={watch('date_of_death') ? watch('date_of_death').slice(0, 10) : ''}
        {...register('date_of_death', {
          validate: value => {
            if (value && new Date(value) > new Date()) return 'Death date cannot be in the future';
            return true;
          }
        })}
        disabled={!isDeceased}
        error={errors.date_of_death}
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
      {/* Relationship selection guidance and fields */}
      {/* Only show relationship fields if not first person and there are people to relate to */}
      {!isFirstPerson && filteredPeople.length > 0 && (
        <>
          <div>
            <label htmlFor="relationType" className="block text-sm font-medium text-gray-700">Relationship Type <span className="text-red-500">*</span></label>
            <select
              id="relationType"
              {...register('relationType', { required: 'Relationship type is required' })}
              className="mt-1 block w-full pl-3 pr-10 py-2 border border-app-accent focus:outline-none focus:ring-app-accent focus:border-app-accent sm:text-sm rounded-md bg-white"
              required
            >
              {RELATIONSHIP_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.relationType && <span className="text-red-500 text-xs">{errors.relationType.message}</span>}
          </div>
          {relationType && relationType !== '' && (
            <div>
              <label htmlFor="relatedPersonId" className="block text-sm font-medium text-gray-700">Selected Person <span className="text-red-500">*</span></label>
              <select
                id="relatedPersonId"
                {...register('relatedPersonId', { 
                  required: 'Selected person is required',
                  onChange: (e) => {
                    const selectedPersonId = e.target.value;
                    const currentRelationType = watch('relationType');
                    const currentBirthDate = watch('date_of_birth');
                    
                    if (selectedPersonId) {
                      const selectedPerson = filteredPeople.find(p => String(p.id) === String(selectedPersonId));
                      
                      if (selectedPerson) {
                        // Parent-Child relationship validations
                        if (['child', 'parent'].includes(currentRelationType)) {
                          let parentPerson, childPerson, alertMessage = '';

                          if (currentRelationType === 'child') {
                            // New person is child, selected person is parent
                            parentPerson = selectedPerson;
                            childPerson = { date_of_birth: currentBirthDate };
                          } else if (currentRelationType === 'parent') {
                            // New person is parent, selected person is child  
                            parentPerson = { date_of_birth: currentBirthDate };
                            childPerson = selectedPerson;
                          }

                          let alertType = null;
                          let alertDetails = {};
                          
                          // Check relationship constraints
                          const constraintCheck = validateBloodRelationshipConstraints(selectedPersonId, currentBirthDate, currentRelationType);
                          if (!constraintCheck.valid) {
                            alertType = 'invalidRelationship';
                          }
                          // Check marriage age for spouse relationships
                          else if (currentRelationType === 'spouse') {
                            const marriageValidation = validateMarriageAge(
                              { date_of_birth: currentBirthDate },
                              selectedPerson
                            );
                            if (!marriageValidation.valid) {
                              alertType = marriageValidation.type;
                              alertDetails = marriageValidation.details;
                            }
                          }
                          // Check parent limits
                          else if (currentRelationType === 'parent' && selectedPerson.parent_count >= 2) {
                            alertType = 'maxParents';
                            alertDetails = { targetName: `${selectedPerson.first_name} ${selectedPerson.last_name}` };
                          }
                          // Check parent-child age difference
                          else if (['parent', 'child'].includes(currentRelationType)) {
                            const ageValidation = validateParentChildAge(parentPerson, childPerson);
                            if (!ageValidation.valid) {
                              alertType = ageValidation.type;
                            }
                          }

                          // Show validation alert if needed
                          if (alertType) {
                            setTimeout(() => {
                              showValidationAlert(alertType, alertDetails);
                            }, 100);
                          }
                        }
                      }
                    }
                  }
                })}
                className="mt-1 block w-full pl-3 pr-10 py-2 border border-app-accent focus:outline-none focus:ring-app-accent focus:border-app-accent sm:text-sm rounded-md bg-white"
                required
              >
                <option value="">Select Person</option>
                {filteredPeople.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
              {errors.relatedPersonId && <span className="text-red-500 text-xs">{errors.relatedPersonId.message}</span>}
            </div>
          )}
        </>
      )}
      <div className="flex justify-end gap-4 mt-4">
        <Button type="button" onClick={onCancel} variant="grey" disabled={isSubmitting || isLoading}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default PersonForm;
