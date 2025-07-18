// Debug script to test if the relationship calculator fix is working
// Run this in the browser console when viewing the family tree

console.log('=== DEBUG RELATIONSHIP CALCULATOR FIX ===');

// Test the calculateRelationshipToRoot function directly
if (typeof calculateRelationshipToRoot !== 'undefined') {
  console.log('✅ calculateRelationshipToRoot function is available');
  
  // Test data that should work with our fix
  const testPeople = [
    { id: 1, full_name: 'John Doe', first_name: 'John', last_name: 'Doe', gender: 'Male' },
    { id: 2, full_name: 'Jane Doe', first_name: 'Jane', last_name: 'Doe', gender: 'Female' },
    { id: 3, full_name: 'Alice A', first_name: 'Alice', last_name: 'A', gender: 'Female' },
    { id: 4, full_name: 'David A', first_name: 'David', last_name: 'A', gender: 'Male' },
    { id: 5, full_name: 'Charlie C', first_name: 'Charlie', last_name: 'C', gender: 'Male' },
    { id: 6, full_name: 'Bob B', first_name: 'Bob', last_name: 'B', gender: 'Male' },
    { id: 7, full_name: 'Emily E', first_name: 'Emily', last_name: 'E', gender: 'Female' }
  ];

  const testRelationships = [
    { source: 3, target: 1, relationship_type: 'parent' },
    { source: 3, target: 2, relationship_type: 'parent' },
    { source: 5, target: 1, relationship_type: 'parent' },
    { source: 5, target: 2, relationship_type: 'parent' },
    { source: 6, target: 3, relationship_type: 'parent' },
    { source: 6, target: 4, relationship_type: 'parent' },
    { source: 7, target: 3, relationship_type: 'parent' },
    { source: 7, target: 4, relationship_type: 'parent' },
    { source: 1, target: 3, relationship_type: 'child' },
    { source: 2, target: 3, relationship_type: 'child' },
    { source: 1, target: 5, relationship_type: 'child' },
    { source: 2, target: 5, relationship_type: 'child' },
    { source: 3, target: 6, relationship_type: 'child' },
    { source: 4, target: 6, relationship_type: 'child' },
    { source: 3, target: 7, relationship_type: 'child' },
    { source: 4, target: 7, relationship_type: 'child' },
    { source: 3, target: 5, relationship_type: 'sibling' },
    { source: 5, target: 3, relationship_type: 'sibling' },
    { source: 6, target: 7, relationship_type: 'sibling' },
    { source: 7, target: 6, relationship_type: 'sibling' }
  ];

  console.log('Testing relationships with Charlie C as root:');
  const charlie = testPeople.find(p => p.id === 5);
  
  testPeople.forEach(person => {
    if (person.id !== charlie.id) {
      try {
        const relation = calculateRelationshipToRoot(person, charlie, testPeople, testRelationships);
        const expected = person.id === 1 ? 'Father' : 
                        person.id === 2 ? 'Mother' : 
                        person.id === 3 ? 'Sister' : 
                        person.id === 6 ? 'Nephew' : 
                        person.id === 7 ? 'Niece' : 'Unrelated';
        
        const status = relation === expected ? '✅' : '❌';
        console.log(`${status} ${person.full_name} -> Charlie C: ${relation} (expected: ${expected})`);
      } catch (error) {
        console.error(`Error calculating relationship for ${person.full_name}:`, error);
      }
    }
  });
  
} else {
  console.log('❌ calculateRelationshipToRoot function is NOT available');
  console.log('This might mean the updated relationship calculator is not loaded');
}

// Check if we can find the actual relationship data being used
console.log('\n=== CHECKING ACTUAL APPLICATION DATA ===');
if (typeof window !== 'undefined' && window.location.pathname.includes('tree')) {
  console.log('On tree page - checking for relationship data...');
  
  // Try to find React components or data
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalInstance) {
    console.log('React app found - checking for relationship data...');
  }
  
  // Check for any global relationship data
  if (window.treeData) {
    console.log('Found treeData:', window.treeData);
  }
  
  // Check console for any API responses
  console.log('Check Network tab for API responses to /api/v1/people/tree');
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Check if the relationship calculator file has been updated');
console.log('2. Clear browser cache and refresh');
console.log('3. Check if the API is returning the correct data format');
console.log('4. Verify that the frontend is using the updated relationship calculator');
