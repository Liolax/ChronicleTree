import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../utils/improvedRelationshipCalculator';

describe('Sibling Relationship Gender Tests', () => {
  const testPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female' },
    { id: 3, first_name: 'Charlie', last_name: 'Doe', gender: 'Male' },
    { id: 4, first_name: 'Alice', last_name: 'Doe', gender: 'Female' },
    { id: 5, first_name: 'Bob', last_name: 'Doe', gender: null }, // No gender
    { id: 6, first_name: 'Parent1', last_name: 'Doe', gender: 'Male' },
    { id: 7, first_name: 'Parent2', last_name: 'Doe', gender: 'Female' },
    { id: 8, first_name: 'Uncle', last_name: 'Doe', gender: 'Male' },
    { id: 9, first_name: 'Aunt', last_name: 'Smith', gender: 'Female' },
    { id: 10, first_name: 'Sibling3', last_name: 'Doe', gender: null }, // No gender
    { id: 11, first_name: 'Cousin1', last_name: 'Doe', gender: 'Male' },
    { id: 12, first_name: 'Cousin2', last_name: 'Doe', gender: 'Female' },
    { id: 13, first_name: 'Cousin3', last_name: 'Doe', gender: null }, // No gender
  ];

  const testRelationships = [
    // Parent-child relationships
    { source: 6, target: 1, type: 'parent' }, // Parent1 -> John
    { source: 7, target: 1, type: 'parent' }, // Parent2 -> John
    { source: 6, target: 3, type: 'parent' }, // Parent1 -> Charlie
    { source: 7, target: 3, type: 'parent' }, // Parent2 -> Charlie
    { source: 6, target: 4, type: 'parent' }, // Parent1 -> Alice
    { source: 7, target: 4, type: 'parent' }, // Parent2 -> Alice
    { source: 6, target: 5, type: 'parent' }, // Parent1 -> Bob (no gender)
    { source: 7, target: 5, type: 'parent' }, // Parent2 -> Bob (no gender)
    { source: 6, target: 10, type: 'parent' }, // Parent1 -> Sibling3 (no gender)
    { source: 7, target: 10, type: 'parent' }, // Parent2 -> Sibling3 (no gender)
    
    // Sibling relationships
    { source: 1, target: 3, type: 'sibling' }, // John <-> Charlie
    { source: 3, target: 1, type: 'sibling' },
    { source: 1, target: 4, type: 'sibling' }, // John <-> Alice
    { source: 4, target: 1, type: 'sibling' },
    { source: 1, target: 5, type: 'sibling' }, // John <-> Bob (no gender)
    { source: 5, target: 1, type: 'sibling' },
    { source: 1, target: 10, type: 'sibling' }, // John <-> Sibling3 (no gender)
    { source: 10, target: 1, type: 'sibling' },
    
    // Uncle/Aunt relationships - Uncle/Aunt are siblings of Parent1
    { source: 6, target: 8, type: 'sibling' }, // Parent1 <-> Uncle
    { source: 8, target: 6, type: 'sibling' },
    { source: 6, target: 9, type: 'sibling' }, // Parent1 <-> Aunt
    { source: 9, target: 6, type: 'sibling' },
    
    // Cousin relationships - Cousins are children of Uncle/Aunt
    { source: 8, target: 11, type: 'parent' }, // Uncle -> Cousin1
    { source: 8, target: 12, type: 'parent' }, // Uncle -> Cousin2
    { source: 9, target: 13, type: 'parent' }, // Aunt -> Cousin3 (no gender)
  ];

  describe('Sibling Relationships with Gender', () => {
    it('should identify male sibling as Brother', () => {
      const result = calculateRelationshipToRoot(testPeople[2], testPeople[0], testPeople, testRelationships); // Charlie to John
      expect(result).toBe('Brother');
    });

    it('should identify female sibling as Sister', () => {
      const result = calculateRelationshipToRoot(testPeople[3], testPeople[0], testPeople, testRelationships); // Alice to John
      expect(result).toBe('Sister');
    });

    it('should identify sibling without gender as Sibling', () => {
      const result = calculateRelationshipToRoot(testPeople[4], testPeople[0], testPeople, testRelationships); // Bob to John
      // According to problem statement, if no gender, should be "sibling"
      expect(result).toBe('Sibling');
    });

    it('should identify another sibling without gender as Sibling', () => {
      const result = calculateRelationshipToRoot(testPeople[9], testPeople[0], testPeople, testRelationships); // Sibling3 to John
      expect(result).toBe('Sibling');
    });
  });

  describe('Uncle/Aunt Relationships with Gender', () => {
    it('should identify male uncle as Uncle', () => {
      const result = calculateRelationshipToRoot(testPeople[7], testPeople[0], testPeople, testRelationships); // Uncle to John
      expect(result).toBe('Uncle');
    });

    it('should identify female aunt as Aunt', () => {
      const result = calculateRelationshipToRoot(testPeople[8], testPeople[0], testPeople, testRelationships); // Aunt to John
      expect(result).toBe('Aunt');
    });
  });

  describe('Cousin Relationships with Gender', () => {
    it('should identify male cousin as Cousin (gender neutral)', () => {
      const result = calculateRelationshipToRoot(testPeople[10], testPeople[0], testPeople, testRelationships); // Cousin1 to John
      expect(result).toBe('Cousin');
    });

    it('should identify female cousin as Cousin (gender neutral)', () => {
      const result = calculateRelationshipToRoot(testPeople[11], testPeople[0], testPeople, testRelationships); // Cousin2 to John
      expect(result).toBe('Cousin');
    });

    it('should identify cousin without gender as Cousin', () => {
      const result = calculateRelationshipToRoot(testPeople[12], testPeople[0], testPeople, testRelationships); // Cousin3 to John
      expect(result).toBe('Cousin');
    });
  });
});