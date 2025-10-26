# QuickChat Documentation

> Complete technical documentation for the QuickChat (mindPick) platform

**Last Updated:** October 26, 2025

--- 

## 📚 Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Features](#features)
- [Testing](#testing)
- [Development](#development)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Quick Links

- **Main Guide:** [`CLAUDE.md`](./CLAUDE.md) - Complete technical guide for developers
- **Architecture:** [`mindpick-technical-architecture.md`](./mindpick-technical-architecture.md)
- **Strategic Overview:** [`mindpick-strategic-onepager.md`](./mindpick-strategic-onepager.md)

### Project Overview

QuickChat (mindPick) is a video-based Q&A platform connecting askers with experts. Users record video questions, experts respond with video answers.

**Key Technologies:**
- React 18 + Vite + Tailwind CSS
- Node.js serverless functions (Vercel)
- Xano (Database & REST API)
- Cloudflare Stream (video) + R2 (storage)
- Google Gemini AI (question coaching)

---

## 🏗️ Architecture

### System Architecture

| Document | Description |
|----------|-------------|
| [`mindpick-technical-architecture.md`](./mindpick-technical-architecture.md) | Complete system architecture |
| [`upload-system-master.md`](./upload-system-master.md) | Media upload system guide |
| [`CLEANUP-SYSTEM-UPDATE.md`](./CLEANUP-SYSTEM-UPDATE.md) | Automated cleanup system |

### Database & API

| Document | Description |
|----------|-------------|
| [`api-database/README.md`](./api-database/README.md) | Complete API & Database documentation index |
| [`api-database/endpoints/README.md`](./api-database/endpoints/README.md) | Xano endpoint implementations (organized by feature) |
| [`api-database/endpoints/README-XANOSCRIPT.md`](./api-database/endpoints/README-XANOSCRIPT.md) | **XanoScript (.xs) file format guide** |
| [`api-database/security/README.md`](./api-database/security/README.md) | Security audits, reviews, and fixes |
| [`api-database/guides/README.md`](./api-database/guides/README.md) | Implementation guides and troubleshooting |
| [`api-database/migrations/README.md`](./api-database/migrations/README.md) | Database migration documentation |

**Quick Links:**
- [Xano Endpoints Reference](./api-database/guides/xano-endpoints.md) - Complete API endpoint list
- [Internal Endpoints](./api-database/guides/xano-internal-endpoints.md) - Internal/cron job endpoints
- [Lambda Troubleshooting](./api-database/guides/XANO-LAMBDA-TROUBLESHOOTING.md) - Common Xano issues
- [Security Audit (Oct 2025)](./api-database/security/ENDPOINT-AUDIT-OCT-2025.md) - Current security status

**Note:** All Xano endpoint implementations use `.xs` extension (XanoScript format). See [README-XANOSCRIPT.md](./api-database/endpoints/README-XANOSCRIPT.md) for details.

---

## ✨ Features

### Authentication

| Document | Description |
|----------|-------------|
| [`magic-link-authentication-guide.md`](./magic-link-authentication-guide.md) | Passwordless email authentication |

**Supported Methods:**
- Google OAuth
- LinkedIn OAuth
- Magic Link (passwordless email)

### Media & Downloads

| Document | Description |
|----------|-------------|
| [`ZIP-DOWNLOAD-FEATURE.md`](./ZIP-DOWNLOAD-FEATURE.md) | ZIP download implementation |
| [`ENABLE-DOWNLOADS-MIGRATION.md`](./ENABLE-DOWNLOADS-MIGRATION.md) | Enable Cloudflare Stream downloads |
| [`upload-system-master.md`](./upload-system-master.md) | Upload system architecture |

**Features:**
- Multi-segment video/audio recording
- ZIP downloads for questions & answers
- Cloudflare Stream video processing
- R2 storage for audio & attachments

### Marketing & Analytics

| Document | Description |
|----------|-------------|
| [`marketing module/IMPLEMENTATION-MASTER-GUIDE.md`](./marketing%20module/IMPLEMENTATION-MASTER-GUIDE.md) | Marketing module overview |
| [`marketing module/FEATURE-SHARE-PROFILE.md`](./marketing%20module/FEATURE-SHARE-PROFILE.md) | Profile sharing (QR codes, social) |
| [`QR-CODE-IMPLEMENTATION-GUIDE.md`](./QR-CODE-IMPLEMENTATION-GUIDE.md) | QR code generation |

**Features:**
- UTM campaign tracking
- Traffic source analytics
- QR code profile sharing
- Social media templates

### AI Features (MindPilot)

| Document | Description |
|----------|-------------|
| [`mindpilot/quickchat-ai-implementation-spec.md`](./mindpilot/quickchat-ai-implementation-spec.md) | Complete AI feature spec |
| [`mindpilot/mindpilot-strategy-doc.md`](./mindpilot/mindpilot-strategy-doc.md) | AI strategy & roadmap |
| [`mindpilot/mindpilot-component-library.md`](./mindpilot/mindpilot-component-library.md) | AI UI components |

**Implemented:**
- ✅ Question Coach (Tier 1-2): Rule-based validation + AI guidance

**Planned:**
- ⏳ Question Coach (Tier 3): Post-payment enhancement
- ⏳ Expert Co-pilot: Answer assistance
- ⏳ Knowledge Graph: Semantic Q&A retrieval

### Admin & Feedback

| Document | Description |
|----------|-------------|
| [`admin/admin-architecture-doc-spec.md`](./admin/admin-architecture-doc-spec.md) | Admin panel architecture |
| [`admin/feedback-system-implementation.md`](./admin/feedback-system-implementation.md) | Feedback & ratings system |

### Email Integration

| Document | Description |
|----------|-------------|
| [`zeptomail-implementation.md`](./zeptomail-implementation.md) | ZeptoMail email service |
| [`email integration/files/EMAIL-README.md`](./email%20integration/files/EMAIL-README.md) | Email templates & flow |

### Launch Features

| Document | Description |
|----------|-------------|
| [`launch features/feature_flags_documentation.md`](./launch%20features/feature_flags_documentation.md) | Feature flag system |
| [`launch features/wow-effect-onboarding.md`](./launch%20features/wow-effect-onboarding.md) | Onboarding experience |

### Brand & Design

| Document | Description |
|----------|-------------|
| [`brand/brand-kit.md`](./brand/brand-kit.md) | Brand guidelines & assets |

---

## 🧪 Testing

### Security Test Suite

| Document | Description |
|----------|-------------|
| [`testing/README.md`](./testing/README.md) | Main testing documentation index |
| [`testing/SECURITY-VALIDATION-GUIDE.md`](./testing/SECURITY-VALIDATION-GUIDE.md) | Complete security test suite documentation |
| [`testing/XANO-MANUAL-TESTING.md`](./testing/XANO-MANUAL-TESTING.md) | Manual testing payloads for Xano Run & Debug |
| [`testing/BEST-PRACTICES.md`](./testing/BEST-PRACTICES.md) | Testing best practices and guidelines |

**Status:** ✅ Production Ready (October 26, 2025)

**Test Coverage:**
- ✅ Authentication enforcement (unauthenticated requests rejected)
- ✅ Cross-expert ownership checks (Expert A ≠ Expert B resources)
- ✅ Payment reuse prevention (payment_intent_id unique)
- ✅ Token protection (playback_token_hash never exposed)
- ✅ Input validation (rating ranges, required fields)

**Run Tests:**
```bash
./tests/run-security-tests.sh
```

**Expected Output:**
```
✓ Passed:  16
✗ Failed:  0
⊘ Skipped: 0

ALL SECURITY TESTS PASSED!
```

**Configuration:**
Tests require `/tests/.env` with auth tokens and test IDs. See [`testing/README.md`](./testing/README.md) for setup.

---

## 💻 Development

### Setup & Commands

```bash
# Development
npm run dev                 # Start dev server (port 5173)
npm run build              # Production build
npm run preview            # Preview build

# Deployment
npm run vercel:dev         # Local Vercel environment
npm run vercel:deploy      # Deploy to production
```

### Environment Variables

See [`CLAUDE.md - Environment Variables`](./CLAUDE.md#environment-variables) for complete list.

**Required:**
- `XANO_BASE_URL` - Xano API base URL
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account
- `CLOUDFLARE_STREAM_API_TOKEN` - Stream API token
- `GOOGLE_AI_API_KEY` - Gemini AI key

### Development Workflow

1. **Backend:** Create endpoint in `/api/[feature]/[action].js`
2. **Frontend:** Create hook in `/src/hooks/use[Feature].js`
3. **UI:** Build component in `/src/components/[category]/[Component].jsx`
4. **Test:** Test locally with `npm run vercel:dev`
5. **Deploy:** Push to GitHub → Vercel auto-deploys

---

## 📖 API Reference

### Public Endpoints

See [`api-database/guides/xano-endpoints.md`](./api-database/guides/xano-endpoints.md) for complete API reference.

**Key Endpoints:**
- `GET /review/{token}` - Get answer for review
- `POST /review/{token}/feedback` - Submit feedback
- `POST /questions/create` - Create question
- `POST /answer` - Submit answer

### Internal Endpoints

See [`api-database/guides/xano-internal-endpoints.md`](./api-database/guides/xano-internal-endpoints.md) for admin/internal APIs.

**Key Endpoints:**
- `GET /internal/media` - Fetch all media (cleanup)
- `DELETE /internal/media_asset` - Delete media asset
- `DELETE /internal/magic-link-token` - Delete token

### Endpoint Organization

All endpoint implementations are organized by feature in [`api-database/endpoints/`](./api-database/endpoints/):
- **questions/** - Question creation and management
- **offers/** - Deep Dive offer management
- **payments/** - Payment operations
- **reviews/** - Review and feedback
- **user/** - User account and profile
- **media/** - Media upload and management
- **public/** - Public endpoints

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Document |
|-------|----------|
| Xano Lambda errors | [`api-database/guides/XANO-LAMBDA-TROUBLESHOOTING.md`](./api-database/guides/XANO-LAMBDA-TROUBLESHOOTING.md) |
| OAuth not working | [`CLAUDE.md - Troubleshooting`](./CLAUDE.md#troubleshooting) |
| Upload failures | [`upload-system-master.md`](./upload-system-master.md) |
| Download 404 errors | [`ENABLE-DOWNLOADS-MIGRATION.md`](./ENABLE-DOWNLOADS-MIGRATION.md) |
| ZIP download issues | [`ZIP-DOWNLOAD-FEATURE.md`](./ZIP-DOWNLOAD-FEATURE.md#troubleshooting) |
| Security issues | [`api-database/security/README.md`](./api-database/security/README.md) |
| Endpoint errors | [`api-database/endpoints/README.md`](./api-database/endpoints/README.md) |

### Debug Checklist

**Frontend Issues:**
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify `qc_token` in localStorage

**Backend Issues:**
1. Check Vercel function logs
2. Verify environment variables
3. Test endpoint with curl/Postman

**Media Issues:**
1. Check Cloudflare Stream dashboard
2. Verify UIDs match Xano records
3. Check `media_assets` table status

---

## 📁 Documentation Structure

```
docs/
├── README.md                          # This file (documentation index)
├── CLAUDE.md                          # Main technical guide
├── mindpick-technical-architecture.md # System architecture
├── mindpick-strategic-onepager.md    # Strategic overview
│
├── Features/
│   ├── ZIP-DOWNLOAD-FEATURE.md
│   ├── QR-CODE-IMPLEMENTATION-GUIDE.md
│   ├── magic-link-authentication-guide.md
│   ├── ENABLE-DOWNLOADS-MIGRATION.md
│   └── CLEANUP-SYSTEM-UPDATE.md
│
├── API & Database/
│   └── api-database/
│       ├── README.md                          # API documentation index
│       ├── endpoints/                         # Organized by feature
│       │   ├── questions/                     # Question endpoints
│       │   ├── offers/                        # Deep Dive offers
│       │   ├── payments/                      # Payment operations
│       │   ├── reviews/                       # Review & feedback
│       │   ├── user/                          # User management
│       │   ├── media/                         # Media upload
│       │   └── public/                        # Public endpoints
│       ├── security/                          # Security docs
│       │   ├── ENDPOINT-AUDIT-OCT-2025.md
│       │   └── SECURITY-REVIEW-HIGH-PRIORITY-ENDPOINTS.md
│       ├── guides/                            # Implementation guides
│       │   ├── xano-endpoints.md
│       │   ├── xano-internal-endpoints.md
│       │   └── XANO-LAMBDA-TROUBLESHOOTING.md
│       ├── migrations/                        # Database migrations
│       │   └── MEDIA-ASSET-MIGRATION-OCT-2025.md
│       └── archive/                           # Historical docs
│
├── Testing/
│   └── testing/
│       ├── README.md
│       ├── SECURITY-VALIDATION-GUIDE.md
│       ├── XANO-MANUAL-TESTING.md
│       └── BEST-PRACTICES.md
│
├── Marketing/
│   └── marketing module/
│       ├── IMPLEMENTATION-MASTER-GUIDE.md
│       ├── FEATURE-SHARE-PROFILE.md
│       └── [other marketing docs]
│
├── AI (MindPilot)/
│   └── mindpilot/
│       ├── quickchat-ai-implementation-spec.md
│       ├── mindpilot-strategy-doc.md
│       └── mindpilot-component-library.md
│
├── Admin/
│   └── admin/
│       ├── admin-architecture-doc-spec.md
│       └── feedback-system-implementation.md
│
├── Email/
│   ├── zeptomail-implementation.md
│   └── email integration/
│
├── Launch/
│   └── launch features/
│       ├── feature_flags_documentation.md
│       └── wow-effect-onboarding.md
│
└── Brand/
    └── brand/
        └── brand-kit.md
```

---

## 🎯 Quick Reference

### Feature Status

| Feature | Status | Documentation |
|---------|--------|---------------|
| Security Test Suite | ✅ Production | [`testing/`](./testing/) |
| ZIP Downloads | ✅ Production | [`ZIP-DOWNLOAD-FEATURE.md`](./ZIP-DOWNLOAD-FEATURE.md) |
| QR Code Sharing | ✅ Production | [`QR-CODE-IMPLEMENTATION-GUIDE.md`](./QR-CODE-IMPLEMENTATION-GUIDE.md) |
| Magic Link Auth | ✅ Production | [`magic-link-authentication-guide.md`](./magic-link-authentication-guide.md) |
| Marketing Module | ✅ Production | [`marketing module/`](./marketing%20module/) |
| AI Coach (Tier 1-2) | ✅ Production | [`mindpilot/quickchat-ai-implementation-spec.md`](./mindpilot/quickchat-ai-implementation-spec.md) |
| AI Coach (Tier 3) | ⏳ Planned | Same as above |
| Expert Co-pilot | ⏳ Planned | Same as above |
| Knowledge Graph | ⏳ Planned | Same as above |

### Recent Updates

- **Oct 26, 2025:** API & Database documentation reorganized (structured by feature)
- **Oct 26, 2025:** Security test suite expanded (16 automated tests)
- **Oct 16, 2025:** ZIP download feature + CORS fix
- **Oct 16, 2025:** QR code profile sharing
- **Oct 14, 2025:** Marketing module complete
- **Jan 2025:** Magic link authentication

---

## 🤝 Contributing

When adding new features:

1. **Update Documentation:**
   - Create feature-specific doc in appropriate folder
   - Update this README.md
   - Update CLAUDE.md if major feature
   - Add to "Recent Updates" section

2. **Documentation Standards:**
   - Include status badge (✅ Production / ⏳ Planned / 🚧 In Progress)
   - Date created/completed
   - Technical implementation details
   - Troubleshooting section
   - Examples and usage

3. **Commit Message:**
   - Descriptive commit message
   - Reference documentation updates
   - Include feature completion date

---

## 📞 Support

**Primary Documentation:** [`CLAUDE.md`](./CLAUDE.md)

**For Issues:**
- Check [Troubleshooting](#troubleshooting) section
- Review relevant feature documentation
- Check Vercel logs for backend issues
- Review browser console for frontend issues

---

**Platform:** QuickChat (mindPick)
**Documentation Version:** 2.1
**Last Updated:** October 26, 2025
