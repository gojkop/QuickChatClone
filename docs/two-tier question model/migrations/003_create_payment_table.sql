-- Migration: 003_create_payment_table.sql
-- Description: Create payment table for tracking Stripe payment lifecycle
-- Date: October 21, 2025
-- Status: PENDING
-- Depends on: 002_question_tier_and_pricing_fields.sql

-- ==================================================
-- ⚠️  IMPORTANT: XANO IMPLEMENTATION
-- ==================================================
--
-- This SQL file is for REFERENCE ONLY.
--
-- Xano's visual interface does NOT support direct SQL execution
-- or the ?? operator in field mappings.
--
-- For ACTUAL implementation in Xano:
-- 1. See: ../XANO-MIGRATION-CHECKLIST.md (Step-by-step guide)
-- 2. See: ../XANO-LAMBDA-GUIDE.md (Lambda function examples)
--
-- You must use Xano Functions with Lambda calculations
-- to populate fields during migration.
--
-- ==================================================

-- ==================================================
-- CREATE PAYMENT TABLE
-- ==================================================

CREATE TABLE payment (
  -- Primary key
  id INTEGER AUTO_INCREMENT PRIMARY KEY,

  -- Foreign key to question
  question_id INTEGER NOT NULL,

  -- Stripe payment intent ID
  stripe_payment_intent_id TEXT NOT NULL,

  -- Payment amount
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Payment status (state machine)
  status TEXT DEFAULT 'authorized'
    COMMENT 'Payment status: "authorized", "accepted", "captured", "refunded", "failed"',

  -- Question type (for tracking)
  question_type TEXT NOT NULL
    COMMENT 'Type: "quick_consult" or "deep_dive"',

  -- ==================================================
  -- PAYMENT LIFECYCLE TIMESTAMPS
  -- ==================================================

  -- When payment was authorized (funds held)
  authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- When Deep Dive offer was accepted (NULL for Quick Consult)
  accepted_at TIMESTAMP NULL,

  -- When payment was captured (funds released to expert)
  captured_at TIMESTAMP NULL,

  -- When payment was refunded (if declined/expired/SLA missed)
  refunded_at TIMESTAMP NULL,

  -- ==================================================
  -- CAPTURE RETRY TRACKING
  -- ==================================================

  -- Whether capture was attempted
  capture_attempted BOOLEAN DEFAULT false,

  -- Whether capture failed
  capture_failed BOOLEAN DEFAULT false,

  -- Number of capture retries (max 3)
  retry_count INTEGER DEFAULT 0,

  -- Error message if payment failed
  error_message TEXT NULL,

  -- ==================================================
  -- AUDIT TIMESTAMPS
  -- ==================================================

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- ==================================================
  -- FOREIGN KEY CONSTRAINTS
  -- ==================================================

  FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,

  -- ==================================================
  -- INDEXES
  -- ==================================================

  INDEX idx_payment_question_id (question_id),
  INDEX idx_payment_stripe_intent (stripe_payment_intent_id),
  INDEX idx_payment_status (status),
  INDEX idx_payment_capture_retry (status, capture_failed, retry_count),
  INDEX idx_payment_created_at (created_at)
)
COMMENT 'Tracks Stripe payment lifecycle for questions (authorization, capture, refund)';

-- ==================================================
-- DATA MIGRATION (Run after creating table)
-- ==================================================

