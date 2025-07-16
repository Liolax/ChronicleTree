/**
 * Dagre Layout - Automatic graph layout using dagre
 * This file provides the dagreLayout function expected by Tree.jsx
 */

import dagre from 'dagre';
import { Position } from '@xyflow/react';

/**
 * Dagre-based automatic layout function
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects  
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - { flowNodes, flowEdges } for react-flow
 */
export const dagreLayout = (persons, relationships, handlers = {}) => {
  if (!persons || !relationships) {
    return { flowNodes: [], flowEdges: [] };
  }

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set default graph attributes
  g.setGraph({ 
    rankdir: 'TB', // Top-to-bottom layout
    nodesep: 100,  // Horizontal spacing between nodes
    ranksep: 200,  // Vertical spacing between ranks
    edgesep: 50,   // Spacing between edges
    marginx: 20,   // Graph margin x
    marginy: 20    // Graph margin y
  });

  // Default to assigning a new object as a label for each new edge
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  persons.forEach(person => {
    g.setNode(String(person.id), {
      label: person.name,
      width: 280,
      height: 120
    });
  });

  // Add edges to the graph
  relationships.forEach(relationship => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    
    // Only add edges for parent-child relationships to maintain hierarchy
    if (relationship.type === 'parent') {
      g.setEdge(source, target);
    }
  });

  // Apply dagre layout
  dagre.layout(g);

  // Transform nodes to react-flow format
  const flowNodes = persons.map(person => {
    const node = g.node(String(person.id));
    
    return {
      id: String(person.id),
      type: 'custom',
      data: { 
        person,
        ...handlers
      },
      position: { 
        x: node.x - node.width / 2, 
        y: node.y - node.height / 2 
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      draggable: true,
    };
  });

  // Transform edges to react-flow format
  const flowEdges = relationships.map((relationship, index) => {
    const source = String(relationship.source || relationship.from);
    const target = String(relationship.target || relationship.to);
    
    return {
      id: `edge-${source}-${target}-${index}`,
      source,
      target,
      type: 'smoothstep',
      animated: false,
      style: getEdgeStyle(relationship.type),
      markerEnd: getMarkerEnd(relationship.type)
    };
  });

  return { flowNodes, flowEdges };
};

/**
 * Get edge styling based on relationship type
 * @param {string} type - Relationship type
 * @returns {Object} - Style object
 */
const getEdgeStyle = (type) => {
  const styles = {
    spouse: {
      stroke: '#f59e42',
      strokeWidth: 3,
      strokeDasharray: '5 5'
    },
    parent: {
      stroke: '#6366f1',
      strokeWidth: 2
    },
    sibling: {
      stroke: '#10b981',
      strokeWidth: 2,
      strokeDasharray: '3 3'
    }
  };
  
  return styles[type] || {
    stroke: '#64748b',
    strokeWidth: 2
  };
};

/**
 * Get marker end for relationship type
 * @param {string} type - Relationship type
 * @returns {Object|undefined} - Marker object or undefined
 */
const getMarkerEnd = (type) => {
  if (type === 'parent') {
    return {
      type: 'arrowclosed',
      width: 20,
      height: 20,
      color: '#6366f1'
    };
  }
  return undefined;
};