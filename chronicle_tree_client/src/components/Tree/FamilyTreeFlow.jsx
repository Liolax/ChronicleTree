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
import { useQueryClient } from '@tanstack/react-query';
import '@xyflow/react/dist/style.css';
import { FaShareAlt } from 'react-icons/fa';

import Button from '../UI/Button';
import AddPersonModal from './modals/AddPersonModal';
import EditPersonModal from './modals/EditPersonModal';
import DeletePersonModal from '../UI/DeletePersonModal';
import PersonCard from './PersonCard';
import PersonCardNode from './PersonCardNode';
import CustomNode from './CustomNode';
import { useFullTree, useDeletePerson } from '../../services/people';
import { createFamilyTreeLayout } from '../../utils/familyTreeHierarchicalLayout';
import { collectConnectedFamily } from '../../utils/familyTreeHierarchicalLayout';
import { getAllRelationshipsToRoot } from '../../utils/improvedRelationshipCalculator';
import { ShareModal } from '../Share';
// import { testRelationshipCalculation } from '../../utils/test-relationship-debug';

// Register our custom node components with ReactFlow
const nodeTypes = {
  custom: CustomNode,
  personCard: PersonCardNode,
};

/**
 * Main Family Tree Component - Primary Interface
 * Built with ReactFlow library for interactive, draggable tree visualization
 * Manages user interactions, data processing, and modal states
 */
