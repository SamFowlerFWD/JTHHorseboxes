import { test, expect } from '@playwright/test';

test('analyze current homepage design', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Take a screenshot of the current design
  await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
  
  // Analyze color scheme
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontFamily: styles.fontFamily,
    };
  });
  
  console.log('Current design analysis:', bodyStyles);
  
  // Check for hero section
  const hero = await page.$('[class*="hero"]');
  if (hero) {
    const heroStyles = await hero.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        height: styles.height,
        backgroundImage: styles.backgroundImage,
      };
    });
    console.log('Hero section:', heroStyles);
  }
  
  // Check navigation
  const nav = await page.$('nav');
  if (nav) {
    const navStyles = await nav.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        position: styles.position,
      };
    });
    console.log('Navigation:', navStyles);
  }
});

test('compare with Bloomfields design', async ({ page }) => {
  await page.goto('https://www.bloomfields.co/');
  await page.screenshot({ path: 'bloomfields-screenshot.png', fullPage: false, clip: { x: 0, y: 0, width: 1280, height: 800 } });
  
  const bloomfieldsStyles = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      backgroundColor: styles.backgroundColor,
      primaryColors: [],
      fontFamily: styles.fontFamily,
    };
  });
  
  console.log('Bloomfields design:', bloomfieldsStyles);
});