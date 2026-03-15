from flask import Blueprint, jsonify, request
from db import query, execute
import random, string, datetime, math

bp = Blueprint("parking", __name__, url_prefix="/api")

# ── TIER HELPER ────────────────────────────────────────────────────────────
TIER_THRESHOLDS = {"bronze": 0, "silver": 500, "gold": 1500, "platinum": 3000}

def _recalc_tier(points: int) -> str:
    p = int(points)
    if p >= TIER_THRESHOLDS["platinum"]: return "platinum"
    if p >= TIER_THRESHOLDS["gold"]:     return "gold"
    if p >= TIER_THRESHOLDS["silver"]:   return "silver"
    return "bronze"


# ── SPOTS ──────────────────────────────────────────────────────────────────
@bp.get("/spots")
def list_spots():
    lot_id = request.args.get("lot_id")
    stype  = request.args.get("type")
    status = request.args.get("status")
    params, wheres = [], []
    if lot_id:
        wheres.append("ps.lot_id=%s"); params.append(lot_id)
    if stype:
        # Accept both 'standard' and 'regular' for compatibility
        stype_db = "regular" if stype == "standard" else stype
        wheres.append("ps.spot_type=%s"); params.append(stype_db)
    if status:
        wheres.append("ps.status=%s"); params.append(status)
    where = ("WHERE " + " AND ".join(wheres)) if wheres else ""
    rows = query(f"""
        SELECT ps.id, ps.lot_id, ps.spot_number, ps.spot_type, ps.status, ps.floor,
               pl.name AS lot_name
        FROM parking_spots ps
        JOIN parking_lots pl ON pl.id = ps.lot_id
        {where}
        ORDER BY ps.lot_id, ps.floor, ps.spot_number
    """, params)
    return jsonify(rows)


@bp.put("/spots/<int:sid>")
def update_spot(sid):
    d = request.json or {}
    if "status" not in d:
        return jsonify({"error": "status required"}), 400
    execute("UPDATE parking_spots SET status=%s WHERE id=%s", (d["status"], sid))
    return jsonify({"message": "Updated"})


@bp.post("/spots/<int:sid>/reserve")
def reserve_spot(sid):
    d = request.json or {}
    plate  = d.get("plate_number", "").upper().strip()
    owner  = d.get("owner_name", "")
    vtype  = d.get("vehicle_type", "car")
    lc_id  = d.get("loyalty_card_id")

    # Normalise vehicle_type: 'bike'→'motorcycle'
    if vtype == "bike": vtype = "motorcycle"

    spot = query("SELECT * FROM parking_spots WHERE id=%s", (sid,), fetchone=True)
    if not spot:
        return jsonify({"error": "Spot not found"}), 404
    if spot["status"] != "available":
        return jsonify({"error": f"Spot is already {spot['status']}"}), 409

    veh_id = None
    if plate:
        existing = query("SELECT id FROM vehicles WHERE plate_number=%s", (plate,), fetchone=True)
        if existing:
            veh_id = existing["id"]
        else:
            veh_id, _ = execute(
                "INSERT INTO vehicles (plate_number, owner_name, vehicle_type) VALUES (%s,%s,%s)",
                (plate, owner, vtype)
            )

    execute("UPDATE parking_spots SET status='reserved' WHERE id=%s", (sid,))
    sess_id = None
    if veh_id:
        sess_id, _ = execute(
            "INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id) VALUES (%s,%s,%s)",
            (sid, veh_id, lc_id)
        )
    return jsonify({"message": "Spot reserved", "spot_id": sid, "session_id": sess_id, "vehicle_id": veh_id}), 201


@bp.delete("/spots/<int:sid>/reserve")
def cancel_reservation(sid):
    spot = query("SELECT * FROM parking_spots WHERE id=%s", (sid,), fetchone=True)
    if not spot:
        return jsonify({"error": "Spot not found"}), 404
    if spot["status"] != "reserved":
        return jsonify({"error": "Spot is not reserved"}), 409
    execute("""
        UPDATE sessions SET exit_time=NOW(), duration_mins=0, amount_charged=0,
            payment_status='waived', payment_method=NULL
        WHERE spot_id=%s AND exit_time IS NULL
    """, (sid,))
    execute("UPDATE parking_spots SET status='available' WHERE id=%s", (sid,))
    return jsonify({"message": "Reservation cancelled"})


