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
import { FaShareAlt, FaFacebookSquare, FaTwitter, FaWhatsappSquare, FaEnvelopeSquare, FaLink } from 'react-icons/fa';

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
import { generateTreeShareContent, handleSocialShare } from '../../services/sharing';
// import { testRelationshipCalculation } from '../../utils/test-relationship-debug';

// Node types for react-flow
const nodeTypes = {
  custom: CustomNode,
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  
  const queryClient = useQueryClient();
  const deletePerson = useDeletePerson();
  
  const { data, isLoading, isError } = useFullTree(rootPersonId);

  // Debug: Log the API response
  React.useEffect(() => {
    console.log('=== API Data Debug ===');
    console.log('isLoading:', isLoading);
    console.log('isError:', isError);
    console.log('data:', data);
    console.log('rootPersonId:', rootPersonId);
    
    // Check authentication state
    const token = localStorage.getItem('token');
    console.log('Auth token exists:', !!token);
    console.log('Token length:', token?.length);
    
    // Debug edges/relationships format
    if (data && data.edges) {
      console.log('=== Relationship Debug ===');
      console.log('Total relationships:', data.edges.length);
      
      // Check spouse relationships specifically
      const spouseRelationships = data.edges.filter(edge => 
        (edge.relationship_type === 'spouse' || edge.type === 'spouse')
      );
      console.log('Spouse relationships found:', spouseRelationships.length);
      spouseRelationships.forEach((edge, index) => {
        console.log(`Spouse ${index + 1}:`, {
          from: edge.from || edge.source,
          to: edge.to || edge.target,
          is_ex: edge.is_ex,
          is_deceased: edge.is_deceased,
          full_edge: edge
        });
      });
    }
  }, [data, isLoading, isError, rootPersonId]);

  // Process data based on root person and add relationship information
  const processedData = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    // Auto-set oldest person as root if no root is selected and we haven't set default root yet
    if (!rootPersonId && !hasSetDefaultRoot && data.oldest_person_id) {
      setRootPersonId(data.oldest_person_id);
      setHasSetDefaultRoot(true);
    }

    // Use collectConnectedFamily to get all connected persons and relationships for the root
    let filteredNodes = data.nodes;
    let filteredEdges = data.edges;
    if (rootPersonId) {
      const result = collectConnectedFamily(rootPersonId, data.nodes, data.edges);
      filteredNodes = result.persons;
      filteredEdges = result.relationships;
    }

    // Add relationship information to all people (if needed)
    const rootPerson = rootPersonId
      ? filteredNodes.find(n => n.id === rootPersonId)
      : null;
    
    // DEBUG LOGGING: Log data being passed to relationship calculator
    if (rootPerson && (rootPerson.id === 5 || rootPerson.id === '5')) { // Charlie C
      console.log('=== DEBUG: Family Tree Relationship Calculator Data ===');
      console.log('Root Person (Charlie):', rootPerson);
      console.log('All People:', filteredNodes);
      console.log('All Edges:', filteredEdges);
      console.log('Edges involving Charlie (5) or David (4):');
      const relevantEdges = filteredEdges.filter(edge => 
        edge.from === 5 || edge.to === 5 || edge.from === 4 || edge.to === 4 ||
        edge.from === '5' || edge.to === '5' || edge.from === '4' || edge.to === '4'
      );
      relevantEdges.forEach(edge => console.log('  ', edge));
    }
    
    const peopleWithRelations = getAllRelationshipsToRoot(
      rootPerson,
      filteredNodes,
      filteredEdges
    );
    
    // DEBUG LOGGING: Log the calculated relationships for Charlie
    if (rootPerson && (rootPerson.id === 5 || rootPerson.id === '5')) { // Charlie C
      console.log('=== DEBUG: Calculated Relationships for Charlie ===');
      peopleWithRelations.forEach(person => {
        if (person.id === 4 || person.id === '4') { // David A
          console.log(`David A → Charlie C: "${person.relation}"`);
        }
      });
    }

    return {
      nodes: peopleWithRelations,
      edges: filteredEdges
    };
  }, [data, rootPersonId, hasSetDefaultRoot]);

  // Debug: Log processed data
  React.useEffect(() => {
    console.log('processedData:', processedData);
  }, [processedData]);

  // Helper to group relationships for delete modal
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

  const handleShareTree = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    setShareCaption('');
  }, []);

  const handleSocialShareClick = useCallback(async (platform, caption = '') => {
    try {
      const shareContent = generateTreeShareContent(rootPersonId, caption);
      await handleSocialShare(platform, shareContent);
      
      if (platform === 'copy') {
        // Show success message for copy
        alert('Tree link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to simple sharing if API fails
      const treeTitle = rootPersonId 
        ? `${processedData.nodes.find(n => n.id === rootPersonId)?.first_name}'s Family Tree`
        : 'Complete Family Tree';
      
      const treeDescription = caption || `Check out this family tree with ${processedData.nodes.length} family members!`;
      const shareUrl = window.location.href;
      
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(treeDescription)}`, '_blank');
          break;
        case 'twitter':
        case 'x':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(treeDescription)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(treeDescription + ' ' + shareUrl)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent(treeTitle)}&body=${encodeURIComponent(treeDescription + '\n\n' + shareUrl)}`, '_blank');
          break;
        case 'copy':
          navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard!');
          });
          break;
        default:
          break;
      }
    }
  }, [rootPersonId, processedData.nodes]);


  // Transform data for react-flow using improved grid-based layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!processedData.nodes.length) return { nodes: [], edges: [] };
    return createFamilyTreeLayout(processedData.nodes, processedData.edges, {
      onEdit: handleEditPerson,
      onDelete: handleDeletePerson,
      onPersonCardOpen: openPersonCard,
      onRestructure: handleRestructureTree,
    });
  }, [processedData, handleEditPerson, handleDeletePerson, openPersonCard, handleRestructureTree]);

  // Debug: Log layouted nodes and edges
  React.useEffect(() => {
    console.log('layoutedNodes:', layoutedNodes);
    console.log('layoutedEdges:', layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

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
      fitView({ padding: 0.15, duration: 800 });
    }, [fitView]);

    return (
      <Button onClick={handleFitView} variant="secondary">
        Fit View
      </Button>
    );
  };

  const CenterViewButton = () => {
    const { setCenter } = useReactFlow();
    
    const handleCenterView = useCallback(() => {
      setCenter(0, 0, { zoom: 0.8, duration: 800 });
    }, [setCenter]);

    return (
      <Button onClick={handleCenterView} variant="secondary">
        Center View
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
            <CenterViewButton />
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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-black border-dashed" style={{ borderTop: '2px dashed #000000', background: 'none' }}></div>
                    <span>Late Spouse</span>
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

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share Family Tree</h3>
                <button
                  onClick={handleCloseShareModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg text-center mb-4">
                <div className="text-4xl mb-2">🌳</div>
                <p className="font-semibold">
                  {rootPersonId 
                    ? `${processedData.nodes.find(n => n.id === rootPersonId)?.first_name}'s Family Tree`
                    : 'Complete Family Tree'
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {processedData.nodes.length} family members
                </p>
              </div>
              
              <textarea 
                className="w-full p-2 border rounded-md mb-4" 
                placeholder="Add an optional caption..."
                rows="3"
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
              />
              
              <div className="flex justify-center space-x-4 mt-4">
                <button 
                  className="text-2xl text-blue-600 hover:text-blue-800" 
                  title="Share on Facebook"
                  onClick={() => handleSocialShareClick('facebook', shareCaption)}
                >
                  <FaFacebookSquare />
                </button>
                <button 
                  className="text-2xl text-black hover:text-gray-700" 
                  title="Share on X"
                  onClick={() => handleSocialShareClick('x', shareCaption)}
                >
                  <FaTwitter />
                </button>
                <button 
                  className="text-2xl text-green-500 hover:text-green-700" 
                  title="Share on WhatsApp"
                  onClick={() => handleSocialShareClick('whatsapp', shareCaption)}
                >
                  <FaWhatsappSquare />
                </button>
                <button 
                  className="text-2xl text-red-500 hover:text-red-700" 
                  title="Share via Email"
                  onClick={() => handleSocialShareClick('email', shareCaption)}
                >
                  <FaEnvelopeSquare />
                </button>
                <button 
                  className="text-2xl text-gray-600 hover:text-gray-800" 
                  title="Copy Link"
                  onClick={() => handleSocialShareClick('copy', shareCaption)}
                >
                  <FaLink />
                </button>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" 
                  onClick={handleCloseShareModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
                onError: (error) => {
                  console.error('Failed to delete person:', error);
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