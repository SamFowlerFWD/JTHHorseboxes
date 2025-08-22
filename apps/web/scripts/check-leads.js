#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLeads() {
  try {
    // Check leads directly
    const { data: leads, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching leads:', error)
      return
    }
    
    console.log(`\nTotal leads in database: ${count}`)
    console.log('\nFirst 5 leads:')
    leads.slice(0, 5).forEach(lead => {
      console.log(`- ${lead.first_name} ${lead.last_name} (${lead.email}) - Status: ${lead.status}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkLeads()