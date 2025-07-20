import { calculateRelationshipToRoot } from '../../src/utils/improvedRelationshipCalculator.js';

// Test deceased spouse functionality
const testData = {
  people: [
    { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
    { id: 'mary', first_name: 'Mary', last_name: 'Smith', gender: 'Female' },
    { id: 'alice', first_name: 'Alice', last_name: 'Doe', gender: 'Female' }
  ],
  relationships: [
    // Jane is John's deceased spouse
    { source: 'john', target: 'jane', type: 'spouse', is_deceased: true },
    { source: 'jane', target: 'john', type: 'spouse', is_deceased: true },
    
    // Mary is John's current spouse (second marriage after Jane's death)
    { source: 'john', target: 'mary', type: 'spouse' },
    { source: 'mary', target: 'john', type: 'spouse' },
    
    // Alice is John and Jane's child
    { source: 'john', target: 'alice', type: 'parent' },
    { source: 'jane', target: 'alice', type: 'parent' }
  ]
};

console.log('=== DECEASED SPOUSE FUNCTIONALITY TEST ===');
console.log('Scenario: John was married to Jane (deceased), now married to Mary');
console.log();

console.log('Testing from John\'s perspective:');
const johnPerson = testData.people.find(p => p.id === 'john');
const janePerson = testData.people.find(p => p.id === 'jane');
const maryPerson = testData.people.find(p => p.id === 'mary');
const alicePerson = testData.people.find(p => p.id === 'alice');

console.log('John -> Jane:', calculateRelationshipToRoot(janePerson, johnPerson, testData.people, testData.relationships));
console.log('John -> Mary:', calculateRelationshipToRoot(maryPerson, johnPerson, testData.people, testData.relationships));
console.log('John -> Alice:', calculateRelationshipToRoot(alicePerson, johnPerson, testData.people, testData.relationships));
console.log();

console.log('Testing from Jane\'s perspective (deceased spouse):');
console.log('Jane -> John:', calculateRelationshipToRoot(johnPerson, janePerson, testData.people, testData.relationships));
console.log('Jane -> Alice:', calculateRelationshipToRoot(alicePerson, janePerson, testData.people, testData.relationships));
console.log('Jane -> Mary:', calculateRelationshipToRoot(maryPerson, janePerson, testData.people, testData.relationships));
console.log();

console.log('Testing from Mary\'s perspective (current spouse):');
console.log('Mary -> John:', calculateRelationshipToRoot(johnPerson, maryPerson, testData.people, testData.relationships));
console.log('Mary -> Jane:', calculateRelationshipToRoot(janePerson, maryPerson, testData.people, testData.relationships));
console.log('Mary -> Alice:', calculateRelationshipToRoot(alicePerson, maryPerson, testData.people, testData.relationships));
console.log();

console.log('Testing from Alice\'s perspective (child):');
console.log('Alice -> John:', calculateRelationshipToRoot(johnPerson, alicePerson, testData.people, testData.relationships));
console.log('Alice -> Jane:', calculateRelationshipToRoot(janePerson, alicePerson, testData.people, testData.relationships));
console.log('Alice -> Mary:', calculateRelationshipToRoot(maryPerson, alicePerson, testData.people, testData.relationships));

console.log();
console.log('Expected results:');
console.log('- John should see Jane as "Wife (deceased)"');
console.log('- John should see Mary as "Wife"');
console.log('- Jane should see John as "Husband (deceased)" (if viewing from Jane\'s perspective)');
console.log('- Mary should see Jane as "Unrelated" (ex-spouse relatives logic)');
console.log('- Alice should see Jane as "Mother" and Mary as step-parent relation');
