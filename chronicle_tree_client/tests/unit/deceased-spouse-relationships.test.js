import { describe, it, expect } from 'vitest';
import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

describe('Deceased Spouse Relationships', () => {
  const allPeople = [
    { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },
    { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },
    { id: 'sarah', first_name: 'Sarah', last_name: 'Smith', gender: 'Female', is_deceased: false },
    { id: 'robert', first_name: 'Robert', last_name: 'Johnson', gender: 'Male', is_deceased: false },
    { id: 'molly', first_name: 'Molly', last_name: 'Johnson', gender: 'Female', is_deceased: true },
    { id: 'alice', first_name: 'Alice', last_name: 'Brown', gender: 'Female', is_deceased: false },
    { id: 'charlie', first_name: 'Charlie', last_name: 'Brown', gender: 'Male', is_deceased: false },
    { id: 'alex', first_name: 'Alex', last_name: 'Taylor', gender: 'Non-binary', is_deceased: true }
  ];

  const relationships = [
    // John and Jane (deceased spouse)
    { person_a_id: 'john', person_b_id: 'jane', relationship_type: 'Spouse', is_ex: false, is_deceased: true },
    { person_a_id: 'jane', person_b_id: 'john', relationship_type: 'Spouse', is_ex: false, is_deceased: true },
    
    // John and Sarah (current spouse after deceased)
    { person_a_id: 'john', person_b_id: 'sarah', relationship_type: 'Spouse', is_ex: false, is_deceased: false },
    { person_a_id: 'sarah', person_b_id: 'john', relationship_type: 'Spouse', is_ex: false, is_deceased: false },
    
    // Robert and Molly (deceased spouse)
    { person_a_id: 'robert', person_b_id: 'molly', relationship_type: 'Spouse', is_ex: false, is_deceased: true },
    { person_a_id: 'molly', person_b_id: 'robert', relationship_type: 'Spouse', is_ex: false, is_deceased: true },
    
    // Alice and Alex (non-binary deceased spouse)
    { person_a_id: 'alice', person_b_id: 'alex', relationship_type: 'Spouse', is_ex: false, is_deceased: true },
    { person_a_id: 'alex', person_b_id: 'alice', relationship_type: 'Spouse', is_ex: false, is_deceased: true },
    
    // Parent-child relationships
    { person_a_id: 'jane', person_b_id: 'alice', relationship_type: 'Parent' },
    { person_a_id: 'jane', person_b_id: 'charlie', relationship_type: 'Parent' },
    { person_a_id: 'molly', person_b_id: 'john', relationship_type: 'Parent' },
    { person_a_id: 'robert', person_b_id: 'john', relationship_type: 'Parent' }
  ];

  it('should identify deceased spouse correctly', () => {
    const johnPerson = allPeople.find(p => p.id === 'john');
    const janePerson = allPeople.find(p => p.id === 'jane');
    const result = calculateRelationshipToRoot(janePerson, johnPerson, allPeople, relationships);
    expect(result).toBe('Late Wife');
  });

  it('should identify deceased husband correctly', () => {
    const janePerson = allPeople.find(p => p.id === 'jane');
    const johnPerson = allPeople.find(p => p.id === 'john');
    const result = calculateRelationshipToRoot(johnPerson, janePerson, allPeople, relationships);
    expect(result).toBe('Husband');
  });

  it('should identify current spouse correctly when person has deceased spouse', () => {
    const johnPerson = allPeople.find(p => p.id === 'john');
    const sarahPerson = allPeople.find(p => p.id === 'sarah');
    const result = calculateRelationshipToRoot(sarahPerson, johnPerson, allPeople, relationships);
    expect(result).toBe('Wife');
  });

  it('should identify current spouse from their perspective', () => {
    const sarahPerson = allPeople.find(p => p.id === 'sarah');
    const johnPerson = allPeople.find(p => p.id === 'john');
    const result = calculateRelationshipToRoot(johnPerson, sarahPerson, allPeople, relationships);
    expect(result).toBe('Husband');
  });

  it('should handle deceased spouse of different person', () => {
    const robertPerson = allPeople.find(p => p.id === 'robert');
    const mollyPerson = allPeople.find(p => p.id === 'molly');
    const result = calculateRelationshipToRoot(mollyPerson, robertPerson, allPeople, relationships);
    expect(result).toBe('Late Wife');
  });

  it('should handle non-binary deceased spouse with gender-neutral label', () => {
    const alicePerson = allPeople.find(p => p.id === 'alice');
    const alexPerson = allPeople.find(p => p.id === 'alex');
    const result = calculateRelationshipToRoot(alexPerson, alicePerson, allPeople, relationships);
    expect(result).toBe('Late Spouse');
  });

  it('should handle deceased spouse from non-binary perspective', () => {
    const alexPerson = allPeople.find(p => p.id === 'alex');
    const alicePerson = allPeople.find(p => p.id === 'alice');
    const result = calculateRelationshipToRoot(alicePerson, alexPerson, allPeople, relationships);
    expect(result).toBe('Late Wife');
  });

  it('should not confuse deceased spouse with other relationships', () => {
    // Sarah should not be related to Jane (John's deceased spouse)
    const sarahPerson = allPeople.find(p => p.id === 'sarah');
    const janePerson = allPeople.find(p => p.id === 'jane');
    const result = calculateRelationshipToRoot(janePerson, sarahPerson, allPeople, relationships);
    expect(result).toBe('Unrelated');
  });

  it('should handle deceased spouse in-law relationships correctly', () => {
    // Alice's relationship to John (her deceased mother's husband)
    const alicePerson = allPeople.find(p => p.id === 'alice');
    const johnPerson = allPeople.find(p => p.id === 'john');
    const result = calculateRelationshipToRoot(johnPerson, alicePerson, allPeople, relationships);
    expect(result).toBe('Father-In-Law');
  });

  it('should handle step-relationships after remarriage', () => {
    // Charlie's relationship to John (his deceased mother's husband, now remarried)
    const charliePerson = allPeople.find(p => p.id === 'charlie');
    const johnPerson = allPeople.find(p => p.id === 'john');
    const result = calculateRelationshipToRoot(johnPerson, charliePerson, allPeople, relationships);
    expect(result).toBe('Father-In-Law');
  });

  it('should handle grandparent relationships through deceased spouse', () => {
    // Alice's relationship to Robert (her father-in-law's father)
    const alicePerson = allPeople.find(p => p.id === 'alice');
    const robertPerson = allPeople.find(p => p.id === 'robert');
    const result = calculateRelationshipToRoot(robertPerson, alicePerson, allPeople, relationships);
    expect(result).toBe('Grandfather-In-Law');
  });
});

