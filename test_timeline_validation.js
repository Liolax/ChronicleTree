// Test script to check timeline validation issues
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Test with different death dates to simulate timeline issues
const testScenarios = [
  {
    name: "Normal case (no deaths)",
    people: [
      { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
      { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
      { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
      { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
      { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
      { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false }
    ]
  },
  {
    name: "Lisa died before Emily was born",
    people: [
      { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
      { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
      { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
      { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: '2018-01-01', is_deceased: true }, // Died before Emily was born
      { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
      { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false }
    ]
  },
  {
    name: "Emily born after Lisa died (Lisa as root)",
    people: [
      { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
      { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2017-01-01', date_of_death: null, is_deceased: false },
      { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
      { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: '2018-06-01', is_deceased: true }, // Died before Emily was born
      { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
      { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false }
    ]
  }
];

const relationships = [
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 4, relative_id: 5, relationship_type: 'child' },
  { person_id: 5, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 6, relationship_type: 'child' },
  { person_id: 6, relative_id: 4, relationship_type: 'parent' },
  { person_id: 1, relative_id: 12, relationship_type: 'spouse' },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse' },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true },
  { person_id: 5, relative_id: 6, relationship_type: 'sibling' },
  { person_id: 6, relative_id: 5, relationship_type: 'sibling' }
];

console.log("=== Testing Timeline Validation Impact ===");

testScenarios.forEach(scenario => {
  console.log(`\n--- ${scenario.name} ---`);
  
  const lisa = scenario.people.find(p => p.id === 12);
  const emily = scenario.people.find(p => p.id === 6);
  const bob = scenario.people.find(p => p.id === 5);
  
  console.log(`Lisa death date: ${lisa.date_of_death || 'null (alive)'}`);
  console.log(`Emily birth date: ${emily.date_of_birth}`);
  console.log(`Bob birth date: ${bob.date_of_birth}`);
  
  // Timeline check
  if (lisa.date_of_death) {
    const lisaDeath = new Date(lisa.date_of_death);
    const emilyBirth = new Date(emily.date_of_birth);
    const bobBirth = new Date(bob.date_of_birth);
    
    console.log(`Emily born after Lisa died: ${emilyBirth > lisaDeath}`);
    console.log(`Bob born after Lisa died: ${bobBirth > lisaDeath}`);
  }
  
  // Test Lisa -> Emily
  try {
    const emilyRelation = calculateRelationshipToRoot(emily, lisa, scenario.people, relationships);
    console.log(`Lisa -> Emily: "${emilyRelation}"`);
  } catch (error) {
    console.log(`Lisa -> Emily: ERROR - ${error.message}`);
  }
  
  // Test Lisa -> Bob
  try {
    const bobRelation = calculateRelationshipToRoot(bob, lisa, scenario.people, relationships);
    console.log(`Lisa -> Bob: "${bobRelation}"`);
  } catch (error) {
    console.log(`Lisa -> Bob: ERROR - ${error.message}`);
  }
});

// Check if Emily has different dates in actual data
console.log("\n=== Checking Birth/Death Date Parsing ===");
const testDates = [
  '2019-01-01',
  '2018-01-01', 
  '1994-06-10'
];

testDates.forEach(dateStr => {
  const parsed = new Date(dateStr);
  console.log(`"${dateStr}" -> ${parsed.toISOString()} -> ${parsed.getTime()}`);
});

console.log("\nDate comparison test:");
const date1 = new Date('2019-01-01'); // Emily birth
const date2 = new Date('2018-01-01'); // Hypothetical Lisa death
console.log(`Emily birth (${date1}) > Lisa death (${date2}): ${date1 > date2}`);