# ReDrive Admin and Moderation Panel

## Project Overview

This project is the admin side of the ReDrive second-hand car sales platform. I built it to help platform administrators manage the marketplace from one dashboard.

The system allows admins to:

- log in to the admin panel
- see an overview of users, listings, sales, and platform activity
- review pending car listings
- approve or reject listings
- view registered users
- ban or unban users
- manage admin accounts
- view admin activity logs

This project is split into two parts:

- a Spring Boot backend for the API and business logic
- a React frontend for the admin dashboard interface

## Main Features

- Admin login
- Dashboard summary cards
- Sales reporting
- Admin activity logs
- Listing moderation
- User management
- Admin account management
- Bootstrap super admin account on first run
- MySQL database integration
- BCrypt password hashing

## Technology Stack

### Backend

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Validation
- MySQL
- Maven

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts

## Project Structure

```text
car-sales-platform
├── database
│   ├── create_redrive_user.sql
│   ├── redrive_db.sql
│   ├── reset_redrive_data.sql
│   └── seed_test_data.sql
├── frontend
│   ├── package.json
│   ├── src
│   └── vite.config.ts
├── src
│   ├── main
│   │   ├── java/com/redrive/adminpanel
│   │   └── resources
│   └── test
├── pom.xml
└── README.md
```

## How The System Works

The backend exposes REST API endpoints under `/api/admin`.  
The frontend calls those endpoints and shows the data in the browser.

After an admin logs in, the frontend keeps the returned admin information and sends the selected admin ID in the `X-Admin-Id` request header for protected actions.

The backend also creates a default super admin automatically on the first startup if there are no admin accounts in the database.

## Database Files

The project already includes SQL files inside the `database` folder:

- `database/redrive_db.sql`
  Creates the database tables and inserts some sample marketplace data.
- `database/create_redrive_user.sql`
  Creates the MySQL user for the project.
- `database/reset_redrive_data.sql`
  Clears data for a clean restart.
- `database/seed_test_data.sql`
  Adds extra sample data for testing.

The backend also contains `src/main/resources/schema.sql`, which is used by Spring Boot during startup.

## Default Application Configuration

The main backend configuration is in `src/main/resources/application.properties`.

Important defaults:

```properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/redrive_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo
spring.datasource.username=redrive_user
spring.datasource.password=Redrive@123

app.bootstrap.admin.enabled=true
app.bootstrap.admin.email=admin@redrive.com
app.bootstrap.admin.password=Admin1234
app.bootstrap.admin.first-name=System
app.bootstrap.admin.last-name=Admin
```

For server deployment, I recommend setting these values through environment variables instead of editing the Java code.

## Prerequisites

To run this project, the server or local machine should have:

- Java 21
- Maven
- MySQL 8 or compatible MySQL server
- Node.js 18 or newer
- npm

For production hosting on Ubuntu, it is also best to use:

- Nginx
- `systemd`

## How To Run The Project Locally

### 1. Clone the project

```bash
git clone <your-repository-url>
cd car-sales-platform
```

### 2. Create the MySQL database

Start MySQL first, then run:

```bash
mysql -u root -p < database/redrive_db.sql
mysql -u root -p < database/create_redrive_user.sql
```

If you want to use a different MySQL username or password, set the backend environment variables before running the application.

### 3. Run the backend

```bash
export DB_URL="jdbc:mysql://localhost:3306/redrive_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo"
export DB_USERNAME="redrive_user"
export DB_PASSWORD="redrive123"
export APP_BOOTSTRAP_ADMIN_EMAIL="admin@redrive.com"
export APP_BOOTSTRAP_ADMIN_PASSWORD="Admin1234"

mvn spring-boot:run
```

The backend starts on:

```text
http://localhost:8080
```

### 4. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on:

```text
http://localhost:5173
```

### 5. Log in

If this is the first time the backend is starting on a clean database, the system creates a default super admin account:

- Email: `admin@redrive.com`
- Password: `Admin1234`

## Sample Test Accounts

If you load the optional seed data, these accounts are available:

- Super Admin: `admin@redrive.com` / `Admin1234`
- Admin: `moderator@redrive.com` / `Admin1234`
- Seller: `seller@redrive.com` / `Seller1234`
- Buyer: `buyer@redrive.com` / `Buyer1234`

To add the optional sample data:

```bash
mysql -u redrive_user -p redrive_db < database/seed_test_data.sql
```

## Production Deployment Overview

For a real server, the cleanest setup is:

