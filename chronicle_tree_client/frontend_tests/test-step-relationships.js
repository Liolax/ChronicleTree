/**
 * Test script to verify step-relationship functionality
 */

// Import the relationship calculator 
import { calculateRelationshipToRoot } from './src/utils/improvedRelationshipCalculator.js';

// Test data that mirrors our actual seed data structure
const testPeople = [
  { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },     // John (father)
  { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },   // Jane (deceased wife)
  { id: '3', first_name: 'Alice', last_name: 'Doe', gender: 'Female', is_deceased: false }, // Alice (daughter)
  { id: '4', first_name: 'Charlie', last_name: 'Doe', gender: 'Male', is_deceased: false }, // Charlie (son)
  { id: '5', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', is_deceased: false },  // Lisa (new wife)
  { id: '6', first_name: 'Michael', last_name: 'Doe', gender: 'Male', is_deceased: false }  // Michael (John & Lisa's son)
];

const testRelationships = [
  // John's relationships
  { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true },   // John <-> Jane (deceased)
  { source: '2', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { source: '1', target: '5', relationship_type: 'spouse', is_ex: false, is_deceased: false },  // John <-> Lisa (current)
  { source: '5', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // Parent-child relationships (biological)
  { source: '1', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   // John -> Alice
  { source: '3', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  // Alice -> John
  { source: '2', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   // Jane -> Alice
  { source: '3', target: '2', relationship_type: 'parent', is_ex: false, is_deceased: false },  // Alice -> Jane
  
  { source: '1', target: '4', relationship_type: 'child', is_ex: false, is_deceased: false },   // John -> Charlie
  { source: '4', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  // Charlie -> John
  { source: '2', target: '4', relationship_type: 'child', is_ex: false, is_deceased: false },   // Jane -> Charlie
  { source: '4', target: '2', relationship_type: 'parent', is_ex: false, is_deceased: false },  // Charlie -> Jane
  
  { source: '1', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   // John -> Michael
  { source: '6', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  // Michael -> John
  { source: '5', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   // Lisa -> Michael
  { source: '6', target: '5', relationship_type: 'parent', is_ex: false, is_deceased: false },  // Michael -> Lisa
  
  // Sibling relationships (biological)
  { source: '3', target: '4', relationship_type: 'sibling', is_ex: false, is_deceased: false }, // Alice <-> Charlie
  { source: '4', target: '3', relationship_type: 'sibling', is_ex: false, is_deceased: false }
];

// Test the step-relationship functionality
export function testStepRelationships() {
  console.log('=== Testing Step-Relationship Functionality ===\n');
  
  const john = testPeople.find(p => p.id === '1');
  const alice = testPeople.find(p => p.id === '3');
  const charlie = testPeople.find(p => p.id === '4');
  const lisa = testPeople.find(p => p.id === '5');
  const michael = testPeople.find(p => p.id === '6');
  
  console.log('Test 1: Lisa should be Step-Mother to Alice and Charlie');
  const lisaToAlice = calculateRelationshipToRoot(lisa, alice, testPeople, testRelationships);
  console.log(`Lisa to Alice: "${lisaToAlice}" (Expected: "Step-Mother")`);
  
  const lisaToCharlie = calculateRelationshipToRoot(lisa, charlie, testPeople, testRelationships);
  console.log(`Lisa to Charlie: "${lisaToCharlie}" (Expected: "Step-Mother")\n`);
  
  console.log('Test 2: Alice and Charlie should see Lisa as Step-Mother');
  const aliceToLisa = calculateRelationshipToRoot(alice, lisa, testPeople, testRelationships);
  console.log(`Alice to Lisa: "${aliceToLisa}" (Expected: "Step-Mother")`);
  
  const charlieToLisa = calculateRelationshipToRoot(charlie, lisa, testPeople, testRelationships);
  console.log(`Charlie to Lisa: "${charlieToLisa}" (Expected: "Step-Mother")\n`);
  
  console.log('Test 3: Michael should be Step-Brother to Alice and Charlie');
  const michaelToAlice = calculateRelationshipToRoot(michael, alice, testPeople, testRelationships);
  console.log(`Michael to Alice: "${michaelToAlice}" (Expected: "Step-Brother")`);
  
  const michaelToCharlie = calculateRelationshipToRoot(michael, charlie, testPeople, testRelationships);
  console.log(`Michael to Charlie: "${michaelToCharlie}" (Expected: "Step-Brother")\n`);
  
  console.log('Test 4: Alice and Charlie should see Michael as Step-Brother');
  const aliceToMichael = calculateRelationshipToRoot(alice, michael, testPeople, testRelationships);
  console.log(`Alice to Michael: "${aliceToMichael}" (Expected: "Step-Brother")`);
  
  const charlieToMichael = calculateRelationshipToRoot(charlie, michael, testPeople, testRelationships);
  console.log(`Charlie to Michael: "${charlieToMichael}" (Expected: "Step-Brother")\n`);
  
  console.log('Test 5: Verify biological relationships still work');
  const aliceToCharlie = calculateRelationshipToRoot(alice, charlie, testPeople, testRelationships);
  console.log(`Alice to Charlie: "${aliceToCharlie}" (Expected: "Brother")`);
  
  const charlieToAlice = calculateRelationshipToRoot(charlie, alice, testPeople, testRelationships);
  console.log(`Charlie to Alice: "${charlieToAlice}" (Expected: "Sister")\n`);
  
  console.log('=== Test Results Summary ===');
  
  return {
    lisaToAlice,
    lisaToCharlie,
    aliceToLisa,
    charlieToLisa,
    michaelToAlice,
    michaelToCharlie,
    aliceToMichael,
    charlieToMichael,
    aliceToCharlie,
    charlieToAlice
  };
}

// Run the test
testStepRelationships();
