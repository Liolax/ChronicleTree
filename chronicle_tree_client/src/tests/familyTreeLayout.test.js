import { describe, it, expect } from 'vitest';
import { createFamilyTreeLayout, centerTree, calculateTreeBounds } from '../utils/familyTreeLayout';

describe('Family Tree Layout', () => {
  const mockNodes = [
    { id: 1, first_name: 'John', last_name: 'Doe', date_of_birth: '1950-01-01' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', date_of_birth: '1952-01-01' },
    { id: 3, first_name: 'Bob', last_name: 'Doe', date_of_birth: '1975-01-01' },
    { id: 4, first_name: 'Alice', last_name: 'Smith', date_of_birth: '1977-01-01' },
    { id: 5, first_name: 'Charlie', last_name: 'Doe', date_of_birth: '2000-01-01' },
  ];

  const mockEdges = [
    { from: 1, to: 3, type: 'parent' },
    { from: 2, to: 3, type: 'parent' },
    { from: 1, to: 2, type: 'spouse' },
    { from: 3, to: 4, type: 'spouse' },
    { from: 3, to: 5, type: 'parent' },
    { from: 4, to: 5, type: 'parent' },
  ];

  it('should create flow nodes and edges', () => {
    const { flowNodes, flowEdges } = createFamilyTreeLayout(mockNodes, mockEdges);
    
    expect(flowNodes).toHaveLength(5);
    expect(flowEdges).toHaveLength(6);
    
    // Check that all nodes have positions
    flowNodes.forEach(node => {
      expect(node.position).toBeDefined();
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
    });
  });

  it('should handle empty data gracefully', () => {
    const { flowNodes, flowEdges } = createFamilyTreeLayout([], []);
    
    expect(flowNodes).toHaveLength(0);
    expect(flowEdges).toHaveLength(0);
  });

  it('should handle null data gracefully', () => {
    const { flowNodes, flowEdges } = createFamilyTreeLayout(null, null);
    
    expect(flowNodes).toHaveLength(0);
    expect(flowEdges).toHaveLength(0);
  });

  it('should calculate tree bounds correctly', () => {
    const { flowNodes } = createFamilyTreeLayout(mockNodes, mockEdges);
    const bounds = calculateTreeBounds(flowNodes);
    
    expect(bounds.minX).toBeDefined();
    expect(bounds.maxX).toBeDefined();
    expect(bounds.minY).toBeDefined();
    expect(bounds.maxY).toBeDefined();
    
    expect(bounds.maxX).toBeGreaterThanOrEqual(bounds.minX);
    expect(bounds.maxY).toBeGreaterThanOrEqual(bounds.minY);
  });

  it('should center tree properly', () => {
    const { flowNodes } = createFamilyTreeLayout(mockNodes, mockEdges);
    const originalBounds = calculateTreeBounds(flowNodes);
    
    const centeredNodes = centerTree(flowNodes, 1000, 600);
    const centeredBounds = calculateTreeBounds(centeredNodes);
    
    expect(centeredNodes).toHaveLength(flowNodes.length);
    
    // Tree should be moved (unless it was already centered)
    expect(centeredBounds.minX).not.toBeNaN();
    expect(centeredBounds.minY).not.toBeNaN();
  });

  it('should assign different generations correctly', () => {
    const { flowNodes } = createFamilyTreeLayout(mockNodes, mockEdges);
    
    // Get nodes by ID
    const nodeMap = new Map(flowNodes.map(n => [n.id, n]));
    
    const johnNode = nodeMap.get('1');
    const janeNode = nodeMap.get('2');
    const bobNode = nodeMap.get('3');
    const aliceNode = nodeMap.get('4');
    const charlieNode = nodeMap.get('5');
    
    // John and Jane should be at the same generation (top)
    expect(johnNode.position.y).toBe(janeNode.position.y);
    
    // Bob and Alice should be at the same generation (middle)
    expect(bobNode.position.y).toBe(aliceNode.position.y);
    
    // Charlie should be at the bottom generation
    expect(charlieNode.position.y).toBeGreaterThan(bobNode.position.y);
    
    // Generations should be properly spaced
    expect(bobNode.position.y).toBeGreaterThan(johnNode.position.y);
  });
});