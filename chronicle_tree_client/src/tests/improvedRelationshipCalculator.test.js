import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot, getAllRelationshipsToRoot } from '../utils/improvedRelationshipCalculator';

describe('Improved Relationship Calculator', () => {
  // Test data matching the seed data structure
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

  it('should identify root person correctly', () => {
    const john = testPeople[0];
    const result = calculateRelationshipToRoot(john, john, testPeople, testRelationships);
    expect(result).toBe('Root');
  });

  it('should identify direct parent relationship', () => {
    const john = testPeople[0];
    const alice = testPeople[2];
    const result = calculateRelationshipToRoot(john, alice, testPeople, testRelationships);
    expect(result).toBe('Father');
  });

  it('should identify direct child relationship', () => {
    const alice = testPeople[2];
    const john = testPeople[0];
    const result = calculateRelationshipToRoot(alice, john, testPeople, testRelationships);
    expect(result).toBe('Daughter');
  });

  it('should identify spouse relationship', () => {
    const john = testPeople[0];
    const jane = testPeople[1];
    const result = calculateRelationshipToRoot(jane, john, testPeople, testRelationships);
    expect(result).toBe('Wife');
  });

  it('should identify sibling relationship', () => {
    const alice = testPeople[2];
    const charlie = testPeople[6];
    const result = calculateRelationshipToRoot(alice, charlie, testPeople, testRelationships);
    expect(result).toBe('Sister');
  });

  it('should identify brother-in-law relationship (Charlie root, David person)', () => {
    const david = testPeople[3];
    const charlie = testPeople[6];
    const result = calculateRelationshipToRoot(david, charlie, testPeople, testRelationships);
    expect(result).toBe('Ex-Brother-in-law');
  });

  it('should identify nephew relationship (Charlie root, Bob person)', () => {
    const bob = testPeople[4];
    const charlie = testPeople[6];
    const result = calculateRelationshipToRoot(bob, charlie, testPeople, testRelationships);
    expect(result).toBe('Nephew');
  });

  it('should identify niece relationship (Charlie root, Emily person)', () => {
    const emily = testPeople[5];
    const charlie = testPeople[6];
    const result = calculateRelationshipToRoot(emily, charlie, testPeople, testRelationships);
    expect(result).toBe('Niece');
  });

  it('should identify grandchild relationship', () => {
    const bob = testPeople[4];
    const john = testPeople[0];
    const result = calculateRelationshipToRoot(bob, john, testPeople, testRelationships);
    expect(result).toBe('Grandson');
  });

  it('should identify ex-spouse relationship', () => {
    const alice = testPeople[2];
    const david = testPeople[3];
    const result = calculateRelationshipToRoot(david, alice, testPeople, testRelationships);
    expect(result).toBe('Ex-Husband');
  });

  it('should process all relationships correctly with Charlie as root', () => {
    const charlie = testPeople[6];
    const results = getAllRelationshipsToRoot(charlie, testPeople, testRelationships);
    
    const resultMap = results.reduce((acc, person) => {
      acc[person.first_name] = person.relation;
      return acc;
    }, {});

    expect(resultMap['Charlie']).toBe('Root');
    expect(resultMap['Alice']).toBe('Sister');
    expect(resultMap['David']).toBe('Ex-Brother-in-law');
    expect(resultMap['Bob']).toBe('Nephew');
    expect(resultMap['Emily']).toBe('Niece');
    expect(resultMap['John']).toBe('Father');
    expect(resultMap['Jane']).toBe('Mother');
  });
});