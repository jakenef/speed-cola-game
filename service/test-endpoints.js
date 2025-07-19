#!/usr/bin/env node

/**
 * Speed Cola API Test Suite
 * Run with: node test-endpoints.js
 * 
 * Tests all endpoints including:
 * - Authentication (create, login, logout)
 * - Score submission with rate limiting and flagging
 * - Admin endpoints (flagged scores, review)
 * - Leaderboards and personal bests
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
let cookies = '';

// Helper function to make authenticated requests
async function request(method, path, body = null, expectAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, options);
  
  // Save cookies for future requests
  if (response.headers.get('set-cookie')) {
    cookies = response.headers.get('set-cookie');
  }
  
  const data = await response.text();
  let json = null;
  try {
    json = JSON.parse(data);
  } catch (e) {
    json = { rawResponse: data };
  }
  
  return { status: response.status, data: json };
}

// Test utilities
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

function log(message) {
  console.log(`📝 ${message}`);
}

// Test data
const testUser = {
  name: 'testuser_' + Date.now(),
  password: 'testpass123'
};

// Admin testing should be done manually in browser for security
// No admin credentials stored in test files

// Cleanup function to remove test data
async function cleanupTestData() {
  log('Cleaning up test data...');
  try {
    // Note: We don't have delete endpoints, so test data will accumulate
    // Test users are clearly marked with 'testuser_' prefix and timestamp
    // You can manually clean the database occasionally if needed
    log('Test data cleanup: Test users are prefixed with "testuser_" for easy identification');
  } catch (error) {
    log('Cleanup note logged');
  }
}

async function runTests() {
  console.log('🚀 Starting Speed Cola API Tests...\n');
  
  try {
    // Check if server is running first
    log('Checking if server is running...');
    try {
      const healthCheck = await fetch(`${BASE_URL}/api/scores`);
      // Don't care about the response, just that we can connect
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('failed')) {
        console.error('❌ ERROR: Server is not running!');
        console.error('📋 Please start the server first:');
        console.error('   1. Open a new terminal');
        console.error('   2. cd to the service directory');
        console.error('   3. Run: npm start');
        console.error('   4. Wait for "Server running on port 4000"');
        console.error('   5. Then run: npm test');
        process.exit(1);
      }
      throw error;
    }
    
    // Test 1: Create User
    log('Testing user creation...');
    const createResult = await request('POST', '/api/auth/create', testUser, false);
    assert(createResult.status === 200, 'User creation should succeed');
    assert(createResult.data.name === testUser.name, 'Response should contain username');
    assert(createResult.data.location, 'Response should contain location');
    
    // Test 2: Login
    log('Testing user login...');
    const loginResult = await request('POST', '/api/auth/login', testUser, false);
    assert(loginResult.status === 200, 'Login should succeed');
    assert(loginResult.data.name === testUser.name, 'Login response should contain username');
    
    // Test 3: Submit Normal Score
    log('Testing normal score submission...');
    const scoreResult = await request('POST', '/api/score', { score: 350 });
    assert(scoreResult.status === 200, 'Normal score submission should succeed');
    assert(scoreResult.data.score === 350, 'Response should contain submitted score');
    assert(scoreResult.data.name === testUser.name, 'Response should contain username');
    
    // Test 4: Rate Limiting
    log('Testing rate limiting...');
    const rateLimitResult = await request('POST', '/api/score', { score: 340 });
    assert(rateLimitResult.status === 429, 'Rate limiting should block rapid submissions');
    assert(rateLimitResult.data.error === 'Suspicious activity detected.', 'Should return suspicious activity message');
    
    // Wait for rate limit to reset
    log('Waiting for rate limit to reset...');
    await new Promise(resolve => setTimeout(resolve, 3100));
    
    // Test 5: Submit Score That Should Be Flagged
    log('Testing flagged score (too good for new player)...');
    const flaggedResult = await request('POST', '/api/score', { score: 100 });
    assert(flaggedResult.status === 200, 'Flagged score should still return 200');
    assert(flaggedResult.data.score === 100, 'Response should contain submitted score');
    assert(!flaggedResult.data.flagged, 'Flagged status should not be exposed to user');
    
    // Test 6: Get Leaderboard
    log('Testing leaderboard retrieval...');
    const scoresResult = await request('GET', '/api/scores');
    assert(scoresResult.status === 200, 'Leaderboard should be accessible');
    assert(Array.isArray(scoresResult.data), 'Leaderboard should return an array');
    
    // Test 7: Get Personal Best
    log('Testing personal best retrieval...');
    const pbResult = await request('GET', `/api/personal-best/${testUser.name}`);
    assert(pbResult.status === 200, 'Personal best should be accessible');
    assert(typeof pbResult.data.personalBest === 'number', 'Personal best should be a number');
    
    // Test 8: Admin Access (should fail for regular user)
    log('Testing admin access with regular user...');
    const adminFailResult = await request('GET', '/api/admin/flagged-scores');
    assert(adminFailResult.status === 403, 'Regular user should not have admin access');
    assert(adminFailResult.data.msg === 'Admin access required', 'Should return admin access required message');
    
    // Test 9: Logout
    log('Testing user logout...');
    const logoutResult = await request('DELETE', '/api/auth/logout');
    assert(logoutResult.status === 204, 'Logout should succeed');
    
    // Test 10: Access Protected Endpoint After Logout
    log('Testing protected endpoint access after logout...');
    const unauthorizedResult = await request('GET', '/api/scores');
    assert(unauthorizedResult.status === 401, 'Should be unauthorized after logout');
    
    console.log('\n🎉 All tests passed! Your API is working correctly.');
    
    // Clean up test data
    await cleanupTestData();
    
    console.log('\n📋 To test admin functionality:');
    console.log('1. Login as your admin user in the browser');
    console.log('2. Open browser console and run:');
    console.log("   fetch('/api/admin/flagged-scores', {credentials: 'include'}).then(r => r.json()).then(console.log)");
    console.log('3. Copy a score ID from the flagged scores list');
    console.log('4. To approve a score, run:');
    console.log("   fetch('/api/admin/review-score/SCORE_ID_HERE', {");
    console.log("     method: 'POST',");
    console.log("     headers: {'Content-Type': 'application/json'},");
    console.log("     credentials: 'include',");
    console.log("     body: JSON.stringify({action: 'approve'})");
    console.log("   }).then(r => r.json()).then(console.log)");
    console.log('5. To deny a score, change action to "deny"');
    console.log('6. Admin testing kept separate for security - no credentials in test files');
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error.message);
    // Try to clean up even if tests failed
    try {
      await cleanupTestData();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
