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
import { FaShareAlt } from 'react-icons/fa';

import PersonCardNode from '../components/Tree/PersonCardNode';
import PersonCard from '../components/Tree/PersonCard';
import { createFamilyTreeLayout, centerChildrenBetweenParents } from '../utils/familyTreeHierarchicalLayout';
import { getAllRelationshipsToRoot } from '../utils/relationshipCalculator';
import { mockFamilyData } from '../data/mockData';

// Node types for react-flow
const nodeTypes = {
  personCard: PersonCardNode,
};

/**
 * Demo Family Tree Component
 * Uses mock data to showcase the new react-flow implementation
 */
const FamilyTreeDemo = () => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personCardPosition, setPersonCardPosition] = useState(null);
  const [rootPersonId, setRootPersonId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Event handlers
  const handleEditPerson = useCallback((person) => {
    console.log('Edit person:', person);
  }, []);

  const handleDeletePerson = useCallback((person) => {
    console.log('Delete person:', person);
  }, []);

  const handleCenterPerson = useCallback((personId) => {
    console.log('Center on person:', personId);
  }, []);

  const handleRestructureTree = useCallback((personId) => {
    console.log('Set new root person:', personId);
    setRootPersonId(personId);
  }, []);

  const handleResetTree = useCallback(() => {
    console.log('Reset tree to show all people');
    setRootPersonId(null);
  }, []);

  const handleShareTree = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleSocialShare = useCallback((platform) => {
    // Get the current tree info
    const treeTitle = rootPersonId 
      ? `${processedData.nodes.find(n => n.id === rootPersonId)?.first_name}'s Family Tree`
      : 'Complete Family Tree';
    
    const treeDescription = `Check out this family tree with ${processedData.nodes.length} family members!`;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(treeDescription)}`, '_blank');
        break;
      case 'twitter':
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
  }, [rootPersonId, processedData.nodes]);

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

  // Filter data based on root person and add relationship information
  const processedData = useMemo(() => {
    const rootPerson = rootPersonId 
      ? mockFamilyData.nodes.find(n => n.id === rootPersonId)
      : null;
    
    // Add relationship information to all people
    const peopleWithRelations = getAllRelationshipsToRoot(
      rootPerson,
      mockFamilyData.nodes,
      mockFamilyData.edges
    );
    
    return {
      nodes: peopleWithRelations,
      edges: mockFamilyData.edges
    };
  }, [rootPersonId]);

  // Transform mock data for react-flow using improved hierarchical layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes, edges } = createFamilyTreeLayout(processedData.nodes, processedData.edges, {
      onEdit: handleEditPerson,
      onDelete: handleDeletePerson,
      onPersonCardOpen: openPersonCard,
      onCenter: handleCenterPerson,
      onRestructure: handleRestructureTree,
    });

    return { nodes, edges };
  }, [processedData, handleEditPerson, handleDeletePerson, openPersonCard, handleCenterPerson, handleRestructureTree]);

  // Apply final positioning adjustments
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!initialNodes.length) return { nodes: [], edges: [] };
    
    // Center children between their parents for better visual hierarchy
    const adjustedNodes = centerChildrenBetweenParents(initialNodes, processedData.edges);
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
      <button
        onClick={handleFitView}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Fit View
      </button>
    );
  };

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <div className="flex gap-4 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Family Tree Demo</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Add Person
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
              Full Tree
            </button>
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
            <button
              onClick={handleShareTree}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <FaShareAlt />
              Share Tree
            </button>
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
              />
              
              <div className="flex justify-center space-x-4 mt-4">
                <button 
                  className="text-2xl text-blue-600 hover:text-blue-800" 
                  title="Share on Facebook"
                  onClick={() => handleSocialShare('facebook')}
                >
                  📘
                </button>
                <button 
                  className="text-2xl text-black hover:text-gray-700" 
                  title="Share on X"
                  onClick={() => handleSocialShare('twitter')}
                >
                  ✖️
                </button>
                <button 
                  className="text-2xl text-green-500 hover:text-green-700" 
                  title="Share on WhatsApp"
                  onClick={() => handleSocialShare('whatsapp')}
                >
                  📱
                </button>
                <button 
                  className="text-2xl text-red-500 hover:text-red-700" 
                  title="Share via Email"
                  onClick={() => handleSocialShare('email')}
                >
                  📧
                </button>
                <button 
                  className="text-2xl text-gray-600 hover:text-gray-800" 
                  title="Copy Link"
                  onClick={() => handleSocialShare('copy')}
                >
                  🔗
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
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDemo;