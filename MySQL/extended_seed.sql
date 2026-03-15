-- ============================================================
--  PARKGRID — Extended Seed Data (Run AFTER schema_and_seed.sql)
--  Adds: more lots, many more spots, 30+ vehicles, 50+ sessions,
--  loyalty cards, EV stations, rates, audit log entries
-- ============================================================

USE parking_db;

-- ────────────────────────────────────────────────────────────
--  EXTRA PARKING LOTS
-- ────────────────────────────────────────────────────────────
INSERT INTO parking_lots (name, location, total_spots) VALUES
('East Block Parking',    'East Wing, IT Park Road',      60),
('South Gate Annex',      'Gate 4, Industrial Area',      40),
('Tech Hub Basement',     'B1 Level, Tech Park, Whitefield', 80),
('North Plaza Open Lot',  'Open Area, MG Road Ext.',      35),
('Stadium Overflow',      'Near Gate 2, Sports Complex',  50),
('Skyview Terrace Park',  'Rooftop Level 3, City Centre', 20);

-- ────────────────────────────────────────────────────────────
--  SPOTS FOR NEW LOTS (lot_id = 4 through 9)
-- ────────────────────────────────────────────────────────────

-- Lot 4: East Block (60 spots, 2 floors)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(4,'A-01','regular','occupied',1),(4,'A-02','regular','available',1),(4,'A-03','regular','occupied',1),
(4,'A-04','regular','available',1),(4,'A-05','regular','occupied',1),(4,'A-06','regular','available',1),
(4,'A-07','regular','occupied',1),(4,'A-08','regular','available',1),(4,'A-09','regular','occupied',1),
(4,'A-10','regular','available',1),(4,'A-11','regular','occupied',1),(4,'A-12','regular','occupied',1),
(4,'B-01','regular','available',1),(4,'B-02','regular','occupied',1),(4,'B-03','regular','available',1),
(4,'B-04','regular','occupied',1),(4,'B-05','regular','available',1),(4,'B-06','regular','occupied',1),
(4,'B-07','ev','available',1),     (4,'B-08','ev','occupied',1),     (4,'B-09','ev','available',1),
(4,'B-10','ev','occupied',1),      (4,'B-11','vip','available',1),   (4,'B-12','vip','occupied',1),
(4,'C-01','handicap','available',1),(4,'C-02','handicap','available',1),
(4,'F2-A01','regular','occupied',2),(4,'F2-A02','regular','available',2),(4,'F2-A03','regular','occupied',2),
(4,'F2-A04','regular','available',2),(4,'F2-A05','regular','occupied',2),(4,'F2-A06','regular','available',2),
(4,'F2-A07','regular','occupied',2),(4,'F2-A08','regular','available',2),(4,'F2-A09','regular','occupied',2),
(4,'F2-A10','regular','available',2),(4,'F2-B01','regular','occupied',2),(4,'F2-B02','regular','available',2),
(4,'F2-B03','ev','charging',2),    (4,'F2-B04','ev','available',2),
(4,'F2-B05','regular','occupied',2),(4,'F2-B06','regular','available',2),(4,'F2-B07','regular','occupied',2),
(4,'F2-B08','regular','available',2),(4,'F2-B09','regular','occupied',2),(4,'F2-B10','regular','available',2),
(4,'F2-C01','vip','occupied',2),   (4,'F2-C02','vip','available',2),
(4,'F2-D01','regular','occupied',2),(4,'F2-D02','regular','available',2),(4,'F2-D03','regular','occupied',2),
(4,'F2-D04','regular','available',2),(4,'F2-D05','regular','occupied',2),(4,'F2-D06','regular','available',2),
(4,'F2-D07','regular','occupied',2),(4,'F2-D08','regular','available',2);

