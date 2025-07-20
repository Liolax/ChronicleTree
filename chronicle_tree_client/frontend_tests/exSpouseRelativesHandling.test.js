import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator';

describe('Ex-spouse relatives handling', () => {
  // This test verifies the problem statement requirement:
  // "relatives of spouse (because after divorce they are not official yet) are not showing. 
  // just ex-spouse here and shared Children"
  
  const testPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 2, first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 3, first_name: 'David', last_name: 'A', gender: 'Male' },
    { id: 4, first_name: 'Bob', last_name: 'B', gender: 'Male' },
    { id: 5, first_name: 'Emily', last_name: 'E', gender: 'Female' },
    { id: 6, first_name: 'DavidMom', last_name: 'M', gender: 'Female' }, // David's mother
    { id: 7, first_name: 'DavidDad', last_name: 'D', gender: 'Male' }, // David's father
    { id: 8, first_name: 'DavidSis', last_name: 'S', gender: 'Female' }, // David's sister
  ];

  const testRelationships = [
    // Alice and David were married, now divorced
    { from: 2, to: 3, type: 'spouse', is_ex: true }, // Alice <-> David (ex)
    { from: 3, to: 2, type: 'spouse', is_ex: true },
    
    // Alice and David have shared children
    { from: 2, to: 4, type: 'parent' }, // Alice -> Bob
    { from: 3, to: 4, type: 'parent' }, // David -> Bob
    { from: 2, to: 5, type: 'parent' }, // Alice -> Emily
    { from: 3, to: 5, type: 'parent' }, // David -> Emily
    
    // David's family (should not be related to Alice after divorce)
    { from: 6, to: 3, type: 'parent' }, // DavidMom -> David
    { from: 7, to: 3, type: 'parent' }, // DavidDad -> David
    { from: 8, to: 3, type: 'sibling' }, // DavidSis <-> David
    { from: 3, to: 8, type: 'sibling' },
    
    // Bob and Emily are siblings
    { from: 4, to: 5, type: 'sibling' }, // Bob <-> Emily
    { from: 5, to: 4, type: 'sibling' },
    
    // John is Alice's current husband (shows in-law relationships should work for current spouse)
    { from: 1, to: 2, type: 'spouse', is_ex: false }, // John <-> Alice
    { from: 2, to: 1, type: 'spouse', is_ex: false },
  ];

  it('should NOT show ex-spouse relatives as in-laws', () => {
    // David's parents should NOT be related to Alice after divorce
    // They should be 'Unrelated' because ex-spouse relatives should not be shown
    expect(calculateRelationshipToRoot(testPeople[5], testPeople[1], testPeople, testRelationships)).toBe('Unrelated'); // DavidMom to Alice
    expect(calculateRelationshipToRoot(testPeople[6], testPeople[1], testPeople, testRelationships)).toBe('Unrelated'); // DavidDad to Alice
    
    // David's sister should NOT be related to Alice after divorce
    expect(calculateRelationshipToRoot(testPeople[7], testPeople[1], testPeople, testRelationships)).toBe('Unrelated'); // DavidSis to Alice
  });

  it('should show ex-spouse relationship correctly', () => {
    // Alice and David should be ex-spouses
    expect(calculateRelationshipToRoot(testPeople[2], testPeople[1], testPeople, testRelationships)).toBe('Ex-Husband');
    expect(calculateRelationshipToRoot(testPeople[1], testPeople[2], testPeople, testRelationships)).toBe('Ex-Wife');
  });

  it('should show shared children correctly', () => {
    // Bob and Emily should be children to both Alice and David
    expect(calculateRelationshipToRoot(testPeople[3], testPeople[1], testPeople, testRelationships)).toBe('Son');
    expect(calculateRelationshipToRoot(testPeople[4], testPeople[1], testPeople, testRelationships)).toBe('Daughter');
    expect(calculateRelationshipToRoot(testPeople[3], testPeople[2], testPeople, testRelationships)).toBe('Son');
    expect(calculateRelationshipToRoot(testPeople[4], testPeople[2], testPeople, testRelationships)).toBe('Daughter');
  });

  it('should show current spouse in-law relationships correctly', () => {
    // David (Alice's ex-spouse) should NOT be related to John (Alice's current husband)
    // Ex-spouses don't create in-law relationships with current spouses
    expect(calculateRelationshipToRoot(testPeople[2], testPeople[0], testPeople, testRelationships)).toBe('Unrelated');
    
    // Bob and Emily should be children-in-law to John (children of current spouse)
    expect(calculateRelationshipToRoot(testPeople[3], testPeople[0], testPeople, testRelationships)).toBe('Son-in-law');
    expect(calculateRelationshipToRoot(testPeople[4], testPeople[0], testPeople, testRelationships)).toBe('Daughter-in-law');
  });
});