USE redrive_db;

-- Password references for testing:
-- Admin1234  -> $2b$12$QXkC6hUgeiqnR7uAoHTSSOsGIFtDySHvw.h6uxCxC0G25pCAE8GVm
-- Seller1234 -> $2b$12$uLPJ40L7CmL8xKdFoQXbw.GCiqhoFGkcYGUKOqJU0DD9/l6jbSCOy
-- Buyer1234  -> $2b$12$hqzEq85WuFww6ozY67WBRuLqqJMkaDci92DSkuYv2E1HqfOXitDc2

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'System', 'Admin', 'admin@redrive.com', '$2b$12$QXkC6hUgeiqnR7uAoHTSSOsGIFtDySHvw.h6uxCxC0G25pCAE8GVm', '0770000001', 'Colombo', 'SUPER_ADMIN', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Panel', 'Moderator', 'moderator@redrive.com', '$2b$12$QXkC6hUgeiqnR7uAoHTSSOsGIFtDySHvw.h6uxCxC0G25pCAE8GVm', '0770000002', 'Kandy', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'moderator@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Sahan', 'Seller', 'seller@redrive.com', '$2b$12$uLPJ40L7CmL8xKdFoQXbw.GCiqhoFGkcYGUKOqJU0DD9/l6jbSCOy', '0771234567', 'Galle', 'SELLER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'seller@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Dulan', 'Perera', 'seller2@redrive.com', '$2b$12$uLPJ40L7CmL8xKdFoQXbw.GCiqhoFGkcYGUKOqJU0DD9/l6jbSCOy', '0772345678', 'Matara', 'SELLER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'seller2@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Nadee', 'Buyer', 'buyer@redrive.com', '$2b$12$hqzEq85WuFww6ozY67WBRuLqqJMkaDci92DSkuYv2E1HqfOXitDc2', '0777654321', 'Kurunegala', 'BUYER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'buyer@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Kasuni', 'Fernando', 'buyer2@redrive.com', '$2b$12$hqzEq85WuFww6ozY67WBRuLqqJMkaDci92DSkuYv2E1HqfOXitDc2', '0779876543', 'Colombo', 'BUYER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'buyer2@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Malith', 'Silva', 'bannedbuyer@redrive.com', '$2b$12$hqzEq85WuFww6ozY67WBRuLqqJMkaDci92DSkuYv2E1HqfOXitDc2', '0776543210', 'Jaffna', 'BUYER', 'BANNED'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'bannedbuyer@redrive.com'
);

-- Keep listing seed compact: remove older overflow listings.
DELETE FROM transactions
WHERE car_id IN (SELECT id FROM cars WHERE vin IN ('TSTVIN00000000006', 'TSTVIN00000000007', 'TSTVIN00000000008'));

DELETE FROM messages
WHERE car_id IN (SELECT id FROM cars WHERE vin IN ('TSTVIN00000000006', 'TSTVIN00000000007', 'TSTVIN00000000008'));

DELETE FROM car_features
WHERE car_id IN (SELECT id FROM cars WHERE vin IN ('TSTVIN00000000006', 'TSTVIN00000000007', 'TSTVIN00000000008'));

DELETE FROM car_images
WHERE car_id IN (SELECT id FROM cars WHERE vin IN ('TSTVIN00000000006', 'TSTVIN00000000007', 'TSTVIN00000000008'));

DELETE FROM cars
WHERE vin IN ('TSTVIN00000000006', 'TSTVIN00000000007', 'TSTVIN00000000008');

-- Listing 01 + image
INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'TSTVIN00000000001',
    'Toyota',
    'Corolla',
    2020,
    42000,
    'Sedan',
    'Petrol',
    'Automatic',
    9950000.00,
    'Pending review listing with complete documents.',
    'Galle',
    'PENDING_APPROVAL',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'TSTVIN00000000001'
);

INSERT INTO car_images (car_id, image_url, is_primary)
SELECT
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001'),
    'https://vehicle-images.carscommerce.inc/db94-110004167/5YFB4MDE4PP014607/thumbnails/large/7b3ddbdd661c805194b8c206ae139041.jpeg',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM car_images
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001')
      AND is_primary = TRUE
);

