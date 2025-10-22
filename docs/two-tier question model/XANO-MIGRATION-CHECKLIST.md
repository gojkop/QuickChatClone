# Xano Migration Implementation Checklist

**Date:** October 21, 2025
**Status:** IN PROGRESS

Use this checklist to implement the database migrations in Xano's visual interface.

---

## ⚠️ BEFORE YOU START

### Pre-Migration Steps
- [ ] **Backup your Xano database** (Export all tables)
- [ ] **Read all migration files** in `/migrations/` folder
- [ ] **Test in development Xano instance first** (if available)
- [ ] **Notify team** about database changes
- [ ] **Schedule low-traffic window** (recommended but not required for these additive changes)

---

## 📋 MIGRATION 001: expert_profile Table

**Goal:** Add tier configuration fields (11 new fields)

**Xano Path:** Dashboard → Database → expert_profile

### Quick Consult (Tier 1) Fields

#### Field 1: tier1_enabled
- [ ] Click "Add Field"
- [ ] Field Name: `tier1_enabled`
- [ ] Type: **Boolean**
- [ ] Default Value: `true`
- [ ] Required: **Yes**
- [ ] Description: "Whether Quick Consult tier is enabled for this expert"
- [ ] Click "Save"

#### Field 2: tier1_price_cents
- [ ] Click "Add Field"
- [ ] Field Name: `tier1_price_cents`
- [ ] Type: **Integer**
- [ ] Default Value: `0`
- [ ] Required: **Yes**
- [ ] Description: "Fixed price for Quick Consult in cents (e.g., 7500 = €75)"
- [ ] Click "Save"

#### Field 3: tier1_sla_hours
- [ ] Click "Add Field"
- [ ] Field Name: `tier1_sla_hours`
- [ ] Type: **Integer**
- [ ] Default Value: `24`
- [ ] Required: **Yes**
- [ ] Description: "Response time SLA for Quick Consult in hours"
- [ ] Click "Save"

#### Field 4: tier1_description
- [ ] Click "Add Field"
- [ ] Field Name: `tier1_description`
- [ ] Type: **Text** (Long Text)
- [ ] Default Value: `""` (empty string)
- [ ] Required: **No** (allow empty)
- [ ] Description: "Public description of Quick Consult offering"
- [ ] Click "Save"

### Deep Dive (Tier 2) Fields

#### Field 5: tier2_enabled
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_enabled`
- [ ] Type: **Boolean**
- [ ] Default Value: `false`
- [ ] Required: **Yes**
- [ ] Description: "Whether Deep Dive tier is enabled (opt-in)"
- [ ] Click "Save"

#### Field 6: tier2_pricing_mode
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_pricing_mode`
- [ ] Type: **Text**
- [ ] Default Value: `"asker_proposes"`
- [ ] Required: **Yes**
- [ ] Description: "Pricing mode for Deep Dive (fixed to asker_proposes for MVP)"
- [ ] Click "Save"

#### Field 7: tier2_min_price_cents
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_min_price_cents`
- [ ] Type: **Integer**
- [ ] Default Value: `0`
- [ ] Required: **Yes**
- [ ] Description: "Suggested minimum price for Deep Dive in cents"
- [ ] Click "Save"

#### Field 8: tier2_max_price_cents
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_max_price_cents`
- [ ] Type: **Integer**
- [ ] Default Value: `0`
- [ ] Required: **Yes**
- [ ] Description: "Suggested maximum price for Deep Dive in cents"
- [ ] Click "Save"

#### Field 9: tier2_auto_decline_below_cents
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_auto_decline_below_cents`
- [ ] Type: **Integer**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "Auto-decline offers below this amount (optional)"
- [ ] Click "Save"

#### Field 10: tier2_sla_hours
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_sla_hours`
- [ ] Type: **Integer**
- [ ] Default Value: `48`
- [ ] Required: **Yes**
- [ ] Description: "Response time SLA for Deep Dive in hours (starts after acceptance)"
- [ ] Click "Save"

#### Field 11: tier2_description
- [ ] Click "Add Field"
- [ ] Field Name: `tier2_description`
- [ ] Type: **Text** (Long Text)
- [ ] Default Value: `""` (empty string)
- [ ] Required: **No** (allow empty)
- [ ] Description: "Public description of Deep Dive offering"
- [ ] Click "Save"

