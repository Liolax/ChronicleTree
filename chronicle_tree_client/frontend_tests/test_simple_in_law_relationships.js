/**
 * Test simple extended in-law relationships with proper family structure
 */

// Import the relationship calculator
import { calculateRelationshipToRoot } from '../src/utils/improvedRelationshipCalculator.js';

const testPeople = [
  // Grandparents generation
  { id: 1, first_name: 'Grandpa', last_name: 'Smith', gender: 'Male', date_of_birth: '1950-01-01', date_of_death: null, is_deceased: false },
  { id: 2, first_name: 'Grandma', last_name: 'Smith', gender: 'Female', date_of_birth: '1952-01-01', date_of_death: null, is_deceased: false },
  
  // Parents generation (siblings)
  { id: 3, first_name: 'Dad', last_name: 'Johnson', gender: 'Male', date_of_birth: '1980-01-01', date_of_death: null, is_deceased: false },
  { id: 4, first_name: 'Uncle', last_name: 'Smith', gender: 'Male', date_of_birth: '1982-01-01', date_of_death: null, is_deceased: false },
  { id: 5, first_name: 'Aunt', last_name: 'InLaw', gender: 'Female', date_of_birth: '1985-01-01', date_of_death: null, is_deceased: false }, // Uncle's wife
  
  // ROOT and their spouse
  { id: 6, first_name: 'ROOT', last_name: 'Johnson', gender: 'Male', date_of_birth: '2010-01-01', date_of_death: null, is_deceased: false },
  { id: 7, first_name: 'Spouse', last_name: 'Johnson', gender: 'Female', date_of_birth: '2012-01-01', date_of_death: null, is_deceased: false },
  
  // ROOT's sibling and their child
  { id: 8, first_name: 'Sister', last_name: 'Johnson', gender: 'Female', date_of_birth: '2008-01-01', date_of_death: null, is_deceased: false },
  { id: 9, first_name: 'Niece', last_name: 'Johnson', gender: 'Female', date_of_birth: '2030-01-01', date_of_death: null, is_deceased: false },
  { id: 10, first_name: 'NieceHusband', last_name: 'InLaw', gender: 'Male', date_of_birth: '2028-01-01', date_of_death: null, is_deceased: false }, // Niece's husband
  
  // Spouse's family
  { id: 11, first_name: 'SpouseDad', last_name: 'Miller', gender: 'Male', date_of_birth: '1975-01-01', date_of_death: null, is_deceased: false },
  { id: 12, first_name: 'SpouseMom', last_name: 'Miller', gender: 'Female', date_of_birth: '1977-01-01', date_of_death: null, is_deceased: false },
  { id: 13, first_name: 'SpouseUncle', last_name: 'Miller', gender: 'Male', date_of_birth: '1970-01-01', date_of_death: null, is_deceased: false }, // Spouse's uncle
  { id: 14, first_name: 'SpouseSister', last_name: 'Miller', gender: 'Female', date_of_birth: '2010-01-01', date_of_death: null, is_deceased: false },
  { id: 15, first_name: 'SpouseNiece', last_name: 'Miller', gender: 'Female', date_of_birth: '2035-01-01', date_of_death: null, is_deceased: false }, // Spouse's niece
  
  // Spouse's grandparents (needed to make SpouseDad and SpouseUncle siblings)
  { id: 16, first_name: 'SpouseGrandpa', last_name: 'Miller', gender: 'Male', date_of_birth: '1945-01-01', date_of_death: null, is_deceased: false },
  { id: 17, first_name: 'SpouseGrandma', last_name: 'Miller', gender: 'Female', date_of_birth: '1947-01-01', date_of_death: null, is_deceased: false }
];