-- Migrate existing questions with payment_intent_id to payment table
INSERT INTO payment (
  question_id,
  stripe_payment_intent_id,
  amount_cents,
  currency,
  status,
  question_type,
  authorized_at,
  accepted_at,
  captured_at,
  refunded_at,
  capture_attempted,
  capture_failed,
  retry_count
)
SELECT
  q.id,
  -- Use existing payment_intent_id or generate fallback ID
  COALESCE(q.payment_intent_id, CONCAT('migrated_', q.id)),
  -- Amount
  COALESCE(q.final_price_cents, q.price_cents, 0),
  -- Currency
  COALESCE(q.currency, 'USD'),
  -- Map pricing_status to payment status
  CASE
    WHEN q.pricing_status = 'completed' THEN 'captured'
    WHEN q.pricing_status IN ('offer_declined', 'offer_expired', 'sla_missed') THEN 'refunded'
    WHEN q.pricing_status = 'offer_accepted' THEN 'accepted'
    WHEN q.pricing_status IN ('paid', 'offer_pending') THEN 'authorized'
    ELSE 'authorized'
  END,
  -- Question type
  COALESCE(q.question_tier, 'quick_consult'),
  -- Authorized timestamp
  COALESCE(q.paid_at, q.created_at),
  -- Accepted timestamp (Deep Dive only)
  CASE
    WHEN q.question_tier = 'deep_dive' AND q.expert_reviewed_at IS NOT NULL
      THEN q.expert_reviewed_at
    ELSE NULL
  END,
  -- Captured timestamp
  CASE
    WHEN q.pricing_status = 'completed' THEN q.answered_at
    ELSE NULL
  END,
  -- Refunded timestamp (estimate if missing)
  CASE
    WHEN q.pricing_status IN ('offer_declined', 'offer_expired', 'sla_missed')
      THEN COALESCE(q.expert_reviewed_at, q.updated_at)
    ELSE NULL
  END,
  -- Capture attempted (if answered)
  CASE WHEN q.answered_at IS NOT NULL THEN true ELSE false END,
  -- Capture failed (false for migrated data)
  false,
  -- Retry count (0 for migrated data)
  0
FROM question q
WHERE
  -- Only migrate questions with payment data
  (q.payment_intent_id IS NOT NULL OR q.status IN ('paid', 'answered', 'refunded'))
  AND q.pricing_status IS NOT NULL
  -- Avoid duplicates
  AND NOT EXISTS (
    SELECT 1 FROM payment p WHERE p.question_id = q.id
  );

-- ==================================================
-- VALIDATION QUERIES (Run after migration)
-- ==================================================

-- Check total payments created
SELECT
  COUNT(*) as total_payments,
  SUM(CASE WHEN status = 'authorized' THEN 1 ELSE 0 END) as authorized,
  SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
  SUM(CASE WHEN status = 'captured' THEN 1 ELSE 0 END) as captured,
  SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM payment;

-- Check payment type distribution
SELECT
  question_type,
  status,
  COUNT(*) as count,
  SUM(amount_cents) / 100.0 as total_amount
FROM payment
GROUP BY question_type, status
ORDER BY question_type, status;

-- Check for questions without payment records (should be drafts only)
SELECT
  q.id,
  q.status,
  q.pricing_status,
  q.question_tier,
  q.price_cents
FROM question q
LEFT JOIN payment p ON p.question_id = q.id
WHERE p.id IS NULL
  AND q.status != 'draft'
  AND q.pricing_status != 'draft';

-- Expected: 0 rows (all non-draft questions should have payment records)

-- Check for duplicate payment records
SELECT
  question_id,
  COUNT(*) as payment_count
FROM payment
GROUP BY question_id
HAVING COUNT(*) > 1;

-- Expected: 0 rows (each question should have exactly one payment record)

-- Check amount consistency
SELECT
  q.id,
  q.price_cents as question_price,
  q.final_price_cents,
  p.amount_cents as payment_amount,
  ABS(COALESCE(q.final_price_cents, q.price_cents) - p.amount_cents) as difference
FROM question q
INNER JOIN payment p ON p.question_id = q.id
WHERE ABS(COALESCE(q.final_price_cents, q.price_cents) - p.amount_cents) > 0;

-- Expected: 0 rows or minimal differences (amounts should match)

-- ==================================================
-- PAYMENT STATE MACHINE REFERENCE
-- ==================================================

