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

import PersonCardNode from '../components/Tree/PersonCardNode';
import PersonCard from '../components/Tree/PersonCard';
import { createFamilyTreeLayout, centerChildrenBetweenParents } from '../utils/familyTreeHierarchicalLayout';
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

  // Event handlers
  const handleEditPerson = useCallback((person) => {
    console.log('Edit person:', person);
  }, []);

  const handleDeletePerson = useCallback((person) => {
    console.log('Delete person:', person);
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

  // Transform mock data for react-flow using improved hierarchical layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes, edges } = createFamilyTreeLayout(mockFamilyData.nodes, mockFamilyData.edges, {
      onEdit: handleEditPerson,
      onDelete: handleDeletePerson,
      onPersonCardOpen: openPersonCard,
    });

    return { nodes, edges };
  }, [handleEditPerson, handleDeletePerson, openPersonCard]);

  // Apply final positioning adjustments
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!initialNodes.length) return { nodes: [], edges: [] };
    
    // Center children between their parents for better visual hierarchy
    const adjustedNodes = centerChildrenBetweenParents(initialNodes, mockFamilyData.edges);
    return { nodes: adjustedNodes, edges: initialEdges };
  }, [initialNodes, initialEdges]);

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
          <div className="flex gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Family Tree Demo</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>People: {nodes.length}</span>
              <span>•</span>
              <span>Relationships: {edges.length}</span>
            </div>
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
                <div className="font-semibold text-gray-700 mb-2">Enhanced Family Tree</div>
                <div className="space-y-1 text-gray-600">
                  <div>👥 {nodes.length} people</div>
                  <div>🔗 {edges.length} relationships</div>
                  <div>📊 Top-down hierarchical layout</div>
                  <div>🎨 Custom person cards</div>
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
      </div>
    </ReactFlowProvider>
  );
};

export default FamilyTreeDemo;