const FamilyTree = () => {
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [personCardPosition, setPersonCardPosition] = useState(null);
  const [rootPersonId, setRootPersonId] = useState(null);
  const [hasSetDefaultRoot, setHasSetDefaultRoot] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUnrelated, setShowUnrelated] = useState(false);
  
  const queryClient = useQueryClient();
  const deletePerson = useDeletePerson();
  
  const { data, isLoading, isError } = useFullTree(rootPersonId);


  // Main data processing - build the tree structure
  const processedData = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    // Smart default: pick oldest person as root if user hasn't chosen one
    if (!rootPersonId && !hasSetDefaultRoot && data.oldest_person_id) {
      setRootPersonId(data.oldest_person_id);
      setHasSetDefaultRoot(true);
    }

    // Filter data to only show people connected to the selected root person
    let filteredNodes = data.nodes;
    let filteredEdges = data.edges;
    if (rootPersonId) {
      const result = collectConnectedFamily(rootPersonId, data.nodes, data.edges);
      filteredNodes = result.persons;
      filteredEdges = result.relationships;
    }

    // Calculate how everyone is related to the root person
    const rootPerson = rootPersonId
      ? filteredNodes.find(n => n.id === rootPersonId)
      : null;
    
    
    // Convert edges to relationship format that the algorithm expects
    const relationshipsFormat = filteredEdges.map(edge => ({
      person_id: edge.source,
      relative_id: edge.target,
      relationship_type: edge.relationship_type,
      is_ex: edge.is_ex || false,
      is_deceased: edge.is_deceased || false
    }));
    
    const peopleWithRelations = getAllRelationshipsToRoot(
      rootPerson,
      filteredNodes,
      relationshipsFormat  // Use converted format instead of edges
    );
    
    

    // Hide distant/unrelated people if user turned off that setting
    const finalNodes = showUnrelated 
      ? peopleWithRelations 
      : peopleWithRelations.filter(node => node.relation !== 'Unrelated');

    return {
      nodes: finalNodes,
      edges: filteredEdges
    };
  }, [data, rootPersonId, hasSetDefaultRoot, showUnrelated]);


  // Utility function to organize relationships for delete confirmation
  const groupRelatives = useCallback((person) => {
    const groups = { Parents: [], Children: [], Spouses: [], Siblings: [] };
    if (person?.relatives) {
      person.relatives.forEach(rel => {
        if (rel.relationship_type === 'parent') groups.Parents.push(rel);
        if (rel.relationship_type === 'child') groups.Children.push(rel);
        if (rel.relationship_type === 'spouse') groups.Spouses.push(rel);
        if (rel.relationship_type === 'sibling') groups.Siblings.push(rel);
      });
    }
    return groups;
  }, []);

  // User interaction event handlers
  const handleEditPerson = useCallback((person) => {
    setSelectedPerson(null); // Close person card when editing
    setPersonCardPosition(null);
    setEditPerson(person);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditPerson(null);
  }, []);

  const openAddPersonModal = useCallback(() => {
    setSelectedPerson(null); // Close person card when adding
    setPersonCardPosition(null);
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
    setSelectedPerson(null); // Close person card when delete modal opens
    setPersonCardPosition(null);
    setDeleteTarget(person);
  }, []);

  const handleRestructureTree = useCallback((personId) => {
    setRootPersonId(personId);
  }, []);

  const handleResetTree = useCallback(() => {
    setRootPersonId(null);
    setHasSetDefaultRoot(false);
  }, []);

  const handleShareTree = useCallback(() => {
    setSelectedPerson(null); // Close person card when share modal opens
    setPersonCardPosition(null);
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  // Transform data for react-flow
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!processedData.nodes.length) return { nodes: [], edges: [] };
    return createFamilyTreeLayout(processedData.nodes, processedData.edges, {
      onEdit: handleEditPerson,
      onDelete: handleDeletePerson,
      onPersonCardOpen: openPersonCard,
      onRestructure: handleRestructureTree,
    }, rootPersonId);
  }, [processedData, handleEditPerson, handleDeletePerson, openPersonCard, handleRestructureTree, rootPersonId]);


  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes and edges when data changes
  React.useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes, setNodes]);

  React.useEffect(() => {
    setEdges(layoutedEdges);
  }, [layoutedEdges, setEdges]);

  // Auto-fit the tree view when nodes change (new tree data loaded)
  React.useEffect(() => {
    if (layoutedNodes.length > 0) {
      // Small delay to ensure nodes are rendered before fitting
      const timer = setTimeout(() => {
        // Get fitView from ReactFlow context if available
        const reactFlowInstance = document.querySelector('.react-flow');
        if (reactFlowInstance) {
          // Dispatch a custom event that the FitViewButton can listen to
          const event = new CustomEvent('autoFitTree');
          reactFlowInstance.dispatchEvent(event);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [layoutedNodes.length]);

  // Fit view button component
  const FitViewButton = () => {
    const { fitView } = useReactFlow();

    const handleFitView = useCallback(() => {
      // Increase right padding to prevent legend overlap
      fitView({
        padding: {
          top: 50,
          right: 150,
          bottom: 50,
          left: 10
        },
        minZoom: 0.3,
        maxZoom: 1.2,
        duration: 800
      });
    }, [fitView]);

    // Auto-fit when tree data changes
    React.useEffect(() => {
      const reactFlowElement = document.querySelector('.react-flow');
      if (reactFlowElement) {
        const handleAutoFit = () => {
          handleFitView();
        };
        
        reactFlowElement.addEventListener('autoFitTree', handleAutoFit);
        return () => reactFlowElement.removeEventListener('autoFitTree', handleAutoFit);
      }
    }, [handleFitView]);

    return (
      <Button onClick={handleFitView} variant="secondary">
        Fit Tree
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
            <Button onClick={handleShareTree} variant="secondary">
              <FaShareAlt className="mr-2" />
              Share Tree
            </Button>
            {rootPersonId && (
              <Button 
                onClick={() => setShowUnrelated(!showUnrelated)} 
                variant="secondary"
              >
                {showUnrelated ? 'Hide Unrelated' : 'Show Unrelated'}
              </Button>
            )}
            <FitViewButton />
          </div>
        </div>

        {/* React Flow Container */}
        <div className="h-[calc(100vh-80px)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.15,
              minZoom: 0.1,
              maxZoom: 2,
            }}
            minZoom={0.05}
            maxZoom={3}
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
                const gender = node.data?.person?.gender?.toLowerCase();
                if (gender === 'female') {
                  return '#ec4899';
                }
                if (gender === 'male') {
                  return '#6366f1';
                }
                return '#9ca3af';
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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-black border-dashed" style={{ borderTop: '2px dashed #000000', background: 'none' }}></div>
                    <span>Late Spouse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#3b82f6] border-dotted" style={{ borderTop: '2px dotted #3b82f6', background: 'none' }}></div>
                    <span>Siblings (if no parents)</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      🏠 Click home icon to change root person
                    </div>
                    <div className="text-xs text-gray-500">
                      👥 Sibling relationships shown through positioning
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

        <ShareModal
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          personId={rootPersonId}
          shareType="tree"
        />

        {/* Modals */}
        {isAddPersonModalOpen && (
          <AddPersonModal 
            isOpen={isAddPersonModalOpen} 
            onClose={closeAddPersonModal} 
            isFirstPerson={false}
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
            relationships={groupRelatives(deleteTarget)}
            onConfirm={() => {
              // Handle delete logic with proper API call
              deletePerson.mutate(deleteTarget.id, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['tree'] });
                  queryClient.invalidateQueries({ queryKey: ['people'] });
                  setDeleteTarget(null);
                  setSelectedPerson(null); // Close person card if open
                },
                onError: () => {
                  // Keep modal open on error so user can retry
                }
              });
            }} 
            onCancel={() => setDeleteTarget(null)} 
            isLoading={deletePerson.isPending} 
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTree;