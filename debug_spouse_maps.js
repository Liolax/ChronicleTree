/**
 * Debug the spouse maps to understand why Richard might be connected to Michael
 */

import { calculateRelationshipToRoot } from './chronicle_tree_client/src/utils/improvedRelationshipCalculator.js';

// Copy the buildRelationshipMaps function logic to understand what's happening
function debugRelationshipMaps(relationships, allPeople) {
    const parentToChildren = new Map();
    const childToParents = new Map();
    const spouseMap = new Map();
    const deceasedSpouseMap = new Map();
    const exSpouseMap = new Map();

    console.log('\n=== DEBUGGING RELATIONSHIP MAPS ===');
    
    relationships.forEach((rel, index) => {
        const source = String(rel.source);
        const target = String(rel.target);
        const type = rel.type;
        
        console.log(`\nProcessing relationship ${index + 1}: ${source} -> ${target} (${type})`);
        
        if (type === 'parent') {
            if (!parentToChildren.has(source)) {
                parentToChildren.set(source, new Set());
            }
            parentToChildren.get(source).add(target);
            
            if (!childToParents.has(target)) {
                childToParents.set(target, new Set());
            }
            childToParents.get(target).add(source);
            
            console.log(`  Added parent-child: ${source} -> ${target}`);
        } else if (type === 'spouse') {
            const isEx = rel.is_ex;
            const isDeceased = rel.is_deceased;
            
            console.log(`  Spouse relationship: ex=${isEx}, deceased=${isDeceased}`);
            
            if (isEx) {
                if (!exSpouseMap.has(source)) {
                    exSpouseMap.set(source, new Set());
                }
                if (!exSpouseMap.has(target)) {
                    exSpouseMap.set(target, new Set());
                }
                exSpouseMap.get(source).add(target);
                exSpouseMap.get(target).add(source);
                console.log(`  Added to exSpouseMap: ${source} <-> ${target}`);
            } else if (isDeceased) {
                if (!deceasedSpouseMap.has(source)) {
                    deceasedSpouseMap.set(source, new Set());
                }
                if (!deceasedSpouseMap.has(target)) {
                    deceasedSpouseMap.set(target, new Set());
                }
                deceasedSpouseMap.get(source).add(target);
                deceasedSpouseMap.get(target).add(source);
                console.log(`  Added to deceasedSpouseMap: ${source} <-> ${target}`);
            } else {
                if (!spouseMap.has(source)) {
                    spouseMap.set(source, new Set());
                }
                if (!spouseMap.has(target)) {
                    spouseMap.set(target, new Set());
                }
                spouseMap.get(source).add(target);
                spouseMap.get(target).add(source);
                console.log(`  Added to spouseMap: ${source} <-> ${target}`);
            }
        }
    });
    
    console.log('\n=== FINAL MAPS ===');
    console.log('parentToChildren:', Array.from(parentToChildren.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('childToParents:', Array.from(childToParents.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('spouseMap:', Array.from(spouseMap.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('deceasedSpouseMap:', Array.from(deceasedSpouseMap.entries()).map(([k,v]) => [k, Array.from(v)]));
    console.log('exSpouseMap:', Array.from(exSpouseMap.entries()).map(([k,v]) => [k, Array.from(v)]));
    
    // Now let's debug the specific Richard case
    const richardId = '17';
    console.log(`\n=== RICHARD SHARMA (${richardId}) ANALYSIS ===`);
    console.log('Richard spouses:', spouseMap.has(richardId) ? Array.from(spouseMap.get(richardId)) : 'None');
    console.log('Richard deceased spouses:', deceasedSpouseMap.has(richardId) ? Array.from(deceasedSpouseMap.get(richardId)) : 'None');
    console.log('Richard ex spouses:', exSpouseMap.has(richardId) ? Array.from(exSpouseMap.get(richardId)) : 'None');
    console.log('Richard children:', parentToChildren.has(richardId) ? Array.from(parentToChildren.get(richardId)) : 'None');
    
    return { parentToChildren, childToParents, spouseMap, deceasedSpouseMap, exSpouseMap };
}

// Test data
const allPeople = [
    { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1970-01-01', is_deceased: false },
    { id: 2, first_name: 'Jane', last_name: 'Doe', gender: 'Female', date_of_birth: '1972-01-01', date_of_death: '2022-01-01', is_deceased: true },
    { id: 13, first_name: 'Michael', last_name: 'Doe', gender: 'Male', date_of_birth: '2024-08-15', is_deceased: false },
    { id: 17, first_name: 'Richard', last_name: 'Sharma', gender: 'Male', date_of_birth: '1945-08-12', is_deceased: false },
    { id: 18, first_name: 'Margaret', last_name: 'Sharma', gender: 'Female', date_of_birth: '1948-02-28', is_deceased: false },
    { id: 12, first_name: 'Lisa', last_name: 'Doe', gender: 'Female', date_of_birth: '1994-06-10', is_deceased: false }
];

const relationships = [
    { source: 17, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 17, type: 'child', is_ex: false, is_deceased: false },
    { source: 18, target: 2, type: 'parent', is_ex: false, is_deceased: false },
    { source: 2, target: 18, type: 'child', is_ex: false, is_deceased: false },
    { source: 2, target: 1, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 2, type: 'spouse', is_ex: false, is_deceased: true },
    { source: 1, target: 12, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 12, target: 1, type: 'spouse', is_ex: false, is_deceased: false },
    { source: 1, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 1, type: 'child', is_ex: false, is_deceased: false },
    { source: 12, target: 13, type: 'parent', is_ex: false, is_deceased: false },
    { source: 13, target: 12, type: 'child', is_ex: false, is_deceased: false }
];

console.log('People involved:');
allPeople.forEach(p => {
    console.log(`  ${p.id}: ${p.first_name} ${p.last_name}`);
});

debugRelationshipMaps(relationships, allPeople);