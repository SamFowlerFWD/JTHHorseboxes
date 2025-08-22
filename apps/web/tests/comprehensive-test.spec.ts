import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TIMEOUT = 30000;

// Define all routes to test
const PAGE_ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About Page' },
  { path: '/contact', name: 'Contact Page' },
  { path: '/models', name: 'Models Page' },
  { path: '/models/jth-professional-35', name: 'Professional 3.5t Model' },
  { path: '/models/jth-principle-35', name: 'Principle 3.5t Model' },
  { path: '/models/jth-progeny-35', name: 'Progeny 3.5t Model' },
  { path: '/configurator', name: 'Configurator' },
  { path: '/configurator/success', name: 'Configurator Success' },
  { path: '/login', name: 'Login Page' },
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/admin/leads', name: 'Admin Leads' },
  { path: '/admin/pricing', name: 'Admin Pricing' },
  { path: '/admin/blog', name: 'Admin Blog' },
  { path: '/admin/knowledge-base', name: 'Admin Knowledge Base' },
];

// Define API endpoints to test
const API_ENDPOINTS = [
  { method: 'GET', path: '/api/health', name: 'Health Check API' },
  { method: 'GET', path: '/api/pricing/options', name: 'Pricing Options API' },
  { method: 'GET', path: '/api/leads', name: 'Get Leads API' },
  { method: 'POST', path: '/api/leads', name: 'Create Lead API', 
    body: { 
      first_name: 'Test', 
      last_name: 'User',
      email: 'test@example.com', 
      phone: '01234567890',
      source: 'test',
      notes: 'Test message'
    }
  },
  { method: 'GET', path: '/api/knowledge-base', name: 'Knowledge Base API' },
  { method: 'GET', path: '/api/knowledge-base/search?q=test', name: 'Knowledge Base Search API' },
  { method: 'POST', path: '/api/quote/create', name: 'Create Quote API',
    body: {
      modelId: 'professional-35',
      chassisCost: 15000,
      optionIds: [],
      deposit: 5000,
      customerInfo: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '01234567890'
      }
    }
  },
  { method: 'GET', path: '/api/quote/preview?modelId=professional-35&chassisCost=15000', name: 'Quote Preview API' },
  { method: 'GET', path: '/api/blog', name: 'Blog API' },
  { method: 'GET', path: '/api/config/professional-35', name: 'Config API' },
];

