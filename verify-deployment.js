#!/usr/bin/env node

const https = require('https');

const SUPABASE_URL = 'https://nsbybnsmhvviofzfgphb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnlibnNtaHZ2aW9memZncGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjgzODQsImV4cCI6MjA3MTIwNDM4NH0.dL_OFBvp2iDFJzemK3RXWpcpmh5Lfb0g1qU3rzjMZXk';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnlibnNtaHZ2aW9memZncGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyODM4NCwiZXhwIjoyMDcxMjA0Mzg0fQ.GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0';

// Test REST API endpoints
async function testEndpoint(path, apiKey, description) {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/rest/v1${path}`;
    
    https.get(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 300;
        resolve({
          endpoint: path,
          description,
          status: res.statusCode,
          success,
          data: data.substring(0, 100)
        });
      });
    }).on('error', (err) => {
      resolve({
        endpoint: path,
        description,
        status: 0,
        success: false,
        error: err.message
      });
    });
  });
}

async function verifyDeployment() {
  console.log('🔍 JTH Supabase Deployment Verification');
  console.log('=======================================');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Tables to verify
  const endpoints = [
    { path: '/leads?limit=1', key: ANON_KEY, desc: 'Leads table (public insert)' },
    { path: '/pricing_options?limit=1', key: ANON_KEY, desc: 'Pricing options (public read)' },
    { path: '/blog_posts?status=eq.published&limit=1', key: ANON_KEY, desc: 'Blog posts (public read)' },
    { path: '/knowledge_base?limit=1', key: ANON_KEY, desc: 'Knowledge base (public read)' },
    { path: '/saved_configurations?limit=1', key: ANON_KEY, desc: 'Saved configurations' },
    { path: '/jth_models?limit=1', key: SERVICE_KEY, desc: 'JTH models table' },
    { path: '/organizations?limit=1', key: SERVICE_KEY, desc: 'Organizations table' },
    { path: '/deals?limit=1', key: SERVICE_KEY, desc: 'Deals table' },
    { path: '/production_jobs?limit=1', key: SERVICE_KEY, desc: 'Production jobs' },
    { path: '/inventory_items?limit=1', key: SERVICE_KEY, desc: 'Inventory items' }
  ];

  console.log('📊 Testing Table Access:\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.desc}...`);
    const result = await testEndpoint(endpoint.path, endpoint.key, endpoint.desc);
    results.push(result);
    
    if (result.success) {
      console.log(` ✅ (${result.status})`);
    } else {
      console.log(` ❌ (${result.status || 'Failed'})`);
      if (result.error) console.log(`   Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n=======================================');
  console.log('📈 Deployment Status Summary:');
  console.log('=======================================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Accessible tables: ${successful}/${results.length}`);
  console.log(`❌ Failed checks: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.description}: Status ${r.status}`);
    });
    
    console.log('\n💡 Common issues:');
    console.log('   - Tables not created: Run migrations in SQL Editor');
    console.log('   - RLS blocking access: Check policies are correct');
    console.log('   - API not exposed: Enable in Table Editor > API Settings');
  } else {
    console.log('\n🎉 All tables are accessible!');
    console.log('✨ Database deployment appears successful.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('   1. Test creating a lead via the API');
  console.log('   2. Verify RLS policies are working correctly');
  console.log('   3. Check that all indexes are created');
  console.log('   4. Test vector search functionality');
  console.log('=======================================\n');
}

// Run verification
verifyDeployment().catch(console.error);