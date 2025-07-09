
const ESV_API_BASE_URL = 'https://api.esv.org/v3';

export interface ESVPassageResponse {
  query: string;
  canonical: string;
  parsed: Array<Array<number>>;
  passage_meta: Array<{
    canonical: string;
    chapter_start: Array<number>;
    chapter_end: Array<number>;
    prev_verse: number;
    next_verse: number;
    prev_chapter: Array<number>;
    next_chapter: Array<number>;
  }>;
  passages: string[];
}

export async function fetchBiblePassage(
  passages: string[],
  format: 'text' | 'html' = 'text'
): Promise<ESVPassageResponse | null> {
  try {
    const query = passages.join(';');
    const endpoint = format === 'html' ? '/passage/html' : '/passage/text';
    
    const response = await fetch(`${ESV_API_BASE_URL}${endpoint}?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Token ${process.env.ESV_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('ESV API Error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    return null;
  }
}

export async function fetchBiblePassageText(passages: string[]): Promise<string | null> {
  const data = await fetchBiblePassage(passages, 'text');
  return data?.passages?.[0] || null;
}

export async function fetchBiblePassageHtml(passages: string[]): Promise<string | null> {
  const data = await fetchBiblePassage(passages, 'html');
  return data?.passages?.[0] || null;
}

// Mock function for development/testing when ESV API is not available
export function getMockBiblePassage(passages: string[]): string {
  const mockContent = `
    This is a mock Bible passage for ${passages.join(', ')}.
    
    In the beginning was the Word, and the Word was with God, and the Word was God. 
    He was in the beginning with God. All things were made through him, and without 
    him was not any thing made that was made. In him was life, and the life was the 
    light of men. The light shines in the darkness, and the darkness has not overcome it.
    
    There was a man sent from God, whose name was John. He came as a witness, to bear 
    witness about the light, that all might believe through him. He was not the light, 
    but came to bear witness about the light.
    
    The true light, which gives light to everyone, was coming into the world. He was 
    in the world, and the world was made through him, yet the world did not know him.
    
    [This is mock content for development purposes. In production, this would be replaced 
    with actual ESV Bible text from the ESV API.]
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
    const book = passage.split(' ')[0];
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
    const references = bookPassages.map(p => p.replace(`${book} `, ''));
    return `${book} ${references.join(', ')}`;
  });
  
  return formattedGroups.join('; ');
}
