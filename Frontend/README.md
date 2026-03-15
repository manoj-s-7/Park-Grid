# ParkGrid Frontend (Next.js)

A professional dark-theme parking management frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

The app runs on **http://localhost:3000** and connects to the Flask backend at **http://localhost:5000**.

## Environment

Create `.env.local` (already included):

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Demo Login

When the backend is offline, use:
- **Email:** any email address
- **Password:** `password`

## Pages

| Route | Description |
|---|---|
| `/about` | Landing / About page |
| `/login` | Split-panel login |
| `/dashboard` | Overview with KPIs, slot grid preview, revenue chart |
| `/dashboard/grid` | Full live slot grid with filters |
| `/dashboard/sessions` | All parking sessions table |
| `/dashboard/vehicles` | Vehicle registry |
| `/dashboard/ev` | EV charging stations |
| `/dashboard/lots` | Parking lot occupancy |
| `/dashboard/loyalty` | Loyalty cards |
| `/dashboard/rates` | Pricing rates |
| `/dashboard/revenue` | Revenue analytics |

## Backend API

Connects to Flask backend routes:
- `GET /api/dashboard/overview`
- `GET /api/dashboard/occupancy-map`
- `GET /api/dashboard/monthly-revenue`
- `GET /api/dashboard/active-sessions`
- `GET /api/lots`
- `GET /api/spots`
- `GET /api/ev-stations`
- `GET /api/sessions/`
- `GET /api/vehicles/`
- `GET /api/loyalty`
- `GET /api/rates`
- `GET /api/analytics/revenue`
- `POST /api/auth/login`

All API calls gracefully fall back to mock data when the backend is unreachable.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** — revenue bar charts
- **Lucide React** — icons
- **Fonts:** Syne (display) + DM Sans (body)
