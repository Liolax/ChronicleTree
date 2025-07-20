import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

describe('Timeline Validation for Relationships', () => {
  describe('Non-overlapping lifespans should result in Unrelated', () => {
    const testPeople = [
      { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false, date_of_birth: '1970-01-01' },
      { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true, date_of_birth: '1972-01-01', date_of_death: '2022-01-01' },
      { id: '6', first_name: 'Michael', last_name: 'Doe', gender: 'Male', is_deceased: false, date_of_birth: '2024-08-15' }
    ];

    const testRelationships = [
      // John-Jane marriage (Jane deceased)
      { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true },
      { source: '2', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: true },
      
      // John is Michael's parent (Michael born after Jane's death)
      { source: '1', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },
      { source: '6', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false }
    ];

    it('should show "Unrelated" when person born after root died', () => {
      const janePerson = testPeople.find(p => p.id === '2'); // Jane died 2022
      const michaelPerson = testPeople.find(p => p.id === '6'); // Michael born 2024
      
      // Michael born after Jane died - should be Unrelated
      const result = calculateRelationshipToRoot(michaelPerson, janePerson, testPeople, testRelationships);
      expect(result).toBe('Unrelated');
    });

    it('should show "Unrelated" when root born after person died', () => {
      const janePerson = testPeople.find(p => p.id === '2'); // Jane died 2022
      const michaelPerson = testPeople.find(p => p.id === '6'); // Michael born 2024
      
      // Jane died before Michael born - should be Unrelated
      const result = calculateRelationshipToRoot(janePerson, michaelPerson, testPeople, testRelationships);
      expect(result).toBe('Unrelated');
    });

    it('should still allow valid relationships for overlapping lifespans', () => {
      const johnPerson = testPeople.find(p => p.id === '1');
      const michaelPerson = testPeople.find(p => p.id === '6');
      
      // John and Michael both alive - valid parent-child relationship
      const result = calculateRelationshipToRoot(michaelPerson, johnPerson, testPeople, testRelationships);
      expect(result).toBe('Son');
    });
  });

  describe('Real-world scenario: Step-relationships with deceased people', () => {
    it('should prevent step-relationships when step-parent died before child was born', () => {
      const testPeople = [
        { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01' },
        { id: 'jane', first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01' },
        { id: 'lisa', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1975-01-01' },
        { id: 'michael', first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15' }
      ];

      const testRelationships = [
        // John was married to Jane (deceased)
        { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false, is_deceased: true },
        { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false, is_deceased: true },
        
        // John now married to Lisa
        { source: 'john', target: 'lisa', relationship_type: 'spouse', is_ex: false, is_deceased: false },
        { source: 'lisa', target: 'john', relationship_type: 'spouse', is_ex: false, is_deceased: false },
        
        // Michael is John and Lisa's child (born 2024, after Jane's death in 2022)
        { source: 'john', target: 'michael', relationship_type: 'child', is_ex: false, is_deceased: false },
        { source: 'michael', target: 'john', relationship_type: 'parent', is_ex: false, is_deceased: false },
        { source: 'lisa', target: 'michael', relationship_type: 'child', is_ex: false, is_deceased: false },
        { source: 'michael', target: 'lisa', relationship_type: 'parent', is_ex: false, is_deceased: false }
      ];

      const janePerson = testPeople.find(p => p.id === 'jane');
      const michaelPerson = testPeople.find(p => p.id === 'michael');

      // Jane should NOT be Michael's step-mother because she died before he was born
      const michaelToJane = calculateRelationshipToRoot(michaelPerson, janePerson, testPeople, testRelationships);
      const janeToMichael = calculateRelationshipToRoot(janePerson, michaelPerson, testPeople, testRelationships);

      expect(michaelToJane).toBe('Unrelated');
      expect(janeToMichael).toBe('Unrelated');
    });
  });

  describe('Edge cases for timeline validation', () => {
    it('should handle missing birth/death dates gracefully', () => {
      const testPeople = [
        { id: '1', first_name: 'Person1', gender: 'Male' }, // No dates
        { id: '2', first_name: 'Person2', gender: 'Female' } // No dates
      ];

      const testRelationships = [
        { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: false }
      ];

      const person1 = testPeople.find(p => p.id === '1');
      const person2 = testPeople.find(p => p.id === '2');

      // Should process normally when dates are missing
      const result = calculateRelationshipToRoot(person2, person1, testPeople, testRelationships);
      expect(result).toBe('Wife'); // Normal relationship calculation
    });

    it('should allow relationships for people who were alive at the same time', () => {
      const testPeople = [
        { id: '1', first_name: 'Alice', gender: 'Female', date_of_birth: '1950-01-01', date_of_death: '2020-01-01' },
        { id: '2', first_name: 'Bob', gender: 'Male', date_of_birth: '1945-01-01', date_of_death: '2015-01-01' }
      ];

      const testRelationships = [
        { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true }
      ];

      const alice = testPeople.find(p => p.id === '1');
      const bob = testPeople.find(p => p.id === '2');

      // Both were alive 1950-2015, so relationship should work
      const result = calculateRelationshipToRoot(alice, bob, testPeople, testRelationships);
      expect(result).toBe('Wife');
    });
  });
});
