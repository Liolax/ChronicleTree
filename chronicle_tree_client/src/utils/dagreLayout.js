// Dagre-Based Family Tree Layout Algorithm
// Uses Dagre.js for automatic layout with family-specific enhancements

import dagre from 'dagre';
import { generateBranchColor, createColorCodedEdges } from './familyTreeLayout';

/**
 * Create a dagre graph from nodes and edges
 * @param {Array} nodes - Array of person nodes
 * @param {Array} edges - Array of relationship edges
 * @returns {Object} - Dagre graph instance
 */
const createDagreGraph = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  
  // Configure the graph
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom
    align: 'UL', // Upper left alignment
    nodesep: 150, // Horizontal spacing between nodes
    ranksep: 200, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  });
  
  // Add nodes to dagre graph
  nodes.forEach(node => {
    dagreGraph.setNode(String(node.id), {
      width: 170, // Match CustomNode width
      height: 120, // Approximate CustomNode height
      label: `${node.first_name} ${node.last_name}`,
    });
  });
  
  // Add edges to dagre graph
  const nodeIds = new Set(nodes.map(node => String(node.id)));
  edges.forEach(edge => {
    const source = String(edge.source || edge.from);
    const target = String(edge.target || edge.to);
    
    if (nodeIds.has(source) && nodeIds.has(target)) {
      dagreGraph.setEdge(source, target, {
        label: edge.type,
        weight: edge.type === 'spouse' ? 2 : 1, // Give spouse edges more weight
      });
    }
  });
  
  return dagreGraph;
};

/**
 * Apply family-specific enhancements to dagre layout
 * @param {Array} flowNodes - Array of positioned nodes
 * @param {Array} edges - Array of relationship edges
 * @returns {Array} - Enhanced flow nodes
 */
const applyFamilyEnhancements = (flowNodes, edges) => {
  const nodeMap = Object.fromEntries(flowNodes.map(node => [node.id, node]));
  
  // Group couples and position them closer together
  const spouseEdges = edges.filter(edge => edge.type === 'spouse');
  const processedCouples = new Set();
  
  spouseEdges.forEach(edge => {
    const sourceId = String(edge.source || edge.from);
    const targetId = String(edge.target || edge.to);
    const coupleKey = [sourceId, targetId].sort().join('-');
    
    if (processedCouples.has(coupleKey)) return;
    processedCouples.add(coupleKey);
    
    const sourceNode = nodeMap[sourceId];
    const targetNode = nodeMap[targetId];
    
    if (sourceNode && targetNode) {
      // Position spouses closer together
      const midX = (sourceNode.position.x + targetNode.position.x) / 2;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;
      
      sourceNode.position.x = midX - 85; // Half node width
      targetNode.position.x = midX + 85;
      sourceNode.position.y = midY;
      targetNode.position.y = midY;
    }
  });
  
  // Center children between their parents
  const childToParents = {};
  edges.forEach(edge => {
    if (edge.type === 'parent' || edge.type === 'child') {
      const parentId = edge.type === 'parent' ? edge.source : edge.target;
      const childId = edge.type === 'parent' ? edge.target : edge.source;
      
      if (!childToParents[childId]) childToParents[childId] = [];
      childToParents[childId].push(parentId);
    }
  });
  
  flowNodes.forEach(node => {
    const parents = (childToParents[node.id] || [])
      .map(parentId => nodeMap[parentId])
      .filter(Boolean);
    
    if (parents.length > 1) {
      // Center between multiple parents
      const avgX = parents.reduce((sum, parent) => sum + parent.position.x, 0) / parents.length;
      node.position.x = avgX;
    }
  });
  
  return flowNodes;
};

/**
 * Apply post-processing optimizations to the layout
 * @param {Array} flowNodes - Array of positioned nodes
 * @param {Array} edges - Array of relationship edges
 * @returns {Array} - Optimized flow nodes
 */
const applyPostProcessing = (flowNodes, edges) => {
  // Calculate generations for better vertical alignment
  const childToParents = {};
  const parentToChildren = {};
  
  edges.forEach(edge => {
    if (edge.type === 'parent' || edge.type === 'child') {
      const parentId = edge.type === 'parent' ? edge.source : edge.target;
      const childId = edge.type === 'parent' ? edge.target : edge.source;
      
      if (!childToParents[childId]) childToParents[childId] = [];
      if (!parentToChildren[parentId]) parentToChildren[parentId] = [];
      
      childToParents[childId].push(parentId);
      parentToChildren[parentId].push(childId);
    }
  });
  
  // Find root nodes and calculate generations
  const rootIds = flowNodes
    .filter(node => !childToParents[node.id] || childToParents[node.id].length === 0)
    .map(node => node.id);
  
  const generationMap = {};
  const visited = new Set();
  let queue = rootIds.map(id => ({ id, generation: 0 }));
  
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);
    
    generationMap[id] = generation;
    
    (parentToChildren[id] || []).forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, generation: generation + 1 });
      }
    });
  }
  
  // Align nodes by generation
  const generationSpacing = 250;
  flowNodes.forEach(node => {
    const generation = generationMap[node.id] ?? 0;
    node.position.y = generation * generationSpacing;
  });
  
  return flowNodes;
};

/**
 * Dagre-based Family Tree Layout Algorithm
 * @param {Array} nodes - Array of person nodes
 * @param {Array} edges - Array of relationship edges
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - Flow nodes and edges with dagre-based layout
 */
export const dagreLayout = (nodes, edges, handlers = {}) => {
  if (!nodes || !edges) {
    return { flowNodes: [], flowEdges: [] };
  }
  
  // Step 1: Create dagre graph
  const dagreGraph = createDagreGraph(nodes, edges);
  
  // Step 2: Apply dagre layout
  dagre.layout(dagreGraph);
  
  // Step 3: Extract positioned nodes
  const flowNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(String(node.id));
    
    return {
      id: String(node.id),
      type: 'custom',
      data: { person: node, ...handlers },
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      draggable: true,
    };
  });
  
  // Step 4: Apply family-specific enhancements
  const enhancedNodes = applyFamilyEnhancements(flowNodes, edges);
  
  // Step 5: Apply post-processing optimizations
  const optimizedNodes = applyPostProcessing(enhancedNodes, edges);
  
  // Step 6: Create color-coded edges
  const flowEdges = createColorCodedEdges(edges, nodes);
  
  return {
    flowNodes: optimizedNodes,
    flowEdges,
  };
};

export default dagreLayout;