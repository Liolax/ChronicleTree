/**
 * Debug the initial BFS generation assignment to understand why some people
 * are getting wrong initial generations before post-processing
 */

// Simplified BFS implementation to debug what's happening
function debugBFS(persons, childToParents, spouseMap, rootPersonId) {
  console.log('=== Debugging Initial BFS Generation Assignment ===');
  console.log(`Root Person ID: ${rootPersonId}`);
  
  const generations = new Map();
  const visited = new Set();
  const queue = [];
  
  // Start with root person at generation 1
  const rootId = String(rootPersonId);
  queue.push({ id: rootId, generation: 1 });
  generations.set(rootId, 1);
  visited.add(rootId);
  
  console.log(`Starting BFS with ${rootId} at generation 1`);
  console.log('');
  
  while (queue.length > 0) {
    const { id, generation } = queue.shift();
    const person = persons.find(p => String(p.id) === id);
    console.log(`Processing: ${person?.first_name} (ID: ${id}) at generation ${generation}`);
    
    // Get parents (they should be at generation - 1)
    const parents = childToParents.get(id);
    if (parents) {
      parents.forEach(parentId => {
        if (!visited.has(parentId)) {
          const parentGen = generation - 1;
          generations.set(parentId, parentGen);
          visited.add(parentId);
          queue.push({ id: parentId, generation: parentGen });
          
          const parent = persons.find(p => String(p.id) === parentId);
          console.log(`  -> Parent: ${parent?.first_name} (ID: ${parentId}) assigned generation ${parentGen}`);
        }
      });
    }
    
    // Get children (they should be at generation + 1)
    childToParents.forEach((childParents, childId) => {
      if (childParents.has(id) && !visited.has(childId)) {
        const childGen = generation + 1;
        generations.set(childId, childGen);
        visited.add(childId);
        queue.push({ id: childId, generation: childGen });
        
        const child = persons.find(p => String(p.id) === childId);
        console.log(`  -> Child: ${child?.first_name} (ID: ${childId}) assigned generation ${childGen}`);
      }
    });
    
    // Get spouse (they should be at same generation)
    if (spouseMap && spouseMap.has(id)) {
      const spouseId = spouseMap.get(id);
      if (!visited.has(spouseId)) {
        generations.set(spouseId, generation);
        visited.add(spouseId);
        queue.push({ id: spouseId, generation });
        
        const spouse = persons.find(p => String(p.id) === spouseId);
        console.log(`  -> Spouse: ${spouse?.first_name} (ID: ${spouseId}) assigned generation ${generation}`);
      }
    }
    
    console.log('');
  }
  
  // Check for unvisited persons (disconnected nodes)
  console.log('--- Checking for unvisited persons ---');
  persons.forEach(person => {
    const id = String(person.id);
    if (!visited.has(id)) {
      console.log(`❌ UNVISITED: ${person.first_name} (ID: ${id}) - this person is disconnected from the root`);
      // Assign them to generation 0 (default)
      generations.set(id, 0);
    }
  });
  
  console.log('');
  console.log('--- Final BFS Generation Assignments ---');
  persons.forEach(person => {
    const id = String(person.id);
    const gen = generations.get(id);
    console.log(`${person.first_name}: generation ${gen}`);
  });
  
  return generations;
}

// Test data (same as the failing case)
const people = [
  { id: 1, first_name: 'John', last_name: 'Doe', gender: 'Male', date_of_birth: '1980-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', gender: 'Female', date_of_birth: '1982-01-01' },
  { id: 3, first_name: 'JohnDad', last_name: 'Doe', gender: 'Male', date_of_birth: '1950-01-01' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe', gender: 'Female', date_of_birth: '1952-01-01' },
  { id: 5, first_name: 'JaneDad', last_name: 'Smith', gender: 'Male', date_of_birth: '1948-01-01' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith', gender: 'Female', date_of_birth: '1950-01-01' },
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe', gender: 'Male', date_of_birth: '1954-01-01' },
  { id: 8, first_name: 'JohnAunt', last_name: 'Doe', gender: 'Female', date_of_birth: '1956-01-01' },
  { id: 9, first_name: 'JaneBrother', last_name: 'Smith', gender: 'Male', date_of_birth: '1984-01-01' },
  { id: 10, first_name: 'JaneSisterInLaw', last_name: 'Brown', gender: 'Female', date_of_birth: '1986-01-01' }
];

// Build child to parents map and spouse map manually
const childToParents = new Map();
const spouseMap = new Map();

// John's relationships
childToParents.set('1', new Set(['3', '4'])); // John -> JohnDad, JohnMom
spouseMap.set('1', '2'); // John -> Jane
spouseMap.set('2', '1'); // Jane -> John

// Jane's relationships  
childToParents.set('2', new Set(['5', '6'])); // Jane -> JaneDad, JaneMom

// Parents' marriages
spouseMap.set('3', '4'); // JohnDad -> JohnMom
spouseMap.set('4', '3'); // JohnMom -> JohnDad
spouseMap.set('5', '6'); // JaneDad -> JaneMom
spouseMap.set('6', '5'); // JaneMom -> JaneDad

// John's uncle relationship (JohnUncle is JohnDad's brother)
// Note: This is NOT in childToParents or spouseMap directly from John's perspective
spouseMap.set('7', '8'); // JohnUncle -> JohnAunt
spouseMap.set('8', '7'); // JohnAunt -> JohnUncle

// Jane's sibling relationships
childToParents.set('9', new Set(['5', '6'])); // JaneBrother -> JaneDad, JaneMom
spouseMap.set('9', '10'); // JaneBrother -> JaneSisterInLaw
spouseMap.set('10', '9'); // JaneSisterInLaw -> JaneBrother

console.log('Child to Parents map:');
childToParents.forEach((parents, childId) => {
  const child = people.find(p => String(p.id) === childId);
  const parentNames = Array.from(parents).map(pid => {
    const parent = people.find(p => String(p.id) === pid);
    return parent ? parent.first_name : pid;
  });
  console.log(`  ${child ? child.first_name : childId} -> parents: [${parentNames.join(', ')}]`);
});

console.log('');
console.log('Spouse map:');
spouseMap.forEach((spouseId, personId) => {
  const person = people.find(p => String(p.id) === personId);
  const spouse = people.find(p => String(p.id) === spouseId);
  console.log(`  ${person ? person.first_name : personId} -> spouse: ${spouse ? spouse.first_name : spouseId}`);
});

console.log('');
debugBFS(people, childToParents, spouseMap, 1);

console.log('');
console.log('=== Key Insights ===');
console.log('The BFS algorithm can only find people connected to the root through:');
console.log('1. Parent-child relationships');
console.log('2. Spouse relationships');
console.log('');
console.log('JohnUncle and JohnAunt are NOT directly connected to John through these relationships!');
console.log('JohnUncle is JohnDad\'s sibling, but sibling relationships are not part of the BFS traversal.');
console.log('This is why they end up as "disconnected" and get assigned generation 0.');
console.log('');
console.log('The BFS needs to be enhanced to include sibling relationships in the traversal,');
console.log('or the post-processing needs to be more aggressive about finding and aligning');
console.log('people who should be at the same generation through indirect relationships.');