### Data Migration for expert_profile

Now we need to populate tier1 fields with data from existing `price_cents` and `sla_hours` fields.

**Xano Function Approach:**

- [ ] Go to: Dashboard → Functions → Add Function
- [ ] Name: `migrate_expert_profile_to_tiers`
- [ ] Add endpoint: `POST /internal/migrate-expert-tiers`
- [ ] Authentication: Add API Key parameter (`x_api_key`)
- [ ] Function Stack:

```
Step 1: Query All Records From expert_profile
  - Type: Database Request → Query All Records From
  - Table: expert_profile
  - return as: all_experts

Step 2: For Each Loop On var:all_experts As item
  - Type: For Each Loop
  - Input: all_experts
  - Loop variable name: item

  Step 2.1: Calculate tier1_price (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.price_cents || 5000;
    - return as: calculated_tier1_price

  Step 2.2: Calculate tier1_sla (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.sla_hours || 24;
    - return as: calculated_tier1_sla

  Step 2.3: Edit Record in expert_profile
    - Type: Database Request → Edit Record
    - Table: expert_profile
    - Record to edit: item (from loop variable)
    - Fields to update:
      • tier1_enabled = true (literal boolean)
      • tier1_price_cents = calculated_tier1_price (variable)
      • tier1_sla_hours = calculated_tier1_sla (variable)
      • tier1_description = "Focused advice on your questions" (literal text)
      • tier2_enabled = false (literal boolean)
    - return as: expert_profile_updated

Step 3: Response
  - Type: Response
  - Set Response:
    • migrated_count = all_experts.length (or COUNT if available)
    • status = "success" (literal text)
```

- [ ] Save function
- [ ] Test by calling endpoint: `POST /internal/migrate-expert-tiers?x_api_key=YOUR_KEY`
- [ ] Verify response shows `status: "success"`
- [ ] Check a few expert_profile records to confirm fields are populated

### Validation for Migration 001

- [ ] Go to: Dashboard → Database → expert_profile
- [ ] Click "View Data" or similar
- [ ] Check sample records:
  - [ ] All records have `tier1_enabled = true`
  - [ ] All records have `tier1_price_cents` > 0
  - [ ] All records have `tier2_enabled = false`

**Validation Query (if SQL available):**
```sql
SELECT
  COUNT(*) as total_experts,
  SUM(CASE WHEN tier1_enabled = true THEN 1 ELSE 0 END) as tier1_enabled_count,
  SUM(CASE WHEN tier2_enabled = true THEN 1 ELSE 0 END) as tier2_enabled_count,
  SUM(CASE WHEN tier1_price_cents = 0 THEN 1 ELSE 0 END) as missing_price
FROM expert_profile;
```

Expected: `tier1_enabled_count = total_experts`, `tier2_enabled_count = 0`, `missing_price = 0`

✅ **Migration 001 Complete!**

---

## 📋 MIGRATION 002: question Table

**Goal:** Add tier and pricing status fields (11 new fields)

**Xano Path:** Dashboard → Database → question

### Tier and Pricing Fields

#### Field 1: question_tier
- [ ] Click "Add Field"
- [ ] Field Name: `question_tier`
- [ ] Type: **Text**
- [ ] Default Value: `"quick_consult"`
- [ ] Required: **Yes**
- [ ] Description: "Type: quick_consult or deep_dive"
- [ ] Click "Save"

#### Field 2: pricing_status
- [ ] Click "Add Field"
- [ ] Field Name: `pricing_status`
- [ ] Type: **Text**
- [ ] Default Value: `"paid"`
- [ ] Required: **Yes**
- [ ] Description: "Payment status state machine"
- [ ] Click "Save"

#### Field 3: proposed_price_cents
- [ ] Click "Add Field"
- [ ] Field Name: `proposed_price_cents`
- [ ] Type: **Integer**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "Asker proposed price for Deep Dive offers"
- [ ] Click "Save"

#### Field 4: final_price_cents
- [ ] Click "Add Field"
- [ ] Field Name: `final_price_cents`
- [ ] Type: **Integer**
- [ ] Default Value: `0`
- [ ] Required: **Yes**
- [ ] Description: "Actual price paid"
- [ ] Click "Save"

#### Field 5: asker_message
- [ ] Click "Add Field"
- [ ] Field Name: `asker_message`
- [ ] Type: **Text** (Long Text)
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "Asker message to expert explaining offer price"
- [ ] Click "Save"

