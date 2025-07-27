/**
 * Debug to understand if the generationGroups creation is overriding
 * the logical generation assignments
 */

// Let me create a minimal version of what happens in createHierarchicalNodes

console.log('=== Debug Generation Override Logic ===');

// Test data
const people = [
  { id: 1, first_name: 'John' },
  { id: 2, first_name: 'Jane' },
  { id: 3, first_name: 'JohnDad' },
  { id: 4, first_name: 'JohnMom' },
  { id: 5, first_name: 'JaneDad' },
  { id: 6, first_name: 'JaneMom' },
  { id: 7, first_name: 'JohnUncle' },
  { id: 8, first_name: 'JohnAunt' },
  { id: 9, first_name: 'JaneBrother' },
  { id: 10, first_name: 'JaneSisterInLaw' }
];

// Simulate the logical generations that should be assigned
const logicalGenerations = new Map([
  ['1', 1], ['2', 1], ['9', 1], ['10', 1], // Root generation
  ['3', 0], ['4', 0], ['5', 0], ['6', 0], ['7', 0], ['8', 0] // Parent generation
]);

// Simulate the relationship maps
const childToParents = new Map([
  ['1', new Set(['3', '4'])], // John -> JohnDad, JohnMom
  ['2', new Set(['5', '6'])], // Jane -> JaneDad, JaneMom
  ['9', new Set(['5', '6'])]  // JaneBrother -> JaneDad, JaneMom
]);

const spouseMap = new Map([
  ['1', '2'], ['2', '1'], // John <-> Jane
  ['3', '4'], ['4', '3'], // JohnDad <-> JohnMom
  ['5', '6'], ['6', '5'], // JaneDad <-> JaneMom
  ['7', '8'], ['8', '7'], // JohnUncle <-> JohnAunt
  ['9', '10'], ['10', '9'] // JaneBrother <-> JaneSisterInLaw
]);

const rootPersonId = 1;

console.log('Logical generations (what should be assigned):');
people.forEach(person => {
  const id = String(person.id);
  const gen = logicalGenerations.get(id);
  console.log(`${person.first_name}: generation ${gen}`);
});

console.log('');
console.log('--- Simulating createHierarchicalNodes generation grouping ---');

const generationGroups = new Map();

people.forEach(person => {
  const id = String(person.id);
  let generation = logicalGenerations.get(id) || 0;
  
  console.log(`Processing ${person.first_name}: initial generation = ${generation}`);
  
  // Special handling: Always group a deceased grandparent in the correct generation
  let forceGrandparentGen = null;
  if (rootPersonId && childToParents) {
    const rootId = String(rootPersonId);
    // Get root's parents
    const rootParentIds = childToParents.get(rootId) ? Array.from(childToParents.get(rootId)) : [];
    console.log(`  Root (${rootId}) parents: [${rootParentIds.join(', ')}]`);
    
    // For each parent, get their parents (grandparents)
    let grandparentIds = [];
    rootParentIds.forEach(parentId => {
      const gps = childToParents.get(parentId);
      if (gps) grandparentIds.push(...Array.from(gps));
    });
    console.log(`  Root grandparents: [${grandparentIds.join(', ')}]`);
    
    // If this person is a grandparent of the root, force their generation to match their spouse
    if (grandparentIds.includes(id)) {
      console.log(`  ${person.first_name} is a grandparent of root`);
      // Find the minimum generation among all grandparents
      let minGrandGen = generation;
      grandparentIds.forEach(gpid => {
        if (logicalGenerations.has(gpid)) {
          minGrandGen = Math.min(minGrandGen, logicalGenerations.get(gpid));
        }
      });
      forceGrandparentGen = minGrandGen;
      console.log(`  Force grandparent generation: ${forceGrandparentGen}`);
    }
  }
  
  // Also, if person is deceased and their spouse is in a lower generation, group them together
  if ((person.is_deceased || person.date_of_death) && spouseMap) {
    const spouseId = spouseMap.get(id);
    if (spouseId && logicalGenerations.has(spouseId)) {
      const spouseGen = logicalGenerations.get(spouseId);
      if (spouseGen < generation) {
        forceGrandparentGen = forceGrandparentGen !== null ? Math.min(forceGrandparentGen, spouseGen) : spouseGen;
        console.log(`  ${person.first_name} is deceased, spouse at lower generation: ${spouseGen}`);
      }
    }
  }
  
  if (forceGrandparentGen !== null) {
    generation = forceGrandparentGen;
    console.log(`  ${person.first_name} generation OVERRIDDEN to: ${generation}`);
  }
  
  // Add to generation group
  if (!generationGroups.has(generation)) {
    generationGroups.set(generation, []);
  }
  generationGroups.get(generation).push(person.first_name);
  
  console.log(`  Final generation for ${person.first_name}: ${generation}`);
  console.log('');
});

console.log('--- Final Generation Groups ---');
Array.from(generationGroups.entries())
  .sort((a, b) => a[0] - b[0])
  .forEach(([gen, names]) => {
    console.log(`Generation ${gen}: [${names.join(', ')}]`);
  });

console.log('');
console.log('--- Visual Y-Coordinates ---');
const minGeneration = Math.min(...generationGroups.keys());
const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => a - b);
const GENERATION_HEIGHT = 450;

console.log(`Min generation: ${minGeneration}`);
console.log(`Sorted generations: [${sortedGenerations.join(', ')}]`);

sortedGenerations.forEach(generation => {
  const generationIndex = sortedGenerations.indexOf(generation);
  const y = generationIndex * GENERATION_HEIGHT;
  const names = generationGroups.get(generation);
  console.log(`Generation ${generation} (index ${generationIndex}): y=${y} -> [${names.join(', ')}]`);
});

console.log('');
console.log('=== Analysis ===');
console.log('If there are multiple generation groups when there should be fewer,');
console.log('the special override logic is incorrectly splitting the generations.');
console.log('All parents should be in the same generation group for same y-coordinate.');