describe('Deceased Spouse Edge Cases', () => {
  const edgeCaseAllPeople = [
    { id: 'person1', first_name: 'Person', last_name: 'One', gender: 'Male', is_deceased: false },
    { id: 'person2', first_name: 'Person', last_name: 'Two', gender: 'Female', is_deceased: true },
    { id: 'person3', first_name: 'Person', last_name: 'Three', gender: 'Male', is_deceased: false }
  ];

  const edgeCaseRelationships = [];

  it('should handle person with no relationships', () => {
    const person1 = edgeCaseAllPeople.find(p => p.id === 'person1');
    const person2 = edgeCaseAllPeople.find(p => p.id === 'person2');
    const result = calculateRelationshipToRoot(person2, person1, edgeCaseAllPeople, edgeCaseRelationships);
    expect(result).toBe('Unrelated');
  });

  it('should handle missing relationship data gracefully', () => {
    const person1 = edgeCaseAllPeople.find(p => p.id === 'person1');
    const result = calculateRelationshipToRoot(null, person1, edgeCaseAllPeople, edgeCaseRelationships);
    expect(result).toBe('');
  });

  it('should handle self-relationship', () => {
    const person1 = edgeCaseAllPeople.find(p => p.id === 'person1');
    const result = calculateRelationshipToRoot(person1, person1, edgeCaseAllPeople, edgeCaseRelationships);
    expect(result).toBe('Root Person');
  });
});
