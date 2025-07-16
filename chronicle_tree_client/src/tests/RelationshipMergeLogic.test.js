// Test the relationship merging logic for in-law display
import { describe, it, expect } from 'vitest';

describe('RelationshipManager In-Law Logic', () => {
  // This mimics the mergeInLaws function from RelationshipManager.jsx
  function mergeInLaws(groups, inLaws) {
    const merged = { ...groups };
    if (inLaws.parents_in_law) {
      merged.parent = [
        ...merged.parent,
        ...inLaws.parents_in_law.map(p => ({ ...p, inLaw: true }))
      ];
    }
    if (inLaws.children_in_law) {
      merged.child = [
        ...merged.child,
        ...inLaws.children_in_law.map(p => ({ ...p, inLaw: true }))
      ];
    }
    if (inLaws.siblings_in_law) {
      merged.sibling = [
        ...merged.sibling,
        ...inLaws.siblings_in_law.map(p => ({ ...p, inLaw: true }))
      ];
    }
    return merged;
  }

  it('should merge in-law relationships correctly', () => {
    const groups = {
      parent: [
        { id: 1, full_name: 'John Doe', inLaw: false }
      ],
      child: [
        { id: 2, full_name: 'Alice Smith', inLaw: false }
      ],
      sibling: [
        { id: 3, full_name: 'Bob Jones', inLaw: false }
      ]
    };

    const inLaws = {
      parents_in_law: [
        { id: 4, full_name: 'Jane Doe' }
      ],
      children_in_law: [
        { id: 5, full_name: 'Charlie Smith' }
      ],
      siblings_in_law: [
        { id: 6, full_name: 'Emma Jones' }
      ]
    };

    const merged = mergeInLaws(groups, inLaws);

    // Check that regular relationships are preserved
    expect(merged.parent).toHaveLength(2);
    expect(merged.parent[0]).toEqual({ id: 1, full_name: 'John Doe', inLaw: false });
    
    // Check that in-law relationships are added with inLaw flag
    expect(merged.parent[1]).toEqual({ id: 4, full_name: 'Jane Doe', inLaw: true });
    expect(merged.child[1]).toEqual({ id: 5, full_name: 'Charlie Smith', inLaw: true });
    expect(merged.sibling[1]).toEqual({ id: 6, full_name: 'Emma Jones', inLaw: true });
  });

  it('should handle empty in-law arrays', () => {
    const groups = {
      parent: [{ id: 1, full_name: 'John Doe', inLaw: false }],
      child: [],
      sibling: []
    };

    const inLaws = {
      parents_in_law: [],
      children_in_law: [],
      siblings_in_law: []
    };

    const merged = mergeInLaws(groups, inLaws);

    expect(merged.parent).toHaveLength(1);
    expect(merged.child).toHaveLength(0);
    expect(merged.sibling).toHaveLength(0);
  });

  it('should handle missing in-law properties', () => {
    const groups = {
      parent: [{ id: 1, full_name: 'John Doe', inLaw: false }],
      child: [],
      sibling: []
    };

    const inLaws = {}; // No in-law properties

    const merged = mergeInLaws(groups, inLaws);

    expect(merged.parent).toHaveLength(1);
    expect(merged.child).toHaveLength(0);
    expect(merged.sibling).toHaveLength(0);
  });
});