### SLA Tracking Fields

#### Field 6: sla_start_time
- [ ] Click "Add Field"
- [ ] Field Name: `sla_start_time`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When SLA countdown started"
- [ ] Click "Save"

#### Field 7: sla_deadline
- [ ] Click "Add Field"
- [ ] Field Name: `sla_deadline`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When answer must be delivered"
- [ ] Click "Save"

#### Field 8: sla_missed
- [ ] Click "Add Field"
- [ ] Field Name: `sla_missed`
- [ ] Type: **Boolean**
- [ ] Default Value: `false`
- [ ] Required: **Yes**
- [ ] Description: "Whether expert missed the SLA deadline"
- [ ] Click "Save"

### Deep Dive Offer Fields

#### Field 9: offer_expires_at
- [ ] Click "Add Field"
- [ ] Field Name: `offer_expires_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When Deep Dive offer expires (24h from submission)"
- [ ] Click "Save"

#### Field 10: decline_reason
- [ ] Click "Add Field"
- [ ] Field Name: `decline_reason`
- [ ] Type: **Text** (Long Text)
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "Expert message when declining offer"
- [ ] Click "Save"

#### Field 11: expert_reviewed_at
- [ ] Click "Add Field"
- [ ] Field Name: `expert_reviewed_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When expert accepted or declined offer"
- [ ] Click "Save"

### Data Migration for question

**Create Xano Function:**

- [ ] Go to: Dashboard → Functions → Add Function
- [ ] Name: `migrate_questions_to_tiers`
- [ ] Add endpoint: `POST /internal/migrate-questions`
- [ ] Authentication: Add API Key parameter (`x_api_key`)
- [ ] Function Stack:

```
Step 1: Query All Records From question
  - Type: Database Request → Query All Records From
  - Table: question
  - return as: all_questions

Step 2: For Each Loop On var:all_questions As item
  - Type: For Each Loop
  - Input: all_questions
  - Loop variable name: item

  Step 2.1: Calculate pricing_status (Lambda)
    - Type: Add a function → Lambda
    - Code:
      var newStatus = 'paid';
      if ($var.item.status === 'answered' || ($var.item.status === 'paid' && $var.item.answered_at !== null)) {
        newStatus = 'completed';
      } else if ($var.item.status === 'draft') {
        newStatus = 'draft';
      } else if ($var.item.status === 'refunded') {
        newStatus = 'sla_missed';
      }
      return newStatus;
    - return as: new_pricing_status

  Step 2.2: Calculate final_price_cents (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.price_cents || 0;
    - return as: calculated_final_price

  Step 2.3: Calculate SLA deadline (Lambda)
    - Type: Add a function → Lambda
    - Code:
      var slaHours = $var.item.sla_hours_snapshot || 24;
      var createdAt = new Date($var.item.created_at);
      var deadline = new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000));
      return deadline.getTime();
    - return as: sla_deadline_timestamp

  Step 2.4: Calculate SLA missed (Lambda)
    - Type: Add a function → Lambda
    - Code:
      var answeredAt = $var.item.answered_at;
      var deadline = $var.sla_deadline_timestamp;
      if (answeredAt !== null && answeredAt !== 0) {
        return false; // Answered, so SLA was met
      }
      return Date.now() > deadline; // Not answered and past deadline
    - return as: sla_missed_flag

  Step 2.5: Edit Record in question
    - Type: Database Request → Edit Record
    - Table: question
    - Record to edit: item (from loop variable)
    - Fields to update:
      • question_tier = "quick_consult" (literal text)
      • pricing_status = new_pricing_status (variable from Step 2.1)
      • final_price_cents = calculated_final_price (variable from Step 2.2)
      • sla_start_time = item.created_at (variable)
      • sla_deadline = sla_deadline_timestamp (variable from Step 2.3)
      • sla_missed = sla_missed_flag (variable from Step 2.4)
    - return as: question_updated

Step 3: Response
  - Type: Response
  - Set Response:
    • migrated_count = all_questions.length
    • status = "success" (literal text)
```

- [ ] Save function
- [ ] Test by calling endpoint: `POST /internal/migrate-questions?x_api_key=YOUR_KEY`
- [ ] Verify response shows `status: "success"`
- [ ] Check sample question records to confirm fields are populated

