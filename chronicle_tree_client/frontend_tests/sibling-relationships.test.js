import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

describe('Sibling Relationships', () => {
  // Test data with legitimate siblings Alice and Charlie
  const allPeople = [
    { id: 'alice', first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 'charlie', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
    { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' }
  ];

  const relationships = [
    // Jane is parent to both Alice and Charlie (making them siblings)
    { person_a_id: 'jane', person_b_id: 'alice', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'charlie', relationship_type: 'Parent' }
  ];

  it('should identify legitimate sibling relationships correctly', () => {
    const alicePerson = allPeople.find(p => p.id === 'alice');
    const charliePerson = allPeople.find(p => p.id === 'charlie');
    
    const aliceToCharlie = calculateRelationshipToRoot(charliePerson, alicePerson, allPeople, relationships);
    const charlieToAlice = calculateRelationshipToRoot(alicePerson, charliePerson, allPeople, relationships);
    
    expect(aliceToCharlie).toBe('Brother');
    expect(charlieToAlice).toBe('Sister');
  });

  it('should identify parent-child relationships correctly', () => {
    const janePerson = allPeople.find(p => p.id === 'jane');
    const alicePerson = allPeople.find(p => p.id === 'alice');
    
    const janeToAlice = calculateRelationshipToRoot(alicePerson, janePerson, allPeople, relationships);
    const aliceToJane = calculateRelationshipToRoot(janePerson, alicePerson, allPeople, relationships);
    
    expect(janeToAlice).toBe('Daughter');
    expect(aliceToJane).toBe('Mother');
  });
});

describe('Cross-Generational Protection', () => {
  // Test cross-generational data to ensure the fix holds
  const allPeople = [
    { id: 'molly', first_name: 'Molly', last_name: 'M', gender: 'Female' },
    { id: 'alice', first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 'charlie', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
    { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' }
  ];

  const relationships = [
    // Correct generational relationships
    { person_a_id: 'molly', person_b_id: 'jane', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'alice', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'charlie', relationship_type: 'Parent' },
    // Bad data: cross-generational "sibling" relationship (should be ignored)
    { person_a_id: 'molly', person_b_id: 'alice', relationship_type: 'Sibling' },
    { person_a_id: 'alice', person_b_id: 'molly', relationship_type: 'Sibling' }
  ];

  it('should correctly identify grandmother relationship despite bad sibling data', () => {
    const mollyPerson = allPeople.find(p => p.id === 'molly');
    const alicePerson = allPeople.find(p => p.id === 'alice');
    
    const mollyToAlice = calculateRelationshipToRoot(alicePerson, mollyPerson, allPeople, relationships);
    const aliceToMolly = calculateRelationshipToRoot(mollyPerson, alicePerson, allPeople, relationships);
    
    // Should show correct grandmother relationship, not sister
    expect(mollyToAlice).toBe('Granddaughter');
    expect(aliceToMolly).toBe('Grandmother');
  });

  it('should still identify legitimate siblings in presence of bad data', () => {
    const alicePerson = allPeople.find(p => p.id === 'alice');
    const charliePerson = allPeople.find(p => p.id === 'charlie');
    
    const aliceToCharlie = calculateRelationshipToRoot(charliePerson, alicePerson, allPeople, relationships);
    const charlieToAlice = calculateRelationshipToRoot(alicePerson, charliePerson, allPeople, relationships);
    
    expect(aliceToCharlie).toBe('Brother');
    expect(charlieToAlice).toBe('Sister');
  });

  it('should handle three-generation relationships correctly', () => {
    const mollyPerson = allPeople.find(p => p.id === 'molly');
    const charliePerson = allPeople.find(p => p.id === 'charlie');
    
    const mollyToCharlie = calculateRelationshipToRoot(charliePerson, mollyPerson, allPeople, relationships);
    const charlieToMolly = calculateRelationshipToRoot(mollyPerson, charliePerson, allPeople, relationships);
    
    expect(mollyToCharlie).toBe('Grandson');
    expect(charlieToMolly).toBe('Grandmother');
  });
});