-- Lot 5: South Gate (40 spots)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(5,'A-01','regular','occupied',1),(5,'A-02','regular','occupied',1),(5,'A-03','regular','available',1),
(5,'A-04','regular','available',1),(5,'A-05','regular','occupied',1),(5,'A-06','regular','available',1),
(5,'A-07','regular','occupied',1),(5,'A-08','regular','available',1),(5,'A-09','regular','occupied',1),
(5,'A-10','regular','available',1),(5,'B-01','ev','available',1),(5,'B-02','ev','occupied',1),
(5,'B-03','ev','available',1),(5,'B-04','vip','occupied',1),(5,'B-05','vip','available',1),
(5,'B-06','handicap','available',1),(5,'C-01','regular','occupied',1),(5,'C-02','regular','available',1),
(5,'C-03','regular','occupied',1),(5,'C-04','regular','available',1),(5,'C-05','regular','occupied',1),
(5,'C-06','regular','available',1),(5,'C-07','regular','occupied',1),(5,'C-08','regular','available',1),
(5,'D-01','regular','occupied',1),(5,'D-02','regular','available',1),(5,'D-03','regular','occupied',1),
(5,'D-04','regular','available',1),(5,'D-05','regular','occupied',1),(5,'D-06','regular','available',1),
(5,'D-07','regular','occupied',1),(5,'D-08','regular','available',1),(5,'D-09','regular','occupied',1),
(5,'D-10','regular','available',1),(5,'E-01','regular','occupied',1),(5,'E-02','regular','available',1),
(5,'E-03','regular','occupied',1),(5,'E-04','regular','available',1),(5,'E-05','regular','occupied',1),
(5,'E-06','regular','reserved',1);

-- Lot 6: Tech Hub Basement (80 spots, 2 floors)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(6,'A-01','regular','occupied',1),(6,'A-02','regular','available',1),(6,'A-03','regular','occupied',1),
(6,'A-04','regular','available',1),(6,'A-05','regular','occupied',1),(6,'A-06','regular','available',1),
(6,'A-07','regular','occupied',1),(6,'A-08','regular','available',1),(6,'A-09','regular','occupied',1),
(6,'A-10','regular','available',1),(6,'A-11','regular','occupied',1),(6,'A-12','regular','available',1),
(6,'B-01','regular','occupied',1),(6,'B-02','regular','available',1),(6,'B-03','regular','occupied',1),
(6,'B-04','regular','available',1),(6,'B-05','regular','occupied',1),(6,'B-06','regular','available',1),
(6,'B-07','ev','available',1),(6,'B-08','ev','occupied',1),(6,'B-09','ev','occupied',1),
(6,'B-10','ev','available',1),(6,'B-11','ev','occupied',1),(6,'B-12','ev','available',1),
(6,'C-01','vip','occupied',1),(6,'C-02','vip','available',1),(6,'C-03','vip','occupied',1),
(6,'C-04','vip','available',1),(6,'C-05','handicap','available',1),(6,'C-06','handicap','available',1),
(6,'F2-A01','regular','occupied',2),(6,'F2-A02','regular','available',2),(6,'F2-A03','regular','occupied',2),
(6,'F2-A04','regular','available',2),(6,'F2-A05','regular','occupied',2),(6,'F2-A06','regular','available',2),
(6,'F2-A07','regular','occupied',2),(6,'F2-A08','regular','available',2),(6,'F2-A09','regular','occupied',2),
(6,'F2-A10','regular','available',2),(6,'F2-A11','regular','occupied',2),(6,'F2-A12','regular','available',2),
(6,'F2-B01','regular','occupied',2),(6,'F2-B02','regular','available',2),(6,'F2-B03','regular','occupied',2),
(6,'F2-B04','regular','available',2),(6,'F2-B05','regular','occupied',2),(6,'F2-B06','regular','available',2),
(6,'F2-B07','ev','available',2),(6,'F2-B08','ev','occupied',2),(6,'F2-B09','ev','occupied',2),
(6,'F2-B10','ev','available',2),(6,'F2-C01','vip','reserved',2),(6,'F2-C02','vip','available',2),
(6,'F2-C03','regular','occupied',2),(6,'F2-C04','regular','available',2),(6,'F2-C05','regular','occupied',2),
(6,'F2-C06','regular','available',2),(6,'F2-C07','regular','occupied',2),(6,'F2-C08','regular','available',2),
(6,'F2-D01','regular','occupied',2),(6,'F2-D02','regular','available',2),(6,'F2-D03','regular','occupied',2),
(6,'F2-D04','regular','available',2),(6,'F2-D05','regular','occupied',2),(6,'F2-D06','regular','available',2),
(6,'F2-D07','regular','occupied',2),(6,'F2-D08','regular','available',2),(6,'F2-D09','regular','occupied',2),
(6,'F2-D10','regular','available',2),(6,'F2-E01','handicap','available',2),(6,'F2-E02','handicap','available',2);