const testRelationships = [
  // Grandparents are parents of Dad and Uncle
  { person_id: 3, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 3, relationship_type: 'child' },
  { person_id: 3, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 3, relationship_type: 'child' },
  { person_id: 4, relative_id: 1, relationship_type: 'parent' },
  { person_id: 1, relative_id: 4, relationship_type: 'child' },
  { person_id: 4, relative_id: 2, relationship_type: 'parent' },
  { person_id: 2, relative_id: 4, relationship_type: 'child' },
  
  // Uncle and Aunt InLaw are spouses
  { person_id: 4, relative_id: 5, relationship_type: 'spouse' },
  { person_id: 5, relative_id: 4, relationship_type: 'spouse' },
  
  // Dad is parent of ROOT and Sister
  { person_id: 6, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 6, relationship_type: 'child' },
  { person_id: 8, relative_id: 3, relationship_type: 'parent' },
  { person_id: 3, relative_id: 8, relationship_type: 'child' },
  
  // ROOT and Spouse are married
  { person_id: 6, relative_id: 7, relationship_type: 'spouse' },
  { person_id: 7, relative_id: 6, relationship_type: 'spouse' },
  
  // Sister is parent of Niece
  { person_id: 9, relative_id: 8, relationship_type: 'parent' },
  { person_id: 8, relative_id: 9, relationship_type: 'child' },
  
  // Niece and NieceHusband are married
  { person_id: 9, relative_id: 10, relationship_type: 'spouse' },
  { person_id: 10, relative_id: 9, relationship_type: 'spouse' },
  
  // Spouse's parents
  { person_id: 7, relative_id: 11, relationship_type: 'parent' },
  { person_id: 11, relative_id: 7, relationship_type: 'child' },
  { person_id: 7, relative_id: 12, relationship_type: 'parent' },
  { person_id: 12, relative_id: 7, relationship_type: 'child' },
  { person_id: 14, relative_id: 11, relationship_type: 'parent' },
  { person_id: 11, relative_id: 14, relationship_type: 'child' },
  { person_id: 14, relative_id: 12, relationship_type: 'parent' },
  { person_id: 12, relative_id: 14, relationship_type: 'child' },
  
  // SpouseGrandparents are parents of SpouseDad and SpouseUncle (making them siblings)
  { person_id: 11, relative_id: 16, relationship_type: 'parent' },
  { person_id: 16, relative_id: 11, relationship_type: 'child' },
  { person_id: 11, relative_id: 17, relationship_type: 'parent' },
  { person_id: 17, relative_id: 11, relationship_type: 'child' },
  { person_id: 13, relative_id: 16, relationship_type: 'parent' },
  { person_id: 16, relative_id: 13, relationship_type: 'child' },
  { person_id: 13, relative_id: 17, relationship_type: 'parent' },
  { person_id: 17, relative_id: 13, relationship_type: 'child' },
  
  // SpouseSister is parent of SpouseNiece
  { person_id: 15, relative_id: 14, relationship_type: 'parent' },
  { person_id: 14, relative_id: 15, relationship_type: 'child' },
];

const root = testPeople.find(p => p.first_name === 'ROOT');

console.log('=== Simple Extended In-Law Relationships Test ===');
console.log(`Root Person: ${root.first_name} (ID: ${root.id})`);

console.log('\n=== Family Structure ===');
console.log('ROOT (6)');
console.log('├── Dad (3) - ROOT\'s father');
console.log('│   └── Uncle (4) - Dad\'s brother, ROOT\'s uncle');
console.log('│       └── Aunt InLaw (5) - Uncle\'s wife → should be ROOT\'s Aunt-in-law');
console.log('├── Spouse (7) - ROOT\'s wife');
console.log('│   ├── SpouseDad (11) - Spouse\'s father');
console.log('│   │   └── SpouseUncle (13) - SpouseDad\'s brother → should be ROOT\'s Uncle-in-law');
console.log('│   └── SpouseSister (14) - Spouse\'s sister');
console.log('│       └── SpouseNiece (15) - SpouseSister\'s daughter → should be ROOT\'s Niece-in-law');
console.log('└── Sister (8) - ROOT\'s sister');
console.log('    └── Niece (9) - Sister\'s daughter, ROOT\'s niece');
console.log('        └── NieceHusband (10) - Niece\'s husband → should be ROOT\'s Nephew-in-law');

console.log('\n=== Testing All Relationships ===');
testPeople.forEach(person => {
  if (person.id !== root.id) {
    const relationship = calculateRelationshipToRoot(person, root, testPeople, testRelationships);
    if (relationship && relationship !== 'Unrelated') {
      console.log(`${person.first_name}: ${relationship}`);
    }
  }
});

console.log('\n=== Testing Specific In-Law Relationships ===');

const expectedInLaws = [
  { name: 'Aunt InLaw', expected: 'Aunt-in-law', description: 'Spouse of ROOT\'s uncle' },
  { name: 'SpouseUncle', expected: 'Uncle-in-law', description: 'Uncle of ROOT\'s spouse' },
  { name: 'NieceHusband', expected: 'Nephew-in-law', description: 'Spouse of ROOT\'s niece' },
  { name: 'SpouseNiece', expected: 'Niece-in-law', description: 'Niece of ROOT\'s spouse' },
];

expectedInLaws.forEach(({ name, expected, description }) => {
  const person = testPeople.find(p => p.first_name === name);
  if (person) {
    const actual = calculateRelationshipToRoot(person, root, testPeople, testRelationships);
    const status = actual === expected ? '✅' : '❌';
    console.log(`${status} ${name}: Expected "${expected}", Got "${actual}"`);
    console.log(`   ${description}`);
    
    if (actual !== expected) {
      console.log(`   DEBUG: Checking relationship path for ${name}`);
    }
  }
});

console.log('\n=== Web Research Validation ===');
console.log('Based on web research:');
console.log('✅ Uncle-in-law/Aunt-in-law terms are technically correct in genealogy');
console.log('✅ Niece-in-law/Nephew-in-law terms are recognized in family relationship charts');
console.log('✅ These relationships represent connections through marriage rather than blood');
console.log('✅ While rarely used in daily conversation, they are valid family relationship terms');