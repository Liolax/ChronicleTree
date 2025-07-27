/**
 * Create a detailed debug version of the BFS algorithm to see exactly 
 * what generation numbers are being assigned
 */

// Simulate the BFS algorithm step by step
console.log('=== Detailed BFS Debug ===');

// Test data - same as failing case
const people = [
  { id: 1, first_name: 'John', last_name: 'Doe' },
  { id: 2, first_name: 'Jane', last_name: 'Smith' },
  { id: 3, first_name: 'JohnDad', last_name: 'Doe' },
  { id: 4, first_name: 'JohnMom', last_name: 'Doe' },
  { id: 5, first_name: 'JaneDad', last_name: 'Smith' },
  { id: 6, first_name: 'JaneMom', last_name: 'Smith' },
  { id: 7, first_name: 'JohnUncle', last_name: 'Doe' },
  { id: 8, first_name: 'JohnAunt', last_name: 'Doe' },
  { id: 9, first_name: 'JaneBrother', last_name: 'Smith' },
  { id: 10, first_name: 'JaneSisterInLaw', last_name: 'Brown' }
];

// Build relationship maps manually
const childToParents = new Map([
  ['1', new Set(['3', '4'])], // John -> JohnDad, JohnMom
  ['2', new Set(['5', '6'])], // Jane -> JaneDad, JaneMom
  ['9', new Set(['5', '6'])]  // JaneBrother -> JaneDad, JaneMom
]);

const parentToChildren = new Map([
  ['3', new Set(['1'])], // JohnDad -> John
  ['4', new Set(['1'])], // JohnMom -> John
  ['5', new Set(['2', '9'])], // JaneDad -> Jane, JaneBrother
  ['6', new Set(['2', '9'])]  // JaneMom -> Jane, JaneBrother
]);

const spouseMap = new Map([
  ['1', '2'], ['2', '1'], // John <-> Jane
  ['3', '4'], ['4', '3'], // JohnDad <-> JohnMom
  ['5', '6'], ['6', '5'], // JaneDad <-> JaneMom
  ['7', '8'], ['8', '7'], // JohnUncle <-> JohnAunt
  ['9', '10'], ['10', '9'] // JaneBrother <-> JaneSisterInLaw
]);

const relationships = [
  { source: 3, target: 7, type: 'sibling' }, // JohnDad <-> JohnUncle
  { source: 7, target: 3, type: 'sibling' },
  { source: 2, target: 9, type: 'sibling' }, // Jane <-> JaneBrother
  { source: 9, target: 2, type: 'sibling' }
];

// Simulate BFS starting from John (id=1) as root
console.log('Starting BFS with John (ID: 1) as root');
console.log('');

const generations = new Map();
const visited = new Set();
const queue = [{ id: '1', generation: 0 }]; // Start John at generation 0

let step = 0;
while (queue.length > 0) {
  step++;
  const { id, generation } = queue.shift();
  
  if (visited.has(id)) continue;
  visited.add(id);
  generations.set(id, generation);
  
  const person = people.find(p => String(p.id) === id);
  console.log(`Step ${step}: Processing ${person?.first_name} (ID: ${id}) at generation ${generation}`);
  
  // Add spouse to SAME generation
  if (spouseMap.has(id)) {
    const spouseId = spouseMap.get(id);
    if (!visited.has(spouseId)) {
      queue.push({ id: spouseId, generation: generation });
      const spouse = people.find(p => String(p.id) === spouseId);
      console.log(`  -> Added spouse: ${spouse?.first_name} (ID: ${spouseId}) at generation ${generation}`);
    }
  }
  
  // Add children to next generation (generation + 1)
  if (parentToChildren.has(id)) {
    const children = parentToChildren.get(id);
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, generation: generation + 1 });
        const child = people.find(p => String(p.id) === childId);
        console.log(`  -> Added child: ${child?.first_name} (ID: ${childId}) at generation ${generation + 1}`);
      }
    });
  }
  
  // Add parents to previous generation (generation - 1)
  if (childToParents.has(id)) {
    const parents = childToParents.get(id);
    parents.forEach(parentId => {
      if (!visited.has(parentId)) {
        queue.push({ id: parentId, generation: generation - 1 });
        const parent = people.find(p => String(p.id) === parentId);
        console.log(`  -> Added parent: ${parent?.first_name} (ID: ${parentId}) at generation ${generation - 1}`);
      }
    });
  }
  
  // Add siblings to SAME generation
  relationships.forEach(rel => {
    const source = String(rel.source);
    const target = String(rel.target);
    const type = rel.type;
    
    if (type === 'sibling') {
      if (source === id && !visited.has(target)) {
        queue.push({ id: target, generation: generation });
        const sibling = people.find(p => String(p.id) === target);
        console.log(`  -> Added sibling: ${sibling?.first_name} (ID: ${target}) at generation ${generation}`);
      } else if (target === id && !visited.has(source)) {
        queue.push({ id: source, generation: generation });
        const sibling = people.find(p => String(p.id) === source);
        console.log(`  -> Added sibling: ${sibling?.first_name} (ID: ${source}) at generation ${generation}`);
      }
    }
  });
  
  console.log(`  Current queue: [${queue.map(q => `${people.find(p => String(p.id) === q.id)?.first_name}(gen=${q.generation})`).join(', ')}]`);
  console.log('');
}

console.log('--- Final Generation Assignments ---');
people.forEach(person => {
  const id = String(person.id);
  const gen = generations.get(id) || 'UNVISITED';
  console.log(`${person.first_name}: generation ${gen}`);
});

console.log('');
console.log('--- Analysis ---');
const genGroups = new Map();
people.forEach(person => {
  const id = String(person.id);
  const gen = generations.get(id) || 'UNVISITED';
  if (!genGroups.has(gen)) {
    genGroups.set(gen, []);
  }
  genGroups.get(gen).push(person.first_name);
});

console.log('People grouped by logical generation:');
Array.from(genGroups.entries())
  .sort((a, b) => a[0] - b[0])
  .forEach(([gen, names]) => {
    console.log(`  Generation ${gen}: [${names.join(', ')}]`);
  });

console.log('');
console.log('Expected after post-processing:');
console.log('  Generation -1: [JohnDad, JohnMom, JaneDad, JaneMom, JohnUncle, JohnAunt] (all parents)');
console.log('  Generation 0: [John, Jane, JaneBrother, JaneSisterInLaw] (all root generation)');
console.log('');
console.log('The post-processing should align:');
console.log('1. John & Jane\'s parents to same generation (parents-in-law alignment)');
console.log('2. JohnDad & JohnUncle to same generation (sibling alignment)');
console.log('3. All spouses to same generation as their partners');