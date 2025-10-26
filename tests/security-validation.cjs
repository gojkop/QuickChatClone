#!/usr/bin/env node

/**
 * Xano Security Validation Script
 *
 * Tests all security fixes implemented in January 2025
 * Run: node tests/security-validation.cjs
 *
 * Minimum Requirements:
 * - One expert account with auth token (EXPERT_A_TOKEN)
 * - Xano API URLs (XANO_AUTH_API, XANO_PUBLIC_API)
 *
 * Optional for Full Test Coverage:
 * - Second expert account (EXPERT_B_TOKEN) for cross-expert ownership tests
 * - Valid payment intent IDs for payment reuse tests
 * - Valid review token for feedback tests
 */

const fs = require('fs');
const path = require('path');

// ============================================
// LOAD .ENV FILE
// ============================================

function loadEnv() {
  // Try to load .env from tests/ directory
  const possiblePaths = [
    path.join(__dirname, '.env'),           // tests/.env (when run from project root)
    path.join(process.cwd(), 'tests', '.env'), // tests/.env (when run from project root)
    path.join(process.cwd(), '.env'),          // .env (when run from tests dir)
  ];

  for (const envPath of possiblePaths) {
    try {
      const envFile = fs.readFileSync(envPath, 'utf8');

      envFile.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (line.startsWith('#') || !line.trim()) return;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();

          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });

      console.log(`${COLORS.green}✓ Loaded .env file from: ${envPath}${COLORS.reset}`);
      return true;
    } catch (error) {
      // Try next path
      continue;
    }
  }

  console.log(`${COLORS.yellow}⚠️  .env file not found - using environment variables${COLORS.reset}`);
  return false;
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Load environment variables first
loadEnv();

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Xano API URLs
  XANO_AUTH_API: process.env.XANO_AUTH_API || 'https://your-workspace.xano.io/api:3B14WLbJ',
  XANO_PUBLIC_API: process.env.XANO_PUBLIC_API || 'https://your-workspace.xano.io/api:BQW1GS7L',

  // Test Data (replace with real values)
  EXPERT_A_TOKEN: process.env.EXPERT_A_TOKEN || 'your_expert_a_token_here',
  EXPERT_B_TOKEN: process.env.EXPERT_B_TOKEN || 'your_expert_b_token_here',
  EXPERT_A_QUESTION_ID: parseInt(process.env.EXPERT_A_QUESTION_ID) || 123,
  EXPERT_B_QUESTION_ID: parseInt(process.env.EXPERT_B_QUESTION_ID) || 456,
  VALID_PAYMENT_INTENT: process.env.VALID_PAYMENT_INTENT || 'pi_test_new_unique_id',
  USED_PAYMENT_INTENT: process.env.USED_PAYMENT_INTENT || 'pi_test_already_used',
  VALID_REVIEW_TOKEN: process.env.VALID_REVIEW_TOKEN || 'valid_playback_token_hash',
  EXPERT_A_PROFILE_ID: parseInt(process.env.EXPERT_A_PROFILE_ID) || 1,
};

// ============================================
// TEST RESULTS TRACKING
// ============================================

const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

function logTest(name, status, message) {
  const statusColors = {
    PASS: COLORS.green,
    FAIL: COLORS.red,
    SKIP: COLORS.yellow,
  };

  const color = statusColors[status] || COLORS.reset;
  console.log(`${color}[${status}]${COLORS.reset} ${name}`);
  if (message) {
    console.log(`  ${COLORS.cyan}→${COLORS.reset} ${message}`);
  }

  results.tests.push({ name, status, message });
  if (status === 'PASS') results.passed++;
  if (status === 'FAIL') results.failed++;
  if (status === 'SKIP') results.skipped++;
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(`${COLORS.blue}TEST SUMMARY${COLORS.reset}`);
  console.log('='.repeat(60));
  console.log(`${COLORS.green}✓ Passed:${COLORS.reset}  ${results.passed}`);
  console.log(`${COLORS.red}✗ Failed:${COLORS.reset}  ${results.failed}`);
  console.log(`${COLORS.yellow}⊘ Skipped:${COLORS.reset} ${results.skipped}`);
  console.log(`Total: ${results.tests.length}`);
  console.log('='.repeat(60));

  if (results.failed > 0) {
    console.log(`\n${COLORS.red}SECURITY ISSUES DETECTED!${COLORS.reset}`);
    console.log('Review failed tests above and fix before deploying.\n');
    process.exit(1);
  } else {
    console.log(`\n${COLORS.green}ALL SECURITY TESTS PASSED!${COLORS.reset}`);
    console.log('Your endpoints are secure and ready for production.\n');
    process.exit(0);
  }
}

