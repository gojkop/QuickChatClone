# Expert Inbox UX Redesign Proposal

## Executive Summary

**Goal:** Transform the question inbox from a basic table with stacked filters into a modern, intuitive, mobile-optimized interface inspired by best-in-class tools (GitHub Issues, Linear, Notion).

**Key Improvements:**
- ✅ Single-line unified toolbar (search + filters + sort + actions)
- ✅ Pending offers integrated as priority questions at top of list
- ✅ Mobile-first responsive design
- ✅ Reduced vertical space usage by 40%
- ✅ Intuitive for non-technical users

---

## Current vs. Proposed Layout

### Current Layout (4 rows + offers)
```
┌─────────────────────────────────────┐
│ PendingOffersSection (separate)    │ ← Separate component
├─────────────────────────────────────┤
│ [Pending] [Answered] [All]          │ ← Row 1: Status tabs
├─────────────────────────────────────┤
│ 🔍 Search...                        │ ← Row 2: Search bar
├─────────────────────────────────────┤
│ [Sort: Time Left ▼] [Filters 🔽]   │ ← Row 3: Sort + toggle
├─────────────────────────────────────┤
│ Price: [Min] — [Max]                │ ← Row 4: Advanced filters
│ ☑ Show hidden                       │    (when expanded)
│ ✕ Clear filters                     │
├─────────────────────────────────────┤
│ Question Table...                   │
└─────────────────────────────────────┘
```

**Problems:**
- 🔴 4+ rows before content = poor UX
- 🔴 Pending offers feel disconnected
- 🔴 Search and filters separated
- 🔴 Takes 180-220px vertical space
- 🔴 Poor mobile experience

---

### Proposed Layout (1 compact toolbar + integrated offers)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Search questions...  │ [Pending 3]  [All]  │ Time Left ▼  ⚙️ │ ← Single unified toolbar
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🎯 PENDING OFFERS (2)  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Integrated offer banner
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 💰 $75 Deep Dive • "Marketing strategy review"           │  │
│ │ "Looking for advice on product positioning..." • 2h left  │  │
│ │ [✓ Accept]  [✕ Decline]  [👁 View]                        │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 💰 $120 Deep Dive • "Help with SEO optimization"          │  │
│ │ "Need help improving organic traffic..." • 5h left        │  │
│ │ [✓ Accept]  [✕ Decline]  [👁 View]                        │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ QUESTIONS TO ANSWER (12)                                         │ ← Active questions
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Quick Consult • $50 • "How to build an API?"             │  │
│ │ 2h 15m left • Bogdan Tancic                               │  │
│ └──────────────────────────────────────────────────────────┘  │
│ ...                                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ 65px unified toolbar (vs 180-220px stacked)
- ✅ Offers clearly prioritized but integrated
- ✅ All filters accessible in one place
- ✅ Mobile-optimized (responsive layout)
- ✅ Cleaner, more professional appearance

---

## Detailed Design Specifications

### 1. Unified Toolbar (65px height)

**Desktop Layout:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ 🔍 [Search questions, askers, or IDs...        ] │ Tab│Tab│ Sort ▼│ ⚙️ 📥 │
└────────────────────────────────────────────────────────────────────────────┘
  └─────────────── 40% ─────────────────┘ └─── 30% ──┘└─15%─┘└─15%─┘
