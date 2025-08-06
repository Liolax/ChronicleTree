// Test script to verify ownership fix for person 26 (Molly)
// This should run in the browser console to test the API

const testOwnershipFix = async () => {
  const baseURL = 'http://localhost:4000/api/v1';
  
  console.log('Testing ownership fix for person 26 (Molly)...\n');
  
  try {
    // Test 1: Login as test@example.com
    console.log('1. Attempting login as test@example.com...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: 'test@example.com',
          password: 'password'
        }
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    const authToken = loginResponse.headers.get('Authorization');
    console.log('Login successful, auth token received');
    
    // Test 2: Fetch person 26 (Molly)
    console.log('\n2. Fetching person 26 (Molly)...');
    const personResponse = await fetch(`${baseURL}/people/26`, {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (personResponse.ok) {
      const personData = await personResponse.json();
      console.log('Person 26 fetched successfully:', personData);
      
      // Test 3: Try updating person 26 (toggle deceased status)
      console.log('\n3. Testing update of person 26...');
      const currentDeceased = personData.is_deceased;
      const updateResponse = await fetch(`${baseURL}/people/26`, {
        method: 'PATCH',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          person: {
            is_deceased: !currentDeceased,
            first_name: personData.first_name,
            last_name: personData.last_name,
            birth_date: personData.birth_date,
            death_date: currentDeceased ? null : personData.death_date
          }
        })
      });
      
      if (updateResponse.ok) {
        const updateData = await updateResponse.json();
        console.log('Person 26 updated successfully!', updateData);
        console.log('OWNERSHIP FIX VERIFIED - No more 500 errors!');
        
        // Reset back to original state
        console.log('\n4. Resetting to original state...');
        const resetResponse = await fetch(`${baseURL}/people/26`, {
          method: 'PATCH',
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            person: {
              is_deceased: currentDeceased,
              first_name: personData.first_name,
              last_name: personData.last_name,
              birth_date: personData.birth_date,
              death_date: personData.death_date
            }
          })
        });
        
        if (resetResponse.ok) {
          console.log('Reset successful - person back to original state');
        }
        
      } else {
        const errorData = await updateResponse.text();
        console.error('Update failed with status:', updateResponse.status);
        console.error('Error details:', errorData);
      }
      
    } else {
      const errorData = await personResponse.text();
      console.error('Failed to fetch person 26:', personResponse.status);
      console.error('Error details:', errorData);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
};

// Run the test
testOwnershipFix();
