/**
 * Debug script with console logging
 */

// Temporarily modify the calculator to add debug logging
import fs from 'fs';

// Read the original file
const calculatorPath = './src/utils/improvedRelationshipCalculator.js';
let calculatorCode = fs.readFileSync(calculatorPath, 'utf8');

// Add debug logging to step-sibling logic
const debugStepFunction = `
const findStepRelationship = (personId, rootId, relationshipMaps, allPeople) => {
  const { childToParents, spouseMap, deceasedSpouseMap } = relationshipMaps;
  
  console.log(\`\\n=== DEBUG: findStepRelationship(\${personId}, \${rootId}) ===\`);
  
  // Check for step-parent relationship
  // Person is step-parent of root if: person is spouse of root's parent, but not root's biological parent
  const rootParents = childToParents.get(rootId) || new Set();
  console.log(\`Root (\${rootId}) parents:\`, [...rootParents]);
  
  for (const parent of rootParents) {
    // Check if person is current spouse of this parent
    if (spouseMap.has(parent) && spouseMap.get(parent).has(personId)) {
      console.log(\`Person \${personId} is spouse of \${parent}\`);
      // Make sure person is not a biological parent of root
      if (!rootParents.has(personId)) {
        console.log(\`Person \${personId} is NOT a biological parent of \${rootId} - STEP-PARENT\`);
        return getGenderSpecificRelation(personId, 'Step-Father', 'Step-Mother', allPeople, 'Step-Parent');
      }
    }
    // Check if person is deceased spouse of this parent
    if (deceasedSpouseMap.has(parent) && deceasedSpouseMap.get(parent).has(personId)) {
      console.log(\`Person \${personId} is deceased spouse of \${parent}\`);
      // Make sure person is not a biological parent of root
      if (!rootParents.has(personId)) {
        console.log(\`Person \${personId} is NOT a biological parent of \${rootId} - LATE STEP-PARENT\`);
        return getGenderSpecificRelation(personId, 'Late Step-Father', 'Late Step-Mother', allPeople, 'Late Step-Parent');
      }
    }
  }
  
  // Check for step-child relationship
  // Person is step-child of root if: root is spouse of person's parent, but not person's biological parent
  const personParents = childToParents.get(personId) || new Set();
  console.log(\`Person (\${personId}) parents:\`, [...personParents]);
  
  for (const parent of personParents) {
    // Check if root is current spouse of this parent
    if (spouseMap.has(parent) && spouseMap.get(parent).has(rootId)) {
      console.log(\`Root \${rootId} is spouse of \${parent}\`);
      // Make sure root is not a biological parent of person
      if (!personParents.has(rootId)) {
        console.log(\`Root \${rootId} is NOT a biological parent of \${personId} - STEP-CHILD\`);
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
    // Check if root is deceased spouse of this parent
    if (deceasedSpouseMap.has(parent) && deceasedSpouseMap.get(parent).has(rootId)) {
      console.log(\`Root \${rootId} is deceased spouse of \${parent}\`);
      // Make sure root is not a biological parent of person
      if (!personParents.has(rootId)) {
        console.log(\`Root \${rootId} is NOT a biological parent of \${personId} - STEP-CHILD\`);
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
  }
  
  // Check for step-sibling relationship
  console.log(\`Checking step-sibling relationship...\`);
  
  // Person is step-sibling of root if: they share a step-parent but no biological parents
  const rootStepParents = new Set();
  const personStepParents = new Set();
  
  // Find root's step-parents
  for (const parent of rootParents) {
    console.log(\`Checking root's parent \${parent} for spouses...\`);
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    console.log(\`Parent \${parent} spouses:\`, [...parentSpouses]);
    console.log(\`Parent \${parent} deceased spouses:\`, [...parentDeceasedSpouses]);
    
    [...parentSpouses, ...parentDeceasedSpouses].forEach(spouse => {
      console.log(\`Checking if spouse \${spouse} is step-parent of root \${rootId}\`);
      if (!rootParents.has(spouse)) {
        console.log(\`Spouse \${spouse} is NOT a biological parent of \${rootId} - adding as step-parent\`);
        rootStepParents.add(spouse);
      } else {
        console.log(\`Spouse \${spouse} IS a biological parent of \${rootId} - NOT a step-parent\`);
      }
    });
  }
  
  // Find person's step-parents
  for (const parent of personParents) {
    console.log(\`Checking person's parent \${parent} for spouses...\`);
    const parentSpouses = spouseMap.get(parent) || new Set();
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    
    [...parentSpouses, ...parentDeceasedSpouses].forEach(spouse => {
      if (!personParents.has(spouse)) {
        personStepParents.add(spouse);
      }
    });
  }
  
  console.log(\`Root (\${rootId}) step-parents:\`, [...rootStepParents]);
  console.log(\`Person (\${personId}) step-parents:\`, [...personStepParents]);
  
  // Check if person is child of any of root's step-parents
  for (const stepParent of rootStepParents) {
    console.log(\`Checking if person \${personId} is child of root's step-parent \${stepParent}\`);
    if (personParents.has(stepParent)) {
      console.log(\`YES! Person \${personId} has step-parent \${stepParent} as biological parent\`);
      // Make sure they don't share any biological parents
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      console.log(\`Shared biological parents:\`, sharedBioParents);
      if (sharedBioParents.length === 0) {
        console.log(\`No shared biological parents - STEP-SIBLING!\`);
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      } else {
        console.log(\`They share biological parents - not step-siblings\`);
      }
    }
  }
  
  // Check if root is child of any of person's step-parents
  for (const stepParent of personStepParents) {
    console.log(\`Checking if root \${rootId} is child of person's step-parent \${stepParent}\`);
    if (rootParents.has(stepParent)) {
      console.log(\`YES! Root \${rootId} has step-parent \${stepParent} as biological parent\`);
      // Make sure they don't share any biological parents
      const sharedBioParents = [...rootParents].filter(parent => personParents.has(parent));
      console.log(\`Shared biological parents:\`, sharedBioParents);
      if (sharedBioParents.length === 0) {
        console.log(\`No shared biological parents - STEP-SIBLING!\`);
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      } else {
        console.log(\`They share biological parents - not step-siblings\`);
      }
    }
  }
  
  console.log(\`No step-relationship found\`);
  return null;
};
`;

