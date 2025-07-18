import { describe, it, expect } from 'vitest';
import { collectConnectedFamily } from '../utils/familyTreeHierarchicalLayout';
import { calculateRelationshipToRoot } from '../utils/improvedRelationshipCalculator';

describe('Debug collectConnectedFamily function', () => {
  // Test data based on integration test
  const seedPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01' },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01' },
    { id: 3, first_name: 'Alice', last_name: 'A', gender: 'Female', date_of_birth: '1995-01-01' },
    { id: 4, first_name: 'David', last_name: 'A', gender: 'Male', date_of_birth: '1993-01-01' },
    { id: 5, first_name: 'Bob', last_name: 'B', gender: 'Male', date_of_birth: '2018-01-01' },
    { id: 6, first_name: 'Emily', last_name: 'E', gender: 'Female', date_of_birth: '2020-01-01' },
    { id: 7, first_name: 'Charlie', last_name: 'C', gender: 'Male', date_of_birth: '1997-01-01' }
  ];

  const seedRelationships = [
    { source: 1, target: 3, type: 'parent' },
    { source: 2, target: 3, type: 'parent' },
    { source: 1, target: 7, type: 'parent' },
    { source: 2, target: 7, type: 'parent' },
    { source: 3, target: 5, type: 'parent' },
    { source: 4, target: 5, type: 'parent' },
    { source: 3, target: 6, type: 'parent' },
    { source: 4, target: 6, type: 'parent' },
    { source: 1, target: 2, type: 'spouse', is_ex: false },
    { source: 2, target: 1, type: 'spouse', is_ex: false },
    { source: 3, target: 4, type: 'spouse', is_ex: true },
    { source: 4, target: 3, type: 'spouse', is_ex: true },
    { source: 3, target: 7, type: 'sibling' },
    { source: 7, target: 3, type: 'sibling' },
    { source: 5, target: 6, type: 'sibling' },
    { source: 6, target: 5, type: 'sibling' }
  ];

  it('should collect Alice and Charlie as connected (they are siblings)', () => {
    console.log('Testing collectConnectedFamily with Alice as root');
    console.log('All people:', seedPeople);
    console.log('All relationships:', seedRelationships);
    
    const result = collectConnectedFamily(3, seedPeople, seedRelationships); // Alice as root
    
    console.log('Collected persons:', result.persons);
    console.log('Collected relationships:', result.relationships);
    
    // Check if Charlie is included in connected persons
    const charlie = result.persons.find(p => p.id === 7);
    expect(charlie).toBeDefined();
    expect(charlie.first_name).toBe('Charlie');
    
    // Check if sibling relationship between Alice and Charlie is included
    const aliceCharlieRelationship = result.relationships.find(rel => 
      (rel.source === 3 && rel.target === 7 && rel.type === 'sibling') ||
      (rel.source === 7 && rel.target === 3 && rel.type === 'sibling')
    );
    expect(aliceCharlieRelationship).toBeDefined();
    
    console.log('Alice-Charlie sibling relationship found:', aliceCharlieRelationship);
  });

  it('should correctly calculate Charlie as Brother to Alice', () => {
    const result = collectConnectedFamily(3, seedPeople, seedRelationships); // Alice as root
    const alice = result.persons.find(p => p.id === 3);
    const charlie = result.persons.find(p => p.id === 7);
    
    console.log('Testing relationship calculation');
    console.log('Alice:', alice);
    console.log('Charlie:', charlie);
    console.log('Collected relationships:', result.relationships);
    
    const relationship = calculateRelationshipToRoot(charlie, alice, result.persons, result.relationships);
    console.log('Calculated relationship Charlie to Alice:', relationship);
    
    expect(relationship).toBe('Brother');
  });

  it('should debug what relationships are available for Alice and Charlie', () => {
    const result = collectConnectedFamily(3, seedPeople, seedRelationships); // Alice as root
    
    console.log('=== DEBUG RELATIONSHIP COLLECTION ===');
    console.log('Root person (Alice):', result.persons.find(p => p.id === 3));
    console.log('Target person (Charlie):', result.persons.find(p => p.id === 7));
    
    console.log('All collected relationships:', result.relationships);
    
    // Find all relationships involving Alice (ID 3)
    const aliceRelationships = result.relationships.filter(rel => 
      rel.source === 3 || rel.target === 3
    );
    console.log('Relationships involving Alice:', aliceRelationships);
    
    // Find all relationships involving Charlie (ID 7)  
    const charlieRelationships = result.relationships.filter(rel => 
      rel.source === 7 || rel.target === 7
    );
    console.log('Relationships involving Charlie:', charlieRelationships);
    
    // Check for direct sibling relationship
    const siblingRel = result.relationships.find(rel => 
      rel.type === 'sibling' && 
      ((rel.source === 3 && rel.target === 7) || (rel.source === 7 && rel.target === 3))
    );
    console.log('Direct sibling relationship Alice-Charlie:', siblingRel);
    
    expect(siblingRel).toBeDefined();
  });
});
