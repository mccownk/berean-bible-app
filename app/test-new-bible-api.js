
// Test the new Bible API integration directly
async function testBibleApiIntegration() {
  console.log("=== Testing New Bible API Integration ===\n");
  
  const API_KEY = "927670f2c3f083ba3b9d64d8029af7fb";
  const BASE_URL = "https://api.scripture.api.bible/v1";
  const BIBLE_ID = "bba9f40183526463-01"; // Berean Standard Bible
  
  // Book name to book ID mapping
  const BOOK_ID_MAP = {
    'john': 'JHN',
    '1 john': '1JN',
    'philippians': 'PHP',
    'romans': 'ROM'
  };
  
  function parsePassageReference(passage) {
    const cleanPassage = passage.trim();
    const match = cleanPassage.match(/^(.+?)\s+(\d+)(?:[:\.](\d+))?(?:-(\d+))?$/);
    
    if (!match) {
      throw new Error(`Invalid passage format: ${passage}`);
    }
    
    const [, bookName, chapter, verse, endVerse] = match;
    const normalizedBookName = bookName.toLowerCase().trim();
    
    const bookId = BOOK_ID_MAP[normalizedBookName];
    if (!bookId) {
      throw new Error(`Unknown book: ${bookName}`);
    }
    
    if (verse) {
      if (endVerse) {
        return `${bookId}.${chapter}.${verse}-${bookId}.${chapter}.${endVerse}`;
      } else {
        return `${bookId}.${chapter}.${verse}`;
      }
    } else {
      return `${bookId}.${chapter}`;
    }
  }
  
  // Test passages from the reading plan
  const testPassages = [
    "John 3:16",
    "1 John 1:1",
    "John 1:1",
    "Philippians 4:13",
    "Romans 8:28"
  ];
  
  console.log("Testing Bible API passages...");
  
  for (const passage of testPassages) {
    console.log(`\nTesting: ${passage}`);
    
    try {
      const passageId = parsePassageReference(passage);
      console.log(`Passage ID: ${passageId}`);
      
      const response = await fetch(`${BASE_URL}/bibles/${BIBLE_ID}/passages/${passageId}`, {
        headers: {
          'api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Success!");
        console.log(`Reference: ${data.data.reference}`);
        
        // Convert HTML to text
        const textContent = data.data.content
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log("Content preview:", textContent.substring(0, 100) + "...");
      } else {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  
  console.log("\n=== Bible API Integration Test Complete ===");
}

testBibleApiIntegration().catch(console.error);