// Define viewports for responsive testing
const VIEWPORTS = [
  { name: 'Mobile', width: 375, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

// Test report data structure
interface TestReport {
  pageRoutes: { path: string; name: string; status: string; error?: string }[];
  apiEndpoints: { path: string; name: string; status: string; error?: string }[];
  interactiveElements: { issue: string; location: string }[];
  consoleErrors: { message: string; url: string }[];
  seoIssues: { issue: string; details: string }[];
  responsiveIssues: { viewport: string; issue: string }[];
  configuratorIssues: { issue: string; details: string }[];
}

const report: TestReport = {
  pageRoutes: [],
  apiEndpoints: [],
  interactiveElements: [],
  consoleErrors: [],
  seoIssues: [],
  responsiveIssues: [],
  configuratorIssues: [],
};

test.describe('JTH Website Comprehensive Test Suite', () => {
  test.setTimeout(TIMEOUT);

  test('1. Test all page routes for 404 errors', async ({ page }) => {
    console.log('\n=== TESTING PAGE ROUTES ===\n');
    
    for (const route of PAGE_ROUTES) {
      try {
        const response = await page.goto(`${BASE_URL}${route.path}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        const status = response?.status() || 0;
        if (status === 404 || status === 500) {
          report.pageRoutes.push({
            path: route.path,
            name: route.name,
            status: `❌ Error ${status}`,
            error: `Page returned ${status} status code`
          });
          console.log(`❌ ${route.name} (${route.path}): Status ${status}`);
        } else {
          report.pageRoutes.push({
            path: route.path,
            name: route.name,
            status: '✅ OK'
          });
          console.log(`✅ ${route.name} (${route.path}): Status ${status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        report.pageRoutes.push({
          path: route.path,
          name: route.name,
          status: '❌ Failed',
          error: errorMessage
        });
        console.log(`❌ ${route.name} (${route.path}): ${errorMessage}`);
      }
    }
  });

  test('2. Test all API endpoints', async ({ request }) => {
    console.log('\n=== TESTING API ENDPOINTS ===\n');
    
    for (const endpoint of API_ENDPOINTS) {
      try {
        let response;
        
        if (endpoint.method === 'GET') {
          response = await request.get(`${BASE_URL}${endpoint.path}`, {
            timeout: 10000
          });
        } else if (endpoint.method === 'POST') {
          response = await request.post(`${BASE_URL}${endpoint.path}`, {
            data: endpoint.body,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          });
        }
        
        const status = response?.status() || 0;
        if (status >= 400) {
          report.apiEndpoints.push({
            path: endpoint.path,
            name: endpoint.name,
            status: `❌ Error ${status}`,
            error: `API returned ${status} status code`
          });
          console.log(`❌ ${endpoint.name} (${endpoint.method} ${endpoint.path}): Status ${status}`);
        } else {
          report.apiEndpoints.push({
            path: endpoint.path,
            name: endpoint.name,
            status: '✅ OK'
          });
          console.log(`✅ ${endpoint.name} (${endpoint.method} ${endpoint.path}): Status ${status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        report.apiEndpoints.push({
          path: endpoint.path,
          name: endpoint.name,
          status: '❌ Failed',
          error: errorMessage
        });
        console.log(`❌ ${endpoint.name} (${endpoint.method} ${endpoint.path}): ${errorMessage}`);
      }
    }
  });

  test('3. Test interactive elements on homepage', async ({ page }) => {
    console.log('\n=== TESTING INTERACTIVE ELEMENTS ===\n');
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Test all buttons
    const buttons = await page.$$('button, a[role="button"], input[type="submit"]');
    console.log(`Found ${buttons.length} buttons to test`);
    
    for (let i = 0; i < buttons.length; i++) {
      try {
        const button = buttons[i];
        const isClickable = await button.isEnabled();
        const text = await button.textContent() || 'Unknown button';
        
        if (!isClickable) {
          report.interactiveElements.push({
            issue: 'Non-clickable button',
            location: `Button ${i + 1}: "${text.trim()}"`
          });
          console.log(`❌ Button ${i + 1} is not clickable: "${text.trim()}"`);
        }
      } catch (error) {
        // Button might have been removed from DOM
      }
    }
    
    // Test all links
    const links = await page.$$('a[href]');
    console.log(`Found ${links.length} links to test`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) { // Test first 10 links to save time
      try {
        const link = links[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent() || 'Unknown link';
        
        if (href && href.startsWith('http') && !href.includes(BASE_URL)) {
          // External link - just check it exists
          console.log(`ℹ️ External link ${i + 1}: ${href}`);
        } else if (href && (href.startsWith('/') || href.startsWith('#'))) {
          // Internal link - verify it doesn't 404
          if (href !== '#' && !href.startsWith('#')) {
            const response = await page.request.get(`${BASE_URL}${href}`);
            if (response.status() === 404) {
              report.interactiveElements.push({
                issue: 'Broken internal link',
                location: `Link ${i + 1}: "${text.trim()}" -> ${href}`
              });
              console.log(`❌ Broken link ${i + 1}: "${text.trim()}" -> ${href}`);
            }
          }
        }
      } catch (error) {
        // Link might have been removed from DOM
      }
    }
    
    // Test forms
    const forms = await page.$$('form');
    console.log(`Found ${forms.length} forms to test`);
    
    for (let i = 0; i < forms.length; i++) {
      const inputs = await forms[i].$$('input[required], textarea[required], select[required]');
      if (inputs.length > 0) {
        console.log(`ℹ️ Form ${i + 1} has ${inputs.length} required fields`);
      }
    }
  });

  test('4. Check for console errors', async ({ page }) => {
    console.log('\n=== CHECKING CONSOLE ERRORS ===\n');
    
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        errors.push(text);
        report.consoleErrors.push({
          message: text,
          url: page.url()
        });
      }
    });
    
    // Visit main pages and check for errors
    const pagesToCheck = ['/', '/models', '/configurator'];
    
    for (const path of pagesToCheck) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Wait for any async errors
    }
    
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} console errors:`);
      errors.forEach(err => console.log(`   - ${err.substring(0, 100)}...`));
    } else {
      console.log('✅ No console errors found');
    }
  });

  test('5. Test responsive design', async ({ browser }) => {
    console.log('\n=== TESTING RESPONSIVE DESIGN ===\n');
    
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      const page = await context.newPage();
      
      console.log(`\nTesting ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      
      // Check if navigation is accessible
      const nav = await page.$('nav, header');
      if (nav) {
        const isVisible = await nav.isVisible();
        if (!isVisible) {
          report.responsiveIssues.push({
            viewport: viewport.name,
            issue: 'Navigation not visible'
          });
          console.log(`❌ Navigation not visible on ${viewport.name}`);
        }
      }
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        report.responsiveIssues.push({
          viewport: viewport.name,
          issue: 'Page has horizontal scroll'
        });
        console.log(`❌ Horizontal scroll detected on ${viewport.name}`);
      } else {
        console.log(`✅ No horizontal scroll on ${viewport.name}`);
      }
      
      // Check if main content is visible
      const main = await page.$('main, [role="main"], #main');
      if (main) {
        const isVisible = await main.isVisible();
        if (!isVisible) {
          report.responsiveIssues.push({
            viewport: viewport.name,
            issue: 'Main content not visible'
          });
          console.log(`❌ Main content not visible on ${viewport.name}`);
        } else {
          console.log(`✅ Main content visible on ${viewport.name}`);
        }
      }
      
      await context.close();
    }
  });

  test('6. Check SEO elements', async ({ page }) => {
    console.log('\n=== CHECKING SEO ELEMENTS ===\n');
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Check meta tags
    const title = await page.title();
    if (!title || title.length < 10) {
      report.seoIssues.push({
        issue: 'Missing or short page title',
        details: `Title: "${title}"`
      });
      console.log(`❌ Missing or short page title: "${title}"`);
    } else {
      console.log(`✅ Page title found: "${title}"`);
    }
    
    const metaDescription = await page.$('meta[name="description"]');
    if (!metaDescription) {
      report.seoIssues.push({
        issue: 'Missing meta description',
        details: 'No meta description tag found'
      });
      console.log('❌ Missing meta description');
    } else {
      const content = await metaDescription.getAttribute('content');
      console.log(`✅ Meta description found: "${content?.substring(0, 50)}..."`);
    }
    
    // Check Open Graph tags
    const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    for (const tag of ogTags) {
      const ogTag = await page.$(`meta[property="${tag}"]`);
      if (!ogTag) {
        report.seoIssues.push({
          issue: `Missing Open Graph tag: ${tag}`,
          details: `Meta property="${tag}" not found`
        });
        console.log(`❌ Missing Open Graph tag: ${tag}`);
      } else {
        console.log(`✅ Open Graph tag found: ${tag}`);
      }
    }
    
    // Check structured data
    const structuredData = await page.$$('script[type="application/ld+json"]');
    if (structuredData.length === 0) {
      report.seoIssues.push({
        issue: 'Missing structured data',
        details: 'No JSON-LD structured data found'
      });
      console.log('❌ No structured data found');
    } else {
      console.log(`✅ Found ${structuredData.length} structured data scripts`);
    }
    
    // Check sitemap
    try {
      const sitemapResponse = await page.request.get(`${BASE_URL}/sitemap.xml`);
      if (sitemapResponse.status() === 404) {
        report.seoIssues.push({
          issue: 'Missing sitemap.xml',
          details: 'sitemap.xml returns 404'
        });
        console.log('❌ sitemap.xml not found (404)');
      } else {
        console.log('✅ sitemap.xml found');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      report.seoIssues.push({
        issue: 'Error accessing sitemap.xml',
        details: errorMessage
      });
      console.log(`❌ Error accessing sitemap.xml: ${errorMessage}`);
    }
    
    // Check robots.txt
    try {
      const robotsResponse = await page.request.get(`${BASE_URL}/robots.txt`);
      if (robotsResponse.status() === 404) {
        report.seoIssues.push({
          issue: 'Missing robots.txt',
          details: 'robots.txt returns 404'
        });
        console.log('❌ robots.txt not found (404)');
      } else {
        console.log('✅ robots.txt found');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      report.seoIssues.push({
        issue: 'Error accessing robots.txt',
        details: errorMessage
      });
      console.log(`❌ Error accessing robots.txt: ${errorMessage}`);
    }
  });

  test('7. Test configurator functionality', async ({ page }) => {
    console.log('\n=== TESTING CONFIGURATOR ===\n');
    
    try {
      await page.goto(`${BASE_URL}/configurator`, { waitUntil: 'networkidle' });
      
      // Check if configurator loads
      const configuratorMain = await page.$('[data-testid="configurator"], main, .configurator');
      if (!configuratorMain) {
        report.configuratorIssues.push({
          issue: 'Configurator not found',
          details: 'Could not find main configurator element'
        });
        console.log('❌ Configurator main element not found');
        return;
      }
      
      // Test model selection
      const modelButtons = await page.$$('button[data-model], [data-testid*="model"], .model-selector button');
      if (modelButtons.length === 0) {
        report.configuratorIssues.push({
          issue: 'No model selection buttons',
          details: 'Could not find model selection buttons'
        });
        console.log('❌ No model selection buttons found');
      } else {
        console.log(`✅ Found ${modelButtons.length} model selection buttons`);
        
        // Try clicking first model
        try {
          await modelButtons[0].click();
          await page.waitForTimeout(1000);
          console.log('✅ Model selection clickable');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          report.configuratorIssues.push({
            issue: 'Model selection not clickable',
            details: errorMessage
          });
          console.log('❌ Model selection not clickable');
        }
      }
      
      // Check for price display
      const priceElement = await page.$('[data-testid*="price"], .price, .total-price');
      if (!priceElement) {
        report.configuratorIssues.push({
          issue: 'Price display not found',
          details: 'Could not find price display element'
        });
        console.log('❌ Price display not found');
      } else {
        const priceText = await priceElement.textContent();
        console.log(`✅ Price display found: ${priceText}`);
      }
      
      // Check for options
      const options = await page.$$('input[type="checkbox"], input[type="radio"], select');
      if (options.length === 0) {
        report.configuratorIssues.push({
          issue: 'No configuration options found',
          details: 'Could not find checkboxes, radio buttons, or select elements'
        });
        console.log('❌ No configuration options found');
      } else {
        console.log(`✅ Found ${options.length} configuration options`);
      }
      
      // Check for form validation
      const submitButton = await page.$('button[type="submit"], button:has-text("Submit"), button:has-text("Continue")');
      if (submitButton) {
        const isEnabled = await submitButton.isEnabled();
        console.log(`ℹ️ Submit button ${isEnabled ? 'is enabled' : 'is disabled'}`);
      }
      
      // Check for payment schedule
      const paymentSchedule = await page.$('[data-testid*="payment"], .payment-schedule, .finance-options');
      if (!paymentSchedule) {
        report.configuratorIssues.push({
          issue: 'Payment schedule not found',
          details: 'Could not find payment schedule display'
        });
        console.log('❌ Payment schedule display not found');
      } else {
        console.log('✅ Payment schedule display found');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      report.configuratorIssues.push({
        issue: 'Error testing configurator',
        details: errorMessage
      });
      console.log(`❌ Error testing configurator: ${errorMessage}`);
    }
  });

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('                    COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80) + '\n');

    // Page Routes Report
    console.log('📄 PAGE ROUTES REPORT:');
    console.log('-'.repeat(40));
    const failedRoutes = report.pageRoutes.filter(r => r.status.includes('❌'));
    if (failedRoutes.length === 0) {
      console.log('✅ All page routes are working correctly');
    } else {
      console.log(`❌ ${failedRoutes.length} page route(s) have issues:`);
      failedRoutes.forEach(r => {
        console.log(`   - ${r.name} (${r.path}): ${r.error}`);
      });
    }
    console.log();

    // API Endpoints Report
    console.log('🔌 API ENDPOINTS REPORT:');
    console.log('-'.repeat(40));
    const failedAPIs = report.apiEndpoints.filter(e => e.status.includes('❌'));
    if (failedAPIs.length === 0) {
      console.log('✅ All API endpoints are working correctly');
    } else {
      console.log(`❌ ${failedAPIs.length} API endpoint(s) have issues:`);
      failedAPIs.forEach(e => {
        console.log(`   - ${e.name}: ${e.error}`);
      });
    }
    console.log();

    // Interactive Elements Report
    console.log('🖱️ INTERACTIVE ELEMENTS REPORT:');
    console.log('-'.repeat(40));
    if (report.interactiveElements.length === 0) {
      console.log('✅ All interactive elements are working correctly');
    } else {
      console.log(`❌ ${report.interactiveElements.length} interactive element issue(s):`);
      report.interactiveElements.forEach(e => {
        console.log(`   - ${e.issue}: ${e.location}`);
      });
    }
    console.log();

    // Console Errors Report
    console.log('🔴 CONSOLE ERRORS REPORT:');
    console.log('-'.repeat(40));
    if (report.consoleErrors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log(`❌ ${report.consoleErrors.length} console error(s) found:`);
      report.consoleErrors.forEach(e => {
        console.log(`   - ${e.message.substring(0, 100)}...`);
        console.log(`     on ${e.url}`);
      });
    }
    console.log();

    // Responsive Design Report
    console.log('📱 RESPONSIVE DESIGN REPORT:');
    console.log('-'.repeat(40));
    if (report.responsiveIssues.length === 0) {
      console.log('✅ No responsive design issues detected');
    } else {
      console.log(`❌ ${report.responsiveIssues.length} responsive issue(s):`);
      report.responsiveIssues.forEach(r => {
        console.log(`   - ${r.viewport}: ${r.issue}`);
      });
    }
    console.log();

    // SEO Report
    console.log('🔍 SEO ELEMENTS REPORT:');
    console.log('-'.repeat(40));
    if (report.seoIssues.length === 0) {
      console.log('✅ All SEO elements are properly configured');
    } else {
      console.log(`❌ ${report.seoIssues.length} SEO issue(s):`);
      report.seoIssues.forEach(s => {
        console.log(`   - ${s.issue}: ${s.details}`);
      });
    }
    console.log();

    // Configurator Report
    console.log('⚙️ CONFIGURATOR FUNCTIONALITY REPORT:');
    console.log('-'.repeat(40));
    if (report.configuratorIssues.length === 0) {
      console.log('✅ Configurator is working correctly');
    } else {
      console.log(`❌ ${report.configuratorIssues.length} configurator issue(s):`);
      report.configuratorIssues.forEach(c => {
        console.log(`   - ${c.issue}: ${c.details}`);
      });
    }
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('                         SUMMARY');
    console.log('='.repeat(80));
    
    const totalIssues = 
      failedRoutes.length +
      failedAPIs.length +
      report.interactiveElements.length +
      report.consoleErrors.length +
      report.responsiveIssues.length +
      report.seoIssues.length +
      report.configuratorIssues.length;
    
    if (totalIssues === 0) {
      console.log('🎉 EXCELLENT! No issues found. The website is working perfectly!');
    } else {
      console.log(`⚠️ Total issues found: ${totalIssues}`);
      console.log('\nBreakdown:');
      console.log(`  - Page route issues: ${failedRoutes.length}`);
      console.log(`  - API endpoint issues: ${failedAPIs.length}`);
      console.log(`  - Interactive element issues: ${report.interactiveElements.length}`);
      console.log(`  - Console errors: ${report.consoleErrors.length}`);
      console.log(`  - Responsive design issues: ${report.responsiveIssues.length}`);
      console.log(`  - SEO issues: ${report.seoIssues.length}`);
      console.log(`  - Configurator issues: ${report.configuratorIssues.length}`);
    }
    
    console.log('\n' + '='.repeat(80));
  });
});