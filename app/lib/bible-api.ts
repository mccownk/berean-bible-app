
const API_BIBLE_BASE_URL = 'https://api.scripture.api.bible/v1';

// ESV is now the default (via ESV API)
const DEFAULT_BIBLE_ID = 'ESV';

// Import from translation discovery service
import { 
  BibleTranslation, 
  getAllAvailableTranslations, 
  getTranslationById, 
  isESVTranslation,
  getFallbackTranslations 
} from './translation-discovery';

export interface BiblePassageResponse {
  query: string;
  canonical: string;
  reference: string;
  passages: string[];
  bibleId: string;
  translation: string;
}

// Book name to book ID mapping for API.Bible
const BOOK_ID_MAP: { [key: string]: string } = {
  // New Testament
  'matthew': 'MAT', 'matt': 'MAT', 'mt': 'MAT',
  'mark': 'MRK', 'mk': 'MRK',
  'luke': 'LUK', 'lk': 'LUK',
  'john': 'JHN', 'jn': 'JHN',
  'acts': 'ACT',
  'romans': 'ROM', 'rom': 'ROM',
  '1 corinthians': '1CO', '1co': '1CO', '1 cor': '1CO',
  '2 corinthians': '2CO', '2co': '2CO', '2 cor': '2CO',
  'galatians': 'GAL', 'gal': 'GAL',
  'ephesians': 'EPH', 'eph': 'EPH',
  'philippians': 'PHP', 'phil': 'PHP',
  'colossians': 'COL', 'col': 'COL',
  '1 thessalonians': '1TH', '1th': '1TH', '1 thess': '1TH',
  '2 thessalonians': '2TH', '2th': '2TH', '2 thess': '2TH',
  '1 timothy': '1TI', '1ti': '1TI', '1 tim': '1TI',
  '2 timothy': '2TI', '2ti': '2TI', '2 tim': '2TI',
  'titus': 'TIT', 'tit': 'TIT',
  'philemon': 'PHM', 'phm': 'PHM',
  'hebrews': 'HEB', 'heb': 'HEB',
  'james': 'JAS', 'jas': 'JAS',
  '1 peter': '1PE', '1pe': '1PE', '1 pet': '1PE',
  '2 peter': '2PE', '2pe': '2PE', '2 pet': '2PE',
  '1 john': '1JN', '1jn': '1JN',
  '2 john': '2JN', '2jn': '2JN',
  '3 john': '3JN', '3jn': '3JN',
  'jude': 'JUD', 'jud': 'JUD',
  'revelation': 'REV', 'rev': 'REV',
  
  // Old Testament
  'genesis': 'GEN', 'gen': 'GEN',
  'exodus': 'EXO', 'exo': 'EXO',
  'leviticus': 'LEV', 'lev': 'LEV',
  'numbers': 'NUM', 'num': 'NUM',
  'deuteronomy': 'DEU', 'deut': 'DEU',
  'joshua': 'JOS', 'josh': 'JOS',
  'judges': 'JDG', 'judg': 'JDG',
  'ruth': 'RUT', 'rut': 'RUT',
  '1 samuel': '1SA', '1sa': '1SA', '1 sam': '1SA',
  '2 samuel': '2SA', '2sa': '2SA', '2 sam': '2SA',
  '1 kings': '1KI', '1ki': '1KI',
  '2 kings': '2KI', '2ki': '2KI',
  '1 chronicles': '1CH', '1ch': '1CH', '1 chron': '1CH',
  '2 chronicles': '2CH', '2ch': '2CH', '2 chron': '2CH',
  'ezra': 'EZR', 'ezr': 'EZR',
  'nehemiah': 'NEH', 'neh': 'NEH',
  'esther': 'EST', 'est': 'EST',
  'job': 'JOB',
  'psalms': 'PSA', 'psalm': 'PSA', 'psa': 'PSA',
  'proverbs': 'PRO', 'prov': 'PRO',
  'ecclesiastes': 'ECC', 'eccl': 'ECC',
  'song of songs': 'SNG', 'song': 'SNG',
  'isaiah': 'ISA', 'isa': 'ISA',
  'jeremiah': 'JER', 'jer': 'JER',
  'lamentations': 'LAM', 'lam': 'LAM',
  'ezekiel': 'EZK', 'ezek': 'EZK',
  'daniel': 'DAN', 'dan': 'DAN',
  'hosea': 'HOS', 'hos': 'HOS',
  'joel': 'JOL',
  'amos': 'AMO',
  'obadiah': 'OBA', 'obad': 'OBA',
  'jonah': 'JON', 'jon': 'JON',
  'micah': 'MIC', 'mic': 'MIC',
  'nahum': 'NAM', 'nah': 'NAM',
  'habakkuk': 'HAB', 'hab': 'HAB',
  'zephaniah': 'ZEP', 'zeph': 'ZEP',
  'haggai': 'HAG', 'hag': 'HAG',
  'zechariah': 'ZEC', 'zech': 'ZEC',
  'malachi': 'MAL', 'mal': 'MAL'
};

