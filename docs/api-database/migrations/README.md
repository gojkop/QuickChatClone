# Database & Feature Migrations

Documentation for major database schema changes and feature migrations in QuickChat's Xano backend.

---

## 📄 Migration Documents

### [MEDIA-ASSET-MIGRATION-OCT-2025.md](./MEDIA-ASSET-MIGRATION-OCT-2025.md)
**Date:** October 24-25, 2025
**Type:** Database Architecture Migration

**Summary:**
Migrated media asset architecture from bidirectional relationships to FK-only (foreign key only) relationships.

**Changes:**
- ❌ **Removed:** `owner_type` and `owner_id` columns from `media_asset` table
- ✅ **Added:** Foreign key references in parent tables (`question.media_asset_id`, `answer.media_asset_id`)
- ✅ **Simplified:** One-way relationships (parent → media, not bidirectional)

**Before Architecture:**
```
media_asset
├── id
├── owner_type ('question' | 'answer')  ❌ REMOVED
├── owner_id                            ❌ REMOVED
├── asset_id (Cloudflare UID)
└── ...

question/answer
└── (no direct reference)
```

**After Architecture:**
```
media_asset
├── id
├── asset_id (Cloudflare UID)
└── ...

question
├── id
├── media_asset_id → FK to media_asset.id  ✅ ADDED
└── ...

answer
├── id
├── media_asset_id → FK to media_asset.id  ✅ ADDED
└── ...
```

**Benefits:**
- ✅ Simpler queries (no need to filter by owner_type)
- ✅ Better database normalization
- ✅ Easier to add new media types (just add FK)
- ✅ Reduced coupling between tables
- ✅ Cleaner Xano function stacks

**Impact:**
- All media-related endpoints updated
- Expert dashboard components updated
- Answer/question creation flows updated
- Media cleanup system updated

**Rollout:**
- Backend changes deployed October 24, 2025
- Frontend changes deployed October 25, 2025
- No data migration needed (schema additive)
- Zero downtime deployment

**See document for:**
- Complete technical details
- Step-by-step migration guide
- Before/after code comparisons
- Testing procedures

---

### [xano-delete-account-implementation.md](./xano-delete-account-implementation.md)
**Date:** October 2025
**Type:** Feature Implementation

**Summary:**
Complete GDPR-compliant account deletion implementation with cascade delete for all user data.

**Features:**
- ✅ Delete user's answers and associated media
- ✅ Delete user's questions and associated media
- ✅ Delete marketing data (campaigns, visits)
- ✅ Delete expert profile
- ✅ Delete user account record
- ✅ Cascade delete all foreign key relationships

**Endpoint:** `DELETE /me/delete-account`

**Deletion Order:**
1. User's answers + media assets
2. User's questions + media assets
3. Marketing data (campaign_visits, utm_campaigns)
4. Expert profile
5. User record

**Database Tables Affected:**
- `answer` - User's expert answers
- `question` - User's questions to experts
- `media_asset` - Associated media files
- `campaign_visit` - UTM visit tracking
- `utm_campaign` - Marketing campaigns
- `expert_profile` - Expert configuration
- `user` - User account

**Security:**
- Requires authentication
- Validates expert profile exists
- Uses correct foreign key references
- Handles null media_asset_id cases

**Data Safety:**
- ⚠️ Irreversible operation
- No soft delete (permanent deletion)
- Cloudflare media NOT deleted (handled by cleanup cron)
- Database records deleted immediately

**Known Issues Fixed:**
- ✅ Variable reference bug ($answers → $questions) - Fixed October 26, 2025
- ✅ FK reference bug ($user_id → $expert_profile.id) - Fixed October 26, 2025

**See document for:**
- Complete Xano function stack
- Step-by-step implementation guide
- Testing procedures
- Security considerations

---

## 📊 Migration Timeline

| Date | Migration | Type | Status |
|------|-----------|------|--------|
| October 2025 | Account deletion implementation | Feature | ✅ Production |
| October 24-25, 2025 | Media asset architecture | Database | ✅ Production |

---

## 🔄 Migration Process

### Planning Phase
1. **Document current state** - Schema, queries, dependencies
2. **Design new architecture** - Schema changes, data flow
3. **Identify impact** - Affected endpoints, components, features
4. **Create rollback plan** - Recovery procedures

### Implementation Phase
1. **Update database schema** - Add/remove columns, create FKs
2. **Update Xano endpoints** - Function stack modifications
3. **Update frontend code** - Component and hook changes
4. **Update documentation** - Architecture docs, guides

### Testing Phase
1. **Manual testing** - Xano Run & Debug
2. **Integration testing** - Full user flows
3. **Security testing** - Automated test suite
4. **Performance testing** - Query optimization

### Deployment Phase
1. **Backend deployment** - Xano changes
2. **Frontend deployment** - Vercel/React changes
3. **Monitoring** - Error logs, user reports
4. **Validation** - Confirm migration success

---

## 🛠️ Migration Best Practices

### Database Migrations

**DO:**
- ✅ Make changes additive when possible (add columns, don't remove)
- ✅ Test thoroughly in development environment
- ✅ Create comprehensive rollback plans
- ✅ Document all changes with before/after examples
- ✅ Coordinate backend and frontend deployments

**DON'T:**
- ❌ Remove columns immediately (deprecate first)
- ❌ Change data types without migration script
- ❌ Deploy breaking changes without version compatibility
- ❌ Modify production schema without backup
- ❌ Skip testing with real data

### Feature Migrations

**DO:**
- ✅ Implement feature flags for gradual rollout
- ✅ Maintain backward compatibility during transition
- ✅ Provide clear upgrade path for users
- ✅ Monitor metrics before/after migration
- ✅ Document new patterns and guidelines

**DON'T:**
- ❌ Force immediate adoption of new features
- ❌ Break existing user workflows
- ❌ Remove old features without deprecation period
- ❌ Deploy major changes during peak hours
- ❌ Skip communication with stakeholders

---

## 📋 Migration Checklist

### Before Migration

- [ ] Document current architecture
- [ ] Design new architecture
- [ ] Create migration plan
- [ ] Identify all affected code
- [ ] Create rollback procedure
- [ ] Set up test environment
- [ ] Get stakeholder approval

### During Migration

- [ ] Update database schema
- [ ] Update Xano endpoints
- [ ] Update frontend code
- [ ] Run automated tests
- [ ] Manual testing in staging
- [ ] Update documentation
- [ ] Deploy backend changes
- [ ] Deploy frontend changes

### After Migration

- [ ] Verify production functionality
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Update training materials
- [ ] Archive migration docs
- [ ] Post-mortem review

---

## 🔗 Related Documentation

- **Endpoints:** [`../endpoints/README.md`](../endpoints/README.md)
- **Security:** [`../security/README.md`](../security/README.md)
- **Guides:** [`../guides/README.md`](../guides/README.md)
- **Testing:** [`../../testing/README.md`](../../testing/README.md)

---

## 📖 Historical Migrations

### Completed Migrations

1. **Media Asset Architecture (Oct 2025)**
   - Transitioned from bidirectional to FK-only
   - Zero downtime deployment
   - 100% success rate

2. **Account Deletion (Oct 2025)**
   - GDPR-compliant implementation
   - Cascade delete with media cleanup
   - Security bugs fixed Oct 26

### Planned Migrations

None currently planned. Check back for future updates.

---

**Last Updated:** October 26, 2025
**Total Migrations:** 2 completed
**Status:** ✅ All migrations successful
