import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Button from '../UI/Button';
import AddPersonModal from './modals/AddPersonModal';
import EditPersonModal from './modals/EditPersonModal';
import DeletePersonModal from '../UI/DeletePersonModal';
import PersonCard from './PersonCard';
import PersonCardNode from './PersonCardNode';
import { useFullTree } from '../../services/people';
import { createFamilyTreeLayout, centerChildrenBetweenParents } from '../../utils/familyTreeHierarchicalLayout';
import { getAllRelationshipsToRoot } from '../../utils/improvedRelationshipCalculator';

// Node types for react-flow
const nodeTypes = {
  personCard: PersonCardNode,
};

/**
 * Enhanced Family Tree Component
 * Uses react-flow with simplified, intuitive layout
 */
const FamilyTree = () => {
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [personCardPosition, setPersonCardPosition] = useState(null);
  const [rootPersonId, setRootPersonId] = useState(null);
  const [hasSetDefaultRoot, setHasSetDefaultRoot] = useState(false);
  
  const { data, isLoading, isError } = useFullTree(rootPersonId);

  // Event handlers
  const handleEditPerson = useCallback((person) => {
    setEditPerson(person);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditPerson(null);
  }, []);

  const openAddPersonModal = useCallback(() => {
    setAddPersonModalOpen(true);
  }, []);

  const closeAddPersonModal = useCallback(() => {
    setAddPersonModalOpen(false);
  }, []);

  const openPersonCard = useCallback((person, event) => {
    setSelectedPerson(person);
    if (event) {
      setPersonCardPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
    }
  }, []);

  const closePersonCard = useCallback(() => {
    setSelectedPerson(null);
    setPersonCardPosition(null);
  }, []);

  const handleDeletePerson = useCallback((person) => {
    setDeleteTarget(person);
  }, []);

  const handleRestructureTree = useCallback((personId) => {
    console.log('Set new root person:', personId);
    setRootPersonId(personId);
  }, []);

  const handleResetTree = useCallback(() => {
    console.log('Reset tree to show all people');
    setRootPersonId(null);
    setHasSetDefaultRoot(false);
  }, []);

  // Process data based on root person and add relationship information
  const processedData = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    
    // Auto-set oldest person as root if no root is selected and we haven't set default root yet
    if (!rootPersonId && !hasSetDefaultRoot && data.oldest_person_id) {
      setRootPersonId(data.oldest_person_id);
      setHasSetDefaultRoot(true);
    }
    
    const rootPerson = rootPersonId 
      ? data.nodes.find(n => n.id === rootPersonId)
      : null;
    
    // Add relationship information to all people
    const peopleWithRelations = getAllRelationshipsToRoot(
      rootPerson,
      data.nodes,
      data.edges
    );
    
    return {
      nodes: peopleWithRelations,
      edges: data.edges
    };
  }, [data, rootPersonId, hasSetDefaultRoot]);

  // Transform data for react-flow using improved hierarchical layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!processedData.nodes.length) return { nodes: [], edges: [] };
    
    const { nodes, edges } = createFamilyTreeLayout(processedData.nodes, processedData.edges, {
      onEdit: handleEditPerson,
      onDelete: handleDeletePerson,
      onPersonCardOpen: openPersonCard,
      onRestructure: handleRestructureTree,
    });

    return { nodes, edges };
  }, [processedData, handleEditPerson, handleDeletePerson, openPersonCard, handleRestructureTree]);

  // Apply final positioning adjustments
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!initialNodes.length) return { nodes: [], edges: [] };
    
    // Center children between their parents for better visual hierarchy
    const adjustedNodes = centerChildrenBetweenParents(initialNodes, processedData.edges || []);
    return { nodes: adjustedNodes, edges: initialEdges };
  }, [initialNodes, initialEdges, processedData.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes and edges when data changes
  React.useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes, setNodes]);

  React.useEffect(() => {
    setEdges(layoutedEdges);
  }, [layoutedEdges, setEdges]);

  // Fit view button component
  const FitViewButton = () => {
    const { fitView } = useReactFlow();
    
    const handleFitView = useCallback(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, [fitView]);

    return (
      <Button onClick={handleFitView} variant="secondary">
        Fit View
      </Button>
    );
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading family tree...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-600">Error loading family tree</div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen bg-gray-50">
        {/* Header Controls */}
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <div className="flex gap-4 items-center">
            <Button onClick={openAddPersonModal} variant="primary">
              Add Person
            </Button>
            <Button 
              onClick={() => setRootPersonId(null)} 
              variant="secondary"
              title="Show Full Tree"
            >
              Full Tree
            </Button>
            {rootPersonId && (
              <div className="flex items-center gap-2 text-sm bg-[#edf8f5] px-3 py-1 rounded-md">
                <span className="text-[#4F868E] font-medium">
                  Root: {processedData.nodes.find(n => n.id === rootPersonId)?.first_name} {processedData.nodes.find(n => n.id === rootPersonId)?.last_name}
                </span>
                <button
                  onClick={handleResetTree}
                  className="px-2 py-1 bg-[#4F868E] text-white rounded text-xs hover:bg-[#3d6b73] transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <FitViewButton />
          </div>
        </div>

        {/* React Flow Container */}
        <div className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              minZoom: 0.1,
              maxZoom: 1.5,
            }}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            attributionPosition="bottom-left"
          >
            {/* Background */}
            <Background 
              variant="dots" 
              gap={20} 
              size={1} 
              color="#e5e7eb" 
            />
            
            {/* Mini Map */}
            <MiniMap
              nodeColor={(node) => {
                if (node.data?.person?.gender?.toLowerCase() === 'female') {
                  return '#ec4899';
                }
                return '#6366f1';
              }}
              nodeStrokeWidth={3}
              nodeBorderRadius={8}
              position="bottom-right"
            />
            
            {/* Controls */}
            <Controls 
              position="bottom-left"
              showInteractive={false}
            />

            {/* Info Panel */}
            <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg">
              <div className="text-sm">
                <div className="font-semibold text-gray-700 mb-3">Connection Legend</div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#6366f1]"></div>
                    <span>Parent-Child</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#ec4899] border-dashed" style={{ borderTop: '2px dashed #ec4899', background: 'none' }}></div>
                    <span>Current Spouse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#9ca3af] border-dashed" style={{ borderTop: '2px dashed #9ca3af', background: 'none' }}></div>
                    <span>Ex-Spouse</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      🏠 Click home icon to change root person
                    </div>
                    <div className="text-xs text-gray-500">
                      📍 Sibling relationships shown through positioning
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Person Detail Card */}
        {selectedPerson && (
          <PersonCard
            person={selectedPerson}
            onEdit={handleEditPerson}
            onDelete={handleDeletePerson}
            onClose={closePersonCard}
            position={personCardPosition}
            fixed={!!personCardPosition}
          />
        )}

        {/* Modals */}
        {isAddPersonModalOpen && (
          <AddPersonModal 
            isOpen={isAddPersonModalOpen} 
            onClose={closeAddPersonModal} 
          />
        )}
        
        {editPerson && (
          <EditPersonModal 
            person={editPerson} 
            isOpen={!!editPerson} 
            onClose={handleCloseEditModal} 
          />
        )}
        
        {deleteTarget && (
          <DeletePersonModal 
            person={deleteTarget} 
            onConfirm={() => {
              // Handle delete logic
              console.log('Delete person:', deleteTarget);
              setDeleteTarget(null);
            }} 
            onCancel={() => setDeleteTarget(null)} 
            isLoading={false} 
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTree;