// Central validation alert system - short, clear, and friendly
export const showValidationAlert = (type, details = {}) => {
  const { personName, targetName, age, relationship } = details;
  
  const alerts = {
    marriageAge: age 
      ? `${personName || 'Person'} is ${age} years old. Minimum marriage age is 16.`
      : 'Both people must be at least 16 years old to marry.',
    
    bloodRelatives: relationship === 'spouse' 
      ? 'Blood relatives cannot marry.'
      : 'Blood relatives cannot have children together.',
    
    ageDifference: 'Parents must be at least 12 years older than their children.',
    
    maxParents: `${targetName || 'Person'} already has 2 parents.`,
    
    maxSpouse: `${targetName || 'Person'} already has a current spouse.`,
    
    timeline: 'Birth and death dates must be in chronological order.',
    
    missingData: 'Birth date required for marriage relationships.',
    
    missingFields: 'Please fill in all required fields.',
    
    invalidRelationship: 'This relationship type is not allowed between these people.',
    
    siblingConstraint: 'Siblings must share at least one parent.',
    
    temporalError: 'Birth and death dates must be logically consistent.'
  };

  alert(alerts[type] || 'Please check the information and try again.');
};

// Quick validation helpers
export const validateMarriageAge = (person1, person2) => {
  if (!person1?.date_of_birth || !person2?.date_of_birth) {
    return { valid: true }; // Allow if birth dates are missing - not a marriage age issue
  }
  
  const currentDate = new Date();
  const person1Age = (currentDate - new Date(person1.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25);
  const person2Age = (currentDate - new Date(person2.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (person1Age < 16) {
    return { 
      valid: false, 
      type: 'marriageAge', 
      details: { personName: `${person1.first_name} ${person1.last_name}`, age: person1Age.toFixed(1) }
    };
  }
  
  if (person2Age < 16) {
    return { 
      valid: false, 
      type: 'marriageAge', 
      details: { personName: `${person2.first_name} ${person2.last_name}`, age: person2Age.toFixed(1) }
    };
  }
  
  return { valid: true };
};

// Helper function to parse backend error and show appropriate alert
export const handleBackendError = (error) => {
  const errorMsg = error?.response?.data?.errors?.[0] || error?.response?.data?.message || error?.message;
  
  if (!errorMsg) {
    alert('Something went wrong. Please try again.');
    return;
  }
  
  // Match error patterns and show appropriate alerts - order matters!
  if (errorMsg.includes('marriage age') || (errorMsg.includes('16 years') && errorMsg.includes('marriage'))) {
    showValidationAlert('marriageAge');
  } else if (errorMsg.includes('blood relative') || errorMsg.includes('Blood relatives')) {
    showValidationAlert('bloodRelatives');
  } else if (errorMsg.includes('years older') || (errorMsg.includes('12 years') && errorMsg.includes('parent'))) {
    showValidationAlert('ageDifference');
  } else if (errorMsg.includes('YOUNGER than their child') || errorMsg.includes('OLDER than their parent')) {
    showValidationAlert('ageDifference');
  } else if (errorMsg.includes('2 parents') || errorMsg.includes('maximum')) {
    showValidationAlert('maxParents');
  } else if (errorMsg.includes('current spouse')) {
    showValidationAlert('maxSpouse');
  } else if (errorMsg.includes('birth date') && errorMsg.includes('required')) {
    showValidationAlert('missingData');
  } else if (errorMsg.includes('Timeline') || errorMsg.includes('chronological')) {
    showValidationAlert('timeline');
  } else if (errorMsg.includes('share at least one parent')) {
    showValidationAlert('siblingConstraint');
  } else {
    // Show the actual error message if it doesn't match our patterns
    alert(errorMsg);
  }
};

export const validateParentChildAge = (parent, child) => {
  if (!parent?.date_of_birth || !child?.date_of_birth) {
    return { valid: true }; // Allow if dates missing for non-spouse relationships
  }
  
  const parentBirth = new Date(parent.date_of_birth);
  const childBirth = new Date(child.date_of_birth);
  const ageDiff = (childBirth - parentBirth) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (ageDiff < 12) {
    return { valid: false, type: 'ageDifference' };
  }
  
  return { valid: true };
};