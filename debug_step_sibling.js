/**
 * Debug step-sibling detection for Alice and Michael
 */

// Copy the relationship building logic to understand what maps are created
function debugStepSiblingLogic(relationships, allPeople) {
    const parentToChildren = new Map();
    const childToParents = new Map();
    const spouseMap = new Map();
    const deceasedSpouseMap = new Map();
    const exSpouseMap = new Map();

    console.log('=== BUILDING RELATIONSHIP MAPS ===');
    
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
            const isEx = rel.is_ex;
            const isDeceased = rel.is_deceased;
            
            if (isEx) {
                if (!exSpouseMap.has(source)) {
                    exSpouseMap.set(source, new Set());
                }
                if (!exSpouseMap.has(target)) {
                    exSpouseMap.set(target, new Set());
                }
                exSpouseMap.get(source).add(target);
                exSpouseMap.get(target).add(source);
            } else if (isDeceased) {
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
    
    console.log('Maps built successfully');
    console.log('parentToChildren:', Array.from(parentToChildren.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('childToParents:', Array.from(childToParents.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('spouseMap:', Array.from(spouseMap.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('deceasedSpouseMap:', Array.from(deceasedSpouseMap.entries()).map(([k,v]) => [k, Array.from(v)]));
    
    // Now debug the step-sibling logic specifically
    const aliceId = '3';
    const michaelId = '13';
    
    console.log('\n=== STEP-SIBLING DETECTION DEBUG ===');
    console.log(`Alice ID: ${aliceId}, Michael ID: ${michaelId}`);
    
    // Get parents
    const aliceParents = childToParents.get(aliceId) || new Set();
    const michaelParents = childToParents.get(michaelId) || new Set();
    
    console.log(`Alice's parents: [${Array.from(aliceParents)}]`);
    console.log(`Michael's parents: [${Array.from(michaelParents)}]`);
    
    // Find Alice's step-parents (spouses of Alice's parents who are not Alice's biological parents)
    const aliceStepParents = new Set();
    for (const parent of aliceParents) {
        const parentSpouses = spouseMap.get(parent) || new Set();
        const parentDeceasedSpouses = deceasedSpouseMap.get(parent) || new Set();
        [...parentSpouses, ...parentDeceasedSpouses].forEach(spouse => {
            if (!aliceParents.has(spouse)) {
                aliceStepParents.add(spouse);
            }
        });
    }
    
    console.log(`Alice's step-parents: [${Array.from(aliceStepParents)}]`);
    
    // Check if Michael is child of any of Alice's step-parents
    console.log('\nChecking if Michael is child of Alice\'s step-parents:');
    for (const stepParent of aliceStepParents) {
        const isChild = michaelParents.has(stepParent);
        console.log(`- Is Michael child of step-parent ${stepParent}? ${isChild}`);
        
        if (isChild) {
            // Check if they share biological parents
            const sharedBioParents = [...aliceParents].filter(parent => michaelParents.has(parent));
            console.log(`  Shared biological parents: [${sharedBioParents}]`);
            console.log(`  Alice parents size: ${aliceParents.size}, Michael parents size: ${michaelParents.size}`);
            console.log(`  Shared count: ${sharedBioParents.length}, Max parent count: ${Math.max(aliceParents.size, michaelParents.size)}`);
            
            const areStepSiblings = sharedBioParents.length < Math.max(aliceParents.size, michaelParents.size);
            console.log(`  Are they step-siblings? ${areStepSiblings}`);
            
            if (areStepSiblings) {
                console.log('  ✅ STEP-SIBLING RELATIONSHIP DETECTED!');
                return 'Step-Sibling';
            }
        }
    }
    
    console.log('❌ No step-sibling relationship detected');
    return null;
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

debugStepSiblingLogic(relationships, allPeople);