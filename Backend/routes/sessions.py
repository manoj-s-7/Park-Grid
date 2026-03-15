from flask import Blueprint, jsonify, request
from db import query, execute
import math, datetime

bp = Blueprint("sessions", __name__, url_prefix="/api/sessions")


@bp.get("/")
def list_sessions():
    status = request.args.get("status", "all")
    limit  = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    plate  = request.args.get("plate", "")

    wheres, params = [], []
    if status == "active":
        wheres.append("s.exit_time IS NULL")
        wheres.append("s.payment_status='pending'")
    elif status == "closed":
        wheres.append("s.exit_time IS NOT NULL")
        wheres.append("s.payment_status='paid'")
    elif status == "cancelled" or status == "waived":
        wheres.append("s.payment_status='waived'")

    if plate:
        wheres.append("v.plate_number LIKE %s")
        params.append(f"%{plate}%")

    where = ("WHERE " + " AND ".join(wheres)) if wheres else ""

    rows = query(f"""
        SELECT s.id,
               ps.spot_number, ps.spot_type, ps.floor,
               pl.name AS lot_name,
               v.plate_number, v.owner_name, v.vehicle_type,
               s.entry_time, s.exit_time, s.duration_mins,
               s.amount_charged, s.payment_status, s.payment_method,
               IFNULL(s.loyalty_card_id, NULL) AS loyalty_card_id,
               lc.card_number, lc.tier, lc.points,
               TIMESTAMPDIFF(MINUTE, s.entry_time, IFNULL(s.exit_time, NOW())) AS elapsed_mins
        FROM sessions s
        JOIN parking_spots ps ON s.spot_id  = ps.id
        JOIN parking_lots pl  ON ps.lot_id  = pl.id
        JOIN vehicles v       ON s.vehicle_id = v.id
        LEFT JOIN loyalty_cards lc ON s.loyalty_card_id = lc.id
        {where}
        ORDER BY s.entry_time DESC
        LIMIT %s OFFSET %s
    """, params + [limit, offset])
    return jsonify(rows)


@bp.post("/entry")
def vehicle_entry():
    data    = request.json or {}
    plate   = data.get("plate_number", "").upper().strip()
    spot_id = data.get("spot_id")
    vtype   = data.get("vehicle_type", "car")
    owner   = data.get("owner_name", "")
    lc_id   = data.get("loyalty_card_id")

    # Normalise vehicle_type to match DB ENUM: car, motorcycle, truck, ev
    vtype_map = {"bike": "motorcycle", "motorbike": "motorcycle"}
    vtype = vtype_map.get(vtype, vtype)

    if not plate or not spot_id:
        return jsonify({"error": "plate_number and spot_id required"}), 400

    spot = query("SELECT * FROM parking_spots WHERE id=%s", (spot_id,), fetchone=True)
    if not spot:
        return jsonify({"error": "Spot not found"}), 404
    if spot["status"] == "occupied":
        return jsonify({"error": "Spot is already occupied"}), 409
    if spot["status"] == "maintenance":
        return jsonify({"error": "Spot is under maintenance"}), 409

    # Upsert vehicle
    existing = query("SELECT id FROM vehicles WHERE plate_number=%s", (plate,), fetchone=True)
    if existing:
        veh_id = existing["id"]
        if owner:
            execute("UPDATE vehicles SET owner_name=%s WHERE id=%s", (owner, veh_id))
    else:
        veh_id, _ = execute(
            "INSERT INTO vehicles (plate_number, owner_name, vehicle_type) VALUES (%s,%s,%s)",
            (plate, owner, vtype)
        )

    # Auto-link loyalty card
    if not lc_id:
        lc = query(
            "SELECT id FROM loyalty_cards WHERE vehicle_id=%s AND status='active' LIMIT 1",
            (veh_id,), fetchone=True
        )
        if lc:
            lc_id = lc["id"]

    # Close any dangling open session on this spot
    execute("""
        UPDATE sessions SET exit_time=NOW(), duration_mins=0,
            amount_charged=0, payment_status='waived'
        WHERE spot_id=%s AND exit_time IS NULL
    """, (spot_id,))

    execute("UPDATE parking_spots SET status='occupied' WHERE id=%s", (spot_id,))

    sid, _ = execute(
        "INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id) VALUES (%s,%s,%s)",
        (spot_id, veh_id, lc_id)
    )

    return jsonify({
        "session_id":      sid,
        "vehicle_id":      veh_id,
        "loyalty_card_id": lc_id,
        "message":         "Entry recorded",
    }), 201


