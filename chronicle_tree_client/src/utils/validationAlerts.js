// Family tree validation system - ensures data integrity
export const showValidationAlert = (type, details = {}) => {
  const { personName, targetName, age, relationship } = details;
  
  const alerts = {
    marriageAge: age 
      ? `${personName || 'This person'} is ${age} years old. People must be at least 16 years old to get married.`
      : 'Both people must be at least 16 years old to get married.',
    
    bloodRelatives: relationship === 'spouse' 
      ? 'These people are blood relatives and cannot marry each other. Please select different people for this relationship.'
      : 'Blood relatives cannot have parent-child relationships. Please check the family connections.',
      
    remarriageAllowed: 'This marriage is allowed because there is no blood relationship between these people.',
    
    ageDifference: 'Parents must be at least 12 years older than their children. Please check the birth dates.',
    
    maxParents: `${targetName || 'This person'} already has 2 biological parents. A person can only have 2 biological parents.`,
    
    maxSpouse: `${targetName || 'This person'} already has a current spouse. A person can only have one spouse at a time. You may need to mark the existing marriage as ended first.`,
    
    timeline: 'Birth and death dates must be in the correct order. Please check that the birth date comes before the death date.',
    
    missingData: 'Birth date is required when adding marriage relationships. Please add the birth date first.',
    
    missingFields: 'Please fill in all required fields before continuing.',
    
    invalidRelationship: 'This relationship type is not allowed between these people. Please choose a different relationship.',
    
    siblingConstraint: 'Siblings must share at least one parent. Please add parent relationships first, or choose a different relationship type.',
    
    temporalError: 'The birth and death dates don\'t make sense together. Please check the dates and try again.'
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
  // Handle network errors
  if (!error?.response) {
    if (error?.message?.includes('Network Error')) {
      alert('Network connection problem. Please check your internet connection and try again.');
      return;
    }
    alert('Unable to connect to the server. Please check your connection and try again.');
    return;
  }

  // Handle different HTTP status codes
  if (error.response?.status === 401) {
    alert('Your session has expired. Please log in again.');
    return;
  }
  
  if (error.response?.status === 403) {
    alert('You don\'t have permission to perform this action.');
    return;
  }
  
  if (error.response?.status === 404) {
    alert('The requested information was not found. It may have been deleted or moved.');
    return;
  }
  
  if (error.response?.status >= 500) {
    alert('Server error occurred. Please try again in a moment, or contact support if the problem continues.');
    return;
  }

  const errorMsg = error?.response?.data?.errors?.[0] || error?.response?.data?.message || error?.message;
  
  if (!errorMsg) {
    alert('Something went wrong. Please try again.');
    return;
  }
  
  // Match error patterns and show appropriate alerts - order matters!
  // For detailed backend messages, show them directly
  if (errorMsg.includes('already has a current spouse') || 
      errorMsg.includes('already has 2 biological parents') ||
      errorMsg.includes('years YOUNGER than') ||
      errorMsg.includes('years older than') ||
      errorMsg.includes('died on') ||
      errorMsg.includes('cannot be younger than their child') ||
      errorMsg.includes('share children') ||
      errorMsg.includes('incestuous relationships are prohibited') ||
      errorMsg.includes('Age gap too large') ||
      errorMsg.includes('different blood parents cannot be siblings') ||
      errorMsg.includes('Parent cannot be same as child') ||
      errorMsg.includes('Child person is required') ||
      errorMsg.includes('Please select both a relationship type') ||
      errorMsg.includes('One or both persons not found') ||
      errorMsg.includes('Cannot marry blood relative') ||
      errorMsg.includes('Cannot add sibling relationship') ||
      errorMsg.includes('born after parent\'s death') ||
      errorMsg.includes('Only spouse relationships can be')) {
    // These are detailed, user-friendly messages from backend - show them directly
    alert(errorMsg);
  } else if (errorMsg.includes('marriage age') || (errorMsg.includes('16 years') && errorMsg.includes('marriage'))) {
    showValidationAlert('marriageAge');
  } else if (errorMsg.includes('blood relative') || errorMsg.includes('Blood relatives')) {
    showValidationAlert('bloodRelatives');
  } else if (errorMsg.includes('years older') || (errorMsg.includes('12 years') && errorMsg.includes('parent'))) {
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
  } else if (errorMsg.includes('First name') && errorMsg.includes('blank')) {
    alert('First name is required. Please enter a first name.');
  } else if (errorMsg.includes('Last name') && errorMsg.includes('blank')) {
    alert('Last name is required. Please enter a last name.');
  } else if (errorMsg.includes('can\'t be blank')) {
    alert('Please fill in all required fields. Some required information is missing.');
  } else if (errorMsg.includes('invalid') && errorMsg.includes('date')) {
    alert('Please enter a valid date in the correct format (YYYY-MM-DD).');
  } else if (errorMsg.includes('internal server error') || errorMsg.includes('500')) {
    alert('Something went wrong on our end. Please try again in a moment, or contact support if the problem continues.');
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