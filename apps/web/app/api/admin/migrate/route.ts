/**
 * TEMPORARY Migration Endpoint
 * This endpoint executes the multi-model support migration
 * DELETE THIS FILE after migration is applied
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const supabase = await createClient()

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/014_multi_model_support.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Execute the migration using Supabase's query method
    // Note: This executes the entire SQL as a single transaction
    const { error } = await supabase.rpc('exec', { sql })

    if (error) {
      // If RPC doesn't work, try executing statements one by one
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      const results = []
      for (const statement of statements) {
        try {
          // Use raw query if available
          const result = await supabase.rpc('execute_sql', { query: statement })
          results.push({ statement: statement.substring(0, 100), result })
        } catch (err: any) {
          console.error('Error executing statement:', err)
          results.push({ statement: statement.substring(0, 100), error: err.message })
        }
      }

      return NextResponse.json({
        success: false,
        message: 'Migration execution attempted with individual statements',
        error: error.message,
        results,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Migration 014 applied successfully',
      changes: [
        'Added applicable_models column (text array)',
        'Migrated existing model data to applicable_models',
        'Dropped old model column',
        'Added 4.5t model specifications',
        'Created GIN index on applicable_models',
        'Created option_applies_to_model() helper function',
      ],
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        migration: '014_multi_model_support.sql',
        instruction: 'Please apply this migration manually using psql or Supabase dashboard',
      },
      { status: 500 }
    )
  }
}