### Validation for Migration 002

**Check question data:**
- [ ] Go to: Dashboard → Database → question
- [ ] View sample records:
  - [ ] All have `question_tier = "quick_consult"`
  - [ ] All have `pricing_status` set (not NULL)
  - [ ] All have `final_price_cents` set
  - [ ] All have `sla_start_time` and `sla_deadline`

**Validation Query (if SQL available):**
```sql
SELECT
  COUNT(*) as total_questions,
  SUM(CASE WHEN question_tier = 'quick_consult' THEN 1 ELSE 0 END) as quick_consult_count,
  SUM(CASE WHEN question_tier = 'deep_dive' THEN 1 ELSE 0 END) as deep_dive_count,
  SUM(CASE WHEN pricing_status = 'completed' THEN 1 ELSE 0 END) as completed_count,
  SUM(CASE WHEN sla_missed = true THEN 1 ELSE 0 END) as sla_missed_count
FROM question;
```

Expected: All questions should have `quick_consult` tier initially, `deep_dive_count = 0`

✅ **Migration 002 Complete!**

---

## 📋 MIGRATION 003: Create payment Table

**Goal:** Create new payment table

**Xano Path:** Dashboard → Database → Create Table

### Create Table

- [ ] Click "Create Table"
- [ ] Table Name: `payment`
- [ ] Click "Create"

### Add Fields to payment Table

#### Field 1: id (Auto-created)
- [ ] Should be auto-created as primary key
- [ ] Type: **Integer**
- [ ] Auto-increment: **Yes**

#### Field 2: question_id
- [ ] Click "Add Field"
- [ ] Field Name: `question_id`
- [ ] Type: **Integer**
- [ ] Required: **Yes**
- [ ] Foreign Key: **Yes**
  - [ ] References: `question` table, `id` field
  - [ ] On Delete: **CASCADE**
- [ ] Click "Save"

#### Field 3: stripe_payment_intent_id
- [ ] Click "Add Field"
- [ ] Field Name: `stripe_payment_intent_id`
- [ ] Type: **Text**
- [ ] Required: **Yes**
- [ ] Description: "Stripe PaymentIntent ID"
- [ ] Click "Save"

#### Field 4: amount_cents
- [ ] Click "Add Field"
- [ ] Field Name: `amount_cents`
- [ ] Type: **Integer**
- [ ] Required: **Yes**
- [ ] Description: "Payment amount in cents"
- [ ] Click "Save"

#### Field 5: currency
- [ ] Click "Add Field"
- [ ] Field Name: `currency`
- [ ] Type: **Text**
- [ ] Default Value: `"USD"`
- [ ] Required: **Yes**
- [ ] Description: "Currency code"
- [ ] Click "Save"

#### Field 6: status
- [ ] Click "Add Field"
- [ ] Field Name: `status`
- [ ] Type: **Text**
- [ ] Default Value: `"authorized"`
- [ ] Required: **Yes**
- [ ] Description: "Payment status: authorized, accepted, captured, refunded, failed"
- [ ] Click "Save"

#### Field 7: question_type
- [ ] Click "Add Field"
- [ ] Field Name: `question_type`
- [ ] Type: **Text**
- [ ] Required: **Yes**
- [ ] Description: "Type: quick_consult or deep_dive"
- [ ] Click "Save"

#### Field 8: authorized_at
- [ ] Click "Add Field"
- [ ] Field Name: `authorized_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: **CURRENT_TIMESTAMP** (or "now")
- [ ] Required: **Yes**
- [ ] Description: "When payment was authorized (funds held)"
- [ ] Click "Save"

#### Field 9: accepted_at
- [ ] Click "Add Field"
- [ ] Field Name: `accepted_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When Deep Dive offer was accepted"
- [ ] Click "Save"

#### Field 10: captured_at
- [ ] Click "Add Field"
- [ ] Field Name: `captured_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When payment was captured"
- [ ] Click "Save"

#### Field 11: refunded_at
- [ ] Click "Add Field"
- [ ] Field Name: `refunded_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "When payment was refunded"
- [ ] Click "Save"

#### Field 12: capture_attempted
- [ ] Click "Add Field"
- [ ] Field Name: `capture_attempted`
- [ ] Type: **Boolean**
- [ ] Default Value: `false`
- [ ] Required: **Yes**
- [ ] Description: "Whether capture was attempted"
- [ ] Click "Save"

