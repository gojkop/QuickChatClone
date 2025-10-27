---
description: Check mobile responsiveness and UX issues
argument-hint: [component-path (optional)]
---

# Mobile Responsiveness Testing

Analyze the mobile user experience for the dashboard inbox feature at `/dashboard/inbox`.

## Areas to Check:

1. **Layout & Spacing**
   - Header padding and white space efficiency
   - Content padding (should be tight but readable)
   - Bottom padding to avoid navbar overlap
   - Consistent spacing across question table → detail → answer screens

2. **Component Responsiveness**
   - QuestionDetailPanel mobile layout
   - AnswerComposerPanel mobile layout
   - PendingOffersBanner mobile card layout
   - Mobile detection using isMobile prop (screenWidth < 1024)

3. **Interactive Elements**
   - Button sizes and tap targets (minimum 44x44px)
   - Action buttons inline with content (not fixed)
   - Back arrows visible and properly sized
   - No overlapping elements

4. **Scrolling Behavior**
   - Smooth vertical scrolling
   - No horizontal scroll
   - No interference from swipe gestures
   - Proper overscroll behavior

5. **Touch Interactions**
   - No accidental back navigation
   - No conflicting gesture handlers
   - Touch-friendly button spacing

## Files to Examine:
- `src/pages/ExpertInboxPageV2.jsx`
- `src/components/dashboardv2/inbox/QuestionDetailPanel.jsx`
- `src/components/dashboardv2/inbox/AnswerComposerPanel.jsx`
- `src/components/dashboardv2/inbox/PendingOffersBanner.jsx`
- `src/components/dashboardv2/inbox/Panel.jsx`

$ARGUMENTS

Report any issues found and suggest specific fixes with file paths and line numbers.
