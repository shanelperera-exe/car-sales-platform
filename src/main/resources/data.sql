INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'System', 'Admin', 'admin@redrive.com', '12345678', '0770000001', 'Colombo', 'SUPER_ADMIN', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Panel', 'Moderator', 'moderator@redrive.com', '12345678', '0770000002', 'Kandy', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'moderator@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Sahan', 'Seller', 'seller@redrive.com', '12345678', '0771234567', 'Galle', 'SELLER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'seller@redrive.com'
);

INSERT INTO users (first_name, last_name, email, password, phone, location, role, account_status)
SELECT 'Nadee', 'Buyer', 'buyer@redrive.com', '12345678', '0777654321', 'Kurunegala', 'BUYER', 'ACTIVE'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'buyer@redrive.com'
);

INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'VIN00000000000001',
    'Toyota',
    'Corolla',
    2019,
    54000,
    'Sedan',
    'Petrol',
    'Automatic',
    9750000.00,
    'Clean condition family car.',
    'Galle',
    'PENDING_APPROVAL',
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'VIN00000000000001'
);

INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'VIN00000000000002',
    'Honda',
    'Vezel',
    2018,
    68000,
    'SUV',
    'Hybrid',
    'Automatic',
    12950000.00,
    'Already approved listing.',
    'Matara',
    'ACTIVE',
    'Approved by initial setup data.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'VIN00000000000002'
);

INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'VIN00000000000003',
    'Nissan',
    'Leaf',
    2017,
    72000,
    'Hatchback',
    'Electric',
    'Automatic',
    8450000.00,
    'Sold sample car for transaction report.',
    'Colombo',
    'SOLD',
    'Included for report testing.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'VIN00000000000003'
);

INSERT INTO cars (seller_id, vin, make, model, year, mileage, body_type, fuel_type, transmission, price, description, location, status, moderation_note)
SELECT
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    'VIN00000000000004',
    'BMW',
    '320i',
    2015,
    91000,
    'Sedan',
    'Petrol',
    'Automatic',
    11250000.00,
    'Rejected sample car.',
    'Negombo',
    'REJECTED',
    'Price details were incomplete.'
WHERE NOT EXISTS (
    SELECT 1 FROM cars WHERE vin = 'VIN00000000000004'
);

INSERT INTO transactions (order_number, car_id, buyer_id, seller_id, amount_paid, payment_method, status)
SELECT
    'ORD-1001',
    (SELECT id FROM cars WHERE vin = 'VIN00000000000003'),
    (SELECT id FROM users WHERE email = 'buyer@redrive.com'),
    (SELECT id FROM users WHERE email = 'seller@redrive.com'),
    8450000.00,
    'BANK_TRANSFER',
    'COMPLETED'
WHERE NOT EXISTS (
    SELECT 1 FROM transactions WHERE order_number = 'ORD-1001'
);

