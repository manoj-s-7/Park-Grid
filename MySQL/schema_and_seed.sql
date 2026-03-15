-- ============================================================
--  PARKING LOT MANAGEMENT SYSTEM — MySQL Schema + Seed Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS parking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parking_db;

-- ────────────────────────────────────────────────────────────
--  TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS parking_lots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    location    VARCHAR(255) NOT NULL,
    total_spots INT NOT NULL DEFAULT 50,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_spots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    lot_id      INT NOT NULL,
    spot_number VARCHAR(10) NOT NULL,
    spot_type   ENUM('regular','ev','handicap','vip') NOT NULL DEFAULT 'regular',
    status      ENUM('available','occupied','reserved','maintenance') NOT NULL DEFAULT 'available',
    floor       INT NOT NULL DEFAULT 1,
    FOREIGN KEY (lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE,
    UNIQUE KEY uq_spot (lot_id, spot_number)
);

CREATE TABLE IF NOT EXISTS vehicles (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    owner_name   VARCHAR(100),
    vehicle_type ENUM('car','motorcycle','truck','ev') NOT NULL DEFAULT 'car',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_cards (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    card_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_id  INT NOT NULL,
    points      INT NOT NULL DEFAULT 0,
    tier        ENUM('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
    status      ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
    issued_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ev_stations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    lot_id      INT NOT NULL,
    spot_id     INT NOT NULL,
    power_kw    DECIMAL(5,2) NOT NULL DEFAULT 7.40,
    status      ENUM('available','charging','offline','reserved') NOT NULL DEFAULT 'available',
    FOREIGN KEY (lot_id) REFERENCES parking_lots(id),
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    spot_id         INT NOT NULL,
    vehicle_id      INT NOT NULL,
    loyalty_card_id INT,
    entry_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time       DATETIME,
    duration_mins   INT,
    amount_charged  DECIMAL(10,2),
    payment_status  ENUM('pending','paid','waived') NOT NULL DEFAULT 'pending',
    payment_method  ENUM('cash','card','upi','loyalty') DEFAULT NULL,
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id)
);

CREATE TABLE IF NOT EXISTS rates (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type ENUM('car','motorcycle','truck','ev') NOT NULL,
    spot_type    ENUM('regular','ev','handicap','vip') NOT NULL,
    rate_per_hr  DECIMAL(8,2) NOT NULL,
    min_charge   DECIMAL(8,2) NOT NULL DEFAULT 0,
    effective_from DATE NOT NULL,
    UNIQUE KEY uq_rate (vehicle_type, spot_type, effective_from)
);

CREATE TABLE IF NOT EXISTS staff (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role         ENUM('admin','operator','attendant') NOT NULL DEFAULT 'attendant',
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    staff_id   INT,
    action     VARCHAR(100) NOT NULL,
    entity     VARCHAR(50),
    entity_id  INT,
    notes      TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- ────────────────────────────────────────────────────────────
--  VIEWS (convenient aggregations)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_lot_occupancy AS
SELECT
    pl.id   AS lot_id,
    pl.name AS lot_name,
    pl.total_spots,
    SUM(CASE WHEN ps.status = 'occupied'  THEN 1 ELSE 0 END) AS occupied,
    SUM(CASE WHEN ps.status = 'available' THEN 1 ELSE 0 END) AS available,
    SUM(CASE WHEN ps.status = 'reserved'  THEN 1 ELSE 0 END) AS reserved,
    ROUND(SUM(CASE WHEN ps.status = 'occupied' THEN 1 ELSE 0 END) / pl.total_spots * 100, 1) AS occupancy_pct
FROM parking_lots pl
JOIN parking_spots ps ON ps.lot_id = pl.id
GROUP BY pl.id, pl.name, pl.total_spots;

CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT
    DATE(exit_time)                         AS date,
    COUNT(*)                                AS sessions,
    SUM(amount_charged)                     AS revenue,
    AVG(duration_mins)                      AS avg_duration_mins
FROM sessions
WHERE payment_status = 'paid'
GROUP BY DATE(exit_time);

CREATE OR REPLACE VIEW v_active_sessions AS
SELECT
    s.id,
    ps.spot_number,
    pl.name AS lot_name,
    v.plate_number,
    v.owner_name,
    v.vehicle_type,
    s.entry_time,
    TIMESTAMPDIFF(MINUTE, s.entry_time, NOW()) AS elapsed_mins,
    lc.card_number,
    lc.tier
FROM sessions s
JOIN parking_spots ps ON s.spot_id = ps.id
JOIN parking_lots pl  ON ps.lot_id = pl.id
JOIN vehicles v       ON s.vehicle_id = v.id
LEFT JOIN loyalty_cards lc ON s.loyalty_card_id = lc.id
WHERE s.exit_time IS NULL;

-- ────────────────────────────────────────────────────────────
--  SEED DATA
-- ────────────────────────────────────────────────────────────

-- Parking Lots
INSERT INTO parking_lots (name, location, total_spots) VALUES
('Main Plaza Parking',    'Sector 12, MG Road',       50),
('West Wing Annex',       'West Zone, Station Road',  30),
('Airport Terminal Lot',  'Terminal 2, Airport Road', 80);

-- Parking Spots (Lot 1: 50 spots — 4 rows × ~12 + EV + VIP)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
-- Row 1 (regular)
(1,'A-01','regular','occupied',1),(1,'A-02','regular','available',1),(1,'A-03','regular','occupied',1),
(1,'A-04','regular','available',1),(1,'A-05','regular','occupied',1),(1,'A-06','regular','available',1),
(1,'A-07','regular','occupied',1),(1,'A-08','regular','available',1),(1,'A-09','regular','occupied',1),
(1,'A-10','regular','available',1),(1,'A-11','regular','available',1),(1,'A-12','regular','occupied',1),
-- Row 2
(1,'B-01','regular','available',1),(1,'B-02','regular','occupied',1),(1,'B-03','regular','available',1),
(1,'B-04','regular','occupied',1),(1,'B-05','regular','available',1),(1,'B-06','regular','occupied',1),
(1,'B-07','regular','available',1),(1,'B-08','regular','occupied',1),(1,'B-09','regular','available',1),
(1,'B-10','regular','occupied',1),(1,'B-11','regular','available',1),(1,'B-12','regular','available',1),
-- Row 3 (handicap)
(1,'C-01','handicap','available',1),(1,'C-02','handicap','occupied',1),(1,'C-03','handicap','available',1),
(1,'C-04','handicap','maintenance',1),
-- Row 4 (VIP)
(1,'D-01','vip','occupied',1),(1,'D-02','vip','available',1),(1,'D-03','vip','reserved',1),(1,'D-04','vip','available',1),
-- EV Spots (status uses: available/occupied/reserved/maintenance — charging state is on ev_stations table)
(1,'EV-01','ev','occupied',1),(1,'EV-02','ev','available',1),(1,'EV-03','ev','occupied',1),
(1,'EV-04','ev','occupied',1),(1,'EV-05','ev','available',1),(1,'EV-06','ev','occupied',1),
(1,'EV-07','ev','available',1),(1,'EV-08','ev','available',1),(1,'EV-09','ev','occupied',1),
-- Floor 2 regular
(1,'F2-A01','regular','available',2),(1,'F2-A02','regular','occupied',2),(1,'F2-A03','regular','available',2),
(1,'F2-A04','regular','occupied',2),(1,'F2-A05','regular','available',2),(1,'F2-A06','regular','occupied',2),
(1,'F2-A07','regular','available',2),(1,'F2-A08','regular','occupied',2),(1,'F2-A09','regular','available',2);

-- Lot 2 spots
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(2,'A-01','regular','occupied',1),(2,'A-02','regular','available',1),(2,'A-03','regular','occupied',1),
(2,'A-04','ev','available',1),(2,'A-05','ev','occupied',1),(2,'B-01','regular','available',1),
(2,'B-02','regular','occupied',1),(2,'B-03','vip','available',1),(2,'B-04','vip','occupied',1),
(2,'B-05','handicap','available',1);

-- Vehicles
INSERT INTO vehicles (plate_number, owner_name, vehicle_type) VALUES
('MH 27 CA 2305','Pawan Kumar Jain','car'),
('MH 41 WD 7689','Nikunj Kelkar','car'),
('MH 02 DA 4475','Yashwant Kumar','car'),
('KA 01 MN 3344','Priya Sharma','ev'),
('KA 05 AB 9900','Rahul Mehta','car'),
('DL 3C AV 4501','Ananya Singh','motorcycle'),
('MH 12 BZ 0021','Vikram Patel','truck'),
('KA 19 GH 5577','Sonal Gupta','ev'),
('TN 09 CD 1234','Arun Krishnan','car'),
('MH 43 XY 8899','Deepika Rao','car'),
('GJ 01 AA 0011','Amit Shah','car'),
('RJ 14 BC 2222','Sunita Joshi','motorcycle');

-- Loyalty Cards
INSERT INTO loyalty_cards (card_number, vehicle_id, points, tier, status) VALUES
('LC-2024-00001',1,1250,'gold','active'),
('LC-2024-00002',2,450,'silver','active'),
('LC-2024-00003',3,90,'bronze','active'),
('LC-2024-00004',4,3200,'platinum','active'),
('LC-2024-00005',5,780,'silver','active'),
('LC-2024-00006',6,120,'bronze','active');

-- EV Stations
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status) VALUES
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-01'), 7.40, 'charging'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-02'), 22.00, 'available'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-03'), 7.40, 'charging'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-04'), 50.00, 'charging'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-05'), 7.40, 'available'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-06'), 22.00, 'charging'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-07'), 7.40, 'available'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-08'), 7.40, 'available'),
(1, (SELECT id FROM parking_spots WHERE lot_id=1 AND spot_number='EV-09'), 50.00, 'charging');

