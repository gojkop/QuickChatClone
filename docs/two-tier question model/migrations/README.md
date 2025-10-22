# Database Migrations for Two-Tier Question Model

This folder contains SQL migrations for implementing the two-tier question pricing system in Xano.

## Migration Files

### 001_expert_profile_tier_fields.sql
**Description:** Add tier configuration fields to expert_profile table
**Status:** PENDING
**Estimated Time:** 15-30 minutes

Adds fields for:
- Quick Consult (Tier 1): price, SLA, description, enabled flag
- Deep Dive (Tier 2): price ranges, auto-decline threshold, SLA, description, enabled flag

**Actions:**
- Adds 11 new columns to expert_profile table
- Creates 2 indexes for tier filtering
- Migrates existing experts to Tier 1 (Quick Consult)
- Sets all experts to tier1_enabled = true, tier2_enabled = false

---

### 002_question_tier_and_pricing_fields.sql
**Description:** Add tier, pricing status, and offer fields to question table
**Status:** PENDING
**Depends on:** 001_expert_profile_tier_fields.sql
**Estimated Time:** 20-40 minutes

Adds fields for:
- Question tier identification (quick_consult vs deep_dive)
- Pricing status state machine (paid, offer_pending, offer_accepted, etc.)
- Proposed and final prices
- SLA tracking (start time, deadline, missed flag)
- Deep Dive offer tracking (expiration, decline reason, expert review timestamp)

**Actions:**
- Adds 11 new columns to question table
- Creates 5 indexes for performance
- Migrates existing questions to 'quick_consult' tier
- Maps old 'status' values to new 'pricing_status' values
- Calculates SLA fields for existing questions

---

### 003_create_payment_table.sql
**Description:** Create payment table for tracking Stripe payment lifecycle
**Status:** PENDING
**Depends on:** 002_question_tier_and_pricing_fields.sql
**Estimated Time:** 30-45 minutes

Creates new payment table with:
- Payment status state machine (authorized, accepted, captured, refunded, failed)
- Stripe payment intent tracking
- Payment lifecycle timestamps (authorized, accepted, captured, refunded)
- Capture retry logic (for failed captures)
- Audit timestamps

**Actions:**
- Creates new payment table with 16 columns
- Creates 5 indexes for performance
- Migrates existing question payment data to payment table
- Generates fallback payment_intent_id for old questions: "migrated_{question_id}"

---

## Migration Order

**IMPORTANT:** Migrations must be run in order:

1. `001_expert_profile_tier_fields.sql`
2. `002_question_tier_and_pricing_fields.sql`
3. `003_create_payment_table.sql`

Each migration depends on the previous one completing successfully.

---

## Pre-Migration Checklist

Before running migrations:

- [ ] **Backup database** - Create full database backup before starting
- [ ] **Review migration plan** - Read DATABASE-MIGRATION-PLAN.md
- [ ] **Test in development** - Run migrations in dev environment first
- [ ] **Test in staging** - Run migrations in staging environment
- [ ] **Verify data integrity** - Run validation queries after each migration
- [ ] **Schedule downtime** - Plan maintenance window if needed (low traffic hours)
- [ ] **Notify team** - Inform team of migration schedule
- [ ] **Prepare rollback** - Have rollback scripts ready

---

## How to Run Migrations in Xano

### Recommended Approach: Xano Visual Interface with Lambda Functions

**IMPORTANT:** Xano's visual interface doesn't support SQL directly or the `??` operator in field mappings. You must use **Lambda functions** for data calculations.

See **[XANO-LAMBDA-GUIDE.md](../XANO-LAMBDA-GUIDE.md)** for complete Lambda function guide with examples.

**General Steps:**

#### Part A: Add Fields
1. Open Xano Dashboard → Database
2. Select table to modify (expert_profile or question) or create new table (payment)
3. Click "Add Field" for each new column
4. Configure field type, default value, and constraints
5. Save changes

#### Part B: Migrate Data
1. Create Xano Function endpoint (e.g., `POST /internal/migrate-expert-tiers`)
2. Add API key authentication (`x_api_key` parameter)
3. Build function stack:
   - **Step 1:** Query All Records From [table]
   - **Step 2:** For Each Loop On records
   - **Step 2.1+:** Lambda functions to calculate values
   - **Step 2.X:** Edit/Add Record with calculated values
   - **Step 3:** Return success response
4. Test with 1 record first
5. Run for all records
6. Validate results

**See:** [XANO-MIGRATION-CHECKLIST.md](../XANO-MIGRATION-CHECKLIST.md) for detailed step-by-step instructions.

### Alternative: SQL (If Xano Supports It)

If Xano provides a SQL query tool:
1. Copy SQL from migration files (001, 002, 003)
2. Paste into Xano SQL query tool
3. Execute migration
4. Run validation queries

**Note:** Most Xano instances require the visual interface approach with Lambda functions.

---

## Validation

After each migration, run the validation queries included in the migration file:

### After 001_expert_profile_tier_fields.sql

```sql
-- Check that all experts have tier1 configured
SELECT COUNT(*) as experts_without_tier1
FROM expert_profile
WHERE tier1_price_cents = 0 OR tier1_price_cents IS NULL;
-- Expected: 0

-- Check tier adoption
SELECT
  SUM(CASE WHEN tier1_enabled = true THEN 1 ELSE 0 END) as tier1_count,
  SUM(CASE WHEN tier2_enabled = true THEN 1 ELSE 0 END) as tier2_count,
  COUNT(*) as total
FROM expert_profile;
-- Expected: tier1_count = total, tier2_count = 0
```

### After 002_question_tier_and_pricing_fields.sql

```sql
-- Check tier distribution
SELECT question_tier, pricing_status, COUNT(*) as count
FROM question
GROUP BY question_tier, pricing_status;
-- Expected: All questions should have 'quick_consult' tier

-- Check SLA accuracy
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN sla_missed = true THEN 1 ELSE 0 END) as missed,
  SUM(CASE WHEN sla_missed = false THEN 1 ELSE 0 END) as met
FROM question;
-- Verify counts match expectations
```

### After 003_create_payment_table.sql

```sql
-- Check payment records created
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status = 'captured' THEN 1 ELSE 0 END) as captured,
  SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded
FROM payment;
-- Verify counts match question counts

-- Check for missing payments (should only be drafts)
SELECT q.id, q.status, q.pricing_status
FROM question q
LEFT JOIN payment p ON p.question_id = q.id
WHERE p.id IS NULL AND q.status != 'draft';
-- Expected: 0 rows
```

---

## Rollback Procedures

Each migration file includes rollback SQL at the bottom.

### Rollback Steps:

1. **Stop all services** accessing the database
2. **Restore from backup** if major issues
3. **Run rollback SQL** for last successful migration
4. **Verify data** after rollback
5. **Investigate issue** before retrying
6. **Fix migration** and re-test in dev/staging
7. **Retry migration** when ready

### Quick Rollback Commands:

```sql
-- Rollback 003 (payment table)
DROP TABLE payment;

-- Rollback 002 (question fields)
ALTER TABLE question DROP COLUMN question_tier;
ALTER TABLE question DROP COLUMN pricing_status;
-- ... (see migration file for full rollback)

-- Rollback 001 (expert_profile fields)
ALTER TABLE expert_profile DROP COLUMN tier1_enabled;
ALTER TABLE expert_profile DROP COLUMN tier1_price_cents;
-- ... (see migration file for full rollback)
```

---

## Estimated Total Time

- **Development Environment:** 2-3 hours
- **Staging Environment:** 1-2 hours (with testing)
- **Production Environment:** 1-2 hours (with validation)

**Total Migration Time:** 4-7 hours across all environments

---

## Migration Timeline

### Day 1: Development
- Morning: Run migration 001 (expert_profile)
- Afternoon: Run migration 002 (question)
- Evening: Run migration 003 (payment)
- Validate all migrations

### Day 2: Staging
- Morning: Run all migrations in staging
- Afternoon: Test endpoints with migrated data
- Evening: Verify data integrity

### Day 3: Production
- Low-traffic window: Run migrations
- Immediate validation
- Monitor for errors
- Send notification emails to experts

---

## Post-Migration Tasks

After all migrations complete successfully:

- [ ] **Verify data integrity** - Run all validation queries
- [ ] **Test endpoints** - Verify GET/POST endpoints work with new schema
- [ ] **Update documentation** - Update Xano endpoint docs with new fields
- [ ] **Monitor errors** - Watch logs for migration-related issues
- [ ] **Send emails** - Notify experts about new Deep Dive feature
- [ ] **Enable feature flags** - Turn on two-tier UI in frontend
- [ ] **Monitor performance** - Watch database query performance
- [ ] **Review indexes** - Ensure indexes are being used correctly

---

## Troubleshooting

### Issue: Migration fails partway through
**Solution:** Restore from backup, fix issue, retry in development first

### Issue: Validation queries show unexpected results
**Solution:** Review migration logic, check for edge cases, may need manual fixes

### Issue: Existing questions missing SLA data
**Solution:** Run UPDATE query to recalculate SLA fields based on created_at + sla_hours_snapshot

### Issue: Payment table has duplicate records
**Solution:** Check NOT EXISTS clause in INSERT query, remove duplicates manually

### Issue: Expert tier configuration not showing in UI
**Solution:** Verify tier fields exist, check default values, test API endpoint

---

## Support

For migration issues:
- Check Xano dashboard for error messages
- Review migration file comments for troubleshooting tips
- Test migrations in development environment first
- Restore from backup if critical failure occurs
- Contact team lead before running production migrations

---

## References

- [DATABASE-MIGRATION-PLAN.md](../DATABASE-MIGRATION-PLAN.md) - Full migration specification
- [implementation-specificaiton.md](../implementation-specificaiton.md) - Two-tier system specification
- [xano-endpoints.md](../../api-database/xano-endpoints.md) - Xano API documentation

---

**Last Updated:** October 21, 2025
**Status:** Ready for Implementation