```

**Components:**
1. **Search (40% width)**
   - Full-width input with icon
   - Placeholder: "Search questions, askers, or IDs..."
   - Real-time filtering (300ms debounce)

2. **Status Tabs (30% width)**
   - `[Pending 3]` `[Answered]` `[All]`
   - Count badge on active tab
   - Auto-highlight selected with indigo accent

3. **Sort Dropdown (15% width)**
   - Compact dropdown: "Time Left ▼"
   - Options: Time Left, Price ↓, Price ↑, Newest, Oldest

4. **Actions (15% width)**
   - ⚙️ Settings (opens advanced filter panel)
   - 📥 Export (bulk export to CSV/ZIP)

**Mobile Layout (<768px):**
```
┌────────────────────────────────┐
│ 🔍 Search...          ⚙️ 📥   │ ← Row 1: Search + Actions
├────────────────────────────────┤
│ [Pending 3] [Answered] [All]  │ ← Row 2: Tabs (full width)
├────────────────────────────────┤
│ Sort: Time Left ▼              │ ← Row 3: Sort (full width)
└────────────────────────────────┘
```

---

### 2. Integrated Pending Offers Banner

**When offers exist:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 🎯 PENDING DEEP DIVE OFFERS (2)  ━━━━━━━━━━━━━━━━━━━━━━  [Collapse ▴] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 💰 $75 • Deep Dive                                 ⏰ 2h 15m │ │
│ │ ──────────────────────────────────────────────────────────  │ │
│ │ "Marketing strategy for SaaS product"                      │ │
│ │ Bogdan Tancic • b.tancic@gmail.com                         │ │
│ │                                                             │ │
│ │ 💬 Asker's message:                                        │ │
│ │ "I'm launching a B2B SaaS and need guidance on..."         │ │
│ │                                                             │ │
│ │ [✓ Accept Offer]  [✕ Decline]  [👁 View Full Question]     │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 💰 $120 • Deep Dive                                ⏰ 5h 42m │ │
│ │ ... (another offer card) ...                               │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- ✨ Eye-catching purple/indigo gradient background
- 🎯 Priority placement above questions
- 💰 Price prominently displayed
- ⏰ Urgency indicator with color coding:
  - 🔴 Red: < 20% time remaining
  - 🟠 Orange: 20-50% time remaining
  - 🟢 Green: > 50% time remaining
- 🎬 Three clear actions: Accept, Decline, View
- 📱 Responsive: Stacks vertically on mobile

**When no offers:**
- Component hidden completely
- No empty state shown

---

### 3. Advanced Filters Panel (Settings ⚙️)

**Slide-out panel from right:**
```
                                  ┌────────────────────────────┐
                                  │ ⚙️ Advanced Filters    ✕  │
                                  ├────────────────────────────┤
                                  │                            │
                                  │ 💰 Price Range             │
                                  │ [$___] — [$___]            │
                                  │                            │
                                  │ 📋 Question Type           │
                                  │ ○ All Questions            │
                                  │ ○ Quick Consult only       │
                                  │ ○ Deep Dive only           │
                                  │                            │
                                  │ ⏰ SLA Status              │
                                  │ ○ All questions            │
                                  │ ○ Urgent (< 25% time left) │
                                  │ ○ Moderate (25-75% left)   │
                                  │ ○ Plenty of time (> 75%)   │
                                  │                            │
                                  │ 👁 Visibility              │
                                  │ ☑ Show hidden questions    │
                                  │                            │
                                  │ ──────────────────────────│
                                  │ [Clear All]  [Apply]       │
                                  └────────────────────────────┘
```

**Mobile:** Full-screen overlay instead of side panel

---

### 4. Question Cards in List

**Compact Card Design (inspired by GitHub Issues):**

```
┌──────────────────────────────────────────────────────────────────┐
│ [🔲] Quick Consult • $50 • Q-123                       2h 15m ⏰ │
│      ────────────────────────────────────────────────────────    │
│      "How to build a RESTful API with authentication?"           │
│      Bogdan Tancic • b.tancic@gmail.com                          │
│                                                                   │
│      🎥 Video • 📎 2 attachments                [Answer →]       │
└──────────────────────────────────────────────────────────────────┘
```

**Elements:**
1. **Checkbox** - Multi-select for bulk actions
2. **Badge** - Quick Consult / Deep Dive
3. **Price** - Prominent, color-coded by value
4. **ID** - Q-123 for reference
5. **SLA Timer** - Right-aligned with urgency colors
6. **Title** - Bold, truncated at 2 lines
7. **Asker Info** - Name + email
8. **Media Indicators** - Icons for video/audio/attachments
9. **Primary Action** - [Answer →] button

**Mobile Card:**
```
┌────────────────────────────────┐
│ [🔲] Quick Consult • $50  2h ⏰│
│      ────────────────────────  │
│ "How to build a RESTful API    │
│  with authentication?"         │
│                                 │
│ Bogdan T. • 🎥 📎              │
│ [Answer →]                      │
└────────────────────────────────┘
```

**Interaction States:**
- Hover: Slight elevation + border highlight
- Selected: Blue background tint
- Clicked: Opens detail panel (existing behavior)

---

### 5. Pending Offer Cards (Integrated Design)

**Offer Card (within banner):**

```
┌──────────────────────────────────────────────────────────────────┐
│ 💰 $75 • Deep Dive • Q-410                            ⏰ 2h 15m │
│ ────────────────────────────────────────────────────────────────│
│ "Marketing strategy for B2B SaaS product launch"                 │
│ Bogdan Tancic • b.tancic@gmail.com                               │
│                                                                   │
│ 💬 Asker's message:                                              │
│ "I'm launching a B2B SaaS product and need strategic guidance    │
│  on positioning, pricing, and go-to-market approach..."          │
│                                                                   │
│ 🎥 Video recording • 📎 2 attachments                            │
│                                                                   │
│ [✓ Accept Offer]  [✕ Decline]  [👁 View Full Question]           │
└──────────────────────────────────────────────────────────────────┘
```

**Visual Hierarchy:**
1. **Header Bar** - Purple/indigo gradient
   - Price (large, bold)
   - Type badge
   - Question ID
   - Time remaining (right-aligned)

2. **Title** - Bold, black, 2-line max

3. **Asker Info** - Gray, smaller font

4. **Asker Message** (if present) -
   - Light background box
   - 3-line max with "Read more" if truncated

5. **Media Indicators** - Icons showing content type

6. **Actions** - 3 prominent buttons:
   - ✓ Accept (green, primary)
   - ✕ Decline (gray, secondary)
   - 👁 View (indigo, tertiary)

**Mobile Layout:**
- Same structure, narrower
- Buttons stack vertically
- Message truncated to 2 lines

---

## Behavior Specifications

### Pending Offers Integration

**Current Behavior (Old Dashboard):**
- Separate `PendingOffersSection` component
- Shown as modal or separate section
- Disconnected from question list

**New Behavior:**

1. **Offers appear at top of inbox** (above question list)
2. **Collapsible banner** with count badge
3. **Offer cards** visually distinct (purple gradient)
4. **Cannot answer until accepted:**
   - Accept → Offer moves to regular question list
   - Decline → Offer removed from list
   - View → Opens detail panel (read-only, shows Accept/Decline buttons)

5. **Auto-refresh every 30s** to update timers

6. **Animations:**
   - New offer: Slide in from top with gentle bounce
   - Accepted/Declined: Slide out with fade
   - Banner collapse: Smooth height transition

---

### Filter Interaction

**Search:**
- Real-time filtering (300ms debounce)
- Searches: title, question text, asker name, email, ID
- Clear button appears when typing

**Status Tabs:**
- Instant switch (no loading state)
- Badge shows count (e.g., "Pending 3")
- URL updates: `/inbox#pending`