-- Rates
INSERT INTO rates (vehicle_type, spot_type, rate_per_hr, min_charge, effective_from) VALUES
('car',        'regular',  40.00,  40.00, '2024-01-01'),
('car',        'vip',      100.00, 100.00,'2024-01-01'),
('car',        'handicap', 20.00,  20.00, '2024-01-01'),
('car',        'ev',       60.00,  60.00, '2024-01-01'),
('motorcycle', 'regular',  20.00,  20.00, '2024-01-01'),
('motorcycle', 'vip',      50.00,  50.00, '2024-01-01'),
('truck',      'regular',  80.00,  80.00, '2024-01-01'),
('ev',         'ev',       50.00,  50.00, '2024-01-01'),
('ev',         'regular',  40.00,  40.00, '2024-01-01');

-- Staff
INSERT INTO staff (name, email, password_hash, role) VALUES
('Admin User',      'admin@parking.local',    '$2b$12$xyzABChashplaceholder001', 'admin'),
('Operator One',    'op1@parking.local',      '$2b$12$xyzABChashplaceholder002', 'operator'),
('Gate Attendant',  'gate1@parking.local',    '$2b$12$xyzABChashplaceholder003', 'attendant');

-- Sessions (historical — closed)
-- Using subqueries to resolve spot IDs by spot_number so inserts are ID-independent
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 1, 1, NOW()-INTERVAL 5 HOUR, NOW()-INTERVAL 3 HOUR, 120, 80.00, 'paid','card'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='A-01';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 2, 2, NOW()-INTERVAL 8 HOUR, NOW()-INTERVAL 6 HOUR, 120, 80.00, 'paid','upi'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='A-03';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 3, 3, NOW()-INTERVAL 6 HOUR, NOW()-INTERVAL 4 HOUR, 120, 80.00, 'paid','cash'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='A-05';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 4, 4, NOW()-INTERVAL 3 HOUR, NOW()-INTERVAL 1 HOUR, 120, 120.00,'paid','loyalty'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='D-01';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 5, 5, NOW()-INTERVAL 2 HOUR, NOW()-INTERVAL 30 MINUTE, 90, 60.00,'paid','card'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='EV-01';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 6, 6, NOW()-INTERVAL 10 HOUR,NOW()-INTERVAL 8 HOUR, 120, 40.00,'paid','cash'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='C-01';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 7, NULL,NOW()-INTERVAL 4 HOUR, NOW()-INTERVAL 2 HOUR, 120,160.00,'paid','card'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='B-02';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 8, NULL,NOW()-INTERVAL 7 HOUR, NOW()-INTERVAL 5 HOUR, 120,100.00,'paid','upi'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='B-04';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id, 9, NULL,NOW()-INTERVAL 9 HOUR, NOW()-INTERVAL 7 HOUR, 120, 80.00,'paid','card'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='B-06';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time, exit_time, duration_mins, amount_charged, payment_status, payment_method)
SELECT s.id,10, NULL,NOW()-INTERVAL 1 HOUR, NOW()-INTERVAL 30 MINUTE, 30, 40.00,'paid','cash'
  FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='B-08';

