import { describe, it, expect } from 'vitest';
import {
  createFamilyTreeLayout,
  centerChildrenBetweenParents,
} from '../utils/familyTreeHierarchicalLayout';

describe('familyTreeHierarchicalLayout', () => {
  // Sample test data
  const sampleNodes = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'male' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'female' },
    { id: 3, first_name: 'Bob', last_name: 'Doe', gender: 'male' },
    { id: 4, first_name: 'Alice', last_name: 'Smith', gender: 'female' },
  ];

  const sampleEdges = [
    { source: 1, target: 2, type: 'spouse' },
    { source: 1, target: 3, type: 'parent' },
    { source: 2, target: 3, type: 'parent' },
    { source: 3, target: 4, type: 'spouse' },
  ];

  describe('createFamilyTreeLayout', () => {
    it('should return empty arrays for null/undefined inputs', () => {
      const result1 = createFamilyTreeLayout(null, null);
      const result2 = createFamilyTreeLayout(undefined, undefined);
      const result3 = createFamilyTreeLayout([], []);
      
      expect(result1).toEqual({ nodes: [], edges: [] });
      expect(result2).toEqual({ nodes: [], edges: [] });
      expect(result3).toEqual({ nodes: [], edges: [] });
    });

    it('should generate complete family tree layout', () => {
      const result = createFamilyTreeLayout(sampleNodes, sampleEdges);
      
      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      
      expect(result.nodes).toHaveLength(4);
      expect(result.edges.length).toBeGreaterThan(0);
      
      // Check node structure
      result.nodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('type', 'personCard');
        expect(node).toHaveProperty('data');
        expect(node).toHaveProperty('position');
        expect(node).toHaveProperty('draggable', true);
        expect(node.position).toHaveProperty('x');
        expect(node.position).toHaveProperty('y');
      });
      
      // Check edge structure
      result.edges.forEach(edge => {
        expect(edge).toHaveProperty('id');
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('type');
        expect(edge).toHaveProperty('style');
      });
    });

    it('should handle handlers passed to nodes', () => {
      const mockHandlers = {
        onEdit: () => {},
        onDelete: () => {},
        onPersonCardOpen: () => {},
      };
      
      const result = createFamilyTreeLayout(sampleNodes, sampleEdges, mockHandlers);
      
      result.nodes.forEach(node => {
        expect(node.data).toHaveProperty('person');
        expect(node.data).toHaveProperty('onEdit');
        expect(node.data).toHaveProperty('onDelete');
        expect(node.data).toHaveProperty('onPersonCardOpen');
      });
    });

    it('should create hierarchical positioning', () => {
      const result = createFamilyTreeLayout(sampleNodes, sampleEdges);
      
      // Find parent and child nodes
      const parentNode = result.nodes.find(n => n.id === '1');
      const childNode = result.nodes.find(n => n.id === '3');
      
      // Child should be positioned below parent
      expect(childNode.position.y).toBeGreaterThan(parentNode.position.y);
    });
  });

  describe('centerChildrenBetweenParents', () => {
    it('should center children between multiple parents', () => {
      const flowNodes = [
        { id: '1', position: { x: 0, y: 0 } },
        { id: '2', position: { x: 200, y: 0 } },
        { id: '3', position: { x: 50, y: 100 } },
      ];
      
      const relationships = [
        { source: '1', target: '3', type: 'parent' },
        { source: '2', target: '3', type: 'parent' },
      ];
      
      const result = centerChildrenBetweenParents(flowNodes, relationships);
      
      expect(result[2].position.x).toBe(100); // Centered between 0 and 200
    });

    it('should handle children with single parent', () => {
      const flowNodes = [
        { id: '1', position: { x: 100, y: 0 } },
        { id: '2', position: { x: 50, y: 100 } },
      ];
      
      const relationships = [
        { source: '1', target: '2', type: 'parent' },
      ];
      
      const result = centerChildrenBetweenParents(flowNodes, relationships);
      
      // Should not change position for single parent
      expect(result[1].position.x).toBe(50);
    });
  });

  describe('spouse relationship styling', () => {
    it('should style current spouse relationships with pink dashed lines', () => {
      const sampleEdgesWithSpouse = [
        { source: 1, target: 2, type: 'spouse', is_ex: false },
        { source: 1, target: 3, type: 'parent' },
      ];

      const result = createFamilyTreeLayout(sampleNodes, sampleEdgesWithSpouse);
      
      // Find spouse edge
      const spouseEdge = result.edges.find(e => e.id.includes('spouse'));
      expect(spouseEdge).toBeTruthy();
      expect(spouseEdge.style.stroke).toBe('#ec4899'); // Pink color
      expect(spouseEdge.style.strokeDasharray).toBe('5 5');
    });

    it('should style ex-spouse relationships with grey dashed lines', () => {
      const sampleEdgesWithExSpouse = [
        { source: 1, target: 2, type: 'spouse', is_ex: true },
        { source: 1, target: 3, type: 'parent' },
      ];

      const result = createFamilyTreeLayout(sampleNodes, sampleEdgesWithExSpouse);
      
      // Find spouse edge
      const spouseEdge = result.edges.find(e => e.id.includes('spouse'));
      expect(spouseEdge).toBeTruthy();
      expect(spouseEdge.style.stroke).toBe('#9ca3af'); // Grey color
      expect(spouseEdge.style.strokeDasharray).toBe('5 5');
    });

    it('should default to pink styling when is_ex is undefined', () => {
      const sampleEdgesWithSpouse = [
        { source: 1, target: 2, type: 'spouse' }, // No is_ex property
        { source: 1, target: 3, type: 'parent' },
      ];

      const result = createFamilyTreeLayout(sampleNodes, sampleEdgesWithSpouse);
      
      // Find spouse edge
      const spouseEdge = result.edges.find(e => e.id.includes('spouse'));
      expect(spouseEdge).toBeTruthy();
      expect(spouseEdge.style.stroke).toBe('#ec4899'); // Pink color (default)
      expect(spouseEdge.style.strokeDasharray).toBe('5 5');
    });
  });

  describe('parent-child relationship styling', () => {
    it('should style parent-child relationships with solid blue lines and arrows', () => {
      const result = createFamilyTreeLayout(sampleNodes, sampleEdges);
      
      // Find parent edge
      const parentEdge = result.edges.find(e => e.id.includes('parent'));
      expect(parentEdge).toBeTruthy();
      expect(parentEdge.style.stroke).toBe('#6366f1'); // Blue color
      expect(parentEdge.style.strokeWidth).toBe(2);
      expect(parentEdge.markerEnd).toBeTruthy();
      expect(parentEdge.markerEnd.type).toBe('arrowclosed');
    });
  });

  describe('edge deduplication', () => {
    it('should not create duplicate edges for same relationship', () => {
      const duplicateEdges = [
        { source: 1, target: 2, type: 'spouse' },
        { source: 2, target: 1, type: 'spouse' }, // Duplicate spouse relationship
        { source: 1, target: 3, type: 'parent' },
      ];
      
      const result = createFamilyTreeLayout(sampleNodes, duplicateEdges);
      
      // Should have only one spouse edge, not two
      const spouseEdges = result.edges.filter(e => e.id.includes('spouse'));
      expect(spouseEdges).toHaveLength(1);
    });
  });
});