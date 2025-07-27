/**
 * Test what the UI would actually show for Michael's family tree
 * This simulates the exact logic the frontend would use
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

// Simulate the exact data structure the UI would receive
const mockApiResponse = {
  people: [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1990-01-15', date_of_death: null, is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1992-07-20', date_of_death: '2015-03-10', is_deceased: true },
    { id: 4, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '2014-11-12', date_of_death: null, is_deceased: false },
    { id: 8, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
    { id: 9, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-22', date_of_death: null, is_deceased: false },
    { id: 12, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false },
  ],
  relationships: [
    // John is parent of Charlie
    { person_id: 4, relative_id: 1, relationship_type: 'parent' },
    { person_id: 1, relative_id: 4, relationship_type: 'child' },  
    // Jane is parent of Charlie  
    { person_id: 4, relative_id: 2, relationship_type: 'parent' },
    { person_id: 2, relative_id: 4, relationship_type: 'child' },  
    // Charlie is parent of Emma
    { person_id: 9, relative_id: 4, relationship_type: 'parent' },
    { person_id: 4, relative_id: 9, relationship_type: 'child' },  
    // John and Lisa are parents of Michael
    { person_id: 12, relative_id: 1, relationship_type: 'parent' },
    { person_id: 1, relative_id: 12, relationship_type: 'child' },
    { person_id: 12, relative_id: 8, relationship_type: 'parent' },
    { person_id: 8, relative_id: 12, relationship_type: 'child' },
  ]
};

// Simulate how the UI processes the data for Michael as root
function simulateUIForMichael(apiData) {
  const michael = apiData.people.find(p => p.first_name === 'Michael');
  
  console.log('=== UI Simulation: Michael as Root ===');
  console.log(`Root Person: ${michael.first_name} ${michael.last_name} (ID: ${michael.id})`);
  
  // This is what the UI would do: calculate relationships for all people
  const familyTreeData = [];
  
  apiData.people.forEach(person => {
    if (person.id !== michael.id) {
      const relationship = calculateRelationshipToRoot(person, michael, apiData.people, apiData.relationships);
      
      familyTreeData.push({
        id: person.id,
        name: `${person.first_name} ${person.last_name}`,
        relationship: relationship,
        isVisible: relationship !== 'Unrelated' && relationship !== null && relationship !== ''
      });
    }
  });
  
  console.log('\n=== Family Tree Data (what UI would show) ===');
  familyTreeData.forEach(member => {
    const visibility = member.isVisible ? '✅ VISIBLE' : '❌ HIDDEN';
    console.log(`${member.name}: ${member.relationship} (${visibility})`);
  });
  
  // Check specifically for Emma
  const emma = familyTreeData.find(member => member.name.includes('Emma'));
  console.log('\n=== Emma Visibility Check ===');
  if (emma) {
    if (emma.isVisible) {
      console.log(`✅ Emma IS visible to Michael as: "${emma.relationship}"`);
    } else {
      console.log(`❌ Emma is NOT visible to Michael (relationship: "${emma.relationship}")`);
    }
  } else {
    console.log('❌ Emma not found in family tree data');
  }
  
  return familyTreeData;
}

// Run the simulation
const familyTree = simulateUIForMichael(mockApiResponse);

console.log('\n=== Potential Issues Analysis ===');

// Check for filtering logic that might hide certain relationships
const hiddenMembers = familyTree.filter(member => !member.isVisible);
const visibleMembers = familyTree.filter(member => member.isVisible);

console.log(`Total family members: ${familyTree.length}`);
console.log(`Visible members: ${visibleMembers.length}`);
console.log(`Hidden members: ${hiddenMembers.length}`);

if (hiddenMembers.length > 0) {
  console.log('\nHidden members:');
  hiddenMembers.forEach(member => {
    console.log(`- ${member.name}: ${member.relationship}`);
  });
}

// Check for any UI constraints that might be causing issues
console.log('\n=== UI Constraint Analysis ===');
console.log('Common reasons why family members might not appear:');
console.log('1. Relationship calculation returns "Unrelated"');
console.log('2. Timeline validation blocks the relationship');
console.log('3. UI filtering logic removes certain relationship types');
console.log('4. Data loading issues or missing relationships');

const emma = familyTree.find(member => member.name.includes('Emma'));
if (emma && emma.isVisible && emma.relationship === 'Half-Niece') {
  console.log('\n✅ CONCLUSION: Michael SHOULD be able to see Emma as his Half-Niece');
  console.log('If you\'re not seeing this in the actual app, it might be:');
  console.log('- A data loading issue');
  console.log('- Different data in the database vs our test');
  console.log('- A UI rendering issue');
  console.log('- A different root person selected');
} else {
  console.log('\n❌ CONCLUSION: There is an issue with Emma\'s visibility');
}