-- Lot 7: North Plaza (35 spots)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(7,'A-01','regular','available',1),(7,'A-02','regular','available',1),(7,'A-03','regular','available',1),
(7,'A-04','regular','available',1),(7,'A-05','regular','available',1),(7,'A-06','regular','occupied',1),
(7,'A-07','regular','available',1),(7,'A-08','regular','available',1),(7,'A-09','regular','available',1),
(7,'A-10','regular','available',1),(7,'B-01','regular','available',1),(7,'B-02','regular','occupied',1),
(7,'B-03','regular','available',1),(7,'B-04','ev','available',1),(7,'B-05','ev','occupied',1),
(7,'B-06','vip','available',1),(7,'B-07','vip','available',1),(7,'B-08','handicap','available',1),
(7,'C-01','regular','available',1),(7,'C-02','regular','available',1),(7,'C-03','regular','available',1),
(7,'C-04','regular','available',1),(7,'C-05','regular','available',1),(7,'C-06','regular','available',1),
(7,'C-07','regular','available',1),(7,'C-08','regular','available',1),(7,'C-09','regular','available',1),
(7,'C-10','regular','available',1),(7,'D-01','regular','available',1),(7,'D-02','regular','available',1),
(7,'D-03','regular','available',1),(7,'D-04','regular','available',1),(7,'D-05','regular','available',1),
(7,'D-06','regular','occupied',1),(7,'D-07','regular','available',1);

-- Lot 8: Stadium Overflow (50 spots)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(8,'A-01','regular','reserved',1),(8,'A-02','regular','reserved',1),(8,'A-03','regular','reserved',1),
(8,'A-04','regular','reserved',1),(8,'A-05','regular','available',1),(8,'A-06','regular','available',1),
(8,'A-07','regular','available',1),(8,'A-08','regular','available',1),(8,'A-09','regular','available',1),
(8,'A-10','regular','available',1),(8,'B-01','regular','occupied',1),(8,'B-02','regular','occupied',1),
(8,'B-03','regular','occupied',1),(8,'B-04','regular','occupied',1),(8,'B-05','regular','occupied',1),
(8,'B-06','regular','occupied',1),(8,'B-07','regular','available',1),(8,'B-08','regular','available',1),
(8,'B-09','regular','available',1),(8,'B-10','regular','available',1),(8,'C-01','ev','occupied',1),
(8,'C-02','ev','available',1),(8,'C-03','ev','occupied',1),(8,'C-04','ev','available',1),
(8,'C-05','vip','occupied',1),(8,'C-06','vip','available',1),(8,'D-01','handicap','available',1),
(8,'D-02','handicap','available',1),(8,'D-03','regular','occupied',1),(8,'D-04','regular','available',1),
(8,'D-05','regular','occupied',1),(8,'D-06','regular','available',1),(8,'D-07','regular','occupied',1),
(8,'D-08','regular','available',1),(8,'D-09','regular','occupied',1),(8,'D-10','regular','available',1),
(8,'E-01','regular','occupied',1),(8,'E-02','regular','available',1),(8,'E-03','regular','occupied',1),
(8,'E-04','regular','available',1),(8,'E-05','regular','occupied',1),(8,'E-06','regular','available',1),
(8,'E-07','regular','occupied',1),(8,'E-08','regular','available',1),(8,'E-09','regular','occupied',1),
(8,'E-10','regular','available',1),(8,'F-01','regular','occupied',1),(8,'F-02','regular','available',1),
(8,'F-03','regular','occupied',1),(8,'F-04','regular','available',1);

