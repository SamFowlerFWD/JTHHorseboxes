# JTH Operations Platform - Test Suite

## Database Validation Tests

This directory contains comprehensive tests for validating the JTH operations platform database setup and functionality.

## Available Test Commands

### Quick Checks
```bash
# Quick database connectivity check (5 seconds)
npm run db:check

# Detailed database validation (10 seconds)
npm run validate:db

# Both quick and detailed checks
npm run db:validate
```

### Playwright E2E Tests
```bash
# Run all Playwright tests
npm test

# Run only operations database tests
npm run test:ops

# Run with browser visible (debugging)
npm run test:ops:headed

# Interactive UI mode
npm run test:ui
```

### Complete Test Suite
```bash
# Run ALL database tests (quick, detailed, and E2E)
npm run test:db:complete
```

## Test Coverage

### 1. Database Connectivity (`db:check`)
- Verifies Supabase connection
- Checks if critical tables exist
- Provides quick pass/fail status

### 2. Detailed Validation (`validate:db`)
- Validates table structures
- Checks column presence
- Counts records
- Validates data integrity
- Tests database functions
- Provides migration instructions if needed

### 3. Playwright Tests (`test:ops`)
- **Authentication Testing**
  - Login page functionality
  - Session management
  - Error handling

- **API Testing**
  - Customer API endpoints
  - Inventory API endpoints
  - Mock vs real data detection
  - CRUD operations

- **UI Integration**
  - Dashboard rendering
  - Customer management page
  - Inventory management page
  - Error pages

- **Data Integrity**
  - Response structure validation
  - Field type checking
  - Stock level validation

## Understanding Test Results

### Success Indicators
- ✅ Green checkmarks = Feature working correctly
- 🎉 All tests passed = Database fully operational

### Warning Indicators
- ⚠️ Yellow warnings = Using mock data or partial functionality
- The app will still work but with limited features

### Error Indicators
- ❌ Red X = Feature not available or critical error
- Follow the migration instructions provided

## Troubleshooting

### If Tests Fail

1. **Database Not Connected**
   - Check `.env.local` has correct Supabase credentials
   - Verify Supabase project is active

2. **Tables Missing**
   - Run migration: `apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql`
   - Use Supabase SQL Editor to execute the script

3. **Authentication Issues**
   - Ensure profiles table has enhanced columns
   - Check auth configuration in Supabase dashboard

### Mock Mode

If database is not available, the application automatically falls back to mock data:
- Customer management uses sample customer data
- Inventory uses sample product data
- All features remain testable
- No data persistence between sessions

## Test Development

### Adding New Tests

Add tests to `ops-database-validation.spec.ts`:

```typescript
test('should validate new feature', async ({ page }) => {
  // Your test code here
  log('Testing new feature', 'info')
  
  const response = await page.request.get('/api/ops/new-endpoint')
  const data = await response.json()
  
  if (data.mock) {
    log('Using mock data', 'warning')
  } else {
    log('Using real database', 'success')
  }
  
  expect(data.success).toBe(true)
})
```

### Helper Functions

The test suite provides helper functions:
- `log(message, type)` - Formatted console logging
- `checkDatabaseConnection(page, endpoint)` - Check if endpoint uses real DB

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Database Tests
  run: |
    npm install
    npm run test:db:complete
```

The tests will automatically:
- Use mock data if database is unavailable
- Report detailed status
- Exit with appropriate codes (0 = success, 1 = failure)