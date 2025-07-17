import { describe, it, expect } from 'vitest';
import { getAllRelationshipsToRoot } from '../utils/improvedRelationshipCalculator';

describe('Integration Test - Seed Data Relationships', () => {
  // Test data matching the actual seed data structure
  const seedPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1982-01-01' },
    { id: 3, first_name: 'Alice', last_name: 'A', gender: 'Female', date_of_birth: '1990-01-01' },
    { id: 4, first_name: 'David', last_name: 'A', gender: 'Male', date_of_birth: '1988-01-01' },
    { id: 5, first_name: 'Bob', last_name: 'B', gender: 'Male', date_of_birth: '2010-01-01' },
    { id: 6, first_name: 'Emily', last_name: 'E', gender: 'Female', date_of_birth: '2012-01-01' },
    { id: 7, first_name: 'Charlie', last_name: 'C', gender: 'Male', date_of_birth: '2014-01-01' }
  ];

  const seedRelationships = [
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

  it('should identify John Doe as the oldest person (default root)', () => {
    const oldest = seedPeople.reduce((oldest, person) => 
      new Date(person.date_of_birth) < new Date(oldest.date_of_birth) ? person : oldest
    );
    expect(oldest.first_name).toBe('John');
    expect(oldest.last_name).toBe('Doe');
  });

  it('should correctly identify all relationships with John as root', () => {
    const john = seedPeople.find(p => p.first_name === 'John');
    const results = getAllRelationshipsToRoot(john, seedPeople, seedRelationships);
    
    const relationshipMap = results.reduce((acc, person) => {
      acc[person.first_name] = person.relation;
      return acc;
    }, {});

    expect(relationshipMap['John']).toBe('Root');
    expect(relationshipMap['Jane']).toBe('Wife');
    expect(relationshipMap['Alice']).toBe('Daughter');
    expect(relationshipMap['Charlie']).toBe('Son');
    expect(relationshipMap['David']).toBe('Ex-Son-in-law'); // Alice's ex-husband
    expect(relationshipMap['Bob']).toBe('Grandson');
    expect(relationshipMap['Emily']).toBe('Granddaughter');
  });

  it('should correctly identify all relationships with Charlie as root (problem scenario)', () => {
    const charlie = seedPeople.find(p => p.first_name === 'Charlie');
    const results = getAllRelationshipsToRoot(charlie, seedPeople, seedRelationships);
    
    const relationshipMap = results.reduce((acc, person) => {
      acc[person.first_name] = person.relation;
      return acc;
    }, {});

    // These were the specific issues mentioned in the problem statement
    expect(relationshipMap['Charlie']).toBe('Root');
    expect(relationshipMap['Alice']).toBe('Sister'); // Was "Grandparent", now correct
    expect(relationshipMap['David']).toBe('Ex-Brother-in-law'); // Was "Spouse", now correct
    expect(relationshipMap['Bob']).toBe('Nephew'); // Was not identified, now correct
    expect(relationshipMap['Emily']).toBe('Niece'); // Was not identified, now correct
    expect(relationshipMap['John']).toBe('Father');
    expect(relationshipMap['Jane']).toBe('Mother');
  });

  it('should correctly identify all relationships with Alice as root', () => {
    const alice = seedPeople.find(p => p.first_name === 'Alice');
    const results = getAllRelationshipsToRoot(alice, seedPeople, seedRelationships);
    
    const relationshipMap = results.reduce((acc, person) => {
      acc[person.first_name] = person.relation;
      return acc;
    }, {});

    expect(relationshipMap['Alice']).toBe('Root');
    expect(relationshipMap['John']).toBe('Father');
    expect(relationshipMap['Jane']).toBe('Mother');
    expect(relationshipMap['David']).toBe('Ex-Husband');
    expect(relationshipMap['Charlie']).toBe('Brother');
    expect(relationshipMap['Bob']).toBe('Son');
    expect(relationshipMap['Emily']).toBe('Daughter');
  });

  it('should correctly identify all relationships with David as root', () => {
    const david = seedPeople.find(p => p.first_name === 'David');
    const results = getAllRelationshipsToRoot(david, seedPeople, seedRelationships);
    
    const relationshipMap = results.reduce((acc, person) => {
      acc[person.first_name] = person.relation;
      return acc;
    }, {});

    expect(relationshipMap['David']).toBe('Root');
    expect(relationshipMap['Alice']).toBe('Ex-Wife');
    expect(relationshipMap['Bob']).toBe('Son');
    expect(relationshipMap['Emily']).toBe('Daughter');
    // According to problem statement: "relatives of spouse (because after divorce they are not official yet) are not showing"
    // John and Jane (Alice's parents) should NOT be shown as ex-in-laws to David
    expect(relationshipMap['John']).toBe('Unrelated');
    expect(relationshipMap['Jane']).toBe('Unrelated');
    // Charlie (Alice's brother) should NOT be shown as ex-brother-in-law to David
    expect(relationshipMap['Charlie']).toBe('Unrelated');
  });

  it('should handle all relationship types correctly', () => {
    // Test various relationship types with different root persons
    const testCases = [
      // Test parent/child relationships
      { root: 'John', person: 'Alice', expected: 'Daughter' },
      { root: 'Alice', person: 'John', expected: 'Father' },
      
      // Test spouse relationships
      { root: 'John', person: 'Jane', expected: 'Wife' },
      { root: 'Alice', person: 'David', expected: 'Ex-Husband' },
      
      // Test sibling relationships
      { root: 'Alice', person: 'Charlie', expected: 'Brother' },
      { root: 'Bob', person: 'Emily', expected: 'Sister' },
      
      // Test grandparent/grandchild relationships
      { root: 'John', person: 'Bob', expected: 'Grandson' },
      { root: 'Bob', person: 'John', expected: 'Grandfather' },
      
      // Test in-law relationships
      { root: 'Charlie', person: 'David', expected: 'Ex-Brother-in-law' },
      // According to problem statement: "relatives of spouse (because after divorce they are not official yet) are not showing"
      // When viewing David's relationships, Charlie (ex-spouse's sibling) should NOT be shown as ex-brother-in-law
      { root: 'David', person: 'Charlie', expected: 'Unrelated' },
      
      // Test nephew/niece relationships
      { root: 'Charlie', person: 'Bob', expected: 'Nephew' },
      { root: 'Charlie', person: 'Emily', expected: 'Niece' },
      { root: 'Bob', person: 'Charlie', expected: 'Uncle' },
      { root: 'Emily', person: 'Charlie', expected: 'Uncle' }
    ];

    testCases.forEach(({ root, person, expected }) => {
      const rootPerson = seedPeople.find(p => p.first_name === root);
      const testPerson = seedPeople.find(p => p.first_name === person);
      const results = getAllRelationshipsToRoot(rootPerson, seedPeople, seedRelationships);
      const relationshipMap = results.reduce((acc, p) => {
        acc[p.first_name] = p.relation;
        return acc;
      }, {});
      
      expect(relationshipMap[person]).toBe(expected);
    });
  });
});