-- Lot 9: Skyview Terrace (20 spots)
INSERT INTO parking_spots (lot_id, spot_number, spot_type, status, floor) VALUES
(9,'A-01','vip','occupied',3),(9,'A-02','vip','available',3),(9,'A-03','vip','occupied',3),
(9,'A-04','vip','available',3),(9,'A-05','vip','occupied',3),(9,'A-06','vip','available',3),
(9,'B-01','regular','occupied',3),(9,'B-02','regular','available',3),(9,'B-03','regular','occupied',3),
(9,'B-04','regular','available',3),(9,'B-05','regular','occupied',3),(9,'B-06','regular','available',3),
(9,'C-01','ev','occupied',3),(9,'C-02','ev','available',3),(9,'C-03','ev','occupied',3),
(9,'C-04','ev','available',3),(9,'D-01','handicap','available',3),(9,'D-02','handicap','available',3),
(9,'E-01','regular','available',3),(9,'E-02','regular','available',3);

-- ────────────────────────────────────────────────────────────
--  MORE VEHICLES
-- ────────────────────────────────────────────────────────────
INSERT INTO vehicles (plate_number, owner_name, vehicle_type) VALUES
('KA 03 MH 1122', 'Suresh Reddy',       'car'),
('MH 14 RT 4567', 'Kavitha Nair',        'ev'),
('TN 22 GH 8899', 'Balaji Subramanian',  'car'),
('AP 28 KL 3311', 'Lakshmi Devi',        'motorcycle'),
('KA 51 AB 2200', 'Rohit Verma',         'car'),
('MH 06 YZ 9988', 'Smita Patil',         'car'),
('DL 8C TT 5544', 'Harish Chandran',     'truck'),
('KA 20 QP 7766', 'Nandita Krishnan',    'ev'),
('MH 47 NN 3399', 'Sachin Tendulkar',    'car'),
('GJ 18 ZZ 1100', 'Dhruv Malhotra',      'car'),
('RJ 07 BM 6655', 'Pooja Agarwal',       'motorcycle'),
('KA 11 PQ 4422', 'Venkat Ramaiah',      'car'),
('TN 45 CD 7733', 'Anbu Selvan',         'car'),
('MH 23 EF 5566', 'Rekha Joshi',         'ev'),
('AP 16 GH 8811', 'Chandra Sekhar',      'car'),
('KA 07 JK 2233', 'Leela Prasad',        'motorcycle'),
('DL 5C AB 9977', 'Rajendra Singh',      'truck'),
('MH 34 LM 3344', 'Sundar Pichai',       'car'),
('GJ 09 NP 7788', 'Ritu Sharma',         'car'),
('KA 44 RS 5511', 'Manohar Das',         'car');

