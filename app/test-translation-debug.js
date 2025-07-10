const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('Environment variables:');
console.log('BIBLE_API_KEY:', process.env.BIBLE_API_KEY ? 'SET' : 'NOT SET');
console.log('ESV_API_KEY:', process.env.ESV_API_KEY ? 'SET' : 'NOT SET');

// Test the translation discovery service
async function testTranslationDiscovery() {
  try {
    // Import the translation discovery module
    const { getAllAvailableTranslations, clearTranslationCache } = require('./lib/translation-discovery.ts');
    
    console.log('\n=== Testing Translation Discovery ===');
    
    // Clear cache to force fresh fetch
    clearTranslationCache();
    
    // Get all translations
    const translations = await getAllAvailableTranslations(true);
    
    console.log('Total translations found:', translations.length);
    console.log('\nTranslations by source:');
    console.log('ESV API:', translations.filter(t => t.source === 'esv').length);
    console.log('API.Bible:', translations.filter(t => t.source === 'api_bible').length);
    
    console.log('\nFirst 10 translations:');
    translations.slice(0, 10).forEach(t => {
      console.log(`  ${t.abbreviation} - ${t.name} (${t.source})`);
    });
    
    if (translations.length < 10) {
      console.log('\nAll translations:');
      translations.forEach(t => {
        console.log(`  ${t.abbreviation} - ${t.name} (${t.source})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing translation discovery:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testTranslationDiscovery();
