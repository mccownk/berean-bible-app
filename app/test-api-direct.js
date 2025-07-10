const https = require('https');
require('dotenv').config();

async function testApiDirectly() {
  console.log('Environment check:');
  console.log('BIBLE_API_KEY:', process.env.BIBLE_API_KEY ? 'SET' : 'NOT SET');
  
  const API_KEY = process.env.BIBLE_API_KEY;
  
  if (!API_KEY) {
    console.log('❌ BIBLE_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ Making API call to api.scripture.api.bible...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.scripture.api.bible',
      port: 443,
      path: '/v1/bibles',
      method: 'GET',
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.data) {
            const englishBibles = response.data.filter(bible => bible.language.id === 'eng');
            
            console.log('\n=== API Response Summary ===');
            console.log('Total bibles:', response.data.length);
            console.log('English bibles:', englishBibles.length);
            
            // Add ESV manually (like the service does)
            const totalWithESV = englishBibles.length + 1;
            console.log('Total with ESV:', totalWithESV);
            
            console.log('\n=== Sample English Translations ===');
            englishBibles.slice(0, 5).forEach(bible => {
              console.log(`  ${bible.abbreviation} - ${bible.name}`);
            });
            
            resolve(englishBibles);
          } else {
            console.log('❌ No data in response:', data);
            reject(new Error('No data in response'));
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });
    
    req.end();
  });
}

testApiDirectly().catch(console.error);
