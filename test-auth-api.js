// Simple test script for authentication API
async function testAuthAPI() {
  const baseURL = 'http://localhost:5000/api/auth';
  
  console.log('🧪 Testing Authentication API');
  
  try {
    // Test 1: Register a new user
    console.log('\n1️⃣ Testing user registration...');
    const registerResponse = await fetch(`${baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@lukamath.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        language: 'en'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
    
    if (registerData.success) {
      console.log('✅ Registration successful');
      
      // Test 2: Login with the new user
      console.log('\n2️⃣ Testing user login...');
      const loginResponse = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@lukamath.com',
          password: 'Test123!@#'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      
      if (loginData.success && loginData.token) {
        console.log('✅ Login successful');
        
        // Test 3: Get current user info
        console.log('\n3️⃣ Testing get current user...');
        const meResponse = await fetch(`${baseURL}/me`, {
          headers: { 
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        const meData = await meResponse.json();
        console.log('Current user response:', meData);
        
        if (meData.success) {
          console.log('✅ Get current user successful');
        } else {
          console.log('❌ Get current user failed');
        }
        
      } else {
        console.log('❌ Login failed');
      }
      
    } else {
      console.log('❌ Registration failed');
      
      // If registration failed because user exists, try login
      if (registerData.messageKey === 'auth.email_exists') {
        console.log('\n🔄 User exists, testing login directly...');
        const loginResponse = await fetch(`${baseURL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@lukamath.com',
            password: 'Test123!@#'
          })
        });
        
        const loginData = await loginResponse.json();
        console.log('Direct login response:', loginData);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testAuthAPI();
