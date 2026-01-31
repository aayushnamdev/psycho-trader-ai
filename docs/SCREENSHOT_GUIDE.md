# Screenshot Guide

To complete the portfolio presentation, please take the following screenshots:

## 1. Chat Interface (`chat-interface.png`)
**URL**: `http://localhost:3000/coach/chat`
**What to show**:
- Clean chat interface with pill-shaped input
- At least 3-4 message exchanges visible
- Suggestion pills at the bottom or in empty state
- Thinking indicator if possible

**How to capture**:
1. Open the chat page
2. Have a brief conversation (2-3 exchanges)
3. Take a full-window screenshot
4. Crop to show just the chat area (remove browser chrome)
5. Save as `docs/screenshots/chat-interface.png`

---

## 2. Patterns Dashboard (`patterns-dashboard.png`)
**URL**: `http://localhost:3000/patterns`
**What to show**:
- List of recognized pattern categories
- Frequency counts for each pattern
- Clean categorization (fear_patterns, recurring_struggle, etc.)

**How to capture**:
1. Navigate to Patterns page
2. Ensure demo data has generated patterns
3. Take a full-window screenshot
4. Save as `docs/screenshots/patterns-dashboard.png`

---

## 3. Analytics View (`analytics-view.png`)
**URL**: `http://localhost:3000/analytics`
**What to show**:
- Dashboard stats (streak, total sessions, connection depth)
- Charts/visualizations (if available)
- Engagement metrics over time

**How to capture**:
1. Navigate to Analytics page
2. Ensure you have multiple days of demo data
3. Take a full-window screenshot
4. Save as `docs/screenshots/analytics-view.png`

---

## 4. Achievement System (`achievements.png`)
**URL**: `http://localhost:3000/analytics` (achievements section)
**What to show**:
- List of unlocked achievements
- Achievement badges/icons
- Progress indicators

**How to capture**:
1. Scroll to achievements section
2. Ensure you've unlocked a few achievements
3. Take a screenshot of the achievements area
4. Save as `docs/screenshots/achievements.png`

---

## 5. Empty State / Welcome Screen (`welcome-state.png`) [Optional]
**URL**: `http://localhost:3000/coach/chat` (when empty)
**What to show**:
- The animated sparkle icon
- "Ask your journal anything" headline
- Suggestion pills
- Clean empty state design

**How to capture**:
1. Clear chat history or use a new user
2. Navigate to chat page
3. Take screenshot of the empty state
4. Save as `docs/screenshots/welcome-state.png`

---

## Screenshot Specifications

- **Format**: PNG
- **Resolution**: At least 1920x1080 (retina/2x if possible)
- **Crop**: Remove browser chrome, focus on app content
- **Quality**: High quality, no compression artifacts
- **Annotations**: None needed—clean screenshots only

## Tools Recommended

- macOS: `Cmd+Shift+4` (select area) or `Cmd+Shift+3` (full screen)
- Windows: Snipping Tool or `Win+Shift+S`
- Browser DevTools: Set device to "Laptop with HiDPI" for better quality

## After Screenshots

Once you have all screenshots, verify they're in:
```
docs/screenshots/
  ├── chat-interface.png
  ├── patterns-dashboard.png
  ├── analytics-view.png
  ├── achievements.png
  └── welcome-state.png (optional)
```

Then commit and push to GitHub!
