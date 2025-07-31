import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../UI/Button';

const LABELS = {
  parent: 'Select Parent',
  child: 'Select Child',
  spouse: 'Select Spouse',
  late_spouse: 'Select Late Spouse',
  sibling: 'Select Sibling',
};

const RelationshipForm = ({ people = [], type, onSubmit, onCancel, isLoading, forceEx, selectedPerson, allPeople = [] }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [sharedParents, setSharedParents] = useState([]);
  const [showMarkAsHalf, setShowMarkAsHalf] = useState(false);
  const [isHalfSibling, setIsHalfSibling] = useState(false);
  const [showSharedParentSelection, setShowSharedParentSelection] = useState(false);
  const [dynamicForceEx, setDynamicForceEx] = useState(false);
  
  const selectedId = watch('selectedId');
  
  // Determine if half-sibling option should be displayed
  useEffect(() => {
    if (type === 'sibling' && selectedId && selectedPerson) {
      const selectedSibling = allPeople.find(p => p.id === parseInt(selectedId));
      
      if (selectedSibling) {
        // Collect parent information for sibling relationship analysis
        const personParents = selectedPerson.relatives?.filter(rel => rel.relationship_type === 'parent') || [];
        const siblingParents = selectedSibling.relatives?.filter(rel => rel.relationship_type === 'parent') || [];
        
        // Build parent list for half-sibling check
        const allAvailableParents = [];
        
        // Add person's parents
        personParents.forEach(parent => {
          if (!allAvailableParents.find(p => p.id === parent.id)) {
            allAvailableParents.push(parent);
          }
        });
        
        // Add sibling's parents
        siblingParents.forEach(parent => {
          if (!allAvailableParents.find(p => p.id === parent.id)) {
            allAvailableParents.push(parent);
          }
        });
        
        // Always show "Mark as half" option when adding siblings
        setSharedParents(allAvailableParents);
        setShowMarkAsHalf(true);
      }
    } else {
      setSharedParents([]);
      setShowMarkAsHalf(false);
      setIsHalfSibling(false);
      setShowSharedParentSelection(false);
    }
  }, [selectedId, selectedPerson, allPeople, type]);

  // Check if selected spouse already has a current spouse (for auto-forcing ex status)
  useEffect(() => {
    if (type === 'spouse' && selectedId && allPeople) {
      const selectedSpouse = allPeople.find(p => p.id === parseInt(selectedId));
      if (selectedSpouse) {
        const selectedSpouseSpouses = (selectedSpouse.relatives || []).filter(rel => rel.relationship_type === 'spouse');
        const hasCurrentSpouse = selectedSpouseSpouses.some(rel => {
          const spousePerson = allPeople.find(p => p.id === rel.id);
          return !rel.is_ex && !rel.is_deceased && !spousePerson?.date_of_death;
        });
        setDynamicForceEx(hasCurrentSpouse);
      }
    } else {
      setDynamicForceEx(false);
    }
  }, [selectedId, allPeople, type]);

  // Handle "Mark as half" checkbox
  const handleMarkAsHalfChange = (checked) => {
    setIsHalfSibling(checked);
    if (checked && sharedParents.length > 0) {
      // Only show parent selection if there are actually parents to choose from
      setShowSharedParentSelection(true);
    } else {
      setShowSharedParentSelection(false);
    }
  };

  const handleFormSubmit = (data) => {
    const submissionData = { 
      selectedId: data.selectedId,
      relationshipType: type === 'late_spouse' ? 'spouse' : type,
      is_ex: type === 'spouse' ? (forceEx ? true : !!data.is_ex) : (type === 'late_spouse' ? false : undefined),
      is_deceased: type === 'late_spouse' ? true : undefined
    };
    
    // Add shared parent if marking as half-sibling
    if (type === 'sibling' && isHalfSibling && data.shared_parent_id) {
      submissionData.shared_parent_id = data.shared_parent_id;
    }
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Selected Person - Hidden from UI, automatically set to current profile person */}
      <div className="hidden">
        <input type="hidden" value={selectedPerson?.id || ''} {...register('selectedPersonId')} />
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Selected Person:</span> {selectedPerson?.first_name} {selectedPerson?.last_name}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Adding {LABELS[type].toLowerCase().replace('select ', '')} relationship for this person.
        </p>
      </div>
      
      <div>
        <label htmlFor="selectedId" className="block text-sm font-medium text-gray-700">{LABELS[type]}</label>
        <select
          id="selectedId"
          {...register('selectedId', { required: `Please select a ${type}` })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">{LABELS[type]}</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        {errors.selectedId && <p className="mt-2 text-sm text-red-600">{errors.selectedId.message}</p>}
        {people.length === 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">No eligible people found</p>
            <p className="text-xs text-yellow-700 mt-1">
              People may be filtered out due to:
              <br />• Blood relationship restrictions (siblings, cousins, etc. cannot marry or have shared children)
              <br />• Age constraints (12+ year gap for parent-child relationships, 16+ years for marriage)
              <br />• Existing relationships (max 2 parents, 1 current spouse)
              <br />• Relationship logic (parents cannot be siblings with their children)
            </p>
          </div>
        )}
        {people.length > 0 && allPeople.length > people.length + 1 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700">
              <span className="font-medium">{allPeople.length - people.length - 1} people filtered out</span> due to relationship constraints, blood relationships, or age requirements.
            </p>
          </div>
        )}
      </div>
      

      {/* Mark as half-sibling option */}
      {type === 'sibling' && showMarkAsHalf && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox text-blue-600" 
              onChange={(e) => handleMarkAsHalfChange(e.target.checked)}
              checked={isHalfSibling}
            />
            <span className="ml-2 text-sm font-medium text-blue-800">Mark as half-sibling</span>
          </label>
          <p className="text-xs text-blue-600 mt-1">
            Check this if they share only one parent instead of both parents.
          </p>
        </div>
      )}

      {/* Shared parent selection for half-siblings */}
      {type === 'sibling' && showSharedParentSelection && (
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-orange-800">Who is the shared parent?</p>
            <p className="text-xs text-orange-700">
              Select which parent {selectedPerson?.first_name} and {allPeople.find(p => p.id === parseInt(selectedId))?.first_name} share.
            </p>
          </div>
          
          {sharedParents.length > 0 ? (
            <div className="space-y-2">
              {sharedParents.map(parent => (
                <label key={parent.id} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={parent.id}
                    {...register('shared_parent_id', { 
                      required: isHalfSibling ? 'Please select the shared parent' : false 
                    })}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-800">{parent.full_name}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-sm text-orange-700 italic">
              No parents available to select. The half-sibling relationship will be created without specifying a shared parent.
            </div>
          )}
          
          {errors.shared_parent_id && (
            <p className="mt-2 text-sm text-red-600">{errors.shared_parent_id.message}</p>
          )}
        </div>
      )}

      {/* Show message when half-sibling is checked but no parent selection shown */}
      {type === 'sibling' && isHalfSibling && !showSharedParentSelection && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            Half-sibling relationship will be created. No shared parent information available to specify.
          </p>
        </div>
      )}
      

      {type === 'spouse' && (
        <div>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              {...register('is_ex')} 
              className="form-checkbox" 
              checked={(forceEx || dynamicForceEx) || false} 
              disabled={forceEx || dynamicForceEx} 
            />
            <span className="ml-2 text-red-500">Mark as ex-spouse</span>
          </label>
          {(forceEx || dynamicForceEx) && (
            <div className="ml-2 text-xs text-gray-500 mt-1">
              {forceEx && <div>(Current person has spouse, only ex-spouse can be added)</div>}
              {dynamicForceEx && <div>(Selected person has current spouse, must be marked as ex)</div>}
            </div>
          )}
        </div>
      )}

      {type === 'late_spouse' && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Late Spouse:</span> This relationship will be marked as deceased automatically.
          </p>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} disabled={isLoading} variant="grey">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} variant="primary">
          {isLoading ? 'Saving...' : 'Add'}
        </Button>
      </div>
    </form>
  );
};

export default RelationshipForm;
