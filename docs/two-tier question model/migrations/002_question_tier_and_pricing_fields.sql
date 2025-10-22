-- Migration: 002_question_tier_and_pricing_fields.sql
-- Description: Add tier, pricing status, and offer fields to question table
-- Date: October 21, 2025
-- Status: PENDING
-- Depends on: 001_expert_profile_tier_fields.sql

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
-- QUESTION TIER AND PRICING FIELDS
-- ==================================================

-- Question tier (Quick Consult or Deep Dive)
ALTER TABLE question
ADD COLUMN question_tier TEXT
DEFAULT 'quick_consult'
COMMENT 'Type of question: "quick_consult" (fixed price) or "deep_dive" (negotiated price)';

-- Pricing status (state machine for payment flow)
ALTER TABLE question
ADD COLUMN pricing_status TEXT
DEFAULT 'paid'
COMMENT 'Payment status: "paid", "offer_pending", "offer_accepted", "offer_declined", "offer_expired", "completed", "sla_missed"';

-- Proposed price for Deep Dive offers
ALTER TABLE question
ADD COLUMN proposed_price_cents INTEGER
DEFAULT NULL
COMMENT 'Asker proposed price for Deep Dive offers (NULL for Quick Consult)';

-- Final price paid
ALTER TABLE question
ADD COLUMN final_price_cents INTEGER
DEFAULT 0
COMMENT 'Actual price paid (copied from tier config or proposed_price_cents after acceptance)';

-- Asker's message to expert (Deep Dive offers)
ALTER TABLE question
ADD COLUMN asker_message TEXT
DEFAULT NULL
COMMENT 'Asker message to expert explaining their offer price (Deep Dive only)';

-- ==================================================
-- SLA TRACKING FIELDS
-- ==================================================

-- SLA start time (when countdown begins)
ALTER TABLE question
ADD COLUMN sla_start_time TIMESTAMP
DEFAULT NULL
COMMENT 'When SLA countdown started (immediately for Quick Consult, after acceptance for Deep Dive)';

-- SLA deadline (when answer is due)
ALTER TABLE question
ADD COLUMN sla_deadline TIMESTAMP
DEFAULT NULL
COMMENT 'When answer must be delivered (calculated: sla_start_time + sla_hours)';

-- SLA missed flag
ALTER TABLE question
ADD COLUMN sla_missed BOOLEAN
DEFAULT false
COMMENT 'Whether expert missed the SLA deadline';

-- ==================================================
-- DEEP DIVE OFFER TRACKING FIELDS
-- ==================================================

-- Offer expiration time (24h from submission)
ALTER TABLE question
ADD COLUMN offer_expires_at TIMESTAMP
DEFAULT NULL
COMMENT 'When Deep Dive offer expires if expert does not respond (24h from submission)';

-- Expert's decline reason
ALTER TABLE question
ADD COLUMN decline_reason TEXT
DEFAULT NULL
COMMENT 'Expert message when declining Deep Dive offer';

-- Expert review timestamp
ALTER TABLE question
ADD COLUMN expert_reviewed_at TIMESTAMP
DEFAULT NULL
COMMENT 'When expert accepted or declined Deep Dive offer';

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

-- Index for filtering by tier
CREATE INDEX idx_question_question_tier ON question(question_tier);

-- Index for filtering by pricing status
CREATE INDEX idx_question_pricing_status ON question(pricing_status);

-- Index for finding pending offers
CREATE INDEX idx_question_offer_pending ON question(pricing_status, expert_profile_id, offer_expires_at);

-- Index for SLA enforcement cron job
CREATE INDEX idx_question_sla_deadline ON question(sla_deadline, pricing_status, sla_missed);

-- Index for completed questions
CREATE INDEX idx_question_completed ON question(pricing_status, answered_at);

-- ==================================================
-- DATA MIGRATION (Run after adding columns)
-- ==================================================

-- Migrate existing questions to Quick Consult tier with 'completed' status
UPDATE question
SET
  question_tier = 'quick_consult',
  pricing_status = CASE
    WHEN status = 'answered' THEN 'completed'
    WHEN status = 'paid' AND answered_at IS NOT NULL THEN 'completed'
    WHEN status = 'paid' AND answered_at IS NULL THEN 'paid'
    WHEN status = 'draft' THEN 'draft'
    WHEN status = 'refunded' THEN 'sla_missed'  -- Approximation
    ELSE 'paid'
  END,
  final_price_cents = COALESCE(price_cents, 0),
  sla_start_time = created_at,
  sla_deadline = TIMESTAMPADD(HOUR, COALESCE(sla_hours_snapshot, 24), created_at),
  sla_missed = CASE
    -- If answered, SLA was met
    WHEN answered_at IS NOT NULL THEN false
    -- If not answered and deadline passed, SLA was missed
    WHEN answered_at IS NULL AND NOW() > TIMESTAMPADD(HOUR, COALESCE(sla_hours_snapshot, 24), created_at) THEN true
    ELSE false
  END
WHERE question_tier IS NULL;

-- ==================================================
-- VALIDATION QUERIES (Run after migration)
-- ==================================================

-- Check that all questions have a tier assigned
SELECT COUNT(*) as questions_without_tier
FROM question
WHERE question_tier IS NULL OR question_tier = '';