#### Field 13: capture_failed
- [ ] Click "Add Field"
- [ ] Field Name: `capture_failed`
- [ ] Type: **Boolean**
- [ ] Default Value: `false`
- [ ] Required: **Yes**
- [ ] Description: "Whether capture failed"
- [ ] Click "Save"

#### Field 14: retry_count
- [ ] Click "Add Field"
- [ ] Field Name: `retry_count`
- [ ] Type: **Integer**
- [ ] Default Value: `0`
- [ ] Required: **Yes**
- [ ] Description: "Number of capture retries (max 3)"
- [ ] Click "Save"

#### Field 15: error_message
- [ ] Click "Add Field"
- [ ] Field Name: `error_message`
- [ ] Type: **Text** (Long Text)
- [ ] Default Value: `NULL`
- [ ] Required: **No** (Allow NULL)
- [ ] Description: "Error message if payment failed"
- [ ] Click "Save"

#### Field 16: created_at
- [ ] Click "Add Field"
- [ ] Field Name: `created_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: **CURRENT_TIMESTAMP** (or "now")
- [ ] Required: **Yes**
- [ ] Click "Save"

#### Field 17: updated_at
- [ ] Click "Add Field"
- [ ] Field Name: `updated_at`
- [ ] Type: **Timestamp**
- [ ] Default Value: **CURRENT_TIMESTAMP** (or "now")
- [ ] On Update: **CURRENT_TIMESTAMP** (if available)
- [ ] Required: **Yes**
- [ ] Click "Save"

### Data Migration for payment

**Create Xano Function:**

- [ ] Go to: Dashboard → Functions → Add Function
- [ ] Name: `migrate_payments_from_questions`
- [ ] Add endpoint: `POST /internal/migrate-payments`
- [ ] Authentication: Add API Key parameter (`x_api_key`)
- [ ] Function Stack:

```
Step 1: Query All Records From question
  - Type: Database Request → Query All Records From
  - Table: question
  - Filter (optional): WHERE status IN ('paid', 'answered', 'refunded')
    OR payment_intent_id IS NOT NULL
  - return as: paid_questions

