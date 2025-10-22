# Payment Table - Field Reference (Airtable Style)

**Table Name:** `payment`
**Purpose:** Track Stripe payment lifecycle for two-tier question system
**Total Fields:** 17

---

## 📋 Table Structure Overview

| # | Field Name | Type | Required | Default | Allow NULL | Notes |
|---|------------|------|----------|---------|------------|-------|
| 1 | id | Integer | ✅ Yes | Auto | ❌ No | Primary Key, Auto-increment |
| 2 | question_id | Integer | ✅ Yes | - | ❌ No | Foreign Key → question.id (CASCADE) |
| 3 | stripe_payment_intent_id | Text | ✅ Yes | - | ❌ No | Stripe PaymentIntent ID |
| 4 | amount_cents | Integer | ✅ Yes | - | ❌ No | Payment amount in cents |
| 5 | currency | Text | ✅ Yes | "USD" | ❌ No | Currency code (USD, EUR, etc.) |
| 6 | status | Text | ✅ Yes | "authorized" | ❌ No | Payment state machine |
| 7 | question_type | Text | ✅ Yes | - | ❌ No | quick_consult or deep_dive |
| 8 | authorized_at | Timestamp | ✅ Yes | CURRENT_TIMESTAMP | ❌ No | When payment was authorized |
| 9 | accepted_at | Timestamp | ❌ No | NULL | ✅ Yes | When Deep Dive offer accepted |
| 10 | captured_at | Timestamp | ❌ No | NULL | ✅ Yes | When payment was captured |
| 11 | refunded_at | Timestamp | ❌ No | NULL | ✅ Yes | When payment was refunded |
| 12 | capture_attempted | Boolean | ✅ Yes | false | ❌ No | Whether capture was attempted |
| 13 | capture_failed | Boolean | ✅ Yes | false | ❌ No | Whether capture failed |
| 14 | retry_count | Integer | ✅ Yes | 0 | ❌ No | Number of capture retries (max 3) |
| 15 | error_message | Text | ❌ No | NULL | ✅ Yes | Error details if payment failed |
| 16 | created_at | Timestamp | ✅ Yes | CURRENT_TIMESTAMP | ❌ No | Record creation timestamp |
| 17 | updated_at | Timestamp | ✅ Yes | CURRENT_TIMESTAMP | ❌ No | Record update timestamp (auto) |

---

## 🔑 Primary & Foreign Keys

### Primary Key
- **Field:** `id`
- **Type:** Integer
- **Auto-increment:** Yes

### Foreign Keys
- **Field:** `question_id`
- **References:** `question` table → `id` field
- **On Delete:** CASCADE (delete payment when question is deleted)

---

## 📊 Field Details

### 1. id
```
Type: Integer
Auto-increment: Yes
Primary Key: Yes
Required: Yes
Allow NULL: No
Description: Unique identifier for payment record
```

### 2. question_id
```
Type: Integer
Foreign Key: Yes → question.id (CASCADE)
Required: Yes
Allow NULL: No
Description: Links to question table
Indexed: Yes
```

### 3. stripe_payment_intent_id
```
Type: Text
Required: Yes
Allow NULL: No
Description: Stripe PaymentIntent ID (e.g., "pi_1ABC123...")
Example: "pi_3OFRpK2eZvKYlo2C0123456789"
Indexed: Yes (for lookups)
```

### 4. amount_cents
```
Type: Integer
Required: Yes
Allow NULL: No
Description: Payment amount in cents (e.g., 7500 = $75.00)
Example: 7500
Min Value: 0
```

### 5. currency
```
Type: Text
Required: Yes
Default: "USD"
Allow NULL: No
Description: Three-letter currency code
Allowed Values: USD, EUR, GBP, etc.
Example: "USD"
```

### 6. status
```
Type: Text (Enum-like)
Required: Yes
Default: "authorized"
Allow NULL: No
Description: Payment status in state machine
Indexed: Yes

Allowed Values:
  - "authorized"  → Funds held, not yet captured
  - "accepted"    → Deep Dive offer accepted, awaiting answer
  - "captured"    → Funds released to expert after answer
  - "refunded"    → Funds returned to asker
  - "failed"      → Payment processing failed
```

