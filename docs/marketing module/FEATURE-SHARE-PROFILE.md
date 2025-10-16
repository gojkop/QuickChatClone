# Feature: Expert Profile Sharing Module

**Status:** 🚧 In Progress (Phase 2 Complete)
**Priority:** Medium
**Estimated Time:** 6-8 hours (2 hours completed)
**Dependencies:** Marketing Module (Step 3 & 4 complete)

---

## 🎯 Overview

A comprehensive profile sharing toolkit that makes it easy for experts to share their mindPick profile via phone in any context - in-person meetings, networking events, emails, and social media.

### Problem Statement

Experts need multiple ways to share their profile depending on context:
- **In-person:** Quick share via native phone features
- **Async:** Email signatures, social bios
- **Events:** QR codes for business cards/slides
- **Digital:** Copy/paste links with tracking

Currently, experts must manually type/copy their profile URL, which creates friction and reduces shares.

---

## 📱 User Experience

### Where It Lives

**Primary Location:** Expert Dashboard → New "Share Profile" card

**Secondary Locations:**
- Expert Profile Settings page (link to share tools)
- Mobile bottom sheet (quick access)
- Marketing Dashboard → Share Kit tab (integrated)

### Visual Design

```
┌─────────────────────────────────────────┐
│  📤 Share Your Profile                  │
├─────────────────────────────────────────┤
│                                         │
│  Quick Actions:                         │
│  ┌──────────────┐ ┌──────────────┐    │
│  │    Share     │ │  Copy Link   │    │
│  │      📲      │ │      📋      │    │
│  │  Tap to open │ │  Copied! ✓   │    │
│  └──────────────┘ └──────────────┘    │
│                                         │
│  ┌──────────────┐ ┌──────────────┐    │
│  │   Show QR    │ │ Get Email    │    │
│  │      📷      │ │  Signature   │    │
│  │  Full screen │ │   Copy HTML  │    │
│  └──────────────┘ └──────────────┘    │
│                                         │
│  Your Profile URL:                      │
│  ┌─────────────────────────────────┐  │
│  │ mindpick.me/u/yourhandle  [📋] │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Share Analytics (Last 7 days):        │
│  • Link clicks: 24                     │
│  • QR scans: 8                         │
│  • Email opens: 12                     │
└─────────────────────────────────────────┘
```

---

## 🎨 Features Breakdown

### Phase 1: Core Sharing (MVP) - 3 hours

**1.1 Native Share API**
- Tap "Share" → Opens iOS/Android share sheet
- Pre-filled message: "Ask me anything about {specialty} - €{price} for video answer within {sla}h"
- Includes profile URL: `https://mindpick.me/u/{handle}`
- Tracks share attempts (analytics)

**1.2 Smart Clipboard Copy**
- "Copy Link" button
- Success toast: "Link copied! ✓"
- Copies UTM-tagged URL: `?utm_source=share_button&utm_campaign=direct`
- Option to copy with custom message template

**1.3 Profile URL Display**
- Always-visible URL in card
- Click to copy
- Shows short handle (not full URL for readability)

**Technical Implementation:**
```javascript
// /src/components/dashboard/ShareProfileCard.jsx

const handleNativeShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Ask ${expertName} anything about ${specialty}`,
        text: `Get personalized advice - €${price} for video answer within ${sla}h`,
        url: `https://mindpick.me/u/${handle}?utm_source=native_share`
      });
      trackEvent('profile_shared', { method: 'native' });
    } else {
      // Fallback to clipboard
      handleCopyLink();
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Share failed:', err);
    }
  }
};

