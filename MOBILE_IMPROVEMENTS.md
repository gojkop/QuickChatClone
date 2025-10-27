# Mobile UX Improvements - Files Modified

## Overview
This document tracks all mobile improvements made to the `/dashboard/inbox` route for screens < 1024px.

## Key Files Modified

### 1. **index.html**
Location: `index.html`

**Changes:**
- Line 6: Enhanced viewport meta tag with `viewport-fit=cover` for iOS notch support
- Lines 11-20: Global CSS to prevent pull-to-refresh and overscroll on html/body
  ```css
  html, body {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
  body {
    touch-action: pan-y;
  }
  ```

**Purpose:** Global swipe prevention at the document level for iOS and Android

---

### 2. **ExpertInboxPageV2.jsx**
Location: `src/pages/ExpertInboxPageV2.jsx`

**Changes:**
- Lines 1077-1085: Enhanced CSS to disable swipe navigation with iOS support
  ```jsx
  style={{
    overscrollBehavior: 'none',
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch',
    overflowX: 'hidden'
  }}
  ```
- Line 1028: Pass `isMobile={screenWidth < 1024}` to QuestionDetailPanel
- Line 1042: Pass `isMobile={screenWidth < 1024}` to AnswerComposerPanel

**Purpose:** Disables browser back-swipe on iOS and Android, ensures consistent mobile detection

---

### 3. **QuestionDetailPanel.jsx**
Location: `src/components/dashboardv2/inbox/QuestionDetailPanel.jsx`

**Mobile-specific changes (when `isMobile=true`):**

#### Header (Lines 454-538)
- **Line 455:** Reduced padding: `p-2` on mobile vs `p-3 lg:p-4` on desktop
- **Lines 457-492:** Mobile stack layout shows when `isMobile=true`:
  - Row 1: Back arrow + Price
  - Row 2: Question title
  - Row 3: Q-ID + Badges
- **Lines 495-537:** Desktop horizontal layout hidden when `isMobile=true`

#### Content (Lines 615-623)
- **iOS safe area support:** `paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))'`
- **Swipe prevention:** Applied directly to scrollable div
  - `overscrollBehaviorX: 'none'`
  - `overscrollBehaviorY: 'contain'`
  - `touchAction: 'pan-y'`
  - `WebkitOverflowScrolling: 'touch'`

#### Actions (Lines 901-1002)
- **Mobile inline buttons** (Line 901): Shows when `isMobile=true`
  - "Answer This Question" button inline with content
  - Accept/Decline buttons for pending offers
  - Copy link button
- **Desktop footer** (Line 1007): Hidden when `isMobile=true`

**Current State:** ✅ All changes implemented with isMobile prop + iOS-specific fixes

---

### 4. **AnswerComposerPanel.jsx**
Location: `src/components/dashboardv2/inbox/AnswerComposerPanel.jsx`

**Mobile-specific changes (when `isMobile=true`):**

#### Props (Line 14)
- Added `isMobile = false` prop

#### Header (Lines 168-177)
- **Line 168:** Added `relative z-50` for proper stacking on iOS
- **Line 169:** Reduced padding: `px-3 py-2` on mobile vs `px-4 py-3` on desktop
- **Line 172:** Back arrow button with `relative z-50` and iOS tap highlight disabled
- **Line 176:** Back arrow **larger and bolder** for iOS visibility: `ArrowLeft size={24}` with `stroke-[2.5]`

#### Content (Lines 190-198)
- **iOS safe area support:** `paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))'`
- **Swipe prevention:** Applied directly to scrollable div
  - `overscrollBehaviorX: 'none'`
  - `overscrollBehaviorY: 'contain'`
  - `touchAction: 'pan-y'`
  - `WebkitOverflowScrolling: 'touch'`
- **Line 200:** Content padding: `p-3` on mobile vs `p-4 lg:p-6` on desktop

#### Buttons (Lines 239-253)
- **Line 239:** Gap: `gap-2` on mobile vs `gap-3` on desktop
- **Lines 243, 250:** Button padding: `px-4 py-2.5` on mobile vs `px-6 py-3` on desktop

**Current State:** ✅ All changes implemented with isMobile prop + iOS-specific fixes

---

### 5. **Panel.jsx**
Location: `src/components/dashboardv2/inbox/Panel.jsx`

**Changes:**
- **Removed all drag/swipe handlers** (formerly lines 76-98)
- **Lines 92-100:** Added swipe prevention directly to panel container
  - `overscrollBehaviorX: 'none'`
  - `touchAction: 'pan-y'`
- Simplified to pure animation component
- No touch interaction code

**Current State:** ✅ Clean, no gesture handling, swipe prevention applied

---

