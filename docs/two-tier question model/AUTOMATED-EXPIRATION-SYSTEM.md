# Automated Expiration System - Cron Jobs

**Last Updated:** October 25, 2025
**Status:** ✅ Production Ready
**Version:** 1.0

---

## Overview

QuickChat uses automated cron jobs to handle two types of question expiration:
1. **Deep Dive Offer Expiration** - Offers not accepted within 24 hours
2. **SLA Expiration** - Questions not answered within the SLA deadline

Both cron jobs run every 15 minutes, cancel Stripe payment intents, update question status, and notify users via email.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Cron Jobs                      │
│                  (runs every 15 minutes)                 │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌───────────────────┐          ┌──────────────────┐
│ cancel-expired-   │          │ cancel-expired-  │
│ offers.js         │          │ slas.js          │
│                   │          │                  │
│ • Finds pending   │          │ • Finds expired  │
│   offers > 24h    │          │   SLA questions  │
│ • Cancels payment │          │ • Cancels payment│
│ • Updates Xano    │          │ • Updates Xano   │
│ • Sends email     │          │ • Sends email    │
└─────────┬─────────┘          └────────┬─────────┘
          │                             │
          ▼                             ▼
    ┌─────────────────────────────────────────┐
    │         Xano Public API Endpoints        │
    │                                          │
    │ GET /questions/pending-offers           │
    │ GET /questions/expired-sla              │
    │ POST /question/{id}/expire-offer        │
    │ POST /question/{id}/expire-sla          │
    └─────────────────────────────────────────┘
          │                             │
          ▼                             ▼
    ┌─────────────────────────────────────────┐
    │             Stripe API                   │
    │                                          │
    │ • Find payment intent by question_id     │
    │ • Cancel payment intent (release funds) │
    └─────────────────────────────────────────┘
