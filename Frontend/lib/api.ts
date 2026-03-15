const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    const data = await res.json();
    if (!res.ok) return data as any; // return error obj for caller to handle
    return data;
  } catch {
    return null;
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
export const getDashboardOverview  = () => apiFetch('/api/dashboard/overview');
export const getOccupancyMap       = () => apiFetch('/api/dashboard/occupancy-map');
export const getMonthlyRevenue     = () => apiFetch('/api/dashboard/monthly-revenue');
export const getActiveSessions     = () => apiFetch('/api/dashboard/active-sessions');
export const getLotSummary         = () => apiFetch('/api/dashboard/lot-summary');
export const getRevenueChart       = () => apiFetch('/api/dashboard/revenue-chart');

// ── SPOTS ─────────────────────────────────────────────────────────────────
export const getSpots = (params?: Record<string, string>) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/api/spots${q}`);
};
export const updateSpotStatus = (spotId: number, status: string) =>
  apiFetch(`/api/spots/${spotId}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const reserveSpot = (spotId: number, data: Record<string, any>) =>
  apiFetch(`/api/spots/${spotId}/reserve`, { method: 'POST', body: JSON.stringify(data) });
export const cancelReservation = (spotId: number) =>
  apiFetch(`/api/spots/${spotId}/reserve`, { method: 'DELETE' });

// ── LOTS ──────────────────────────────────────────────────────────────────
export const getLots = () => apiFetch('/api/lots');
export const getLot  = (id: number) => apiFetch(`/api/lots/${id}`);
export const createLot = (data: Record<string, any>) =>
  apiFetch('/api/lots', { method: 'POST', body: JSON.stringify(data) });
export const updateLot = (id: number, data: Record<string, any>) =>
  apiFetch(`/api/lots/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLot = (id: number) =>
  apiFetch(`/api/lots/${id}`, { method: 'DELETE' });
export const bulkAddSpots = (lotId: number, data: Record<string, any>) =>
  apiFetch(`/api/lots/${lotId}/spots`, { method: 'POST', body: JSON.stringify(data) });

// ── EV STATIONS ───────────────────────────────────────────────────────────
export const getEVStations   = () => apiFetch('/api/ev-stations');
export const updateEVStation = (id: number, status: string) =>
  apiFetch(`/api/ev-stations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const evCheckout = (evId: number, data: Record<string, any>) =>
  apiFetch(`/api/ev-stations/${evId}/checkout`, { method: 'POST', body: JSON.stringify(data) });

// ── LOYALTY ───────────────────────────────────────────────────────────────
export const getLoyalty = (search?: string) =>
  apiFetch(`/api/loyalty${search ? `?q=${encodeURIComponent(search)}` : ''}`);
export const getLoyaltyCard = (id: number) => apiFetch(`/api/loyalty/${id}`);
export const createLoyaltyCard = (vehicleId: number) =>
  apiFetch('/api/loyalty', { method: 'POST', body: JSON.stringify({ vehicle_id: vehicleId }) });
export const updateLoyaltyCard = (id: number, data: Record<string, any>) =>
  apiFetch(`/api/loyalty/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const addLoyaltyPoints = (id: number, points: number, reason?: string) =>
  apiFetch(`/api/loyalty/${id}/add-points`, { method: 'POST', body: JSON.stringify({ points, reason }) });
export const redeemPoints = (id: number, data: { points_to_redeem: number; session_id?: number }) =>
  apiFetch(`/api/loyalty/${id}/redeem`, { method: 'POST', body: JSON.stringify(data) });
export const getLoyaltyLeaderboard = () => apiFetch('/api/loyalty/leaderboard');

// ── RATES ─────────────────────────────────────────────────────────────────
export const getRates   = () => apiFetch('/api/rates');
export const createRate = (data: Record<string, any>) =>
  apiFetch('/api/rates', { method: 'POST', body: JSON.stringify(data) });
export const updateRate = (id: number, data: Record<string, any>) =>
  apiFetch(`/api/rates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRate = (id: number) =>
  apiFetch(`/api/rates/${id}`, { method: 'DELETE' });

// ── SESSIONS ──────────────────────────────────────────────────────────────
export const getSessions = (status?: string, limit = 100, offset = 0, plate?: string) => {
  const q = new URLSearchParams({ status: status || 'all', limit: String(limit), offset: String(offset) });
  if (plate) q.set('plate', plate);
  return apiFetch(`/api/sessions/?${q}`);
};
export const getSession  = (id: number) => apiFetch(`/api/sessions/${id}`);
export const vehicleEntry = (data: Record<string, any>) =>
  apiFetch('/api/sessions/entry', { method: 'POST', body: JSON.stringify(data) });
export const checkout = (sessionId: number, data: Record<string, any>) =>
  apiFetch(`/api/sessions/${sessionId}/checkout`, { method: 'POST', body: JSON.stringify(data) });
export const cancelSession = (sessionId: number) =>
  apiFetch(`/api/sessions/${sessionId}/cancel`, { method: 'POST' });

// ── VEHICLES ──────────────────────────────────────────────────────────────
export const getVehicles  = (search?: string, limit = 100) =>
  apiFetch(`/api/vehicles/?q=${encodeURIComponent(search || '')}&limit=${limit}`);
export const getVehicle   = (id: number) => apiFetch(`/api/vehicles/${id}`);
export const createVehicle = (data: Record<string, any>) =>
  apiFetch('/api/vehicles/', { method: 'POST', body: JSON.stringify(data) });
export const updateVehicle = (id: number, data: Record<string, any>) =>
  apiFetch(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ── ANALYTICS ─────────────────────────────────────────────────────────────
export const getAnalyticsRevenue  = () => apiFetch('/api/analytics/revenue');
export const getOccupancyTrend    = () => apiFetch('/api/analytics/occupancy-trend');
export const getLoyaltySummary    = () => apiFetch('/api/analytics/loyalty-summary');

// ─────────────────────────────────────────────────────────────────────────
// MOCK DATA — used when backend is unavailable
// ─────────────────────────────────────────────────────────────────────────

let _mockLotData: any[] | null = null;
let _mockSpotData: any[] | null = null;
let _mockSessionData: any[] | null = null;
let _mockLoyaltyData: any[] | null = null;
let _mockEVData: any[] | null = null;

export function mockOverview() {
  return {
    lots: 4, spots_total: 200, spots_occupied: 118,
    ev_total: 16, ev_charging: 7, loyalty_active: 87,
    today_revenue: 18420, customers_today: 62,
    ev_customers_today: 14, active_sessions: 118,
  };
}

export function mockLots() {
  if (_mockLotData) return _mockLotData;
  _mockLotData = [
    { id: 1, name: 'Lot A', location: 'Block 1, Ground Floor', total_spots: 60, occupied_spots: 42, available_spots: 14, reserved_spots: 4,  occupancy_pct: 70 },
    { id: 2, name: 'Lot B', location: 'Block 2, Basement',     total_spots: 80, occupied_spots: 72, available_spots: 6,  reserved_spots: 2,  occupancy_pct: 90 },
    { id: 3, name: 'Lot C', location: 'Block 3, Level 1',      total_spots: 40, occupied_spots: 4,  available_spots: 34, reserved_spots: 2,  occupancy_pct: 10 },
    { id: 4, name: 'Lot D', location: 'Block 4, Rooftop',      total_spots: 20, occupied_spots: 0,  available_spots: 20, reserved_spots: 0,  occupancy_pct: 0  },
  ];
  return _mockLotData;
}

export function mockSpots() {
  if (_mockSpotData) return _mockSpotData;
  const lots  = mockLots();
  const spots: any[] = [];
  let id = 1;
  lots.forEach((lot: any, li: number) => {
    const perFloor = Math.ceil(lot.total_spots / 2);
    for (let fl = 1; fl <= 2; fl++) {
      for (let n = 1; n <= perFloor; n++) {
        const globalIdx = spots.length;
        let spotType = 'regular';
        if (n % 12 === 0) spotType = 'ev';
        else if (n % 18 === 0) spotType = 'handicap';
        else if (n % 15 === 0) spotType = 'vip';
        let status = 'available';
        if (globalIdx < lot.occupied_spots) status = 'occupied';
        else if (globalIdx < lot.occupied_spots + lot.reserved_spots) status = 'reserved';
        spots.push({
          id: id++,
          spot_number: `${String.fromCharCode(64 + li + 1)}-${String(n).padStart(2, '0')}`,
          spot_type: spotType,
          status,
          floor: fl,
          lot_name: lot.name,
          lot_id: lot.id,
        });
      }
    }
  });
  _mockSpotData = spots;
  return spots;
}

const PLATES  = ['KA01AB1234','MH02CD5678','TN03EF9012','DL04GH3456','KA05IJ7890','GJ01ZZ9999','MH12XY4321','KA09PQ8765'];
const OWNERS  = ['Ravi Kumar','Priya Sharma','Arjun Nair','Sneha Mehta','Dev Patel','Meera Iyer','Karan Singh','Ananya Bose'];

export function mockSessions() {
  if (_mockSessionData) return _mockSessionData;
  _mockSessionData = Array.from({ length: 30 }, (_, i) => {
    const active = i < 14;
    const entry  = new Date(Date.now() - Math.floor(Math.random() * 7200000 + 600000));
    const hasCard = i % 3 === 0;
    return {
      id: i + 1,
      spot_number: `A-${String((i % 24) + 1).padStart(2, '0')}`,
      spot_type: i % 7 === 0 ? 'ev' : 'regular',
      lot_name: ['Main Plaza Parking', 'West Wing Annex', 'Airport Terminal Lot', 'Main Plaza Parking'][i % 4],
      plate_number: PLATES[i % 8],
      owner_name: OWNERS[i % 8],
      vehicle_type: ['car', 'motorcycle', 'truck'][i % 3],
      entry_time: entry.toISOString(),
      exit_time: active ? null : new Date(entry.getTime() + Math.floor(Math.random() * 5400000 + 1800000)).toISOString(),
      duration_mins: active ? null : Math.floor(30 + Math.random() * 180),
      amount_charged: active ? null : Math.floor(40 + Math.random() * 320),
      payment_status: active ? 'pending' : 'paid',
      payment_method: active ? null : ['cash', 'upi', 'card'][i % 3],
      loyalty_discount: hasCard ? Math.floor(Math.random() * 30) : 0,
      loyalty_card_id: hasCard ? i + 10 : null,
      card_number: hasCard ? `LC-2024-0000${i}` : null,
      tier: ['bronze', 'silver', 'gold'][i % 3],
      points: hasCard ? Math.floor(Math.random() * 1800) : 0,
      elapsed_mins: active ? Math.floor(10 + Math.random() * 110) : null,
    };
  });
  return _mockSessionData;
}

export function mockEV() {
  if (_mockEVData) return _mockEVData;
  const connectors = ['Type 2', 'CCS', 'CHAdeMO', 'Type 2'];
  const statuses   = ['charging', 'charging', 'available', 'available', 'offline'];
  _mockEVData = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    spot_number: `EV-${String(i + 1).padStart(2, '0')}`,
    status: statuses[i % 5],
    power_kw: [7.2, 11, 22, 50][i % 4],
    lot_name: ['Lot A', 'Lot B', 'Lot C', 'Lot D'][Math.floor(i / 4)],
    connector_type: connectors[i % 4],
    spot_id: i + 1,
  }));
  return _mockEVData;
}

export function mockLoyalty() {
  if (_mockLoyaltyData) return _mockLoyaltyData;
  _mockLoyaltyData = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    card_number: `LC-${String(i).padStart(8, '0')}`,
    owner_name: OWNERS[i % 8],
    plate_number: PLATES[i % 8],
    vehicle_type: ['car', 'bike', 'truck'][i % 3],
    tier: i % 6 < 2 ? 'gold' : i % 6 < 4 ? 'silver' : 'bronze',
    points: [1800, 1200, 750, 420, 180, 60][i % 6],
    status: i % 9 === 0 ? 'inactive' : 'active',
    issued_at: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    vehicle_id: i + 1,
  }));
  return _mockLoyaltyData;
}