### 6. **QuestionTable.jsx**
Location: `src/components/dashboardv2/inbox/QuestionTable.jsx`

**Changes:**
- **Lines 247-254:** Added swipe prevention to scrollable table container
  - `overscrollBehaviorX: 'none'`
  - `overscrollBehaviorY: 'contain'`
  - `touchAction: 'pan-y'`
  - `WebkitOverflowScrolling: 'touch'`

**Current State:** ✅ Swipe prevention applied to question table

---

### 7. **PendingOffersBanner.jsx**
Location: `src/components/dashboardv2/inbox/PendingOffersBanner.jsx`

**Changes (Lines 210-289):**
- Changed from horizontal cramped layout to vertical stack
- Row 1: Badge + Q-ID + Title
- Row 2: Asker name + Email
- Row 3: Price + Time + Action buttons
- Uses `flex-wrap` for responsive wrapping

**Current State:** ✅ Clean stacked layout

---

## Expected Behavior on Mobile (< 1024px)

### Question Table
- ✅ Bottom padding to avoid navbar overlap
- ✅ Smooth vertical scrolling
- ✅ Pending offers cards properly stacked

### Question Detail Screen
- ✅ Tight header (p-2 padding)
- ✅ Stacked layout: back+price, title, Q-ID+badges
- ✅ "Answer This Question" button inline with content
- ✅ No fixed footer blocking content
- ✅ Smooth scrolling with pb-24 clearance

### Answer Screen
- ✅ Back arrow visible and prominent (ArrowLeft size 24, bolder stroke)
- ✅ Back arrow with proper z-index stacking for iOS
- ✅ Compact header (px-3 py-2)
- ✅ Smaller buttons (px-4 py-2.5)
- ✅ iOS safe area bottom padding (calc(6rem + env(safe-area-inset-bottom)))

### Navigation
- ✅ No swipe-to-go-back (overscrollBehavior: none, WebkitOverflowScrolling: touch)
- ✅ Only vertical scrolling allowed (touchAction: pan-y, overflowX: hidden)
- ✅ iOS-specific fixes for Safari mobile
- ✅ Back arrows work for navigation

---

## Testing Checklist

On a device with screenWidth < 1024px:

- [ ] Question table: Can scroll without bottom items hidden
- [ ] Question detail: Header is compact, buttons are inline
- [ ] Answer screen: Back arrow visible and clickable
- [ ] No swipe-back gesture triggers browser navigation
- [ ] All content scrolls smoothly vertically
- [ ] No horizontal scroll anywhere
- [ ] Buttons are tappable (not too small)
- [ ] Pending offers cards are readable (not cramped)

---

## Troubleshooting

### If back arrow not visible on Answer screen:
1. Check if `isMobile` prop is being passed (ExpertInboxPageV2.jsx line 1042)
2. Check AnswerComposerPanel.jsx line 176 - ArrowLeft should be present with size={24}
3. Verify screenWidth is actually < 1024
4. iOS-specific: Check z-index (should be z-50), stroke width (should be stroke-[2.5])
5. Try hard refresh on device (Cmd+Shift+R or clearing Safari cache)

### If swipe-back still works:
1. Check ExpertInboxPageV2.jsx line 1077 has the style prop
2. Verify no other component has drag/swipe handlers
3. Check browser console for any errors preventing CSS from applying

### If mobile layout not showing:
1. Verify `isMobile` prop is true in component
2. Check conditional rendering: `className={isMobile ? "..." : "..."}`
3. Inspect element to see if classes are applied
4. Clear browser cache and hard refresh

---

## Files Summary

Modified for mobile improvements:
1. `index.html` - Global swipe prevention and viewport settings
2. `src/pages/ExpertInboxPageV2.jsx` - Pass isMobile, disable swipe
3. `src/components/dashboardv2/inbox/QuestionTable.jsx` - Swipe prevention on table
4. `src/components/dashboardv2/inbox/QuestionDetailPanel.jsx` - Mobile header, inline buttons, swipe prevention
5. `src/components/dashboardv2/inbox/AnswerComposerPanel.jsx` - Mobile header, compact buttons, swipe prevention
6. `src/components/dashboardv2/inbox/Panel.jsx` - Removed swipe handlers, added swipe prevention
7. `src/components/dashboardv2/inbox/PendingOffersBanner.jsx` - Stacked card layout

All changes use `isMobile` prop (threshold: screenWidth < 1024px) for consistency.

**Swipe Prevention Strategy:**
- Global level: `index.html` sets overscroll-behavior on html/body
- Container level: Applied to ExpertInboxPageV2 wrapper and Panel components
- Scrollable level: Applied directly to all overflow-y-auto divs (most effective)
