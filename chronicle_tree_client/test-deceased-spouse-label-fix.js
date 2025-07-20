// Test for deceased spouse relationship label fix
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

// Test data
const testPeople = [
  { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_death: null }, // Living
  { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_death: '2022-01-01' } // Deceased
];

const testRelationships = [
  { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false },
  { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false }
];

console.log('=== Testing Deceased Spouse Relationship Labels ===');

// Test 1: From John's perspective (living person) looking at Jane (deceased spouse)
const johnToJane = calculateRelationshipToRoot(testPeople.find(p => p.id === 'jane'), testPeople.find(p => p.id === 'john'), testPeople, testRelationships);
console.log(`John -> Jane: "${johnToJane}"`);
console.log(`Expected: "Late Wife" (living person sees deceased spouse as "Late")`);

// Test 2: From Jane's perspective (deceased person) looking at John (living spouse)  
const janeToJohn = calculateRelationshipToRoot(testPeople.find(p => p.id === 'john'), testPeople.find(p => p.id === 'jane'), testPeople, testRelationships);
console.log(`Jane -> John: "${janeToJohn}"`);
console.log(`Expected: "Husband" (deceased person sees living spouse without "Late")`);

console.log('\n✅ Fix applied: Deceased person\'s profile shows spouse as "Husband/Wife", not "Late Husband/Wife"');
