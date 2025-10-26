# Implementation Guides & References

Complete guides, troubleshooting documentation, and reference materials for working with QuickChat's Xano backend.

---

## 📄 Documents

### [xano-endpoints.md](./xano-endpoints.md)
**Purpose:** Complete reference of all Xano API endpoints

**Contents:**
- Endpoint list with methods and authentication requirements
- Request/response formats
- Usage examples
- Integration notes

**When to use:**
- Quick reference for endpoint URLs
- Understanding request/response structure
- Finding the right endpoint for a feature

---

### [xano-internal-endpoints.md](./xano-internal-endpoints.md)
**Purpose:** Documentation for internal/cron job endpoints

**Contents:**
- Internal endpoint specifications
- Authentication with `x_api_key`
- Cron job integration patterns
- Media cleanup system

**Key Endpoints:**
- GET /internal/media - Fetch all media/attachment data
- DELETE /internal/media_asset - Delete media asset
- DELETE /internal/magic-link-token - Delete expired tokens

**When to use:**
- Implementing cron jobs
- Building internal tools
- Media cleanup operations

---

### [XANO-LAMBDA-TROUBLESHOOTING.md](./XANO-LAMBDA-TROUBLESHOOTING.md)
**Purpose:** Common Xano Lambda function issues and solutions

**Contents:**
- Variable scoping rules (must use `$var.` prefix)
- Array parameter issues
- Helper function limitations
- Best practices for Lambda code

**Common Errors:**
- `Cannot find name 'conversions'` → Use `$var.conversions`
- `Cannot read properties of undefined` → Add `$var` prefix
- Arrays empty in helper functions → Keep logic flat

**When to use:**
- Debugging Lambda function errors
- Understanding variable scoping
- Optimizing Xano function stacks

---

### [upload-system-master.md](./upload-system-master.md)
**Purpose:** Complete media upload system architecture

**Contents:**
- Cloudflare Stream integration (videos)
- Cloudflare R2 integration (audio/files)
- Multi-segment recording flow
- Media asset database architecture
- Upload endpoints and patterns

**Key Features:**
- Progressive segment uploads
- Presigned URL generation
- Media asset FK-only architecture
- Profile picture uploads
- Attachment handling

**When to use:**
- Implementing new media features
- Debugging upload issues
- Understanding media storage architecture

---

## 🎯 Quick Reference

### Xano Lambda Variable Scoping

**Always use `$var.` prefix:**

```javascript
// ✅ CORRECT
api.lambda {
  code = """
    var total = 0;
    for (var i = 0; i < $var.conversions.length; i++) {
      var c = $var.conversions[i];
      total += c.revenue_cents;
    }
    return total;
  """
}

// ❌ WRONG - Direct variable access doesn't work
api.lambda {
  code = """
    for (var i = 0; i < conversions.length; i++) {
      var c = conversions[i];
    }
  """
}
```

**See:** [XANO-LAMBDA-TROUBLESHOOTING.md](./XANO-LAMBDA-TROUBLESHOOTING.md) for complete guide.

---

### Internal Endpoint Authentication

**Pattern:**
```javascript
// Xano endpoint with x_api_key input
input {
  x_api_key (text)
}

// Validate API key
conditional {
  if ($var.x_api_key != env.XANO_INTERNAL_API_KEY) {
    debug.stop {
      value = '401 error "Unauthorized"'
    }
  }
}
```

**See:** [xano-internal-endpoints.md](./xano-internal-endpoints.md) for complete patterns.

---

### Media Upload Flow

**Video (Cloudflare Stream):**
1. GET `/api/media/get-upload-url` → presigned URL
2. POST video blob to Cloudflare
3. Create `media_asset` record with `asset_id`
4. Link to question/answer via `media_asset_id` FK

**Audio (Cloudflare R2):**
1. POST blob to `/api/media/upload-audio`
2. Backend uploads to R2 with presigned URL
3. Create `media_asset` record
4. Link via FK

**See:** [upload-system-master.md](./upload-system-master.md) for complete architecture.

---

## 🛠️ Troubleshooting

### Lambda Function Errors

**Problem:** `Cannot find name 'variable'`

**Solution:** Add `$var.` prefix
```javascript
// Use $var.variable instead of variable
```

---

**Problem:** Arrays empty in helper functions

**Solution:** Avoid helper functions, keep logic flat
```javascript
// Instead of calling helper functions:
// helper_function($var.array)

// Do this:
api.lambda {
  code = """
    // Process array directly in main function
    for (var i = 0; i < $var.array.length; i++) {
      // ...
    }
  """
}
```

**See:** [XANO-LAMBDA-TROUBLESHOOTING.md](./XANO-LAMBDA-TROUBLESHOOTING.md) for complete troubleshooting guide.

---

### Upload Issues

**Problem:** Video upload succeeds but media_asset not created

**Symptoms:**
- Cloudflare shows video uploaded
- Xano `media_assets` table missing record

**Solution:**
1. Check media_asset creation endpoint was called
2. Verify `asset_id` from Cloudflare matches request
3. Check Xano function stack logs

---

**Problem:** Multi-segment videos not concatenating

**Solution:**
1. Verify segments have correct `segment_index` (0, 1, 2...)
2. Check parent media_asset has all segments in `metadata` JSON
3. Verify client-side playback concatenates in order

**See:** [upload-system-master.md](./upload-system-master.md) for complete media architecture.

---

## 📊 Endpoint Reference

### Authentication Patterns

**User Authentication:**
```
Authorization: Bearer {token}
```

**Internal Authentication:**
```
?x_api_key={XANO_INTERNAL_API_KEY}
```

**Public Endpoints:**
```
No authentication required
```

### Error Response Format

**Xano debug.stop:**
```json
{
  "payload": "403 error \"Forbidden\"",
  "statement": "Stop & Debug"
}
```

**Standard HTTP:**
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

---

## 🔗 Related Documentation

- **Endpoints:** [`../endpoints/README.md`](../endpoints/README.md)
- **Security:** [`../security/README.md`](../security/README.md)
- **Testing:** [`../../testing/README.md`](../../testing/README.md)
- **Main Docs:** [`../../README.md`](../../README.md)

---

## 📖 Best Practices

### Lambda Functions

1. **Always use `$var.` prefix** for variables from function stack
2. **Keep logic flat** - avoid helper functions with array parameters
3. **Use objects as maps** for fast lookups instead of nested loops
4. **Query data separately** before Lambda steps
5. **Test with console.log()** in Xano Run & Debug

### Internal Endpoints

1. **Always validate `x_api_key`** at start of function
2. **Use Public API group** for internal endpoints (avoids auth middleware)
3. **Return structured data** for easy parsing
4. **Include error handling** for edge cases
5. **Document clearly** in xano-internal-endpoints.md

### Media Uploads

1. **Create media_asset records** after successful Cloudflare upload
2. **Use FK-only architecture** (no owner_id/owner_type)
3. **Store segment data** in parent `metadata` JSON
4. **Handle upload failures** gracefully
5. **Test multi-segment flows** thoroughly

---

**Last Updated:** October 26, 2025
**Status:** ✅ Production Ready
**Maintainer:** QuickChat Development Team
