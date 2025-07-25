/**
 * Comprehensive test for step-grandparent relationships
 * Testing multiple scenarios to ensure robust logic
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Create comprehensive test data with multiple step-grandparent scenarios
const allPeople = [
    // Generation 1: Great-grandparents
    { id: 50, first_name: 'George', last_name: 'Smith', gender: 'Male', date_of_birth: '1940-01-01', is_deceased: false },
    { id: 51, first_name: 'Helen', last_name: 'Smith', gender: 'Female', date_of_birth: '1942-01-01', date_of_death: '2020-01-01', is_deceased: true },
    { id: 52, first_name: 'Margaret', last_name: 'Jones', gender: 'Female', date_of_birth: '1945-01-01', is_deceased: false }, // George's new wife
    
    // Generation 2: Grandparents  
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    
    // Generation 3: Parents
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '1995-01-01', is_deceased: false },
    { id: 4, first_name: 'David', last_name: 'Anderson', gender: 'Male', date_of_birth: '1992-01-01', is_deceased: false },
    
    // Generation 4: Children (testing subjects)
    { id: 5, first_name: 'Bob', last_name: 'Anderson', gender: 'Male', date_of_birth: '2015-01-01', is_deceased: false },
    { id: 6, first_name: 'Emily', last_name: 'Anderson', gender: 'Female', date_of_birth: '2019-01-01', is_deceased: false }
];

// Using correct Rails format
const relationships = [
    // Generation 1 marriages
    { source: 50, target: 51, type: 'spouse', is_ex: false, is_deceased: true },   // George married Helen (deceased)
    { source: 51, target: 50, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 50, target: 52, type: 'spouse', is_ex: false, is_deceased: false },  // George married Margaret (current)
    { source: 52, target: 50, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Generation 1 → 2 relationships
    { source: 1, target: 50, type: 'parent', is_ex: false, is_deceased: false },   // John HAS parent George
    { source: 50, target: 1, type: 'child', is_ex: false, is_deceased: false },    // George HAS child John
    { source: 1, target: 51, type: 'parent', is_ex: false, is_deceased: false },   // John HAS parent Helen
    { source: 51, target: 1, type: 'child', is_ex: false, is_deceased: false },    // Helen HAS child John
    
    // Generation 2 marriages
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },     // John married Jane (deceased)
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },   // John married Lisa (current)
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Generation 2 → 3 relationships
    { source: 3, target: 1, type: 'parent', is_ex: false, is_deceased: false },    // Alice HAS parent John
    { source: 1, target: 3, type: 'child', is_ex: false, is_deceased: false },     // John HAS child Alice
    { source: 3, target: 2, type: 'parent', is_ex: false, is_deceased: false },    // Alice HAS parent Jane
    { source: 2, target: 3, type: 'child', is_ex: false, is_deceased: false },     // Jane HAS child Alice
    
    // Generation 3 marriage
    { source: 3, target: 4, type: 'spouse', is_ex: false, is_deceased: false },    // Alice married David
    { source: 4, target: 3, type: 'spouse', is_ex: false, is_deceased: false },
    
    // Generation 3 → 4 relationships
    { source: 5, target: 3, type: 'parent', is_ex: false, is_deceased: false },    // Bob HAS parent Alice
    { source: 3, target: 5, type: 'child', is_ex: false, is_deceased: false },     // Alice HAS child Bob
    { source: 5, target: 4, type: 'parent', is_ex: false, is_deceased: false },    // Bob HAS parent David
    { source: 4, target: 5, type: 'child', is_ex: false, is_deceased: false },     // David HAS child Bob
    { source: 6, target: 3, type: 'parent', is_ex: false, is_deceased: false },    // Emily HAS parent Alice
    { source: 3, target: 6, type: 'child', is_ex: false, is_deceased: false },     // Alice HAS child Emily
    { source: 6, target: 4, type: 'parent', is_ex: false, is_deceased: false },    // Emily HAS parent David
    { source: 4, target: 6, type: 'child', is_ex: false, is_deceased: false }      // David HAS child Emily
];

console.log('=== COMPREHENSIVE STEP-GRANDPARENT RELATIONSHIP TESTING ===');
console.log('');

console.log('Multi-Generational Family Structure:');
console.log('Generation 1: George + Helen (deceased) → John');
console.log('             George + Margaret (current)');
console.log('Generation 2: John + Jane (deceased) → Alice');
console.log('             John + Lisa (current)');
console.log('Generation 3: Alice + David → Bob, Emily');
console.log('');

const bob = allPeople.find(p => p.first_name === 'Bob');
const emily = allPeople.find(p => p.first_name === 'Emily');
const lisa = allPeople.find(p => p.first_name === 'Lisa');
const margaret = allPeople.find(p => p.first_name === 'Margaret');
const george = allPeople.find(p => p.first_name === 'George');
const john = allPeople.find(p => p.first_name === 'John');

console.log('Testing Step-Grandparent Scenarios:');

try {
    // Scenario 1: Lisa → Bob/Emily (John's current wife to his grandchildren)
    const result1 = calculateRelationshipToRoot(lisa, bob, allPeople, relationships);
    const result2 = calculateRelationshipToRoot(lisa, emily, allPeople, relationships);
    console.log(`✓ Lisa → Bob: "${result1}"`);
    console.log(`✓ Lisa → Emily: "${result2}"`);
    
    // Scenario 2: Margaret → Bob/Emily (George's current wife to his great-grandchildren)
    const result3 = calculateRelationshipToRoot(margaret, bob, allPeople, relationships);
    const result4 = calculateRelationshipToRoot(margaret, emily, allPeople, relationships);
    console.log(`✓ Margaret → Bob: "${result3}"`);
    console.log(`✓ Margaret → Emily: "${result4}"`);
    
    // Scenario 3: Reverse relationships
    const result5 = calculateRelationshipToRoot(bob, lisa, allPeople, relationships);
    const result6 = calculateRelationshipToRoot(emily, margaret, allPeople, relationships);
    console.log(`✓ Bob → Lisa: "${result5}"`);
    console.log(`✓ Emily → Margaret: "${result6}"`);
    
    // Verification: Regular grandparent relationships should still work
    const result7 = calculateRelationshipToRoot(john, bob, allPeople, relationships);
    const result8 = calculateRelationshipToRoot(george, bob, allPeople, relationships);
    console.log(`✓ John → Bob: "${result7}"`);
    console.log(`✓ George → Bob: "${result8}"`);
    
    console.log('');
    console.log('Expected vs Actual Results:');
    console.log(`- Lisa → Bob: Expected "Step-Grandmother", Got "${result1}"`);
    console.log(`- Lisa → Emily: Expected "Step-Grandmother", Got "${result2}"`);
    console.log(`- Margaret → Bob: Expected "Step-Great-Grandmother", Got "${result3}"`);
    console.log(`- Margaret → Emily: Expected "Step-Great-Grandmother", Got "${result4}"`);
    console.log(`- Bob → Lisa: Expected "Step-Grandson", Got "${result5}"`);
    console.log(`- Emily → Margaret: Expected "Step-Great-Granddaughter", Got "${result6}"`);
    console.log(`- John → Bob: Expected "Grandfather", Got "${result7}"`);
    console.log(`- George → Bob: Expected "Great-Grandfather", Got "${result8}"`);
    
    console.log('');
    console.log('Analysis:');
    const correctResults = [
        result1 === 'Step-Grandmother',
        result2 === 'Step-Grandmother', 
        result3 === 'Step-Great-Grandmother',
        result4 === 'Step-Great-Grandmother',
        result5 === 'Step-Grandson',
        result6 === 'Step-Great-Granddaughter',
        result7 === 'Grandfather',
        result8 === 'Great-Grandfather'
    ];
    
    const allCorrect = correctResults.every(result => result);
    
    console.log(`- Step-Grandmother relationships: ${result1 === 'Step-Grandmother' && result2 === 'Step-Grandmother' ? '✅' : '❌'}`);
    console.log(`- Step-Great-Grandmother relationships: ${result3 === 'Step-Great-Grandmother' && result4 === 'Step-Great-Grandmother' ? '✅' : '❌'}`);
    console.log(`- Reverse step relationships: ${result5 === 'Step-Grandson' && result6 === 'Step-Great-Granddaughter' ? '✅' : '❌'}`);
    console.log(`- Regular grandparent relationships: ${result7 === 'Grandfather' && result8 === 'Great-Grandfather' ? '✅' : '❌'}`);
    
    if (allCorrect) {
        console.log('');
        console.log('🎉 SUCCESS: All step-grandparent relationships are working correctly across multiple generations!');
    } else {
        console.log('');
        console.log('⚠️ ISSUE: Some step-grandparent relationships need further refinement');
    }
    
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}