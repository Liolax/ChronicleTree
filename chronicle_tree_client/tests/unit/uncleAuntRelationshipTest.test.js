import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator';

describe('Uncle/Aunt Relationship Gender Tests', () => {
  const testPeople = [
    { id: 1, first_name: 'Nephew', last_name: 'Test', gender: 'Male' },
    { id: 2, first_name: 'Parent', last_name: 'Test', gender: 'Male' },
    { id: 3, first_name: 'Uncle', last_name: 'Test', gender: 'Male' },
    { id: 4, first_name: 'Aunt', last_name: 'Test', gender: 'Female' },
    { id: 5, first_name: 'UncleAunt', last_name: 'Test', gender: null }, // No gender
    { id: 6, first_name: 'UncleAunt2', last_name: 'Test', gender: '' }, // Empty gender
    { id: 7, first_name: 'UncleAunt3', last_name: 'Test' }, // No gender field
  ];

  const testRelationships = [
    // Parent-child relationships
    { source: 2, target: 1, type: 'parent' }, // Parent -> Nephew
    
    // Uncle/Aunt relationships - they are siblings of Parent
    { source: 2, target: 3, type: 'sibling' }, // Parent <-> Uncle
    { source: 3, target: 2, type: 'sibling' },
    { source: 2, target: 4, type: 'sibling' }, // Parent <-> Aunt
    { source: 4, target: 2, type: 'sibling' },
    { source: 2, target: 5, type: 'sibling' }, // Parent <-> UncleAunt (no gender)
    { source: 5, target: 2, type: 'sibling' },
    { source: 2, target: 6, type: 'sibling' }, // Parent <-> UncleAunt2 (empty gender)
    { source: 6, target: 2, type: 'sibling' },
    { source: 2, target: 7, type: 'sibling' }, // Parent <-> UncleAunt3 (no gender field)
    { source: 7, target: 2, type: 'sibling' },
  ];

  describe('Uncle/Aunt Relationships with Gender', () => {
    it('should identify male uncle as Uncle', () => {
      const result = calculateRelationshipToRoot(testPeople[2], testPeople[0], testPeople, testRelationships); // Uncle to Nephew
      expect(result).toBe('Uncle');
    });

    it('should identify female aunt as Aunt', () => {
      const result = calculateRelationshipToRoot(testPeople[3], testPeople[0], testPeople, testRelationships); // Aunt to Nephew
      expect(result).toBe('Aunt');
    });

    it('should identify uncle/aunt without gender as neutral term', () => {
      const result = calculateRelationshipToRoot(testPeople[4], testPeople[0], testPeople, testRelationships); // UncleAunt to Nephew
      // Based on problem statement, should use neutral term for uncle/aunt when no gender
      expect(result).toBe('Parent\'s sibling');
    });

    it('should identify uncle/aunt with empty gender as neutral term', () => {
      const result = calculateRelationshipToRoot(testPeople[5], testPeople[0], testPeople, testRelationships); // UncleAunt2 to Nephew
      expect(result).toBe('Parent\'s sibling');
    });

    it('should identify uncle/aunt with missing gender field as neutral term', () => {
      const result = calculateRelationshipToRoot(testPeople[6], testPeople[0], testPeople, testRelationships); // UncleAunt3 to Nephew
      expect(result).toBe('Parent\'s sibling');
    });
  });
});