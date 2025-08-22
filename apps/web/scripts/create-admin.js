#!/usr/bin/env node

// Script to create an admin user for testing
// Run with: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    // Create user with service role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@jthltd.co.uk',
      password: 'Admin123!@#',
      email_confirm: true,
      user_metadata: {
        full_name: 'JTH Admin',
        role: 'admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Admin user already exists')
        
        // Update the existing user's password
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError
        
        const adminUser = users.users.find(u => u.email === 'admin@jthltd.co.uk')
        if (adminUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { password: 'Admin123!@#' }
          )
          if (updateError) throw updateError
          console.log('Admin password updated')
        }
      } else {
        throw authError
      }
    } else {
      console.log('Admin user created successfully!')
      console.log('Email: admin@jthltd.co.uk')
      console.log('Password: Admin123!@#')
    }

    // Create or update admin profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === 'admin@jthltd.co.uk').id,
        email: 'admin@jthltd.co.uk',
        full_name: 'JTH Admin',
        role: 'admin'
      }, {
        onConflict: 'email'
      })

    if (profileError && !profileError.message.includes('duplicate')) {
      console.warn('Warning: Could not create user profile:', profileError.message)
    }

    console.log('\n✅ Admin setup complete!')
    console.log('You can now log in at: http://localhost:3000/admin')
    console.log('Email: admin@jthltd.co.uk')
    console.log('Password: Admin123!@#')

  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()