-- ────────────────────────────────────────────────────────────
--  MORE LOYALTY CARDS (for vehicles 7 onwards from original + new vehicles)
-- ────────────────────────────────────────────────────────────
INSERT INTO loyalty_cards (card_number, vehicle_id, points, tier, status) VALUES
('LC-2024-00007',  7, 0,    'bronze',   'active'),
('LC-2024-00008',  8, 2100, 'gold',     'active'),
('LC-2024-00009',  9, 640,  'silver',   'active'),
('LC-2024-00010', 10, 310,  'bronze',   'active'),
('LC-2024-00011', 11, 1750, 'gold',     'active'),
('LC-2024-00012', 12, 90,   'bronze',   'active'),
('LC-2024-00013', 13, 430,  'bronze',   'active'),
('LC-2024-00014', 14, 3500, 'platinum', 'active'),
('LC-2024-00015', 15, 870,  'silver',   'active'),
('LC-2024-00016', 16, 55,   'bronze',   'active'),
('LC-2024-00017', 17, 1200, 'gold',     'active'),
('LC-2024-00018', 18, 0,    'bronze',   'inactive'),
('LC-2024-00019', 19, 720,  'silver',   'active'),
('LC-2024-00020', 20, 280,  'bronze',   'active'),
('LC-2024-00021', 21, 1580, 'gold',     'active'),
('LC-2024-00022', 22, 410,  'bronze',   'active'),
('LC-2024-00023', 23, 2800, 'platinum', 'active'),
('LC-2024-00024', 24, 95,   'bronze',   'active'),
('LC-2024-00025', 25, 1100, 'silver',   'active'),
('LC-2024-00026', 26, 530,  'silver',   'active'),
('LC-2024-00027', 27, 180,  'bronze',   'active'),
('LC-2024-00028', 28, 4100, 'platinum', 'active'),
('LC-2024-00029', 29, 660,  'silver',   'active'),
('LC-2024-00030', 30, 45,   'bronze',   'active'),
('LC-2024-00031', 31, 1400, 'gold',     'active'),
('LC-2024-00032', 32, 220,  'bronze',   'active');

-- ────────────────────────────────────────────────────────────
--  EV STATIONS FOR NEW LOTS
-- ────────────────────────────────────────────────────────────
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 4, id, 7.40,  'charging'  FROM parking_spots WHERE lot_id=4 AND spot_number='B-08';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 4, id, 22.00, 'available' FROM parking_spots WHERE lot_id=4 AND spot_number='B-07';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 4, id, 50.00, 'charging'  FROM parking_spots WHERE lot_id=4 AND spot_number='B-10';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 4, id, 7.40,  'available' FROM parking_spots WHERE lot_id=4 AND spot_number='B-09';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 4, id, 22.00, 'charging'  FROM parking_spots WHERE lot_id=4 AND spot_number='F2-B03';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 4, id, 7.40,  'available' FROM parking_spots WHERE lot_id=4 AND spot_number='F2-B04';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 5, id, 7.40,  'available' FROM parking_spots WHERE lot_id=5 AND spot_number='B-01';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 5, id, 22.00, 'charging'  FROM parking_spots WHERE lot_id=5 AND spot_number='B-02';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 5, id, 7.40,  'available' FROM parking_spots WHERE lot_id=5 AND spot_number='B-03';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 6, id, 50.00, 'charging'  FROM parking_spots WHERE lot_id=6 AND spot_number='B-08';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 6, id, 22.00, 'available' FROM parking_spots WHERE lot_id=6 AND spot_number='B-07';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 6, id, 7.40,  'charging'  FROM parking_spots WHERE lot_id=6 AND spot_number='B-09';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 6, id, 7.40,  'available' FROM parking_spots WHERE lot_id=6 AND spot_number='B-10';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 6, id, 22.00, 'charging'  FROM parking_spots WHERE lot_id=6 AND spot_number='B-11';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 6, id, 50.00, 'available' FROM parking_spots WHERE lot_id=6 AND spot_number='B-12';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 7, id, 7.40,  'available' FROM parking_spots WHERE lot_id=7 AND spot_number='B-04';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 7, id, 22.00, 'charging'  FROM parking_spots WHERE lot_id=7 AND spot_number='B-05';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 8, id, 7.40,  'charging'  FROM parking_spots WHERE lot_id=8 AND spot_number='C-01';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 8, id, 22.00, 'available' FROM parking_spots WHERE lot_id=8 AND spot_number='C-02';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 8, id, 50.00, 'charging'  FROM parking_spots WHERE lot_id=8 AND spot_number='C-03';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 8, id, 7.40,  'available' FROM parking_spots WHERE lot_id=8 AND spot_number='C-04';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 9, id, 22.00, 'charging'  FROM parking_spots WHERE lot_id=9 AND spot_number='C-01';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 9, id, 7.40,  'available' FROM parking_spots WHERE lot_id=9 AND spot_number='C-02';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 9, id, 50.00, 'charging'  FROM parking_spots WHERE lot_id=9 AND spot_number='C-03';
INSERT INTO ev_stations (lot_id, spot_id, power_kw, status)
SELECT 9, id, 7.40,  'available' FROM parking_spots WHERE lot_id=9 AND spot_number='C-04';

