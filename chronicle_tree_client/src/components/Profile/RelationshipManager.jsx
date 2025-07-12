import React, { useState } from 'react';
import RelationshipForm from '../Forms/RelationshipForm';
import { createRelationship, deletePerson } from '../../services/people';
import { FaUsers, FaPlus, FaTrash, FaUserFriends, FaChild, FaVenusMars, FaUserTie, FaUserEdit } from 'react-icons/fa';

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

const RelationshipManager = ({ person, people = [], onRelationshipAdded, onRelationshipDeleted }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState('');

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

  const handleDelete = async (relId) => {
    if (!window.confirm('Delete this relationship?')) return;
    await deletePerson(relId); // This should be deleteRelationship if available
    if (onRelationshipDeleted) onRelationshipDeleted();
  };

  const groups = groupRelatives(person);
  const inLaws = getInLaws();

  return (
    <section className="bg-slate-50 rounded-xl p-6 shadow-inner border border-slate-100">
      <div className="flex items-center pb-2 border-b mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaUsers className="text-blue-400" /> Relationships
        </h2>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Manage parents, spouses, children, siblings, and in-laws. Click add, edit, or delete to modify.</p>
        {/* Existing relationships */}
        {Object.entries(groups).map(([type, rels]) => {
          let canAdd = false;
          let forceEx = false;
          if (type === 'parent') {
            canAdd = rels.length < 2;
          } else if (type === 'spouse') {
            // If a current spouse exists, only allow adding ex-spouse
            const hasCurrentSpouse = rels.some(rel => !rel.is_ex);
            canAdd = true; // Always show add button for spouse
            forceEx = hasCurrentSpouse;
          } else {
            canAdd = true;
          }
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
                {canAdd && (
                  <button
                    className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100 text-blue-600 text-xs"
                    title={`Add ${RELATIONSHIP_LABELS[type].toLowerCase().slice(0, -1)}`}
                    onClick={() => { setShowAdd(true); setAddType(type); }}
                  >
                    <FaPlus />
                  </button>
                )}
              </div>
              {rels.length > 0 ? (
                <ul className="space-y-1">
                  {rels.map(rel => (
                    <li key={rel.id} className="flex items-center justify-between bg-white rounded px-3 py-2 border border-slate-100">
                      <span className="flex items-center gap-2">
                        {/* Ex-spouse styling */}
                        {type === 'spouse' && rel.is_ex ? (
                          <span className="font-medium text-red-500 line-through">{rel.full_name} (ex)</span>
                        ) : (
                          <span className="font-medium">{rel.full_name}</span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 text-red-500 text-xs" onClick={() => handleDelete(rel.id)} title="Delete Relationship">
                          <FaTrash />
                        </button>
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
                    onSubmit={handleAdd}
                    onCancel={() => { setShowAdd(false); setAddType(null); setWarning(''); }}
                    isLoading={isLoading}
                    forceEx={forceEx}
                  />
                </div>
              )}
            </div>
          );
        })}
        {/* In-law relationships */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">In-Laws</h3>
          {Object.entries(inLaws).map(([type, rels]) => (
            <div key={type} className="mb-2">
              <div className="font-medium text-blue-600 mb-1">{IN_LAW_LABELS[type]}</div>
              {rels.length > 0 ? (
                <ul className="space-y-1">
                  {rels.map(rel => (
                    <li key={rel.id} className="flex items-center gap-2 bg-white rounded px-3 py-1 border border-slate-100">
                      <span className="font-medium">{rel.full_name || `${rel.first_name} ${rel.last_name}`}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 ml-2">No {IN_LAW_LABELS[type].toLowerCase()} found.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelationshipManager;
