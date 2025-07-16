import { describe, it, expect } from 'vitest';
import {
  generateBranchColor,
  calculateGenerations,
  groupCouples,
  calculateIntelligentSpacing,
  centerChildrenBetweenParents,
  createColorCodedEdges,
  familyTreeLayout,
} from '../utils/familyTreeLayout';

describe('familyTreeLayout', () => {
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

  describe('generateBranchColor', () => {
    it('should return different colors for different branch indices', () => {
      const color1 = generateBranchColor(0);
      const color2 = generateBranchColor(1);
      const color3 = generateBranchColor(2);
      
      expect(color1).toBe('#6366f1');
      expect(color2).toBe('#f59e42');
      expect(color3).toBe('#ef4444');
    });

    it('should cycle through colors when index exceeds color array length', () => {
      const color1 = generateBranchColor(0);
      const color17 = generateBranchColor(16); // Should cycle back to first color
      
      expect(color1).toBe(color17);
    });
  });

  describe('calculateGenerations', () => {
    it('should correctly calculate generations for a simple family tree', () => {
      const generations = calculateGenerations(sampleNodes, sampleEdges);
      
      expect(generations[1]).toBe(0); // John (root)
      expect(generations[2]).toBe(0); // Jane (spouse of John, same generation)
      expect(generations[3]).toBe(1); // Bob (child)
      expect(generations[4]).toBe(1); // Alice (spouse of Bob, same generation)
    });

    it('should handle single person without relationships', () => {
      const singleNode = [{ id: 1, first_name: 'Solo', last_name: 'Person' }];
      const generations = calculateGenerations(singleNode, []);
      
      expect(generations[1]).toBe(0);
    });

    it('should handle complex multi-generational family', () => {
      const complexNodes = [
        { id: 1, first_name: 'Grandpa', last_name: 'Smith' },
        { id: 2, first_name: 'Grandma', last_name: 'Smith' },
        { id: 3, first_name: 'Dad', last_name: 'Smith' },
        { id: 4, first_name: 'Mom', last_name: 'Smith' },
        { id: 5, first_name: 'Kid', last_name: 'Smith' },
      ];
      
      const complexEdges = [
        { source: 1, target: 2, type: 'spouse' },
        { source: 1, target: 3, type: 'parent' },
        { source: 2, target: 3, type: 'parent' },
        { source: 3, target: 4, type: 'spouse' },
        { source: 3, target: 5, type: 'parent' },
        { source: 4, target: 5, type: 'parent' },
      ];
      
      const generations = calculateGenerations(complexNodes, complexEdges);
      
      expect(generations[1]).toBe(0); // Grandpa
      expect(generations[2]).toBe(0); // Grandma (spouse of Grandpa)
      expect(generations[3]).toBe(1); // Dad
      expect(generations[4]).toBe(1); // Mom (spouse of Dad)
      expect(generations[5]).toBe(2); // Kid
    });
  });

  describe('groupCouples', () => {
    it('should correctly group couples based on spouse relationships', () => {
      const { coupleGroups, nodeToCoupleIdx } = groupCouples(sampleNodes, sampleEdges);
      
      expect(coupleGroups).toHaveLength(2);
      expect(coupleGroups[0]).toEqual(['1', '2']);
      expect(coupleGroups[1]).toEqual(['3', '4']);
      
      expect(nodeToCoupleIdx['1']).toBe(0);
      expect(nodeToCoupleIdx['2']).toBe(0);
      expect(nodeToCoupleIdx['3']).toBe(1);
      expect(nodeToCoupleIdx['4']).toBe(1);
    });

    it('should handle nodes without spouses', () => {
      const noSpouseNodes = [{ id: 1, first_name: 'Single', last_name: 'Person' }];
      const { coupleGroups, nodeToCoupleIdx } = groupCouples(noSpouseNodes, []);
      
      expect(coupleGroups).toHaveLength(0);
      expect(nodeToCoupleIdx).toEqual({});
    });
  });

  describe('calculateIntelligentSpacing', () => {
    it('should calculate appropriate spacing based on generation width', () => {
      const generationGroups = {
        0: [sampleNodes[0], sampleNodes[1]],
        1: [sampleNodes[2], sampleNodes[3]],
      };
      
      const { coupleGroups, nodeToCoupleIdx } = groupCouples(sampleNodes, sampleEdges);
      const spacing = calculateIntelligentSpacing(generationGroups, nodeToCoupleIdx, coupleGroups);
      
      expect(spacing).toHaveProperty('nodeSpacing');
      expect(spacing).toHaveProperty('coupleSpacing');
      expect(spacing).toHaveProperty('generationSpacing');
      expect(spacing).toHaveProperty('maxWidth');
      
      expect(spacing.nodeSpacing).toBeGreaterThan(0);
      expect(spacing.coupleSpacing).toBe(150);
      expect(spacing.generationSpacing).toBe(300);
    });
  });

  describe('centerChildrenBetweenParents', () => {
    it('should center children between multiple parents', () => {
      const flowNodes = [
        { id: '1', position: { x: 0, y: 0 } },
        { id: '2', position: { x: 200, y: 0 } },
        { id: '3', position: { x: 50, y: 100 } },
      ];
      
      const childToParents = {
        '3': ['1', '2'],
      };
      
      const result = centerChildrenBetweenParents(flowNodes, childToParents);
      
      expect(result[2].position.x).toBe(100); // Centered between 0 and 200
    });

    it('should handle children with single parent', () => {
      const flowNodes = [
        { id: '1', position: { x: 100, y: 0 } },
        { id: '2', position: { x: 50, y: 100 } },
      ];
      
      const childToParents = {
        '2': ['1'],
      };
      
      const result = centerChildrenBetweenParents(flowNodes, childToParents);
      
      // Should not change position significantly for single parent
      expect(result[1].position.x).toBeDefined();
    });
  });

  describe('createColorCodedEdges', () => {
    it('should create color-coded edges with proper styling', () => {
      const flowEdges = createColorCodedEdges(sampleEdges, sampleNodes);
      
      expect(flowEdges).toHaveLength(4);
      
      // Check edge structure
      flowEdges.forEach(edge => {
        expect(edge).toHaveProperty('id');
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('type', 'smoothstep');
        expect(edge).toHaveProperty('style');
        expect(edge.style).toHaveProperty('stroke');
        expect(edge.style).toHaveProperty('strokeWidth');
      });
    });

    it('should apply different styles for different edge types', () => {
      const flowEdges = createColorCodedEdges(sampleEdges, sampleNodes);
      
      const spouseEdge = flowEdges.find(edge => edge.label === 'spouse');
      const parentEdge = flowEdges.find(edge => edge.label === 'parent');
      
      expect(spouseEdge.style.strokeWidth).toBe(3);
      expect(spouseEdge.style.strokeDasharray).toBe('5 5');
      expect(parentEdge.style.strokeWidth).toBe(2);
      expect(parentEdge.markerEnd).toBeDefined();
    });
  });

  describe('familyTreeLayout', () => {
    it('should return empty arrays for null/undefined inputs', () => {
      const result1 = familyTreeLayout(null, null);
      const result2 = familyTreeLayout(undefined, undefined);
      const result3 = familyTreeLayout([], []);
      
      expect(result1).toEqual({ flowNodes: [], flowEdges: [] });
      expect(result2).toEqual({ flowNodes: [], flowEdges: [] });
      expect(result3).toEqual({ flowNodes: [], flowEdges: [] });
    });

    it('should generate complete family tree layout', () => {
      const result = familyTreeLayout(sampleNodes, sampleEdges);
      
      expect(result).toHaveProperty('flowNodes');
      expect(result).toHaveProperty('flowEdges');
      
      expect(result.flowNodes).toHaveLength(4);
      expect(result.flowEdges).toHaveLength(4);
      
      // Check node structure
      result.flowNodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('type', 'custom');
        expect(node).toHaveProperty('data');
        expect(node).toHaveProperty('position');
        expect(node).toHaveProperty('draggable', true);
        expect(node.position).toHaveProperty('x');
        expect(node.position).toHaveProperty('y');
      });
      
      // Check edge structure
      result.flowEdges.forEach(edge => {
        expect(edge).toHaveProperty('id');
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('type', 'smoothstep');
        expect(edge).toHaveProperty('style');
      });
    });

    it('should handle handlers passed to nodes', () => {
      const mockHandlers = {
        onEdit: () => {},
        onDelete: () => {},
        onCenter: () => {},
      };
      
      const result = familyTreeLayout(sampleNodes, sampleEdges, mockHandlers);
      
      result.flowNodes.forEach(node => {
        expect(node.data).toHaveProperty('person');
        expect(node.data).toHaveProperty('onEdit');
        expect(node.data).toHaveProperty('onDelete');
        expect(node.data).toHaveProperty('onCenter');
      });
    });
  });
});