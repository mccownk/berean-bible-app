
const API_KEY = "927670f2c3f083ba3b9d64d8029af7fb";

async function testApiService(serviceName, url, headers, testPassage = "John 3:16") {
  console.log(`\n--- Testing ${serviceName} ---`);
  console.log(`URL: ${url}`);
  console.log(`Headers:`, headers);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      return { success: true, data, service: serviceName };
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText.substring(0, 200));
      return { success: false, error: errorText, service: serviceName };
    }
  } catch (error) {
    console.log('Request failed:', error.message);
    return { success: false, error: error.message, service: serviceName };
  }
}

async function identifyBibleApiService() {
  console.log("Identifying Bible API service for key:", API_KEY);
  
  const testConfigs = [
    // ESV API
    {
      name: "ESV API",
      url: "https://api.esv.org/v3/passage/text?q=John+3:16",
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    
    // API.Bible
    {
      name: "API.Bible",
      url: "https://api.scripture.api.bible/v1/bibles",
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    },
    
    // Bible Gateway API
    {
      name: "Bible Gateway API",
      url: "https://www.biblegateway.com/api/passage/?search=John+3:16&version=NIV",
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    
    // GetBible.net API
    {
      name: "GetBible.net API",
      url: `https://getbible.net/v2/${API_KEY}/John/3/16.json`,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    
    // Bible Web Service
    {
      name: "Bible Web Service",
      url: "https://www.biblewebservice.com/cgi-bin/bible.cgi?passage=John+3:16&version=kjv",
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    
    // Alternative API.Bible endpoint
    {
      name: "API.Bible (Alternative)",
      url: "https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/passages/JHN.3.16",
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    },
    
    // Try with X-API-Key header
    {
      name: "Generic API with X-API-Key",
      url: "https://api.scripture.api.bible/v1/bibles",
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
  ];
  
  const results = [];
  
  for (const config of testConfigs) {
    const result = await testApiService(config.name, config.url, config.headers);
    results.push(result);
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n=== SUMMARY ===");
  const successful = results.filter(r => r.success);
  
  if (successful.length > 0) {
    console.log("✅ Successful API services:");
    successful.forEach(result => {
      console.log(`- ${result.service}`);
    });
    
    // Return the first successful service for further inspection
    return successful[0];
  } else {
    console.log("❌ No API services responded successfully");
    console.log("Failed attempts:");
    results.forEach(result => {
      console.log(`- ${result.service}: ${result.error}`);
    });
    return null;
  }
}

// Run the test
identifyBibleApiService()
  .then(result => {
    if (result) {
      console.log(`\n🎉 Identified API service: ${result.service}`);
      console.log("Sample response data:", JSON.stringify(result.data, null, 2));
    } else {
      console.log("\n🔍 Need to investigate further or the key might be invalid");
    }
  })
  .catch(error => {
    console.error("Test failed:", error);
  });
