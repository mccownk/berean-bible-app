
const https = require('https');

const ESV_API_KEY = '48ae66913d787d222ddaa556e47036bebe14b306'; // Old key for testing
const ESV_API_URL = 'https://api.esv.org/v3/passage/text/';

function makeESVRequest(passage) {
  return new Promise((resolve, reject) => {
    const url = `${ESV_API_URL}?q=${encodeURIComponent(passage)}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=false`;
    
    const options = {
      hostname: 'api.esv.org',
      path: `/v3/passage/text/?q=${encodeURIComponent(passage)}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=false`,
      method: 'GET',
      headers: {
        'Authorization': `Token ${ESV_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({ success: true, data: parsed, status: res.statusCode });
          } catch (error) {
            reject({ success: false, error: 'JSON parsing error', status: res.statusCode });
          }
        } else {
          reject({ success: false, error: data, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({ success: false, error: error.message, status: null });
    });
    
    req.end();
  });
}

async function testAPIKey() {
  console.log('🔑 Testing new ESV API Key:', ESV_API_KEY);
  console.log('=' .repeat(60));
  
  // Test passages from the reading plan
  const testPassages = [
    '1 John 1-5',    // Complete book (NT)
    'John 1-7',      // Chapter sections (NT)
    'Romans 1-8',    // Chapter sections (NT)
    'Philippians 1-4', // Complete book (NT)
    'Genesis 1',     // Single chapter (OT)
    'Psalm 1'        // Single Psalm (OT)
  ];
  
  for (const passage of testPassages) {
    console.log(`\n📖 Testing: ${passage}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await makeESVRequest(passage);
      
      if (result.success) {
        console.log(`✅ SUCCESS (Status: ${result.status})`);
        
        if (result.data && result.data.passages && result.data.passages.length > 0) {
          const text = result.data.passages[0];
          const preview = text.substring(0, 150).replace(/\n/g, ' ') + '...';
          console.log(`📝 Preview: ${preview}`);
          console.log(`📊 Length: ${text.length} characters`);
        } else {
          console.log('⚠️  No passage text returned');
        }
      } else {
        console.log(`❌ FAILED (Status: ${result.status})`);
        console.log(`Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.error || error.message}`);
      console.log(`Status: ${error.status || 'Unknown'}`);
    }
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 API Key Test Complete');
}

testAPIKey().catch(console.error);
