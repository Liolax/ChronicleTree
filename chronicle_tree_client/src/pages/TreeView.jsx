import React from 'react';
import { TreeProvider, useTreeState } from '../context/TreeStateContext';
import PageHeader from '../components/Layout/PageHeader';
import Tree from '../components/Tree/Tree';
import Button from '../components/UI/Button';
import EditPersonModal from '../components/Tree/EditPersonModal';
import AddRelationshipModal from '../components/Tree/AddRelationshipModal';
import { usePeople } from '../services/people';

const TreeViewContent = () => {
  const {
    isAddPersonModalOpen,
    openAddPersonModal,
    closeAddPersonModal,
    isAddRelationshipModalOpen,
    openAddRelationshipModal,
    closeAddRelationshipModal,
  } = useTreeState();

  const { data: people, isLoading, isError } = usePeople();

  return (
    <>
      <PageHeader
        title="Family Tree"
        subtitle="Visualize and manage your family connections."
      >
        <div className="flex space-x-2">
          <Button onClick={openAddPersonModal}>Add Person</Button>
          <Button onClick={openAddRelationshipModal} variant="secondary" disabled={isLoading || isError}>
            Add Relationship
          </Button>
        </div>
      </PageHeader>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 h-[600px]">
          <Tree />
        </div>
        {isAddPersonModalOpen && <EditPersonModal onClose={closeAddPersonModal} />} 
        {isAddRelationshipModalOpen && !isLoading && !isError && (
          <AddRelationshipModal 
            onClose={closeAddRelationshipModal} 
            people={people} 
          />
        )}
      </div>
    </>
  );
}

export default function TreeView() {
  return (
    <TreeProvider>
      <TreeViewContent />
    </TreeProvider>
  );
}
