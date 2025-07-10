
const API_KEY = "927670f2c3f083ba3b9d64d8029af7fb";
const BASE_URL = "https://api.scripture.api.bible/v1";

async function testPassageFormats() {
  console.log("=== Testing Passage Formats ===\n");
  
  // Test with Berean Standard Bible (more appropriate for "Berean Bible" app)
  const bsbBibleId = "bba9f40183526463-01"; // Berean Standard Bible
  
  console.log("Using Berean Standard Bible (BSB)");
  
  // Test different passage ID formats
  const testFormats = [
    "JHN.3.16",        // John 3:16
    "JHN.3.16-JHN.3.16", // John 3:16 range
    "JHN.3.16-17",     // John 3:16-17
    "JHN.3",           // John chapter 3
    "JHN.1.1-5"        // John 1:1-5
  ];
  
  for (const passageId of testFormats) {
    console.log(`\nTesting passage ID: ${passageId}`);
    
    try {
      const response = await fetch(`${BASE_URL}/bibles/${bsbBibleId}/passages/${passageId}`, {
        headers: {
          'api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${data.data.reference}`);
        console.log(`Content preview: ${data.data.content.substring(0, 100)}...`);
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test getting book information
  console.log("\n=== Testing Book Information ===");
  
  try {
    const response = await fetch(`${BASE_URL}/bibles/${bsbBibleId}/books`, {
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Available books:");
      
      // Look for John specifically
      const johnBook = data.data.find(book => 
        book.name.toLowerCase().includes('john') && 
        !book.name.toLowerCase().includes('1 john') &&
        !book.name.toLowerCase().includes('2 john') &&
        !book.name.toLowerCase().includes('3 john')
      );
      
      if (johnBook) {
        console.log(`Found John: ${johnBook.name} (${johnBook.abbreviation}) - ID: ${johnBook.id}`);
        
        // Test getting chapters for John
        const chaptersResponse = await fetch(`${BASE_URL}/bibles/${bsbBibleId}/books/${johnBook.id}/chapters`, {
          headers: {
            'api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          console.log("Sample chapters:");
          chaptersData.data.slice(0, 5).forEach(chapter => {
            console.log(`- ${chapter.reference} (ID: ${chapter.id})`);
          });
        }
      }
    }
  } catch (error) {
    console.log(`Error getting book info: ${error.message}`);
  }
  
  return bsbBibleId;
}

testPassageFormats().then(bibleId => {
  console.log(`\n✅ Test complete. Using Bible ID: ${bibleId}`);
});