UPDATE car_images
SET image_url = 'https://vehicle-images.carscommerce.inc/db94-110004167/5YFB4MDE4PP014607/thumbnails/large/7b3ddbdd661c805194b8c206ae139041.jpeg'
WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001')
  AND is_primary = TRUE;

-- Listing 02 + image
INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller2@redrive.com'),
    'TSTVIN00000000002',
    'Honda',
    'Vezel',
    2019,
    56000,
    'SUV',
    'Hybrid',
    'Automatic',
    13250000.00,
    'Approved listing used for active inventory testing.',
    'Matara',
    'ACTIVE',
    'Approved after document verification.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'TSTVIN00000000002'
);

INSERT INTO car_images (car_id, image_url, is_primary)
SELECT
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002'),
    'https://carsforsale.co.ke/wp-content/uploads/2024/02/2016-Honda-Vezel-RS-Hybrid-1.5-2WD-b.jpg',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM car_images
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002')
      AND is_primary = TRUE
);

UPDATE car_images
SET image_url = 'https://carsforsale.co.ke/wp-content/uploads/2024/02/2016-Honda-Vezel-RS-Hybrid-1.5-2WD-b.jpg'
WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002')
  AND is_primary = TRUE;

-- Listing 03 + image
INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'TSTVIN00000000003',
    'Nissan',
    'Leaf',
    2018,
    61000,
    'Hatchback',
    'Electric',
    'Automatic',
    8650000.00,
    'Reserved listing to test reservation flow.',
    'Colombo',
    'RESERVED',
    'Temporarily reserved for a confirmed buyer visit.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'TSTVIN00000000003'
);

INSERT INTO car_images (car_id, image_url, is_primary)
SELECT
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000003'),
    'https://mobility.lk/wp-content/uploads/2023/04/Red-leaf-side.jpeg',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM car_images
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000003')
      AND is_primary = TRUE
);

UPDATE car_images
SET image_url = 'https://mobility.lk/wp-content/uploads/2023/04/Red-leaf-side.jpeg'
WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000003')
  AND is_primary = TRUE;

-- Listing 04 + image
INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'TSTVIN00000000004',
    'BMW',
    '320i',
    2017,
    70000,
    'Sedan',
    'Petrol',
    'Automatic',
    11850000.00,
    'Completed sale sample listing.',
    'Negombo',
    'SOLD',
    'Sold and included for reporting tests.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'TSTVIN00000000004'
);

INSERT INTO car_images (car_id, image_url, is_primary)
SELECT
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000004'),
    'https://bringatrailer.com/wp-content/uploads/2023/05/2017_bmw_320i_2017_bmw_320i_a07a64c0-b8d3-4923-a9a0-ea3f86a14db5-rkCrwW-35682-35684-scaled.jpg',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM car_images
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000004')
      AND is_primary = TRUE
);

UPDATE car_images
SET image_url = 'https://bringatrailer.com/wp-content/uploads/2023/05/2017_bmw_320i_2017_bmw_320i_a07a64c0-b8d3-4923-a9a0-ea3f86a14db5-rkCrwW-35682-35684-scaled.jpg'
WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000004')
  AND is_primary = TRUE;

-- Listing 05 + image
INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller2@redrive.com'),
    'TSTVIN00000000005',
    'Audi',
    'A4',
    2016,
    89000,
    'Sedan',
    'Petrol',
    'Automatic',
    10900000.00,
    'Rejected listing due to incomplete ownership records.',
    'Kandy',
    'REJECTED',
    'Ownership transfer documents are missing.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'TSTVIN00000000005'
);

INSERT INTO car_images (car_id, image_url, is_primary)
SELECT
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000005'),
    'https://motorguide-store.s3.ap-southeast-1.amazonaws.com/ikman/a4_featured_1_68d503c389.jpg',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM car_images
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000005')
      AND is_primary = TRUE
);

UPDATE car_images
SET image_url = 'https://motorguide-store.s3.ap-southeast-1.amazonaws.com/ikman/a4_featured_1_68d503c389.jpg'
WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000005')
  AND is_primary = TRUE;

