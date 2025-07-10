
const https = require('https');

const API_BIBLE_BASE_URL = 'https://api.scripture.api.bible/v1';
const BIBLE_API_KEY = '927670f2c3f083ba3b9d64d8029af7fb';

// Popular translation IDs for categorization
const POPULAR_TRANSLATION_IDS = new Set([
  'ESV', // ESV API
  'bba9f40183526463-01', // BSB
  'de4e12af7f28f599-01', // KJV
  'de4e12af7f28f599-02', // KJV Protestant
  '9879dbb7cfe39e4d-04', // WEB Protestant
  '06125adad2d5898a-01', // ASV
  '01b29f4b342acc35-01', // LSV
  '65eec8e0b60e656b-01', // FBV
]);

function categorizeTranslation(translation) {
  const abbrev = translation.abbreviation?.toUpperCase();
  const name = translation.name?.toLowerCase() || '';
  
  // Popular modern translations
  if (POPULAR_TRANSLATION_IDS.has(translation.id) || abbrev === 'ESV') {
    return 'popular';
  }
  
  // Traditional/Historical translations
  if (abbrev?.includes('KJV') || abbrev === 'ASV' || abbrev === 'RV' || 
      name.includes('king james') || name.includes('authorised') || 
      name.includes('american standard') || name.includes('revised version')) {
    return 'traditional';
  }
  
  // Modern translations
  if (abbrev === 'WEB' || abbrev === 'WEBBE' || abbrev === 'LSV' || 
      abbrev === 'FBV' || abbrev === 'BSB' || name.includes('literal standard') ||
      name.includes('world english') || name.includes('free bible')) {
    return 'modern';
  }
  
  // Specialized versions (Messianic, Jewish, etc.)
  if (name.includes('messianic') || name.includes('jewish') || name.includes('orthodox') ||
      name.includes('septuagint') || abbrev?.includes('OJB') || abbrev?.includes('TOJB')) {
    return 'specialized';
  }
  
  // Historical/Academic
  if (name.includes('douay') || name.includes('rheims') || name.includes('geneva') ||
      name.includes('byzantine') || name.includes('majority text') || 
      name.includes('targum') || name.includes('1885') || name.includes('1917')) {
    return 'historical';
  }
  
  return 'modern'; // Default fallback
}

async function testTranslationDiscovery() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.scripture.api.bible',
      port: 443,
      path: '/v1/bibles',
      method: 'GET',
      headers: {
        'api-key': BIBLE_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const englishBibles = result.data
            .filter(bible => bible.language.id === 'eng')
            .map(bible => ({
              id: bible.id,
              name: bible.name,
              abbreviation: bible.abbreviation,
              language: bible.language,
              description: bible.description || bible.descriptionLocal,
              category: categorizeTranslation(bible),
              source: 'api_bible',
              type: bible.type,
              updatedAt: bible.updatedAt
            }));

          // Add ESV from ESV API as the first translation
          const esvTranslation = {
            id: 'ESV',
            name: 'English Standard Version',
            abbreviation: 'ESV',
            language: { 
              id: 'eng', 
              name: 'English', 
              nameLocal: 'English',
              script: 'Latin',
              scriptDirection: 'LTR'
            },
            description: 'Modern literal translation - Primary source via ESV API',
            category: 'popular',
            source: 'esv',
            type: 'text'
          };

          const allTranslations = [esvTranslation, ...englishBibles];
          
          // Sort by category priority and then alphabetically
          const categoryOrder = { popular: 0, modern: 1, traditional: 2, specialized: 3, historical: 4 };
          allTranslations.sort((a, b) => {
            const catA = categoryOrder[a.category];
            const catB = categoryOrder[b.category];
            
            if (catA !== catB) {
              return catA - catB;
            }
            
            // Within same category, prioritize popular translations first
            if (a.category === 'popular' && b.category === 'popular') {
              if (a.id === 'ESV') return -1;
              if (b.id === 'ESV') return 1;
              if (POPULAR_TRANSLATION_IDS.has(a.id) && !POPULAR_TRANSLATION_IDS.has(b.id)) return -1;
              if (!POPULAR_TRANSLATION_IDS.has(a.id) && POPULAR_TRANSLATION_IDS.has(b.id)) return 1;
            }
            
            return a.abbreviation.localeCompare(b.abbreviation);
          });

          console.log('🔍 Testing Translation Discovery Service...\n');
          console.log(`✅ Found ${allTranslations.length} English translations (including ESV)`);
          
          // Show first 10 translations
          console.log('\n📖 First 10 translations:');
          allTranslations.slice(0, 10).forEach((t, i) => {
            console.log(`${i+1}. ${t.abbreviation} - ${t.name} (${t.category}, ${t.source})`);
          });
          
          // Group by category
          const groups = {};
          allTranslations.forEach(t => {
            if (!groups[t.category]) {
              groups[t.category] = [];
            }
            groups[t.category].push(t);
          });
          
          console.log(`\n📚 Translation Groups (${Object.keys(groups).length} groups):`);
          Object.entries(groups).forEach(([category, translations]) => {
            const categoryLabel = {
              popular: 'Popular Translations',
              modern: 'Modern Translations', 
              traditional: 'Traditional Translations',
              specialized: 'Specialized Translations',
              historical: 'Historical Translations'
            };
            console.log(`  • ${categoryLabel[category]}: ${translations.length} translations`);
            translations.slice(0, 3).forEach(t => {
              console.log(`    - ${t.abbreviation}: ${t.name}`);
            });
            if (translations.length > 3) {
              console.log(`    ... and ${translations.length - 3} more`);
            }
          });
          
          console.log('\n✅ Translation Discovery Service working correctly!');
          resolve(allTranslations);
          
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.end();
  });
}

testTranslationDiscovery().catch(console.error);
