# Security Tests - Quick Start Guide

Get your security validation tests running in 5 minutes.

## Step 1: Prerequisites

```bash
# Check Node.js version (need 18+)
node --version

# If < 18, install latest
# macOS: brew install node
# Or download from: https://nodejs.org/
```

## Step 2: Configure Test Data

```bash
# From project root
cd tests

# Copy example config
cp .env.example .env

# Edit with your data
nano .env  # or use your editor
```

### Minimal Configuration

You need **at least these 4 values** to run basic tests:

```bash
# 1. Xano URLs (get from Xano dashboard)
XANO_AUTH_API=https://xxxxx.xano.io/api:3B14WLbJ
XANO_PUBLIC_API=https://xxxxx.xano.io/api:BQW1GS7L

# 2. One expert token (from browser localStorage after login)
EXPERT_A_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. One expert question ID (from Xano database)
EXPERT_A_QUESTION_ID=123

# 4. Expert profile ID
EXPERT_A_PROFILE_ID=1
```

### How to Get Each Value:

#### XANO_AUTH_API & XANO_PUBLIC_API
1. Go to Xano dashboard
2. Click on "API" in left menu
3. Copy the base URL for each API group
4. Authentication API usually ends with `:3B14WLbJ`
5. Public API usually ends with `:BQW1GS7L`

#### EXPERT_A_TOKEN
1. Open your app: `http://localhost:5173` (or production URL)
2. Sign in as an expert
3. Press F12 (DevTools) → Console tab
4. Type: `localStorage.getItem('qc_token')`
5. Copy the long string (starts with `eyJ...`)

#### EXPERT_A_QUESTION_ID
1. Go to Xano → Database → `question` table
2. Pick any question
3. Copy the `id` value

#### EXPERT_A_PROFILE_ID
1. Same question row in Xano
2. Copy the `expert_profile_id` value

## Step 3: Run Tests

```bash
# From project root (recommended)
./tests/run-security-tests.sh

# Or directly with node
node tests/security-validation.cjs

# Or from tests directory
cd tests
./run-security-tests.sh
```

## Expected Results

### ✅ Success
```
============================================================
XANO SECURITY VALIDATION TEST SUITE
============================================================

[PASS] PATCH /question/{id} requires authentication
[PASS] Expert can update own question
[PASS] PATCH response hides playback_token_hash
...

============================================================
TEST SUMMARY
============================================================
✓ Passed:  12
✗ Failed:  0
⊘ Skipped: 0
============================================================

ALL SECURITY TESTS PASSED!
```

### ⚠️ Some Tests Skipped
```
[SKIP] Cross-expert update blocked
  → Unexpected status: 404

[SKIP] Payment reuse prevention
  → Status: 400
```

**This is OK!** Skipped tests mean the test couldn't run (missing test data), but no security issues were found.

### ❌ Security Issue
```
[FAIL] PATCH response hides playback_token_hash
  → ⚠️  TOKEN LEAKED TO EXPERT!
```

**This is BAD!** Fix the issue before deploying.

## Optional: Full Test Coverage

For 100% test coverage, add these to `.env`:

```bash
# Second expert (for cross-expert tests)
EXPERT_B_TOKEN=second_expert_token_here
EXPERT_B_QUESTION_ID=456

# Payment intents (for payment tests)
VALID_PAYMENT_INTENT=pi_test_new_12345
USED_PAYMENT_INTENT=pi_test_used_67890

# Review token (for feedback tests)
VALID_REVIEW_TOKEN=uuid_from_playback_token_hash
```

## Troubleshooting

### "Missing configuration"
- Edit `tests/.env` with real values
- At minimum, fill in the 4 required values

### "fetch is not defined"
- Upgrade Node.js to version 18+
- Check: `node --version`

### "401 Unauthorized"
- Your token expired (they last ~24 hours)
- Get a fresh token from localStorage

### "404 Not Found"
- Question ID doesn't exist
- Go to Xano database and get a real question ID

## What's Being Tested?

1. **Authentication** - Endpoints require login
2. **Ownership** - Experts can only access their own data
3. **Payment Security** - Can't reuse payment intents
4. **Token Protection** - Review tokens hidden from experts
5. **Input Validation** - Invalid data is rejected

## Next Steps

- ✅ Run tests before every deploy
- ✅ Add to CI/CD pipeline (see README.md)
- ✅ Keep tokens fresh (update monthly)
- ✅ Review failed tests immediately

## Need Help?

See detailed guides:
- **Full documentation:** `tests/README.md`
- **Security fixes:** `docs/api-database/XANO-SECURITY-FIXES-GUIDE.md`
- **Implementation:** `docs/api-database/XANO-SECURITY-IMPLEMENTATION-COMPLETE.md`