-- Active sessions (no exit_time) — vehicles currently inside
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time)
SELECT s.id, 1, 1, NOW()-INTERVAL 2 HOUR FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='A-07';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time)
SELECT s.id, 2, 2, NOW()-INTERVAL 1 HOUR FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='A-09';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time)
SELECT s.id, 4, 4, NOW()-INTERVAL 45 MINUTE FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='EV-03';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time)
SELECT s.id, 5, 5, NOW()-INTERVAL 3 HOUR FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='EV-06';
INSERT INTO sessions (spot_id, vehicle_id, loyalty_card_id, entry_time)
SELECT s.id, 8, NULL, NOW()-INTERVAL 90 MINUTE FROM parking_spots s WHERE s.lot_id=1 AND s.spot_number='B-10';

-- Audit log samples
INSERT INTO audit_log (staff_id, action, entity, notes) VALUES
(1, 'vehicle_entry',   'sessions',      'Vehicle MH 27 CA 2305 entered A-01'),
(2, 'vehicle_exit',    'sessions',      'Vehicle exited, charged ₹80'),
(1, 'spot_maintenance','parking_spots', 'C-04 marked for maintenance'),
(2, 'loyalty_issued',  'loyalty_cards', 'New gold card issued'),
(3, 'vehicle_entry',   'sessions',      'EV vehicle entered EV-01');