-- ────────────────────────────────────────────────────────────
--  RATES FOR ALL COMBINATIONS
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO rates (vehicle_type, spot_type, rate_per_hr, min_charge, effective_from) VALUES
-- Car
('car',        'regular',  40.00,  40.00,  '2024-01-01'),
('car',        'ev',       60.00,  60.00,  '2024-01-01'),
('car',        'vip',      100.00, 100.00, '2024-01-01'),
('car',        'handicap', 20.00,  20.00,  '2024-01-01'),
-- Motorcycle
('motorcycle', 'regular',  20.00,  20.00,  '2024-01-01'),
('motorcycle', 'ev',       30.00,  30.00,  '2024-01-01'),
('motorcycle', 'vip',      50.00,  50.00,  '2024-01-01'),
('motorcycle', 'handicap', 15.00,  15.00,  '2024-01-01'),
-- Truck
('truck',      'regular',  80.00,  80.00,  '2024-01-01'),
('truck',      'vip',      150.00, 150.00, '2024-01-01'),
-- EV Vehicle
('ev',         'ev',       50.00,  50.00,  '2024-01-01'),
('ev',         'regular',  40.00,  40.00,  '2024-01-01'),
('ev',         'vip',      90.00,  90.00,  '2024-01-01');

-- ────────────────────────────────────────────────────────────
--  HISTORICAL SESSIONS (paid — last 30 days, revenue data)
-- ────────────────────────────────────────────────────────────
-- Lot 1 historical
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 1, 1, NOW()-INTERVAL 2 DAY-INTERVAL 3 HOUR, NOW()-INTERVAL 2 DAY-INTERVAL 1 HOUR,
       120, 80.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='A-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 2, 2, NOW()-INTERVAL 2 DAY-INTERVAL 6 HOUR, NOW()-INTERVAL 2 DAY-INTERVAL 4 HOUR,
       120, 80.00, 'paid', 'card'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='A-04';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 3, 3, NOW()-INTERVAL 3 DAY-INTERVAL 2 HOUR, NOW()-INTERVAL 3 DAY,
       120, 80.00, 'paid', 'cash'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='B-01';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 4, 4, NOW()-INTERVAL 3 DAY-INTERVAL 4 HOUR, NOW()-INTERVAL 3 DAY-INTERVAL 1 HOUR,
       180, 180.00, 'paid', 'loyalty'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='D-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 5, 5, NOW()-INTERVAL 4 DAY-INTERVAL 2 HOUR, NOW()-INTERVAL 4 DAY-INTERVAL 30 MINUTE,
       90, 90.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='EV-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 6, 6, NOW()-INTERVAL 5 DAY-INTERVAL 1 HOUR, NOW()-INTERVAL 5 DAY,
       60, 20.00, 'paid', 'cash'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='C-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 7, NULL, NOW()-INTERVAL 5 DAY-INTERVAL 3 HOUR, NOW()-INTERVAL 5 DAY-INTERVAL 1 HOUR,
       120, 160.00, 'paid', 'card'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='B-03';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 8, NULL, NOW()-INTERVAL 6 DAY-INTERVAL 5 HOUR, NOW()-INTERVAL 6 DAY-INTERVAL 3 HOUR,
       120, 100.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='B-05';

