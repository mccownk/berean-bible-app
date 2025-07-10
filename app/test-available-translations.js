
const https = require('https');
const fs = require('fs');

const API_KEY = '927670f2c3f083ba3b9d64d8029af7fb';
const API_BASE_URL = 'https://api.scripture.api.bible/v1';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.scripture.api.bible',
            path: path,
            method: 'GET',
            headers: {
                'api-key': API_KEY,
                'Accept': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function fetchAvailableTranslations() {
    try {
        console.log('Fetching available Bible translations...\n');
        
        const response = await makeRequest('/v1/bibles');
        
        if (response && response.data) {
            const bibles = response.data;
            
            console.log(`Found ${bibles.length} Bible translations:\n`);
            
            // Filter for English translations and popular ones
            const englishBibles = bibles.filter(bible => 
                bible.language.id === 'eng' || 
                bible.language.name === 'English'
            );
            
            console.log(`English translations (${englishBibles.length}):\n`);
            
            // Sort by popularity/common translations first
            const popularTranslations = [];
            const otherTranslations = [];
            
            const popularNames = ['ESV', 'NIV', 'NASB', 'KJV', 'NKJV', 'BSB', 'CSB', 'NLT', 'HCSB', 'ASV'];
            
            englishBibles.forEach(bible => {
                const isPopular = popularNames.some(name => 
                    bible.abbreviation.includes(name) || 
                    bible.name.includes(name)
                );
                
                if (isPopular) {
                    popularTranslations.push(bible);
                } else {
                    otherTranslations.push(bible);
                }
            });
            
            console.log('=== POPULAR TRANSLATIONS ===');
            popularTranslations.forEach(bible => {
                console.log(`ID: ${bible.id}`);
                console.log(`Name: ${bible.name}`);
                console.log(`Abbreviation: ${bible.abbreviation}`);
                console.log(`Description: ${bible.description}`);
                console.log(`Language: ${bible.language.name}`);
                console.log('---');
            });
            
            console.log('\n=== OTHER ENGLISH TRANSLATIONS ===');
            otherTranslations.slice(0, 10).forEach(bible => {
                console.log(`ID: ${bible.id}`);
                console.log(`Name: ${bible.name}`);
                console.log(`Abbreviation: ${bible.abbreviation}`);
                console.log(`Description: ${bible.description}`);
                console.log('---');
            });
            
            // Save popular translations to file for reference
            const translationData = {
                popular: popularTranslations,
                others: otherTranslations
            };
            
            fs.writeFileSync('available-translations.json', JSON.stringify(translationData, null, 2));
            console.log('\nTranslation data saved to available-translations.json');
            
        } else {
            console.log('No Bible translations found in response');
        }
        
    } catch (error) {
        console.error('Error fetching translations:', error);
    }
}

fetchAvailableTranslations();