-- ────────────────────────────────────────────────────────────
--  STORED PROCEDURES
-- ────────────────────────────────────────────────────────────

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_checkout_session(
    IN  p_session_id INT,
    IN  p_payment_method VARCHAR(20),
    OUT p_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_entry    DATETIME;
    DECLARE v_spot_id  INT;
    DECLARE v_veh_id   INT;
    DECLARE v_lc_id    INT;
    DECLARE v_rate     DECIMAL(8,2);
    DECLARE v_mins     INT;
    DECLARE v_vtype    VARCHAR(20);
    DECLARE v_stype    VARCHAR(20);

    SELECT entry_time, spot_id, vehicle_id, loyalty_card_id
      INTO v_entry, v_spot_id, v_veh_id, v_lc_id
      FROM sessions WHERE id = p_session_id;

    SELECT v.vehicle_type, ps.spot_type INTO v_vtype, v_stype
      FROM vehicles v JOIN parking_spots ps ON ps.id = v_spot_id
      WHERE v.id = v_veh_id;

    SELECT rate_per_hr INTO v_rate FROM rates
      WHERE vehicle_type = v_vtype AND spot_type = v_stype
      ORDER BY effective_from DESC LIMIT 1;

    SET v_mins = TIMESTAMPDIFF(MINUTE, v_entry, NOW());
    SET p_amount = GREATEST(v_rate, CEIL(v_mins / 60.0) * v_rate);

    UPDATE sessions
       SET exit_time      = NOW(),
           duration_mins  = v_mins,
           amount_charged = p_amount,
           payment_status = 'paid',
           payment_method = p_payment_method
     WHERE id = p_session_id;

    UPDATE parking_spots SET status = 'available' WHERE id = v_spot_id;

    IF v_lc_id IS NOT NULL THEN
        UPDATE loyalty_cards
           SET points = points + FLOOR(p_amount / 10)
         WHERE id = v_lc_id;
    END IF;
END$$

DELIMITER ;

SELECT 'Database setup complete!' AS status;
