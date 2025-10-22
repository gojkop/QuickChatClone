# Two-Tier Question Model - Database Migration Plan

**Date:** October 21, 2025
**Status:** Planning Phase

## Overview

This document outlines the database schema changes needed to implement the two-tier question pricing system.

---

## Current Schema Analysis

### expert_profile (existing fields)
- `id` (int, auto-increment) - Primary key
- `user_id` (int) - Foreign key to users
- `handle` (text, unique) - Public URL handle
- `bio` (text) - Biography
- **`price_cents` (int)** - Current single-price field
- `currency` (text) - Currency code (USD, EUR, etc.)
- **`sla_hours` (int)** - Current single SLA field
- `status` (text) - 'SET', 'DRAFT', etc.
- `public` (boolean) - Profile visibility
- `avatar_url` (text) - Profile picture URL
- `professional_title` (text)
- `tagline` (text)
- `accepting_questions` (boolean)
- `charity_percentage` (int)
- `selected_charity` (text)
- `expertise` (json) - Array of expertise tags
- `socials` (json) - Social media links

### question (existing fields)
- `id` (int, auto-increment) - Primary key
- `expert_profile_id` (int) - Foreign key to expert_profile
- `payer_email` (text) - Asker's email
- `payer_first_name` (text) - Asker's first name
- `payer_last_name` (text) - Asker's last name
- **`price_cents` (int)** - Current payment amount field
- `currency` (text) - Currency code
- **`status` (text)** - Current values: 'draft', 'paid', 'answered', 'refunded'
- **`sla_hours_snapshot` (int)** - SLA snapshot at submission
- `title` (text) - Question title
- `text` (text) - Question details
- `attachments` (text) - JSON string of attachments
- `media_asset_id` (int) - Foreign key to media_assets
- `hidden` (boolean) - Hidden from expert's queue
- `created_at` (timestamp)
- `answered_at` (timestamp)
- `paid_at` (timestamp)
- **`checkout_session_id` (text)** - Stripe session (current)
- **`payment_intent_id` (text)** - Stripe payment intent (current)

### Payment Table Status
**Does NOT exist yet** - Currently using `checkout_session_id` and `payment_intent_id` fields in `question` table.

---

## Required Schema Changes

### 1. expert_profile Table - Add Tier Configuration Fields

#### Quick Consult (Tier 1) Fields
```sql
ALTER TABLE expert_profile ADD COLUMN tier1_enabled BOOLEAN DEFAULT true;
ALTER TABLE expert_profile ADD COLUMN tier1_price_cents INTEGER DEFAULT 0;
ALTER TABLE expert_profile ADD COLUMN tier1_sla_hours INTEGER DEFAULT 24;
ALTER TABLE expert_profile ADD COLUMN tier1_description TEXT DEFAULT '';
```

**Default Values:**
- `tier1_enabled = true` - Enable Quick Consult by default for all experts
- `tier1_price_cents = 0` - Will be set from existing `price_cents` in migration
- `tier1_sla_hours = 24` - Will be set from existing `sla_hours` in migration
- `tier1_description = ''` - Empty initially, experts can customize

#### Deep Dive (Tier 2) Fields
```sql
ALTER TABLE expert_profile ADD COLUMN tier2_enabled BOOLEAN DEFAULT false;
ALTER TABLE expert_profile ADD COLUMN tier2_pricing_mode TEXT DEFAULT 'asker_proposes';
ALTER TABLE expert_profile ADD COLUMN tier2_min_price_cents INTEGER DEFAULT 0;
ALTER TABLE expert_profile ADD COLUMN tier2_max_price_cents INTEGER DEFAULT 0;
ALTER TABLE expert_profile ADD COLUMN tier2_auto_decline_below_cents INTEGER NULL;
ALTER TABLE expert_profile ADD COLUMN tier2_sla_hours INTEGER DEFAULT 48;
ALTER TABLE expert_profile ADD COLUMN tier2_description TEXT DEFAULT '';
```

**Default Values:**
- `tier2_enabled = false` - Disabled by default (opt-in feature)
- `tier2_pricing_mode = 'asker_proposes'` - Fixed mode for MVP
- `tier2_min_price_cents = 0` - No minimum by default
- `tier2_max_price_cents = 0` - No maximum by default
- `tier2_auto_decline_below_cents = NULL` - Optional auto-decline threshold
- `tier2_sla_hours = 48` - Standard 48h SLA for Deep Dive
- `tier2_description = ''` - Empty initially, experts can customize

#### Legacy Field Handling
**Decision:** Keep existing `price_cents` and `sla_hours` fields for backward compatibility
- These will be used as fallback if tiers not configured
- Will be migrated to `tier1_*` fields for all existing experts

---

### 2. question Table - Add Tier and Pricing Status Fields

