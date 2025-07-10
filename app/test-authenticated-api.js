const http = require('http');
const querystring = require('querystring');

async function getSessionCookie() {
  console.log('🔐 Testing authentication and API routes...');
  
  // First, let's try to get a session by simulating login
  // We'll make a request to the signin API
  const loginData = querystring.stringify({
    email: 'john@doe.com',
    password: 'johndoe123',
    callbackUrl: '/',
    csrfToken: 'test', // This might need to be obtained first
    json: 'true'
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/session',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Session check status:', res.statusCode);
        console.log('Session response:', data);
        
        // Extract session cookie if available
        const cookies = res.headers['set-cookie'];
        console.log('Cookies:', cookies);
        
        resolve(cookies ? cookies.join('; ') : '');
      });
    });

    req.on('error', (e) => {
      console.error('Session request error:', e.message);
      reject(e);
    });
    
    req.end();
  });
}

getSessionCookie().then(cookies => {
  console.log('\n📊 Testing translations API with cookies:', cookies ? 'AVAILABLE' : 'NONE');
  
  // Now test the translations API
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/bible/translations',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Translations API Status:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Translations count:', parsed.count || 'N/A');
          console.log('✅ Actual translations:', parsed.translations?.length || 0);
          
          if (parsed.translations) {
            console.log('\n📋 First 5 translations:');
            parsed.translations.slice(0, 5).forEach(t => {
              console.log(`  ${t.abbreviation} - ${t.name} (${t.source})`);
            });
          }
        } catch (e) {
          console.log('❌ Failed to parse JSON response');
        }
      } else {
        console.log('❌ API Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Translations API error:', e.message);
  });
  
  req.end();
}).catch(console.error);