/*
Payment Status Flow:

Quick Consult:
  authorized → captured (when answer submitted)
       ↓
   refunded (if SLA missed)

Deep Dive:
  authorized → accepted (when expert accepts offer) → captured (when answer submitted)
       ↓           ↓
   refunded    refunded (if SLA missed)
   (declined/
    expired)

Payment Status Values:
  - 'authorized' - Funds held on card, not yet captured
  - 'accepted'   - Deep Dive offer accepted, awaiting answer
  - 'captured'   - Funds released to expert after answer
  - 'refunded'   - Funds returned to asker (declined/expired/SLA missed)
  - 'failed'     - Payment processing failed (requires manual intervention)

Capture Retry Logic:
  - If capture fails, retry_count increments
  - Maximum 3 retries via cron job
  - After 3 failures, status = 'failed', alert admin
*/

-- ==================================================
-- CLEANUP OLD FIELDS (OPTIONAL - DO LATER)
-- ==================================================

-- After verifying payment table is working correctly, you may optionally
-- remove redundant fields from question table:
/*
ALTER TABLE question DROP COLUMN checkout_session_id;
ALTER TABLE question DROP COLUMN payment_intent_id;
*/

-- NOTE: Keep these fields for now during transition period!

-- ==================================================
-- ROLLBACK (if needed)
-- ==================================================

-- To rollback this migration, run:
/*
DROP TABLE payment;
*/

-- ==================================================
-- NOTES FOR XANO IMPLEMENTATION
-- ==================================================

/*
Xano Implementation Steps:

1. Go to Xano Dashboard → Database → "Create New Table"
2. Name: "payment"
3. Add each field with the following configurations:

   id:
   - Type: Number (Integer)
   - Auto-increment: Yes
   - Primary Key: Yes

   question_id:
   - Type: Number (Integer)
   - Required: Yes
   - Foreign Key: question(id) ON DELETE CASCADE

   stripe_payment_intent_id:
   - Type: Text
   - Required: Yes

   amount_cents:
   - Type: Number (Integer)
   - Required: Yes

   currency:
   - Type: Text
   - Default Value: "USD"
   - Required: Yes

   status:
   - Type: Text
   - Default Value: "authorized"
   - Required: Yes
   - Note: Values - "authorized", "accepted", "captured", "refunded", "failed"

   question_type:
   - Type: Text
   - Required: Yes
   - Note: Values - "quick_consult", "deep_dive"

   authorized_at:
   - Type: Timestamp
   - Default Value: CURRENT_TIMESTAMP
   - Required: Yes

   accepted_at:
   - Type: Timestamp
   - Allow NULL: Yes

   captured_at:
   - Type: Timestamp
   - Allow NULL: Yes

   refunded_at:
   - Type: Timestamp
   - Allow NULL: Yes

   capture_attempted:
   - Type: Boolean
   - Default Value: false
   - Required: Yes

   capture_failed:
   - Type: Boolean
   - Default Value: false
   - Required: Yes

   retry_count:
   - Type: Number (Integer)
   - Default Value: 0
   - Required: Yes

   error_message:
   - Type: Text (Long Text)
   - Allow NULL: Yes

   created_at:
   - Type: Timestamp
   - Default Value: CURRENT_TIMESTAMP
   - Required: Yes

   updated_at:
   - Type: Timestamp
   - Default Value: CURRENT_TIMESTAMP
   - On Update: CURRENT_TIMESTAMP
   - Required: Yes

4. After creating the table, run the INSERT migration query to populate with existing data
5. Create indexes (if Xano supports custom indexes)
6. Run validation queries to verify data integrity
7. Test payment endpoints before deploying

Important Notes:
- Keep existing checkout_session_id and payment_intent_id fields in question table during transition
- New payment flows should use payment table
- Migration creates payment records for all existing paid/answered questions
- Questions without payment_intent_id get fallback ID: "migrated_{question_id}"
*/