#### Question Tier and Pricing Fields
```sql
ALTER TABLE question ADD COLUMN question_tier TEXT DEFAULT 'quick_consult';
ALTER TABLE question ADD COLUMN pricing_status TEXT DEFAULT 'paid';
ALTER TABLE question ADD COLUMN proposed_price_cents INTEGER NULL;
ALTER TABLE question ADD COLUMN final_price_cents INTEGER DEFAULT 0;
```

**Values:**
- `question_tier` - Enum: 'quick_consult' | 'deep_dive'
  - Default: 'quick_consult' (for backward compatibility)
- `pricing_status` - Enum: 'paid' | 'offer_pending' | 'offer_accepted' | 'offer_declined' | 'offer_expired' | 'completed' | 'sla_missed'
  - Default: 'paid' (for backward compatibility)
- `proposed_price_cents` - Integer, nullable (only for Deep Dive offers)
- `final_price_cents` - Integer (actual price paid, defaults to 0)

#### SLA Tracking Fields
```sql
ALTER TABLE question ADD COLUMN sla_start_time TIMESTAMP NULL;
ALTER TABLE question ADD COLUMN sla_deadline TIMESTAMP NULL;
ALTER TABLE question ADD COLUMN sla_missed BOOLEAN DEFAULT false;
```

**Values:**
- `sla_start_time` - When SLA countdown started (NULL for pending offers)
- `sla_deadline` - When answer is due (calculated: sla_start_time + sla_hours)
- `sla_missed` - Whether expert missed the SLA deadline

#### Deep Dive Offer Fields
```sql
ALTER TABLE question ADD COLUMN offer_expires_at TIMESTAMP NULL;
ALTER TABLE question ADD COLUMN decline_reason TEXT NULL;
ALTER TABLE question ADD COLUMN expert_reviewed_at TIMESTAMP NULL;
ALTER TABLE question ADD COLUMN asker_message TEXT NULL;
```

**Values:**
- `offer_expires_at` - When Deep Dive offer expires (24h from submission)
- `decline_reason` - Expert's message when declining offer
- `expert_reviewed_at` - When expert accepted/declined offer
- `asker_message` - Asker's message to expert with offer (e.g., "Why this price?")

#### Legacy Field Updates
- `status` field will remain for backward compatibility
- New `pricing_status` field will be the source of truth for two-tier system
- Migration will map old `status` values to new `pricing_status` values

---

### 3. Create New payment Table

**Decision:** Create separate payment table for better payment tracking.

```sql
CREATE TABLE payment (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  question_id INTEGER NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'authorized',
  question_type TEXT NOT NULL,
  authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  captured_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  capture_attempted BOOLEAN DEFAULT false,
  capture_failed BOOLEAN DEFAULT false,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
  INDEX idx_status (status)
);
```

**Field Descriptions:**
- `id` - Primary key
- `question_id` - Foreign key to question
- `stripe_payment_intent_id` - Stripe PaymentIntent ID
- `amount_cents` - Payment amount in cents
- `currency` - Currency code (USD, EUR, etc.)
- `status` - Enum: 'authorized' | 'accepted' | 'captured' | 'refunded' | 'failed'
- `question_type` - Enum: 'quick_consult' | 'deep_dive'
- `authorized_at` - When payment was authorized (funds held)
- `accepted_at` - When Deep Dive offer was accepted (NULL for Quick Consult)
- `captured_at` - When payment was captured (after answer)
- `refunded_at` - When payment was refunded (if declined/expired/SLA missed)
- `capture_attempted` - Whether capture was attempted
- `capture_failed` - Whether capture failed
- `retry_count` - Number of capture retries (for failed captures)
- `error_message` - Error message if payment failed

**Payment State Machine:**
```
Quick Consult:
  authorized → captured (on answer)
       ↓
   refunded (on SLA miss)

Deep Dive:
  authorized → accepted (on expert accept) → captured (on answer)
       ↓           ↓
   refunded    refunded (on SLA miss)
   (decline/expire)
```

**Alternative Approach (if table creation not possible):**
Add payment tracking fields to existing `question` table instead.

---

## Data Migration Strategy

### Step 1: Migrate Existing Experts to Tier 1

**Goal:** Convert all existing expert profiles to use Quick Consult (Tier 1) by default.

```sql
-- Pseudocode for Xano function or migration script
UPDATE expert_profile
SET
  tier1_enabled = true,
  tier1_price_cents = price_cents,
  tier1_sla_hours = sla_hours,
  tier1_description = 'Focused advice on your questions',
  tier2_enabled = false
WHERE tier1_price_cents IS NULL;
```

**Actions:**
- Copy existing `price_cents` → `tier1_price_cents`
- Copy existing `sla_hours` → `tier1_sla_hours`
- Set default description for Tier 1
- Disable Tier 2 by default (opt-in feature)

### Step 2: Migrate Existing Questions

**Goal:** Mark all existing questions as 'quick_consult' with 'paid' status.