**Sort:**
- Instant client-side sort for current page
- Server-side sort for pagination

**Advanced Filters:**
- Opens slide-out panel
- Changes not applied until [Apply] clicked
- [Clear All] resets to defaults
- Panel remembers last state

---

### Mobile Optimizations

**< 768px:**

1. **Toolbar:** 3 rows (search + actions, tabs, sort)
2. **Offer cards:** Full width, vertical buttons
3. **Question cards:** Compact layout, truncated text
4. **Filter panel:** Full-screen overlay
5. **Detail panel:** Full-screen overlay (not side-by-side)

**Touch Targets:**
- Minimum 44px height for all buttons
- Increased padding on cards
- Larger checkboxes (24px)

**Gestures:**
- Swipe left on card: Quick actions (Hide, Mark as read)
- Pull to refresh: Reload questions
- Long press: Multi-select mode

---

## Technical Implementation Notes

### Component Structure

```
ExpertInboxPageV2/
├── UnifiedToolbar/
│   ├── SearchBar.jsx
│   ├── StatusTabs.jsx
│   ├── SortDropdown.jsx
│   └── ToolbarActions.jsx
│
├── PendingOffersBanner/ (NEW - refactored)
│   ├── OfferCard.jsx
│   └── OfferActions.jsx
│
├── QuestionList/
│   ├── QuestionCard.jsx (updated design)
│   └── EmptyState.jsx
│
└── AdvancedFiltersPanel/ (NEW)
    ├── PriceRangeFilter.jsx
    ├── QuestionTypeFilter.jsx
    ├── SLAFilter.jsx
    └── VisibilityToggle.jsx
```

### State Management

**No breaking changes - existing state preserved:**
```javascript
const [filters, setFilters] = useState({
  status: 'pending',      // tab
  searchQuery: '',        // search bar
  sortBy: 'time_left',    // sort dropdown
  priceMin: 0,            // advanced filters
  priceMax: 10000,        // advanced filters
  slaFilter: 'all',       // advanced filters (NEW)
  questionType: 'all',    // advanced filters (NEW)
  showHidden: false,      // advanced filters
});

const [pendingOffers, setPendingOffers] = useState([]); // existing
const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // NEW
const [isOfferBannerCollapsed, setIsOfferBannerCollapsed] = useState(false); // NEW
```

**All existing functions remain unchanged:**
- `updateFilter()`
- `handleQuestionClick()`
- `handleOfferAccept()`
- `handleOfferDecline()`

---

## Visual Design System

### Colors

