<div align="center">

# 🅿️ ParkGrid
### Smart Parking Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-white?logo=flask&logoColor=black)](https://flask.palletsprojects.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql&logoColor=white)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow?logo=python)](https://python.org)

**Real-time parking facility management — slot grid, EV charging, loyalty rewards, and revenue analytics in one unified dashboard.**

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Database Schema](#-database-schema) · [Demo Accounts](#-demo-accounts)

</div>

---

## ✨ Features

| Module | Description |
|---|---|
| **🅿️ Live Slot Grid** | BookMyShow-style real-time occupancy map — colour-coded by status & type, hover tooltips, filter by lot/floor/status |
| **⏱ Sessions** | Full vehicle lifecycle — entry, active tracking, checkout with loyalty discount, cancel |
| **⚡ EV Stations** | Start/stop charging sessions, per-station checkout, power kW & connector info |
| **🏢 Parking Lots** | Create lots with auto-generated spots, floor layouts, view spot grid per lot |
| **🏆 Loyalty Program** | 💎 Platinum / 👑 Gold / 🥈 Silver / 🥉 Bronze tiers — earn points, redeem for discounts |
| **🚗 Vehicle Registry** | All vehicles, session history, loyalty card linkage, one-click card issuance |
| **₹ Dynamic Rates** | Per vehicle-type × spot-type pricing with minimum charges and effective dates |
| **📈 Revenue Analytics** | Monthly charts with colour-coded bars, payment method breakdown, 12-month KPIs |
| **🔐 Role-Based Auth** | Admin · Operator · Attendant — three staff roles with scoped access |
| **🌐 Demo Mode** | Full mock data fallback — works completely offline without a backend |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MySQL** 8.0+

### 1 — Database Setup

```bash
# Create the database and seed initial data
mysql -u root -p < schema_and_seed.sql

# (Optional) Load extended seed data — 9 lots, 500+ spots, 30 vehicles
mysql -u root -p parking_db < extended_seed.sql
```

### 2 — Backend

```bash
cd parkgrid-backend-fixed

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start the API server
python app.py
# → Running on http://localhost:5000
```

### 3 — Frontend

```bash
cd parkgrid-frontend-fixed

# Install dependencies
npm install

# Configure environment (optional — works without backend in demo mode)
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start the development server
npm run dev
# → Open http://localhost:3000
```

### 4 — Sign In

Open [http://localhost:3000/login](http://localhost:3000/login) and click any demo account, or use:

| Email | Password | Role |
|---|---|---|
| `admin@parking.local` | `password` | Admin |
| `op1@parking.local` | `password` | Operator |
| `gate1@parking.local` | `password` | Attendant |

---

## 🏗 Architecture


```
parkgrid/
├── parkgrid-frontend-fixed/          # Next.js 16 app
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── login/page.tsx            # Staff login
│   │   ├── features/page.tsx         # Features page
│   │   ├── help/page.tsx             # Help center
│   │   ├── about/page.tsx            # About page
│   │   └── dashboard/
│   │       ├── layout.tsx            # Dashboard shell + auth guard
│   │       ├── page.tsx              # Overview / KPIs
│   │       ├── grid/page.tsx         # Live slot grid
│   │       ├── sessions/page.tsx     # Sessions + checkout
│   │       ├── ev/page.tsx           # EV station management
│   │       ├── lots/page.tsx         # Parking lot management
│   │       ├── loyalty/page.tsx      # Loyalty cards
│   │       ├── vehicles/page.tsx     # Vehicle registry
│   │       ├── rates/page.tsx        # Pricing configuration
│   │       └── revenue/page.tsx      # Revenue analytics
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ParkingGrid.tsx       # BookMyShow-style slot grid
│   │   │   └── RevenueChart.tsx      # Colour-coded bar+area chart
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── Topbar.tsx            # Page header + status
│   │   └── ui/index.tsx              # Shared UI components
│   └── lib/
│       ├── api.ts                    # All API calls + mock data
│       └── auth.tsx                  # Auth context + localStorage
│
└── parkgrid-backend-fixed/           # Flask REST API
    ├── app.py                        # App factory + blueprint registration
    ├── db.py                         # MySQL connection pool + helpers
    ├── routes/
    │   ├── auth.py                   # POST /api/auth/login
    │   ├── dashboard.py              # GET /api/dashboard/*
    │   ├── sessions.py               # CRUD /api/sessions/*
    │   ├── parking.py                # Lots, Spots, EV, Loyalty, Rates
    │   └── vehicles.py               # CRUD /api/vehicles/*
    ├── schema_and_seed.sql           # Full schema + initial seed data
    └── extended_seed.sql             # Extended data — 9 lots, 500+ spots
```

---

## ⚙️ Environment Variables

### Backend — `.env`

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parking_db

# Flask
FLASK_PORT=5000
FLASK_DEBUG=true

# JWT (change in production!)
JWT_SECRET_KEY=super-secret-parking-key-change-me
```

### Frontend — `.env.local`

```env
# Point to your Flask backend
# Leave blank to run in Demo Mode (mock data)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> **Demo Mode:** When `NEXT_PUBLIC_API_URL` is not set or the backend is unreachable, the frontend automatically falls back to realistic mock data. Every feature is fully explorable without a database.

---

## 📡 API Reference

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@parking.local", "password": "password" }
```

### Dashboard

```http
GET /api/dashboard/overview          # KPI counts — spots, revenue, EV, loyalty
GET /api/dashboard/occupancy-map     # All spots with status for grid rendering
GET /api/dashboard/active-sessions   # Currently parked vehicles
GET /api/dashboard/monthly-revenue   # Revenue by month (last 12)
GET /api/dashboard/lot-summary       # Per-lot occupancy with counts
```

### Sessions

```http
GET    /api/sessions/?status=active&limit=50&plate=KA01
POST   /api/sessions/entry            # Record vehicle entry
POST   /api/sessions/{id}/checkout   # Process payment + award loyalty points
POST   /api/sessions/{id}/cancel     # Cancel without charging
GET    /api/sessions/{id}            # Single session detail
```

**Entry request body:**
```json
{
  "plate_number": "KA01AB1234",
  "spot_id": 42,
  "vehicle_type": "car",
  "owner_name": "Ravi Kumar",
  "loyalty_card_id": 7
}
```

**Checkout request body:**
```json
{
  "payment_method": "upi",
  "apply_loyalty_discount": true
}
```

**Checkout response:**
```json
{
  "amount_charged": 120.00,
  "original_amount": 160.00,
  "loyalty_discount": 40.00,
  "duration_mins": 240,
  "points_earned": 12,
  "message": "Checkout successful"
}
```

### Parking Lots & Spots

```http
GET    /api/lots                       # All lots with occupancy counts
POST   /api/lots                       # Create lot (auto-generates spots)
GET    /api/lots/{id}                  # Lot detail + all spots
PUT    /api/lots/{id}                  # Update lot
DELETE /api/lots/{id}                  # Delete lot
POST   /api/lots/{id}/spots            # Bulk add spots to existing lot
GET    /api/spots?status=available     # Filter spots by lot/type/status
POST   /api/spots/{id}/reserve         # Reserve a spot
DELETE /api/spots/{id}/reserve         # Cancel reservation
```

### EV Stations

```http
GET  /api/ev-stations                  # All stations with status
PUT  /api/ev-stations/{id}             # Update status (available/charging/offline)
POST /api/ev-stations/{id}/checkout    # Checkout EV session by station ID
```

### Loyalty

```http
GET  /api/loyalty?q=search             # Search cards by plate/name/card number
GET  /api/loyalty/leaderboard          # Top 10 members by points
GET  /api/loyalty/{id}                 # Card detail
POST /api/loyalty                      # Issue new card  { "vehicle_id": 5 }
POST /api/loyalty/{id}/add-points      # Manual points  { "points": 100, "reason": "bonus" }
POST /api/loyalty/{id}/redeem          # Redeem points  { "points_to_redeem": 200, "session_id": 12 }
```

### Rates

```http
GET    /api/rates
POST   /api/rates        # { "vehicle_type": "car", "spot_type": "regular", "rate_per_hr": 40, "min_charge": 40, "effective_from": "2024-01-01" }
PUT    /api/rates/{id}
DELETE /api/rates/{id}
```

### Analytics

```http
GET /api/analytics/revenue             # 12-month totals, by vehicle type, by payment method
GET /api/analytics/occupancy-trend     # 30-day entry trend
GET /api/analytics/loyalty-summary     # Tier distribution
```

---

## 🗄 Database Schema

```sql
parking_lots        -- id, name, location, total_spots
parking_spots       -- id, lot_id, spot_number, spot_type*, status**, floor
vehicles            -- id, plate_number, owner_name, vehicle_type†
loyalty_cards       -- id, card_number, vehicle_id, points, tier‡, status
sessions            -- id, spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time,
                   --    duration_mins, amount_charged, payment_status§, payment_method¶
ev_stations         -- id, lot_id, spot_id, power_kw, status
rates               -- id, vehicle_type, spot_type, rate_per_hr, min_charge, effective_from
staff               -- id, name, email, password_hash, role
audit_log           -- id, staff_id, action, entity, notes
```

**Enum values (important — must match exactly):**

| Column | Values |
|---|---|
| `spot_type`* | `regular` · `ev` · `handicap` · `vip` |
| `status`** | `available` · `occupied` · `reserved` · `maintenance` |
| `vehicle_type`† | `car` · `motorcycle` · `truck` · `ev` |
| `tier`‡ | `bronze` · `silver` · `gold` · `platinum` |
| `payment_status`§ | `pending` · `paid` · `waived` |
| `payment_method`¶ | `cash` · `card` · `upi` · `loyalty` |

### Billing Formula

```
charge = MAX(min_charge, CEIL(duration_hours) × rate_per_hr)
```

Rate is looked up by `vehicle_type × spot_type`. Falls back to `vehicle_type` only if no match, then defaults to ₹40/hr.

### Loyalty Points

```
Points earned  = FLOOR(amount_paid / 10)       →  ₹10 = 1 pt
Points value   = (points / 100) × ₹10          →  100 pts = ₹10 off
Tier thresholds: Bronze 0 | Silver 500 | Gold 1,500 | Platinum 3,000
```

---

## 🏆 Loyalty Tiers

Each tier has a unique glossy credit card design rendered directly in the browser:

| Tier | Points | Card | Discount Cap |
|---|---|---|---|
| 💎 Platinum | 3,000+ | Cyan / icy white gradient | 20% auto-discount |
| 👑 Gold | 1,500–2,999 | Gold / amber gradient | 20% auto-discount |
| 🥈 Silver | 500–1,499 | Steel grey / white gradient | 20% auto-discount |
| 🥉 Bronze | 0–499 | Copper / bronze gradient | 20% auto-discount |

Tier recalculates automatically on every points change (earn or redeem).

---

## 👥 Demo Accounts

| Badge | Name | Email | Password | Role | Access |
|---|---|---|---|---|---|
| 👑 | Admin User | `admin@parking.local` | `password` | admin | Full access — all modules |
| ⚙️ | Operator One | `op1@parking.local` | `password` | operator | Sessions, EV, Loyalty |
| 🚦 | Gate Attendant | `gate1@parking.local` | `password` | attendant | Entry & checkout only |

> Click any account card on the login page for instant one-click access without typing.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1 | App Router, SSR, routing |
| React | 19.2 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility styling |
| Recharts | 3.8 | Charts (ComposedChart, Area, Bar) |
| Syne + DM Sans | — | Typography (via Google Fonts) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Flask | 3.0.3 | REST API framework |
| Flask-CORS | 4.0.1 | Cross-origin requests |
| Flask-JWT-Extended | 4.6.0 | JWT authentication |
| mysql-connector-python | 8.4.0 | Database driver |
| bcrypt | 4.1.3 | Password hashing |
| python-dotenv | 1.0.1 | Environment config |

### Database
| Feature | Detail |
|---|---|
| Engine | MySQL 8.0 |
| Connection pooling | `pool_size=10` via mysql-connector |
| Views | `v_lot_occupancy`, `v_revenue_summary`, `v_active_sessions` |
| Stored procedure | `sp_checkout_session` (legacy — API handles billing directly) |
| Seed data | 9 lots, 500+ spots, 32 vehicles, 32 loyalty cards, 25 EV stations |

---

## 🔄 Key Workflows

### Vehicle Entry → Checkout

```
1. Staff opens Sessions → New Entry
2. Enter plate number, select spot, choose vehicle type
3. System auto-links existing loyalty card (if any)
4. Optionally issue new loyalty card on the spot
5. Session created → spot marked occupied

On exit:
6. Staff clicks Checkout on active session
7. Choose payment method (UPI / Cash / Card)
8. Optionally redeem loyalty points (100 pts = ₹10 off)
9. System calculates: MAX(min_charge, ceil(hours) × rate)
10. Points awarded: FLOOR(amount_paid / 10)
11. Tier recalculated → spot freed
```

### EV Charging Workflow

```
1. Staff opens EV Stations
2. Click "⚡ Start" on available station
3. Enter plate → session created, station = charging
4. When vehicle leaves → "💳 Checkout"
5. System finds active session by spot_id
6. EV rate applied (higher than regular)
7. Station status → available
```

---

## 🧪 Running Without a Backend

The frontend includes complete mock data that mirrors the real DB schema. To run in demo mode:

```bash
# Don't set NEXT_PUBLIC_API_URL in .env.local
# The app will display "Demo Mode" in the topbar
npm run dev
```

Every feature works: slot grid, sessions, checkout simulation, loyalty cards, EV stations, revenue charts, lot management.

---

## 🚢 Production Deployment

### Backend

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or with systemd / supervisor / Docker
```

### Frontend

```bash
# Build for production
npm run build

# Start production server
npm start

# Or export as static site (if no SSR needed)
npm run build && npx serve out
```

### Environment Checklist

- [ ] Change `JWT_SECRET_KEY` to a long random string
- [ ] Set `FLASK_DEBUG=false`
- [ ] Use a strong MySQL password
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend domain
- [ ] Enable HTTPS (reverse proxy via Nginx / Caddy)
- [ ] Create a non-root MySQL user with limited privileges

---

## 📋 SQL Quick Reference

```sql
-- Check active sessions right now
SELECT v.plate_number, ps.spot_number, pl.name AS lot,
       TIMESTAMPDIFF(MINUTE, s.entry_time, NOW()) AS mins_parked
FROM sessions s
JOIN vehicles v ON v.id = s.vehicle_id
JOIN parking_spots ps ON ps.id = s.spot_id
JOIN parking_lots pl ON pl.id = ps.lot_id
WHERE s.exit_time IS NULL;

-- Revenue today
SELECT SUM(amount_charged) AS today_revenue, COUNT(*) AS checkouts
FROM sessions
WHERE payment_status = 'paid' AND DATE(exit_time) = CURDATE();

-- Top loyalty members
SELECT v.owner_name, v.plate_number, lc.card_number, lc.tier, lc.points
FROM loyalty_cards lc
JOIN vehicles v ON v.id = lc.vehicle_id
WHERE lc.status = 'active'
ORDER BY lc.points DESC LIMIT 10;

-- Lot occupancy snapshot
SELECT pl.name, pl.total_spots,
       COUNT(CASE WHEN ps.status='occupied' THEN 1 END) AS occupied,
       COUNT(CASE WHEN ps.status='available' THEN 1 END) AS available,
       ROUND(100 * COUNT(CASE WHEN ps.status='occupied' THEN 1 END) / pl.total_spots, 1) AS pct
FROM parking_lots pl
LEFT JOIN parking_spots ps ON ps.lot_id = pl.id
GROUP BY pl.id, pl.name, pl.total_spots
ORDER BY pct DESC;

-- Add a new staff member
INSERT INTO staff (name, email, password_hash, role)
VALUES ('New Operator', 'op2@parking.local', '$2b$12$...bcrypt_hash...', 'operator');
```

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `No active session for EV station` | Station linked to wrong spot | Ensure `ev_stations.spot_id` matches the spot with the session |
| Vehicle entry fails — "spot occupied" | Previous session not closed | Backend auto-closes dangling sessions; or run `UPDATE parking_spots SET status='available' WHERE id=?` |
| Loyalty card not linking on entry | Card is `inactive` or `suspended` | Set `status='active'` in `loyalty_cards` table |
| Revenue chart shows only one bar | Only one month has paid sessions | This is correct — add more sessions with past `exit_time` dates |
| `waived` sessions showing as active | Frontend filter mismatch | Sessions with `payment_status='waived'` are cancelled — they display as red in the table |
| EV checkout — `No active session found` | Session looked up by wrong spot | Use the `/api/ev-stations/{id}/checkout` endpoint which does server-side spot_id lookup |
| `key prop` warning in React | Undefined `lot.id` | Always use `key={String(lot.id ?? lot.name ?? idx)}` pattern |

---

## 📄 License

Apache License 2.0 — free to use, modify and distribute.

---

<div align="center">

Built with ❤️ using **Next.js 16** · **Flask 3** · **MySQL 8**

</div>