```

---

## Cron Job 1: Cancel Expired Offers

**File:** `/api/cron/cancel-expired-offers.js`
**Schedule:** Every 15 minutes
**Purpose:** Cancel Deep Dive offers not accepted within 24 hours

### Flow

1. **Fetch Pending Offers**
   ```
   GET /questions/pending-offers?x_api_key=XXX
   ```
   Returns all questions where:
   - `question_tier` = "tier2"
   - `pricing_status` = "offer_pending"
   - `status` = "paid"

2. **Filter by Age**
   - Calculate cutoff: `now - 24 hours`
   - Skip questions created less than 24h ago

3. **For Each Expired Offer:**

   a. **Cancel Stripe Payment**
   - Search payment intents by `question_id` in metadata
   - Cancel if status is `requires_capture`
   - Release held funds back to asker

   b. **Update Question in Xano**
   ```
   POST /question/{id}/expire-offer?x_api_key=XXX
   Body: {
     payment_canceled: true/false,
     payment_intent_id: "pi_xxx"
   }
   ```
   Updates:
   - `pricing_status` → "offer_expired"
   - `status` → "declined"
   - `decline_reason` → "Offer expired - not accepted within 24 hours"

   c. **Send Email Notification**
   - To: Asker
   - Subject: "Offer expired - Full refund processed"
   - Template: `getOfferExpiredTemplate()`
   - Includes: Expert name, question title, refund details

4. **Summary Report**
   - Total pending offers
   - Offers processed
   - Successfully canceled
   - Errors (if any)

### Error Handling

- **Payment Intent Not Found:** Continues processing (logs warning)
- **Xano Update Failed:** Logs error, continues with email
- **Email Failed:** Logs error, marks as processed
- **High Error Rate (>50%):** Sends admin notification email

### Xano Endpoint: GET /questions/pending-offers

**Path:** `/questions/pending-offers`
**Method:** GET
**Auth:** Query param `x_api_key`

```xano
query "questions/pending-offers" verb=GET {
  input {
    text x_api_key
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        return {
          value = {
            "error": "Unauthorized",
            "status": 401
          }
        }
      }
    }

    db.query question {
      where = $db.question.question_tier == "tier2" && $db.question.pricing_status == "offer_pending" && $db.question.status == "paid"
      return = {type: "list"}
    } as $pending_offers
  }

  response = $pending_offers
}
```

### Xano Endpoint: POST /question/{id}/expire-offer

**Path:** `/question/{id}/expire-offer`
**Method:** POST
**Auth:** Query param `x_api_key`

```xano
query "question/{id}/expire-offer" verb=POST {
  input {
    text x_api_key
    int id
    bool payment_canceled
    text? payment_intent_id?
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        return {
          value = {
            "error": "Unauthorized",
            "status": 401
          }
        }
      }
    }

    db.edit question {
      field_name = "id"
      field_value = $input.id
      data = {
        pricing_status: "offer_expired",
        status: "declined",
        decline_reason: "Offer expired - not accepted within 24 hours"
      }
    } as $updated_question
  }

  response = $updated_question
}
```

---

## Cron Job 2: Cancel Expired SLAs

**File:** `/api/cron/cancel-expired-slas.js`
**Schedule:** Every 15 minutes
**Purpose:** Cancel questions not answered within SLA deadline

### Flow

1. **Fetch Expired SLA Questions**
   ```
   GET /questions/expired-sla?x_api_key=XXX
   ```
   Returns all questions where:
   - `status` IN ["paid", "accepted"]
   - `sla_deadline` < now (deadline has passed)
   - `sla_deadline` IS NOT NULL

2. **For Each Expired Question:**

   a. **Cancel Stripe Payment**
   - Search payment intents by `question_id` in metadata
   - Cancel if status is `requires_capture`
   - Release held funds back to asker

   b. **Update Question in Xano**
   ```
   POST /question/{id}/expire-sla?x_api_key=XXX
   Body: {
     payment_canceled: true/false,
     payment_intent_id: "pi_xxx"
   }
   ```
   Updates:
   - `status` → "declined"
   - `decline_reason` → "SLA expired - question not answered within deadline"

   c. **Send Email Notification**
   - To: Asker
   - Subject: "Offer expired - Full refund processed"
   - Template: `getOfferExpiredTemplate()` (reused)
   - Includes: Expert name, question title, refund details

3. **Summary Report**
   - Total expired SLA questions
   - Questions processed
   - Successfully canceled
   - Errors (if any)

### Error Handling

Same as cancel-expired-offers (see above)

### Xano Endpoint: GET /questions/expired-sla

**Path:** `/questions/expired-sla`
**Method:** GET
**Auth:** Query param `x_api_key`

**Important:** SLA deadlines are stored in **milliseconds**, so we convert to seconds for comparison.

```xano
query "questions/expired-sla" verb=GET {
  input {
    text x_api_key
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        return {
          value = {
            "error": "Unauthorized",
            "status": 401
          }
        }
      }
    }

    db.query question {
      return = {type: "list"}
    } as $all_questions

    api.lambda {
      code = """
        var now = Math.floor(Date.now() / 1000);

        return $var.all_questions.filter(function(q) {
          var isPaidOrAccepted = (q.status === 'paid' || q.status === 'accepted');
          var hasSlaDeadline = q.sla_deadline !== null && q.sla_deadline !== undefined;

          // Convert deadline from milliseconds to seconds for comparison
          var deadlineInSeconds = q.sla_deadline / 1000;
          var isExpired = hasSlaDeadline && deadlineInSeconds < now;

          return isPaidOrAccepted && isExpired;
        });
      """
      timeout = 10
    } as $expired_questions
  }

  response = $expired_questions
}
```

**Why Lambda?** The `where` clause doesn't support complex OR conditions and timestamp unit conversions, so we filter in JavaScript.

### Xano Endpoint: POST /question/{id}/expire-sla

**Path:** `/question/{id}/expire-sla`
**Method:** POST
**Auth:** Query param `x_api_key`

```xano
query "question/{id}/expire-sla" verb=POST {
  input {
    text x_api_key
    int id
    bool payment_canceled
    text? payment_intent_id?
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        return {
          value = {
            "error": "Unauthorized",
            "status": 401
          }
        }
      }
    }

    db.edit question {
      field_name = "id"
      field_value = $input.id
      data = {
        status: "declined",
        decline_reason: "SLA expired - question not answered within deadline"
      }
    } as $updated_question
  }

  response = $updated_question
}
```

---

## Decline Reason Matrix

| Scenario | Status | Pricing Status | Decline Reason | When Set |
|----------|--------|----------------|----------------|----------|
| **Auto-Decline** | declined | offer_declined | "Offer below minimum threshold of $X" | Question creation |
| **Offer Expired** | declined | offer_expired | "Offer expired - not accepted within 24 hours" | Cron job (24h) |
| **SLA Expired** | declined | (unchanged) | "SLA expired - question not answered within deadline" | Cron job (SLA deadline) |
| **Expert Declined** | declined | offer_declined | Expert's custom reason | Manual decline |

---

## Configuration

### Vercel Environment Variables

```bash
XANO_PUBLIC_API_URL=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L
XANO_INTERNAL_API_KEY=your_internal_api_key
CRON_SECRET=your_cron_secret
STRIPE_SECRET_KEY=sk_live_xxx
ZEPTOMAIL_TOKEN=your_zeptomail_token
ZEPTOMAIL_FROM_EMAIL=noreply@mindpick.me
ZEPTOMAIL_FROM_NAME=QuickChat
```

### Xano Environment Variables

```bash
XANO_INTERNAL_API_KEY=your_internal_api_key
```

### Vercel Cron Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/cancel-expired-offers",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/cancel-expired-slas",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/cleanup-orphaned-media",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Schedule Format:** `*/15 * * * *` = every 15 minutes

---

## Testing

### Manual Trigger

You can manually trigger the cron jobs for testing:

```bash
# Test expired offers
curl -X POST https://quickchat-dev.vercel.app/api/cron/cancel-expired-offers \
  -H "Authorization: Bearer $CRON_SECRET"

