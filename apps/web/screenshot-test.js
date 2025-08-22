const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'homepage-screenshot.png', fullPage: false });
  
  // Check computed styles of key elements
  const headerBg = await page.locator('header').evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  const buttonBg = await page.locator('.bg-blue-600').first().evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  const textColor = await page.locator('.text-blue-600').first().evaluate(el => 
    window.getComputedStyle(el).color
  );
  
  console.log('Header background:', headerBg);
  console.log('Button background (should be blue):', buttonBg);
  console.log('Text color (should be blue):', textColor);
  
  // Check if images are loading
  const images = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      loaded: img.complete && img.naturalWidth > 0
    }))
  );
  
  console.log('\nImages status:');
  images.forEach(img => {
    console.log(`- ${img.src.split('/').pop()}: ${img.loaded ? 'LOADED' : 'NOT LOADED'}`);
  });
  
  await browser.close();
})();