from flask import Blueprint, jsonify
from db import query

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@bp.get("/overview")
def overview():
    lots            = query("SELECT COUNT(*) AS c FROM parking_lots")[0]["c"]
    spots_total     = query("SELECT COUNT(*) AS c FROM parking_spots")[0]["c"]
    spots_occ       = query("SELECT COUNT(*) AS c FROM parking_spots WHERE status='occupied'")[0]["c"]
    ev_total        = query("SELECT COUNT(*) AS c FROM ev_stations")[0]["c"]
    ev_charging     = query("SELECT COUNT(*) AS c FROM ev_stations WHERE status='charging'")[0]["c"]
    loyalty_active  = query("SELECT COUNT(*) AS c FROM loyalty_cards WHERE status='active'")[0]["c"]
    today_revenue   = query("""
        SELECT IFNULL(SUM(amount_charged), 0) AS r FROM sessions
        WHERE DATE(exit_time) = CURDATE() AND payment_status = 'paid'
    """)[0]["r"]
    customers_today = query("""
        SELECT COUNT(DISTINCT vehicle_id) AS c FROM sessions
        WHERE DATE(entry_time) = CURDATE()
    """)[0]["c"]
    ev_customers    = query("""
        SELECT COUNT(DISTINCT s.vehicle_id) AS c
        FROM sessions s
        JOIN parking_spots ps ON ps.id = s.spot_id
        WHERE ps.spot_type = 'ev' AND DATE(s.entry_time) = CURDATE()
    """)[0]["c"]
    active_sessions = query(
        "SELECT COUNT(*) AS c FROM sessions WHERE exit_time IS NULL"
    )[0]["c"]

    return jsonify({
        "lots":               lots,
        "spots_total":        spots_total,
        "spots_occupied":     spots_occ,
        "ev_total":           ev_total,
        "ev_charging":        ev_charging,
        "loyalty_active":     loyalty_active,
        "today_revenue":      float(today_revenue),
        "customers_today":    customers_today,
        "ev_customers_today": ev_customers,
        "active_sessions":    active_sessions,
    })


@bp.get("/occupancy-map")
def occupancy_map():
    spots = query("""
        SELECT ps.id, ps.spot_number, ps.spot_type, ps.status, ps.floor,
               pl.name AS lot_name
        FROM parking_spots ps
        JOIN parking_lots pl ON pl.id = ps.lot_id
        ORDER BY ps.lot_id, ps.floor, ps.spot_number
    """)
    return jsonify(spots)


@bp.get("/revenue-chart")
def revenue_chart():
    rows = query("""
        SELECT DATE(exit_time) AS date,
               ROUND(SUM(amount_charged), 2) AS revenue,
               COUNT(*) AS sessions
        FROM sessions
        WHERE payment_status = 'paid'
          AND exit_time IS NOT NULL
          AND exit_time >= NOW() - INTERVAL 12 MONTH
        GROUP BY DATE(exit_time)
        ORDER BY date
    """)
    return jsonify(rows)


@bp.get("/monthly-revenue")
def monthly_revenue():
    rows = query("""
        SELECT DATE_FORMAT(exit_time, '%Y-%m') AS month,
               ROUND(SUM(amount_charged), 2)   AS revenue,
               COUNT(*)                        AS sessions
        FROM sessions
        WHERE payment_status = 'paid'
          AND exit_time IS NOT NULL
          AND exit_time >= NOW() - INTERVAL 12 MONTH
        GROUP BY DATE_FORMAT(exit_time, '%Y-%m')
        ORDER BY month
    """)
    return jsonify(rows)


@bp.get("/active-sessions")
def active_sessions():
    rows = query("""
        SELECT s.id,
               ps.spot_number, ps.spot_type,
               pl.name AS lot_name,
               v.plate_number, v.owner_name, v.vehicle_type,
               s.entry_time,
               TIMESTAMPDIFF(MINUTE, s.entry_time, NOW()) AS elapsed_mins,
               lc.id AS loyalty_card_id,
               lc.card_number, lc.tier
        FROM sessions s
        JOIN parking_spots ps ON s.spot_id   = ps.id
        JOIN parking_lots pl  ON ps.lot_id   = pl.id
        JOIN vehicles v       ON s.vehicle_id = v.id
        LEFT JOIN loyalty_cards lc ON s.loyalty_card_id = lc.id
        WHERE s.exit_time IS NULL
        ORDER BY s.entry_time DESC
    """)
    return jsonify(rows)


@bp.get("/lot-summary")
def lot_summary():
    """Consistent columns matching what the frontend expects."""
    rows = query("""
        SELECT
            pl.id,
            pl.name,
            pl.location,
            pl.total_spots,
            COUNT(CASE WHEN ps.status='occupied'    THEN 1 END) AS occupied_spots,
            COUNT(CASE WHEN ps.status='available'   THEN 1 END) AS available_spots,
            COUNT(CASE WHEN ps.status='reserved'    THEN 1 END) AS reserved_spots,
            ROUND(
                100 * COUNT(CASE WHEN ps.status='occupied' THEN 1 END)
                    / GREATEST(pl.total_spots, 1),
                1
            ) AS occupancy_pct
        FROM parking_lots pl
        LEFT JOIN parking_spots ps ON ps.lot_id = pl.id
        GROUP BY pl.id, pl.name, pl.location, pl.total_spots
        ORDER BY pl.name
    """)
    return jsonify(rows)