function parsePassageReference(passage: string): string {
  try {
    // Handle different formats like "John 3:16", "1 John 1-5", "Romans 1:1-8"
    const cleanPassage = passage.trim();
    
    // Extract book name and reference
    const match = cleanPassage.match(/^(.+?)\s+(\d+)(?:[:\.](\d+))?(?:-(\d+))?$/);
    if (!match) {
      throw new Error(`Invalid passage format: ${passage}`);
    }
    
    const [, bookName, chapter, verse, endVerse] = match;
    const normalizedBookName = bookName.toLowerCase().trim();
    
    // Get the book ID
    const bookId = BOOK_ID_MAP[normalizedBookName];
    if (!bookId) {
      throw new Error(`Unknown book: ${bookName}`);
    }
    
    // Build the passage ID
    if (verse) {
      if (endVerse) {
        return `${bookId}.${chapter}.${verse}-${bookId}.${chapter}.${endVerse}`;
      } else {
        return `${bookId}.${chapter}.${verse}`;
      }
    } else {
      // Whole chapter
      return `${bookId}.${chapter}`;
    }
  } catch (error) {
    console.error('Error parsing passage reference:', error);
    throw error;
  }
}

export async function fetchBiblePassage(
  passages: string[],
  format: 'text' | 'html' = 'text',
  bibleId: string = DEFAULT_BIBLE_ID
): Promise<BiblePassageResponse | null> {
  try {
    // For now, we'll process one passage at a time
    // API.Bible doesn't support multiple passages in one request like ESV
    const allPassages: string[] = [];
    const allReferences: string[] = [];
    
    for (const passage of passages) {
      const passageId = parsePassageReference(passage);
      
      const response = await fetch(`${API_BIBLE_BASE_URL}/bibles/${bibleId}/passages/${passageId}`, {
        headers: {
          'api-key': process.env.BIBLE_API_KEY || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Bible API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        continue; // Skip this passage but continue with others
      }

      const data = await response.json();
      
      let content = data.data.content;
      
      // Convert HTML to text if text format is requested
      if (format === 'text' && content) {
        content = content
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      }
      
      allPassages.push(content || '');
      allReferences.push(data.data.reference || passage);
    }
    
    if (allPassages.length === 0) {
      return null;
    }
    
    // Get translation abbreviation based on bibleId
    const translationMap: { [key: string]: string } = {
      'ESV': 'ESV',
      'esv': 'ESV',
      'bba9f40183526463-01': 'BSB',
      'de4e12af7f28f599-01': 'KJV',
      'de4e12af7f28f599-02': 'KJV',
      '06125adad2d5898a-01': 'ASV',
      '685d1470fe4d5c3b-01': 'ASVBT',
      '55212e3cf5d04d49-01': 'KJVCPB',
      '01b29f4b342acc35-01': 'LSV',
      '9879dbb7cfe39e4d-01': 'WEB',
      '9879dbb7cfe39e4d-02': 'WEB',
      '9879dbb7cfe39e4d-03': 'WEB',
      '9879dbb7cfe39e4d-04': 'WEB',
      '65eec8e0b60e656b-01': 'FBV',
      '179568874c45066f-01': 'DRA',
      'c315fa9f71d4af3a-01': 'GNV'
    };
    
    return {
      query: passages.join(';'),
      canonical: allReferences.join('; '),
      reference: allReferences.join('; '),
      passages: allPassages,
      bibleId: bibleId,
      translation: translationMap[bibleId] || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    return null;
  }
}

export async function fetchBiblePassageText(
  passages: string[], 
  bibleId: string = DEFAULT_BIBLE_ID
): Promise<string | null> {
  const data = await fetchBiblePassage(passages, 'text', bibleId);
  return data?.passages?.[0] || null;
}

export async function fetchBiblePassageHtml(
  passages: string[], 
  bibleId: string = DEFAULT_BIBLE_ID
): Promise<string | null> {
  const data = await fetchBiblePassage(passages, 'html', bibleId);
  return data?.passages?.[0] || null;
}

export async function getAvailableTranslations(): Promise<BibleTranslation[]> {
  try {
    // Use the new translation discovery service
    return await getAllAvailableTranslations();
  } catch (error) {
    console.error('Error fetching available translations:', error);
    // Return fallback translations if discovery service fails
    return getFallbackTranslations();
  }
}

// Get popular translations for UI selection (ESV first, then others)
export async function getPopularTranslations(): Promise<BibleTranslation[]> {
  try {
    const translations = await getAllAvailableTranslations();
    return translations.filter(t => t.category === 'popular');
  } catch (error) {
    console.error('Error fetching popular translations:', error);
    return getFallbackTranslations().filter(t => t.category === 'popular');
  }
}

// Mock function for development/testing when Bible API is not available
export function getMockBiblePassage(passages: string[]): string {
  const mockContent = `
    This is a mock Bible passage for ${passages.join(', ')}.
    
    For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. For God did not send his Son into the world to condemn the world, but to save the world through him. Whoever believes in him is not condemned, but whoever does not believe stands condemned already because they have not believed in the name of God's one and only Son.
    
    This is the verdict: Light has come into the world, but people loved darkness instead of light because their deeds were evil. Everyone who does evil hates the light, and will not come into the light for fear that their deeds will be exposed. But whoever lives by the truth comes into the light, so that it may be seen plainly that what they have done has been done in the sight of God.
    
    [This is mock content for development purposes. In production, this would be replaced with actual Bible text from the API.Bible service.]
  `.trim();
  
  return mockContent;
}

export function formatBibleReference(passages: string[]): string {
  if (passages.length === 1) {
    return passages[0];
  }
  
  // Group passages by book if they're from the same book
  const grouped: { [book: string]: string[] } = {};
  
  passages.forEach(passage => {
    const bookMatch = passage.match(/^(.+?)\s+\d+/);
    const book = bookMatch ? bookMatch[1] : passage;
    
    if (!grouped[book]) {
      grouped[book] = [];
    }
    grouped[book].push(passage);
  });
  
  const formattedGroups = Object.entries(grouped).map(([book, bookPassages]) => {
    if (bookPassages.length === 1) {
      return bookPassages[0];
    }
    
    // Extract just the verse references for the same book
    const references = bookPassages.map(p => p.replace(book + ' ', ''));
    return `${book} ${references.join(', ')}`;
  });
  
  return formattedGroups.join('; ');
}

// ESV API Integration
import * as ESVApi from './esv-api';

export interface UnifiedBibleResponse {
  query: string;
  canonical: string;
  reference: string;
  passages: string[];
  bibleId: string;
  translation: string;
}

// Enhanced unified Bible service that routes to appropriate API with dynamic translation support
export async function getBiblePassage(
  passages: string[],
  format: 'text' | 'html' = 'text',
  bibleId: string = DEFAULT_BIBLE_ID
): Promise<UnifiedBibleResponse | null> {
  try {
    // Validate translation ID
    let validatedBibleId = bibleId;
    
    try {
      const translation = await getTranslationById(bibleId);
      if (!translation) {
        console.warn(`Unknown translation ID: ${bibleId}, falling back to default`);
        validatedBibleId = DEFAULT_BIBLE_ID;
      }
    } catch (translationError) {
      console.warn('Error validating translation, using provided ID:', translationError);
      // Continue with original bibleId if validation fails
    }
    
    // Route ESV requests to ESV API
    if (isESVTranslation(validatedBibleId)) {
      const esvResponse = await ESVApi.fetchBiblePassage(passages, format);
      
      if (esvResponse) {
        return {
          query: esvResponse.query,
          canonical: esvResponse.canonical,
          reference: esvResponse.canonical,
          passages: esvResponse.passages,
          bibleId: 'ESV',
          translation: 'ESV'
        };
      }
      
      // Fallback to Bible API with BSB if ESV fails
      console.warn('ESV API failed, falling back to Bible API with BSB');
      validatedBibleId = 'bba9f40183526463-01'; // BSB fallback
    }
    
    // Route all other translations to Bible API
    const bibleApiResponse = await fetchBiblePassage(passages, format, validatedBibleId);
    
    if (bibleApiResponse) {
      return bibleApiResponse;
    }
    
    // If primary translation fails, try BSB as fallback
    if (validatedBibleId !== 'bba9f40183526463-01') {
      console.warn(`${validatedBibleId} failed, trying BSB fallback`);
      const fallbackResponse = await fetchBiblePassage(passages, format, 'bba9f40183526463-01');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    throw new Error('All translation sources failed');
    
  } catch (error) {
    console.error('Error in unified Bible service:', error);
    
    // Final fallback to mock content
    const mockContent = ESVApi.getMockBiblePassage(passages);
    return {
      query: passages.join(';'),
      canonical: passages.join('; '),
      reference: passages.join('; '),
      passages: [mockContent],
      bibleId: bibleId,
      translation: isESVTranslation(bibleId) ? 'ESV' : 'Mock'
    };
  }
}

// Convenience functions for the unified service
export async function getBiblePassageText(
  passages: string[], 
  bibleId: string = 'ESV'
): Promise<string | null> {
  const data = await getBiblePassage(passages, 'text', bibleId);
  return data?.passages?.[0] || null;
}

export async function getBiblePassageHtml(
  passages: string[], 
  bibleId: string = 'ESV'
): Promise<string | null> {
  const data = await getBiblePassage(passages, 'html', bibleId);
  return data?.passages?.[0] || null;
}

export { DEFAULT_BIBLE_ID };

// Re-export translation discovery types
export type { 
  BibleTranslation,
  TranslationGroup
} from './translation-discovery';

// Re-export translation discovery functions
export { 
  getTranslationGroups, 
  getTranslationById, 
  getTranslationDisplayName,
  isESVTranslation,
  clearTranslationCache
} from './translation-discovery';

// Additional convenience functions for translation management
export async function getAvailableTranslationCount(): Promise<number> {
  try {
    const translations = await getAllAvailableTranslations();
    return translations.length;
  } catch (error) {
    console.error('Error getting translation count:', error);
    return 0;
  }
}

export async function getTranslationsByCategory(category: string): Promise<BibleTranslation[]> {
  try {
    const translations = await getAllAvailableTranslations();
    return translations.filter(t => t.category === category);
  } catch (error) {
    console.error(`Error getting ${category} translations:`, error);
    return [];
  }
}

export async function searchTranslations(query: string): Promise<BibleTranslation[]> {
  try {
    const translations = await getAllAvailableTranslations();
    const searchTerm = query.toLowerCase();
    
    return translations.filter(t => 
      t.name.toLowerCase().includes(searchTerm) ||
      t.abbreviation.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching translations:', error);
    return [];
  }
}
