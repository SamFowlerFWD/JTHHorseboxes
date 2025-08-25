import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_comprehensive_operations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    // Remove comments and split by semicolons
    const statements = migrationSQL
      .split(/;\s*$/gm)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement || statement.match(/^\s*$/)) {
        continue;
      }
      
      // Add semicolon back
      const fullStatement = statement + ';';
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: fullStatement
        }).single();
        
        if (error) {
          // Try direct execution as some statements might not work with rpc
          const { data, error: directError } = await supabase
            .from('_sql')
            .insert({ query: fullStatement })
            .select();
            
          if (directError) {
            throw directError;
          }
        }
        
        successCount++;
      } catch (error) {
        errorCount++;
        const errorMsg = `Statement ${i + 1} failed: ${error.message}`;
        console.error(errorMsg);
        errors.push({
          statement: i + 1,
          error: error.message,
          sql: fullStatement.substring(0, 100) + '...'
        });
        
        // Continue with other statements
        continue;
      }
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(err => {
        console.log(`Statement ${err.statement}: ${err.error}`);
        console.log(`SQL: ${err.sql}`);
      });
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();