export function mockRevenue() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map((_, i) => ({
    month: `2025-${String(i + 1).padStart(2, '0')}`,
    revenue: 10000 + Math.floor(Math.random() * 20000),
    sessions: 180 + Math.floor(Math.random() * 320),
  }));
}

export function mockRates() {
  return [
    { id: 1, vehicle_type: 'car',        spot_type: 'regular',  rate_per_hr: 40,  min_charge: 40,  effective_from: '2024-01-01' },
    { id: 2, vehicle_type: 'car',        spot_type: 'ev',       rate_per_hr: 60,  min_charge: 60,  effective_from: '2024-01-01' },
    { id: 3, vehicle_type: 'car',        spot_type: 'vip',      rate_per_hr: 100, min_charge: 100, effective_from: '2024-01-01' },
    { id: 4, vehicle_type: 'car',        spot_type: 'handicap', rate_per_hr: 20,  min_charge: 20,  effective_from: '2024-01-01' },
    { id: 5, vehicle_type: 'motorcycle', spot_type: 'regular',  rate_per_hr: 20,  min_charge: 20,  effective_from: '2024-01-01' },
    { id: 6, vehicle_type: 'motorcycle', spot_type: 'vip',      rate_per_hr: 50,  min_charge: 50,  effective_from: '2024-01-01' },
    { id: 7, vehicle_type: 'truck',      spot_type: 'regular',  rate_per_hr: 80,  min_charge: 80,  effective_from: '2024-01-01' },
    { id: 8, vehicle_type: 'ev',         spot_type: 'ev',       rate_per_hr: 50,  min_charge: 50,  effective_from: '2024-01-01' },
  ];
}