1. Run MySQL on the server.
2. Build the Spring Boot backend into a JAR file.
3. Run the backend as a `systemd` service on port `8080`.
4. Build the React frontend into static files.
5. Use Nginx to:
   - serve the frontend files
   - proxy `/api` requests to the backend

This setup is easier for a beginner than trying to mix everything into one process.

## Recommended Production Flow

### Backend

Build the backend:

```bash
mvn clean package -DskipTests
```

This creates a JAR file inside the `target` folder.

Run it manually:

```bash
java -jar target/admin-panel-backend-0.0.1-SNAPSHOT.jar
```

For real deployment, run it through a `systemd` service instead of keeping the terminal open.

### Frontend

Build the frontend:

```bash
cd frontend
npm install
npm run build
```

This creates the production files inside:

```text
frontend/dist
```

### Nginx

Nginx should:

- serve `frontend/dist`
- forward `/api` requests to `http://127.0.0.1:8080`
- return `index.html` for unknown frontend routes such as `/dashboard` or `/users`

## Local Setup Commands File

I added a separate beginner-friendly text file for local setup:

- `LOCAL_SETUP_COMMANDS.txt`

That file contains only the basic steps needed to run the project on a local computer:

- install the required software
- clone the repository
- create the MySQL database
- install frontend dependencies
- run the backend
- run the frontend
- log in with the default admin account

## Production Environment Variables

For production, I recommend setting these environment variables for the backend service:

```properties
DB_URL=jdbc:mysql://localhost:3306/redrive_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Colombo
DB_USERNAME=redrive_user
DB_PASSWORD=redrive123
APP_BOOTSTRAP_ADMIN_ENABLED=true
APP_BOOTSTRAP_ADMIN_EMAIL=admin@redrive.com
APP_BOOTSTRAP_ADMIN_PASSWORD=Admin1234
APP_BOOTSTRAP_ADMIN_FIRST_NAME=System
APP_BOOTSTRAP_ADMIN_LAST_NAME=Admin
APP_CORS_ALLOWED_ORIGINS=https://your-domain.com
```

If the frontend and backend are served from the same domain through Nginx, browser CORS problems are usually avoided because the browser only talks to the Nginx domain.

## Important Notes For Deployment

### 1. Database password consistency

The provided SQL file `database/create_redrive_user.sql` creates:

- username: `redrive_user`
- password: `redrive123`

So if that SQL file is used, the backend environment variables should use the same password.

### 2. Bootstrap admin behavior

The default super admin is only created when there are no admin accounts in the database.

### 3. Sample images

Some sample listing images are loaded from external URLs.  
That means the server may need outbound internet access if those sample records are being used.

### 4. React route handling

Because this frontend uses React Router, Nginx must be configured to return `index.html` for non-file routes.

## Useful Commands

### Reset the database data

```bash
mysql -u redrive_user -p redrive_db < database/reset_redrive_data.sql
```

### Load sample data

```bash
mysql -u redrive_user -p redrive_db < database/seed_test_data.sql
```

### Run backend tests

```bash
mvn test
```

### Build frontend

```bash
cd frontend
npm run build
```

## API Summary

Main backend routes:

### Authentication

- `POST /api/admin/auth/login`

### Dashboard and Reports

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/reports/sales`
- `GET /api/admin/logs`

### Listings

- `GET /api/admin/listings`
- `GET /api/admin/listings/pending`
- `GET /api/admin/listings/{carId}/image`
- `PUT /api/admin/listings/{carId}/approve`
- `PUT /api/admin/listings/{carId}/reject`

### Users

- `GET /api/admin/users`
- `GET /api/admin/users/{userId}`
- `PUT /api/admin/users/{userId}/ban`
- `PUT /api/admin/users/{userId}/unban`

### Admin Accounts

- `POST /api/admin/accounts`
- `GET /api/admin/accounts`
- `PUT /api/admin/accounts/me`

## Troubleshooting

### Backend cannot connect to MySQL

Check:

- MySQL service is running
- database name is correct
- username and password are correct
- environment variables match the real MySQL credentials

### Frontend loads but API does not work

Check:

- backend is running on port `8080`
- Nginx proxy for `/api` is configured correctly
- backend service is active

### React page shows 404 after refresh

Check the Nginx config and make sure it uses:

```nginx
try_files $uri $uri/ /index.html;
```

### Admin account is not created

Check:

- the database is empty for admin users
- `APP_BOOTSTRAP_ADMIN_ENABLED=true`
- the backend started successfully without database errors

## Final Note

This project is designed to be simple to understand and easy to demonstrate.  
The backend and frontend are clearly separated, the admin functionality is organized by feature, and the project can be run both locally and on a real Ubuntu server with MySQL and Nginx.
