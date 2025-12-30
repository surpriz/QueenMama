import axios from 'axios';

const API_URL = 'http://localhost:3003';

async function testAdminAPI() {
  try {
    console.log('🔐 Step 1: Logging in as jerome0laval@gmail.com...\n');

    // Login to get authentication cookie
    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: 'jerome0laval@gmail.com',
        password: 'admin123',
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.email}`);
    console.log(`   Role: ${loginResponse.data.role}\n`);

    // Extract cookies
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';

    console.log('📊 Step 2: Testing /admin/stats endpoint...\n');

    // Test admin stats endpoint
    const statsResponse = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log('✅ Admin stats endpoint working!');
    console.log('   Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    console.log('👥 Step 3: Testing /admin/users endpoint...\n');

    // Test admin users endpoint
    const usersResponse = await axios.get(`${API_URL}/admin/users`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log('✅ Admin users endpoint working!');
    console.log(`   Total users: ${usersResponse.data.meta.total}`);
    console.log(`   Returned: ${usersResponse.data.data.length} users`);
    console.log('   Users:', JSON.stringify(usersResponse.data.data.map((u: any) => ({ email: u.email, role: u.role })), null, 2));
    console.log('');

    console.log('📋 Step 4: Testing /admin/campaigns endpoint...\n');

    // Test admin campaigns endpoint
    const campaignsResponse = await axios.get(`${API_URL}/admin/campaigns`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log('✅ Admin campaigns endpoint working!');
    console.log(`   Total campaigns: ${campaignsResponse.data.meta.total}`);
    console.log(`   Returned: ${campaignsResponse.data.data.length} campaigns`);
    console.log('');

    console.log('🎉 All admin API endpoints are working correctly!\n');

  } catch (error: any) {
    console.error('❌ Error testing admin API:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testAdminAPI();