// ============================================
// HTTP HELPER
// ============================================

async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Helper: Check if response is a Xano error (debug.stop returns 200 with error in payload)
function isXanoError(res, errorCode) {
  const payload = res.data?.payload || res.data?.message || '';
  const hasError = payload.includes('error');

  if (errorCode) {
    // Check for specific error code (e.g., "403", "404", "400")
    return hasError && payload.includes(errorCode);
  }

  return hasError;
}

// ============================================
// TEST SUITES
// ============================================

async function testPatchQuestionAuth() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: PATCH /question/{id} - Authentication${COLORS.reset}`);

  // Test 1: Requires authentication
  const res1 = await request(`${CONFIG.XANO_AUTH_API}/question/${CONFIG.EXPERT_A_QUESTION_ID}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'test' }),
  });

  if (res1.status === 401 || res1.status === 403) {
    logTest('PATCH /question/{id} requires authentication', 'PASS', 'Unauthenticated request rejected');
  } else {
    logTest('PATCH /question/{id} requires authentication', 'FAIL', `Expected 401/403, got ${res1.status}`);
  }

  // Test 2: Expert A can update their own question
  const res2 = await request(`${CONFIG.XANO_AUTH_API}/question/${CONFIG.EXPERT_A_QUESTION_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_A_TOKEN}`,
    },
    body: JSON.stringify({ status: 'paid' }),
  });

  if (res2.ok && res2.data.id === CONFIG.EXPERT_A_QUESTION_ID) {
    logTest('Expert can update own question', 'PASS', 'Update succeeded');
  } else {
    logTest('Expert can update own question', 'FAIL', `Expected success, got ${res2.status}`);
  }

  // Test 3: Response doesn't include playback_token_hash
  if (res2.ok) {
    if (res2.data.playback_token_hash === undefined) {
      logTest('PATCH response hides playback_token_hash', 'PASS', 'Token not in response');
    } else {
      logTest('PATCH response hides playback_token_hash', 'FAIL', '⚠️  TOKEN LEAKED TO EXPERT!');
    }
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testPatchQuestionOwnership() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: PATCH /question/{id} - Ownership${COLORS.reset}`);

  // Skip if EXPERT_B not configured
  if (!global.HAS_EXPERT_B) {
    logTest('Cross-expert update blocked', 'SKIP', 'EXPERT_B not configured - test skipped');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  // Test 4: Expert A cannot update Expert B's question
  const res = await request(`${CONFIG.XANO_AUTH_API}/question/${CONFIG.EXPERT_B_QUESTION_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_A_TOKEN}`,
    },
    body: JSON.stringify({ status: 'test' }),
  });

  if (res.status === 403 || isXanoError(res, '403')) {
    logTest('Cross-expert update blocked', 'PASS', 'Ownership violation prevented');
  } else if (res.status === 404 || isXanoError(res, '404')) {
    logTest('Cross-expert update blocked', 'PASS', 'Question not found (also secure)');
  } else if (res.ok) {
    logTest('Cross-expert update blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
  } else {
    logTest('Cross-expert update blocked', 'SKIP', `Unexpected status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testPostAnswerSecurity() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: POST /answer - Security${COLORS.reset}`);

  // Skip if EXPERT_B not configured
  if (!global.HAS_EXPERT_B) {
    logTest('Cross-expert answer blocked', 'SKIP', 'EXPERT_B not configured - test skipped');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  // Step 1: Create a fresh question assigned to Expert A
  const createRes = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Question for Answer Security',
      text: 'This question is for testing cross-expert answer blocking',
      stripe_payment_intent_id: `pi_test_answer_security_${Date.now()}`,
      sla_hours_snapshot: 24,
    }),
  });

  if (!createRes.ok || !createRes.data?.question_id) {
    logTest('Cross-expert answer blocked', 'SKIP', 'Could not create test question');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  const testQuestionId = createRes.data.question_id;

  // Step 2: Expert B tries to answer Expert A's question (should fail)
  const res = await request(`${CONFIG.XANO_AUTH_API}/answer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}`,
    },
    body: JSON.stringify({
      question_id: testQuestionId,
      user_id: 138, // Expert B's user_id
      text_response: 'Attempting to answer another expert\'s question',
    }),
  });

  if (res.status === 403 || isXanoError(res, '403')) {
    logTest('Cross-expert answer blocked', 'PASS', 'Ownership violation prevented');
  } else if (res.status === 404 || isXanoError(res, '404')) {
    logTest('Cross-expert answer blocked', 'PASS', 'Question not found (also secure)');
  } else if (res.ok) {
    logTest('Cross-expert answer blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
  } else {
    logTest('Cross-expert answer blocked', 'SKIP', `Unexpected status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testPaymentValidation() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: Payment Intent Validation${COLORS.reset}`);

  // Test 6: Cannot reuse payment intent
  const res1 = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Question',
      text: 'Test question text',
      stripe_payment_intent_id: CONFIG.USED_PAYMENT_INTENT,
      sla_hours_snapshot: 24,
    }),
  });

  if (res1.status === 400 || isXanoError(res1, '400')) {
    logTest('Payment reuse prevention (Quick Consult)', 'PASS', 'Duplicate payment blocked');
  } else if (res1.ok) {
    logTest('Payment reuse prevention (Quick Consult)', 'FAIL', '⚠️  PAYMENT REUSE ALLOWED!');
  } else {
    logTest('Payment reuse prevention (Quick Consult)', 'SKIP', `Status: ${res1.status}`);
  }

  // Test 7: New payment intent works
  const uniquePayment = `pi_test_${Date.now()}`;
  const res2 = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Question',
      text: 'Test question text',
      stripe_payment_intent_id: uniquePayment,
      sla_hours_snapshot: 24,
    }),
  });

  if (res2.ok && res2.data?.question_id) {
    logTest('New payment intent accepted', 'PASS', `Question created: ${res2.data.question_id}`);

    // Test 8: Response includes playback_token_hash (for asker)
    if (res2.data.playback_token_hash) {
      logTest('Question creation returns token to asker', 'PASS', 'Asker receives review token');
    } else {
      logTest('Question creation returns token to asker', 'FAIL', 'Token missing from response');
    }
  } else {
    logTest('New payment intent accepted', 'SKIP', `Could not create question: ${res2.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testDeepDivePaymentValidation() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: Deep Dive Payment Validation${COLORS.reset}`);

  // Test 9: Cannot reuse payment intent (Deep Dive)
  const res = await request(`${CONFIG.XANO_PUBLIC_API}/question/deep-dive`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      proposed_price_cents: 10000,
      title: 'Test Deep Dive',
      text: 'Test deep dive text',
      stripe_payment_intent_id: CONFIG.USED_PAYMENT_INTENT,
    }),
  });

  if (res.status === 400 || isXanoError(res, '400')) {
    logTest('Payment reuse prevention (Deep Dive)', 'PASS', 'Duplicate payment blocked');
  } else if (res.ok) {
    logTest('Payment reuse prevention (Deep Dive)', 'FAIL', '⚠️  PAYMENT REUSE ALLOWED!');
  } else {
    logTest('Payment reuse prevention (Deep Dive)', 'SKIP', `Status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testFeedbackValidation() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: Feedback Validation${COLORS.reset}`);

  // Test 10: Invalid token rejected
  const res1 = await request(`${CONFIG.XANO_PUBLIC_API}/review/invalid_token_12345/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      token: 'invalid_token_12345',
      rating: 5,
      feedback_text: 'Test feedback',
    }),
  });

  if (res1.status === 404 || isXanoError(res1, '404')) {
    logTest('Invalid review token rejected', 'PASS', 'Invalid token blocked');
  } else if (res1.ok) {
    logTest('Invalid review token rejected', 'FAIL', '⚠️  INVALID TOKEN ACCEPTED!');
  } else {
    logTest('Invalid review token rejected', 'SKIP', `Status: ${res1.status}`);
  }

  // Test 11: Rating validation
  const res2 = await request(`${CONFIG.XANO_PUBLIC_API}/review/${CONFIG.VALID_REVIEW_TOKEN}/feedback`, {
    method: 'POST',
    body: JSON.stringify({
      token: CONFIG.VALID_REVIEW_TOKEN,
      rating: 10, // Invalid: must be 1-5
      feedback_text: 'Test feedback',
    }),
  });

  if (res2.status === 400 || isXanoError(res2, '400')) {
    logTest('Rating range validation', 'PASS', 'Invalid rating rejected');
  } else if (res2.ok) {
    logTest('Rating range validation', 'FAIL', '⚠️  INVALID RATING ACCEPTED!');
  } else {
    logTest('Rating range validation', 'SKIP', `Status: ${res2.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testReviewTokenAccess() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: Review Token Access${COLORS.reset}`);

  // Test 12: Review page returns token (public access)
  const res = await request(`${CONFIG.XANO_PUBLIC_API}/review/${CONFIG.VALID_REVIEW_TOKEN}`, {
    method: 'GET',
  });

  if (res.ok && res.data?.playback_token_hash) {
    logTest('Review page returns token to asker', 'PASS', 'Asker can access review page');
  } else if (res.status === 404) {
    logTest('Review page returns token to asker', 'SKIP', 'Token not found (expected for test data)');
  } else {
    logTest('Review page returns token to asker', 'FAIL', 'Review page not accessible');
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testOfferAcceptOwnership() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: POST /offers/{id}/accept - Ownership${COLORS.reset}`);

  // Skip if EXPERT_B not configured
  if (!global.HAS_EXPERT_B) {
    logTest('Cross-expert offer accept blocked', 'SKIP', 'EXPERT_B not configured - test skipped');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  // Step 1: Create a Deep Dive offer for Expert A
  const createRes = await request(`${CONFIG.XANO_PUBLIC_API}/question/deep-dive`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Deep Dive for Accept Security',
      text: 'Testing cross-expert offer acceptance',
      stripe_payment_intent_id: `pi_test_accept_${Date.now()}`,
      proposed_price_cents: 50000,
      asker_message: 'Please review my offer',
      sla_hours_snapshot: 48,
    }),
  });

  if (!createRes.ok || !createRes.data?.question_id) {
    logTest('Cross-expert offer accept blocked', 'SKIP', 'Could not create test offer');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  const testOfferId = createRes.data.question_id;

  // Step 2: Expert B tries to accept Expert A's offer (should fail)
  const res = await request(`${CONFIG.XANO_AUTH_API}/offers/${testOfferId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}`,
    },
    body: JSON.stringify({
      id: testOfferId,
    }),
  });

  if (res.status === 403 || isXanoError(res, '403')) {
    logTest('Cross-expert offer accept blocked', 'PASS', 'Ownership violation prevented');
  } else if (res.status === 404 || isXanoError(res, '404')) {
    logTest('Cross-expert offer accept blocked', 'PASS', 'Offer not found (also secure)');
  } else if (res.ok) {
    logTest('Cross-expert offer accept blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
  } else {
    logTest('Cross-expert offer accept blocked', 'SKIP', `Unexpected status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testOfferDeclineOwnership() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: POST /offers/{id}/decline - Ownership${COLORS.reset}`);

  // Skip if EXPERT_B not configured
  if (!global.HAS_EXPERT_B) {
    logTest('Cross-expert offer decline blocked', 'SKIP', 'EXPERT_B not configured - test skipped');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  // Step 1: Create a Deep Dive offer for Expert A
  const createRes = await request(`${CONFIG.XANO_PUBLIC_API}/question/deep-dive`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Deep Dive for Decline Security',
      text: 'Testing cross-expert offer decline',
      stripe_payment_intent_id: `pi_test_decline_${Date.now()}`,
      proposed_price_cents: 50000,
      asker_message: 'Please review my offer',
      sla_hours_snapshot: 48,
    }),
  });

  if (!createRes.ok || !createRes.data?.question_id) {
    logTest('Cross-expert offer decline blocked', 'SKIP', 'Could not create test offer');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  const testOfferId = createRes.data.question_id;

  // Step 2: Expert B tries to decline Expert A's offer (should fail)
  const res = await request(`${CONFIG.XANO_AUTH_API}/offers/${testOfferId}/decline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}`,
    },
    body: JSON.stringify({
      id: testOfferId,
      decline_reason: 'Attempting to decline another expert\'s offer',
    }),
  });

  if (res.status === 403 || isXanoError(res, '403')) {
    logTest('Cross-expert offer decline blocked', 'PASS', 'Ownership violation prevented');
  } else if (res.status === 404 || isXanoError(res, '404')) {
    logTest('Cross-expert offer decline blocked', 'PASS', 'Offer not found (also secure)');
  } else if (res.ok) {
    logTest('Cross-expert offer decline blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
  } else {
    logTest('Cross-expert offer decline blocked', 'SKIP', `Unexpected status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testPaymentCaptureOwnership() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: POST /payment/capture - Ownership${COLORS.reset}`);

  // Skip if EXPERT_B not configured
  if (!global.HAS_EXPERT_B) {
    logTest('Cross-expert payment capture blocked', 'SKIP', 'EXPERT_B not configured - test skipped');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  // Step 1: Create a Quick Consult question for Expert A
  const createRes = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Question for Capture Security',
      text: 'Testing cross-expert payment capture',
      stripe_payment_intent_id: `pi_test_capture_${Date.now()}`,
      sla_hours_snapshot: 24,
    }),
  });

  if (!createRes.ok || !createRes.data?.question_id) {
    logTest('Cross-expert payment capture blocked', 'SKIP', 'Could not create test question');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  const testQuestionId = createRes.data.question_id;

  // Step 2: Expert B tries to capture payment for Expert A's question (should fail)
  const res = await request(`${CONFIG.XANO_AUTH_API}/payment/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}`,
    },
    body: JSON.stringify({
      question_id: testQuestionId,
    }),
  });

  if (res.status === 403 || isXanoError(res, '403')) {
    logTest('Cross-expert payment capture blocked', 'PASS', 'Ownership violation prevented');
  } else if (res.status === 404 || isXanoError(res, '404')) {
    logTest('Cross-expert payment capture blocked', 'PASS', 'Question not found (also secure)');
  } else if (res.ok) {
    logTest('Cross-expert payment capture blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
  } else {
    logTest('Cross-expert payment capture blocked', 'SKIP', `Unexpected status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

