import React, { useState } from 'react';
import RelationshipForm from '../Forms/RelationshipForm';
import { createRelationship, deletePerson, getPerson, useToggleSpouseEx, useFullTree } from '../../services/people';
import { FaUsers, FaPlus, FaTrash, FaUserFriends, FaChild, FaVenusMars, FaUserTie, FaUserEdit } from 'react-icons/fa';
import DeletePersonModal from '../UI/DeletePersonModal';
import { buildRelationshipMaps } from '../../utils/improvedRelationshipCalculator';

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

  // Filter people for each relationship type
  const getSelectablePeople = (type) => {
    const excludeIds = [person.id, ...getRelatedIds(type)];
    return people.filter(p => !excludeIds.includes(p.id));
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
      setWarning(
        err?.response?.data?.errors?.[0] ||
        'This relationship is not allowed. Please check your selection.'
      );
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
    
    const { stepParents, stepChildren } = findStepRelationships(person, treeData.nodes, treeData.edges);
    
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
        <p className="text-sm text-gray-600 mb-2">Manage parents, spouses, children, siblings, and in-laws. Click add or delete to modify.</p>
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
                    onClick={() => { setShowAdd(true); setAddType(type); }}
                  >
                    <FaPlus />
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
                    person={person}
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
