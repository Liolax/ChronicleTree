import React from 'react';
import { TreeProvider, useTreeState } from '../context/TreeStateContext';
import { ReactFlowProvider } from 'reactflow';
import PageHeader from '../components/Layout/PageHeader';
import Tree from '../components/Tree/Tree';
import Button from '../components/UI/Button';
import AddPersonModal from '../components/Tree/modals/AddPersonModal';
import AddRelationshipModal from '../components/Tree/modals/AddRelationshipModal';
import EditPersonModal from '../components/Tree/modals/EditPersonModal';
import { usePeople } from '../services/people';
import { UserPlusIcon } from '@heroicons/react/24/solid';

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
      />
      <div className="flex justify-center mb-6">
        <Button
          onClick={openAddPersonModal}
          className="bg-button-primary hover:bg-button-primary-hover text-white font-semibold py-2 px-6 rounded-md flex items-center shadow-lg"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add New Person
        </Button>
      </div>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 h-[600px]">
          <Tree />
        </div>
        {isAddPersonModalOpen && <AddPersonModal onClose={closeAddPersonModal} />}
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
      <ReactFlowProvider>
        <TreeViewContent />
      </ReactFlowProvider>
    </TreeProvider>
  );
}
