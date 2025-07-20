/**
 * Test script to verify deceased spouse functionality
 */

import { calculateRelationshipToRoot } from './improvedRelationshipCalculator.js';

// Test data with deceased spouse relationships
const testPeople = [
  { id: 'john', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },
  { id: 'jane', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },
  { id: 'sarah', first_name: 'Sarah', last_name: 'Smith', gender: 'Female', is_deceased: false }
];

const testRelationships = [
  // John and Jane (deceased spouse) - using API format
  { source: 'john', target: 'jane', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { source: 'jane', target: 'john', relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // John and Sarah (current spouse)
  { source: 'john', target: 'sarah', relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { source: 'sarah', target: 'john', relationship_type: 'spouse', is_ex: false, is_deceased: false }
];

// Test the deceased spouse functionality
export function testDeceasedSpouse() {
  console.log('=== Testing Deceased Spouse Functionality ===');
  
  const john = testPeople.find(p => p.id === 'john');
  const jane = testPeople.find(p => p.id === 'jane');
  const sarah = testPeople.find(p => p.id === 'sarah');
  
  // Test 1: Jane to John (should be "Late Wife")
  const janeToJohn = calculateRelationshipToRoot(jane, john, testPeople, testRelationships);
  console.log('Jane to John:', janeToJohn, '(Expected: Late Wife)');
  
  // Test 2: John to Jane (should be "Late Husband")
  const johnToJane = calculateRelationshipToRoot(john, jane, testPeople, testRelationships);
  console.log('John to Jane:', johnToJane, '(Expected: Late Husband)');
  
  // Test 3: Sarah to John (should be "Wife")
  const sarahToJohn = calculateRelationshipToRoot(sarah, john, testPeople, testRelationships);
  console.log('Sarah to John:', sarahToJohn, '(Expected: Wife)');
  
  // Test 4: John to Sarah (should be "Husband")
  const johnToSarah = calculateRelationshipToRoot(john, sarah, testPeople, testRelationships);
  console.log('John to Sarah:', johnToSarah, '(Expected: Husband)');
  
  return {
    janeToJohn,
    johnToJane,
    sarahToJohn,
    johnToSarah
  };
}

// Run test if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testDeceasedSpouse = testDeceasedSpouse;
  console.log('Deceased spouse test function available as window.testDeceasedSpouse()');
}