export function mockAnalyticsRevenue() {
  return {
    total_12m: 248600, last_month: 22400, last_quarter: 64800,
    by_vehicle_type: [
      { vehicle_type: 'car',   revenue: 180000, sessions: 4200 },
      { vehicle_type: 'bike',  revenue: 42000,  sessions: 2100 },
      { vehicle_type: 'truck', revenue: 26600,  sessions: 380  },
    ],
    by_payment_method: [
      { payment_method: 'upi',  revenue: 148200, cnt: 3800 },
      { payment_method: 'cash', revenue: 74400,  cnt: 1900 },
      { payment_method: 'card', revenue: 26000,  cnt: 680  },
    ],
    daily_last_7_days: [],
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────
export function fmtINR(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
export function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
export function fmtDuration(mins: number | null | undefined): string {
  if (mins === null || mins === undefined) return '—';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── MOCK CHECKOUT (offline simulation) ────────────────────────────────────
export function mockCheckout(session: any, opts: { method: string; redeemPts: number }) {
  const rate = session.spot_type === 'ev' ? 60 : 40;
  const mins = session.elapsed_mins || 60;
  const hrs  = Math.ceil(mins / 60);
  const amount = Math.max(rate, hrs * rate);
  const discount = Math.floor(opts.redeemPts / 100) * 10;
  const final = Math.max(0, amount - discount);
  const pts_earned = Math.floor(final / 10);
  return {
    amount_charged:   final,
    original_amount:  amount,
    loyalty_discount: discount,
    duration_mins:    mins,
    points_earned:    pts_earned,
    message:          'Checkout successful (demo)',
  };
}

export function mockVehicleEntry(data: any) {
  return {
    session_id: Math.floor(Math.random() * 9000 + 1000),
    vehicle_id: Math.floor(Math.random() * 900 + 100),
    loyalty_card_id: null,
    message: 'Entry recorded (demo)',
  };
}

export function mockCreateLoyaltyCard(vehicleId: number) {
  return {
    id: Math.floor(Math.random() * 900 + 100),
    card_number: `LC-${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
    tier: 'bronze',
    points: 0,
    owner_name: 'Customer',
    plate_number: '—',
  };
}
