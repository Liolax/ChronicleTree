/**
 * Comprehensive relationship calculation tests
 */

import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator';

describe('Comprehensive Relationship Calculator Tests', () => {
  // Extended test data including Michael A (David's father) for co-parent-in-law testing
  const testPeople = [
    { id: '1', full_name: 'John Doe', gender: 'male' },
    { id: '2', full_name: 'Jane Doe', gender: 'female' },
    { id: '3', full_name: 'Alice A', gender: 'female' },
    { id: '4', full_name: 'David A', gender: 'male' },
    { id: '5', full_name: 'Charlie C', gender: 'male' },
    { id: '6', full_name: 'Bob', gender: 'male' },
    { id: '7', full_name: 'Emily', gender: 'female' },
    { id: '8', full_name: 'Michael A', gender: 'male' }, // David's father
    { id: '9', full_name: 'Susan A', gender: 'female' }, // David's mother
    { id: '10', full_name: 'Frank Doe', gender: 'male' }, // John's father (great-grandparent)
    { id: '11', full_name: 'Rose Doe', gender: 'female' }, // John's mother (great-grandparent)
  ];

  // Extended relationships with great-grandparents and co-parents
  const testRelationships = [
    // Core family relationships
    { source: '1', target: '3', relationship_type: 'parent', is_ex: false },
    { source: '2', target: '3', relationship_type: 'parent', is_ex: false },
    { source: '1', target: '5', relationship_type: 'parent', is_ex: false },
    { source: '2', target: '5', relationship_type: 'parent', is_ex: false },
    { source: '3', target: '6', relationship_type: 'parent', is_ex: false },
    { source: '4', target: '6', relationship_type: 'parent', is_ex: false },
    { source: '3', target: '7', relationship_type: 'parent', is_ex: false },
    { source: '4', target: '7', relationship_type: 'parent', is_ex: false },
    
    // David's parents (for co-parent-in-law testing)
    { source: '8', target: '4', relationship_type: 'parent', is_ex: false }, // Michael -> David
    { source: '9', target: '4', relationship_type: 'parent', is_ex: false }, // Susan -> David
    
    // Great-grandparents
    { source: '10', target: '1', relationship_type: 'parent', is_ex: false }, // Frank -> John
    { source: '11', target: '1', relationship_type: 'parent', is_ex: false }, // Rose -> John
    
    // Ex-spouse relationship (Alice A and David A were married)
    { source: '3', target: '4', relationship_type: 'spouse', is_ex: true },
    { source: '4', target: '3', relationship_type: 'spouse', is_ex: true },
  ];

  describe('Sibling Relationships', () => {
    it('should correctly identify Charlie C as sibling of Alice A', () => {
      const charlieC = testPeople.find(p => p.full_name === 'Charlie C');
      const aliceA = testPeople.find(p => p.full_name === 'Alice A');
      
      const charlieToAlice = calculateRelationshipToRoot(charlieC, aliceA, testPeople, testRelationships);
      const aliceToCharlie = calculateRelationshipToRoot(aliceA, charlieC, testPeople, testRelationships);
      
      expect(charlieToAlice).toBe('Brother');
      expect(aliceToCharlie).toBe('Sister');
    });
  });

  describe('Co-parent-in-law Relationships', () => {
    it('should correctly handle ex-spouse co-parent relationships', () => {
      const janeDoe = testPeople.find(p => p.full_name === 'Jane Doe');
      const michaelA = testPeople.find(p => p.full_name === 'Michael A');
      const susanA = testPeople.find(p => p.full_name === 'Susan A');

      const michaelToJane = calculateRelationshipToRoot(michaelA, janeDoe, testPeople, testRelationships);
      const susanToJane = calculateRelationshipToRoot(susanA, janeDoe, testPeople, testRelationships);
      
      // Since Alice and David are ex-spouses, their parents should be unrelated
      expect(michaelToJane).toBe('Unrelated');
      expect(susanToJane).toBe('Unrelated');
    });
  });

  describe('Great-grandparent Relationships', () => {
    it('should correctly identify great-grandparent relationships', () => {
      const bob = testPeople.find(p => p.full_name === 'Bob');
      const frankDoe = testPeople.find(p => p.full_name === 'Frank Doe');
      const roseDoe = testPeople.find(p => p.full_name === 'Rose Doe');

      const frankToBob = calculateRelationshipToRoot(frankDoe, bob, testPeople, testRelationships);
      const roseToBob = calculateRelationshipToRoot(roseDoe, bob, testPeople, testRelationships);
      
      expect(frankToBob).toBe('Great-Grandfather');
      expect(roseToBob).toBe('Great-Grandmother');
    });
  });

  describe('Ex-spouse Relatives Handling', () => {
    it('should correctly mark ex-spouse relatives as unrelated', () => {
      const aliceA = testPeople.find(p => p.full_name === 'Alice A');
      const davidA = testPeople.find(p => p.full_name === 'David A');
      const michaelA = testPeople.find(p => p.full_name === 'Michael A');

      const davidToAlice = calculateRelationshipToRoot(davidA, aliceA, testPeople, testRelationships);
      const aliceToDavid = calculateRelationshipToRoot(aliceA, davidA, testPeople, testRelationships);
      const michaelToAlice = calculateRelationshipToRoot(michaelA, aliceA, testPeople, testRelationships);
      const aliceToMichael = calculateRelationshipToRoot(aliceA, michaelA, testPeople, testRelationships);

      expect(davidToAlice).toBe('Ex-Husband');
      expect(aliceToDavid).toBe('Ex-Wife');
      expect(michaelToAlice).toBe('Unrelated'); // Ex-spouse's father should be unrelated
      expect(aliceToMichael).toBe('Unrelated'); // Ex-spouse's father should be unrelated
    });
  });
});
