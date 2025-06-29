import PageHeader from '../components/Layout/PageHeader';
import Tree from '../components/Tree/Tree';

export default function TreeView() {
  return (
    <>
      <PageHeader title="Family Tree" subtitle="Visualize and manage your family connections." />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tree />
        </div>
      </div>
    </>
  );
}