**Offers:**
- Background: `bg-gradient-to-r from-purple-50 to-indigo-50`
- Border: `border-purple-200`
- Accept button: `bg-green-600 hover:bg-green-700`
- Decline button: `border-gray-300 hover:border-gray-400`

**Questions:**
- Background: `bg-white`
- Hover: `bg-gray-50 shadow-md`
- Selected: `bg-indigo-50 border-indigo-300`

**Urgency (SLA Timer):**
- Urgent (< 20%): `text-red-600`
- Moderate (20-75%): `text-orange-600`
- Safe (> 75%): `text-green-600`

### Typography

- **Titles:** `font-bold text-base text-gray-900`
- **Prices:** `font-bold text-lg text-indigo-600`
- **Body:** `text-sm text-gray-700`
- **Meta:** `text-xs text-gray-500`

### Spacing

- Toolbar padding: `p-3`
- Card padding: `p-4`
- Card gap: `gap-3`
- Section gap: `gap-6`

---

## Migration Strategy

### Phase 1: Toolbar Unification (Week 1)
1. Create `UnifiedToolbar` component
2. Move search, tabs, sort into single row
3. Add settings icon (opens old filter UI initially)
4. Test mobile responsiveness

### Phase 2: Offers Integration (Week 1)
1. Create `PendingOffersBanner` component
2. Refactor existing `PendingOffersSection` logic
3. Add collapse/expand functionality
4. Integrate above question list

### Phase 3: Advanced Filters Panel (Week 2)
1. Create slide-out panel component
2. Move existing filters into panel
3. Add new SLA and question type filters
4. Test mobile full-screen overlay

### Phase 4: Card Redesign (Week 2)
1. Update `QuestionCard` design
2. Add media indicators
3. Test hover/selection states
4. Mobile optimizations

### Phase 5: Polish & Testing (Week 3)
1. Animations and transitions
2. Keyboard shortcuts update
3. Cross-browser testing
4. User acceptance testing

---

## Success Metrics

**Quantitative:**
- ✅ Reduce toolbar height by 60% (180px → 65px)
- ✅ Increase questions visible on first screen by 40%
- ✅ Reduce time-to-filter by 50% (fewer clicks)
- ✅ Mobile task completion rate increase by 30%

**Qualitative:**
- ✅ Users find filters intuitively
- ✅ Pending offers clearly prioritized
- ✅ Mobile experience rated 8/10 or higher
- ✅ Non-technical users complete tasks without help

---

## Appendix: Wireframes

### Desktop View (1920x1080)
```
┌───────────────────────────────────────────────────────────────────────┐
│ Navbar                                                                 │
├───────────────────────────────────────────────────────────────────────┤
│ 🔍 Search...              [Pending 3] [All]  Time Left ▼  ⚙️ 📥      │ ← 65px
├───────────────────────────────────────────────────────────────────────┤
│ 🎯 PENDING OFFERS (2) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  [Collapse] │
│ [Offer Card 1]                                                         │
│ [Offer Card 2]                                                         │
├───────────────────────────────────────────────────────────────────────┤
│ QUESTIONS TO ANSWER (12)                                               │
│ [Question Card 1]                                                      │
│ [Question Card 2]                                                      │
│ [Question Card 3]                                                      │
│ [Question Card 4]                                                      │
│ [Question Card 5]                                                      │
│ ...                                                                    │
└───────────────────────────────────────────────────────────────────────┘
   6 questions visible (vs 3 in old design) ↑
```

### Mobile View (375x812)
```
┌─────────────────────────┐
│ 🔍 Search...      ⚙️ 📥 │
│ [Pending 3] [All]       │
│ Sort: Time Left ▼       │
├─────────────────────────┤
│ 🎯 OFFERS (2)  [▴]     │
│ [Compact Offer Card 1] │
│ [Compact Offer Card 2] │
├─────────────────────────┤
│ [Compact Q Card 1]     │
│ [Compact Q Card 2]     │
│ [Compact Q Card 3]     │
│ [Compact Q Card 4]     │
│ ...                    │
└─────────────────────────┘
```

---

## Questions & Decisions

**Q: Should offers be dismissible without declining?**
A: No. Forces expert to make a decision (accept or decline).

**Q: Should we show expired offers?**
A: No. Auto-removed when expired (backend handles this).

**Q: Can expert filter out offers from the view?**
A: No. Offers always appear at top until actioned. This ensures timely review.

**Q: Should search work on pending offers too?**
A: Yes. Search filters both offers and questions.

**Q: Keyboard navigation?**
A: Yes. Arrow keys navigate, Enter opens detail, Space selects checkbox.

---

**END OF PROPOSAL**

