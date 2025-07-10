
const puppeteer = require('puppeteer');

async function testThemeSwitching() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages and errors
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });
    
    console.log('🚀 Starting theme switching test...');
    
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ App loaded successfully');
    
    // Check initial theme
    let htmlClasses = await page.evaluate(() => document.documentElement.className);
    console.log('📝 Initial HTML classes:', htmlClasses);
    
    // Click Sign In
    await page.click('text="Sign In"');
    await page.waitForTimeout(1000);
    
    // Fill in the demo account credentials
    await page.type('input[type="email"]', 'john@doe.com');
    await page.type('input[type="password"]', 'johndoe123');
    
    // Submit the sign-in form
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Signed in successfully');
    
    // Navigate to profile page
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
    console.log('✅ Profile page loaded');
    
    // Test theme switching
    const themes = ['dark', 'sepia', 'light'];
    
    for (const theme of themes) {
      console.log(`🎨 Testing ${theme} theme...`);
      
      // Find and click the theme selector
      await page.click('[data-radix-collection-item]'); // Click on select trigger
      await page.waitForTimeout(500);
      
      // Select the theme
      await page.click(`text="${theme.charAt(0).toUpperCase() + theme.slice(1)}"`);
      await page.waitForTimeout(1000);
      
      // Check if theme was applied
      htmlClasses = await page.evaluate(() => document.documentElement.className);
      console.log(`📝 HTML classes after selecting ${theme}:`, htmlClasses);
      
      // Verify theme application
      if (theme === 'dark') {
        const hasDarkClass = htmlClasses.includes('dark');
        console.log(`✅ Dark theme ${hasDarkClass ? 'applied' : 'NOT applied'}`);
      } else if (theme === 'sepia') {
        const hasSepiaClass = htmlClasses.includes('theme-sepia');
        console.log(`✅ Sepia theme ${hasSepiaClass ? 'applied' : 'NOT applied'}`);
      } else {
        const hasNoThemeClasses = !htmlClasses.includes('dark') && !htmlClasses.includes('theme-sepia');
        console.log(`✅ Light theme ${hasNoThemeClasses ? 'applied' : 'NOT applied'}`);
      }
      
      // Check CSS variables
      const backgroundVar = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--background').trim();
      });
      console.log(`📝 Background CSS variable for ${theme}:`, backgroundVar);
      
      await page.waitForTimeout(2000);
    }
    
    console.log('🎯 Theme switching test completed!');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

testThemeSwitching();