Step 2: For Each Loop On var:paid_questions As item
  - Type: For Each Loop
  - Input: paid_questions
  - Loop variable name: item

  Step 2.1: Check if payment already exists (Get Record)
    - Type: Database Request → Get Record
    - Table: payment
    - Filter: WHERE question_id = item.id
    - return as: existing_payment

  Step 2.2: Skip if payment exists (Conditional - If/Else)
    - Type: If/Else
    - Condition: existing_payment IS NOT NULL
    - If TRUE: Continue (skip to next item in loop)
    - If FALSE: Proceed to next step

  Step 2.3: Calculate payment status (Lambda)
    - Type: Add a function → Lambda
    - Code:
      var status = 'authorized';
      var pricingStatus = $var.item.pricing_status;
      if (pricingStatus === 'completed') {
        status = 'captured';
      } else if (pricingStatus === 'offer_declined' || pricingStatus === 'offer_expired' || pricingStatus === 'sla_missed') {
        status = 'refunded';
      } else if (pricingStatus === 'offer_accepted') {
        status = 'accepted';
      }
      return status;
    - return as: payment_status

  Step 2.4: Generate or use payment_intent_id (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.payment_intent_id || ('migrated_' + $var.item.id);
    - return as: intent_id

  Step 2.5: Calculate amount_cents (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.final_price_cents || $var.item.price_cents || 0;
    - return as: amount_cents

  Step 2.6: Calculate currency (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.currency || "USD";
    - return as: currency_code

  Step 2.7: Calculate question_type (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.question_tier || "quick_consult";
    - return as: question_type

  Step 2.8: Calculate authorized_at (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return $var.item.paid_at || $var.item.created_at;
    - return as: authorized_timestamp

  Step 2.9: Calculate captured_at (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return ($var.payment_status === 'captured') ? $var.item.answered_at : null;
    - return as: captured_timestamp

  Step 2.10: Calculate refunded_at (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return ($var.payment_status === 'refunded') ? ($var.item.expert_reviewed_at || $var.item.created_at) : null;
    - return as: refunded_timestamp

  Step 2.11: Calculate capture_attempted (Lambda)
    - Type: Add a function → Lambda
    - Code:
      return ($var.item.answered_at !== null && $var.item.answered_at !== 0);
    - return as: capture_attempted_flag

  Step 2.12: Add Record to payment
    - Type: Database Request → Add Record
    - Table: payment
    - Fields:
      • question_id = item.id (variable)
      • stripe_payment_intent_id = intent_id (variable from Step 2.4)
      • amount_cents = amount_cents (variable from Step 2.5)
      • currency = currency_code (variable from Step 2.6)
      • status = payment_status (variable from Step 2.3)
      • question_type = question_type (variable from Step 2.7)
      • authorized_at = authorized_timestamp (variable from Step 2.8)
      • accepted_at = null (will be set later for Deep Dive)
      • captured_at = captured_timestamp (variable from Step 2.9)
      • refunded_at = refunded_timestamp (variable from Step 2.10)
      • capture_attempted = capture_attempted_flag (variable from Step 2.11)
      • capture_failed = false (literal boolean)
      • retry_count = 0 (literal number)
    - return as: payment_created

Step 3: Response
  - Type: Response
  - Set Response:
    • migrated_count = paid_questions.length
    • status = "success" (literal text)
```

- [ ] Save function
- [ ] Test by calling endpoint: `POST /internal/migrate-payments?x_api_key=YOUR_KEY`
- [ ] Verify response shows `status: "success"`
- [ ] Check payment table to confirm records were created

### Validation for Migration 003

**Check payment data:**
- [ ] Go to: Dashboard → Database → payment
- [ ] View sample records:
  - [ ] Records exist
  - [ ] Each has a valid `question_id`
  - [ ] Status values are correct
  - [ ] Amounts match question amounts

**Validation Query (if SQL available):**
```sql
-- Check total payments
SELECT COUNT(*) FROM payment;

-- Check for missing payments (non-draft questions without payment)
SELECT COUNT(*)
FROM question q
LEFT JOIN payment p ON p.question_id = q.id
WHERE p.id IS NULL
  AND q.status != 'draft'
  AND q.pricing_status != 'draft';
-- Expected: 0

-- Check for duplicates
SELECT question_id, COUNT(*) as payment_count
FROM payment
GROUP BY question_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

✅ **Migration 003 Complete!**

---

## ✅ FINAL VERIFICATION

After all migrations are complete:

### Test Data Integrity

- [ ] **expert_profile**: All experts have tier1 configured
- [ ] **question**: All questions have tier and pricing status
- [ ] **payment**: All paid questions have payment records

### Test a Query

Create a test Xano endpoint to verify data:

- [ ] Create endpoint: `GET /test/tier-data`
- [ ] Function stack:
  ```
  Step 1: Get expert with tiers
    - Table: expert_profile
    - Get one record
    - Include: tier1_enabled, tier1_price_cents, tier2_enabled

  Step 2: Get questions with tiers
    - Table: question
    - Get 5 records
    - Include: question_tier, pricing_status, final_price_cents

  Step 3: Get payments
    - Table: payment
    - Get 5 records
    - Include: question_id, status, amount_cents

  Step 4: Return all data
  ```

- [ ] Call endpoint and verify response

### Backup After Migration

- [ ] **Export all tables** (post-migration backup)
- [ ] Store in safe location
- [ ] Document migration completion date

---

## 🎉 MIGRATIONS COMPLETE!

Once all checkboxes are ticked:

- [ ] Mark migrations as complete in project tracker
- [ ] Update team on completion
- [ ] Proceed to API implementation phase
- [ ] Begin testing new tier functionality

---

## 🆘 TROUBLESHOOTING

### Issue: Can't add field to table
**Solution:** Check if field name conflicts with reserved word, try different name

### Issue: Foreign key constraint fails
**Solution:** Ensure referenced table and field exist, check data types match

### Issue: Default value not working
**Solution:** Some Xano field types may not support defaults, set via migration function instead

### Issue: Migration function times out
**Solution:** Process records in batches (e.g., 100 at a time), run multiple times

### Issue: Data doesn't look right after migration
**Solution:** Check migration function logic, review sample records manually, may need to re-run with fixes

---

**IMPORTANT:** If you encounter any issues during migration, STOP and review the migration files in `/migrations/` folder before proceeding. You can always restore from backup and retry.

**Last Updated:** October 21, 2025
