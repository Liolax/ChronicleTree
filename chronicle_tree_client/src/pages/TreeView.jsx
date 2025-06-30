import React from 'react';
import { TreeProvider, useTreeState } from '../context/TreeStateContext';
import { ReactFlowProvider } from 'reactflow';
import PageHeader from '../components/Layout/PageHeader';
import Tree from '../components/Tree/Tree';
import { usePeople } from '../services/people';

const HEADER_HEIGHT = 72;

const TreeViewContent = () => {
  const {
    isAddPersonModalOpen,
    closeAddPersonModal,
  } = useTreeState();

  const { data: people, isLoading, isError } = usePeople();

  return (
    <div className="flex flex-col w-full min-h-screen h-screen max-h-screen overflow-hidden">
      <PageHeader
        title="Family Tree"
        subtitle="Visualize and manage your family connections."
        noMargin
      />
      <div className="flex-1 min-h-0 max-h-full overflow-hidden flex flex-col justify-start">
        <Tree headerHeight={HEADER_HEIGHT + 54} />
      </div>
    </div>
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
