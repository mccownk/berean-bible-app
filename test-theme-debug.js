
// Debug script to test current theme behavior
const puppeteer = require('puppeteer');

async function testThemeDebug() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console logs
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });
    
    // Listen for errors
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });
    
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('Page loaded successfully');
    
    // Try to sign in with demo account
    const signInButton = await page.$('button:contains("Sign In")');
    if (signInButton) {
      await signInButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check current theme class on html element
    const htmlClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    console.log('Current HTML classes:', htmlClass);
    
    // Check theme-related localStorage
    const themeStorage = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    console.log('Theme in localStorage:', themeStorage);
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testThemeDebug();
