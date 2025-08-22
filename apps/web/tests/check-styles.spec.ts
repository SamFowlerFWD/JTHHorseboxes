import { test, expect } from '@playwright/test';

test('check if styles are loading correctly', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:3000');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if Tailwind classes are working by checking computed styles
  const header = await page.locator('header').first();
  
  // Check if header has background color (should be white)
  const headerBg = await header.evaluate((el) => 
    window.getComputedStyle(el).backgroundColor
  );
  console.log('Header background:', headerBg);
  
  // Check if amber color is applied
  const amberElement = await page.locator('.text-amber-600').first();
  const amberColor = await amberElement.evaluate((el) => 
    window.getComputedStyle(el).color
  );
  console.log('Amber text color:', amberColor);
  
  // Check if flexbox is working
  const flexElement = await page.locator('.flex').first();
  const displayValue = await flexElement.evaluate((el) => 
    window.getComputedStyle(el).display
  );
  console.log('Flex display:', displayValue);
  
  // Check for any CSS files loaded
  const stylesheets = await page.evaluate(() => {
    return Array.from(document.styleSheets).map(sheet => ({
      href: sheet.href,
      rules: sheet.cssRules ? sheet.cssRules.length : 0
    }));
  });
  console.log('Loaded stylesheets:', stylesheets);
  
  // Check if the globals.css file is being loaded
  const globalsCss = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(link => link.getAttribute('href'));
  });
  console.log('CSS files:', globalsCss);
  
  // Take a screenshot for visual inspection
  await page.screenshot({ path: 'style-check.png', fullPage: false });
});