-- Lot 4 historical sessions
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 13, 13, NOW()-INTERVAL 1 DAY-INTERVAL 4 HOUR, NOW()-INTERVAL 1 DAY-INTERVAL 2 HOUR,
       120, 80.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='A-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 14, 14, NOW()-INTERVAL 1 DAY-INTERVAL 3 HOUR, NOW()-INTERVAL 1 DAY-INTERVAL 1 HOUR,
       120, 100.00, 'paid', 'card'
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='B-11';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 15, 15, NOW()-INTERVAL 2 DAY-INTERVAL 2 HOUR, NOW()-INTERVAL 2 DAY-INTERVAL 30 MINUTE,
       90, 90.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='B-07';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 16, NULL, NOW()-INTERVAL 7 DAY-INTERVAL 6 HOUR, NOW()-INTERVAL 7 DAY-INTERVAL 4 HOUR,
       120, 40.00, 'paid', 'cash'
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='A-04';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 17, NULL, NOW()-INTERVAL 7 DAY-INTERVAL 4 HOUR, NOW()-INTERVAL 7 DAY-INTERVAL 2 HOUR,
       120, 160.00, 'paid', 'card'
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='A-06';

-- Lot 6 historical sessions
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 18, NULL, NOW()-INTERVAL 2 DAY-INTERVAL 5 HOUR, NOW()-INTERVAL 2 DAY-INTERVAL 3 HOUR,
       120, 80.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='A-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 19, 19, NOW()-INTERVAL 3 DAY-INTERVAL 3 HOUR, NOW()-INTERVAL 3 DAY-INTERVAL 1 HOUR,
       120, 80.00, 'paid', 'card'
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='A-04';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 20, 20, NOW()-INTERVAL 4 DAY-INTERVAL 2 HOUR, NOW()-INTERVAL 4 DAY-INTERVAL 30 MINUTE,
       90, 50.00, 'paid', 'upi'
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='B-07';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 21, 21, NOW()-INTERVAL 5 DAY-INTERVAL 4 HOUR, NOW()-INTERVAL 5 DAY-INTERVAL 2 HOUR,
       120, 100.00, 'paid', 'card'
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='C-01';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time,exit_time,duration_mins,amount_charged,payment_status,payment_method)
SELECT ps.id, 22, 22, NOW()-INTERVAL 6 DAY-INTERVAL 3 HOUR, NOW()-INTERVAL 6 DAY-INTERVAL 1 HOUR,
       120, 40.00, 'paid', 'cash'
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='A-06';

-- ────────────────────────────────────────────────────────────
--  ACTIVE SESSIONS (currently parked — for occupied spots)
-- ────────────────────────────────────────────────────────────
-- Lot 1 active
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 9, NULL, NOW()-INTERVAL 2 HOUR
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='A-12';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 10, NULL, NOW()-INTERVAL 75 MINUTE
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='B-10';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 11, NULL, NOW()-INTERVAL 3 HOUR
FROM parking_spots ps WHERE ps.lot_id=1 AND ps.spot_number='B-12';

-- Lot 4 active
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 13, 13, NOW()-INTERVAL 90 MINUTE
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='A-01';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 14, 14, NOW()-INTERVAL 45 MINUTE
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='B-08';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 15, 15, NOW()-INTERVAL 2 HOUR
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='F2-B03';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 21, 21, NOW()-INTERVAL 60 MINUTE
FROM parking_spots ps WHERE ps.lot_id=4 AND ps.spot_number='B-12';

-- Lot 5 active
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 22, 22, NOW()-INTERVAL 30 MINUTE
FROM parking_spots ps WHERE ps.lot_id=5 AND ps.spot_number='B-02';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 23, 23, NOW()-INTERVAL 120 MINUTE
FROM parking_spots ps WHERE ps.lot_id=5 AND ps.spot_number='A-01';

-- Lot 6 active
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 24, 24, NOW()-INTERVAL 50 MINUTE
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='A-01';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 25, 25, NOW()-INTERVAL 3 HOUR
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='B-08';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 26, 26, NOW()-INTERVAL 80 MINUTE
FROM parking_spots ps WHERE ps.lot_id=6 AND ps.spot_number='B-09';

