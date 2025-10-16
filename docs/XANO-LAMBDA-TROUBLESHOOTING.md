# Xano Lambda Functions - Troubleshooting Guide

**Date:** October 16, 2025
**Status:** Production Learnings

---

## Critical Rule: Variable Scoping

### The Problem

Xano Lambda functions **cannot directly access variables** from previous function stack steps by typing their names. This is different from many other programming environments.

### The Solution

**Always use `$var.variableName` syntax** to access variables from previous steps.

---

## Example: Revenue Calculation Issue

### What We Tried (And Failed)

#### ❌ Attempt 1: Using Relationships
```javascript
// Step 2: Query conversions WITH relationships
// Relationships: Load question (to get price_cents)

// Step 3: Lambda
for (var i = 0; i < conversions.length; i++) {
  var visit = conversions[i]
  if (visit.question && visit.question.price_cents) {
    totalRevenue += visit.question.price_cents
  }
}
```
**Problem:** Relationships don't work reliably in all Xano configurations.

---

#### ❌ Attempt 2: SQL Query with Parameters
```sql
SELECT SUM(q.price_cents) as total_revenue
FROM campaign_visits cv
LEFT JOIN question q ON cv.question_id = q.id
WHERE cv.campaign_id = {{campaign_id}}
```
**Problem:** Parameter syntax (`{{}}`, `$`, `{}`) all caused SQL syntax errors.

---

#### ❌ Attempt 3: For Each Loop with Get Record
```javascript
// Step 4: For Each Loop on questionIds
// Step 4.1: Get Record from question where id = currentQuestionId
// Step 4.2: Lambda to accumulate revenue
```
**Problem:** Variables not accessible inside loop Lambda functions. Got errors like:
- "Cannot find name 'questionRecord'"
- "Cannot find name 'metrics'"

---

#### ❌ Attempt 4: Helper Function with Array Parameters
```javascript
// Create helper function: calculate_revenue_from_data
// Inputs: conversions (object), all_questions (object), visitCount (integer)

// Pass arrays from main function
```
**Problem:** Arrays arrived empty at the helper function, even though they had data in the parent.

---

#### ❌ Attempt 5: Direct Variable Access in Lambda
```javascript
// Step 5: Lambda
var totalRevenue = 0
for (var i = 0; i < conversions.length; i++) {  // ❌ ERROR
  var conversion = conversions[i]
  // ...
}
```
**Errors:**
- `[Line 2] conversions is not defined`
- `Cannot read properties of undefined (reading 'length')`

---

### ✅ What Actually Works

#### The Working Solution

**Function Stack:**

1. **Step 1:** Query `campaign_visits` → Count → Save as `visitCount`
2. **Step 2:** Query `campaign_visits` with filters → Save as `conversions`
3. **Step 3:** Query ALL records from `question` → Save as `all_questions`
4. **Step 4:** Lambda with `$var` syntax:

```javascript
// Build a map of question prices for fast lookup
var priceMap = {}
for (var i = 0; i < $var.all_questions.length; i++) {  // ✅ $var prefix
  var q = $var.all_questions[i]
  priceMap[q.id] = q.price_cents || 0
}

// Calculate total revenue
var totalRevenue = 0
for (var j = 0; j < $var.conversions.length; j++) {  // ✅ $var prefix
  var conversion = $var.conversions[j]
  var questionId = conversion.question_id
  if (questionId && priceMap[questionId]) {
    totalRevenue = totalRevenue + priceMap[questionId]
  }
}

// Calculate metrics
var totalQuestions = $var.conversions.length  // ✅ $var prefix
var conversionRate = $var.visitCount > 0  // ✅ $var prefix
  ? (totalQuestions / $var.visitCount) * 100
  : 0

return {
  totalQuestions: totalQuestions,
  totalRevenue: totalRevenue,
  conversionRate: parseFloat(conversionRate.toFixed(2))
}
```

5. **Step 5:** Edit Record in `utm_campaigns`
6. **Step 6:** Return response

---

## Key Takeaways

### 1. Always Use `$var` Prefix

```javascript
// ❌ WRONG
var length = conversions.length

// ✅ CORRECT
var length = $var.conversions.length
```

### 2. Query All Data Before Lambda

Instead of trying to use relationships or loops, query all necessary data in separate steps, then process in Lambda.

```javascript
// Step 1: Query table A
// Step 2: Query table B
// Step 3: Lambda - join them manually using $var.tableA and $var.tableB
```

### 3. Use Maps for Lookups

When joining data manually in Lambda, use JavaScript objects as maps:

```javascript
var priceMap = {}
for (var i = 0; i < $var.all_questions.length; i++) {
  var q = $var.all_questions[i]
  priceMap[q.id] = q.price_cents || 0
}

// Now you can do O(1) lookups
var price = priceMap[questionId]
```

### 4. Avoid Nested Function Calls

Helper functions with array parameters don't work reliably. Keep all logic in the main function's Lambda steps.

---

## Debugging Tips

### 1. Add Console Logs

```javascript
console.log('conversions type:', typeof $var.conversions)
console.log('conversions length:', $var.conversions.length)
console.log('conversions value:', JSON.stringify($var.conversions))
```

Check Xano's debugger output to see actual values.

### 2. Check Variable Panel

In Xano's debugger, expand the "Variables" panel to see what's actually stored in each variable after each step.

### 3. Test Step by Step

- Run function in debugger
- Click on each step to see its output
- Verify data is what you expect before the Lambda step

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Cannot find name 'conversions'` | Direct variable access | Use `$var.conversions` |
| `Cannot read properties of undefined (reading 'length')` | Variable is undefined | Add `$var` prefix |
| `conversions is not defined` | Scoping issue | Use `$var.conversions` |
| `ParseError: Invalid value for param` | Wrong parameter syntax in query | Use `$var` or input picker |

---

## Related Documentation

- **Marketing Functions:** `/docs/marketing module/IMPLEMENTATION-STEP-2-FUNCTIONS.md`
- **Project Overview:** `/docs/CLAUDE.md`

---

## Support

If you encounter Lambda scoping issues:

1. **Check syntax:** Are you using `$var.variableName`?
2. **Check debugger:** What's actually in the variable?
3. **Query separately:** Can you query the data in a separate step?
4. **Avoid nesting:** Keep logic flat in the main function

---

**Last Updated:** October 16, 2025
**Status:** ✅ Working Solution Documented
