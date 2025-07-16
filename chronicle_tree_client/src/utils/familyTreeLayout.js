/**
 * Family Tree Layout - Bridge to hierarchical layout
 * This file provides the familyTreeLayout function expected by Tree.jsx
 */

import { createFamilyTreeLayout } from './familyTreeHierarchicalLayout';

/**
 * Main family tree layout function
 * @param {Array} persons - Array of person objects
 * @param {Array} relationships - Array of relationship objects  
 * @param {Object} handlers - Event handlers for nodes
 * @returns {Object} - { flowNodes, flowEdges } for react-flow
 */
export const familyTreeLayout = (persons, relationships, handlers = {}) => {
  const { nodes, edges } = createFamilyTreeLayout(persons, relationships, handlers);
  return { flowNodes: nodes, flowEdges: edges };
};