### 7. question_type
```
Type: Text (Enum-like)
Required: Yes
Allow NULL: No
Description: Type of question this payment is for

Allowed Values:
  - "quick_consult" → Fixed price, immediate
  - "deep_dive"     → Negotiated price, offer-based
```

### 8. authorized_at
```
Type: Timestamp
Required: Yes
Default: CURRENT_TIMESTAMP
Allow NULL: No
Description: When payment was authorized (funds held on card)
Example: 1729500000000 (Unix timestamp in ms)
Indexed: Yes
```

### 9. accepted_at
```
Type: Timestamp
Required: No
Default: NULL
Allow NULL: Yes
Description: When Deep Dive offer was accepted by expert
Use Case: Deep Dive questions only, NULL for Quick Consult
Example: 1729510000000 or NULL
```

### 10. captured_at
```
Type: Timestamp
Required: No
Default: NULL
Allow NULL: Yes
Description: When payment was captured (after answer delivered)
Example: 1729600000000 or NULL
Indexed: Yes
```

### 11. refunded_at
```
Type: Timestamp
Required: No
Default: NULL
Allow NULL: Yes
Description: When payment was refunded (declined/expired/SLA missed)
Example: 1729650000000 or NULL
```

### 12. capture_attempted
```
Type: Boolean
Required: Yes
Default: false
Allow NULL: No
Description: Whether payment capture was attempted
Used For: Tracking capture retry logic
Values: true, false
```

### 13. capture_failed
```
Type: Boolean
Required: Yes
Default: false
Allow NULL: No
Description: Whether payment capture failed
Used For: Identifying failed captures that need retry
Values: true, false
Indexed: Yes (for retry cron job)
```

### 14. retry_count
```
Type: Integer
Required: Yes
Default: 0
Allow NULL: No
Description: Number of capture retry attempts
Max Value: 3 (after 3 failures, alert admin)
Example: 0, 1, 2, 3
Indexed: Yes (for retry cron job)
```

### 15. error_message
```
Type: Text (Long Text)
Required: No
Default: NULL
Allow NULL: Yes
Description: Error message if payment failed
Example: "Insufficient funds" or NULL
```

### 16. created_at
```
Type: Timestamp
Required: Yes
Default: CURRENT_TIMESTAMP
Allow NULL: No
Description: When payment record was created
Auto-managed: Yes
Indexed: Yes
```

### 17. updated_at
```
Type: Timestamp
Required: Yes
Default: CURRENT_TIMESTAMP
On Update: CURRENT_TIMESTAMP
Allow NULL: No
Description: When payment record was last updated
Auto-managed: Yes
```

---

## 🔄 Payment State Machine

### Quick Consult Flow
```
authorized → captured
     ↓
 refunded (if SLA missed)
```

**States:**
1. **authorized** - Payment created, funds held
2. **captured** - Answer delivered, payment processed
3. **refunded** - SLA missed, funds returned

### Deep Dive Flow
```
authorized → accepted → captured
     ↓           ↓
 refunded    refunded (if SLA missed)
(declined/
 expired)
```

**States:**
1. **authorized** - Offer submitted, funds held
2. **accepted** - Expert accepted offer
3. **captured** - Answer delivered, payment processed
4. **refunded** - Offer declined/expired OR SLA missed

---

## 📈 Indexes

Recommended indexes for performance:

```
1. question_id          - For lookups by question
2. stripe_payment_intent_id - For Stripe webhook lookups
3. status               - For filtering by payment state
4. created_at           - For chronological queries
5. capture_failed, retry_count - For retry cron job
```

---

## 💾 Sample Data

### Quick Consult - Captured
```json
{
  "id": 1,
  "question_id": 118,
  "stripe_payment_intent_id": "pi_3OFRpK2eZvKYlo2C0123456789",
  "amount_cents": 7500,
  "currency": "USD",
  "status": "captured",
  "question_type": "quick_consult",
  "authorized_at": 1729500000000,
  "accepted_at": null,
  "captured_at": 1729600000000,
  "refunded_at": null,
  "capture_attempted": true,
  "capture_failed": false,
  "retry_count": 0,
  "error_message": null,
  "created_at": 1729500000000,
  "updated_at": 1729600000000
}
```

