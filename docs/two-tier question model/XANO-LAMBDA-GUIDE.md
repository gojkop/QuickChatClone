# Xano Lambda Functions Guide for Migrations

**Date:** October 21, 2025

This guide explains how to use Lambda functions in Xano for database migrations, based on the successful migration of the two-tier question model.

---

## Why Lambda Functions?

Xano's visual interface doesn't support:
- The `??` (nullish coalescing) operator in field mappings
- Complex expressions directly in "Edit Record" or "Add Record" steps
- Conditional logic in field assignments

**Solution:** Use Lambda functions to calculate values BEFORE database operations.

---

## Basic Pattern

### ❌ DOESN'T WORK (Direct field mapping):
```
Edit Record in expert_profile
  - tier1_price_cents = item.price_cents ?? 5000
```

**Error:** `Unable to locate var: item.price_cents ?? 5000`

### ✅ WORKS (Lambda function approach):
```
Step 1: Calculate value (Lambda)
  - Code: return $var.item.price_cents || 5000;
  - return as: calculated_price

Step 2: Edit Record in expert_profile
  - tier1_price_cents = calculated_price (variable)
```

---

## Lambda Function Syntax

### Accessing Variables

Always use `$var` prefix to access variables from previous steps:

```javascript
// ✅ CORRECT
return $var.item.price_cents || 5000;
return $var.question.status;
return $var.calculated_value;

// ❌ WRONG
return item.price_cents || 5000;  // Won't work
return question.status;            // Won't work
```

### Null/Undefined Handling

Use JavaScript's `||` operator for default values:

```javascript
// If price_cents is null, undefined, 0, or empty string, use 5000
return $var.item.price_cents || 5000;

// Multiple fallbacks
return $var.item.final_price_cents || $var.item.price_cents || 0;

// Specific null check
return $var.item.value !== null ? $var.item.value : 0;
```

### Conditional Logic

```javascript
// Simple if/else
var status = 'paid';
if ($var.item.status === 'answered') {
  status = 'completed';
}
return status;

// Multiple conditions
var newStatus = 'paid';
if ($var.item.status === 'answered' || ($var.item.status === 'paid' && $var.item.answered_at !== null)) {
  newStatus = 'completed';
} else if ($var.item.status === 'draft') {
  newStatus = 'draft';
} else if ($var.item.status === 'refunded') {
  newStatus = 'sla_missed';
}
return newStatus;

// Ternary operator
return ($var.item.answered_at !== null) ? false : true;
```

### Date/Time Calculations

```javascript
// Calculate deadline (created_at + SLA hours)
var slaHours = $var.item.sla_hours_snapshot || 24;
var createdAt = new Date($var.item.created_at);
var deadline = new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000));
return deadline.getTime();  // Return as timestamp

// Check if past deadline
var deadline = $var.sla_deadline_timestamp;
return Date.now() > deadline;
```

### String Operations

```javascript
// Concatenation
return 'migrated_' + $var.item.id;

// Template literals (if supported)
return `migrated_${$var.item.id}`;

// Default string
return $var.item.description || "Default description";
```

---

## Common Migration Patterns

### Pattern 1: Copy with Default Value

**Use Case:** Copy existing field to new field, with default if null.

```javascript
// Lambda function
return $var.item.price_cents || 5000;

// Use in Edit Record
tier1_price_cents = calculated_price
```

### Pattern 2: Status Mapping

**Use Case:** Map old status values to new status values.

```javascript
// Lambda function
var newStatus = 'paid';
if ($var.item.status === 'answered') {
  newStatus = 'completed';
} else if ($var.item.status === 'draft') {
  newStatus = 'draft';
} else if ($var.item.status === 'refunded') {
  newStatus = 'sla_missed';
}
return newStatus;

// Use in Edit Record
pricing_status = new_pricing_status
```

### Pattern 3: Conditional Value

**Use Case:** Set value based on condition.

```javascript
// Lambda function
return ($var.payment_status === 'captured') ? $var.item.answered_at : null;

// Use in Edit Record
captured_at = captured_timestamp
```

### Pattern 4: Generate ID

**Use Case:** Use existing ID or generate fallback.

```javascript
// Lambda function
return $var.item.payment_intent_id || ('migrated_' + $var.item.id);

// Use in Add Record
stripe_payment_intent_id = intent_id
```

### Pattern 5: Calculate Timestamp

**Use Case:** Calculate future timestamp based on SLA.

```javascript
// Lambda function
var slaHours = $var.item.sla_hours_snapshot || 24;
var createdAt = new Date($var.item.created_at);
var deadline = new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000));
return deadline.getTime();

// Use in Edit Record
sla_deadline = sla_deadline_timestamp
```

---

## Complete Migration Function Example

Here's the complete pattern used for expert_profile migration:

```
Step 1: Query All Records From expert_profile
  - return as: all_experts

Step 2: For Each Loop On var:all_experts As item

  Step 2.1: Calculate tier1_price (Lambda)
    Code:
      return $var.item.price_cents || 5000;
    return as: calculated_tier1_price

  Step 2.2: Calculate tier1_sla (Lambda)
    Code:
      return $var.item.sla_hours || 24;
    return as: calculated_tier1_sla

  Step 2.3: Edit Record in expert_profile
    - Record to edit: item
    - Fields:
      • tier1_enabled = true (literal boolean)
      • tier1_price_cents = calculated_tier1_price (variable)
      • tier1_sla_hours = calculated_tier1_sla (variable)
      • tier1_description = "Focused advice on your questions" (literal text)
      • tier2_enabled = false (literal boolean)

Step 3: Response
  - migrated_count = all_experts.length
  - status = "success"
```

