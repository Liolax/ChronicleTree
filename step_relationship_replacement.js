/**
 * CORRECT STEP-RELATIONSHIP LOGIC
 * Business Rule: Only direct marriage connections create step-relationships.
 * All other relatives of step-family members are "Unrelated".
 */

// === STEP-PARENT RELATIONSHIP ===
// Person is step-parent of root if: person marries root's biological parent, but is not root's biological parent
function checkStepParentRelationship(personId, rootId, rootParents, spouseMap, deceasedSpouseMap, exSpouseMap, allPeople) {
  for (const parent of rootParents) {
    // Check current spouses of root's parent
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (spouse === personId && !rootParents.has(personId)) {
        return getGenderSpecificRelation(personId, 'Step-Father', 'Step-Mother', allPeople, 'Step-Parent');
      }
    }
    
    // Check deceased spouses of root's parent (if they were alive when root was born)
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    for (const deceasedSpouse of parentDeceasedSpouses) {
      if (deceasedSpouse === personId && !rootParents.has(personId)) {
        // Timeline validation: deceased spouse must have been alive when root was born
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        const rootObj = allPeople.find(p => String(p.id) === String(rootId));
        
        if (personObj && rootObj && personObj.date_of_death && rootObj.date_of_birth) {
          const deathDate = new Date(personObj.date_of_death);
          const birthDate = new Date(rootObj.date_of_birth);
          
          // If root was born after person's death, no step-parent relationship exists
          if (birthDate > deathDate) {
            continue;
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Father', 'Step-Mother', allPeople, 'Step-Parent');
      }
    }
    
    // Ex-spouses do not create step-relationships
  }
  return null;
}

// === STEP-CHILD RELATIONSHIP ===  
// Person is step-child of root if: root marries person's biological parent, but is not person's biological parent
function checkStepChildRelationship(personId, rootId, personParents, spouseMap, deceasedSpouseMap, exSpouseMap, allPeople) {
  for (const parent of personParents) {
    // Check current spouses of person's parent
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (spouse === rootId && !personParents.has(rootId)) {
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
    
    // Check deceased spouses of person's parent (if they were alive when person was born)
    const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
    for (const deceasedSpouse of parentDeceasedSpouses) {
      if (deceasedSpouse === rootId && !personParents.has(rootId)) {
        // Timeline validation: deceased spouse must have been alive when person was born
        const rootObj = allPeople.find(p => String(p.id) === String(rootId));
        const personObj = allPeople.find(p => String(p.id) === String(personId));
        
        if (rootObj && personObj && rootObj.date_of_death && personObj.date_of_birth) {
          const deathDate = new Date(rootObj.date_of_death);
          const birthDate = new Date(personObj.date_of_birth);
          
          // If person was born after root's death, no step-child relationship exists
          if (birthDate > deathDate) {
            continue;
          }
        }
        
        return getGenderSpecificRelation(personId, 'Step-Son', 'Step-Daughter', allPeople, 'Step-Child');
      }
    }
    
    // Ex-spouses do not create step-relationships
  }
  return null;
}

// === STEP-SIBLING RELATIONSHIP ===
// Person is step-sibling of root if: they share a step-parent but no biological parents
// IMPORTANT: Only direct children of step-parent, not extended step-family
function checkStepSiblingRelationship(personId, rootId, personParents, rootParents, spouseMap, parentToChildren, allPeople) {
  // Find root's step-parents (people married to root's biological parents, but not root's biological parents)
  const rootStepParents = new Set();
  for (const parent of rootParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (!rootParents.has(spouse)) {
        rootStepParents.add(spouse);
      }
    }
  }
  
  // Find person's step-parents (people married to person's biological parents, but not person's biological parents)
  const personStepParents = new Set();
  for (const parent of personParents) {
    const parentSpouses = spouseMap.get(parent) || new Set();
    for (const spouse of parentSpouses) {
      if (!personParents.has(spouse)) {
        personStepParents.add(spouse);
      }
    }
  }
  
  // Check if person is biological child of any of root's step-parents
  // AND they share no biological parents (to exclude half-siblings)
  for (const stepParent of rootStepParents) {
    if (personParents.has(stepParent)) {
      // Verify they share no biological parents
      const sharedBioParents = new Set([...personParents].filter(p => rootParents.has(p)));
      if (sharedBioParents.size === 0) {
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  // Check if root is biological child of any of person's step-parents
  // AND they share no biological parents (to exclude half-siblings)
  for (const stepParent of personStepParents) {
    if (rootParents.has(stepParent)) {
      // Verify they share no biological parents
      const sharedBioParents = new Set([...personParents].filter(p => rootParents.has(p)));
      if (sharedBioParents.size === 0) {
        return getGenderSpecificRelation(personId, 'Step-Brother', 'Step-Sister', allPeople, 'Step-Sibling');
      }
    }
  }
  
  return null;
}