INSERT INTO car_features (car_id, feature_name)
SELECT (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002'), 'Reverse Camera'
WHERE NOT EXISTS (
    SELECT 1 FROM car_features
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002')
      AND feature_name = 'Reverse Camera'
);

INSERT INTO car_features (car_id, feature_name)
SELECT (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002'), 'Cruise Control'
WHERE NOT EXISTS (
    SELECT 1 FROM car_features
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000002')
      AND feature_name = 'Cruise Control'
);

INSERT INTO car_features (car_id, feature_name)
SELECT (SELECT id FROM cars WHERE vin = 'TSTVIN00000000003'), 'Fast Charging'
WHERE NOT EXISTS (
    SELECT 1 FROM car_features
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000003')
      AND feature_name = 'Fast Charging'
);


INSERT INTO transactions (order_number, car_id, buyer_id, seller_id, amount_paid, payment_method, status)
SELECT
    'ORD-TST-1001',
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000004'),
    (SELECT id FROM users WHERE email = 'buyer@redrive.com'),
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    11850000.00,
    'BANK_TRANSFER',
    'COMPLETED'
WHERE NOT EXISTS (
    SELECT 1 FROM transactions WHERE order_number = 'ORD-TST-1001'
);

INSERT INTO transactions (order_number, car_id, buyer_id, seller_id, amount_paid, payment_method, status)
SELECT
    'ORD-TST-1002',
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000003'),
    (SELECT id FROM users WHERE email = 'buyer2@redrive.com'),
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    250000.00,
    'CARD',
    'RESERVED'
WHERE NOT EXISTS (
    SELECT 1 FROM transactions WHERE order_number = 'ORD-TST-1002'
);

INSERT INTO transactions (order_number, car_id, buyer_id, seller_id, amount_paid, payment_method, status)
SELECT
    'ORD-TST-1003',
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001'),
    (SELECT id FROM users WHERE email = 'buyer@redrive.com'),
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    100000.00,
    'BANK_TRANSFER',
    'CANCELLED'
WHERE NOT EXISTS (
    SELECT 1 FROM transactions WHERE order_number = 'ORD-TST-1003'
);

INSERT INTO messages (sender_id, receiver_id, car_id, message, is_read)
SELECT
    (SELECT id FROM users WHERE email = 'buyer@redrive.com'),
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001'),
    'Is the service history available for this Corolla?',
    FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM messages
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001')
      AND message = 'Is the service history available for this Corolla?'
);

INSERT INTO messages (sender_id, receiver_id, car_id, message, is_read)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    (SELECT id FROM users WHERE email = 'buyer@redrive.com'),
    (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001'),
    'Yes, full records are available and can be shared at inspection.',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM messages
    WHERE car_id = (SELECT id FROM cars WHERE vin = 'TSTVIN00000000001')
      AND message = 'Yes, full records are available and can be shared at inspection.'
);

INSERT INTO admin_logs (admin_id, action, target, status, execution_time_ms)
SELECT
    (SELECT id FROM users WHERE email = 'admin@redrive.com'),
    'APPROVE_LISTING',
    'Car VIN: TSTVIN00000000002',
    'SUCCESS',
    95
WHERE NOT EXISTS (
    SELECT 1 FROM admin_logs
    WHERE action = 'APPROVE_LISTING'
      AND target = 'Car VIN: TSTVIN00000000002'
);

INSERT INTO admin_logs (admin_id, action, target, status, execution_time_ms)
SELECT
    (SELECT id FROM users WHERE email = 'moderator@redrive.com'),
    'REJECT_LISTING',
    'Car VIN: TSTVIN00000000005',
    'SUCCESS',
    121
WHERE NOT EXISTS (
    SELECT 1 FROM admin_logs
    WHERE action = 'REJECT_LISTING'
      AND target = 'Car VIN: TSTVIN00000000005'
);

INSERT INTO admin_logs (admin_id, action, target, status, execution_time_ms)
SELECT
    (SELECT id FROM users WHERE email = 'admin@redrive.com'),
    'BAN_USER',
    'User: bannedbuyer@redrive.com',
    'SUCCESS',
    88
WHERE NOT EXISTS (
    SELECT 1 FROM admin_logs
    WHERE action = 'BAN_USER'
      AND target = 'User: bannedbuyer@redrive.com'
);