const handleCopyLink = () => {
  const url = `https://mindpick.me/u/${handle}?utm_source=copy_link`;
  navigator.clipboard.writeText(url);
  toast.success('Link copied to clipboard!');
  trackEvent('profile_link_copied');
};
```

---

### Phase 2: QR Code Generator - 2 hours ✅ COMPLETED

**Status:** ✅ Production Ready (October 16, 2025)

**2.1 On-Demand QR Generation**
- ✅ "Show QR" button → Opens full-screen modal
- ✅ Large QR code (256x256px display, 512x512px download)
- ✅ mindPick logo in center (using android-chrome-192x192.png)
- ✅ Expert name + handle below QR

**2.2 QR Code Modal Features**
- ✅ Full-screen overlay with blurred backdrop (easy to scan)
- ✅ Download as PNG button (512x512px high-res)
- ✅ Share QR as image (native share API)
- ✅ Close button (click backdrop or X button)
- ✅ Smooth fade-in animation

**2.3 Downloadable QR Assets**
- ✅ PNG format (512x512px high-res)
- ✅ Includes branding (mindPick logo in center)
- ✅ Expert can print for business cards
- ✅ Filename: `mindpick-{handle}-qr.png`

**2.4 Integration Points**
- ✅ Expert Dashboard: QR button next to copy link (desktop view)
- ✅ Expert Dashboard: QR button with text next to Link button (mobile view)
- ✅ Public Profile: QR icon button next to share button in header

**Actual Implementation:**
```bash
# Installed dependency
npm install qrcode.react
```

```javascript
// /src/components/dashboard/QRCodeModal.jsx

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function QRCodeModal({ isOpen, onClose, profileUrl, expertName, handle }) {
  const qrRef = useRef(null);

  if (!isOpen) return null;

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `mindpick-${handle}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareQR = async () => {
    if (!navigator.share) {
      alert('Share not supported on this browser');
      return;
    }

    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = async () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });
          await navigator.share({
            title: `${expertName}'s mindPick Profile`,
            files: [file]
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Share Your Profile
            </h2>
            <p className="text-sm text-gray-600">
              Scan this QR code to visit your profile
            </p>
          </div>

          {/* QR Code */}
          <div
            ref={qrRef}
            className="flex justify-center items-center p-6 bg-white rounded-xl border-2 border-gray-200"
          >
            <QRCodeSVG
              value={profileUrl}
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/android-chrome-192x192.png",
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>

          {/* Expert info */}
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900">
              {expertName}
            </div>
            <div className="text-sm text-gray-600">
              mindpick.me/u/{handle}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>

            {navigator.share && (
              <button
                onClick={shareQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                Share
              </button>
            )}
          </div>

          {/* Tip */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Tip: Show this QR code during conversations so people can easily visit your profile
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default QRCodeModal;
```

**Files Modified:**
- ✅ Created: `/src/components/dashboard/QRCodeModal.jsx`
- ✅ Modified: `/src/pages/ExpertDashboardPage.jsx` (added QR buttons + modal integration)
- ✅ Modified: `/src/pages/PublicProfilePage.jsx` (added QR button next to share)
- ✅ Fixed: Renamed `/src/state/auth.js` to `/src/state/auth.jsx` (JSX syntax support)

**Key Decisions:**
- Used `QRCodeSVG` instead of `QRCodeCanvas` for easier manipulation
- Error correction level "H" for reliable scanning even with logo
- Logo source: `/android-chrome-192x192.png` (existing mindPick logo)
- 256x256px display size, 512x512px download for print quality
- SVG → Canvas conversion for PNG downloads (better compatibility)
- Full-screen modal with blur backdrop for optimal scanning experience

---

### Phase 3: Email Signature Generator - 2 hours

**3.1 Signature Template**
Pre-built HTML email signature:
```
---
{expertName}
{professionalTitle}

💬 Quick question? mindpick.me/u/{handle}
⭐ {rating}/5.0 from {totalQuestions} answers
```

**3.2 Copy to Clipboard**
- "Get Email Signature" button
- Copies HTML + plain text versions
- Instructions modal: "How to add to Gmail/Outlook"
- Preview before copying

**3.3 Customization Options**
- Include/exclude rating
- Include/exclude pricing
- Add custom tagline
- Choose emoji style (on/off)

**Technical Implementation:**
```javascript
// /src/components/dashboard/EmailSignatureGenerator.jsx

const generateSignature = () => {
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <div style="border-top: 2px solid #4F46E5; padding-top: 10px; margin-top: 10px;">
        <strong>${expertName}</strong><br>
        ${professionalTitle}<br>
        <br>
        💬 Quick question? <a href="https://mindpick.me/u/${handle}?utm_source=email_signature" style="color: #4F46E5;">mindpick.me/u/${handle}</a><br>
        ⭐ ${rating}/5.0 from ${totalQuestions} answers
      </div>
    </div>
  `;

  const plainText = `
---
${expertName}
${professionalTitle}

💬 Quick question? mindpick.me/u/${handle}
⭐ ${rating}/5.0 from ${totalQuestions} answers
  `.trim();

  return { html, plainText };
};

const copySignature = () => {
  const { html, plainText } = generateSignature();

  // Copy HTML to clipboard
  const blob = new Blob([html], { type: 'text/html' });
  const clipboardItem = new ClipboardItem({ 'text/html': blob });
  navigator.clipboard.write([clipboardItem]);

  toast.success('Email signature copied!');
  setShowInstructions(true);
  trackEvent('email_signature_copied');
};
```

---

### Phase 4: Advanced Features (Future) - 8-10 hours

**4.1 Apple Wallet Pass**
- Generate `.pkpass` file
- Dynamic updates (stats, price changes)
- Notifications for new questions
- QR code on back of pass

**4.2 NFC Business Card**
- Tap phones to share (iOS/Android)
- Uses Web NFC API
- Instant profile open
- No app required

**4.3 Share Analytics Dashboard**
- Track share method usage
- Link click-through rates
- QR scan locations (if available)
- Email signature performance
- A/B test different messages

**4.4 Smart Share Links**
- Context-aware URLs (event, platform)
- Auto-apply UTM parameters
- Shortened URLs (mindp.ck/{handle})
- Link expiry (for limited offers)

**4.5 Social Media Assets**
- Pre-designed Instagram story templates
- LinkedIn banner with QR code
- Twitter header image
- One-click export for all platforms

---

## 🔧 Technical Architecture

### Frontend Components

```
/src/components/dashboard/
  ├── ShareProfileCard.jsx        # Main sharing hub
  ├── QRCodeModal.jsx             # Full-screen QR display
  ├── EmailSignatureGenerator.jsx # Signature tool
  └── ShareAnalytics.jsx          # Stats dashboard (Phase 4)
```

### Backend API Endpoints

**Phase 1-3: No backend needed** (all client-side)

**Phase 4: Advanced features**
```
POST /api/expert/generate-wallet-pass
  → Returns .pkpass file for Apple Wallet

POST /api/expert/generate-short-link
  → Returns shortened URL (mindp.ck/xxx)

GET /api/expert/share-analytics
  → Returns share performance data
```

### Database Schema (Phase 4 only)

**Table: `share_events`**
```sql
- id (int, PK)
- expert_profile_id (FK)
- share_method (enum: 'native', 'copy', 'qr', 'email_sig')
- shared_at (timestamp)
- utm_source (text)
- utm_campaign (text)
```

**Table: `short_links`**
```sql
- id (int, PK)
- expert_profile_id (FK)
- short_code (text, unique, indexed)
- original_url (text)
- click_count (int, default 0)
- created_at (timestamp)
```

---

## 📊 Success Metrics

### Phase 1 (Core Sharing)
- **Adoption:** 60% of experts use share feature in first week
- **Shares per expert:** Average 5 shares/week
- **Click-through rate:** 15% of shares result in profile visit

### Phase 2 (QR Code)
- **QR downloads:** 30% of experts download QR code
- **Scans:** Average 2 scans per QR code shared

### Phase 3 (Email Signature)
- **Adoption:** 40% of experts add email signature
- **Email CTR:** 3-5% click rate from signatures

### Phase 4 (Advanced)
- **Wallet adoption:** 20% of iOS experts add pass
- **NFC shares:** 10% of experts use NFC (if built)

---

## 🎯 User Stories

### Story 1: Expert at Networking Event
> "As an expert at a conference, I want to quickly share my profile with someone I just met, so I don't have to spell out my URL or exchange business cards."

**Solution:** Native share button → iMessage/WhatsApp instant send

---

### Story 2: Expert on Stage
> "As an expert giving a talk, I want to display a QR code on my final slide, so attendees can easily reach out for questions."

**Solution:** Download high-res QR code → Add to presentation

---

### Story 3: Expert Emailing Clients
> "As an expert who emails frequently, I want my profile link in every email automatically, so I don't miss opportunities when people reply with questions."

**Solution:** Generate email signature → Copy to Gmail/Outlook

---

### Story 4: Expert on Social Media
> "As an expert building my personal brand, I want to share my profile in my Twitter/LinkedIn bio, so followers can easily ask me questions."

**Solution:** Copy link with UTM tracking → Paste in bio

---

## 🚀 Implementation Plan

### Week 1: Phase 1 (Core Sharing)
- [ ] Create ShareProfileCard component
- [ ] Implement native share API
- [ ] Add copy link functionality
- [ ] Add to Expert Dashboard
- [ ] Test on iOS/Android

### Week 2: Phase 2 (QR Code) ✅ COMPLETED
- [x] Install qrcode.react dependency
- [x] Create QRCodeModal component
- [x] Implement download functionality
- [x] Add share QR feature
- [x] Test QR scanning
- [x] Add QR button to Expert Dashboard (desktop + mobile)
- [x] Add QR button to Public Profile Page
- [x] Fix logo display in QR code center

### Week 3: Phase 3 (Email Signature)
- [ ] Design signature templates
- [ ] Build EmailSignatureGenerator
- [ ] Create setup instructions modal
- [ ] Test in Gmail/Outlook
- [ ] Add customization options

### Future: Phase 4 (Advanced)
- [ ] Research Apple Wallet PassKit
- [ ] Implement short link service
- [ ] Build share analytics dashboard
- [ ] Explore NFC integration
- [ ] Create social media asset generator

---

## 🔗 Integration Points

### With Marketing Module
- Share Kit tab includes these tools
- UTM parameters auto-applied
- Share events tracked as campaign visits
- Analytics integrated into marketing dashboard

### With Expert Profile
- Share button on public profile page
- "How did you find me?" tracking
- Attribution to share method

### With Analytics
- Track share method performance
- A/B test share messages
- Measure conversion from shares

---

## 💰 Cost Analysis

### Development Cost
- Phase 1: 3 hours × $50/hr = $150
- Phase 2: 2 hours × $50/hr = $100
- Phase 3: 2 hours × $50/hr = $100
- **Total MVP: $350 (7 hours)**

### Ongoing Costs
- Phase 1-3: $0/month (no backend)
- Phase 4:
  - Apple Developer: $99/year
  - Short link service: $20-50/month
  - Analytics storage: ~$10/month

### Expected ROI
- **Problem:** Experts lose ~5 share opportunities/week due to friction
- **Solution:** Reduce friction → +3 shares/week → +1 question/month
- **Value:** $50-200/month per expert (depending on price)
- **Break-even:** 1-2 experts using feature

---

## 📝 Dependencies

### Before Starting
- [x] Expert profile pages exist
- [x] Expert handles configured
- [ ] Marketing module API endpoints complete (for UTM tracking)
- [ ] Analytics infrastructure ready

### Libraries Required
```json
{
  "qrcode.react": "^3.1.0"  // Phase 2
}
```

### Browser APIs Used
- Navigator.share (Phase 1) - 90% browser support
- Navigator.clipboard (Phase 1) - 95% browser support
- Canvas API (Phase 2) - 100% browser support
- Web NFC (Phase 4, optional) - 60% browser support

---

## 🐛 Potential Issues & Solutions

### Issue 1: Navigator.share Not Supported
**Problem:** Older browsers don't support share API
**Solution:** Graceful fallback to clipboard copy

### Issue 2: QR Code Not Scanning
**Problem:** Low contrast or damaged QR
**Solution:** Use error correction level "H", test with multiple scanners

### Issue 3: Email Signature Formatting
**Problem:** Outlook/Gmail strip HTML differently
**Solution:** Use inline styles, test in both clients, provide plain text version

### Issue 4: Share Analytics Missing
**Problem:** UTM params not applied consistently
**Solution:** Centralized URL generation function, validate params

---

## 🎓 Learning Resources

### Native Share API
- [MDN: Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Web.dev: Web Share API](https://web.dev/web-share/)

### QR Code Generation
- [qrcode.react Docs](https://github.com/zpao/qrcode.react)
- [QR Code best practices](https://blog.qr4.nl/QR-Code-Best-Practices.aspx)

### Email Signatures
- [Email signature best practices](https://www.hubspot.com/email-signature-generator)
- [HTML email coding](https://www.campaignmonitor.com/dev-resources/)

### Apple Wallet
- [PassKit Documentation](https://developer.apple.com/documentation/passkit)
- [Pass Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/wallet)

---

## ✅ Definition of Done

### Phase 1 Complete When:
- [x] Share button opens native share sheet on mobile
- [x] Copy link button copies URL to clipboard
- [x] Success toast appears after copy
- [x] Profile URL visible and clickable
- [x] Works on iOS Safari and Android Chrome
- [x] UTM parameters applied to all shares

### Phase 2 Complete When: ✅ ALL DONE
- [x] QR code generates correctly
- [x] QR modal opens full-screen
- [x] QR code scannable by phone cameras
- [x] Download creates PNG file (512x512px)
- [x] mindPick logo visible in QR center
- [x] Expert name displays below QR
- [x] Share button works on mobile (native share API)
- [x] Close on backdrop click works
- [x] Smooth fade-in animation
- [x] Integrated in Expert Dashboard (desktop + mobile views)
- [x] Integrated in Public Profile Page

### Phase 3 Complete When:
- [x] Email signature copies to clipboard
- [x] HTML and plain text versions work
- [x] Instructions modal shows setup steps
- [x] Signature tested in Gmail and Outlook
- [x] Customization options functional
- [x] Preview shows before copying

---

## 📅 Timeline

**Start Date:** TBD (after Marketing Module complete)
**MVP Launch:** 1 week after start
**Phase 2:** 1 week after MVP
**Phase 3:** 1 week after Phase 2
**Phase 4:** 4-6 weeks after Phase 3

**Total time to MVP:** 3 weeks part-time

---

## 🎉 Success Criteria

This feature is successful if:

1. **Adoption:** 50%+ of active experts use share feature within 30 days
2. **Usage:** Experts share profile 5+ times per week on average
3. **Conversion:** 10%+ of shares result in profile visit
4. **Feedback:** 4.5/5 star rating from experts
5. **Support:** <5 support tickets per month related to sharing

---

## 📞 Stakeholders

**Owner:** Product Team
**Developer:** TBD
**Designer:** TBD
**QA:** Test on iOS/Android before launch
**Marketing:** Announce in newsletter after launch

---

**Status:** Ready for prioritization
**Next Step:** Review with product team, prioritize against roadmap
**Questions?** See related docs:
- [Marketing Module Implementation](./IMPLEMENTATION-MASTER-GUIDE.md)
- [UTM Tracking Spec](./updated-marketing-spec.md)
