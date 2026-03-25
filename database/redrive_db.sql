CREATE DATABASE IF NOT EXISTS redrive_db;
USE redrive_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'BUYER',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    vin VARCHAR(17),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    mileage INT NOT NULL,
    body_type VARCHAR(30),
    fuel_type VARCHAR(30),
    transmission VARCHAR(30),
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    moderation_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cars_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS car_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    car_id BIGINT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_car_features_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS car_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    car_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_car_images_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    car_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_car FOREIGN KEY (car_id) REFERENCES cars(id),
    CONSTRAINT fk_transactions_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_transactions_seller FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    car_id BIGINT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT fk_messages_car FOREIGN KEY (car_id) REFERENCES cars(id)
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT,
    action VARCHAR(50) NOT NULL,
    target VARCHAR(255),
    status VARCHAR(20),
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

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