-- Expected: 0 (all questions should have tier assigned)

-- Check tier distribution
SELECT
  question_tier,
  pricing_status,
  COUNT(*) as count
FROM question
GROUP BY question_tier, pricing_status
ORDER BY question_tier, pricing_status;

-- Expected: All existing questions should be 'quick_consult', various pricing_status

-- Check SLA accuracy
SELECT
  COUNT(*) as total_questions,
  SUM(CASE WHEN sla_missed = true THEN 1 ELSE 0 END) as sla_missed_count,
  SUM(CASE WHEN sla_missed = false THEN 1 ELSE 0 END) as sla_met_count,
  SUM(CASE WHEN answered_at IS NOT NULL AND sla_missed = false THEN 1 ELSE 0 END) as answered_on_time,
  SUM(CASE WHEN answered_at IS NULL AND sla_missed = true THEN 1 ELSE 0 END) as unanswered_overdue
FROM question;

-- Check for data consistency
SELECT
  COUNT(*) as pending_offers_without_expiry
FROM question
WHERE pricing_status = 'offer_pending'
  AND offer_expires_at IS NULL;

-- Expected: 0 (all pending offers should have expiry time)

-- ==================================================
-- ENUM VALUES REFERENCE
-- ==================================================

/*
question_tier values:
  - 'quick_consult' - Fixed price, immediate payment
  - 'deep_dive'     - Asker proposes price, expert accepts/declines

pricing_status values (state machine):
  - 'draft'           - Question not yet submitted
  - 'paid'            - Quick Consult paid, awaiting answer
  - 'offer_pending'   - Deep Dive offer submitted, awaiting expert review
  - 'offer_accepted'  - Deep Dive offer accepted, awaiting answer
  - 'offer_declined'  - Deep Dive offer declined by expert (refunded)
  - 'offer_expired'   - Deep Dive offer expired after 24h (refunded)
  - 'completed'       - Question answered, payment captured
  - 'sla_missed'      - Expert missed SLA deadline (refunded)

State transitions:

Quick Consult:
  draft → paid → completed
           ↓
      sla_missed

Deep Dive:
  draft → offer_pending → offer_accepted → completed
              ↓               ↓
       offer_declined    sla_missed
              ↓
       offer_expired
*/

-- ==================================================
-- ROLLBACK (if needed)
-- ==================================================

-- To rollback this migration, run:
/*
ALTER TABLE question DROP COLUMN question_tier;
ALTER TABLE question DROP COLUMN pricing_status;
ALTER TABLE question DROP COLUMN proposed_price_cents;
ALTER TABLE question DROP COLUMN final_price_cents;
ALTER TABLE question DROP COLUMN asker_message;
ALTER TABLE question DROP COLUMN sla_start_time;
ALTER TABLE question DROP COLUMN sla_deadline;
ALTER TABLE question DROP COLUMN sla_missed;
ALTER TABLE question DROP COLUMN offer_expires_at;
ALTER TABLE question DROP COLUMN decline_reason;
ALTER TABLE question DROP COLUMN expert_reviewed_at;
DROP INDEX idx_question_question_tier;
DROP INDEX idx_question_pricing_status;
DROP INDEX idx_question_offer_pending;
DROP INDEX idx_question_sla_deadline;
DROP INDEX idx_question_completed;
*/

-- ==================================================
-- NOTES FOR XANO IMPLEMENTATION
-- ==================================================

/*
Xano Implementation Steps:

1. Go to Xano Dashboard → Database → question table
2. Add each field with the following configurations:

   question_tier:
   - Type: Text
   - Default Value: "quick_consult"
   - Required: Yes

   pricing_status:
   - Type: Text
   - Default Value: "paid"
   - Required: Yes

   proposed_price_cents:
   - Type: Number (Integer)
   - Default Value: NULL
   - Allow NULL: Yes

   final_price_cents:
   - Type: Number (Integer)
   - Default Value: 0
   - Required: Yes

   asker_message:
   - Type: Text (Long Text)
   - Default Value: NULL
   - Allow NULL: Yes

   sla_start_time:
   - Type: Timestamp
   - Default Value: NULL
   - Allow NULL: Yes

   sla_deadline:
   - Type: Timestamp
   - Default Value: NULL
   - Allow NULL: Yes

   sla_missed:
   - Type: Boolean
   - Default Value: false
   - Required: Yes

   offer_expires_at:
   - Type: Timestamp
   - Default Value: NULL
   - Allow NULL: Yes

   decline_reason:
   - Type: Text (Long Text)
   - Default Value: NULL
   - Allow NULL: Yes

   expert_reviewed_at:
   - Type: Timestamp
   - Default Value: NULL
   - Allow NULL: Yes

3. After adding all fields, run the UPDATE migration query using Xano's "Run Query" tool
4. Create indexes (if Xano supports custom indexes)
5. Run validation queries to verify data integrity
6. Test question submission endpoints before deploying

Important Notes:
- The existing 'status' field will remain for backward compatibility
- New code should use 'pricing_status' as source of truth
- Migration maps old 'status' values to new 'pricing_status' values
- Existing 'price_cents' field remains unchanged (legacy support)
- New 'final_price_cents' tracks actual price paid in two-tier system
*/
