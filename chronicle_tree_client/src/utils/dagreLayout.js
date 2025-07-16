/**
 * Enhanced Family Tree Layout with Dagre Integration
 * 
 * This provides an alternative layout using dagre for better automatic positioning
 * while maintaining family tree semantics.
 */

import dagre from 'dagre';

/**
 * Create a dagre-based family tree layout
 * This provides better automatic positioning and edge routing
 */
export function createDagreBasedLayout(nodes, edges, handlers = {}) {
  if (!nodes || !edges) return { flowNodes: [], flowEdges: [] };

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph options for family tree layout
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom
    nodesep: 150,  // Horizontal spacing between nodes
    ranksep: 200,  // Vertical spacing between ranks
    edgesep: 50,   // Edge separation
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to the graph
  nodes.forEach(node => {
    dagreGraph.setNode(String(node.id), {
      width: 170,
      height: 120,
      label: `${node.first_name} ${node.last_name}`,
      person: node,
    });
  });

  // Add edges to the graph
  edges.forEach(edge => {
    const sourceId = String(edge.source || edge.from);
    const targetId = String(edge.target || edge.to);
    
    // Only add edge if both nodes exist
    if (dagreGraph.hasNode(sourceId) && dagreGraph.hasNode(targetId)) {
      dagreGraph.setEdge(sourceId, targetId, {
        relationshipType: edge.type,
        originalEdge: edge,
      });
    }
  });

  // Apply dagre layout
  dagre.layout(dagreGraph);

  // Extract positioned nodes
  const flowNodes = nodes.map(node => {
    const dagreNode = dagreGraph.node(String(node.id));
    return {
      id: String(node.id),
      type: 'custom',
      data: { person: node, ...handlers },
      position: {
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
      },
      draggable: true,
    };
  });

  // Extract edges with enhanced styling
  const flowEdges = [];
  edges.forEach((edge, index) => {
    const sourceId = String(edge.source || edge.from);
    const targetId = String(edge.target || edge.to);
    
    if (dagreGraph.hasNode(sourceId) && dagreGraph.hasNode(targetId)) {
      const dagreEdge = dagreGraph.edge(sourceId, targetId);
      
      flowEdges.push({
        id: `dagre-edge-${sourceId}-${targetId}-${index}`,
        source: sourceId,
        target: targetId,
        type: getEdgeType(edge.type),
        animated: false,
        style: getDagreEdgeStyle(edge.type),
        label: edge.type,
        labelStyle: {
          fontSize: '12px',
          fontWeight: 'bold',
          fill: getDagreEdgeColor(edge.type),
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.8,
        },
        // Add dagre routing points if available
        ...(dagreEdge.points && { points: dagreEdge.points }),
      });
    }
  });

  return { flowNodes, flowEdges };
}

/**
 * Get edge type for dagre layout
 */
function getEdgeType(relationshipType) {
  switch (relationshipType) {
    case 'spouse':
      return 'straight';
    case 'parent':
      return 'step';
    case 'sibling':
      return 'smoothstep';
    default:
      return 'smoothstep';
  }
}

/**
 * Get edge color for dagre layout
 */
function getDagreEdgeColor(relationshipType) {
  switch (relationshipType) {
    case 'spouse':
      return '#f59e42'; // Orange
    case 'parent':
      return '#6366f1'; // Indigo
    case 'sibling':
      return '#94a3b8'; // Gray
    default:
      return '#6366f1';
  }
}

/**
 * Get edge style for dagre layout
 */
function getDagreEdgeStyle(relationshipType) {
  const baseStyle = {
    strokeWidth: 2,
  };

  switch (relationshipType) {
    case 'spouse':
      return {
        ...baseStyle,
        stroke: '#f59e42',
        strokeWidth: 3,
      };
    case 'parent':
      return {
        ...baseStyle,
        stroke: '#6366f1',
        strokeWidth: 2,
      };
    case 'sibling':
      return {
        ...baseStyle,
        stroke: '#94a3b8',
        strokeWidth: 1,
        strokeDasharray: '5,5',
      };
    default:
      return {
        ...baseStyle,
        stroke: '#6366f1',
      };
  }
}

/**
 * Post-process dagre layout to better handle family relationships
 */
export function postProcessDagreLayout(flowNodes, flowEdges) {
  // Find couples and align them horizontally
  const couples = new Map();
  
  flowEdges.forEach(edge => {
    if (edge.label === 'spouse') {
      const sourceNode = flowNodes.find(n => n.id === edge.source);
      const targetNode = flowNodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        // Align spouses horizontally
        const avgY = (sourceNode.position.y + targetNode.position.y) / 2;
        sourceNode.position.y = avgY;
        targetNode.position.y = avgY;
        
        // Ensure proper spacing
        if (Math.abs(sourceNode.position.x - targetNode.position.x) < 150) {
          if (sourceNode.position.x < targetNode.position.x) {
            targetNode.position.x = sourceNode.position.x + 150;
          } else {
            sourceNode.position.x = targetNode.position.x + 150;
          }
        }
      }
    }
  });

  // Center children between parents
  flowEdges.forEach(edge => {
    if (edge.label === 'parent') {
      const parentNode = flowNodes.find(n => n.id === edge.source);
      const childNode = flowNodes.find(n => n.id === edge.target);
      
      if (parentNode && childNode) {
        // Find other parent (spouse of current parent)
        const otherParentEdge = flowEdges.find(e => 
          e.label === 'spouse' && 
          (e.source === parentNode.id || e.target === parentNode.id)
        );
        
        if (otherParentEdge) {
          const otherParentId = otherParentEdge.source === parentNode.id ? 
            otherParentEdge.target : otherParentEdge.source;
          const otherParentNode = flowNodes.find(n => n.id === otherParentId);
          
          if (otherParentNode) {
            // Center child between parents
            const avgX = (parentNode.position.x + otherParentNode.position.x) / 2;
            childNode.position.x = avgX;
          }
        }
      }
    }
  });

  return { flowNodes, flowEdges };
}