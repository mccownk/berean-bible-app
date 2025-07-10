
// Test script for dual-API integration (ESV + Bible API)
require('dotenv').config({ path: '.env.local' });

async function testESVAPI() {
  console.log('1️⃣ Testing ESV API directly...');
  
  try {
    const response = await fetch('https://api.esv.org/v3/passage/text?q=John+3:16', {
      headers: {
        'Authorization': `Token ${process.env.ESV_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ESV API working');
      console.log(`   Content preview: ${data.passages?.[0]?.substring(0, 100)}...`);
    } else {
      console.log('❌ ESV API failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ ESV API error:', error.message);
  }
  console.log('');
}

async function testBibleAPI() {
  console.log('2️⃣ Testing Bible API directly...');
  
  try {
    const response = await fetch('https://api.scripture.api.bible/v1/bibles/bba9f40183526463-01/passages/JHN.3.16', {
      headers: {
        'api-key': process.env.BIBLE_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bible API working');
      console.log(`   Content preview: ${data.data?.content?.substring(0, 100)}...`);
    } else {
      console.log('❌ Bible API failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Bible API error:', error.message);
  }
  console.log('');
}

async function testInternalAPI() {
  console.log('3️⃣ Testing internal API endpoint...');
  
  try {
    // Test ESV through internal API
    const esvResponse = await fetch('http://localhost:3000/api/bible/passage?passages=John 3:16', {
      headers: {
        'Authorization': 'Bearer test-token', // This would normally be session-based
      },
    });
    
    console.log('   ESV request status:', esvResponse.status);
    
    if (esvResponse.status === 401) {
      console.log('ℹ️  API requires authentication (expected)');
    } else if (esvResponse.ok) {
      const data = await esvResponse.json();
      console.log('✅ Internal API working');
      console.log(`   Translation: ${data.translation}`);
      console.log(`   Content preview: ${data.content?.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.log('ℹ️  Internal API test skipped (server not running)');
  }
  console.log('');
}

// API Keys validation
function validateAPIKeys() {
  console.log('🔑 Validating API Keys...');
  
  const esvKey = process.env.ESV_API_KEY;
  const bibleKey = process.env.BIBLE_API_KEY;
  
  if (esvKey) {
    console.log('✅ ESV API Key found');
    console.log(`   Key preview: ${esvKey.substring(0, 8)}...`);
  } else {
    console.log('❌ ESV API Key missing');
  }
  
  if (bibleKey) {
    console.log('✅ Bible API Key found');
    console.log(`   Key preview: ${bibleKey.substring(0, 8)}...`);
  } else {
    console.log('❌ Bible API Key missing');
  }
  
  console.log('');
}

// Run tests
async function runTests() {
  console.log('🧪 Dual-API Integration Test Suite\n');
  console.log('Testing ESV API + Bible API integration...\n');
  
  validateAPIKeys();
  await testESVAPI();
  await testBibleAPI();
  await testInternalAPI();
  
  console.log('🎉 Dual-API integration test completed!');
}

runTests().catch(console.error);
