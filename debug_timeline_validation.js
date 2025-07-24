/**
 * Debug timeline validation for Alice-Michael step-sibling case
 */

// Copy the timeline validation logic to debug it
function debugTimelineValidation(aliceId, michaelId, relationships, allPeople) {
    const parentToChildren = new Map();
    const childToParents = new Map();
    const spouseMap = new Map();
    const deceasedSpouseMap = new Map();

    // Build maps (simplified)
    relationships.forEach(rel => {
        const source = String(rel.source);
        const target = String(rel.target);
        const type = rel.type;
        
        if (type === 'parent') {
            if (!parentToChildren.has(source)) {
                parentToChildren.set(source, new Set());
            }
            parentToChildren.get(source).add(target);
            
            if (!childToParents.has(target)) {
                childToParents.set(target, new Set());
            }
            childToParents.get(target).add(source);
        } else if (type === 'spouse') {
            if (rel.is_deceased) {
                if (!deceasedSpouseMap.has(source)) {
                    deceasedSpouseMap.set(source, new Set());
                }
                if (!deceasedSpouseMap.has(target)) {
                    deceasedSpouseMap.set(target, new Set());
                }
                deceasedSpouseMap.get(source).add(target);
                deceasedSpouseMap.get(target).add(source);
            } else {
                if (!spouseMap.has(source)) {
                    spouseMap.set(source, new Set());
                }
                if (!spouseMap.has(target)) {
                    spouseMap.set(target, new Set());
                }
                spouseMap.get(source).add(target);
                spouseMap.get(target).add(source);
            }
        }
    });

    console.log('=== TIMELINE VALIDATION DEBUG ===');
    console.log(`Testing Alice (${aliceId}) and Michael (${michaelId})`);
    
    const aliceObj = allPeople.find(p => String(p.id) === aliceId);
    const michaelObj = allPeople.find(p => String(p.id) === michaelId);
    
    console.log(`Alice: born ${aliceObj.date_of_birth}`);
    console.log(`Michael: born ${michaelObj.date_of_birth}`);
    
    console.log('\nChecking deceased spouses:');
    console.log('deceasedSpouseMap:', Array.from(deceasedSpouseMap.entries()).map(([k,v]) => [k, Array.from(v)]));
    
    // Check timeline validation logic
    for (const [spouseId, deceasedSpouses] of deceasedSpouseMap) {
        for (const deceasedSpouse of deceasedSpouses) {
            const deceasedPerson = allPeople.find(p => String(p.id) === String(deceasedSpouse));
            console.log(`\nChecking deceased person: ${deceasedPerson.first_name} (ID: ${deceasedSpouse})`);
            console.log(`  Died: ${deceasedPerson.date_of_death}`);
            
            if (deceasedPerson && deceasedPerson.date_of_death) {
                const deathDate = new Date(deceasedPerson.date_of_death);
                
                // Check Alice
                if (aliceObj.date_of_birth) {
                    const aliceBirth = new Date(aliceObj.date_of_birth);
                    const aliceBornAfterDeath = aliceBirth > deathDate;
                    console.log(`  Alice born after death? ${aliceBornAfterDeath} (Alice: ${aliceBirth.toISOString()}, Death: ${deathDate.toISOString()})`);
                    
                    if (aliceBornAfterDeath) {
                        console.log(`  Checking if deceased ${deceasedSpouse} connects Alice ${aliceId} to Michael ${michaelId}...`);
                        
                        // Debug the connecting logic
                        const isConnecting = debugIsDeceasedConnecting(deceasedSpouse, aliceId, michaelId, childToParents, parentToChildren);
                        console.log(`  Is connecting? ${isConnecting}`);
                        
                        if (isConnecting) {
                            console.log(`  ❌ TIMELINE VALIDATION WOULD BLOCK: Alice born after ${deceasedPerson.first_name} died`);
                            return false;
                        }
                    }
                }
                
                // Check Michael
                if (michaelObj.date_of_birth) {
                    const michaelBirth = new Date(michaelObj.date_of_birth);
                    const michaelBornAfterDeath = michaelBirth > deathDate;
                    console.log(`  Michael born after death? ${michaelBornAfterDeath} (Michael: ${michaelBirth.toISOString()}, Death: ${deathDate.toISOString()})`);
                    
                    if (michaelBornAfterDeath) {
                        console.log(`  Checking if deceased ${deceasedSpouse} connects Michael ${michaelId} to Alice ${aliceId}...`);
                        
                        const isConnecting = debugIsDeceasedConnecting(deceasedSpouse, michaelId, aliceId, childToParents, parentToChildren);
                        console.log(`  Is connecting? ${isConnecting}`);
                        
                        if (isConnecting) {
                            console.log(`  ❌ TIMELINE VALIDATION WOULD BLOCK: Michael born after ${deceasedPerson.first_name} died`);
                            return false;
                        }
                    }
                }
            }
        }
    }
    
    console.log('\n✅ Timeline validation passes - no blocking detected');
    return true;
}

function debugIsDeceasedConnecting(deceasedId, personId, rootId, childToParents, parentToChildren) {
    console.log(`    Debug connecting check: deceased=${deceasedId}, person=${personId}, root=${rootId}`);
    
    // Simplified version of isDescendantOf
    const isPersonDescendant = isDescendantOfDebug(personId, deceasedId, parentToChildren);
    const isRootDescendant = isDescendantOfDebug(rootId, deceasedId, parentToChildren);
    
    console.log(`    Person descendant of deceased? ${isPersonDescendant}`);
    console.log(`    Root descendant of deceased? ${isRootDescendant}`);
    
    if (isPersonDescendant && isRootDescendant) {
        console.log(`    Both descendants - not connecting`);
        return false;
    }
    
    if (!isPersonDescendant && !isRootDescendant) {
        console.log(`    Neither descendant - not connecting`);
        return false;
    }
    
    // Check shared parents
    const personParents = childToParents.get(personId) || new Set();
    const rootParents = childToParents.get(rootId) || new Set();
    const sharedParents = [...personParents].filter(parent => rootParents.has(parent));
    
    console.log(`    Person parents: [${Array.from(personParents)}]`);
    console.log(`    Root parents: [${Array.from(rootParents)}]`);
    console.log(`    Shared parents: [${sharedParents}]`);
    console.log(`    Deceased in shared parents? ${sharedParents.includes(deceasedId)}`);
    
    if (sharedParents.length > 0 && !sharedParents.includes(deceasedId)) {
        console.log(`    They have other connecting parents - deceased not required`);
        return false;
    }
    
    console.log(`    Deceased IS connecting them`);
    return true;
}

function isDescendantOfDebug(descendantId, ancestorId, parentToChildren) {
    const visited = new Set();
    const queue = [ancestorId];
    
    while (queue.length > 0) {
        const currentId = queue.shift();
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        
        const children = parentToChildren.get(currentId) || new Set();
        if (children.has(descendantId)) {
            return true;
        }
        
        for (const childId of children) {
            if (!visited.has(childId)) {
                queue.push(childId);
            }
        }
    }
    
    return false;
}

// Test data
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 3, first_name: 'Alice', last_name: 'Doe', gender: 'Female', date_of_birth: '2000-05-15', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false }
];

const relationships = [
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 1, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 3, type: 'parent', is_ex: false, is_deceased: false },
    { source: 3, target: 2, type: 'child', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

debugTimelineValidation('3', '13', relationships, allPeople);