// Simple browser console test for the relationship calculator
// Copy and paste this entire script into the browser console on the tree page

// First, let's check if the module system is working
const testRelationshipCalculator = () => {
  console.log('=== Testing Relationship Calculator ===');
  
  // Test data
  const testPeople = [
    { id: 1, full_name: 'John Doe', first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 3, full_name: 'Alice A', first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 5, full_name: 'Charlie C', first_name: 'Charlie', last_name: 'C', gender: 'Male' }
  ];

  const testRelationships = [
    { source: 3, target: 1, relationship_type: 'parent' }, // Alice has parent John
    { source: 5, target: 1, relationship_type: 'parent' }, // Charlie has parent John
    { source: 1, target: 3, relationship_type: 'child' },  // John has child Alice
    { source: 1, target: 5, relationship_type: 'child' },  // John has child Charlie
    { source: 3, target: 5, relationship_type: 'sibling' }, // Alice and Charlie are siblings
    { source: 5, target: 3, relationship_type: 'sibling' }
  ];

  // Try to import the relationship calculator
  try {
    // Check if we can access the function through window or global scope
    if (typeof window !== 'undefined' && window.calculateRelationshipToRoot) {
      console.log('✅ Found calculateRelationshipToRoot in window');
      const result = window.calculateRelationshipToRoot(testPeople[1], testPeople[2], testPeople, testRelationships);
      console.log(`Alice -> Charlie: ${result} (expected: Sister)`);
    } else {
      console.log('❌ calculateRelationshipToRoot not found in window');
      
      // Let's check what's actually loaded
      console.log('Available functions:', Object.keys(window).filter(key => key.includes('relationship')));
      
      // Try to access React DevTools or check for React
      if (window.React) {
        console.log('✅ React is available');
      } else {
        console.log('❌ React not found in window');
      }
      
      // Check for any tree-related data
      console.log('Tree-related keys:', Object.keys(window).filter(key => key.toLowerCase().includes('tree')));
    }
  } catch (error) {
    console.error('Error testing relationship calculator:', error);
  }
};

// Run the test
testRelationshipCalculator();

// Also provide manual test instructions
console.log('\n=== MANUAL TEST INSTRUCTIONS ===');
console.log('1. Open the family tree page');
console.log('2. Open browser DevTools (F12)');
console.log('3. Look at the Network tab to see API requests');
console.log('4. Check what data is being returned by /api/v1/people/tree');
console.log('5. Look for any errors in the Console tab');
console.log('6. Try hard refresh (Ctrl+Shift+R) to clear cache');
