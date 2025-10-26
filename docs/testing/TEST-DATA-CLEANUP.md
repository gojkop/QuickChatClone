# Test Data Cleanup System

**Date:** October 26, 2025
**Purpose:** Automated cleanup of test data created during security validation test runs

---

## Overview

The test data cleanup system removes all test questions, answers, media assets, and payment records created during automated security test runs. This keeps the database clean and prevents accumulation of test data in production/staging environments.

**Status:** ✅ Production Ready

---

## Features

### Automatic Identification

Test data is identified by the `stripe_payment_intent_id` field:
- All test payment intents start with `pi_test_`
- Example: `pi_test_accept_1730000000000`

### Cascade Deletion

The cleanup endpoint deletes related records in the correct order:

1. **Answers** - All answers for test questions
2. **Answer Media** - Media assets linked to test answers
3. **Question Media** - Media assets linked to test questions
4. **Payment Records** - Payment table entries for test questions
5. **Questions** - The test questions themselves

### Safe Operation

- ✅ Only deletes data with `pi_test_` payment intents
- ✅ Production data is never touched
- ✅ Requires internal API key (unauthorized users can't run cleanup)
- ✅ Returns count of deleted records

---

## Usage

### Option 1: Automatic Cleanup (Recommended)

Run tests with the `--cleanup` flag to automatically remove test data after tests complete:

```bash
./tests/run-security-tests.sh --cleanup
```

**Output:**
```
✅ All security tests passed!

┌─ Cleaning up test data...
✓ Test data cleaned up successfully
└─
```

### Option 2: Manual Cleanup

Run the standalone cleanup script:

```bash
cd tests
node cleanup-test-data.cjs
```

**Output:**
```
🧹 Starting test data cleanup...

✅ Test data cleanup completed successfully!

📊 Summary:
   • Test questions deleted: 12
   • Associated answers, media, and payments also removed
```

### Option 3: Direct API Call

Call the Xano endpoint directly:

```bash
curl -X DELETE \
  "https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/internal/test-data/cleanup" \
  -H "Content-Type: application/json" \
  -d '{"x_api_key":"YOUR_INTERNAL_API_KEY"}'
```

---

## Configuration

### Environment Variables

Add to `/tests/.env`:

```bash
# Xano API endpoints
XANO_PUBLIC_API=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L

# Internal API key for cleanup endpoint
XANO_INTERNAL_API_KEY=your_internal_api_key_here
```

**Getting the Internal API Key:**
1. Open Xano workspace
2. Go to Settings → API Keys
3. Find or create internal API key
4. Copy to `.env` file

---

## Xano Endpoint

### DELETE /internal/test-data/cleanup

**Location:** Public API Group (`api:BQW1GS7L`)

**Authentication:** Internal API key

**Request:**
```json
{
  "x_api_key": "your_internal_api_key"
}
```

**Response (Success):**
```json
{
  "success": true,
  "deleted": {
    "questions": 12
  },
  "message": "Test data cleanup completed successfully"
}
```

**Note:** The endpoint performs cascade deletion of associated answers, media assets, and payment records for each test question, but only reports the count of questions deleted for simplicity.

**Response (Unauthorized):**
```json
{
  "payload": "401 error \"Unauthorized\"",
  "statement": "Stop & Debug"
}
```

### Implementation

**File:** `/docs/api-database/endpoints/testing/cleanup-test-data.xs`

**Function Stack:**
1. Validate API key
2. Query all test questions (`payment_intent_id LIKE 'pi_test_%'`)
3. For each test question:
   - Query and delete answers
   - Delete answer media assets
   - Delete question media asset
   - Delete payment record
4. Delete all test questions
5. Return deletion counts

**Key Security Features:**
- ✅ Requires internal API key (no public access)
- ✅ Only deletes test data (identified by pattern)
- ✅ Cannot accidentally delete production data
- ✅ Cascade delete ensures no orphaned records

---

## Test Data Pattern

### How Test Data is Created

During test runs, unique payment intent IDs are generated with timestamps:

```javascript
// Example from testOfferAcceptOwnership()
const paymentIntent = `pi_test_accept_${Date.now()}`;

// Creates question with:
{
  stripe_payment_intent_id: "pi_test_accept_1730000000000",
  expert_profile_id: 139,
  text_question: "Test question for offer accept ownership",
  // ...
}
```

### Identifying Test Data

All test questions have payment intents matching this pattern:
```
pi_test_*
```

Examples:
- `pi_test_accept_1730000123456`
- `pi_test_decline_1730000234567`
- `pi_test_capture_1730000345678`
- `pi_test_refund_1730000456789`

**Production data never uses this pattern** - real Stripe payment intents start with:
- `pi_` followed by random alphanumeric string
- Example: `pi_3N8F8Y2eZvKYlo2C0kHHUb9r`

---

## Troubleshooting

### Cleanup Failed: API Key Not Set

**Error:**
```
❌ Error: XANO_INTERNAL_API_KEY not set in .env file
```

**Solution:**
1. Add `XANO_INTERNAL_API_KEY` to `/tests/.env`
2. Get key from Xano Settings → API Keys
3. Run cleanup again

---

### Cleanup Failed: Unauthorized

**Error:**
```json
{
  "payload": "401 error \"Unauthorized\""
}
```

**Solution:**
1. Verify API key is correct in `.env`
2. Check that API key has correct permissions in Xano
3. Ensure using Public API URL (not Auth API)

---

### No Test Data to Clean

**Output:**
```
📊 Deleted:
   • Questions: 0
   • Answers: 0
   • Media Assets: 0
   • Payment Records: 0
```

This is normal if:
- ✅ Tests haven't been run yet
- ✅ Cleanup already ran
- ✅ All tests were skipped

---

### Cleanup Skipped During Test Run

**Output:**
```
💡 Tip: Add --cleanup flag to automatically remove test data
   Example: ./run-security-tests.sh --cleanup
```

**Solution:**
- This is informational, not an error
- Run tests with `--cleanup` flag next time
- Or run manual cleanup: `node cleanup-test-data.cjs`

---

## Best Practices

### Development Environment

**Recommended:** Run cleanup after every test run

```bash
./tests/run-security-tests.sh --cleanup
```

**Benefit:** Keeps database clean, prevents ID conflicts

### Staging Environment

**Recommended:** Run cleanup weekly via cron

```bash
# Add to crontab
0 3 * * 0 cd /path/to/project && node tests/cleanup-test-data.cjs
```

**Benefit:** Removes accumulated test data automatically

### Production Environment

**Recommended:** **DO NOT** run tests or cleanup in production

- Tests create real database records
- Cleanup could accidentally delete data if patterns match
- Use staging/development environments for testing

---

## Safety Guarantees

### What Gets Deleted

✅ **Only test data:**
- Questions with `stripe_payment_intent_id` starting with `pi_test_`
- Answers linked to those questions
- Media assets linked to those questions/answers
- Payment records linked to those questions

### What NEVER Gets Deleted

❌ **Production data:**
- Questions with real Stripe payment intents (`pi_3N8F8Y...`)
- User-submitted questions
- Expert answers to real questions
- Production media assets
- Production payment records

### Double-Check Safety

The cleanup query uses a specific pattern match:

```sql
WHERE payment_intent_id LIKE 'pi_test_%'
```

Real Stripe payment intents **never** match this pattern:
- Real format: `pi_3N8F8Y2eZvKYlo2C0kHHUb9r`
- Test format: `pi_test_accept_1730000000000`

---

## Integration with CI/CD

### GitHub Actions (Future)

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run security tests
        env:
          XANO_PUBLIC_API: ${{ secrets.XANO_PUBLIC_API }}
          XANO_INTERNAL_API_KEY: ${{ secrets.XANO_INTERNAL_API_KEY }}
          EXPERT_A_TOKEN: ${{ secrets.EXPERT_A_TOKEN }}
        run: |
          ./tests/run-security-tests.sh --cleanup
```

### Cron Job Cleanup

For environments where tests run automatically:

```bash
#!/bin/bash
# /etc/cron.daily/cleanup-quickchat-tests

cd /path/to/quickchat
source tests/.env
node tests/cleanup-test-data.cjs
```

---

## Files

| File | Purpose |
|------|---------|
| `/tests/cleanup-test-data.cjs` | Standalone cleanup script |
| `/tests/security-validation.cjs` | Test suite with optional cleanup |
| `/tests/run-security-tests.sh` | Shell wrapper (passes --cleanup flag) |
| `/docs/api-database/endpoints/testing/cleanup-test-data.xs` | Xano endpoint implementation |
| `/docs/testing/TEST-DATA-CLEANUP.md` | This documentation |

---

## Changelog

**October 26, 2025:**
- ✅ Initial implementation
- ✅ Standalone cleanup script
- ✅ Integration with security test suite
- ✅ Xano endpoint created
- ✅ Documentation completed

---

## Related Documentation

- [Security Validation Guide](./SECURITY-VALIDATION-GUIDE.md) - Complete test suite documentation
- [Testing README](./README.md) - Main testing documentation
- [Best Practices](./BEST-PRACTICES.md) - Testing guidelines

---

**Last Updated:** October 26, 2025
**Status:** ✅ Production Ready
**Maintainer:** QuickChat Development Team