# ── LOTS ──────────────────────────────────────────────────────────────────
@bp.get("/lots")
def list_lots():
    """
    Always returns consistent columns:
    id, name, location, total_spots, occupied_spots, available_spots, reserved_spots, occupancy_pct
    """
    rows = query("""
        SELECT
            pl.id,
            pl.name,
            pl.location,
            pl.total_spots,
            COUNT(CASE WHEN ps.status='occupied'    THEN 1 END) AS occupied_spots,
            COUNT(CASE WHEN ps.status='available'   THEN 1 END) AS available_spots,
            COUNT(CASE WHEN ps.status='reserved'    THEN 1 END) AS reserved_spots,
            COUNT(CASE WHEN ps.status='maintenance' THEN 1 END) AS maintenance_spots,
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


@bp.get("/lots/<int:lid>")
def get_lot(lid):
    lot = query("SELECT * FROM parking_lots WHERE id=%s", (lid,), fetchone=True)
    if not lot:
        return jsonify({"error": "Not found"}), 404
    spots = query("""
        SELECT ps.id, ps.lot_id, ps.spot_number, ps.spot_type, ps.status, ps.floor,
               pl.name AS lot_name
        FROM parking_spots ps
        JOIN parking_lots pl ON pl.id = ps.lot_id
        WHERE ps.lot_id=%s
        ORDER BY ps.floor, ps.spot_number
    """, (lid,))
    return jsonify({"lot": lot, "spots": spots})


@bp.post("/lots")
def create_lot():
    d           = request.json or {}
    name        = d.get("name", "").strip()
    location    = d.get("location", "").strip()
    total_spots = int(d.get("total_spots", 50))
    if not name:
        return jsonify({"error": "name required"}), 400

    lid, _ = execute(
        "INSERT INTO parking_lots (name, location, total_spots) VALUES (%s,%s,%s)",
        (name, location, total_spots)
    )

    if d.get("auto_generate_spots", True):
        floors    = int(d.get("floors", 1))
        per_floor = max(1, total_spots // floors)
        # Map frontend spot_type 'standard' → DB 'regular'
        raw_type  = d.get("spot_type", "regular")
        spot_type = "regular" if raw_type in ("standard", "regular") else raw_type
        for fl in range(1, floors + 1):
            for n in range(1, per_floor + 1):
                snum = f"{chr(64 + fl)}-{n:02d}"
                execute(
                    "INSERT INTO parking_spots (lot_id, spot_number, floor, spot_type, status) VALUES (%s,%s,%s,%s,'available')",
                    (lid, snum, fl, spot_type)
                )

    return jsonify({"id": lid, "message": f"Lot '{name}' created with {total_spots} spots"}), 201


@bp.put("/lots/<int:lid>")
def update_lot(lid):
    d = request.json or {}
    execute(
        "UPDATE parking_lots SET name=%s, location=%s, total_spots=%s WHERE id=%s",
        (d.get("name"), d.get("location"), d.get("total_spots"), lid)
    )
    return jsonify({"message": "Updated"})


@bp.delete("/lots/<int:lid>")
def delete_lot(lid):
    execute("DELETE FROM parking_lots WHERE id=%s", (lid,))
    return jsonify({"message": "Deleted"})


@bp.post("/lots/<int:lid>/spots")
def bulk_add_spots(lid):
    d         = request.json or {}
    count     = int(d.get("count", 10))
    floor     = int(d.get("floor", 1))
    raw_type  = d.get("spot_type", "regular")
    spot_type = "regular" if raw_type in ("standard", "regular") else raw_type
    existing  = query(
        "SELECT COUNT(*) AS c FROM parking_spots WHERE lot_id=%s AND floor=%s",
        (lid, floor), fetchone=True
    )
    start   = (existing["c"] or 0) + 1
    created = []
    for n in range(start, start + count):
        snum = f"{chr(64 + floor)}-{n:02d}"
        sid, _ = execute(
            "INSERT INTO parking_spots (lot_id, spot_number, floor, spot_type, status) VALUES (%s,%s,%s,%s,'available')",
            (lid, snum, floor, spot_type)
        )
        created.append(sid)
    return jsonify({"created": len(created), "spot_ids": created}), 201


# ── EV STATIONS ───────────────────────────────────────────────────────────
@bp.get("/ev-stations")
def ev_stations():
    rows = query("""
        SELECT ev.id, ev.lot_id, ev.spot_id, ev.power_kw, ev.status,
               ps.spot_number, ps.status AS spot_status,
               pl.name AS lot_name,
               'Type 2' AS connector_type
        FROM ev_stations ev
        JOIN parking_spots ps ON ps.id = ev.spot_id
        JOIN parking_lots pl  ON pl.id = ev.lot_id
        ORDER BY ev.lot_id, ps.spot_number
    """)
    return jsonify(rows)


@bp.put("/ev-stations/<int:evid>")
def update_ev(evid):
    d = request.json or {}
    if "status" not in d:
        return jsonify({"error": "status required"}), 400
    execute("UPDATE ev_stations SET status=%s WHERE id=%s", (d["status"], evid))
    return jsonify({"message": "Updated"})


@bp.post("/ev-stations/<int:evid>/checkout")
def ev_checkout(evid):
    """Checkout an EV charging session directly from the station."""
    data          = request.json or {}
    method        = data.get("payment_method", "upi")
    apply_loyalty = data.get("apply_loyalty_discount", False)

    ev = query("SELECT * FROM ev_stations WHERE id=%s", (evid,), fetchone=True)
    if not ev:
        return jsonify({"error": "EV station not found"}), 404

    # Find the active session for this EV spot
    sess = query("""
        SELECT s.*, ps.spot_type, v.vehicle_type
        FROM sessions s
        JOIN parking_spots ps ON ps.id = s.spot_id
        JOIN vehicles v ON v.id = s.vehicle_id
        WHERE s.spot_id = %s AND s.exit_time IS NULL
        ORDER BY s.entry_time DESC LIMIT 1
    """, (ev["spot_id"],), fetchone=True)

    if not sess:
        return jsonify({"error": "No active session for this EV station"}), 404

    # Rate lookup — EV spot type
    rate_row = query("""
        SELECT rate_per_hr, min_charge FROM rates
        WHERE vehicle_type=%s AND spot_type='ev'
        ORDER BY effective_from DESC LIMIT 1
    """, (sess["vehicle_type"],), fetchone=True)

    if not rate_row:
        rate_row = query("""
            SELECT rate_per_hr, min_charge FROM rates
            WHERE spot_type='ev'
            ORDER BY effective_from DESC LIMIT 1
        """, fetchone=True)

    rate       = float(rate_row["rate_per_hr"]) if rate_row else 60.0
    min_charge = float(rate_row["min_charge"])  if rate_row else 60.0

    entry = sess["entry_time"]
    if isinstance(entry, str):
        entry = datetime.datetime.fromisoformat(entry)
    mins   = max(1, int((datetime.datetime.now() - entry).total_seconds() / 60))
    hrs    = math.ceil(mins / 60)
    amount = max(min_charge, hrs * rate)

    discount = float(sess.get("loyalty_discount") or 0)

    if apply_loyalty and sess.get("loyalty_card_id"):
        card = query("SELECT * FROM loyalty_cards WHERE id=%s",
                     (sess["loyalty_card_id"],), fetchone=True)
        if card and int(card["points"]) >= 100:
            remaining    = amount - discount
            max_auto_pts = min(int(card["points"]), int(remaining * 0.2 / 10) * 100)
            if max_auto_pts >= 100:
                auto_disc = round((max_auto_pts / 100) * 10, 2)
                execute("UPDATE loyalty_cards SET points=points-%s WHERE id=%s",
                        (max_auto_pts, sess["loyalty_card_id"]))
                discount += auto_disc

    final_amount = max(0.0, round(amount - discount, 2))
    session_id   = sess["id"]

    execute("""
        UPDATE sessions
        SET exit_time=NOW(), duration_mins=%s, amount_charged=%s,
            payment_status='paid', payment_method=%s
        WHERE id=%s
    """, (mins, final_amount, method, session_id))

    execute("UPDATE parking_spots SET status='available' WHERE id=%s", (ev["spot_id"],))
    execute("UPDATE ev_stations SET status='available' WHERE id=%s", (evid,))

    pts_earned = 0
    if sess.get("loyalty_card_id") and final_amount > 0:
        pts_earned = int(final_amount // 10)
        if pts_earned > 0:
            card = query("SELECT * FROM loyalty_cards WHERE id=%s",
                         (sess["loyalty_card_id"],), fetchone=True)
            if card:
                new_pts  = int(card["points"]) + pts_earned
                new_tier = _recalc_tier(new_pts)
                execute("UPDATE loyalty_cards SET points=%s, tier=%s WHERE id=%s",
                        (new_pts, new_tier, sess["loyalty_card_id"]))

    return jsonify({
        "amount_charged":   final_amount,
        "original_amount":  round(amount, 2),
        "loyalty_discount": round(discount, 2),
        "duration_mins":    mins,
        "points_earned":    pts_earned,
        "message":          "EV checkout successful",
    })


# ── LOYALTY ───────────────────────────────────────────────────────────────
@bp.get("/loyalty")
def loyalty_list():
    search = request.args.get("q", "")
    rows = query("""
        SELECT lc.id, lc.card_number, lc.points, lc.tier, lc.status, lc.issued_at,
               v.id AS vehicle_id, v.plate_number, v.owner_name, v.vehicle_type
        FROM loyalty_cards lc
        JOIN vehicles v ON v.id = lc.vehicle_id
        WHERE v.plate_number LIKE %s OR v.owner_name LIKE %s OR lc.card_number LIKE %s
        ORDER BY lc.points DESC, lc.issued_at DESC
    """, (f"%{search}%", f"%{search}%", f"%{search}%"))
    return jsonify(rows)


@bp.get("/loyalty/leaderboard")
def loyalty_leaderboard():
    rows = query("""
        SELECT lc.id, lc.card_number, lc.tier, lc.points,
               v.owner_name, v.plate_number, v.vehicle_type
        FROM loyalty_cards lc
        JOIN vehicles v ON v.id = lc.vehicle_id
        WHERE lc.status = 'active'
        ORDER BY lc.points DESC
        LIMIT 10
    """)
    return jsonify(rows)


@bp.get("/loyalty/<int:lid>")
def get_loyalty(lid):
    row = query("""
        SELECT lc.id, lc.card_number, lc.points, lc.tier, lc.status, lc.issued_at,
               v.id AS vehicle_id, v.plate_number, v.owner_name, v.vehicle_type
        FROM loyalty_cards lc
        JOIN vehicles v ON v.id = lc.vehicle_id
        WHERE lc.id=%s
    """, (lid,), fetchone=True)
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"card": row, "redemption_history": []})


@bp.post("/loyalty")
def create_loyalty():
    d          = request.json or {}
    vehicle_id = d.get("vehicle_id")
    if not vehicle_id:
        return jsonify({"error": "vehicle_id required"}), 400

    veh = query("SELECT id, plate_number, owner_name FROM vehicles WHERE id=%s",
                (vehicle_id,), fetchone=True)
    if not veh:
        return jsonify({"error": "Vehicle not found"}), 404

    existing = query(
        "SELECT id, card_number FROM loyalty_cards WHERE vehicle_id=%s AND status='active'",
        (vehicle_id,), fetchone=True
    )
    if existing:
        return jsonify({
            "error": "Vehicle already has an active loyalty card",
            "card": existing,
            "card_number": existing["card_number"],
        }), 409

    card_no = "LC-" + "".join(random.choices(string.digits, k=8))
    lid, _  = execute(
        "INSERT INTO loyalty_cards (card_number, vehicle_id, points, tier, status) VALUES (%s,%s,0,'bronze','active')",
        (card_no, vehicle_id)
    )
    return jsonify({
        "id":           lid,
        "card_number":  card_no,
        "tier":         "bronze",
        "points":       0,
        "owner_name":   veh["owner_name"],
        "plate_number": veh["plate_number"],
    }), 201


@bp.put("/loyalty/<int:lid>")
def update_loyalty(lid):
    d = request.json or {}
    execute(
        "UPDATE loyalty_cards SET status=%s, tier=%s WHERE id=%s",
        (d.get("status", "active"), d.get("tier", "bronze"), lid)
    )
    return jsonify({"message": "Updated"})


@bp.post("/loyalty/<int:lid>/add-points")
def add_points(lid):
    d      = request.json or {}
    pts    = int(d.get("points", 0))
    reason = d.get("reason", "manual_adjustment")
    if pts <= 0:
        return jsonify({"error": "points must be > 0"}), 400

    card = query("SELECT * FROM loyalty_cards WHERE id=%s", (lid,), fetchone=True)
    if not card:
        return jsonify({"error": "Card not found"}), 404

    new_points = int(card["points"]) + pts
    new_tier   = _recalc_tier(new_points)
    execute("UPDATE loyalty_cards SET points=%s, tier=%s WHERE id=%s",
            (new_points, new_tier, lid))

    return jsonify({
        "message":       f"{pts} points added",
        "new_total":     new_points,
        "new_tier":      new_tier,
        "tier_upgraded": new_tier != card["tier"],
    })


@bp.post("/loyalty/<int:lid>/redeem")
def redeem_points(lid):
    d             = request.json or {}
    pts_to_redeem = int(d.get("points_to_redeem", 0))
    session_id    = d.get("session_id")
    if pts_to_redeem < 100:
        return jsonify({"error": "Minimum redemption is 100 points"}), 400

    card = query("SELECT * FROM loyalty_cards WHERE id=%s", (lid,), fetchone=True)
    if not card:
        return jsonify({"error": "Card not found"}), 404
    if card["status"] != "active":
        return jsonify({"error": "Card is not active"}), 409
    if int(card["points"]) < pts_to_redeem:
        return jsonify({"error": f"Insufficient points. Available: {card['points']}"}), 400

    discount   = round((pts_to_redeem / 100) * 10, 2)
    new_points = int(card["points"]) - pts_to_redeem
    new_tier   = _recalc_tier(new_points)

    execute("UPDATE loyalty_cards SET points=%s, tier=%s WHERE id=%s",
            (new_points, new_tier, lid))

    if session_id:
        sess = query("SELECT * FROM sessions WHERE id=%s", (session_id,), fetchone=True)
        if sess and not sess["exit_time"]:
            existing_disc = float(sess.get("loyalty_discount") or 0)
            # sessions table may not have loyalty_discount column — try, ignore if not
            try:
                execute("UPDATE sessions SET loyalty_discount=%s WHERE id=%s",
                        (existing_disc + discount, session_id))
            except Exception:
                pass

    return jsonify({
        "message":          f"Redeemed {pts_to_redeem} points for ₹{discount} discount",
        "points_redeemed":  pts_to_redeem,
        "discount_applied": discount,
        "remaining_points": new_points,
        "new_tier":         new_tier,
    })


# ── RATES ─────────────────────────────────────────────────────────────────
@bp.get("/rates")
def rates():
    return jsonify(query("SELECT * FROM rates ORDER BY vehicle_type, spot_type"))


@bp.post("/rates")
def create_rate():
    d = request.json or {}
    # Normalise enums to match DB schema
    vtype = d.get("vehicle_type", "car")
    stype = d.get("spot_type", "regular")
    if vtype == "bike":     vtype = "motorcycle"
    if stype == "standard": stype = "regular"
    execute("""
        INSERT INTO rates (vehicle_type, spot_type, rate_per_hr, min_charge, effective_from)
        VALUES (%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE rate_per_hr=%s, min_charge=%s
    """, (vtype, stype, d["rate_per_hr"], d.get("min_charge", 0),
          d.get("effective_from", datetime.date.today().isoformat()),
          d["rate_per_hr"], d.get("min_charge", 0)))
    return jsonify({"message": "Saved"}), 201


@bp.put("/rates/<int:rid>")
def update_rate(rid):
    d = request.json or {}
    execute(
        "UPDATE rates SET rate_per_hr=%s, min_charge=%s, effective_from=%s WHERE id=%s",
        (d["rate_per_hr"], d.get("min_charge", 0), d.get("effective_from"), rid)
    )
    return jsonify({"message": "Updated"})


@bp.delete("/rates/<int:rid>")
def delete_rate(rid):
    execute("DELETE FROM rates WHERE id=%s", (rid,))
    return jsonify({"message": "Deleted"})


# ── ANALYTICS ─────────────────────────────────────────────────────────────
@bp.get("/analytics/revenue")
def analytics_revenue():
    total_12m  = query("""SELECT IFNULL(SUM(amount_charged),0) AS total FROM sessions
        WHERE payment_status='paid' AND exit_time>=NOW()-INTERVAL 12 MONTH""")[0]["total"]
    last_month = query("""SELECT IFNULL(SUM(amount_charged),0) AS total FROM sessions
        WHERE payment_status='paid'
          AND MONTH(exit_time)=MONTH(NOW()-INTERVAL 1 MONTH)
          AND YEAR(exit_time)=YEAR(NOW()-INTERVAL 1 MONTH)""")[0]["total"]
    last_qtr   = query("""SELECT IFNULL(SUM(amount_charged),0) AS total FROM sessions
        WHERE payment_status='paid' AND exit_time>=NOW()-INTERVAL 3 MONTH""")[0]["total"]
    by_type    = query("""
        SELECT v.vehicle_type, ROUND(SUM(s.amount_charged),2) AS revenue, COUNT(*) AS sessions
        FROM sessions s JOIN vehicles v ON s.vehicle_id=v.id
        WHERE s.payment_status='paid' GROUP BY v.vehicle_type""")
    by_method  = query("""
        SELECT payment_method, COUNT(*) AS cnt, ROUND(SUM(amount_charged),2) AS revenue
        FROM sessions WHERE payment_status='paid' GROUP BY payment_method""")
    daily_7d   = query("""
        SELECT DATE(exit_time) AS date, ROUND(SUM(amount_charged),2) AS revenue, COUNT(*) AS sessions
        FROM sessions WHERE payment_status='paid' AND exit_time>=NOW()-INTERVAL 7 DAY
        GROUP BY DATE(exit_time) ORDER BY date""")
    return jsonify({
        "total_12m": float(total_12m), "last_month": float(last_month),
        "last_quarter": float(last_qtr), "by_vehicle_type": by_type,
        "by_payment_method": by_method, "daily_last_7_days": daily_7d,
    })


@bp.get("/analytics/occupancy-trend")
def occupancy_trend():
    rows = query("""
        SELECT DATE(entry_time) AS date, COUNT(*) AS entries,
               COUNT(DISTINCT vehicle_id) AS unique_vehicles
        FROM sessions WHERE entry_time>=NOW()-INTERVAL 30 DAY
        GROUP BY DATE(entry_time) ORDER BY date
    """)
    return jsonify(rows)


@bp.get("/analytics/loyalty-summary")
def loyalty_summary():
    tiers = query("""
        SELECT tier, COUNT(*) AS count, SUM(points) AS total_points
        FROM loyalty_cards WHERE status='active' GROUP BY tier
    """)
    return jsonify({"tier_distribution": tiers, "top_redeemers": []})
