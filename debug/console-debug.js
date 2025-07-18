// Console debug script - paste this in browser console
console.log('=== RELATIONSHIP DEBUG SCRIPT ===');

// Test if the functions are available
if (typeof window.getAllRelationshipsToRoot === 'undefined') {
    console.log('❌ getAllRelationshipsToRoot not found on window');
    console.log('Available functions:', Object.keys(window).filter(k => k.includes('relationship') || k.includes('Relationship')));
} else {
    console.log('✅ getAllRelationshipsToRoot found on window');
}

// Try to access React components and their data
if (typeof window.React !== 'undefined') {
    console.log('✅ React is available');
    
    // Try to get the current app state
    const reactFiberKey = Object.keys(document.querySelector('#root')).find(key => key.startsWith('__reactFiber'));
    if (reactFiberKey) {
        console.log('✅ React Fiber found');
        const fiber = document.querySelector('#root')[reactFiberKey];
        console.log('React Fiber:', fiber);
    }
} else {
    console.log('❌ React not available on window');
}

// Test data to verify the calculator works
const testPeople = [
    { id: 3, first_name: 'Alice', last_name: 'A', gender: 'Female', full_name: 'Alice A' },
    { id: 5, first_name: 'Charlie', last_name: 'C', gender: 'Male', full_name: 'Charlie C' }
];

const testRelationships = [
    { source: 1, target: 3, type: 'parent' },  // John -> Alice
    { source: 1, target: 5, type: 'parent' },  // John -> Charlie  
    { source: 3, target: 5, type: 'sibling' }, // Alice <-> Charlie
    { source: 5, target: 3, type: 'sibling' }
];

console.log('Test people:', testPeople);
console.log('Test relationships:', testRelationships);

// Check if we can access the module through import
if (typeof window.calculateRelationshipToRoot === 'function') {
    console.log('✅ calculateRelationshipToRoot function found');
    const result = window.calculateRelationshipToRoot(testPeople[0], testPeople[1], testPeople, testRelationships);
    console.log('Alice -> Charlie result:', result);
} else {
    console.log('❌ calculateRelationshipToRoot not found as window function');
}

// Check the current page data if available
const currentData = window.__CURRENT_FAMILY_DATA__ || null;
if (currentData) {
    console.log('✅ Current family data found:', currentData);
} else {
    console.log('❌ No current family data found');
}

console.log('=== END DEBUG SCRIPT ===');
