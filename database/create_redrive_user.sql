CREATE USER IF NOT EXISTS 'redrive_user'@'localhost' IDENTIFIED BY 'redrive123';
GRANT ALL PRIVILEGES ON redrive_db.* TO 'redrive_user'@'localhost';
FLUSH PRIVILEGES;

