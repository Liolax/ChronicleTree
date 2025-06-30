import React from 'react';
import { TreeProvider, useTreeState } from '../context/TreeStateContext';
import { ReactFlowProvider } from 'reactflow';
import PageHeader from '../components/Layout/PageHeader';
import Tree from '../components/Tree/Tree';
import { usePeople } from '../services/people';

const TreeViewContent = () => {
  const {
    isAddPersonModalOpen,
    closeAddPersonModal,
  } = useTreeState();

  const { data: people, isLoading, isError } = usePeople();

  return (
    <>
      <PageHeader
        title="Family Tree"
        subtitle="Visualize and manage your family connections."
      />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 h-[600px]">
          <Tree />
        </div>
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