### Deep Dive - Accepted & Captured
```json
{
  "id": 2,
  "question_id": 119,
  "stripe_payment_intent_id": "pi_3OFRpK2eZvKYlo2C0987654321",
  "amount_cents": 18000,
  "currency": "USD",
  "status": "captured",
  "question_type": "deep_dive",
  "authorized_at": 1729500000000,
  "accepted_at": 1729510000000,
  "captured_at": 1729700000000,
  "refunded_at": null,
  "capture_attempted": true,
  "capture_failed": false,
  "retry_count": 0,
  "error_message": null,
  "created_at": 1729500000000,
  "updated_at": 1729700000000
}
```

### Deep Dive - Declined & Refunded
```json
{
  "id": 3,
  "question_id": 120,
  "stripe_payment_intent_id": "pi_3OFRpK2eZvKYlo2C0555555555",
  "amount_cents": 10000,
  "currency": "USD",
  "status": "refunded",
  "question_type": "deep_dive",
  "authorized_at": 1729500000000,
  "accepted_at": null,
  "captured_at": null,
  "refunded_at": 1729520000000,
  "capture_attempted": false,
  "capture_failed": false,
  "retry_count": 0,
  "error_message": null,
  "created_at": 1729500000000,
  "updated_at": 1729520000000
}
```

### Failed Capture - Needs Retry
```json
{
  "id": 4,
  "question_id": 121,
  "stripe_payment_intent_id": "pi_3OFRpK2eZvKYlo2C0777777777",
  "amount_cents": 7500,
  "currency": "USD",
  "status": "accepted",
  "question_type": "quick_consult",
  "authorized_at": 1729500000000,
  "accepted_at": null,
  "captured_at": null,
  "refunded_at": null,
  "capture_attempted": true,
  "capture_failed": true,
  "retry_count": 1,
  "error_message": "Card declined - insufficient funds",
  "created_at": 1729500000000,
  "updated_at": 1729600000000
}
```

---

## 🔍 Common Queries

### Get all captured payments
```
Filter: status = "captured"
```

### Get all pending captures (authorized but not captured)
```
Filter: status = "authorized" OR status = "accepted"
```

### Get failed captures needing retry
```
Filter: capture_failed = true AND retry_count < 3
```

### Get all payments for a question
```
Filter: question_id = 118
```

### Get all Deep Dive payments
```
Filter: question_type = "deep_dive"
```

### Get payments by date range
```
Filter: created_at >= 1729500000000 AND created_at <= 1729600000000
```

---

## 🔗 Relationships

### Belongs To
- **question** (via question_id)

### Used By
- Retry capture cron job (`/api/cron/retry-captures.js`)
- Payment capture endpoint (`/api/payments/capture`)
- Payment cancellation endpoint (`/api/payments/cancel`)
- Answer submission (auto-captures payment)
- Offer decline (auto-refunds payment)
- SLA enforcement (auto-refunds on miss)

---

## ⚠️ Business Rules

1. **One payment per question** - Each question should have exactly one payment record
2. **Status transitions must follow state machine** - Can't skip states
3. **Timestamps must be sequential** - authorized_at < accepted_at < captured_at
4. **Retry limit is 3** - After 3 failed capture attempts, alert admin
5. **Refunds are final** - Once refunded, cannot be captured
6. **Deep Dive requires acceptance** - accepted_at must be set before capture for deep_dive type

---

## 📝 Migration Notes

When populating this table from existing question data:

- Use existing `payment_intent_id` from question table
- If no `payment_intent_id`, generate: `"migrated_" + question.id`
- Set `authorized_at` to question's `paid_at` or `created_at`
- Set `captured_at` to question's `answered_at` (if answered)
- Set `status` based on question's `pricing_status`:
  - 'completed' → 'captured'
  - 'offer_declined', 'offer_expired', 'sla_missed' → 'refunded'
  - 'offer_accepted' → 'accepted'
  - 'paid' → 'authorized'

---

**Last Updated:** October 21, 2025
**Schema Version:** 1.0
**Status:** Production Ready
