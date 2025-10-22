# Migration Verification Checklist

**Status:** ✅ All 3 migrations completed
**Next:** Verify data integrity before proceeding to API implementation

---

## 🔍 Quick Verification (5 minutes)

### Step 1: Check expert_profile Table

**Go to:** Xano Dashboard → Database → expert_profile → View Data

**Verify:**
- [ ] Pick 2-3 expert records
- [ ] Check `tier1_enabled` = true
- [ ] Check `tier1_price_cents` has value (not 0 or NULL)
- [ ] Check `tier1_sla_hours` has value (e.g., 24)
- [ ] Check `tier2_enabled` = false (by default)

**✅ Expected:** All existing experts should have tier1 configured

---

### Step 2: Check question Table

**Go to:** Xano Dashboard → Database → question → View Data

**Verify:**
- [ ] Pick 2-3 question records
- [ ] Check `question_tier` = "quick_consult"
- [ ] Check `pricing_status` has value (e.g., "completed", "paid")
- [ ] Check `final_price_cents` has value
- [ ] Check `sla_start_time` is set (timestamp)
- [ ] Check `sla_deadline` is set (timestamp)

**✅ Expected:** All existing questions should be marked as "quick_consult"

---

### Step 3: Check payment Table

**Go to:** Xano Dashboard → Database → payment → View Data

**Verify:**
- [ ] Table exists (may be empty if you haven't run data migration yet)
- [ ] All 17 fields exist
- [ ] Field types are correct (especially timestamps)

**✅ Expected:** Table structure is correct

---

## 🔬 Detailed Verification (Optional)

### Create Test Endpoint in Xano

If you want to run validation queries:

**Create endpoint:** `GET /test/verify-migrations`

**Function Stack:**

```
Step 1: Query expert_profile
  - Get All Records
  - return as: all_experts

Step 2: Query question
  - Get All Records
  - return as: all_questions

Step 3: Query payment
  - Get All Records
  - return as: all_payments

Step 4: Response
  - expert_count = all_experts.length
  - question_count = all_questions.length
  - payment_count = all_payments.length
  - sample_expert = all_experts[0]
  - sample_question = all_questions[0]
  - sample_payment = all_payments[0]
```

**Call endpoint** and review the response to verify data looks correct.

---

## ⚠️ Common Issues

### Issue: Expert tier1_price_cents is 0
**Fix:** Re-run Migration 001 data migration function

### Issue: Question fields are NULL
**Fix:** Re-run Migration 002 data migration function

### Issue: Payment table is empty
**Fix:** Run Migration 003 data migration function (Step 2.12 in checklist)

---

## ✅ Verification Complete When:

- [ ] All experts have tier1 fields populated
- [ ] All questions have tier and pricing status set
- [ ] Payment table structure is correct
- [ ] No critical data is missing

---

**Once verified, proceed to:** Backend API Implementation

**Last Updated:** October 21, 2025
