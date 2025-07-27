/**
 * Test if Michael can see Emma in his family tree
 * This tests the actual visibility logic, not just relationship calculation
 */

// Import the relationship calculator
import { calculateRelationshipToRoot, buildRelationshipMaps } from '../src/utils/improvedRelationshipCalculator.js';

const actualPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1990-01-15', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1992-07-20', date_of_death: '2015-03-10', is_deceased: true },
  { id: 3, first_name: 'Alice', last_name: 'Johnson', gender: 'Female', date_of_birth: '2012-02-28', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'Charlie', last_name: 'Doe', gender: 'Male', date_of_birth: '2014-11-12', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Bob', last_name: 'Johnson', gender: 'Male', date_of_birth: '2010-06-25', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Johnson', gender: 'Female', date_of_birth: '2008-04-03', date_of_death: null, is_deceased: false },
  { id: 7, first_name: 'David', last_name: 'Johnson', gender: 'Male', date_of_birth: '1985-09-18', date_of_death: null, is_deceased: false },
  { id: 8, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false },
  { id: 9, first_name: 'Emma', last_name: 'Doe', gender: 'Female', date_of_birth: '2020-03-22', date_of_death: null, is_deceased: false },
  { id: 10, first_name: 'Molly', last_name: 'Doe', gender: 'Female', date_of_birth: '1965-12-15', date_of_death: '2019-08-20', is_deceased: true },
  { id: 11, first_name: 'Robert', last_name: 'Doe', gender: 'Male', date_of_birth: '1963-03-10', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', date_of_death: null, is_deceased: false },
];

// Relationships based on seeds.rb format (Rails bidirectional format)
const actualRelationships = [
  // John is parent of Alice, Charlie
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 4, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 4, relationship_type: 'child' },
  
  // Jane is parent of Alice, Charlie  
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 4, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 4, relationship_type: 'child' },
  
  // Alice and David are parents of Bob, Emily
  { person_id: 5, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 5, relationship_type: 'child' },
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 5, relative_id: 7, relationship_type: 'parent' },
  { person_id: 7, relative_id: 5, relationship_type: 'child' },
  { person_id: 6, relative_id: 7, relationship_type: 'parent' },
  { person_id: 7, relative_id: 6, relationship_type: 'child' },
  
  // Charlie is parent of Emma
  { person_id: 9, relative_id: 4, relationship_type: 'parent' },
  { person_id: 4, relative_id: 9, relationship_type: 'child' },
  
  // Molly and Robert are parents of John
  { person_id: 1, relative_id: 10, relationship_type: 'parent' },
  { person_id: 10, relative_id: 1, relationship_type: 'child' },
  { person_id: 1, relative_id: 11, relationship_type: 'parent' },
  { person_id: 11, relative_id: 1, relationship_type: 'child' },
  
  // John and Lisa are current spouses
  { person_id: 1, relative_id: 8, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  { person_id: 8, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: false },
  
  // John and Jane were spouses (Jane is deceased)  
  { person_id: 1, relative_id: 2, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  { person_id: 2, relative_id: 1, relationship_type: 'spouse', is_ex: false, is_deceased: true },
  
  // Alice and David were spouses (now ex-spouses)
  { person_id: 3, relative_id: 7, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  { person_id: 7, relative_id: 3, relationship_type: 'spouse', is_ex: true, is_deceased: false },
  
  // John and Lisa are parents of Michael
  { person_id: 12, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 12, relationship_type: 'child' },
  { person_id: 12, relative_id: 8, relationship_type: 'parent' },
  { person_id: 8, relative_id: 12, relationship_type: 'child' },
];

const michael = actualPeople.find(p => p.first_name === 'Michael');
const emma = actualPeople.find(p => p.first_name === 'Emma');

console.log('=== Michael and Emma Timeline Check ===');
console.log(`Michael birth: ${michael.date_of_birth} (alive: ${!michael.is_deceased})`);
console.log(`Emma birth: ${emma.date_of_birth} (alive: ${!emma.is_deceased})`);
console.log('Both are alive and should be able to see each other ✅');

console.log('\n=== Direct Relationship Test ===');
const emmaRelationshipToMichael = calculateRelationshipToRoot(emma, michael, actualPeople, actualRelationships);
const michaelRelationshipToEmma = calculateRelationshipToRoot(michael, emma, actualPeople, actualRelationships);

console.log(`Emma -> Michael: ${emmaRelationshipToMichael}`);
console.log(`Michael -> Emma: ${michaelRelationshipToEmma}`);

if (emmaRelationshipToMichael === 'Half-Uncle' && michaelRelationshipToEmma === 'Half-Niece') {
  console.log('✅ Relationships are symmetric and correct');
} else {
  console.log('❌ Relationships are not symmetric or correct');
}

console.log('\n=== Testing Family Tree Visibility Function ===');

// This simulates what the family tree UI would do
function getFamilyTreeForPerson(rootPerson, allPeople, relationships) {
  const familyMembers = [];
  
  allPeople.forEach(person => {
    if (person.id !== rootPerson.id) {
      const relationship = calculateRelationshipToRoot(person, rootPerson, allPeople, relationships);
      if (relationship && relationship !== 'Unrelated') {
        familyMembers.push({
          person: person,
          relationship: relationship
        });
      }
    }
  });
  
  return familyMembers;
}

const michaelsFamilyTree = getFamilyTreeForPerson(michael, actualPeople, actualRelationships);
console.log('\n=== Michael\'s Complete Family Tree ===');
michaelsFamilyTree.forEach(member => {
  console.log(`${member.person.first_name} ${member.person.last_name}: ${member.relationship}`);
});

// Check specifically for Emma
const emmaInMichaelsTree = michaelsFamilyTree.find(member => member.person.first_name === 'Emma');
if (emmaInMichaelsTree) {
  console.log(`\n✅ Emma IS visible in Michael's family tree as: ${emmaInMichaelsTree.relationship}`);
} else {
  console.log('\n❌ Emma is NOT visible in Michael\'s family tree');
  console.log('This suggests a visibility/filtering issue');
}

console.log('\n=== Timeline Validation Debug ===');
// Check if there might be timeline issues
const michaelBirth = new Date(michael.date_of_birth);
const emmaBirth = new Date(emma.date_of_birth);
const emmaDeath = emma.date_of_death ? new Date(emma.date_of_death) : null;

console.log(`Michael born: ${michaelBirth.toISOString()}`);
console.log(`Emma born: ${emmaBirth.toISOString()}`);
console.log(`Emma died: ${emmaDeath ? emmaDeath.toISOString() : 'Still alive'}`);

if (michaelBirth > emmaBirth && !emmaDeath) {
  console.log('✅ Michael was born after Emma, but Emma is still alive - they overlap in time');
} else if (emmaDeath && michaelBirth > emmaDeath) {
  console.log('❌ Michael was born after Emma died - timeline validation might block relationship');
} else {
  console.log('✅ Timeline should not block their relationship');
}

console.log('\n=== Age Gap Analysis ===');
const ageGapMonths = (michaelBirth - emmaBirth) / (1000 * 60 * 60 * 24 * 30.44);
console.log(`Age gap: ${Math.abs(ageGapMonths).toFixed(1)} months`);
console.log(`Michael is ${ageGapMonths > 0 ? 'younger' : 'older'} than Emma`);

if (Math.abs(ageGapMonths) < 6) {
  console.log('⚠️  Very small age gap might cause logic issues');
} else {
  console.log('✅ Age gap is reasonable for uncle-niece relationship');
}