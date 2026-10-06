# FlatTask 🏡

**A modern household responsibility management system for 5 flatmates.**

Built with Next.js 14, Prisma, SQLite, and Tailwind CSS.

---

## Features

### ✅ Core Features
- **Dashboard** — Today's tasks, flat stats, live activity feed
- **Rotation System** — Independent rotations for Kitchen Duty and Home Cleaning
- **Task Completion** — Complete, Take Over, or Swap any task
- **Missed Tasks** — Automatic penalty tracking
- **Take Over** — Help a flatmate; earn contribution points
- **Swap System** — Request/Accept/Reject task swaps without changing the rotation
- **Members Page** — All flatmates with reliability scores and stats
- **Member Profiles** — Full history: tasks, events, penalties, contributions
- **Schedule Page** — 30-day calendar view with navigation
- **Admin Settings** — Flat name, timezone, penalty rules, member management
- **Activity Feed** — Real-time household transparency

### 🔒 Business Rules Implemented
1. Rotation is permanent — not modified by missed tasks, takeovers, or swaps
2. Swaps only affect the specific task/date
3. Takeovers create penalty for original assignee + help point for helper
4. All events are immutable (task_events table)
5. Reliability score formula is isolated in one function (`lib/rotation.ts`)
6. Historical tasks are never overwritten

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 19 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | SQLite via Prisma ORM |
| Runtime | Node.js 24 |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
npm approve-scripts @prisma/client prisma @prisma/engines esbuild unrs-resolver
```

### 2. Set up the database
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Start the dev server
```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Project Structure

```
flattask/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── members/
│   │   ├── page.tsx                # Members list
│   │   └── [id]/page.tsx           # Member profile
│   ├── schedule/page.tsx           # 30-day schedule
│   ├── admin/page.tsx              # Admin settings
│   └── api/
│       ├── dashboard/route.ts      # Dashboard data
│       ├── members/route.ts        # Members CRUD
│       ├── members/[id]/route.ts   # Member profile
│       ├── tasks/route.ts          # Tasks list
│       ├── tasks/[id]/complete/    # Complete/takeover
│       ├── tasks/[id]/takeover/    # Mark missed
│       ├── rotations/route.ts      # Schedule data
│       ├── swaps/route.ts          # Swap requests
│       ├── swaps/[id]/route.ts     # Accept/reject swap
│       ├── activity/route.ts       # Activity feed
│       ├── penalties/route.ts      # Penalties list
│       └── settings/route.ts       # Flat settings
├── components/
│   ├── layout/Sidebar.tsx          # Responsive nav
│   ├── ui/                         # Button, Card, Badge, Avatar
│   └── dashboard/                  # TaskCard, ActivityFeed, SwapModal
├── lib/
│   ├── prisma.ts                   # DB singleton
│   ├── rotation.ts                 # Pure rotation logic + reliability formula
│   ├── rotation.test.ts            # 28 unit tests
│   └── utils.ts                    # Date/color helpers
└── prisma/
    ├── schema.prisma               # Full DB schema
    └── seed.ts                     # 122 demo tasks
```

---

## Running Tests

```bash
npx tsx lib/rotation.test.ts
# 28/28 tests passing ✅
```

Tests cover:
- Normal rotation (A→B→C→D→E→A)
- Wrap-around after 5 members
- Next member calculation
- Missed task → rotation unchanged
- Takeover → rotation unchanged
- Swap → only specific task affected
- Day index computation
- Schedule generation
- Penalty / reliability score calculation
- Historical preservation (idempotence)

---

## Demo Data

The seed script creates:
- **5 members**: Prikshit, Rahul, Amit, Priya, Akash
- **2 rotations**: Kitchen Duty, Home Cleaning (offset start)
- **30 days of history** with realistic statuses (completed ~70%, missed ~20%, taken_over ~10%)
- **Today's tasks** as Pending
- **30 days of future tasks**
- **1 example swap** (accepted) from 3 days ago

---

## Notification Architecture

The app is structured for easy notification extension:
- All events are recorded in `task_events` with `eventType` and `metadata`
- The activity feed polls `/api/activity`
- Future: Add WebSocket or polling in `TaskCard` for real-time updates
- Future: Add push notifications when `taskEvent.eventType === 'missed'`

---

## Reliability Score Formula

Located in `lib/rotation.ts → computeReliabilityScore()`:

```
score = (completed / total × 100)
      - (missed × missedPenaltyWeight × 5)
      - (late × latePenaltyWeight × 2)
      + min(contributions × helpWeight × 2, 10)

clamped to [0, 100]
```

The bonus is capped at +10 to prevent gaming via unlimited help points.
