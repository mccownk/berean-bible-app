
const API_KEY = "927670f2c3f083ba3b9d64d8029af7fb";
const BASE_URL = "https://api.scripture.api.bible/v1";

async function exploreApiBible() {
  console.log("=== Exploring API.Bible Structure ===\n");
  
  // 1. Get list of available Bibles
  console.log("1. Getting available English Bibles...");
  try {
    const response = await fetch(`${BASE_URL}/bibles`, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    const englishBibles = data.data.filter(bible => 
      bible.language.id === 'eng' || bible.language.name.toLowerCase().includes('english')
    );
    
    console.log("English Bibles found:");
    englishBibles.forEach(bible => {
      console.log(`- ${bible.name} (${bible.abbreviation}) - ID: ${bible.id}`);
    });
    
    // Pick a good English Bible (look for ESV, NIV, or similar)
    const preferredBible = englishBibles.find(bible => 
      bible.abbreviation.includes('ESV') || 
      bible.abbreviation.includes('NIV') || 
      bible.abbreviation.includes('NASB') ||
      bible.name.toLowerCase().includes('english')
    ) || englishBibles[0];
    
    console.log(`\nSelected Bible: ${preferredBible.name} (${preferredBible.abbreviation})`);
    console.log(`Bible ID: ${preferredBible.id}`);
    
    // 2. Test getting a specific passage
    console.log("\n2. Testing passage retrieval...");
    const testPassageId = "JHN.3.16"; // John 3:16
    
    const passageResponse = await fetch(`${BASE_URL}/bibles/${preferredBible.id}/passages/${testPassageId}`, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const passageData = await passageResponse.json();
    console.log("Sample passage response:");
    console.log(JSON.stringify(passageData, null, 2));
    
    // 3. Test getting books structure
    console.log("\n3. Getting books structure...");
    const booksResponse = await fetch(`${BASE_URL}/bibles/${preferredBible.id}/books`, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const booksData = await booksResponse.json();
    console.log("Sample books:");
    booksData.data.slice(0, 5).forEach(book => {
      console.log(`- ${book.name} (${book.abbreviation}) - ID: ${book.id}`);
    });
    
    return {
      selectedBible: preferredBible,
      samplePassage: passageData,
      books: booksData.data
    };
    
  } catch (error) {
    console.error("Error exploring API.Bible:", error);
    return null;
  }
}

exploreApiBible().then(result => {
  if (result) {
    console.log("\n=== API.Bible Integration Ready ===");
    console.log(`Default Bible: ${result.selectedBible.name}`);
    console.log(`Bible ID: ${result.selectedBible.id}`);
    console.log("✅ API.Bible exploration successful!");
  } else {
    console.log("❌ API.Bible exploration failed");
  }
});
