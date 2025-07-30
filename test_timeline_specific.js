// Test specific timeline validation issues between Lisa and Emily
import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

console.log("=== Testing Timeline Validation Issues ===");

// Test with actual birth dates
const actualPeople = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false },
  { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1993-01-01', date_of_death: null, is_deceased: false },
  { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', date_of_death: null, is_deceased: false }
];

const relationships = [
  { person_id: 1, relative_id: 12, relationship_type: 'spouse', is_ex: false },
  { person_id: 12, relative_id: 1, relationship_type: 'spouse', is_ex: false },
  { person_id: 1, relative_id: 3, relationship_type: 'child', is_ex: false },
  { person_id: 3, relative_id: 1, relationship_type: 'parent', is_ex: false },
  { person_id: 3, relative_id: 6, relationship_type: 'child', is_ex: false },
  { person_id: 6, relative_id: 3, relationship_type: 'parent', is_ex: false },
  { person_id: 4, relative_id: 6, relationship_type: 'child', is_ex: false },
  { person_id: 6, relative_id: 4, relationship_type: 'parent', is_ex: false },
  { person_id: 3, relative_id: 4, relationship_type: 'spouse', is_ex: true },
  { person_id: 4, relative_id: 3, relationship_type: 'spouse', is_ex: true }
];

const lisa = actualPeople.find(p => p.id === 12);
const emily = actualPeople.find(p => p.id === 6);

console.log("\n--- Actual Birth Dates ---");
console.log(`Lisa birth: ${lisa.date_of_birth} (age ${2025 - 1994} years)`);
console.log(`Emily birth: ${emily.date_of_birth} (age ${2025 - 2019} years)`);
console.log(`Age difference: ${1994 - 2019} years (Lisa is older than Emily)`);
console.log("This seems normal for step-grandmother/step-granddaughter relationship");

console.log("\n--- Testing Lisa -> Emily with Actual Dates ---");
try {
  const result = calculateRelationshipToRoot(emily, lisa, actualPeople, relationships);
  console.log(`Result: "${result}"`);
  
  if (result === "Unrelated") {
    console.log("❌ Timeline validation is blocking the relationship!");
    console.log("The algorithm thinks there's a timeline issue, but both are alive");
  } else if (result === "Step-Granddaughter") {
    console.log("✅ Timeline validation passes - relationship works correctly");
  } else {
    console.log(`🤔 Unexpected result: "${result}"`);
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Test with simplified dates (both born on same year)
console.log("\n--- Testing with Same Birth Year (eliminate age gap) ---");
const sameDatePeople = actualPeople.map(p => {
  if (p.id === 6) { // Emily
    return { ...p, date_of_birth: '1994-12-01' }; // Born same year as Lisa
  }
  return p;
});

try {
  const lisa2 = sameDatePeople.find(p => p.id === 12);
  const emily2 = sameDatePeople.find(p => p.id === 6);
  const result = calculateRelationshipToRoot(emily2, lisa2, sameDatePeople, relationships);
  console.log(`Result with same birth year: "${result}"`);
  
  if (result === "Step-Granddaughter") {
    console.log("✅ Same birth year works - age gap was the issue!");
  } else {
    console.log("❌ Still not working - age gap wasn't the issue");
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}

// Test if the issue is with Lisa being younger than expected for a step-grandmother
console.log("\n--- Age Analysis ---");
console.log("Lisa born: 1994 (30 years old)");  
console.log("Emily born: 2019 (6 years old)");
console.log("Lisa was 25 when Emily was born");
console.log("This is VERY young for a step-grandmother relationship");
console.log("The algorithm might have age validation that blocks unrealistic relationships");

// Test with realistic step-grandmother age
console.log("\n--- Testing with Realistic Step-Grandmother Age ---");
const realisticPeople = actualPeople.map(p => {
  if (p.id === 12) { // Lisa - make her older
    return { ...p, date_of_birth: '1960-06-10' }; // Born 1960 instead of 1994
  }
  return p;
});

try {
  const lisa3 = realisticPeople.find(p => p.id === 12);
  const emily3 = realisticPeople.find(p => p.id === 6);
  console.log(`Lisa realistic age: born ${lisa3.date_of_birth} (${2025 - 1960} years old)`);
  console.log(`Emily age: born ${emily3.date_of_birth} (${2025 - 2019} years old)`);
  
  const result = calculateRelationshipToRoot(emily3, lisa3, realisticPeople, relationships);
  console.log(`Result with realistic ages: "${result}"`);
  
  if (result === "Step-Granddaughter") {
    console.log("🎯 FOUND THE ISSUE! Age validation blocks young step-grandparents");
  }
} catch (error) {
  console.log(`ERROR: ${error.message}`);
}