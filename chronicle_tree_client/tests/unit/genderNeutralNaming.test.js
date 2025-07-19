import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator';

describe('Gender-specific and neutral naming tests', () => {
  const testPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
    { id: 3, first_name: 'Alex', last_name: 'A' }, // No gender specified
    { id: 4, first_name: 'Sam', last_name: 'B' }, // No gender specified
    { id: 5, first_name: 'Chris', last_name: 'C' }, // No gender specified
  ];

  const testRelationships = [
    { from: 1, to: 3, type: 'parent' }, // John -> Alex
    { from: 2, to: 3, type: 'parent' }, // Jane -> Alex
    { from: 1, to: 2, type: 'spouse', is_ex: false }, // John <-> Jane
    { from: 2, to: 1, type: 'spouse', is_ex: false },
    { from: 3, to: 4, type: 'spouse', is_ex: true }, // Alex <-> Sam (ex)
    { from: 4, to: 3, type: 'spouse', is_ex: true },
    { from: 3, to: 5, type: 'sibling' }, // Alex <-> Chris
    { from: 5, to: 3, type: 'sibling' },
  ];

  it('should use gender-specific terms when gender is defined', () => {
    // John is male, should be Father
    expect(calculateRelationshipToRoot(testPeople[0], testPeople[2], testPeople, testRelationships)).toBe('Father');
    
    // Jane is female, should be Mother
    expect(calculateRelationshipToRoot(testPeople[1], testPeople[2], testPeople, testRelationships)).toBe('Mother');
    
    // Alex (child) has no gender, should be Child
    expect(calculateRelationshipToRoot(testPeople[2], testPeople[0], testPeople, testRelationships)).toBe('Child');
  });

  it('should use neutral terms when gender is not defined', () => {
    // Alex has no gender, should be Ex-Spouse
    expect(calculateRelationshipToRoot(testPeople[2], testPeople[3], testPeople, testRelationships)).toBe('Ex-Spouse');
    
    // Sam has no gender, should be Ex-Spouse
    expect(calculateRelationshipToRoot(testPeople[3], testPeople[2], testPeople, testRelationships)).toBe('Ex-Spouse');
    
    // Chris has no gender, should be Sibling
    expect(calculateRelationshipToRoot(testPeople[4], testPeople[2], testPeople, testRelationships)).toBe('Sibling');
  });

  it('should handle ex-spouse relatives as unrelated', () => {
    // Sam (no gender) is ex-spouse of Alex, so Sam should be unrelated to John (ex-spouse relatives are unrelated)
    expect(calculateRelationshipToRoot(testPeople[3], testPeople[0], testPeople, testRelationships)).toBe('Unrelated');
  });

  it('should handle uncle/aunt relationships with neutral terms', () => {
    // Add a child to Chris to test uncle/aunt relationships
    const moreTestPeople = [
      ...testPeople,
      { id: 6, first_name: 'River', last_name: 'D' }, // No gender specified
    ];

    const moreTestRelationships = [
      ...testRelationships,
      { from: 5, to: 6, type: 'parent' }, // Chris -> River
    ];

    // Alex should be River's parent's sibling (uncle/aunt), but neutral should be "Parent's sibling"
    expect(calculateRelationshipToRoot(moreTestPeople[2], moreTestPeople[5], moreTestPeople, moreTestRelationships)).toBe('Parent\'s sibling');
  });
});