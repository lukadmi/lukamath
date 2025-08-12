// Test script for admin authentication flow
const BASE_URL = 'http://localhost:5000/api';

async function testAdminFlow() {
  console.log('🧪 Testing Admin Authentication Flow\n');

  try {
    // Step 1: Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'olovka0987@gmail.com',
        password: 'Admin123!'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    
    console.log('✅ Login successful:', loginData.user?.email, loginData.user?.role);
    const token = loginData.token;

    // Step 2: Test /api/auth/user endpoint with token
    console.log('\n2. Testing /api/auth/user endpoint...');
    const userResponse = await fetch(`${BASE_URL}/auth/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!userResponse.ok) {
      console.error('❌ User endpoint failed:', await userResponse.text());
      return;
    }
    
    const userData = await userResponse.json();
    console.log('✅ User endpoint successful:', userData.email, userData.role);

    // Step 3: Test admin endpoints
    console.log('\n3. Testing admin endpoints...');
    
    // Test students endpoint
    const studentsResponse = await fetch(`${BASE_URL}/admin/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!studentsResponse.ok) {
      console.error('❌ Students endpoint failed:', await studentsResponse.text());
      return;
    }
    
    const students = await studentsResponse.json();
    console.log('✅ Students endpoint successful, count:', students.length);

    // Test homework endpoint
    const homeworkResponse = await fetch(`${BASE_URL}/admin/homework`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!homeworkResponse.ok) {
      console.error('❌ Homework endpoint failed:', await homeworkResponse.text());
      return;
    }
    
    const homework = await homeworkResponse.json();
    console.log('✅ Homework endpoint successful, count:', homework.length);

    // Test questions endpoint
    const questionsResponse = await fetch(`${BASE_URL}/admin/questions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!questionsResponse.ok) {
      console.error('❌ Questions endpoint failed:', await questionsResponse.text());
      return;
    }
    
    const questions = await questionsResponse.json();
    console.log('✅ Questions endpoint successful, count:', questions.length);

    // Test contacts endpoint
    const contactsResponse = await fetch(`${BASE_URL}/admin/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!contactsResponse.ok) {
      console.error('❌ Contacts endpoint failed:', await contactsResponse.text());
      return;
    }
    
    const contacts = await contactsResponse.json();
    console.log('✅ Contacts endpoint successful, count:', contacts.length);

    console.log('\n🎉 All tests passed! Admin authentication system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAdminFlow();
