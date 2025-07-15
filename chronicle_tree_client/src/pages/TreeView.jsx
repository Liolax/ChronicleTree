import React from 'react';
import PageHeader from '../components/Layout/PageHeader';
import Tree from '../components/Tree/Tree';

export default function TreeView() {
  return (
    <div className="flex flex-col w-full min-h-screen h-screen max-h-screen overflow-hidden">
      <PageHeader title="Family Tree" subtitle="Visualize and manage your family connections." />
      <div className="flex-1 min-h-0 max-h-full overflow-hidden flex flex-col justify-start">
        <Tree />
      </div>
    </div>
  );
}
