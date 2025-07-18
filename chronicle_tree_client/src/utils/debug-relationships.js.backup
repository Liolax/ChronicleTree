import { calculateRelationshipToRoot, getAllRelationshipsToRoot } from './utils/improvedRelationshipCalculator';

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

export function debugRelationships() {
  console.log('=== DEBUG RELATIONSHIPS ===');
  
  // Test sibling relationships
  const alice = testPeople[2]; // Alice
  const charlie = testPeople[6]; // Charlie
  
  console.log('Testing Alice and Charlie (should be siblings):');
  console.log('Alice:', alice);
  console.log('Charlie:', charlie);
  
  const aliceToCharlie = calculateRelationshipToRoot(alice, charlie, testPeople, testRelationships);
  const charlieToAlice = calculateRelationshipToRoot(charlie, alice, testPeople, testRelationships);
  
  console.log('Alice to Charlie:', aliceToCharlie);
  console.log('Charlie to Alice:', charlieToAlice);
  
  // Test Bob and Emily (should be siblings)
  const bob = testPeople[4]; // Bob
  const emily = testPeople[5]; // Emily
  
  console.log('\nTesting Bob and Emily (should be siblings):');
  console.log('Bob:', bob);
  console.log('Emily:', emily);
  
  const bobToEmily = calculateRelationshipToRoot(bob, emily, testPeople, testRelationships);
  const emilyToBob = calculateRelationshipToRoot(emily, bob, testPeople, testRelationships);
  
  console.log('Bob to Emily:', bobToEmily);
  console.log('Emily to Bob:', emilyToBob);
  
  // Test uncle/aunt relationships
  console.log('\nTesting uncle/aunt relationships:');
  console.log('Charlie to Bob (should be Uncle):', calculateRelationshipToRoot(charlie, bob, testPeople, testRelationships));
  console.log('Charlie to Emily (should be Uncle):', calculateRelationshipToRoot(charlie, emily, testPeople, testRelationships));
  
  // Test divorced relationships
  const john = testPeople[0]; // John
  const david = testPeople[3]; // David (ex-husband of Alice)
  
  console.log('\nTesting divorced relationships:');
  console.log('David to John (should be Ex-Son-in-law):', calculateRelationshipToRoot(david, john, testPeople, testRelationships));
  console.log('David to Alice (should be Ex-Husband):', calculateRelationshipToRoot(david, alice, testPeople, testRelationships));
  
  // Test full tree with Charlie as root
  console.log('\nTesting full tree with Charlie as root:');
  const resultsWithCharlie = getAllRelationshipsToRoot(charlie, testPeople, testRelationships);
  resultsWithCharlie.forEach(person => {
    console.log(`${person.first_name} ${person.last_name}: ${person.relation}`);
  });
  
  // Test with John as root to see divorced relationship
  console.log('\nTesting full tree with John as root:');
  const resultsWithJohn = getAllRelationshipsToRoot(john, testPeople, testRelationships);
  resultsWithJohn.forEach(person => {
    console.log(`${person.first_name} ${person.last_name}: ${person.relation}`);
  });
}