---

## Debugging Lambda Functions

### Test with Sample Data

1. Add a Lambda function
2. Use `console.log()` for debugging (if Xano supports it)
3. Return the value you want to inspect
4. Run the function with one record
5. Check the response to see the calculated value

Example:
```javascript
// Debug Lambda
console.log('Price:', $var.item.price_cents);
console.log('SLA:', $var.item.sla_hours);
var result = $var.item.price_cents || 5000;
console.log('Result:', result);
return result;
```

### Common Issues

#### Issue: "Unable to locate var: X"

**Cause:** Not using `$var` prefix or variable doesn't exist.

**Solution:**
```javascript
// ❌ Wrong
return item.price_cents;

// ✅ Correct
return $var.item.price_cents;
```

#### Issue: Lambda returns undefined

**Cause:** Forgot to `return` the value.

**Solution:**
```javascript
// ❌ Wrong
var result = $var.item.price_cents || 5000;
// Missing return!

// ✅ Correct
var result = $var.item.price_cents || 5000;
return result;
```

#### Issue: Can't access loop variable

**Cause:** Wrong variable name or not using `$var`.

**Solution:**
```javascript
// If your loop variable is named "item"
// ✅ Correct
return $var.item.id;

// ❌ Wrong
return $var.question.id;  // Wrong variable name
return item.id;           // Missing $var prefix
```

#### Issue: Date calculations wrong

**Cause:** Timestamp vs Date object confusion.

**Solution:**
```javascript
// Convert timestamp to Date object
var createdAt = new Date($var.item.created_at);

// Do calculations
var deadline = new Date(createdAt.getTime() + (24 * 60 * 60 * 1000));

// Return as timestamp
return deadline.getTime();
```

---

## Best Practices

### 1. One Calculation Per Lambda

Keep Lambda functions simple and focused:

```javascript
// ✅ Good - One calculation
return $var.item.price_cents || 5000;

// ❌ Avoid - Too complex
var price = $var.item.price_cents || 5000;
var sla = $var.item.sla_hours || 24;
var description = "Default";
return { price, sla, description };  // Don't return objects
```

### 2. Name Variables Clearly

Use descriptive variable names:

```javascript
// ✅ Good
return as: calculated_tier1_price
return as: new_pricing_status
return as: sla_deadline_timestamp

// ❌ Avoid
return as: temp
return as: value1
return as: result
```

### 3. Handle Null/Undefined Explicitly

Always provide fallback values:

```javascript
// ✅ Good
return $var.item.price_cents || 0;
return $var.item.currency || "USD";

// ❌ Risky
return $var.item.price_cents;  // Could be null
```

### 4. Comment Complex Logic

Add comments for clarity:

```javascript
// Calculate SLA deadline based on hours
var slaHours = $var.item.sla_hours_snapshot || 24;
var createdAt = new Date($var.item.created_at);

// Add SLA hours to created timestamp
var deadline = new Date(createdAt.getTime() + (slaHours * 60 * 60 * 1000));

// Return as Unix timestamp
return deadline.getTime();
```

### 5. Test with Real Data

Before running on all records:
- Test with 1 record first
- Check the calculated values
- Verify the Edit/Add Record step works
- Then run on all records

---

## Field Type Mapping

When setting values in Edit/Add Record:

| Field Type | How to Set | Example |
|------------|-----------|---------|
| Boolean | Literal `true` or `false` | `tier1_enabled = true` |
| Integer | Variable from Lambda | `tier1_price_cents = calculated_price` |
| Text | Literal string in quotes | `tier1_description = "Default text"` |
| Timestamp | Variable from Lambda (number) | `sla_deadline = deadline_timestamp` |
| Null | Literal `null` | `accepted_at = null` |

---

## Complete Checklist for Lambda-Based Migration

- [ ] Create function endpoint with API key auth
- [ ] Add "Query All Records" step
- [ ] Add "For Each Loop" step
- [ ] For each calculated field:
  - [ ] Add Lambda function
  - [ ] Write calculation code using `$var` prefix
  - [ ] Name the return value clearly
  - [ ] Test Lambda returns expected value
- [ ] Add "Edit Record" or "Add Record" step
- [ ] Map Lambda outputs to fields
- [ ] Add "Response" step with status
- [ ] Test with 1-2 records first
- [ ] Run migration for all records
- [ ] Validate results

---

## Quick Reference

### Access loop variable:
```javascript
$var.item.field_name
```

### Default value:
```javascript
$var.item.field_name || default_value
```

### Conditional:
```javascript
condition ? value_if_true : value_if_false
```

### Date calculation:
```javascript
new Date(timestamp + (hours * 60 * 60 * 1000)).getTime()
```

### String concatenation:
```javascript
'prefix_' + $var.item.id
```

---

**Last Updated:** October 21, 2025
**Status:** Production Guide
