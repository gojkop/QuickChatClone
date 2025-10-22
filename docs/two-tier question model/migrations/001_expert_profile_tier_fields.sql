-- Migration: 001_expert_profile_tier_fields.sql
-- Description: Add tier configuration fields to expert_profile table
-- Date: October 21, 2025
-- Status: PENDING

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
-- QUICK CONSULT (TIER 1) FIELDS
-- ==================================================

-- Enable/disable Quick Consult tier
ALTER TABLE expert_profile
ADD COLUMN tier1_enabled BOOLEAN
DEFAULT true
COMMENT 'Whether Quick Consult tier is enabled for this expert';

-- Quick Consult pricing
ALTER TABLE expert_profile
ADD COLUMN tier1_price_cents INTEGER
DEFAULT 0
COMMENT 'Fixed price for Quick Consult in cents (e.g., 7500 = €75)';

-- Quick Consult SLA
ALTER TABLE expert_profile
ADD COLUMN tier1_sla_hours INTEGER
DEFAULT 24
COMMENT 'Response time SLA for Quick Consult in hours (e.g., 24 = 24h)';

-- Quick Consult description
ALTER TABLE expert_profile
ADD COLUMN tier1_description TEXT
DEFAULT ''
COMMENT 'Public description of Quick Consult offering (shown to askers)';

-- ==================================================
-- DEEP DIVE (TIER 2) FIELDS
-- ==================================================

-- Enable/disable Deep Dive tier
ALTER TABLE expert_profile
ADD COLUMN tier2_enabled BOOLEAN
DEFAULT false
COMMENT 'Whether Deep Dive tier is enabled for this expert (opt-in)';

-- Deep Dive pricing mode (fixed to "asker_proposes" for MVP)
ALTER TABLE expert_profile
ADD COLUMN tier2_pricing_mode TEXT
DEFAULT 'asker_proposes'
COMMENT 'Pricing mode: "asker_proposes" (only mode in MVP)';

-- Deep Dive price guidance (minimum)
ALTER TABLE expert_profile
ADD COLUMN tier2_min_price_cents INTEGER
DEFAULT 0
COMMENT 'Suggested minimum price for Deep Dive in cents (guidance for askers)';

-- Deep Dive price guidance (maximum)
ALTER TABLE expert_profile
ADD COLUMN tier2_max_price_cents INTEGER
DEFAULT 0
COMMENT 'Suggested maximum price for Deep Dive in cents (guidance for askers)';

-- Deep Dive auto-decline threshold (optional)
ALTER TABLE expert_profile
ADD COLUMN tier2_auto_decline_below_cents INTEGER
DEFAULT NULL
COMMENT 'Auto-decline offers below this amount (optional, NULL = manual review all offers)';

-- Deep Dive SLA
ALTER TABLE expert_profile
ADD COLUMN tier2_sla_hours INTEGER
DEFAULT 48
COMMENT 'Response time SLA for Deep Dive in hours (starts after offer acceptance)';

-- Deep Dive description
ALTER TABLE expert_profile
ADD COLUMN tier2_description TEXT
DEFAULT ''
COMMENT 'Public description of Deep Dive offering (shown to askers)';

-- ==================================================
-- INDEXES
-- ==================================================

-- Add indexes for tier filtering (if needed for queries)
CREATE INDEX idx_expert_profile_tier1_enabled ON expert_profile(tier1_enabled);
CREATE INDEX idx_expert_profile_tier2_enabled ON expert_profile(tier2_enabled);

-- ==================================================
-- DATA MIGRATION (Run after adding columns)
-- ==================================================

-- Migrate existing experts to Tier 1 (Quick Consult)
-- Copy existing price_cents to tier1_price_cents
-- Copy existing sla_hours to tier1_sla_hours
UPDATE expert_profile
SET
  tier1_enabled = true,
  tier1_price_cents = COALESCE(price_cents, 5000),  -- Default to $50 if NULL
  tier1_sla_hours = COALESCE(sla_hours, 24),        -- Default to 24h if NULL
  tier1_description = 'Focused advice on your questions',
  tier2_enabled = false                              -- Disable Deep Dive by default (opt-in)
WHERE tier1_price_cents IS NULL OR tier1_price_cents = 0;

-- ==================================================
-- VALIDATION QUERIES (Run after migration)
-- ==================================================

-- Check that all experts have tier1 configured
SELECT COUNT(*) as experts_without_tier1
FROM expert_profile
WHERE tier1_price_cents = 0 OR tier1_price_cents IS NULL;

-- Expected: 0 (all experts should have tier1 price set)

-- Check tier adoption
SELECT
  SUM(CASE WHEN tier1_enabled = true THEN 1 ELSE 0 END) as tier1_enabled_count,
  SUM(CASE WHEN tier2_enabled = true THEN 1 ELSE 0 END) as tier2_enabled_count,
  SUM(CASE WHEN tier1_enabled = true AND tier2_enabled = true THEN 1 ELSE 0 END) as both_tiers_count,
  COUNT(*) as total_experts
FROM expert_profile;

-- Expected: All experts should have tier1_enabled = true, tier2_enabled = false initially

-- ==================================================
-- ROLLBACK (if needed)
-- ==================================================

-- To rollback this migration, run:
/*
ALTER TABLE expert_profile DROP COLUMN tier1_enabled;
ALTER TABLE expert_profile DROP COLUMN tier1_price_cents;
ALTER TABLE expert_profile DROP COLUMN tier1_sla_hours;
ALTER TABLE expert_profile DROP COLUMN tier1_description;
ALTER TABLE expert_profile DROP COLUMN tier2_enabled;
ALTER TABLE expert_profile DROP COLUMN tier2_pricing_mode;
ALTER TABLE expert_profile DROP COLUMN tier2_min_price_cents;
ALTER TABLE expert_profile DROP COLUMN tier2_max_price_cents;
ALTER TABLE expert_profile DROP COLUMN tier2_auto_decline_below_cents;
ALTER TABLE expert_profile DROP COLUMN tier2_sla_hours;
ALTER TABLE expert_profile DROP COLUMN tier2_description;
DROP INDEX idx_expert_profile_tier1_enabled;
DROP INDEX idx_expert_profile_tier2_enabled;
*/

-- ==================================================
-- NOTES FOR XANO IMPLEMENTATION
-- ==================================================

/*
Since Xano uses a visual interface, here's how to implement this migration in Xano:

1. Go to Xano Dashboard → Database → expert_profile table
2. Click "Add Field" for each column above
3. Configure field types:
   - tier1_enabled, tier2_enabled: Boolean
   - tier1_price_cents, tier2_min_price_cents, tier2_max_price_cents, tier2_auto_decline_below_cents: Integer
   - tier1_sla_hours, tier2_sla_hours: Integer
   - tier1_description, tier2_description, tier2_pricing_mode: Text
4. Set default values as specified
5. After adding all fields, run the UPDATE query above using Xano's "Run Query" tool
6. Verify migration using the validation queries
7. Test tier configuration endpoints before deploying

Xano Field Mapping:
- BOOLEAN → Boolean (true/false)
- INTEGER → Number (Integer)
- TEXT → Text (Long Text if needed for descriptions)
- DEFAULT values → Set in "Default Value" field
- NULL → Allow NULL = true
*/
