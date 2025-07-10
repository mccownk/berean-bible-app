
// Test script to verify ESV API integration
const { fetchBiblePassageText, getMockBiblePassage } = require('./app/lib/esv-api.ts');

async function testESVAPI() {
  console.log('🔍 Testing ESV API Integration...\n');
  
  // Test with some sample passages from the reading plan
  const testPassages = [
    ['John 1:1-5'],
    ['Romans 1:1-7'],
    ['Matthew 5:1-12'],
    ['Philippians 2:5-11']
  ];
  
  for (const passages of testPassages) {
    console.log(`📖 Testing passage: ${passages.join(', ')}`);
    
    try {
      const content = await fetchBiblePassageText(passages);
      
      if (content && !content.includes('[This is mock content for development purposes]')) {
        console.log('✅ Real ESV API content received!');
        console.log(`📄 Content preview: ${content.substring(0, 150)}...\n`);
      } else if (content && content.includes('[This is mock content for development purposes]')) {
        console.log('⚠️  Mock content returned (ESV API may not be working)');
        console.log(`📄 Content: ${content.substring(0, 100)}...\n`);
      } else {
        console.log('❌ No content returned\n');
      }
    } catch (error) {
      console.error(`❌ Error testing ${passages.join(', ')}:`, error.message);
    }
  }
}

// Run the test
testESVAPI().catch(console.error);
