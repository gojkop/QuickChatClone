# How to Create Payment Table in Xano Using CSV

**File:** `payment_table_structure.csv`
**Purpose:** Create payment table structure in Xano

---

## 📋 Step-by-Step Guide

### Step 1: Locate the CSV File

The CSV file is located at:
```
/docs/two-tier question model/migrations/payment_table_structure.csv
```

### Step 2: Import CSV in Xano

1. **Go to Xano Dashboard → Database**
2. **Click "Create Table"** (or "+" button)
3. **Choose "Import from CSV"** (or similar option)
4. **Upload** `payment_table_structure.csv`
5. **Name the table:** `payment`
6. **Review field mappings** (Xano will auto-detect types)

### Step 3: Review Auto-Detected Fields

Xano should create these fields from the CSV:

| Field Name | Auto-Detected Type | Notes |
|------------|-------------------|-------|
| question_id | Integer | ✅ Correct |
| stripe_payment_intent_id | Text | ✅ Correct |
| amount_cents | Integer | ✅ Correct |
| currency | Text | ✅ Correct |
| status | Text | ✅ Correct |
| question_type | Text | ✅ Correct |
| authorized_at | Timestamp | ✅ Correct (from number) |
| accepted_at | Timestamp | May need manual adjustment |
| captured_at | Timestamp | May need manual adjustment |
| refunded_at | Timestamp | May need manual adjustment |
| capture_attempted | Boolean | ✅ Correct |
| capture_failed | Boolean | ✅ Correct |
| retry_count | Integer | ✅ Correct |
| error_message | Text | ✅ Correct (empty in sample) |

### Step 4: Manual Field Adjustments

After importing, you'll need to manually adjust some fields:

#### Add Missing Fields:

The CSV doesn't include `id`, `created_at`, and `updated_at` because Xano auto-creates these.

**Add these fields manually:**

1. **id** (should be auto-created)
   - Type: Integer
   - Auto-increment: Yes
   - Primary Key: Yes

2. **created_at** (add manually)
   - Click "Add Field"
   - Field Name: `created_at`
   - Type: Timestamp
   - Default Value: CURRENT_TIMESTAMP
   - Required: Yes

3. **updated_at** (add manually)
   - Click "Add Field"
   - Field Name: `updated_at`
   - Type: Timestamp
   - Default Value: CURRENT_TIMESTAMP
   - On Update: CURRENT_TIMESTAMP
   - Required: Yes

#### Set Foreign Key:

1. **Click on** `question_id` field
2. **Enable** "Foreign Key"
3. **References:** `question` table → `id` field
4. **On Delete:** CASCADE
5. **Save**

#### Set Default Values:

1. **currency**
   - Default Value: `"USD"`

2. **status**
   - Default Value: `"authorized"`

3. **capture_attempted**
   - Default Value: `false`

4. **capture_failed**
   - Default Value: `false`

5. **retry_count**
   - Default Value: `0`

#### Set NULL-able Fields:

These fields should allow NULL:

- `accepted_at` ✓
- `captured_at` ✓
- `refunded_at` ✓
- `error_message` ✓

### Step 5: Delete Sample Row

After import, Xano will have created one row with the sample data:

1. **Go to:** Database → payment → View Data
2. **Delete** the sample row (question_id = 1)
3. **Confirm** table is now empty

### Step 6: Verify Table Structure

Check that your payment table has:

✅ **17 total fields:**
- id (auto-created)
- question_id
- stripe_payment_intent_id
- amount_cents
- currency
- status
- question_type
- authorized_at
- accepted_at
- captured_at
- refunded_at
- capture_attempted
- capture_failed
- retry_count
- error_message
- created_at
- updated_at

✅ **Foreign key** on question_id → question.id

✅ **Default values** set correctly

---

## ⚠️ Alternative: Manual Table Creation

If CSV import doesn't work or seems complicated, you can create the table manually following the checklist in `XANO-MIGRATION-CHECKLIST.md` (Migration 003).

---

## 🔍 Verification Query

After creating the table, test with this query:

1. **Add a test record** (via Xano interface)
2. **Query the table:**
   ```
   GET payment (all records)
   ```
3. **Verify** the structure looks correct
4. **Delete** the test record

---

## ✅ Next Steps

After creating the payment table:

1. ✅ Table structure created
2. ⏭️ Run data migration function (see XANO-MIGRATION-CHECKLIST.md Step 2.12)
3. ⏭️ Populate table with existing question payment data
4. ⏭️ Validate results

---

## 📝 Field Reference

Here's what each field stores:

| Field | Purpose | Example |
|-------|---------|---------|
| id | Primary key | 1 |
| question_id | Link to question | 118 |
| stripe_payment_intent_id | Stripe PaymentIntent ID | pi_1ABC123... |
| amount_cents | Payment amount in cents | 7500 (= $75.00) |
| currency | Currency code | USD |
| status | Payment state | authorized, captured, refunded |
| question_type | Question tier | quick_consult, deep_dive |
| authorized_at | When funds held | 1729500000000 |
| accepted_at | When offer accepted (Deep Dive) | 1729510000000 or NULL |
| captured_at | When payment processed | 1729600000000 or NULL |
| refunded_at | When payment refunded | 1729650000000 or NULL |
| capture_attempted | Capture was tried | true, false |
| capture_failed | Capture failed | true, false |
| retry_count | Number of retries | 0, 1, 2, 3 |
| error_message | Error details | NULL or error text |
| created_at | Record created | 1729500000000 |
| updated_at | Record updated | 1729500000000 |

---

## 🆘 Troubleshooting

### Issue: CSV import not available
**Solution:** Create table manually using Migration 003 checklist

### Issue: Field types detected incorrectly
**Solution:** Manually adjust field types after import

### Issue: Timestamps imported as numbers
**Solution:** Xano should auto-convert, but verify timestamp fields are type "Timestamp"

### Issue: Foreign key not created
**Solution:** Add manually after import (see Step 4 above)

### Issue: Can't delete sample row
**Solution:** That's okay, it will be overwritten during migration or you can delete it later

---

**Last Updated:** October 21, 2025
**File Location:** `/migrations/payment_table_structure.csv`
