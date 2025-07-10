const http = require('http');

// Test the Next.js API route
async function testAppAPI() {
  console.log('Testing Next.js /api/bible/translations endpoint...');
  
  // We need to authenticate first. Let's try without auth to see the error
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/bible/translations',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
        try {
          const parsed = JSON.parse(data);
          if (parsed.translations) {
            console.log('Translations count:', parsed.translations.length);
          }
        } catch (e) {
          // Response might not be JSON
        }
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });
    
    req.end();
  });
}

testAppAPI().catch(console.error);