// Replace the function in the code
const functionRegex = /const findStepRelationship = \(personId, rootId, relationshipMaps, allPeople\) => \{[\s\S]*?\n\s*return null;\n\};/;
const modifiedCode = calculatorCode.replace(functionRegex, debugStepFunction.trim());

// Write the modified code to a temporary file
fs.writeFileSync('./debug-calculator.js', modifiedCode);

console.log('Debug calculator created. Testing...');

// Now run the test with debug logging
import('./debug-calculator.js').then(module => {
  const { calculateRelationshipToRoot } = module;
  
  const testPeople = [
    { id: '1', first_name: 'John', last_name: 'Doe', gender: 'Male', is_deceased: false },     
    { id: '2', first_name: 'Jane', last_name: 'Doe', gender: 'Female', is_deceased: true },   
    { id: '3', first_name: 'Alice', last_name: 'Doe', gender: 'Female', is_deceased: false }, 
    { id: '5', first_name: 'Lisa', last_name: 'Doe', gender: 'Female', is_deceased: false },  
    { id: '6', first_name: 'Michael', last_name: 'Doe', gender: 'Male', is_decoded: false }  
  ];

  const testRelationships = [
    // John-Lisa marriage (current)
    { source: '1', target: '5', relationship_type: 'spouse', is_ex: false, is_deceased: false },  
    { source: '5', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: false },
    
    // John-Jane marriage (deceased)
    { source: '1', target: '2', relationship_type: 'spouse', is_ex: false, is_deceased: true },  
    { source: '2', target: '1', relationship_type: 'spouse', is_ex: false, is_deceased: true },
    
    // John-Alice parent relationship (from previous marriage with Jane)
    { source: '1', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   
    { source: '3', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
    { source: '2', target: '3', relationship_type: 'child', is_ex: false, is_deceased: false },   
    { source: '3', target: '2', relationship_type: 'parent', is_ex: false, is_deceased: false }, 
    
    // John-Michael and Lisa-Michael parent relationships (current marriage)
    { source: '1', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   
    { source: '6', target: '1', relationship_type: 'parent', is_ex: false, is_deceased: false },  
    { source: '5', target: '6', relationship_type: 'child', is_ex: false, is_deceased: false },   
    { source: '6', target: '5', relationship_type: 'parent', is_ex: false, is_deceased: false }
  ];
  
  const alice = testPeople.find(p => p.id === '3');
  const michael = testPeople.find(p => p.id === '6');
  
  console.log('\\n=== TESTING Michael to Alice ===');
  const result = calculateRelationshipToRoot(michael, alice, testPeople, testRelationships);
  console.log(\`Result: \${result}\`);
});