```sql
-- Pseudocode for Xano function or migration script
UPDATE question
SET
  question_tier = 'quick_consult',
  pricing_status = CASE
    WHEN status = 'paid' THEN 'completed'
    WHEN status = 'answered' THEN 'completed'
    WHEN status = 'draft' THEN 'draft'
    WHEN status = 'refunded' THEN 'offer_declined'
    ELSE 'paid'
  END,
  final_price_cents = price_cents,
  sla_start_time = created_at,
  sla_deadline = DATE_ADD(created_at, INTERVAL sla_hours_snapshot HOUR),
  sla_missed = CASE
    WHEN status = 'answered' THEN false
    WHEN answered_at IS NULL AND NOW() > DATE_ADD(created_at, INTERVAL sla_hours_snapshot HOUR) THEN true
    ELSE false
  END
WHERE question_tier IS NULL;
```

**Status Mapping:**
- Old: 'paid', 'answered' → New: 'completed'
- Old: 'draft' → New: 'draft'
- Old: 'refunded' → New: 'offer_declined' (best approximation)

### Step 3: Create Payment Records for Existing Questions

**Goal:** Create payment table records for all existing paid questions.

```sql
-- Pseudocode for Xano function or migration script
INSERT INTO payment (
  question_id,
  stripe_payment_intent_id,
  amount_cents,
  currency,
  status,
  question_type,
  authorized_at,
  captured_at
)
SELECT
  id,
  COALESCE(payment_intent_id, CONCAT('migrated_', id)),
  price_cents,
  currency,
  CASE
    WHEN status IN ('paid', 'answered') THEN 'captured'
    WHEN status = 'refunded' THEN 'refunded'
    ELSE 'authorized'
  END,
  'quick_consult',
  created_at,
  answered_at
FROM question
WHERE status IN ('paid', 'answered', 'refunded')
  AND payment_intent_id IS NOT NULL
  OR status IN ('paid', 'answered', 'refunded');
```

### Step 4: Send Migration Notification Email

**Action:** Send email to all experts informing them of:
- New Deep Dive feature available
- How to configure pricing tiers
- Link to settings page

---

## Migration Risks & Mitigation

### Risk 1: Data Loss
**Mitigation:**
- Backup database before migration
- Run migration in staging environment first
- Test rollback procedure

### Risk 2: Downtime
**Mitigation:**
- Run ALTER TABLE commands during low-traffic hours
- Use Xano's database migration tools if available
- Monitor for errors during migration

### Risk 3: Backward Compatibility
**Mitigation:**
- Keep existing `price_cents`, `sla_hours`, `status` fields
- Default all new fields to safe values
- Update existing code to check tier fields first, fall back to legacy

### Risk 4: Payment Intent ID Missing
**Mitigation:**
- Some old questions may not have `payment_intent_id`
- Use COALESCE to generate fallback IDs: `migrated_{question_id}`
- Mark these in payment table for manual review if needed

---

## Implementation Checklist

### Database Schema Changes
- [ ] Add tier configuration fields to `expert_profile` table
- [ ] Add tier and pricing fields to `question` table
- [ ] Create new `payment` table (or add payment tracking fields to `question`)
- [ ] Add indexes for performance (pricing_status, question_tier, offer_expires_at)

### Data Migration
- [ ] Backup production database
- [ ] Test migration in development environment
- [ ] Run migration in staging environment
- [ ] Verify data integrity after migration
- [ ] Run migration in production
- [ ] Verify all experts converted correctly
- [ ] Send notification emails to experts

### Code Updates
- [ ] Update Xano endpoints to use new tier fields
- [ ] Update frontend to read tier configuration
- [ ] Update question submission logic to handle tiers
- [ ] Test backward compatibility with old data

---

## Rollback Plan

If migration fails:

1. **Restore database from backup**
2. **Revert code changes** (if any were deployed)
3. **Investigate failure** using logs
4. **Fix issues** in staging environment
5. **Re-test** migration before retry

---

## Timeline Estimate

- **Planning & Review:** 1 day (completed)
- **Staging Migration:** 1 day
- **Testing & Validation:** 2 days
- **Production Migration:** 1 day
- **Monitoring & Fixes:** 2 days

**Total:** ~1 week

---

## Next Steps

1. Review this migration plan with team
2. Set up staging environment for testing
3. Create Xano migration scripts/functions
4. Test migration with sample data
5. Schedule production migration window
6. Prepare rollback procedure
7. Execute migration

---

## Questions for Review

1. **Should we keep legacy `price_cents` and `sla_hours` fields?**
   - Recommendation: Yes, for backward compatibility

2. **Should we create separate `payment` table or extend `question` table?**
   - Recommendation: Separate table for cleaner separation of concerns

3. **Should we migrate existing questions or only apply tiers to new questions?**
   - Recommendation: Migrate all questions for data consistency

4. **Should we enable Deep Dive for all experts or make it opt-in?**
   - Recommendation: Opt-in (tier2_enabled = false by default)

5. **Should we send migration notification emails immediately or wait?**
   - Recommendation: Send after production migration succeeds

---

**Document Version:** 1.0
**Last Updated:** October 21, 2025
**Status:** Ready for Review