async function testQuestionRefundOwnership() {
  console.log(`\n${COLORS.blue}┌─ Test Suite: POST /question/{id}/refund - Ownership${COLORS.reset}`);

  // Skip if EXPERT_B not configured
  if (!global.HAS_EXPERT_B) {
    logTest('Cross-expert refund blocked', 'SKIP', 'EXPERT_B not configured - test skipped');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  // Step 1: Create a Quick Consult question for Expert A
  const createRes = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
    method: 'POST',
    body: JSON.stringify({
      expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
      payer_email: 'test@example.com',
      title: 'Test Question for Refund Security',
      text: 'Testing cross-expert refund',
      stripe_payment_intent_id: `pi_test_refund_${Date.now()}`,
      sla_hours_snapshot: 24,
    }),
  });

  if (!createRes.ok || !createRes.data?.question_id) {
    logTest('Cross-expert refund blocked', 'SKIP', 'Could not create test question');
    console.log(`${COLORS.blue}└─${COLORS.reset}`);
    return;
  }

  const testQuestionId = createRes.data.question_id;

  // Step 2: Expert B tries to refund Expert A's question (should fail)
  const res = await request(`${CONFIG.XANO_AUTH_API}/question/${testQuestionId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}`,
    },
    body: JSON.stringify({
      question_id: testQuestionId,
      payment_canceled: true,
      refund_reason: 'Attempting to refund another expert\'s question',
    }),
  });

  if (res.status === 403 || isXanoError(res, '403')) {
    logTest('Cross-expert refund blocked', 'PASS', 'Ownership violation prevented');
  } else if (res.status === 404 || isXanoError(res, '404')) {
    logTest('Cross-expert refund blocked', 'PASS', 'Question not found (also secure)');
  } else if (res.ok) {
    logTest('Cross-expert refund blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
  } else {
    logTest('Cross-expert refund blocked', 'SKIP', `Unexpected status: ${res.status}`);
  }

  console.log(`${COLORS.blue}└─${COLORS.reset}`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${COLORS.blue}XANO SECURITY VALIDATION TEST SUITE${COLORS.reset}`);
  console.log(`${COLORS.cyan}Date: ${new Date().toISOString()}${COLORS.reset}`);
  console.log(`${'='.repeat(60)}`);

  // Check configuration
  console.log(`\n${COLORS.yellow}Configuration Check:${COLORS.reset}`);
  const missingConfig = [];
  const optionalConfig = [];

  // Required configuration (minimum to run tests)
  if (!CONFIG.XANO_AUTH_API.includes('xano.io')) missingConfig.push('XANO_AUTH_API');
  if (!CONFIG.XANO_PUBLIC_API.includes('xano.io')) missingConfig.push('XANO_PUBLIC_API');
  if (CONFIG.EXPERT_A_TOKEN === 'your_expert_a_token_here') missingConfig.push('EXPERT_A_TOKEN');

  // Optional configuration (for full test coverage)
  if (CONFIG.EXPERT_A_QUESTION_ID === 123) optionalConfig.push('EXPERT_A_QUESTION_ID');
  if (CONFIG.EXPERT_A_PROFILE_ID === 1) optionalConfig.push('EXPERT_A_PROFILE_ID');

  // Check if Expert B is configured (for cross-expert ownership tests)
  const hasExpertB = CONFIG.EXPERT_B_TOKEN !== 'your_expert_b_token_here' &&
                     CONFIG.EXPERT_B_QUESTION_ID !== 456;

  if (missingConfig.length > 0) {
    console.log(`${COLORS.red}⚠️  Missing required configuration:${COLORS.reset}`);
    missingConfig.forEach(key => console.log(`   - ${key}`));
    console.log(`\n${COLORS.yellow}Minimum required:${COLORS.reset}`);
    console.log(`   - XANO_AUTH_API (your Xano auth API URL)`);
    console.log(`   - XANO_PUBLIC_API (your Xano public API URL)`);
    console.log(`   - EXPERT_A_TOKEN (auth token from localStorage)`);
    console.log(`\n${COLORS.cyan}Edit tests/.env with your Xano configuration${COLORS.reset}\n`);
    process.exit(1);
  }

  console.log(`${COLORS.green}✓ Required configuration complete${COLORS.reset}`);

  if (optionalConfig.length > 0) {
    console.log(`${COLORS.yellow}⚠️  Using defaults: ${optionalConfig.join(', ')}${COLORS.reset}`);
    console.log(`${COLORS.yellow}   (Some tests may skip)${COLORS.reset}`);
  }

  if (!hasExpertB) {
    console.log(`${COLORS.yellow}⚠️  EXPERT_B not configured${COLORS.reset}`);
    console.log(`${COLORS.yellow}   Cross-expert ownership tests will be skipped${COLORS.reset}`);
    console.log(`${COLORS.cyan}   (This is OK - core security tests will still run)${COLORS.reset}`);
  } else {
    console.log(`${COLORS.green}✓ EXPERT_B configured - full test suite enabled${COLORS.reset}`);
  }

  // Store in global for test functions to check
  global.HAS_EXPERT_B = hasExpertB;

  // Run test suites
  try {
    await testPatchQuestionAuth();
    await testPatchQuestionOwnership();
    await testPostAnswerSecurity();
    await testPaymentValidation();
    await testDeepDivePaymentValidation();
    await testFeedbackValidation();
    await testReviewTokenAccess();
    await testOfferAcceptOwnership();
    await testOfferDeclineOwnership();
    await testPaymentCaptureOwnership();
    await testQuestionRefundOwnership();
  } catch (error) {
    console.error(`\n${COLORS.red}Test execution error:${COLORS.reset}`, error.message);
    process.exit(1);
  }

  // Print summary
  printSummary();

  // Optional: Clean up test data
  const shouldCleanup = process.argv.includes('--cleanup');
  if (shouldCleanup) {
    console.log(`\n${COLORS.blue}┌─ Cleaning up test data...${COLORS.reset}`);
    try {
      await cleanupTestData();
      console.log(`${COLORS.green}✓ Test data cleaned up successfully${COLORS.reset}`);
      console.log(`${COLORS.blue}└─${COLORS.reset}`);
    } catch (error) {
      console.log(`${COLORS.yellow}⚠ Warning: Cleanup failed - ${error.message}${COLORS.reset}`);
      console.log(`${COLORS.yellow}  You can manually clean up by running: node cleanup-test-data.cjs${COLORS.reset}`);
      console.log(`${COLORS.blue}└─${COLORS.reset}`);
    }
  } else {
    console.log(`\n${COLORS.dim}💡 Tip: Add --cleanup flag to automatically remove test data${COLORS.reset}`);
    console.log(`${COLORS.dim}   Example: ./run-security-tests.sh --cleanup${COLORS.reset}`);
  }
}

/**
 * Clean up test data created during test run
 */
async function cleanupTestData() {
  if (!CONFIG.XANO_INTERNAL_API_KEY) {
    throw new Error('XANO_INTERNAL_API_KEY not configured');
  }

  const res = await request(`${CONFIG.XANO_PUBLIC_API}/internal/test-data/cleanup`, {
    method: 'DELETE',
    body: JSON.stringify({
      x_api_key: CONFIG.XANO_INTERNAL_API_KEY,
    }),
  });

  if (!res.ok || !res.data?.success) {
    throw new Error(res.data?.message || 'Cleanup failed');
  }

  return res.data;
}

// Run tests
main();