# Test expired SLAs
curl -X POST https://quickchat-dev.vercel.app/api/cron/cancel-expired-slas \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Expected Response

```json
{
  "success": true,
  "totalPending": 5,
  "processed": 2,
  "canceled": 2,
  "errors": 0
}
```

### Test Data Setup (Xano)

**Create Expired Offer:**
1. Create question with `question_tier` = "tier2"
2. Set `pricing_status` = "offer_pending"
3. Set `status` = "paid"
4. Set `created_at` to 25 hours ago

**Create Expired SLA:**
1. Create question with `status` = "paid"
2. Set `sla_deadline` to a past timestamp (in milliseconds)
   - Example: `1700000000000` (November 2023)

### Monitoring

**Vercel Logs:**
1. Go to Vercel Dashboard → Functions
2. Find `/api/cron/cancel-expired-offers`
3. View execution logs

**Expected Log Output:**
```
⏰ Starting expired offers cancellation cron job...
Current time: 2025-10-25T15:30:00.000Z
Cutoff time: 2025-10-24T15:30:00.000Z

📋 Found 3 pending offers

⏰ Processing expired offer: Question #219
  Created: 2025-10-23T10:00:00.000Z
  Age: 29 hours
  💳 Found payment intent: pi_xxx, status: requires_capture
  💳 Canceling payment intent...
  ✅ Payment canceled successfully
  ✅ Question status updated to expired
  ✅ Expiration notification sent to user@example.com
  ✅ Offer #219 processed successfully

📊 Summary:
  Total pending offers: 3
  Expired offers processed: 1
  Successfully canceled: 1
  Errors: 0
```

---

## Troubleshooting

### Common Issues

**1. 404 Error: "Failed to fetch pending offers"**
- **Cause:** Xano endpoint doesn't exist
- **Solution:** Create endpoints in Xano Public API group

**2. 400 Error: "ParseError: Invalid value for param"**
- **Cause:** Timestamp unit mismatch (milliseconds vs seconds)
- **Solution:** Use Lambda function for filtering (see `/questions/expired-sla`)

**3. No questions returned (empty array)**
- **Check:** Do questions exist with correct status?
- **Check:** Are timestamps in correct format?
- **Debug:** Add console.log in Lambda to inspect data

**4. Payment intent not found**
- **Expected:** Old test questions may not have payment intents
- **Impact:** Question still expires, no payment to cancel
- **Log:** Warning logged, processing continues

**5. High error rate notification**
- **Trigger:** >50% of questions fail to process
- **Action:** Admin email sent to gojkop@gmail.com
- **Check:** Review Vercel logs for error details

### Debug Mode

Add logging to Xano endpoint:

```xano
api.lambda {
  code = """
    var now = Math.floor(Date.now() / 1000);

    console.log('Current timestamp:', now);
    console.log('Total questions:', $var.all_questions.length);

    var filtered = $var.all_questions.filter(function(q) {
      console.log('Question', q.id, '- Status:', q.status, 'Deadline:', q.sla_deadline);
      // ... rest of filter logic
    });

    console.log('Expired questions:', filtered.length);
    return filtered;
  """
} as $expired_questions
```

View output in Xano's API test panel.

---

## Maintenance

### Regular Checks

- **Weekly:** Review Vercel logs for errors
- **Monthly:** Verify cron schedule is active
- **Quarterly:** Review decline reason accuracy

### Metrics to Monitor

- Offer expiration rate (expect <10% of Deep Dive offers)
- SLA expiration rate (expect <5% of all questions)
- Payment cancellation success rate (expect >95%)
- Email delivery success rate (expect >99%)

### Alerts

Consider setting up alerts for:
- Cron job execution failures
- High error rates (>5%)
- Payment cancellation failures
- Email sending failures

---

## Related Documentation

- **Payment Capture System:** `docs/two-tier question model/migrations/PAYMENT-TABLE-REFERENCE.md`
- **Two-Tier Pricing:** `docs/two-tier question model/IMPLEMENTATION-STATUS.md`
- **Email Templates:** `api/lib/email-templates/`
- **Stripe Integration:** `api/lib/stripe.js`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 25, 2025 | Initial documentation - system fully operational |

---

**Status:** ✅ Production Ready
**Last Tested:** October 25, 2025
**Maintained By:** Development Team
