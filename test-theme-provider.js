// Test script to verify theme provider functionality
// This simulates the useCustomTheme hook behavior

console.log('Testing theme provider functionality...');

// Mock the next-themes hook
const mockNextThemes = {
  theme: 'light',
  setTheme: function(newTheme) {
    console.log('next-themes setTheme called with:', newTheme);
    this.theme = newTheme;
    
    // Simulate next-themes applying the theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  },
  systemTheme: 'light'
};

// Simulate the useCustomTheme hook behavior
function testCustomTheme() {
  let mounted = true;
  let currentTheme = 'light';
  
  // Simulate the applyTheme function
  function applyTheme(newTheme) {
    if (!mounted) return;
    
    console.log('applyTheme called with:', newTheme);
    
    // Update local state immediately
    currentTheme = newTheme;
    
    // Handle sepia theme as a special case
    if (newTheme === 'sepia') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('theme-sepia');
      mockNextThemes.setTheme('light'); // Use light as base for sepia
    } else {
      document.documentElement.classList.remove('theme-sepia');
      mockNextThemes.setTheme(newTheme);
    }
    
    console.log('Current theme state:', currentTheme);
    console.log('Document classes:', document.documentElement.className);
  }
  
  // Simulate theme detection
  function getCurrentTheme() {
    if (document.documentElement.classList.contains('theme-sepia')) {
      return 'sepia';
    }
    return mockNextThemes.theme || 'light';
  }
  
  return {
    theme: currentTheme,
    setTheme: applyTheme,
    getCurrentTheme: getCurrentTheme
  };
}

// Run tests
const themeProvider = testCustomTheme();

console.log('\n--- Testing Light Theme ---');
themeProvider.setTheme('light');
console.log('Detected theme:', themeProvider.getCurrentTheme());

console.log('\n--- Testing Dark Theme ---');
themeProvider.setTheme('dark');
console.log('Detected theme:', themeProvider.getCurrentTheme());

console.log('\n--- Testing Sepia Theme ---');
themeProvider.setTheme('sepia');
console.log('Detected theme:', themeProvider.getCurrentTheme());

console.log('\n--- Testing Light Theme Again ---');
themeProvider.setTheme('light');
console.log('Detected theme:', themeProvider.getCurrentTheme());

console.log('\n--- Final Document Classes ---');
console.log('Document.documentElement.className:', document.documentElement.className);

console.log('\n✅ Theme provider functionality test completed!');
