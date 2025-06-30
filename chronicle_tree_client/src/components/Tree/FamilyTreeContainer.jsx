import React from 'react';
import { useFullTree, usePeople } from '../../services/people';
import FamilyTreeView from './FamilyTreeView';
import AddPersonModal from './modals/AddPersonModal';
import EditPersonModal from './modals/EditPersonModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import PersonCard from './PersonCard';
import { useTreeState } from '../../context/TreeStateContext';
import Button from '../UI/Button';

const FamilyTreeContainer = () => {
  const { data: people = [] } = usePeople();
  const { data: treeData, isLoading, isError } = useFullTree();
  const { openAddPersonModal, closeAddPersonModal, isAddPersonModalOpen, selectedPerson, openPersonCard, closePersonCard } = useTreeState();
  const [editPerson, setEditPerson] = React.useState(null);
  const [deletePerson, setDeletePerson] = React.useState(null);

  if (isLoading) return <div className="flex items-center justify-center h-full">Loading tree...</div>;
  if (isError) return <div className="flex items-center justify-center h-full text-red-600">Failed to load tree.</div>;
  if (!treeData || !treeData.nodes?.length) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
      <div>No tree data available.</div>
      <Button onClick={openAddPersonModal} variant="primary">Add Person</Button>
    </div>
  );

  // Convert nodes/edges to people/relationships for FamilyTreeJS
  const relationships = treeData.edges?.map(e => ({
    type: e.type,
    from: e.from,
    to: e.to,
  })) || [];

  return (
    <div style={{ width: '100%', height: '100%', minWidth: 1200, position: 'relative' }}>
      <button
        onClick={openAddPersonModal}
        className="absolute top-6 right-8 z-50 bg-button-primary text-white rounded-full shadow-lg flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold hover:bg-button-primary-hover focus:outline-none focus:ring-2 focus:ring-button-primary"
        aria-label="Add Person"
        title="Add Person"
        type="button"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="hidden sm:inline">Add Person</span>
      </button>
      <FamilyTreeView
        people={treeData.nodes}
        relationships={relationships}
        onPersonClick={id => {
          const person = people.find(p => p.id === id);
          if (person) openPersonCard(person);
        }}
      />
      {isAddPersonModalOpen && (
        <AddPersonModal
          key={`add-person-modal-${people.length}`}
          isOpen={isAddPersonModalOpen}
          onClose={closeAddPersonModal}
          people={people}
          isFirstPerson={people.length === 0}
        />
      )}
      {editPerson && (
        <EditPersonModal
          person={editPerson}
          isOpen={!!editPerson}
          onClose={() => setEditPerson(null)}
        />
      )}
      {deletePerson && (
        <ConfirmDeleteModal
          isOpen={!!deletePerson}
          onClose={() => setDeletePerson(null)}
          person={deletePerson}
          confirmText={`Delete ${deletePerson.first_name} ${deletePerson.last_name}`}
          description={`Are you sure you want to delete ${deletePerson.first_name} ${deletePerson.last_name}? This action cannot be undone.`}
          confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        />
      )}
      {selectedPerson && (
        <PersonCard
          person={selectedPerson}
          onClose={closePersonCard}
          onEdit={p => { closePersonCard(); setEditPerson(p); }}
          onDelete={p => { closePersonCard(); setDeletePerson(p); }}
        />
      )}
    </div>
  );
};

export default FamilyTreeContainer;
