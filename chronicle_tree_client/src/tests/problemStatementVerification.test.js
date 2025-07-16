import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot, getAllRelationshipsToRoot } from '../utils/improvedRelationshipCalculator';

describe('Problem Statement Verification Tests', () => {
  // Test data matching the exact seed data structure
  const testPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1982-01-01' },
    { id: 3, first_name: 'Alice', last_name: 'A', gender: 'Female', date_of_birth: '1990-01-01' },
    { id: 4, first_name: 'David', last_name: 'A', gender: 'Male', date_of_birth: '1988-01-01' },
    { id: 5, first_name: 'Bob', last_name: 'B', gender: 'Male', date_of_birth: '2010-01-01' },
    { id: 6, first_name: 'Emily', last_name: 'E', gender: 'Female', date_of_birth: '2012-01-01' },
    { id: 7, first_name: 'Charlie', last_name: 'C', gender: 'Male', date_of_birth: '2014-01-01' }
  ];

  const testRelationships = [
    // Parent-child relationships
    { source: 1, target: 3, type: 'parent' }, // John -> Alice
    { source: 2, target: 3, type: 'parent' }, // Jane -> Alice
    { source: 1, target: 7, type: 'parent' }, // John -> Charlie
    { source: 2, target: 7, type: 'parent' }, // Jane -> Charlie
    { source: 3, target: 5, type: 'parent' }, // Alice -> Bob
    { source: 4, target: 5, type: 'parent' }, // David -> Bob
    { source: 3, target: 6, type: 'parent' }, // Alice -> Emily
    { source: 4, target: 6, type: 'parent' }, // David -> Emily
    
    // Spouse relationships
    { source: 1, target: 2, type: 'spouse', is_ex: false }, // John <-> Jane
    { source: 2, target: 1, type: 'spouse', is_ex: false },
    { source: 3, target: 4, type: 'spouse', is_ex: true }, // Alice <-> David (ex)
    { source: 4, target: 3, type: 'spouse', is_ex: true },
    
    // Sibling relationships
    { source: 3, target: 7, type: 'sibling' }, // Alice <-> Charlie
    { source: 7, target: 3, type: 'sibling' },
    { source: 5, target: 6, type: 'sibling' }, // Bob <-> Emily
    { source: 6, target: 5, type: 'sibling' }
  ];

  describe('Requirement 1: Default Root Person', () => {
    it('should identify John Doe as the oldest person for default root', () => {
      const oldestPerson = testPeople
        .filter(p => p.date_of_birth)
        .sort((a, b) => new Date(a.date_of_birth) - new Date(b.date_of_birth))[0];
      
      expect(oldestPerson.first_name).toBe('John');
      expect(oldestPerson.last_name).toBe('Doe');
      expect(oldestPerson.date_of_birth).toBe('1980-01-01');
    });
  });

  describe('Requirement 2: When John Doe is root', () => {
    const john = testPeople[0];
    const bob = testPeople[4];
    const emily = testPeople[5];
    const david = testPeople[3];

    it('should identify Bob B as Grandchild, not Same Generation', () => {
      const result = calculateRelationshipToRoot(bob, john, testPeople, testRelationships);
      expect(result).toBe('Grandson');
      expect(result).not.toBe('Same Generation');
    });

    it('should identify Emily E as Grandchild, not Same Generation', () => {
      const result = calculateRelationshipToRoot(emily, john, testPeople, testRelationships);
      expect(result).toBe('Granddaughter');
      expect(result).not.toBe('Same Generation');
    });

    it('should identify David A as Son-in-law, not Child', () => {
      const result = calculateRelationshipToRoot(david, john, testPeople, testRelationships);
      expect(result).toBe('Son-in-law');
      expect(result).not.toBe('Child');
    });
  });

  describe('Requirement 3: When Emily E is root', () => {
    const emily = testPeople[5];
    const bob = testPeople[4];
    const charlie = testPeople[6];

    it('should identify Bob B as Sibling (Brother), not Grandparent', () => {
      const result = calculateRelationshipToRoot(bob, emily, testPeople, testRelationships);
      expect(result).toBe('Brother');
      expect(result).not.toBe('Grandparent');
    });

    it('should identify Charlie C as Uncle, not 3 generations up', () => {
      const result = calculateRelationshipToRoot(charlie, emily, testPeople, testRelationships);
      expect(result).toBe('Uncle');
      expect(result).not.toBe('3 generations up');
    });
  });

  describe('Requirement 4: When Alice A is root', () => {
    const alice = testPeople[2];
    const charlie = testPeople[6];

    it('should identify Charlie C as Sibling (Brother), not Grandparent', () => {
      const result = calculateRelationshipToRoot(charlie, alice, testPeople, testRelationships);
      expect(result).toBe('Brother');
      expect(result).not.toBe('Grandparent');
    });
  });

  describe('Comprehensive Relationship Model', () => {
    it('should correctly model direct relationships', () => {
      const john = testPeople[0];
      const jane = testPeople[1];
      const alice = testPeople[2];
      
      expect(calculateRelationshipToRoot(jane, john, testPeople, testRelationships)).toBe('Wife');
      expect(calculateRelationshipToRoot(alice, john, testPeople, testRelationships)).toBe('Daughter');
      expect(calculateRelationshipToRoot(john, alice, testPeople, testRelationships)).toBe('Father');
    });

    it('should correctly model collateral relationships', () => {
      const alice = testPeople[2];
      const charlie = testPeople[6];
      const bob = testPeople[4];
      const emily = testPeople[5];
      
      expect(calculateRelationshipToRoot(charlie, alice, testPeople, testRelationships)).toBe('Brother');
      expect(calculateRelationshipToRoot(emily, bob, testPeople, testRelationships)).toBe('Sister');
    });

    it('should correctly model in-law relationships', () => {
      const john = testPeople[0];
      const david = testPeople[3];
      const alice = testPeople[2];
      
      expect(calculateRelationshipToRoot(david, john, testPeople, testRelationships)).toBe('Son-in-law');
      expect(calculateRelationshipToRoot(david, alice, testPeople, testRelationships)).toBe('Ex-Husband');
    });

    it('should correctly model generational relationships', () => {
      const john = testPeople[0];
      const bob = testPeople[4];
      const emily = testPeople[5];
      
      expect(calculateRelationshipToRoot(bob, john, testPeople, testRelationships)).toBe('Grandson');
      expect(calculateRelationshipToRoot(emily, john, testPeople, testRelationships)).toBe('Granddaughter');
      expect(calculateRelationshipToRoot(john, bob, testPeople, testRelationships)).toBe('Grandfather');
    });
  });

  describe('Edge Cases and Complex Relationships', () => {
    it('should handle uncle/aunt relationships correctly', () => {
      const charlie = testPeople[6];
      const bob = testPeople[4];
      const emily = testPeople[5];
      
      // Charlie is uncle to Bob and Emily (Alice's children)
      expect(calculateRelationshipToRoot(charlie, bob, testPeople, testRelationships)).toBe('Uncle');
      expect(calculateRelationshipToRoot(charlie, emily, testPeople, testRelationships)).toBe('Uncle');
    });

    it('should handle nephew/niece relationships correctly', () => {
      const alice = testPeople[2];
      const bob = testPeople[4];
      const emily = testPeople[5];
      
      // Bob and Emily are nephew and niece to Charlie
      expect(calculateRelationshipToRoot(bob, alice, testPeople, testRelationships)).toBe('Son');
      expect(calculateRelationshipToRoot(emily, alice, testPeople, testRelationships)).toBe('Daughter');
    });

    it('should correctly identify the root person', () => {
      const john = testPeople[0];
      
      expect(calculateRelationshipToRoot(john, john, testPeople, testRelationships)).toBe('Root');
    });
  });
});