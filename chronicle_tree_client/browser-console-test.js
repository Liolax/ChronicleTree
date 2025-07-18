/**
 * Browser console test - Copy and paste this into the browser console
 * to test Charlie's relationships after the database fix
 */

// Test data with corrected Alice-David relationship (is_ex: true)
const testData = {
  people: [
    { id: 31, first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 32, first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
    { id: 33, first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 34, first_name: 'David', last_name: 'A', gender: 'Male' },
    { id: 35, first_name: 'Bob', last_name: 'B', gender: 'Male' },
    { id: 36, first_name: 'Emily', last_name: 'E', gender: 'Female' },
    { id: 37, first_name: 'Charlie', last_name: 'C', gender: 'Male' }
  ],
  relationships: [
    // Parent relationships
    { source: 31, target: 33, type: 'parent' }, // John -> Alice
    { source: 32, target: 33, type: 'parent' }, // Jane -> Alice
    { source: 31, target: 37, type: 'parent' }, // John -> Charlie
    { source: 32, target: 37, type: 'parent' }, // Jane -> Charlie
    { source: 33, target: 35, type: 'parent' }, // Alice -> Bob
    { source: 34, target: 35, type: 'parent' }, // David -> Bob
    { source: 33, target: 36, type: 'parent' }, // Alice -> Emily
    { source: 34, target: 36, type: 'parent' }, // David -> Emily
    
    // Spouse relationships - FIXED: Alice-David are now ex-spouses
    { source: 31, target: 32, type: 'spouse', is_ex: false }, // John <-> Jane
    { source: 32, target: 31, type: 'spouse', is_ex: false },
    { source: 33, target: 34, type: 'spouse', is_ex: true }, // Alice <-> David (EX)
    { source: 34, target: 33, type: 'spouse', is_ex: true },
    
    // Sibling relationships
    { source: 33, target: 37, type: 'sibling' }, // Alice <-> Charlie
    { source: 37, target: 33, type: 'sibling' },
    { source: 35, target: 36, type: 'sibling' }  // Bob <-> Emily
  ]
};

console.log('=== BROWSER CONSOLE TEST ===');
console.log('Testing Charlie\'s relationships with fixed data...');
console.log('Expected: David should be "Unrelated" to Charlie');

// If the page has access to the relationship calculator, test it
if (typeof calculateRelationshipToRoot !== 'undefined') {
  const charlie = testData.people.find(p => p.first_name === 'Charlie');
  const david = testData.people.find(p => p.first_name === 'David');
  
  const result = calculateRelationshipToRoot(david, charlie, testData.people, testData.relationships);
  console.log('David -> Charlie:', result);
  
  if (result === 'Unrelated') {
    console.log('✅ SUCCESS: Relationship calculator working correctly');
  } else {
    console.log('❌ ISSUE: Expected "Unrelated", got "' + result + '"');
  }
} else {
  console.log('⚠️ Relationship calculator not available in global scope');
  console.log('Please refresh the page and clear browser cache');
}

console.log('\n=== CACHE CLEARING INSTRUCTIONS ===');
console.log('1. Press F12 to open Developer Tools');
console.log('2. Go to Application tab (Chrome) or Storage tab (Firefox)');
console.log('3. Clear all Local Storage, Session Storage, and Cache');
console.log('4. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)');
console.log('5. Re-test Charlie\'s family tree');
