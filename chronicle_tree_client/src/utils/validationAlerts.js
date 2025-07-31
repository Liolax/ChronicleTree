// Family tree validation system - ensures data integrity

export const showValidationAlert = (type, details = {}) => {
  const { personName, targetName, age, relationship } = details;
  
  const alerts = {
    marriageAge: age 
      ? `${personName || 'This person'} is ${age} years old. Marriage is allowed for people 16 years old and older.`
      : 'Marriage is allowed for people 16 years old and older.',
    
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

  const message = alerts[type] || 'Please check the information and try again.';
  
  // Show specific warnings for relationship/age appropriateness issues
  if (type === 'marriageAge') {
    showWarning('Marriage Age Warning', message);
  } else if (type === 'ageDifference') {
    showWarning('Age Difference Warning', message);
  } else if (type === 'maxParents') {
    showWarning('Parent Limit Warning', message);
  } else if (type === 'maxSpouse') {
    showWarning('Multiple Spouse Warning', message);
  } else if (type === 'bloodRelatives') {
    showWarning('Blood Relationship Warning', message);
  } else if (type === 'siblingConstraint') {
    showWarning('Sibling Relationship Warning', message);
  } else if (type === 'timeline' || type === 'temporalError') {
    showWarning('Timeline Warning', message);
  } else {
    // System validation errors (missing data, invalid input, etc.)
    showError('Input Error', message);
  }
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
      showError('Connection Problem', 'Please check your internet connection and try again.');
      return;
    }
    showError('Connection Error', 'Unable to connect to the server. Please check your connection and try again.');
    return;
  }

  // Handle different HTTP status codes
  if (error.response?.status === 401) {
    showWarning('Session Expired', 'Your session has expired. Please log in again.');
    return;
  }
  
  if (error.response?.status === 403) {
    showError('Access Denied', 'You do not have permission to perform this action.');
    return;
  }
  
  if (error.response?.status === 404) {
    showError('Not Found', 'The requested information was not found. It may have been deleted or moved.');
    return;
  }
  
  // Special handling for 422 validation errors - check for marriage age issues first
  if (error.response?.status === 422) {
    const errorData = error?.response?.data;
    const errorMsg = errorData?.errors?.[0] || errorData?.message || errorData?.exception || error?.message || '';
    console.log('=== 422 VALIDATION ERROR ===');
    console.log('Raw error message:', errorMsg);
    console.log('Error data structure:', errorData);
    console.log('===========================');
    
    // Check what type of validation error this is
    const lowerErrorMsg = errorMsg.toLowerCase();
    
    // Multiple spouse errors
    if (lowerErrorMsg.includes('current spouse') || lowerErrorMsg.includes('only have one spouse') || 
        lowerErrorMsg.includes('already has a spouse')) {
      console.log('✓ Detected as multiple spouse error');
      console.log('Error message was:', errorMsg);
      showWarning('Multiple Spouse Warning', errorMsg);
      return;
    }
    
    // Marriage age errors (for spouse relationships)
    if ((lowerErrorMsg.includes('marriage') && (lowerErrorMsg.includes('minimum') || lowerErrorMsg.includes('16'))) ||
        lowerErrorMsg.includes('marriage age')) {
      console.log('✓ Detected as marriage age error');
      console.log('Error message was:', errorMsg);
      showWarning('Marriage Age Warning', 'Marriage is allowed for people 16 years old and older.');
      return;
    }
    
    // Parent-child age difference errors
    if ((lowerErrorMsg.includes('years older') || lowerErrorMsg.includes('age difference')) ||
        (lowerErrorMsg.includes('parent') && lowerErrorMsg.includes('child') && lowerErrorMsg.includes('years'))) {
      console.log('✓ Detected as parent-child age error');
      console.log('Error message was:', errorMsg);
      showWarning('Age Difference Warning', 'Parents must be at least 12 years older than their children.');
      return;
    }
    
    // Blood relationship errors
    if (lowerErrorMsg.includes('blood relative') || lowerErrorMsg.includes('incestuous')) {
      console.log('✓ Detected as blood relationship error');
      console.log('Error message was:', errorMsg);
      showWarning('Relationship Warning', errorMsg);
      return;
    }
    
    // True age-related errors (only if they actually mention age AND don't match above categories)
    if ((lowerErrorMsg.includes('age') || lowerErrorMsg.includes('young') || lowerErrorMsg.includes('old')) &&
        !lowerErrorMsg.includes('spouse') && !lowerErrorMsg.includes('marriage')) {
      console.log('✓ Detected as true age error');
      console.log('Error message was:', errorMsg);
      showWarning('Age Validation', errorMsg);
      return;
    }
    
    console.log('✗ Not detected as specific validation error, falling through to general handling');
    console.log('Error message was:', errorMsg);
  }
  
  if (error.response?.status >= 500) {
    showError('Server Error', 'Please try again in a moment, or contact support if the problem continues.');
    return;
  }

  const errorMsg = error?.response?.data?.errors?.[0] || error?.response?.data?.message || error?.response?.data?.exception || error?.message;
  
  if (!errorMsg) {
    showError('Error', 'Something went wrong. Please try again.');
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
    showError('Error', errorMsg);
  } else if (errorMsg.includes('marriage age') || 
             errorMsg.includes('16 years') || 
             errorMsg.includes('minimum age') || 
             errorMsg.includes('too young') ||
             (errorMsg.includes('age') && errorMsg.includes('marriage'))) {
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
    showError('Missing Information', 'First name is required. Please enter a first name.');
  } else if (errorMsg.includes('Last name') && errorMsg.includes('blank')) {
    showError('Missing Information', 'Last name is required. Please enter a last name.');
  } else if (errorMsg.includes('can\'t be blank')) {
    showError('Missing Fields', 'Please fill in all required fields. Some required information is missing.');
  } else if (errorMsg.includes('invalid') && errorMsg.includes('date')) {
    showError('Invalid Date', 'Please enter a valid date in the correct format (YYYY-MM-DD).');
  } else if (errorMsg.includes('internal server error') || errorMsg.includes('500')) {
    showError('Server Error', 'Something went wrong on our end. Please try again in a moment, or contact support if the problem continues.');
  } else {
    // Check if this might be a marriage age error we missed
    if (errorMsg.toLowerCase().includes('age') || errorMsg.includes('16') || errorMsg.toLowerCase().includes('marriage')) {
      console.log('Potential marriage age error:', errorMsg);
      showWarning('Age Validation', errorMsg);
    } else {
      // Show the actual error message if it doesn't match our patterns
      showError('Error', errorMsg);
    }
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

// Centralized alert functions for all app notifications
export const showFileError = (type, details = {}) => {
  const messages = {
    invalidType: 'Only JPG, PNG, or GIF images are allowed.',
    fileTooLarge: 'File size must be less than 2MB.',
    uploadFailed: 'Failed to upload avatar.',
    removeFailed: 'Failed to remove avatar.'
  };
  showError('File Error', messages[type] || 'File operation failed.');
};

export const showOperationError = (type, details = {}) => {
  const messages = {
    deleteFailed: 'Failed to delete person.',
    updateFailed: 'Failed to toggle spouse status.',
    shareFailed: `Share failed: ${details.message || 'Unknown error'}`,
    connectionFailed: 'No content to share',
    copyFailed: 'Failed to copy link',
    downloadFailed: 'Failed to download image',
    noImage: 'No image to download',
    unknownPlatform: 'Unknown sharing platform',
    popupBlocked: 'Please allow popups to share on social media',
    shareWindowFailed: 'Failed to open sharing window',
    missingRelationType: 'Please select a relationship type.',
    missingPerson: 'Please select a person to relate to.',
    generateContentFailed: 'Failed to generate shareable content'
  };
  showError('Operation Failed', messages[type] || 'Operation failed.');
};

export const showOperationSuccess = (type, details = {}) => {
  const messages = {
    linkCopied: 'Profile link copied to clipboard!',
    personAdded: `${details.firstName || 'Person'} ${details.lastName || ''} has been successfully added to the family tree!`,
    personUpdated: `${details.firstName || 'Person'} ${details.lastName || ''} has been successfully updated!`
  };
  showToast(messages[type] || 'Operation completed successfully!');
};

export const showFormError = (type, person = {}, child = {}, parent = {}) => {
  const messages = {
    missingBirthDate: 'Please enter a birth date for the new person. Birth dates are required to verify that sibling relationships are realistic.',
    missingPersonBirthDate: `${person?.first_name} ${person?.last_name} does not have a birth date in the system. Birth dates are required for both people to verify sibling relationships. Please add a birth date first, then try again.`,
    siblingAgeGap: `The age difference between these people is too large. Siblings typically do not have more than a 25-year age gap, as this would be unusual for children of the same parents. Consider if they might be parent-child instead, check if the birth dates are correct, or consider if they might be step-siblings through remarriage.`,
    temporalValidation: `Cannot add child born after parent's death. ${person.first_name} ${person.last_name} died on ${person.date_of_death}, but the birth date you entered is after that date. Please choose a birth date before the parent's death date.`,
    birthDateYounger: `The new birth date would make ${person.first_name} ${person.last_name} younger than their child ${child.first_name} ${child.last_name}. Please choose a birth date that maintains at least 12 years difference with all children.`,
    birthDateTooClose: `The new birth date would make ${person.first_name} ${person.last_name} only ${person.ageDiff || 0} years older than their child ${child.first_name} ${child.last_name}. A parent must be at least 12 years older than their child.`,
    parentAgeError: `The new birth date would make ${person.first_name} ${person.last_name} older than their parent ${parent.first_name} ${parent.last_name}. A child cannot be older than their parent.`,
    parentAgeTooClose: `The new birth date would make parent ${parent.first_name} ${parent.last_name} only ${parent.ageDiff || 0} years older than ${person.first_name} ${person.last_name}. A parent must be at least 12 years older than their child.`,
    marriageAge: `${person.first_name} ${person.last_name} would be ${person.age || 0} years old. Marriage is allowed for people 16 years old and older.`,
    deathDateError: `The death date would be before the birth of ${person.first_name} ${person.last_name}'s child ${child.first_name} ${child.last_name}. A parent cannot die before their child is born.`
  };
  
  // Age-related warnings (appropriateness issues, not system errors)
  if (type === 'marriageAge') {
    showWarning('Marriage Age Warning', messages[type] || 'Please check the age requirements.');
  } else if (type === 'siblingAgeGap') {
    showWarning('Sibling Age Gap Warning', messages[type] || 'Please verify the relationship type.');
  } else {
    // System validation errors
    showError('Validation Error', messages[type] || 'Please check the information and try again.');
  }
};

import { showError, showWarning, showToast } from './sweetAlerts';