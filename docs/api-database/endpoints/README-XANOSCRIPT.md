# XanoScript File Format (.xs)

**Date:** October 26, 2025
**Change:** Migrated endpoint files from `.md` to `.xs` extension

---

## Why .xs Extension?

All Xano API endpoint implementation files now use the `.xs` (XanoScript) extension instead of `.md` (Markdown).

**Benefits:**
- ✅ Clear indication that files contain XanoScript code
- ✅ Distinct from regular markdown documentation
- ✅ Easier to identify endpoint implementations
- ✅ Better file organization and IDE support

---

## File Naming Convention

**Endpoint Files:** Use `.xs` extension
```
endpoints/
├── questions/
│   ├── quick-consult.xs    ✅ XanoScript
│   ├── deep-dive.xs        ✅ XanoScript
│   └── answer.xs           ✅ XanoScript
├── offers/
│   ├── accept.xs           ✅ XanoScript
│   └── decline.xs          ✅ XanoScript
└── testing/
    └── cleanup-test-data.xs  ✅ XanoScript
```

**Documentation Files:** Use `.md` extension
```
docs/api-database/
├── README.md               ✅ Markdown
├── endpoints/
│   └── README.md           ✅ Markdown
└── security/
    └── README.md           ✅ Markdown
```

---

## XanoScript Syntax

Files with `.xs` extension contain Xano's query language syntax:

```xanoscript
query "endpoint/path" verb=POST {
  input {
    text field_name
    int field_id
  }

  stack {
    conditional {
      if ($input.field_id == 0) {
        debug.stop {
          value = "Invalid ID"
        }
      }
    }

    db.query table_name {
      where = $db.table_name.id == $input.field_id
      return = {type: "single"}
    } as $result
  }

  response = {
    "success": true,
    "data": $result
  }
}
```

**Key Features:**
- No comments (comments must be removed before pasting into Xano)
- Uses `$var.` prefix for variable references
- Uses `$env.` prefix for environment variables
- Lambdas require `timeout` attribute
- Use `debug.stop` for error handling (not `throw` or `return`)

---

## Usage in Xano

1. **Open Xano endpoint** in Script Editor mode (click `<> Edit API`)
2. **Copy entire `.xs` file** contents
3. **Paste into Xano** Script Editor
4. **Save** - Xano will validate syntax
5. **Test** with Run & Debug

**Note:** Do NOT use the Visual Function Stack Builder for `.xs` files - they require Script Editor mode.

---

## Migration Complete

**Files Migrated:** 21 endpoint files
**Documentation Updated:** 5 files

**Updated Documents:**
- `endpoints/README.md` - All endpoint references
- `security/README.md` - Security issue references
- `security/SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md` - Endpoint file references
- `security/PUBLIC-ENDPOINTS-SECURITY-REVIEW.md` - Public endpoint references
- `testing/TEST-DATA-CLEANUP.md` - Cleanup endpoint references

---

## Best Practices

### Creating New Endpoints

**DO:**
- ✅ Use `.xs` extension for all endpoint implementations
- ✅ Test in Xano Script Editor before committing
- ✅ Remove all comments from XanoScript code
- ✅ Use `$var.` prefix for variables
- ✅ Add `timeout` to all lambdas

**DON'T:**
- ❌ Don't use `.md` for endpoint files
- ❌ Don't include comments in `.xs` files
- ❌ Don't forget `$` prefix on variables
- ❌ Don't use `throw` in lambdas (use `debug.stop`)
- ❌ Don't use `return` in conditionals (use `debug.stop`)

### Documenting Endpoints

Keep a clear separation:

**Implementation** (`.xs`):
```
endpoints/questions/quick-consult.xs
```
Contains actual XanoScript code.

**Documentation** (`.md`):
```
endpoints/README.md
security/ENDPOINT-AUDIT-OCT-2025.md
```
Contains descriptions, security notes, usage examples.

---

**Effective Date:** October 26, 2025
**Status:** ✅ Migration Complete
