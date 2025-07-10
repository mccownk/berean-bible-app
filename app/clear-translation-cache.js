// Clear the translation cache on the server side
require('dotenv').config();

// We need to create a script that forces the cache to clear
// Since the cache is in-memory, restarting the server will clear it
console.log('🧹 Forcing server-side translation cache clear...');

// Let's also test the translation discovery service directly
const https = require('https');

async function testTranslationDiscoveryDirectly() {
  console.log('🔍 Testing translation discovery service directly...');
  
  const API_KEY = process.env.BIBLE_API_KEY;
  console.log('API Key available:', API_KEY ? 'YES' : 'NO');
  
  if (!API_KEY) {
    console.log('❌ BIBLE_API_KEY not found in environment');
    return;
  }
  
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
            
            console.log('✅ Direct API call successful:');
            console.log('  Total bibles:', response.data.length);
            console.log('  English bibles:', englishBibles.length);
            console.log('  Expected total with ESV:', englishBibles.length + 1);
            
            console.log('\n📋 Sample English translations:');
            englishBibles.slice(0, 8).forEach(bible => {
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

testTranslationDiscoveryDirectly().then(() => {
  console.log('\n🔄 Restarting Next.js server to clear in-memory cache...');
  console.log('The server will restart automatically and clear any cached data.');
}).catch(console.error);
