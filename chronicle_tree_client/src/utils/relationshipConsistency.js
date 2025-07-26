/**
 * Centralized Relationship Consistency Utility
 * Ensures all components use the same relationship calculation logic
 * and maintains consistency across profile, tree, and share contexts
 */

import { calculateRelationshipToRoot, getAllRelationshipsToRoot } from './improvedRelationshipCalculator';

/**
 * Standard relationship calculator wrapper for consistent usage across components
 * @param {Object} person - The person to calculate relationship for
 * @param {Object} rootPerson - The root person
 * @param {Array} allPeople - All people in the tree
 * @param {Array} relationships - All relationships
 * @returns {string} - Standardized relationship description
 */
export const getStandardizedRelationship = (person, rootPerson, allPeople, relationships) => {
  if (!person || !rootPerson || !allPeople || !relationships) {
    return 'Unknown';
  }

  const relationship = calculateRelationshipToRoot(person, rootPerson, allPeople, relationships);
  
  // Standardize common relationship terms for consistency
  const standardizedTerms = {
    'Step-Mother': 'Step-Mother',
    'Step-Father': 'Step-Father', 
    'Step-Brother': 'Step-Brother',
    'Step-Sister': 'Step-Sister',
    'Step-Son': 'Step-Son',
    'Step-Daughter': 'Step-Daughter',
    'Mother': 'Mother',
    'Father': 'Father',
    'Brother': 'Brother',
    'Sister': 'Sister',
    'Son': 'Son',
    'Daughter': 'Daughter',
    'Husband': 'Husband',
    'Wife': 'Wife',
    'Ex-Husband': 'Ex-Husband',
    'Ex-Wife': 'Ex-Wife'
  };

  return standardizedTerms[relationship] || relationship || 'Unrelated';
};

/**
 * Get all relationships with consistent calculation
 * @param {Object} rootPerson - The root person
 * @param {Array} allPeople - All people in the tree
 * @param {Array} relationships - All relationships
 * @returns {Array} - Array of people with calculated relationships
 */
export const getAllStandardizedRelationships = (rootPerson, allPeople, relationships) => {
  if (!rootPerson || !allPeople || !relationships) {
    return [];
  }

  return getAllRelationshipsToRoot(rootPerson, allPeople, relationships);
};

/**
 * Validate relationship data for consistency
 * @param {Array} relationships - Relationship array to validate
 * @returns {Object} - Validation result with issues found
 */
export const validateRelationshipData = (relationships) => {
  const issues = [];
  const processedPairs = new Set();

  relationships.forEach((rel, index) => {
    const source = String(rel.source || rel.from);
    const target = String(rel.target || rel.to);
    const type = rel.type || rel.relationship_type;

    // Check for duplicate relationships
    const pairKey = `${source}-${target}-${type}`;
    const reversePairKey = `${target}-${source}-${type}`;
    
    if (processedPairs.has(pairKey) || processedPairs.has(reversePairKey)) {
      issues.push({
        type: 'duplicate',
        index,
        message: `Duplicate ${type} relationship between ${source} and ${target}`
      });
    }
    
    processedPairs.add(pairKey);

    // Check for missing required fields
    if (!source || !target || !type) {
      issues.push({
        type: 'missing_data',
        index,
        message: `Missing required fields in relationship ${index}`
      });
    }

    // Check for self-relationships (except special cases)
    if (source === target) {
      issues.push({
        type: 'self_relationship',
        index,
        message: `Person ${source} has relationship with themselves`
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    totalRelationships: relationships.length
  };
};

/**
 * Format relationship data for consistent API usage
 * @param {Array} relationships - Raw relationship data
 * @returns {Array} - Formatted relationships for consistent processing
 */
export const formatRelationshipsForCalculator = (relationships) => {
  return relationships.map(rel => ({
    from: rel.source || rel.from,
    to: rel.target || rel.to,
    relationship_type: rel.type || rel.relationship_type,
    is_ex: rel.is_ex || false,
    is_deceased: rel.is_deceased || false
  }));
};

/**
 * Step-relationship detection utility for consistent usage
 * @param {Object} person - Person to check
 * @param {Object} rootPerson - Root person
 * @param {Array} allPeople - All people
 * @param {Array} relationships - All relationships
 * @returns {Object} - Step relationship information
 */
export const getStepRelationshipInfo = (person, rootPerson, allPeople, relationships) => {
  const relationship = getStandardizedRelationship(person, rootPerson, allPeople, relationships);
  
  return {
    isStep: relationship.includes('Step-'),
    relationship,
    stepType: relationship.includes('Step-') ? relationship.replace('Step-', '').toLowerCase() : null
  };
};

/**
 * Get relationship count summary for consistent sharing descriptions
 * @param {Object} person - Person to get counts for
 * @param {Array} allPeople - All people
 * @param {Array} relationships - All relationships
 * @returns {Object} - Relationship counts including step relationships
 */
export const getRelationshipCounts = (person, allPeople, relationships) => {
  const counts = {
    children: 0,
    stepChildren: 0,
    spouses: 0,
    exSpouses: 0,
    siblings: 0,
    stepSiblings: 0,
    parents: 0,
    stepParents: 0
  };

  // Calculate all relationships for this person
  const allRelationships = getAllStandardizedRelationships(person, allPeople, relationships);
  
  allRelationships.forEach(rel => {
    const relationship = rel.relation || '';
    
    if (relationship.includes('Son') || relationship.includes('Daughter')) {
      if (relationship.includes('Step-')) {
        counts.stepChildren++;
      } else {
        counts.children++;
      }
    } else if (relationship.includes('Brother') || relationship.includes('Sister')) {
      if (relationship.includes('Step-')) {
        counts.stepSiblings++;
      } else {
        counts.siblings++;
      }
    } else if (relationship.includes('Mother') || relationship.includes('Father')) {
      if (relationship.includes('Step-')) {
        counts.stepParents++;
      } else {
        counts.parents++;
      }
    } else if (relationship.includes('Husband') || relationship.includes('Wife')) {
      if (relationship.includes('Ex-')) {
        counts.exSpouses++;
      } else {
        counts.spouses++;
      }
    }
  });

  return counts;
};

export default {
  getStandardizedRelationship,
  getAllStandardizedRelationships,
  validateRelationshipData,
  formatRelationshipsForCalculator,
  getStepRelationshipInfo,
  getRelationshipCounts
};