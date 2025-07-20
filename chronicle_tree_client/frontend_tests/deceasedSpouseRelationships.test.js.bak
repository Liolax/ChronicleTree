import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

describe('Deceased Spouse Functionality Tests', () => {
  describe('Basic Deceased Spouse Relationships', () => {
    const testPeople = [
      { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
      { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
      { id: 'mary', first_name: 'Mary', last_name: 'Smith', gender: 'Female' },
      { id: 'alice', first_name: 'Alice', last_name: 'Doe', gender: 'Female' }
    ];

    const testRelationships = [
      // Jane is John's deceased spouse
      { source: 'john', target: 'jane', type: 'spouse', is_deceased: true },
      { source: 'jane', target: 'john', type: 'spouse', is_deceased: true },
      
      // Mary is John's current spouse (second marriage after Jane's death)
      { source: 'john', target: 'mary', type: 'spouse' },
      { source: 'mary', target: 'john', type: 'spouse' },
      
      // Alice is John and Jane's child
      { source: 'john', target: 'alice', type: 'parent' },
      { source: 'jane', target: 'alice', type: 'parent' }
    ];

    it('should identify deceased spouse with (deceased) marker from living spouse perspective', () => {
      const johnPerson = testPeople.find(p => p.id === 'john');
      const janePerson = testPeople.find(p => p.id === 'jane');
      
      const result = calculateRelationshipToRoot(janePerson, johnPerson, testPeople, testRelationships);
      expect(result).toBe('Wife (deceased)');
    });

    it('should identify living spouse from deceased spouse perspective', () => {
      const johnPerson = testPeople.find(p => p.id === 'john');
      const janePerson = testPeople.find(p => p.id === 'jane');
      
      const result = calculateRelationshipToRoot(johnPerson, janePerson, testPeople, testRelationships);
      expect(result).toBe('Husband (deceased)');
    });

    it('should allow new spouse after deceased spouse', () => {
      const johnPerson = testPeople.find(p => p.id === 'john');
      const maryPerson = testPeople.find(p => p.id === 'mary');
      
      const result = calculateRelationshipToRoot(maryPerson, johnPerson, testPeople, testRelationships);
      expect(result).toBe('Wife');
    });

    it('should correctly handle multiple spouses (current and deceased)', () => {
      const johnPerson = testPeople.find(p => p.id === 'john');
      const janePerson = testPeople.find(p => p.id === 'jane');
      const maryPerson = testPeople.find(p => p.id === 'mary');
      
      // John should see both Jane (deceased) and Mary (current)
      const janeResult = calculateRelationshipToRoot(janePerson, johnPerson, testPeople, testRelationships);
      const maryResult = calculateRelationshipToRoot(maryPerson, johnPerson, testPeople, testRelationships);
      
      expect(janeResult).toBe('Wife (deceased)');
      expect(maryResult).toBe('Wife');
    });

    it('should mark deceased spouse relatives as unrelated from current spouse perspective', () => {
      const janePerson = testPeople.find(p => p.id === 'jane');
      const maryPerson = testPeople.find(p => p.id === 'mary');
      
      // Mary should see Jane as unrelated (ex-spouse relative logic applies)
      const result = calculateRelationshipToRoot(janePerson, maryPerson, testPeople, testRelationships);
      expect(result).toBe('Unrelated');
    });

    it('should maintain parent-child relationships with deceased spouse', () => {
      const janePerson = testPeople.find(p => p.id === 'jane');
      const alicePerson = testPeople.find(p => p.id === 'alice');
      
      // Alice should still see Jane as Mother even though Jane is deceased
      const result = calculateRelationshipToRoot(janePerson, alicePerson, testPeople, testRelationships);
      expect(result).toBe('Mother');
    });

    it('should handle step-parent relationships correctly', () => {
      const maryPerson = testPeople.find(p => p.id === 'mary');
      const alicePerson = testPeople.find(p => p.id === 'alice');
      
      // Mary should see Alice as daughter-in-law (spouse's child)
      const result = calculateRelationshipToRoot(alicePerson, maryPerson, testPeople, testRelationships);
      expect(result).toBe('Daughter-in-law');
    });
  });

  describe('Gender-Specific Deceased Spouse Labels', () => {
    it('should show "Husband (deceased)" for male deceased spouse', () => {
      const testPeople = [
        { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
        { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' }
      ];
      
      const testRelationships = [
        { source: 'john', target: 'jane', type: 'spouse', is_deceased: true },
        { source: 'jane', target: 'john', type: 'spouse', is_deceased: true }
      ];
      
      const johnPerson = testPeople.find(p => p.id === 'john');
      const janePerson = testPeople.find(p => p.id === 'jane');
      
      const result = calculateRelationshipToRoot(johnPerson, janePerson, testPeople, testRelationships);
      expect(result).toBe('Husband (deceased)');
    });

    it('should show "Wife (deceased)" for female deceased spouse', () => {
      const testPeople = [
        { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
        { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' }
      ];
      
      const testRelationships = [
        { source: 'john', target: 'jane', type: 'spouse', is_deceased: true },
        { source: 'jane', target: 'john', type: 'spouse', is_deceased: true }
      ];
      
      const johnPerson = testPeople.find(p => p.id === 'john');
      const janePerson = testPeople.find(p => p.id === 'jane');
      
      const result = calculateRelationshipToRoot(janePerson, johnPerson, testPeople, testRelationships);
      expect(result).toBe('Wife (deceased)');
    });

    it('should show "Spouse (deceased)" for non-binary or unknown gender', () => {
      const testPeople = [
        { id: 'alex', first_name: 'Alex', last_name: 'Doe', gender: null },
        { id: 'taylor', first_name: 'Taylor', last_name: 'Doe', gender: 'Non-binary' }
      ];
      
      const testRelationships = [
        { source: 'alex', target: 'taylor', type: 'spouse', is_deceased: true },
        { source: 'taylor', target: 'alex', type: 'spouse', is_deceased: true }
      ];
      
      const alexPerson = testPeople.find(p => p.id === 'alex');
      const taylorPerson = testPeople.find(p => p.id === 'taylor');
      
      const result = calculateRelationshipToRoot(taylorPerson, alexPerson, testPeople, testRelationships);
      expect(result).toBe('Spouse (deceased)');
    });
  });

  describe('Complex Deceased Spouse Scenarios', () => {
    it('should handle multiple deceased spouses', () => {
      const testPeople = [
        { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
        { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
        { id: 'mary', first_name: 'Mary', last_name: 'Smith', gender: 'Female' },
        { id: 'sarah', first_name: 'Sarah', last_name: 'Johnson', gender: 'Female' }
      ];
      
      const testRelationships = [
        // Jane - first deceased spouse
        { source: 'john', target: 'jane', type: 'spouse', is_deceased: true },
        { source: 'jane', target: 'john', type: 'spouse', is_deceased: true },
        
        // Mary - second deceased spouse  
        { source: 'john', target: 'mary', type: 'spouse', is_deceased: true },
        { source: 'mary', target: 'john', type: 'spouse', is_deceased: true },
        
        // Sarah - current spouse
        { source: 'john', target: 'sarah', type: 'spouse' },
        { source: 'sarah', target: 'john', type: 'spouse' }
      ];
      
      const johnPerson = testPeople.find(p => p.id === 'john');
      const janePerson = testPeople.find(p => p.id === 'jane');
      const maryPerson = testPeople.find(p => p.id === 'mary');
      const sarahPerson = testPeople.find(p => p.id === 'sarah');
      
      // All should be correctly identified
      expect(calculateRelationshipToRoot(janePerson, johnPerson, testPeople, testRelationships)).toBe('Wife (deceased)');
      expect(calculateRelationshipToRoot(maryPerson, johnPerson, testPeople, testRelationships)).toBe('Wife (deceased)');
      expect(calculateRelationshipToRoot(sarahPerson, johnPerson, testPeople, testRelationships)).toBe('Wife');
    });
  });
});