@bp.post("/<int:session_id>/checkout")
def checkout(session_id):
    data          = request.json or {}
    method        = data.get("payment_method", "cash")
    apply_loyalty = data.get("apply_loyalty_discount", False)

    # Validate payment_method against DB ENUM: cash, card, upi, loyalty
    valid_methods = {"cash", "card", "upi", "loyalty"}
    if method not in valid_methods:
        method = "cash"

    sess = query("""
        SELECT s.*, ps.spot_type, v.vehicle_type
        FROM sessions s
        JOIN parking_spots ps ON ps.id = s.spot_id
        JOIN vehicles v ON v.id = s.vehicle_id
        WHERE s.id=%s
    """, (session_id,), fetchone=True)
    if not sess:
        return jsonify({"error": "Session not found"}), 404
    if sess["exit_time"]:
        return jsonify({"error": "Session already closed"}), 400
    if sess["payment_status"] == "waived":
        return jsonify({"error": "Session was cancelled"}), 400

    # Rate lookup
    rate_row = query("""
        SELECT rate_per_hr, min_charge FROM rates
        WHERE vehicle_type=%s AND spot_type=%s
        ORDER BY effective_from DESC LIMIT 1
    """, (sess["vehicle_type"], sess["spot_type"]), fetchone=True)

    if not rate_row:
        # Fallback: any rate for vehicle_type
        rate_row = query("""
            SELECT rate_per_hr, min_charge FROM rates
            WHERE vehicle_type=%s
            ORDER BY effective_from DESC LIMIT 1
        """, (sess["vehicle_type"],), fetchone=True)

    rate       = float(rate_row["rate_per_hr"]) if rate_row else 40.0
    min_charge = float(rate_row["min_charge"])  if rate_row else 40.0

    entry = sess["entry_time"]
    if isinstance(entry, str):
        entry = datetime.datetime.fromisoformat(entry)
    mins   = max(1, int((datetime.datetime.now() - entry).total_seconds() / 60))
    hrs    = math.ceil(mins / 60)
    amount = max(min_charge, hrs * rate)

    # Pre-applied discount (from redeem endpoint touching sessions table)
    discount = 0.0
    try:
        discount = float(sess.get("loyalty_discount") or 0)
    except Exception:
        discount = 0.0

    # Auto-apply loyalty discount if requested
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

    execute("""
        UPDATE sessions
        SET exit_time=NOW(), duration_mins=%s, amount_charged=%s,
            payment_status='paid', payment_method=%s
        WHERE id=%s
    """, (mins, final_amount, method, session_id))

    execute("UPDATE parking_spots SET status='available' WHERE id=%s", (sess["spot_id"],))

    # Award loyalty points
    pts_earned = 0
    if sess.get("loyalty_card_id") and final_amount > 0:
        pts_earned = int(final_amount // 10)
        if pts_earned > 0:
            card = query("SELECT * FROM loyalty_cards WHERE id=%s",
                         (sess["loyalty_card_id"],), fetchone=True)
            if card:
                from routes.parking import _recalc_tier
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
        "message":          "Checkout successful",
    })


@bp.get("/<int:session_id>")
def get_session(session_id):
    row = query("""
        SELECT s.*,
               TIMESTAMPDIFF(MINUTE, s.entry_time, IFNULL(s.exit_time, NOW())) AS elapsed_mins,
               v.plate_number, v.owner_name, v.vehicle_type,
               ps.spot_number, ps.spot_type, pl.name AS lot_name,
               lc.card_number, lc.tier, lc.points
        FROM sessions s
        JOIN vehicles v       ON s.vehicle_id = v.id
        JOIN parking_spots ps ON s.spot_id    = ps.id
        JOIN parking_lots pl  ON ps.lot_id    = pl.id
        LEFT JOIN loyalty_cards lc ON s.loyalty_card_id = lc.id
        WHERE s.id=%s
    """, (session_id,), fetchone=True)
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row)


@bp.post("/<int:session_id>/cancel")
def cancel_session(session_id):
    sess = query("SELECT * FROM sessions WHERE id=%s", (session_id,), fetchone=True)
    if not sess:
        return jsonify({"error": "Session not found"}), 404
    if sess["exit_time"]:
        return jsonify({"error": "Session already closed"}), 400

    execute("""
        UPDATE sessions
        SET exit_time=NOW(), duration_mins=0, amount_charged=0,
            payment_status='waived', payment_method=NULL
        WHERE id=%s
    """, (session_id,))
    execute("UPDATE parking_spots SET status='available' WHERE id=%s", (sess["spot_id"],))
    return jsonify({"message": "Session cancelled"})