-- Lot 8 active
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 27, NULL, NOW()-INTERVAL 40 MINUTE
FROM parking_spots ps WHERE ps.lot_id=8 AND ps.spot_number='C-01';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 28, 28, NOW()-INTERVAL 100 MINUTE
FROM parking_spots ps WHERE ps.lot_id=8 AND ps.spot_number='C-03';

-- Lot 9 active
INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 29, 29, NOW()-INTERVAL 25 MINUTE
FROM parking_spots ps WHERE ps.lot_id=9 AND ps.spot_number='A-01';

INSERT INTO sessions (spot_id,vehicle_id,loyalty_card_id,entry_time)
SELECT ps.id, 30, 30, NOW()-INTERVAL 55 MINUTE
FROM parking_spots ps WHERE ps.lot_id=9 AND ps.spot_number='C-01';

-- ────────────────────────────────────────────────────────────
--  MORE STAFF
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO staff (name, email, password_hash, role) VALUES
('Night Supervisor',  'night@parking.local',   '$2b$12$placeholder004', 'operator'),
('East Gate Warden',  'eastgate@parking.local', '$2b$12$placeholder005', 'attendant'),
('Tech Coordinator',  'tech@parking.local',     '$2b$12$placeholder006', 'operator');

-- ────────────────────────────────────────────────────────────
--  AUDIT LOG ENTRIES
-- ────────────────────────────────────────────────────────────
INSERT INTO audit_log (staff_id, action, entity, entity_id, notes) VALUES
(1, 'lot_created',     'parking_lots',  4, 'East Block Parking created — 60 spots across 2 floors'),
(1, 'lot_created',     'parking_lots',  5, 'South Gate Annex created — 40 spots'),
(1, 'lot_created',     'parking_lots',  6, 'Tech Hub Basement created — 80 spots'),
(2, 'ev_station_add',  'ev_stations',   10, 'New 50kW fast charger added to Lot 4'),
(2, 'ev_station_add',  'ev_stations',   11, 'New 22kW charger added to Lot 4'),
(3, 'vehicle_entry',   'sessions',      NULL, 'Vehicle KA 03 MH 1122 entered East Block A-01'),
(3, 'vehicle_entry',   'sessions',      NULL, 'EV vehicle KA 51 AB 2200 started charging at B-08'),
(2, 'checkout',        'sessions',      NULL, 'Vehicle MH 14 RT 4567 checked out — ₹100 collected'),
(1, 'loyalty_issued',  'loyalty_cards', NULL, 'Gold card issued to vehicle_id 14 — 3500 pts'),
(2, 'rate_update',     'rates',         NULL, 'VIP rate updated to ₹100/hr for car'),
(1, 'maintenance',     'parking_spots', NULL, 'C-04 Lot 1 back from maintenance'),
(4, 'vehicle_entry',   'sessions',      NULL, 'Night shift: 3 vehicles entered Stadium Overflow'),
(5, 'vehicle_entry',   'sessions',      NULL, 'East Gate: Truck DL 8C TT 5544 entered A-06'),
(3, 'loyalty_redeem',  'loyalty_cards', NULL, 'Platinum card LC-2024-00014 redeemed 500pts = ₹50');

-- ────────────────────────────────────────────────────────────
--  VERIFY SUMMARY
-- ────────────────────────────────────────────────────────────
SELECT
    (SELECT COUNT(*) FROM parking_lots)        AS total_lots,
    (SELECT COUNT(*) FROM parking_spots)       AS total_spots,
    (SELECT COUNT(*) FROM vehicles)            AS total_vehicles,
    (SELECT COUNT(*) FROM loyalty_cards)       AS loyalty_cards,
    (SELECT COUNT(*) FROM ev_stations)         AS ev_stations,
    (SELECT COUNT(*) FROM sessions)            AS total_sessions,
    (SELECT COUNT(*) FROM sessions WHERE exit_time IS NULL) AS active_sessions,
    (SELECT COUNT(*) FROM rates)               AS rate_configs,
    (SELECT COUNT(*) FROM staff)               AS staff_members;

SELECT 'Extended seed complete!' AS status;
