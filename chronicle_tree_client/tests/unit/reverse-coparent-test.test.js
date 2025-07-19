/**
 * Test reverse co-parent-in-law relationships
 */

import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator';

describe('Reverse Co-parent-in-law Relationships', () => {
  // Test data for co-parent-in-law relationships
  const testPeople = [
    { id: '1', full_name: 'John Doe', gender: 'male' },
    { id: '2', full_name: 'Jane Doe', gender: 'female' },
    { id: '3', full_name: 'Alice A', gender: 'female' },
    { id: '4', full_name: 'David A', gender: 'male' },
    { id: '8', full_name: 'Michael A', gender: 'male' },
    { id: '9', full_name: 'Susan A', gender: 'female' },
  ];

  const testRelationships = [
    { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
    { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
    { source: '8', target: '4', relationship_type: 'parent', is_ex: false },
    { source: '9', target: '4', relationship_type: 'parent', is_ex: false },
    { source: '3', target: '4', relationship_type: 'spouse', is_ex: false },
    { source: '4', target: '3', relationship_type: 'spouse', is_ex: false },
  ];

  it('should calculate co-parent-in-law relationships correctly in both directions', () => {
    const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
    const michaelA = testPeople.find(p => p.full_name === 'Michael A');
    const susanA = testPeople.find(p => p.full_name === 'Susan A');

    // Test both directions
    const michaelToJane = calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships);
    const susanToJane = calculateRelationshipToRoot(susanA, janeDoe, testPeople, testRelationships);
    const janeToMichael = calculateRelationshipToRoot(janeDoe, michaelA, testPeople, testRelationships);
    const janeToSusan = calculateRelationshipToRoot(janeDoe, susanA, testPeople, testRelationships);

    // Both should be co-parent-in-law
    expect(michaelToJane).toBe('Co-Father-in-law');
    expect(susanToJane).toBe('Co-Mother-in-law');
    expect(janeToMichael).toBe('Co-Mother-in-law');
    expect(janeToSusan).toBe('Co-Mother-in-law');
  });
});
