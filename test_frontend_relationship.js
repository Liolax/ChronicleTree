/**
 * Test frontend relationship calculation for Richard Sharma, Margaret Sharma, and Michael Doe
 * Expected: Both should be "Unrelated" to Michael since Jane Doe died in 2022 before Michael was born in 2024
 */

// Since we can't easily import ES6 modules in this context, let's just copy the key function
// This is the calculateRelationshipToRoot function from improvedRelationshipCalculator.js
function calculateRelationshipToRoot(person, rootPerson, allPeopleParam, relationships) {
  if (!person || !rootPerson || !allPeopleParam || !relationships) {
    return '';
  }

  // If it's the same person, they are the root
  if (person.id === rootPerson.id) {
    return 'Root';
  }

  // CRITICAL TIMELINE VALIDATION: Check if the two people's lifespans overlapped
  const personBirth = person.date_of_birth ? new Date(person.date_of_birth) : null;
  const personDeath = person.date_of_death ? new Date(person.date_of_death) : null;
  const rootBirth = rootPerson.date_of_birth ? new Date(rootPerson.date_of_birth) : null;
  const rootDeath = rootPerson.date_of_death ? new Date(rootPerson.date_of_death) : null;

  // Check if lifespans overlapped
  if (personBirth && rootDeath && personBirth > rootDeath) {
    return 'Unrelated'; // Person was born after root died
  }
  
  if (rootBirth && personDeath && rootBirth > personDeath) {
    return 'Unrelated'; // Root was born after person died
  }

  // For now, we'll return a simplified result to test the timeline validation
  // In the actual implementation, this would continue with full relationship calculation
  return 'RelatedOrUnknown';
}

// Mock data based on the actual seed data
const allPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
  { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
  { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false },
  { id: 17, first_name: 'Richard', last_name: 'Sharma', gender: 'Male', date_of_birth: '1945-08-12', is_deceased: false },
  { id: 18, first_name: 'Margaret', last_name: 'Sharma', gender: 'Female', date_of_birth: '1948-02-28', is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false }
];

// Relationships based on seed data
const relationships = [
  // Richard is parent of Jane
  { source: 17, target: 2, type: 'parent', is_ex: false, is_deceased: false },
  { source: 2, target: 17, type: 'child', is_ex: false, is_deceased: false },
  
  // Margaret is parent of Jane  
  { source: 18, target: 2, type: 'parent', is_ex: false, is_deceased: false },
  { source: 2, target: 18, type: 'child', is_ex: false, is_deceased: false },
  
  // Jane was married to John (deceased spouse)
  { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
  { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
  
  // John is now married to Lisa (current spouse)
  { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
  { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
  
  // John is parent of Michael
  { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
  { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
  
  // Lisa is parent of Michael
  { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
  { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('Testing Frontend Relationship Calculator');
console.log('=' .repeat(80));

console.log('People:');
allPeople.forEach(person => {
  console.log(`  ${person.first_name} ${person.last_name} (ID: ${person.id}, DOB: ${person.date_of_birth}${person.date_of_death ? ', DOD: ' + person.date_of_death : ''})`);
});

console.log('\nRelationships:');
relationships.forEach(rel => {
  const sourcePerson = allPeople.find(p => p.id === rel.source);
  const targetPerson = allPeople.find(p => p.id === rel.target);
  console.log(`  ${sourcePerson.first_name} ${sourcePerson.last_name} → ${targetPerson.first_name} ${targetPerson.last_name} (${rel.type})`);
});

console.log('\nTesting Relationships to Michael Doe:');
console.log('=' .repeat(50));

const michael = allPeople.find(p => p.first_name === 'Michael' && p.last_name === 'Doe');
const richard = allPeople.find(p => p.first_name === 'Richard' && p.last_name === 'Sharma');
const margaret = allPeople.find(p => p.first_name === 'Margaret' && p.last_name === 'Sharma');
const jane = allPeople.find(p => p.first_name === 'Jane' && p.last_name === 'Doe');

console.log(`Root person: ${michael.first_name} ${michael.last_name} (born ${michael.date_of_birth})`);
console.log(`Jane Doe died: ${jane.date_of_death}`);
console.log(`Time gap: ${((new Date(michael.date_of_birth) - new Date(jane.date_of_death)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} years`);

console.log('\nCalculating relationships:');

try {
  // Test Richard → Michael
  const richardToMichael = calculateRelationshipToRoot(richard, michael, allPeople, relationships);
  console.log(`✓ Richard Sharma → Michael Doe: "${richardToMichael}"`);
  
  // Test Margaret → Michael
  const margaretToMichael = calculateRelationshipToRoot(margaret, michael, allPeople, relationships);
  console.log(`✓ Margaret Sharma → Michael Doe: "${margaretToMichael}"`);
  
  console.log('\nExpected Results:');
  console.log('- Both relationships should be "Unrelated"');
  console.log('- Reason: Jane (the connecting link) died before Michael was born');
  console.log('- Timeline validation should prevent relationship through deceased person');
  
  console.log('\nActual Results:');
  console.log(`- Richard → Michael: ${richardToMichael === 'Unrelated' ? '✅ CORRECT' : '❌ INCORRECT'} ("${richardToMichael}")`);
  console.log(`- Margaret → Michael: ${margaretToMichael === 'Unrelated' ? '✅ CORRECT' : '❌ INCORRECT'} ("${margaretToMichael}")`);
  
  if (richardToMichael === 'Unrelated' && margaretToMichael === 'Unrelated') {
    console.log('\n🎉 SUCCESS: Timeline validation is working correctly!');
    console.log('The relationship calculator properly identifies that relationships');
    console.log('cannot exist when the connecting person died before the target was born.');
  } else {
    console.log('\n⚠️ ISSUE DETECTED: Timeline validation may need adjustment');
    console.log('The relationship calculator should return "Unrelated" for both cases.');
  }
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error(error.stack);
}