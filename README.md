# ReDrive Admin Panel Backend

Simple Spring Boot backend for only **Component 04: Admin & Moderation Panel** of the second-hand car sales project.

This project is intentionally kept beginner-friendly:

- Spring Boot + Maven
- Java 21
- MySQL
- Simple REST API
- No Spring Security or JWT complexity
- Uses `X-Admin-Id` header after login to identify the admin who is performing actions

## What Is Implemented

This backend covers the admin component only:

- Create new admin accounts
- Admin login
- View dashboard summary
- View sales reports
- View admin activity logs
- View pending car listings
- Approve or reject car listings
- View users
- Ban users
- Unban users (super admin only)

## OOP Concepts Used

- **Inheritance**: `SuperAdmin` extends the admin abstraction and gets extra permissions.
- **Abstraction**: admin permission rules are handled through the `Admin` abstraction and shared base service methods.
- **Encapsulation**: entities and DTOs keep data structured inside classes.

## Main Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- MySQL
- Maven

## Project Structure

```text
src/main/java/com/redrive/adminpanel
|- controller
|- dto
|- entity
|- exception
|- repository
|- service
```

## Database

The full MySQL script is available at:

- [database/redrive_db.sql](/home/shanelperera/car-sales-platform/database/redrive_db.sql)
- [database/create_redrive_user.sql](/home/shanelperera/car-sales-platform/database/create_redrive_user.sql)

The app also includes:

- [schema.sql](/home/shanelperera/car-sales-platform/src/main/resources/schema.sql)
- [data.sql](/home/shanelperera/car-sales-platform/src/main/resources/data.sql)

So when the app starts, it can create the tables automatically in `redrive_db` if MySQL credentials are correct.

## Default Demo Accounts

- Super Admin
  - email: `admin@redrive.com`
  - password: `12345678`
- Normal Admin
  - email: `moderator@redrive.com`
  - password: `12345678`

## MySQL Configuration

Edit [application.properties](/home/shanelperera/car-sales-platform/src/main/resources/application.properties) if needed.

Default values:

```properties
DB_URL=jdbc:mysql://localhost:3306/redrive_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo
DB_USERNAME=redrive_user
DB_PASSWORD=redrive123
```

You can also set them as environment variables before running the app.

## Create The Project MySQL User

Run these SQL files in MySQL using a privileged account like `root`:

1. [database/redrive_db.sql](/home/shanelperera/car-sales-platform/database/redrive_db.sql)
2. [database/create_redrive_user.sql](/home/shanelperera/car-sales-platform/database/create_redrive_user.sql)

Or run this directly:

```sql
CREATE DATABASE IF NOT EXISTS redrive_db;
CREATE USER IF NOT EXISTS 'redrive_user'@'localhost' IDENTIFIED BY 'redrive123';
GRANT ALL PRIVILEGES ON redrive_db.* TO 'redrive_user'@'localhost';
FLUSH PRIVILEGES;
```

Then start the app normally:

```bash
mvn spring-boot:run
```

If you want to use a different username or password, set them before starting the app:

```bash
export DB_USERNAME=your_mysql_username
export DB_PASSWORD=your_mysql_password
mvn spring-boot:run
```

## How To Run

1. Make sure MySQL is running.
2. Create the database manually using [database/redrive_db.sql](/home/shanelperera/car-sales-platform/database/redrive_db.sql), or let Spring create it automatically.
3. Run the application:

```bash
mvn spring-boot:run
```

If Maven is not installed on the machine yet, install Maven first and then run the command above.

## Important API Usage

First login using:

`POST /api/admin/auth/login`

Example request:

```json
{
  "email": "admin@redrive.com",
  "password": "12345678"
}
```

The response returns the admin `id`.

Use that value in the request header for all other admin actions:

```text
X-Admin-Id: 1
```

## Main Endpoints

### Auth

- `POST /api/admin/auth/login`

### Admin Accounts

- `POST /api/admin/accounts`
- `GET /api/admin/accounts`

### Dashboard, Logs, Reports

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/reports/sales`
- `GET /api/admin/logs`

### Listing Moderation

- `GET /api/admin/listings`
- `GET /api/admin/listings/pending`
- `PUT /api/admin/listings/{carId}/approve`
- `PUT /api/admin/listings/{carId}/reject`

### User Management

- `GET /api/admin/users`
- `GET /api/admin/users/{userId}`
- `PUT /api/admin/users/{userId}/ban`
- `PUT /api/admin/users/{userId}/unban`

## Example Requests

Approve a car listing:

```bash
curl -X PUT http://localhost:8080/api/admin/listings/1/approve \
  -H "Content-Type: application/json" \
  -H "X-Admin-Id: 1" \
  -d '{"moderationNote":"Listing verified and approved."}'
```

Reject a listing:

```bash
curl -X PUT http://localhost:8080/api/admin/listings/1/reject \
  -H "Content-Type: application/json" \
  -H "X-Admin-Id: 1" \
  -d '{"moderationNote":"Please correct the missing details and resubmit."}'
```

Ban a user:

```bash
curl -X PUT http://localhost:8080/api/admin/users/3/ban \
  -H "Content-Type: application/json" \
  -H "X-Admin-Id: 1" \
  -d '{"reason":"Repeated spam activity"}'
```

## Notes

- Passwords are stored as plain text only to keep the project simple for a student demo.
- This is okay for an academic project, but not for a real production system.
- The schema is based on the client-provided SQL, with small additions needed to support admin moderation properly:
  - `users.account_status`
  - `cars.moderation_note`
  - `cars.status` supports `REJECTED`
