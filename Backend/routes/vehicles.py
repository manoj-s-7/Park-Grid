from flask import Blueprint, jsonify, request
from db import query, execute

bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")


@bp.get("/")
def list_vehicles():
    search = request.args.get("q", "")
    limit  = int(request.args.get("limit", 50))
    rows = query("""
        SELECT v.id, v.plate_number, v.owner_name, v.vehicle_type, v.created_at,
               lc.card_number, lc.tier, lc.points, lc.status AS lc_status
        FROM vehicles v
        LEFT JOIN loyalty_cards lc ON lc.vehicle_id = v.id AND lc.status = 'active'
        WHERE v.plate_number LIKE %s OR v.owner_name LIKE %s
        ORDER BY v.created_at DESC
        LIMIT %s
    """, (f"%{search}%", f"%{search}%", limit))
    return jsonify(rows)


@bp.get("/<int:vid>")
def get_vehicle(vid):
    v = query("SELECT * FROM vehicles WHERE id=%s", (vid,), fetchone=True)
    if not v:
        return jsonify({"error": "Not found"}), 404
    sessions = query("""
        SELECT s.id, s.entry_time, s.exit_time, s.duration_mins,
               s.amount_charged, s.payment_status,
               ps.spot_number, pl.name AS lot
        FROM sessions s
        JOIN parking_spots ps ON s.spot_id = ps.id
        JOIN parking_lots pl  ON ps.lot_id = pl.id
        WHERE s.vehicle_id = %s
        ORDER BY s.entry_time DESC LIMIT 10
    """, (vid,))
    lc = query("SELECT * FROM loyalty_cards WHERE vehicle_id=%s AND status='active'",
               (vid,), fetchone=True)
    return jsonify({"vehicle": v, "sessions": sessions, "loyalty_card": lc})


@bp.post("/")
def create_vehicle():
    d = request.json or {}
    vtype = d.get("vehicle_type", "car")
    if vtype == "bike": vtype = "motorcycle"
    vid, _ = execute(
        "INSERT INTO vehicles (plate_number, owner_name, vehicle_type) VALUES (%s,%s,%s)",
        (d["plate_number"].upper().strip(), d.get("owner_name", ""), vtype)
    )
    return jsonify({"id": vid}), 201


@bp.put("/<int:vid>")
def update_vehicle(vid):
    d = request.json or {}
    vtype = d.get("vehicle_type")
    if vtype == "bike": vtype = "motorcycle"
    execute(
        "UPDATE vehicles SET owner_name=%s, vehicle_type=%s WHERE id=%s",
        (d.get("owner_name"), vtype, vid)
    )
    return jsonify({"message": "Updated"})
