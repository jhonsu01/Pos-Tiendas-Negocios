# EcoTienda POS System - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend Documentation](#backend-documentation)
   - 5.1 [Server Configuration](#server-configuration)
   - 5.2 [Database Schema](#database-schema)
   - 5.3 [Authentication & Authorization](#authentication--authorization)
   - 5.4 [API Endpoints](#api-endpoints)
   - 5.5 [Business Logic](#business-logic)
   - 5.6 [Models](#models)
   - 5.7 [Controllers](#controllers)
   - 5.8 [Middleware](#middleware)
   - 5.9 [Utilities](#utilities)
   - 5.10 [CLI Tools](#cli-tools)
6. [Frontend Documentation](#frontend-documentation)
   - 6.1 [Application Structure](#application-structure)
   - 6.2 [Routing](#routing)
   - 6.3 [State Management](#state-management)
   - 6.4 [Pages & Features](#pages--features)
   - 6.5 [API Integration](#api-integration)
   - 6.6 [UI Components](#ui-components)
7. [MCP Server Integration](#mcp-server-integration)
   - 7.1 [Overview](#overview)
   - 7.2 [Installation](#installation-1)
   - 7.3 [Configuration](#configuration-1)
   - 7.4 [Available Tools](#available-tools)
   - 7.5 [Usage Examples](#usage-examples)
   - 7.6 [Troubleshooting](#troubleshooting-1)
8. [Installation & Setup](#installation--setup)
9. [Configuration](#configuration)
10. [Development Workflow](#development-workflow)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

**EcoTienda** is a complete Point of Sale (POS) system designed for small retail stores. The system provides comprehensive functionality for product catalog management, sales processing, cash register management, supplier tracking, and customer debt/layaway management.

### Key Features

- **Product Management**: Full catalog with categories, stock tracking, variable pricing, image uploads, and drag-and-drop ordering
- **Point of Sale (POS)**: Intuitive sales interface with barcode scanning, cart management, and multi-register support
- **Cash Register Management**: Multiple registers with category-based assignment and daily closing reconciliation
- **Sales History**: Complete sales transaction tracking with filtering and editing capabilities
- **Supplier Management**: Track suppliers and manage payments
- **Customer Debts/Transfers**: Layaway-style "fiado" system for customer purchases on credit
- **Database Backups**: Built-in backup/restore functionality
- **Multi-device LAN Access**: Access the system from any device on the local network
- **License Control**: Expiration-based licensing for user access control
- **Role-based Access**: Admin and Cashier roles with different permission levels
- **Dark Mode**: Full dark/light theme support

---

## System Architecture

The application follows a **client-server architecture** with separate frontend and backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite + Tailwind CSS + Zustand)       │  │
│  │  - POS Interface                                       │  │
│  │  - Admin Dashboard                                     │  │
│  │  - State Management (Zustand)                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST API (JSON)
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js 5 API Server                               │  │
│  │  - Authentication (JWT)                                │  │
│  │  - Business Logic Controllers                          │  │
│  │  - Route Handlers                                      │  │
│  │  - Middleware (Auth, Upload, License)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Layer                                            │  │
│  │  - SQLite Database (better-sqlite3)                    │  │
│  │  - Local File Storage (uploads/, backups/)             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User interacts with React frontend UI
2. Frontend makes HTTP requests via Axios to backend API
3. Backend authenticates request via JWT middleware
4. Request routed to appropriate controller
5. Controller interacts with database models
6. Database operations executed via better-sqlite3
7. Response returned to frontend
8. Frontend updates UI via Zustand state management

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >= 18 | Runtime environment |
| Express.js | 5.x | Web framework / API server |
| better-sqlite3 | Latest | SQLite database driver |
| JSON Web Token (jsonwebtoken) | Latest | Authentication tokens |
| bcryptjs | Latest | Password hashing |
| multer | Latest | File upload handling |
| dotenv | Latest | Environment variable management |
| cors | Latest | Cross-origin resource sharing |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI library |
| Vite | 7.x | Build tool / dev server |
| React Router DOM | 7.x | Client-side routing |
| Zustand | 5.x | State management |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Axios | 1.x | HTTP client |
| Lucide React | Latest | Icon library |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixes |

---

## Project Structure

```
Pos-Tiendas-Negocios/
│
├── backend/                           # Backend API server
│   ├── database/                      # Database configuration
│   │   ├── connection.js              # SQLite connection setup & initialization
│   │   ├── schema.sql                 # Complete database schema (13 tables)
│   │   └── seed.js                    # Seed data for initial setup
│   │
│   ├── data/                          # Data files
│   │   └── database.sqlite            # SQLite database (auto-generated)
│   │
│   ├── src/                           # Application source code
│   │   ├── config/                    # Configuration files
│   │   │   └── db.js                  # Database configuration wrapper
│   │   │
│   │   ├── controllers/               # Request handlers
│   │   │   ├── authController.js      # User authentication
│   │   │   ├── productController.js   # Product CRUD
│   │   │   ├── saleController.js      # Sales processing
│   │   │   ├── registerController.js  # Cash register management
│   │   │   ├── categoryController.js  # Category management
│   │   │   ├── settingsController.js  # Store settings
│   │   │   ├── supplierController.js  # Supplier management
│   │   │   └── transferController.js  # Debt/transfer management
│   │   │
│   │   ├── middleware/                # Express middleware
│   │   │   ├── authMiddleware.js      # JWT authentication
│   │   │   ├── licenseMiddleware.js   # License expiration check
│   │   │   └── uploadMiddleware.js    # Multer file upload config
│   │   │
│   │   ├── models/                    # Database models
│   │   │   ├── User.js                # User model with bcrypt
│   │   │   ├── Product.js             # Product model with stock
│   │   │   ├── Sale.js                # Sale model with items
│   │   │   ├── Register.js            # Register model with categories
│   │   │   ├── Category.js            # Category model (soft delete)
│   │   │   ├── CashClosure.js         # Cash closing records
│   │   │   ├── Transfer.js            # Debt/transfer model
│   │   │   ├── Supplier.js            # Supplier model
│   │   │   ├── SupplierPayment.js     # Supplier payments
│   │   │   └── Settings.js            # Store settings (singleton)
│   │   │
│   │   ├── routes/                    # API routes
│   │   │   ├── userRoutes.js          # /api/users
│   │   │   ├── productRoutes.js       # /api/products
│   │   │   ├── saleRoutes.js          # /api/sales
│   │   │   ├── registerRoutes.js      # /api/registers
│   │   │   ├── categoryRoutes.js      # /api/categories
│   │   │   ├── settingsRoutes.js      # /api/settings
│   │   │   ├── supplierRoutes.js      # /api/suppliers
│   │   │   ├── transferRoutes.js      # /api/transfers
│   │   │   └── backupRoutes.js        # /api/backups
│   │   │
│   │   └── utils/                     # Utility functions
│   │       └── backup.js              # Backup/restore manager
│   │
│   ├── uploads/                       # Product images (auto-created)
│   ├── backups/                       # Database backups (auto-created)
│   │
│   ├── server.js                      # Express app entry point
│   ├── admin_cli.js                   # CLI admin tool
│   ├── migrate_mongo_to_sqlite.js     # MongoDB migration tool
│   ├── package.json                   # Backend dependencies
│   ├── .env.example                   # Environment variables template
│   └── .env                           # Actual environment variables (gitignored)
│
├── frontend/                          # React frontend application
│   ├── src/                           # Source code
│   │   ├── api/                       # API integration
│   │   │   └── axios.js               # Axios instance with interceptors
│   │   │
│   │   ├── store/                     # Zustand state stores
│   │   │   ├── authStore.js           # Authentication state
│   │   │   ├── cartStore.js           # Shopping cart state
│   │   │   └── themeStore.js          # Theme (dark/light) state
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── LoginPage.jsx          # Login screen
│   │   │   ├── LicenseExpiredPage.jsx # License expired (logged in)
│   │   │   ├── LicenseExpiredLoginPage.jsx # License expired (login)
│   │   │   ├── DashboardPage.jsx      # Main layout with sidebar
│   │   │   ├── HomePage.jsx           # Home/welcome page
│   │   │   ├── PosPage.jsx            # Point of Sale interface
│   │   │   ├── ProductsPage.jsx       # Product management
│   │   │   ├── SalesHistoryPage.jsx   # Sales history
│   │   │   ├── RegistersPage.jsx      # Register management
│   │   │   ├── CashClosurePage.jsx    # Cash register closing
│   │   │   ├── AccumulatedPage.jsx    # Accumulated totals
│   │   │   ├── CategoriesPage.jsx     # Category management
│   │   │   ├── SettingsPage.jsx       # Store settings
│   │   │   ├── SuppliersPage.jsx      # Supplier management
│   │   │   ├── UsersPage.jsx          # User management
│   │   │   ├── TransfersPage.jsx      # Debt/transfer management
│   │   │   └── BackupPage.jsx         # Database backup/restore
│   │   │
│   │   ├── utils/                     # Utility functions
│   │   │   └── formatCurrency.js      # Currency formatting
│   │   │
│   │   ├── App.jsx                    # Main app component & routing
│   │   └── main.jsx                   # React entry point
│   │
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── eslint.config.js               # ESLint configuration
│   └── .env.example                   # Frontend environment template
│
├── mcp-server/                        # MCP Server for Claude Desktop integration
│   ├── index.js                       # MCP server entry point with all tools
│   ├── package.json                   # MCP server dependencies
│   └── INSTALACION.md                 # Installation and configuration guide (Spanish)
│
├── INICIAR.bat                        # Windows launcher (installs deps, starts servers)
├── GESTIONAR_USUARIOS.bat             # Windows launcher for admin CLI
├── README.md                          # Project overview
├── CHANGELOG.md                       # Version history
├── DOCUMENTACION.md                   # Complete technical documentation (this file)
└── LICENSE                            # License file
```

---

## Backend Documentation

### Server Configuration

**Entry Point**: `server.js`

The backend is an Express.js 5 application that:

1. **Sets timezone** to `America/Bogota` (UTC-5) for consistent date handling
2. **Initializes SQLite database** connection via `database/connection.js`
3. **Configures middleware**:
   - `cors()` - Enables cross-origin requests for LAN access
   - `express.json()` - Parses JSON request bodies
   - `express.urlencoded()` - Parses URL-encoded bodies
   - Static file serving for uploads at `/uploads`
4. **Mounts route handlers** at API prefixes:
   - `/api/users` - Authentication and user management
   - `/api/products` - Product catalog
   - `/api/sales` - Sales transactions
   - `/api/registers` - Cash registers
   - `/api/categories` - Product categories
   - `/api/settings` - Store settings
   - `/api/suppliers` - Supplier management
   - `/api/transfers` - Customer debts
   - `/api/backups` - Database backups
5. **Global error handler** catches unhandled exceptions

**Server binds** to `0.0.0.0:PORT` (default 5000) to allow LAN access from other devices.

---

### Database Schema

**Database Type**: SQLite 3 (via `better-sqlite3`)  
**Location**: `backend/data/database.sqlite` (auto-created)  
**Schema File**: `backend/database/schema.sql`

#### Tables

##### `users` - User accounts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Full name |
| username | TEXT | UNIQUE NOT NULL | Login username |
| password | TEXT | NOT NULL | Bcrypt-hashed password |
| role | TEXT | NOT NULL DEFAULT 'cashier' | 'admin' or 'cashier' |
| license_expires_at | TEXT | | License expiration date (ISO string) |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

##### `categories` - Product categories
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | UNIQUE NOT NULL | Category name |
| description | TEXT | | Category description |
| default_track_stock | INTEGER | NOT NULL DEFAULT 1 | Default stock tracking for products |
| default_variable_price | INTEGER | NOT NULL DEFAULT 0 | Default variable price for products |
| is_active | INTEGER | NOT NULL DEFAULT 1 | Soft delete flag |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

##### `products` - Product catalog
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Product name |
| sku | TEXT | UNIQUE | Stock keeping unit (auto-generated if missing) |
| price | REAL | NOT NULL DEFAULT 0 | Product price |
| stock | INTEGER | NOT NULL DEFAULT 0 | Current stock quantity |
| category | TEXT | | Category name (text, not FK) |
| track_stock | INTEGER | NOT NULL DEFAULT 1 | Whether to track stock |
| variable_price | INTEGER | NOT NULL DEFAULT 0 | Whether price is variable |
| image | TEXT | | Image URL path |
| emoji | TEXT | | Emoji representation |
| position | INTEGER | NOT NULL DEFAULT 0 | Display order (drag-and-drop) |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

##### `registers` - Cash registers
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Register name |
| description | TEXT | | Register description |
| is_active | INTEGER | NOT NULL DEFAULT 1 | Active flag |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

##### `register_categories` - Register-to-category mapping (pivot table)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| register_id | INTEGER | NOT NULL, FK → registers.id | Register reference |
| category_name | TEXT | NOT NULL | Category name |

##### `sales` - Sales transactions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| register_id | INTEGER | FK → registers.id | Associated register (nullable) |
| user_id | INTEGER | FK → users.id | User who made the sale |
| total_amount | REAL | NOT NULL | Total sale amount |
| payment_method | TEXT | NOT NULL DEFAULT 'Cash' | Payment method |
| is_transfer_payment | INTEGER | NOT NULL DEFAULT 0 | Whether from transfer payment |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Sale timestamp |

##### `sale_items` - Line items per sale
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| sale_id | INTEGER | NOT NULL, FK → sales.id | Sale reference |
| product_id | INTEGER | FK → products.id | Product reference (nullable for snapshot) |
| name | TEXT | NOT NULL | Product name snapshot |
| qty | REAL | NOT NULL | Quantity sold |
| price | REAL | NOT NULL | Price at time of sale |
| category | TEXT | | Category snapshot |

##### `cash_closures` - Register closing records
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| register_id | INTEGER | NOT NULL, FK → registers.id | Register being closed |
| user_id | INTEGER | FK → users.id | User who closed |
| opening_balance | REAL | NOT NULL DEFAULT 0 | Opening cash amount |
| closing_balance | REAL | NOT NULL DEFAULT 0 | Closing cash amount |
| total_sales | REAL | NOT NULL DEFAULT 0 | Total sales during period |
| sales_count | INTEGER | NOT NULL DEFAULT 0 | Number of sales |
| notes | TEXT | | Closing notes |
| closed_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Closing timestamp |

##### `transfers` - Customer debts/layaways
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| customer_name | TEXT | NOT NULL | Customer name |
| user_id | INTEGER | FK → users.id | User who created transfer |
| total_amount | REAL | NOT NULL | Total debt amount |
| status | TEXT | NOT NULL DEFAULT 'pending' | 'pending' or 'paid' |
| paid_at | TEXT | | Payment timestamp |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

##### `transfer_items` - Line items per transfer
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| transfer_id | INTEGER | NOT NULL, FK → transfers.id | Transfer reference |
| product_id | INTEGER | FK → products.id | Product reference (nullable) |
| name | TEXT | NOT NULL | Product name snapshot |
| qty | REAL | NOT NULL | Quantity |
| price | REAL | NOT NULL | Price |
| category | TEXT | | Category snapshot |

##### `suppliers` - Supplier contacts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Supplier name |
| contact | TEXT | | Contact person |
| phone | TEXT | | Phone number |
| email | TEXT | | Email address |
| address | TEXT | | Physical address |
| notes | TEXT | | Additional notes |
| is_active | INTEGER | NOT NULL DEFAULT 1 | Active flag |
| created_at | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

##### `supplier_payments` - Payments to suppliers
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| supplier_id | INTEGER | NOT NULL, FK → suppliers.id | Supplier reference |
| register_id | INTEGER | FK → registers.id | Register used (nullable) |
| user_id | INTEGER | FK → users.id | User who made payment |
| amount | REAL | NOT NULL | Payment amount |
| description | TEXT | | Payment description |
| payment_date | TEXT | NOT NULL DEFAULT CURRENT_TIMESTAMP | Payment timestamp |

##### `settings` - Store configuration (singleton)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier (always 1) |
| store_name | TEXT | NOT NULL DEFAULT 'EcoTienda' | Store display name |
| store_logo | TEXT | | Logo data URL or path |
| logo_size | INTEGER | NOT NULL DEFAULT 80 | Logo display size in pixels |

---

### Authentication & Authorization

#### JWT Authentication

**Token Generation**:
- Tokens are created at login (`POST /api/users/login`)
- Payload contains only the user ID: `{ userId: user.id }`
- Token expiration: **30 days**
- Secret from `JWT_SECRET` environment variable (fallback: `'secret123'`)

**Token Verification** (`authMiddleware.js`):
1. Extracts `Bearer <token>` from `Authorization` header
2. Verifies token using `jwt.verify()`
3. Fetches user from database
4. Sets `req.user` with user data (id, name, username, role, license_expires_at)
5. If no token, returns 401

**License Expiration Check** (`authMiddleware.js`):
- Checks if `license_expires_at` exists and is in the past
- Returns HTTP 403 with `{ message: 'LICENSE_EXPIRED' }` if expired
- Frontend intercepts this and redirects to `/license-expired`

#### Role-Based Access Control

**Admin Middleware** (`authMiddleware.js`):
- Checks `req.user.role === 'admin'`
- Returns 403 if not admin
- Applied to sensitive routes (CRUD operations, backups, etc.)

**License Middleware** (`licenseMiddleware.js`):
- Separate middleware for explicit license checks
- Returns HTTP 403 with `{ message: 'LICENSE_EXPIRED' }` if expired

#### Password Hashing

- **Algorithm**: bcrypt
- **Salt rounds**: 10
- **Methods**:
  - `User.hashPassword(password)` - Returns hashed password
  - `User.comparePassword(password, hashedPassword)` - Returns boolean match

#### Default Users (from seed)

| Username | Password | Role |
|----------|----------|------|
| admin | admin | Admin |
| jose | 1234 | Admin |

---

### API Endpoints

#### Authentication (`/api/users`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/users/login` | No | - | Login user, returns JWT token |
| GET | `/api/users` | Yes | Admin | List all users |
| POST | `/api/users` | No | - | Register new user |
| PUT | `/api/users/:id` | Yes | Admin | Update user details |
| DELETE | `/api/users/:id` | Yes | Admin | Delete user |

**Login Request/Response**:
```json
// POST /api/users/login
{ "username": "admin", "password": "admin" }

// Response 200
{
  "_id": 1,
  "id": 1,
  "name": "Admin",
  "username": "admin",
  "role": "admin",
  "licenseExpiresAt": null,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Products (`/api/products`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/products` | No | - | List all products |
| GET | `/api/products/:id` | No | - | Get product by ID |
| POST | `/api/products` | Yes | Admin | Create product (with image upload) |
| PUT | `/api/products/:id` | Yes | Admin | Update product (with image upload) |
| DELETE | `/api/products/:id` | Yes | Admin | Delete product |
| PUT | `/api/products/reorder` | Yes | Admin | Batch update product positions |

**Create/Update Product**:
- Supports image upload via multer (jpg/jpeg/png only)
- Auto-generates SKU if not provided: `SKU-<random 8 chars>`
- Validates SKU uniqueness
- Image files stored in `uploads/` directory

**Product Response Format**:
```json
{
  "_id": 1,
  "id": 1,
  "name": "Coca Cola 600ml",
  "sku": "SKU-abc12345",
  "price": 15000,
  "stock": 50,
  "category": "Nevera",
  "trackStock": true,
  "variablePrice": false,
  "image": "/uploads/product-1234567890.jpg",
  "emoji": "🧊",
  "position": 0,
  "createdAt": "2026-04-10T15:30:00.000Z"
}
```

---

#### Sales (`/api/sales`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/sales` | Yes | Any | Create sale (decrements stock) |
| GET | `/api/sales` | Yes | Admin | List all sales with user info |
| GET | `/api/sales/:id` | Yes | Any | Get sale by ID |
| PUT | `/api/sales/:id` | Yes | Admin | Update sale (restores old stock, decrements new) |
| DELETE | `/api/sales/:id` | Yes | Admin | Delete sale (restores stock) |

**Create Sale Request**:
```json
{
  "items": [
    {
      "product": 1,
      "name": "Coca Cola 600ml",
      "qty": 2,
      "price": 15000,
      "category": "Nevera"
    }
  ],
  "totalAmount": 30000,
  "paymentMethod": "Cash",
  "register": 1
}
```

**Business Logic**:
- Stock is decremented **only** for products where `track_stock = 1`
- Sales can exist without a register (`register_id IS NULL`)
- Each sale item stores a snapshot of name, price, and category at time of sale
- Timezone handling uses Bogota (UTC-5) for date range queries

---

#### Registers (`/api/registers`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/registers` | Yes | - | List all registers with categories |
| POST | `/api/registers` | Yes | Admin | Create register with category mapping |
| PUT | `/api/registers/:id` | Yes | Admin | Update register and categories |
| DELETE | `/api/registers/:id` | Yes | Admin | Delete register |
| GET | `/api/registers/:id/summary?date=YYYY-MM-DD` | Yes | - | Get sales summary for a date |
| POST | `/api/registers/:id/close` | Yes | - | Close cash register |
| GET | `/api/registers/:id/closures` | Yes | - | Get last 30 closures for register |
| GET | `/api/registers/closures/all` | Yes | Admin | Get all closures (filterable) |
| PUT | `/api/registers/closures/:id` | Yes | Admin | Update closure |
| DELETE | `/api/registers/closures/:id` | Yes | Admin | Delete closure |
| GET | `/api/registers/accumulated` | Yes | Admin | Get accumulated totals by register |

**Register with Categories**:
```json
{
  "name": "Caja 1 - Recargas",
  "description": "Caja principal para recargas",
  "categories": ["Recargas", "Otros"]
}
```

**Cash Closure**:
```json
{
  "openingBalance": 100000,
  "closingBalance": 350000,
  "notes": "Cierre normal, sin novedades"
}
```

**Accumulated Calculation**:
```
accumulatedCash = totalClosingBalance - totalOpeningBalance - totalSupplierPayments
```

---

#### Categories (`/api/categories`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/categories` | Yes | - | List active categories |
| POST | `/api/categories` | Yes | Admin | Create category |
| PUT | `/api/categories/:id` | Yes | Admin | Update category |
| DELETE | `/api/categories/:id` | Yes | Admin | Soft delete category |

**Soft Delete**: Sets `is_active = 0` instead of actual deletion. Products in deleted categories are not affected.

---

#### Settings (`/api/settings`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/settings` | Yes | - | Get store settings |
| PUT | `/api/settings` | Yes | Admin | Update store settings |

**Singleton Pattern**: Only one settings record exists (id=1). Updates use UPSERT.

---

#### Suppliers (`/api/suppliers`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/suppliers` | Yes | - | List all suppliers |
| POST | `/api/suppliers` | Yes | Admin | Create supplier |
| PUT | `/api/suppliers/:id` | Yes | Admin | Update supplier |
| DELETE | `/api/suppliers/:id` | Yes | Admin | Delete supplier |
| POST | `/api/suppliers/:id/payment` | Yes | Admin | Record payment to supplier |
| GET | `/api/suppliers/:id/payments` | Yes | - | Get payments for supplier |
| GET | `/api/suppliers/payments/all` | Yes | Admin | Get all payments with joins |
| PUT | `/api/suppliers/payments/:id` | Yes | Admin | Update payment |
| DELETE | `/api/suppliers/payments/:id` | Yes | Admin | Delete payment |

**Supplier Payment**:
```json
{
  "amount": 500000,
  "description": "Pago mensual de productos",
  "register": 1
}
```

---

#### Transfers/Debts (`/api/transfers`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/transfers` | Yes | - | Create debt (decrements stock) |
| GET | `/api/transfers` | Yes | - | List pending transfers |
| GET | `/api/transfers/all` | Yes | Admin | List all transfers |
| PUT | `/api/transfers/:id/pay` | Yes | - | Settle debt (creates sales by register) |
| DELETE | `/api/transfers/:id` | Yes | Admin | Delete transfer (restores stock if pending) |

**Create Transfer**:
```json
{
  "customerName": "John Doe",
  "items": [
    {
      "product": 1,
      "name": "Coca Cola 600ml",
      "qty": 2,
      "price": 15000,
      "category": "Nevera"
    }
  ],
  "totalAmount": 30000
}
```

**Settle Transfer Business Logic**:
When a transfer is paid, items are **distributed across registers** based on category mapping:
1. Groups items by category
2. Finds register assigned to each category
3. Creates separate Sale records per register group
4. All sales marked with `is_transfer_payment = true`

---

#### Backups (`/api/backups`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/backups/create` | Yes | Admin | Create database backup |
| POST | `/api/backups/restore/:backupName` | Yes | Admin | Restore from backup |
| GET | `/api/backups/list` | Yes | Admin | List all backups |
| DELETE | `/api/backups/delete/:backupName` | Yes | Admin | Delete backup |

**Backup Format**:
- Backups stored in `backups/<timestamp>_<description>/`
- Contains copy of `database.sqlite` file
- `metadata.json` with timestamp, description, and file size

---

### Business Logic

#### Sales Processing

**Stock Management**:
1. When a sale is created, stock is decremented for items where product has `track_stock = 1`
2. When a sale is updated, old stock is restored first, then new stock is decremented
3. When a sale is deleted, stock is restored

**Multi-Register Sales** (POS Page):
- Frontend groups cart items by category
- Each category is mapped to a specific register
- Creates separate Sale records per register
- If category has no assigned register, uses manually selected register or first available

#### Cash Register Closing

**Workflow**:
1. Register is "opened" implicitly (no explicit open action)
2. At end of day, user closes register with:
   - Opening balance (cash at start of shift)
   - Closing balance (cash counted at end of shift)
   - Optional notes
3. System automatically calculates:
   - Total sales for the register on that date
   - Sales count
   - Timestamp of closure

**Accumulated Totals**:
- Aggregates all closures per register
- Subtracts supplier payments made from that register
- Formula: `netCash = sum(closingBalance) - sum(openingBalance) - sum(supplierPayments)`

#### Transfers (Customer Debts)

**Lifecycle**:
1. **Created**: Customer requests items on credit
   - Items recorded with snapshots
   - Stock decremented immediately
   - Status: `pending`
2. **Settled**: Customer pays the debt
   - Items distributed across registers by category
   - Separate Sale records created per register
   - All marked `is_transfer_payment = true`
   - Status: `paid`, `paid_at` timestamp set
3. **Cancelled**: Debt is voided (admin only)
   - Stock restored if still `pending`
   - Transfer record deleted

#### Product Management

**SKU Auto-Generation**:
- If SKU not provided during creation, generates `SKU-<random 8 alphanumeric chars>`
- SKU uniqueness enforced with proper error messages

**Variable Pricing**:
- Products with `variable_price = 1` prompt for price input at POS
- Price modal allows custom price entry
- Stored in sale items at the price entered

**Drag-and-Drop Ordering**:
- Products have `position` field for display order
- Frontend supports drag-and-drop reordering
- Batch update endpoint for position updates

#### Category Management

**Soft Delete**:
- Categories are never truly deleted
- `is_active` flag set to 0 on deletion
- Only active categories returned by default
- Existing products in category are unaffected

**Default Settings**:
- Categories define `default_track_stock` and `default_variable_price`
- These can be inherited by products during creation (frontend handles this)

---

### Models

All models follow a consistent pattern using `better-sqlite3` prepared statements.

**Common Pattern**:
```javascript
class Model {
  static create(data) { /* INSERT */ }
  static findById(id) { /* SELECT WHERE id = ? */ }
  static findAll(filters) { /* SELECT with optional filters */ }
  static update(id, data) { /* UPDATE WHERE id = ? */ }
  static delete(id) { /* DELETE WHERE id = ? */ }
  
  static _formatRow(row) {
    // Converts snake_case DB columns to camelCase JS objects
    // Adds both `_id` and `id` aliases for compatibility
    return { ...row, _id: row.id, id: row.id };
  }
}
```

#### Model-Specific Methods

**User**:
- `hashPassword(password)` - Bcrypt hash with 10 rounds
- `comparePassword(password, hashedPassword)` - Bcrypt comparison
- `findByUsername(username)` - Find user by username

**Product**:
- `updateStock(id, quantity)` - Increment/decrement stock
- `findByCategory(category)` - Filter by category
- `updatePositions(positions)` - Batch update positions

**Sale**:
- `findByDateRange(startDate, endDate, registerId)` - Date range query with Bogota timezone
- `createWithItems(saleData)` - Create sale with nested items in transaction

**Register**:
- `withCategories(categories)` - Manage category mappings in transaction
- `getCategories(registerId)` - Get category list for register

**Category**:
- `findAllActive()` - Only return `is_active = 1`
- `softDelete(id)` - Set `is_active = 0`

**CashClosure**:
- `findByRegisterAndDate(registerId, date)` - Find closure for specific register/date
- `findAllWithFilters({ registerId, startDate, endDate })` - Filtered query

**Transfer**:
- `findAllPending()` - Only return `status = 'pending'`
- `settle(transferId)` - Update status to 'paid' with timestamp
- `createWithItems(transferData)` - Create with nested items in transaction

**SupplierPayment**:
- `findAllWithJoins()` - Join with supplier, register, and user tables

**Settings**:
- `get()` - Fetch singleton (id=1)
- `update(data)` - Upsert singleton

---

### Controllers

Controllers handle HTTP request/response cycle, validate input, and call model methods.

**authController.js**:
- `authUser(req, res)` - Login, validate credentials, return token
- `registerUser(req, res)` - Create new user with hashed password
- `getUsers(req, res)` - List all users (without passwords)
- `updateUser(req, res)` - Update user details
- `deleteUser(req, res)` - Delete user

**productController.js**:
- `getProducts(req, res)` - List all products
- `getProductById(req, res)` - Get single product
- `createProduct(req, res)` - Create with image upload
- `updateProduct(req, res)` - Update with image upload
- `deleteProduct(req, res)` - Delete product
- `updateProductPositions(req, res)` - Batch position update

**saleController.js**:
- `createSale(req, res)` - Create sale with items, decrement stock
- `getSales(req, res)` - List sales with user info
- `getSaleById(req, res)` - Get single sale with items
- `updateSale(req, res)` - Update sale, adjust stock
- `deleteSale(req, res)` - Delete sale, restore stock

**registerController.js**:
- `getRegisters(req, res)` - List registers with categories
- `createRegister(req, res)` - Create with category mapping
- `updateRegister(req, res)` - Update with category mapping
- `deleteRegister(req, res)` - Delete register
- `getRegisterSummary(req, res)` - Sales summary for date
- `closeCashRegister(req, res)` - Create closure record
- `getRegisterClosures(req, res)` - Last 30 closures
- `getAllClosures(req, res)` - All closures with filters
- `updateClosure(req, res)` - Update closure
- `deleteClosure(req, res)` - Delete closure
- `getAccumulatedByRegister(req, res)` - Aggregated totals

**categoryController.js**:
- `getCategories(req, res)` - List active categories
- `createCategory(req, res)` - Create category
- `updateCategory(req, res)` - Update category
- `deleteCategory(req, res)` - Soft delete

**settingsController.js**:
- `getSettings(req, res)` - Get settings
- `updateSettings(req, res)` - Update settings

**supplierController.js**:
- `getSuppliers(req, res)` - List suppliers
- `createSupplier(req, res)` - Create supplier
- `updateSupplier(req, res)` - Update supplier
- `deleteSupplier(req, res)` - Delete supplier
- `makePayment(req, res)` - Record payment
- `getSupplierPayments(req, res)` - Get payments for supplier
- `getAllPayments(req, res)` - All payments with joins
- `updatePayment(req, res)` - Update payment
- `deletePayment(req, res)` - Delete payment

**transferController.js**:
- `createTransfer(req, res)` - Create debt with items, decrement stock
- `getTransfers(req, res)` - List pending transfers
- `getAllTransfers(req, res)` - List all transfers
- `settleTransfer(req, res)` - Settle debt, create sales
- `deleteTransfer(req, res)` - Delete transfer, restore stock

---

### Middleware

**authMiddleware.js**:
```javascript
// protect - Verify JWT token and set req.user
const protect = async (req, res, next) => {
  // 1. Extract Bearer token from Authorization header
  // 2. Verify token with jwt.verify()
  // 3. Fetch user from database
  // 4. Check license expiration
  // 5. Set req.user = { id, name, username, role, licenseExpiresAt }
  // 6. Call next()
}

// admin - Verify user has admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
}
```

**licenseMiddleware.js**:
```javascript
// checkLicense - Explicit license expiration check
const checkLicense = (req, res, next) => {
  // 1. Check if req.user exists
  // 2. If licenseExpiresAt is in the past, return 403
  // 3. Call next()
}
```

**uploadMiddleware.js**:
```javascript
// Multer configuration for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only accept jpg, jpeg, png
    const allowed = /jpg|jpeg|png/;
    cb(null, allowed.test(ext));
  }
});
```

---

### Utilities

**backup.js** - `BackupManager` class:

```javascript
class BackupManager {
  async createBackup(description = '') {
    // 1. Create timestamped folder in backups/
    // 2. Copy database.sqlite to folder
    // 3. Create metadata.json with timestamp, description, size
    // 4. Return metadata
  }

  async restoreBackup(backupName) {
    // 1. Close current database connection
    // 2. Copy backup database.sqlite to data/
    // 3. Re-initialize connection
  }

  async listBackups() {
    // 1. Scan backups/ directory for folders
    // 2. Read metadata.json from each
    // 3. Return sorted list with size formatting
  }

  async deleteBackup(backupName) {
    // 1. Recursively delete backup folder
  }

  formatSize(bytes) {
    // Convert bytes to human-readable (Bytes/KB/MB/GB)
  }
}
```

**formatCurrency.js** (Frontend):
- Formats numbers as Colombian Pesos (COP)
- Example: `15000` → `$15.000`

---

### CLI Tools

**admin_cli.js** - Interactive command-line admin tool:

**Launch**: `npm run admin` (from backend/) or `GESTIONAR_USUARIOS.bat`

**Menu Options**:
1. **List all users** - Shows username, name, role, license expiration
2. **Create new user** - Prompts for name, username, password, role
3. **Reset user password** - Select user, enter new password
4. **Toggle user role** - Switch between admin/cashier
5. **Set license expiration** - Set expiration date for user
6. **Delete user** - Remove user from database
7. **Exit**

---

## Frontend Documentation

### Application Structure

The frontend is a **React 19 Single Page Application (SPA)** built with Vite 7.

**Entry Point**: `main.jsx`
- Renders `<App />` component into root div
- Uses React 19 concurrent rendering

**Main App**: `App.jsx`
- Sets up React Router with `<BrowserRouter>`
- Defines all routes and protected route logic
- Applies dark mode class to `<html>` element based on theme store

---

### Routing

**Route Structure**:
```
/login                  → LoginPage (public)
/license-expired        → LicenseExpiredPage (public)
/                       → DashboardPage (protected)
  ├── /pos              → PosPage
  ├── /products         → ProductsPage
  ├── /sales            → SalesHistoryPage
  ├── /registers        → RegistersPage
  ├── /transfers        → TransfersPage
  ├── /cash-closure     → CashClosurePage
  ├── /accumulated      → AccumulatedPage
  ├── /suppliers        → SuppliersPage
  ├── /categories       → CategoriesPage
  ├── /users            → UsersPage
  ├── /settings         → SettingsPage
  └── /backups          → BackupPage
```

**Protected Routes**:
- `<ProtectedRoute>` wrapper checks for valid token
- Redirects to `/login` if no token
- Checks license expiration, shows `LicenseExpiredPage` if expired
- All routes under `/` require authentication

---

### State Management

Uses **Zustand** for global state management with `persist` middleware for localStorage.

#### authStore.js

**State**:
```javascript
{
  user: null,       // Current user object from login
  token: null,      // JWT token string
}
```

**Actions**:
- `login(user, token)` - Set user and token after successful login
- `logout()` - Clear user and token

**Persistence**: Stored in localStorage under `auth-storage` key

**Usage**:
```javascript
const { user, token, login, logout } = useAuthStore();
```

---

#### cartStore.js

**State**:
```javascript
{
  cartItems: [],  // Array of cart items
}
```

**Item Structure**:
```javascript
{
  cartItemId: string,    // Unique ID: `${productId}-${timestamp}-${random}`
  product: number,       // Product ID
  name: string,          // Product name
  price: number,         // Price at time of addition
  category: string,      // Category for register routing
  qty: number,           // Quantity
}
```

**Actions**:
- `addToCart(product)` - Add item or increment quantity if exists (matching ID AND price)
- `removeFromCart(cartItemId)` - Remove item from cart
- `updateQty(cartItemId, qty)` - Update item quantity
- `clearCart()` - Empty cart

**Key Logic**:
- Items with **same product ID but different prices** are treated as separate cart items (for variable pricing)
- Each item gets a unique `cartItemId` for precise tracking

**Usage**:
```javascript
const { cartItems, addToCart, removeFromCart, updateQty, clearCart } = useCartStore();
```

---

#### themeStore.js

**State**:
```javascript
{
  isDarkMode: false,  // Current theme state
}
```

**Actions**:
- `toggleTheme()` - Toggle between dark/light
- `setTheme(isDark)` - Explicitly set theme

**Persistence**: Stored in localStorage under `theme-storage` key

**Usage**:
```javascript
const { isDarkMode, toggleTheme } = useThemeStore();
```

**Dark Mode Implementation**:
- Zustand store persists user preference
- `App.jsx` applies `dark` class to `<html>` element via `useEffect`
- Tailwind CSS handles styling with `dark:` variants

---

### Pages & Features

#### LoginPage.jsx

**Purpose**: User authentication screen

**Features**:
- Username and password input fields
- Login form with validation
- Calls `POST /api/users/login` on submit
- On success: stores user/token in authStore, navigates to `/`
- On failure: displays error message
- Redirects to `/license-expired` if license expired

---

#### LicenseExpiredPage.jsx

**Purpose**: Display license expiration notice to logged-in users

**Features**:
- Shows expiration message
- Logout button
- Shown when `ProtectedRoute` detects expired license

---

#### LicenseExpiredLoginPage.jsx

**Purpose**: Display license expiration notice at login screen

**Features**:
- Similar to LicenseExpiredPage but for unauthenticated context
- Provides contact information for license renewal

---

#### DashboardPage.jsx

**Purpose**: Main application layout with sidebar navigation

**Features**:
- **Sidebar** with navigation menu (responsive, collapsible on mobile)
- **Header** with store logo/name and user greeting
- **Dark mode toggle** (visible in both desktop and mobile)
- **Mobile responsive**: Hamburger menu with overlay
- **Active route highlighting**: Current route highlighted in orange
- Fetches and displays store settings (logo, name)
- Logout button in sidebar

**Menu Items**:
- Inicio (Home)
- Sistema POS (POS)
- Productos (Products)
- Historial Ventas (Sales History)
- Cajas (Registers)
- Traslados / Deudas (Transfers)
- Cierre de Caja (Cash Closure)
- Proveedores (Suppliers)
- Categorías (Categories)
- Usuarios (Users)
- Configuración (Settings)
- Respaldos (Backups)

---

#### HomePage.jsx

**Purpose**: Default landing page when no route selected

**Features**:
- Simple placeholder message
- Usually shows dashboard with summary statistics

---

#### PosPage.jsx

**Purpose**: Main Point of Sale interface for processing sales

**Features**:

**Left Panel - Product Selection**:
1. **Search Bar**: Filter products by name
2. **Register Selector**: Manual override for automatic register assignment (default: "Auto")
3. **Category Filter Buttons**: Filter products by category with emoji icons
4. **Product Grid**: Responsive grid of product cards showing:
   - Product image or emoji
   - Name and category
   - Price (or "Var." for variable price products)
   - Stock count (if tracking enabled)
   - Click to add to cart

**Right Panel - Cart & Checkout**:
1. **Cart Header**: Title with icon
2. **Barcode Scanner Input**: Auto-focus input for barcode scanning (matches SKU)
3. **Cart Items List**: Each item shows:
   - Name and price × quantity
   - Quantity controls (+/- buttons, min 1)
   - Remove button (trash icon)
4. **Total Amount**: Large display of total to pay
5. **Payment Section**:
   - Amount received input field
   - Quick amount buttons (Exact, $1000, $2000, $5000, $10000, $20000, $50000)
   - Change/shortfall display (green if sufficient, red if insufficient)
6. **Checkout Button**: Disabled if cart empty, loading, or insufficient payment

**Business Logic**:
1. **Adding to Cart**:
   - Normal products: Direct add to cart
   - Variable price products: Modal prompts for custom price
2. **Barcode Scanning**:
   - Matches input against product SKU
   - Auto-adds to cart and clears input for next scan
3. **Checkout Process**:
   - Groups cart items by category
   - Maps each category to assigned register
   - Creates separate sale per register via parallel API calls
   - Clears cart on success
   - Shows success message with register count

**Responsive Design**:
- Desktop: Side-by-side layout (products | cart)
- Mobile: Stacked layout (filters → products → cart)

---

#### ProductsPage.jsx

**Purpose**: Product catalog management (CRUD)

**Features**:
- Product list/grid view with search and category filters
- Add/Edit/Delete product modals
- Image upload for products
- SKU auto-generation
- Drag-and-drop reordering
- Stock and price editing
- Variable price and stock tracking toggles

---

#### SalesHistoryPage.jsx

**Purpose**: View and manage sales history

**Features**:
- Sales list with date, user, register, and amount
- Filter by date range and register
- View sale details (items breakdown)
- Edit sale (admin only)
- Delete sale (admin only, restores stock)

---

#### RegistersPage.jsx

**Purpose**: Cash register management

**Features**:
- Register list with category assignments
- Add/Edit/Delete registers
- Category multi-select for each register
- Active/inactive toggle

---

#### CashClosurePage.jsx

**Purpose**: Daily cash register closing

**Features**:
- Select register to close
- Input opening and closing balances
- View calculated sales total and count
- Add notes
- Submit closure
- View recent closures history

---

#### AccumulatedPage.jsx

**Purpose**: View accumulated cash totals across registers

**Features**:
- Aggregated totals by register
- Formula: `accumulatedCash = totalClosingBalance - totalOpeningBalance - totalSupplierPayments`
- Date range filtering
- Supplier payment breakdown

---

#### CategoriesPage.jsx

**Purpose**: Category management

**Features**:
- Category list with active/inactive status
- Add/Edit categories
- Default stock tracking and variable price settings
- Soft delete (deactivation)

---

#### SettingsPage.jsx

**Purpose**: Store configuration

**Features**:
- Store name editing
- Logo upload (with size control)
- Singleton pattern (only one settings record)

---

#### SuppliersPage.jsx

**Purpose**: Supplier management

**Features**:
- Supplier list with contact details
- Add/Edit/Delete suppliers
- Record payments to suppliers
- View payment history
- Filter payments by supplier and date

---

#### UsersPage.jsx

**Purpose**: User management (admin only)

**Features**:
- User list with role and license info
- Add/Edit/Delete users
- Password reset
- Role toggle (admin/cashier)
- License expiration date management

---

#### TransfersPage.jsx

**Purpose**: Customer debt/layaway management

**Features**:
- Create new transfer (debt) with items
- View pending transfers
- Settle transfer (payment screen)
- Delete/cancel transfers
- Transfer history (admin view)

---

#### BackupPage.jsx

**Purpose**: Database backup and restore

**Features**:
- Create backup with description
- List all backups with size and date
- Restore from backup
- Delete backups
- Warning prompts for destructive actions

---

### API Integration

**Axios Instance** (`api/axios.js`):

**Base URL Detection**:
```javascript
const getBaseURL = () => {
  // Use explicit env var if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Auto-detect: use same hostname as frontend
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};
```

**Request Interceptor**:
- Automatically adds `Authorization: Bearer <token>` header from authStore

**Response Interceptor**:
- Handles `LICENSE_EXPIRED` → redirects to `/license-expired`
- Handles `401 Unauthorized` → logs out and redirects to `/login`

---

### UI Components

**Styling Approach**:
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Dark Mode**: Via `dark:` class on `<html>` element
- **Responsive Breakpoints**: `sm`, `md`, `lg`, `xl` for mobile-first design

**Icon Library**:
- **Lucide React** - Consistent, modern SVG icons
- Icons used: `Search`, `ShoppingCart`, `Trash2`, `Plus`, `Minus`, `ScanBarcode`, `Home`, `Package`, `DollarSign`, `LogOut`, `Settings`, `FolderTree`, `TrendingUp`, `Calculator`, `Users`, `Menu`, `X`, `UserCog`, `ClipboardList`, `Database`, `Moon`, `Sun`

**Common UI Patterns**:
- Cards with shadows for content grouping
- Modals for forms and confirmations
- Responsive grids (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`)
- Loading states with spinner/disabled buttons
- Toast-style alerts for success/error messages
- Sticky headers and footers in scrollable sections

---

## MCP Server Integration

### Overview

The **MCP (Model Context Protocol) Server** enables AI-powered interaction with the POS system through **Claude Desktop**. This integration allows users to manage sales, products, inventory, and cash registers using natural language commands via Claude AI.

**Architecture**:
```
┌─────────────────────┐
│   Claude Desktop    │
│   (AI Assistant)    │
└──────────┬──────────┘
           │ MCP Protocol (Stdio)
           ▼
┌─────────────────────┐
│   MCP Server        │
│   (index.js)        │
│   - Authentication  │
│   - Tool Handlers   │
└──────────┬──────────┘
           │ HTTP/REST API (JSON)
           ▼
┌─────────────────────┐
│   Backend API       │
│   (Express.js)      │
└─────────────────────┘
```

**Key Features**:
- **Natural Language Interface**: Ask Claude to perform POS operations in Spanish
- **Automatic Authentication**: MCP server handles login and token refresh
- **Real-time Operations**: Direct API integration with instant feedback
- **Currency Formatting**: All amounts displayed in Colombian Pesos (COP)
- **Error Handling**: Graceful error messages and token re-authentication

**Technology Stack**:
- `@modelcontextprotocol/sdk` v1.12.1 - MCP protocol implementation
- `zod` - Runtime type validation for tool parameters
- `node-fetch` v3.3.2 - HTTP client for API requests

---

### Installation

#### Prerequisites

1. **Node.js** v18 or higher installed
2. **POS Backend** running on `http://localhost:5000`
3. **Claude Desktop** installed on your system

#### Step 1: Install Dependencies

Open a terminal in the MCP server folder and run:

```bash
cd mcp-server
npm install
```

This installs the required dependencies:
- `@modelcontextprotocol/sdk` - MCP server framework
- `node-fetch` - HTTP client (for Node.js environments without native fetch)

#### Step 2: Test Manual Execution

Verify the MCP server works correctly:

```bash
cd mcp-server
node index.js
```

**Expected behavior**: The process starts and waits for input (no error messages). Press `Ctrl+C` to exit.

If you see errors, check:
- Node.js version is v18+
- Backend API is running on port 5000
- Dependencies are installed correctly

---

### Configuration

#### Step 1: Locate Claude Desktop Config

Open the Claude Desktop configuration file:

```
%APPDATA%\Claude\claude_desktop_config.json
```

**Quick access**:
1. Press `Win + R`
2. Paste: `%APPDATA%\Claude\claude_desktop_config.json`
3. Press Enter

Or navigate manually to:
```
C:\Users\YOUR_USERNAME\AppData\Roaming\Claude\claude_desktop_config.json
```

#### Step 2: Add MCP Server Configuration

Add the following configuration to the JSON file (or merge with existing config):

```json
{
  "mcpServers": {
    "pos-tienda": {
      "command": "node",
      "args": ["E:\\Pos-Tiendas-Negocios\\Pos-Tiendas-Negocios\\mcp-server\\index.js"],
      "env": {
        "POS_API_URL": "http://localhost:5000/api",
        "POS_USERNAME": "admin",
        "POS_PASSWORD": "admin"
      }
    }
  }
}
```

**Important Notes**:
- Use **double backslashes** (`\\`) in Windows paths
- If you have other MCP servers configured, only add the `"pos-tienda"` key inside the existing `mcpServers` object
- Change `POS_PASSWORD` to match your admin user's actual password

#### Step 3: Environment Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `POS_API_URL` | Base URL of the POS backend API | `http://localhost:5000/api` | No |
| `POS_USERNAME` | Username for authentication | `admin` | No |
| `POS_PASSWORD` | Password for the user | `admin` | No |

**Security Note**: Use an administrator account credentials for full access to all features.

#### Step 4: Restart Claude Desktop

1. **Completely close** Claude Desktop (check system tray)
2. **Reopen** Claude Desktop
3. The MCP server should now be available

**Verification**: In Claude Desktop, ask: *"¿Qué herramientas del POS tienes disponibles?"* - Claude should list the POS tools.

---

### Available Tools

The MCP server provides **12 tools** for POS management:

#### 1. `listar_productos` - List Products

**Description**: Lists all products available in inventory with price, stock, and category information.

**Parameters**:
- `categoria` (optional, string): Filter by category name

**Example Response**:
```
📦 **Productos (15):**

• [ID:1] 🧊 Coca Cola 600ml — $15.000 | Stock: 50 | Categoría: Nevera
• [ID:2] 📱 Recarga $5000 — $5.000 | Stock: N/A | Categoría: Recargas
```

**Usage**: Query product availability, check prices, view stock levels.

---

#### 2. `buscar_producto` - Search Product

**Description**: Searches for products by name or SKU.

**Parameters**:
- `busqueda` (required, string): Search term (product name or SKU)

**Example Response**:
```
🔍 **Resultados (2):**

• [ID:1] 🧊 Coca Cola 600ml
  SKU: SKU-abc12345 | Precio: $15.000 | Stock: 50 | Categoría: Nevera | Precio variable: No
```

**Usage**: Find specific products, verify SKU, check if price is variable.

---

#### 3. `crear_venta` - Create Sale

**Description**: Registers a new sale in the POS system. Automatically decrements product stock.

**Parameters**:
- `items` (required, array): List of sold items
  - `product` (optional, number): Product ID
  - `name` (required, string): Product name
  - `qty` (required, number): Quantity sold (min: 1)
  - `price` (required, number): Unit price (min: 0)
  - `category` (optional, string): Product category
- `totalAmount` (required, number): Total sale amount (min: 0)
- `paymentMethod` (optional, string): Payment method (default: "Cash")
- `register` (optional, number): Cash register ID

**Example Request**:
```json
{
  "items": [
    { "name": "Coca Cola 600ml", "qty": 2, "price": 15000, "category": "Nevera" }
  ],
  "totalAmount": 30000,
  "paymentMethod": "Cash"
}
```

**Example Response**:
```
✅ **Venta registrada exitosamente**

🆔 ID: 45
📅 Fecha: 10/4/2026 15:30:00
💰 Total: $30.000
💳 Pago: Cash

📋 Items:
  • Coca Cola 600ml x2 — $30.000
```

**Usage**: Record sales, process transactions, manage inventory.

---

#### 4. `historial_ventas` - Sales History

**Description**: Queries the sales history registered in the system.

**Parameters**:
- `limite` (optional, number): Maximum number of sales to show (default: 10)

**Example Response**:
```
📊 **Últimas 5 ventas:**

🧾 [ID:45] 10/4/2026 15:30:00 — $30.000 (Cash)
    • Coca Cola 600ml x2

🧾 [ID:44] 10/4/2026 14:20:00 — $5.000 (Cash)
    • Recarga $5000 x1
```

**Usage**: Review recent transactions, track sales activity.

---

#### 5. `detalle_venta` - Sale Detail

**Description**: Retrieves complete details of a specific sale by ID.

**Parameters**:
- `id` (required, number): Sale ID

**Example Response**:
```
🧾 **Detalle de Venta #45**

📅 Fecha: 10/4/2026 15:30:00
👤 Vendedor: Admin
💳 Pago: Cash
🏪 Caja: Caja 2 - Tienda

📋 Items:
  • Coca Cola 600ml x2 @ $15.000 = $30.000

💰 **Total: $30.000**
```

**Usage**: Verify specific sale details, check who made the sale, review items.

---

#### 6. `eliminar_venta` - Delete Sale

**Description**: Deletes a sale from the system and restores product stock.

**Parameters**:
- `id` (required, number): Sale ID to delete

**Example Response**:
```
🗑️ Venta #45 eliminada exitosamente. El stock de los productos ha sido restaurado.
```

**Usage**: Cancel incorrect sales, fix mistakes, restore inventory.

**Warning**: This action is irreversible. Use with caution.

---

#### 7. `listar_categorias` - List Categories

**Description**: Lists all product categories available in the system.

**Parameters**: None

**Example Response**:
```
🏷️ **Categorías (4):**

• [ID:1] Recargas ✅ — Categoría para recargas telefónicas
• [ID:2] Impresiones ✅ — Servicio de impresiones
```

**Usage**: View category structure, verify active categories.

---

#### 8. `listar_cajas` - List Cash Registers

**Description**: Lists all cash registers configured in the system.

**Parameters**: None

**Example Response**:
```
🏪 **Cajas registradoras (2):**

• [ID:1] Caja 1 - Recargas ✅ — Caja principal | Categorías: Recargas
• [ID:2] Caja 2 - Tienda ✅ — Tienda general | Categorías: Impresiones, Nevera, Otros
```

**Usage**: View register configuration, check category assignments.

---

#### 9. `resumen_caja` - Register Summary

**Description**: Retrieves sales summary for a specific cash register.

**Parameters**:
- `id` (required, number): Cash register ID

**Example Response**:
```
🏪 **Resumen de Caja #2**

💰 Total ventas: $450.000
🧾 Cantidad de ventas: 25
💵 Efectivo: $400.000
📋 Transferencias: $50.000
```

**Usage**: Check register performance, reconcile cash, review sales volume.

---

#### 10. `cerrar_caja` - Close Cash Register

**Description**: Performs cash register closing with opening and closing balance reconciliation.

**Parameters**:
- `id` (required, number): Cash register ID
- `openingBalance` (required, number): Opening balance amount
- `closingBalance` (required, number): Closing balance amount
- `notes` (optional, string): Closing notes

**Example Request**:
```json
{
  "id": 2,
  "openingBalance": 100000,
  "closingBalance": 550000,
  "notes": "Cierre normal, sin novedades"
}
```

**Example Response**:
```
✅ **Cierre de caja realizado**

🏪 Caja: #2
💵 Apertura: $100.000
💰 Cierre: $550.000
📊 Ventas totales: $450.000
🧾 Cantidad: 25 ventas
📝 Notas: Cierre normal, sin novedades
```

**Usage**: End-of-day reconciliation, cash counting, shift changes.

---

#### 11. `resumen_dia` - Daily Summary

**Description**: Generates a complete summary of all sales for the current day with totals and statistics.

**Parameters**: None

**Example Response**:
```
📊 **Resumen del día (2026-04-10)**

🧾 Ventas realizadas: 35
💰 Total del día: $850.000
💵 Efectivo: $750.000
💳 Otros métodos: $100.000

🏆 **Top 5 productos más vendidos:**
  • Coca Cola 600ml: 25 unidades — $375.000
  • Recarga $5000: 20 unidades — $100.000
  • Pan artesanal: 15 unidades — $45.000
  • Agua mineral: 12 unidades — $24.000
  • Impresión B/N: 10 unidades — $10.000
```

**Usage**: End-of-day reporting, sales analysis, performance tracking.

---

#### 12. `actualizar_stock` - Update Stock

**Description**: Updates product stock levels. Supports setting exact values or adding/subtracting from current stock.

**Parameters**:
- `producto_id` (required, number): Product ID to update
- `cantidad` (required, number): Stock quantity
- `modo` (optional, enum): Update mode
  - `"establecer"`: Set stock to exact value
  - `"sumar"`: Add to current stock (default)
  - `"restar"`: Subtract from current stock

**Example Requests**:

**Add stock**:
```json
{
  "producto_id": 1,
  "cantidad": 50,
  "modo": "sumar"
}
```

**Set exact stock**:
```json
{
  "producto_id": 1,
  "cantidad": 100,
  "modo": "establecer"
}
```

**Subtract stock**:
```json
{
  "producto_id": 1,
  "cantidad": 10,
  "modo": "restar"
}
```

**Example Response**:
```
✅ **Stock actualizado**

📦 Producto: 🧊 Coca Cola 600ml [ID:1]
📊 Stock anterior: 50
📊 Stock nuevo: 100
🔄 Acción: aumentado en +50 → 100 unidades
```

**Usage**: Restock inventory, adjust counts, fix stock discrepancies.

---

### Usage Examples

You can interact with Claude using **natural language** in Spanish. Here are common scenarios:

#### Product Management

**"Muestrame los productos disponibles"**
- Claude will call `listar_productos` and display full inventory

**"Busca el producto coca cola"**
- Claude will call `buscar_producto` with search term "coca cola"

**"Cuántas Coca Colas tenemos en stock?"**
- Claude will list products and show stock for Coca Cola

**"Actualiza el stock de coca cola, agrega 50 unidades más"**
- Claude will call `actualizar_stock` with mode "sumar" and quantity 50

**"Establece el stock del producto 5 en 100 unidades"**
- Claude will call `actualizar_stock` with mode "establecer"

---

#### Sales Processing

**"Registra una venta de 2 coca-colas a $15000 cada una y 1 pan a $3000"**
- Claude will call `crear_venta` with:
  - Items: Coca Cola x2 @ $15000, Pan x1 @ $3000
  - Total: $33000
  - Payment method: Cash

**"Vendí 3 recargas de $10000 por efectivo"**
- Claude will search for the recharge product and create sale

**"Registra una venta con tarjeta de 5 impresiones a color a $2000 cada una"**
- Claude will create sale with payment method "Card"

---

#### Sales Analysis

**"Dame el resumen de ventas de hoy"**
- Claude will call `resumen_dia` and display daily statistics

**"Cuál es el historial de las últimas 5 ventas?"**
- Claude will call `historial_ventas` with limit 5

**"Muestrame el detalle de la venta 45"**
- Claude will call `detalle_venta` with ID 45

**"Cuáles fueron los productos más vendidos hoy?"**
- Claude will call `resumen_dia` which includes top 5 products

---

#### Cash Register Management

**"Cierra la caja 1 con apertura de $50000 y cierre de $350000"**
- Claude will call `cerrar_caja` with provided balances

**"Dame el resumen de la caja 2"**
- Claude will call `resumen_caja` with ID 2

**"Cuántas cajas tengo configuradas?"**
- Claude will call `listar_cajas` and count them

---

#### Inventory Management

**"Revisa el stock de todos los productos de la categoría Nevera"**
- Claude will call `listar_productos` with category filter "Nevera"

**"Resta 5 unidades al stock del producto 10"**
- Claude will call `actualizar_stock` with mode "restar"

**"Lista todas las categorías"**
- Claude will call `listar_categorias`

---

#### Complex Queries

**"Cuánto vendí hoy en efectivo y cuál fue la venta más grande?"**
- Claude will call `resumen_dia` and analyze the results

**"Busca el producto con SKU ABC123 y dime su precio"**
- Claude will call `buscar_producto` and extract price information

**"Elimina la última venta registrada"**
- Claude will check `historial_ventas` and then call `eliminar_venta` with the latest ID

**"Cuánto dinero hay en caja 2 comparado con las ventas registradas?"**
- Claude will call `resumen_caja` and calculate differences

---

### Troubleshooting

#### MCP Server Not Appearing in Claude Desktop

**Symptoms**: Claude doesn't show POS tools when asked

**Solutions**:
1. **Verify configuration file**:
   - Open `%APPDATA%\Claude\claude_desktop_config.json`
   - Ensure JSON syntax is valid (use JSON validator)
   - Check that `"pos-tienda"` key exists in `mcpServers` object

2. **Check path format**:
   - Windows paths must use **double backslashes**: `E:\\Pos-Tiendas-Negocios\\Pos-Tiendas-Negocios\\mcp-server\\index.js`
   - Verify the path actually exists in your system

3. **Verify Node.js is in PATH**:
   - Open new terminal and run: `node --version`
   - If command not found, add Node.js to system PATH

4. **Restart Claude Desktop completely**:
   - Close from system tray (right-click → Exit)
   - Reopen Claude Desktop

---

#### Connection Errors

**Symptoms**: "Error de conexión", "Cannot connect to API"

**Solutions**:
1. **Verify backend is running**:
   - Open browser and navigate to: `http://localhost:5000/api/products`
   - Should return JSON product list (not connection error)

2. **Start backend if not running**:
   ```bash
   cd backend
   npm start
   ```
   Or run `INICIAR.bat` from project root

3. **Check POS_API_URL in config**:
   - Ensure it matches your backend URL
   - Default: `http://localhost:5000/api`
   - If backend runs on different port, update accordingly

---

#### Authentication Errors

**Symptoms**: "Login fallido", "Credenciales inválidas", "401 Unauthorized"

**Solutions**:
1. **Verify credentials in config**:
   ```json
   "env": {
     "POS_USERNAME": "admin",
     "POS_PASSWORD": "admin"
   }
   ```

2. **Test credentials manually**:
   ```bash
   curl -X POST http://localhost:5000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

3. **Reset password via CLI**:
   ```bash
   cd backend
   npm run admin
   # Select option 3: Reset user password
   ```

4. **Ensure user has admin role**:
   - Some operations require admin privileges
   - Check user role in Users page or via CLI

---

#### Manual Testing

To verify MCP server is working correctly:

```bash
cd mcp-server
node index.js
```

**Expected behavior**:
- Process starts without errors
- Waits for input (doesn't exit immediately)
- No crash messages

**To exit**: Press `Ctrl+C`

**Common errors and fixes**:

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Cannot find module '@modelcontextprotocol/sdk'` | Dependencies not installed | Run `npm install` in mcp-server folder |
| `Login fallido (401)` | Wrong credentials | Check `POS_USERNAME` and `POS_PASSWORD` in config |
| `connect ECONNREFUSED 127.0.0.1:5000` | Backend not running | Start backend with `npm start` in backend folder |
| `Unexpected token` in config | Invalid JSON in Claude config | Fix JSON syntax in `claude_desktop_config.json` |

---

#### Token Expiration Handling

The MCP server automatically handles JWT token expiration:

1. Initial login stores `authToken` in memory
2. If API returns 401 (token expired), server automatically re-authenticates
3. Retry the original request with new token
4. User doesn't need to manually re-login

**Note**: This requires the user account to remain valid (not deleted or disabled).

---

#### Performance Considerations

**Large Datasets**:
- `listar_productos` fetches ALL products; may be slow with 1000+ items
- `historial_ventas` uses `limite` parameter to control response size
- Consider adding pagination for very large datasets

**Concurrent Requests**:
- MCP server processes one request at a time (stdio protocol limitation)
- Multiple Claude requests queue sequentially
- No parallel execution

**Caching**:
- No built-in caching; each tool call makes fresh API request
- Product list, categories, and registers refetched every time
- Consider adding short-term caching for frequently accessed data

---

## Installation & Setup

### Prerequisites

- **Node.js** >= 18
- **npm** (comes with Node.js)
- **Windows** (for .bat scripts) or any OS (for manual commands)

> **No MongoDB required!** The system uses SQLite, which is included as a dependency.

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/jhonsu01/Pos-Tiendas-Negocios
cd Pos-Tiendas-Negocios
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4. Configure Environment Variables

```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your values:
```env
NODE_ENV=development
PORT=5000
DB_PATH=./data/database.sqlite
JWT_SECRET=your_secure_random_secret_here
```

#### 5. Seed Initial Data (Optional)

```bash
cd backend
npm run seed
```

This creates:
- 2 default users (admin/admin, jose/1234)
- 4 categories (Recargas, Impresiones, Nevera, Otros)
- 2 registers with category mappings
- Default settings entry

#### 6. Start the Application

**Option A: Using batch script (Windows)**:
```bash
# Double-click INICIAR.bat or run:
INICIAR.bat
```

**Option B: Manual start**:

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

#### 7. Access the Application

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend API**: `http://localhost:5000/api`

The console will display the local network IP for access from other devices.

---

## Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `5000` | No |
| `DB_PATH` | SQLite database path | `./data/database.sqlite` | No |
| `JWT_SECRET` | JWT signing secret | `your_jwt_secret_here` | **Yes** (change in production) |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | Auto-detected from hostname |

**Auto-detection Logic**:
- If `VITE_API_URL` is set, use it
- Otherwise, detect hostname from browser and construct `http://<hostname>:5000/api`
- This allows LAN access without manual configuration

### Database Configuration

**SQLite PRAGMA settings** (set automatically on connection):
- `journal_mode = WAL` - Write-Ahead Logging for better concurrency
- `foreign_keys = ON` - Enforce foreign key constraints
- `busy_timeout = 5000` - Wait 5 seconds before throwing "database is locked"

---

## Development Workflow

### Backend Development

```bash
cd backend

# Start with auto-reload (nodemon)
npm run dev

# Start without auto-reload
npm start

# Run seed script
npm run seed

# Run admin CLI
npm run admin
```

### Frontend Development

```bash
cd frontend

# Start Vite dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Style

- **Backend**: Standard Node.js conventions, async/await for async operations
- **Frontend**: React functional components with hooks, ESLint enforcement
- **Database**: Snake_case columns, camelCase in JavaScript via `_formatRow()`

---

## Deployment

### Production Build

#### Backend

```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

#### Frontend

```bash
cd frontend
npm run build
```

The build output is in `frontend/dist/`. Serve these static files from the backend Express server or a separate web server.

### Serving Frontend from Backend

Add to `server.js` after API routes:
```javascript
// Serve production frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

### Process Management

For production, use a process manager:

**PM2**:
```bash
npm install -g pm2

# Start backend
pm2 start backend/server.js --name ecotienda-api

# Start frontend (if serving separately)
pm2 start "cd frontend && npm run dev" --name ecotienda-ui

# View status
pm2 status

# View logs
pm2 logs ecotienda-api
```

### LAN Access

1. Ensure backend is running on `0.0.0.0:PORT`
2. Find your local IP address:
   - **Windows**: `ipconfig`
   - **Linux/Mac**: `ifconfig`
3. Access from other devices on same network:
   - `http://<your-ip>:5173` (frontend dev)
   - `http://<your-ip>:5000` (backend)

### Database Backups

**Manual**:
```bash
cp backend/data/database.sqlite backend/data/database_backup_$(date +%Y%m%d).sqlite
```

**Via API**:
- Use the Backup page in the application
- Or call `POST /api/backups/create` with admin token

**Automated** (cron job):
```bash
# Daily backup at 2 AM
0 2 * * * cp /path/to/backend/data/database.sqlite /path/to/backups/backup_$(date +\%Y\%m\%d).sqlite
```

---

## Troubleshooting

### Common Issues

#### "Database is locked" errors

**Cause**: Multiple processes trying to write simultaneously

**Solution**:
- Ensure only one backend instance is running
- SQLite `busy_timeout` is set to 5 seconds; increase if needed
- Close any other applications using the database file

#### "Cannot find module 'better-sqlite3'"

**Cause**: Native dependencies not compiled

**Solution**:
```bash
cd backend
npm rebuild better-sqlite3
```

If that fails, install build tools:
- **Windows**: `npm install --global windows-build-tools`
- **Linux**: `sudo apt install build-essential python3`
- **Mac**: `xcode-select --install`

#### Frontend can't connect to backend

**Symptoms**: Network errors, CORS issues

**Solution**:
1. Verify backend is running on correct port
2. Check `VITE_API_URL` environment variable
3. Ensure CORS is enabled in `server.js`
4. If on different machine, verify firewall allows port 5000

#### Login fails with "Invalid credentials"

**Solution**:
1. Run seed script to ensure default users exist:
   ```bash
   cd backend && npm run seed
   ```
2. Use admin CLI to reset password:
   ```bash
   cd backend && npm run admin
   # Select option 3: Reset user password
   ```

#### License expired message

**Solution**:
1. Use admin CLI to set new expiration date:
   ```bash
   cd backend && npm run admin
   # Select option 5: Set license expiration
   ```
2. Or update directly in database:
   ```bash
   # Using any SQLite client
   UPDATE users SET license_expires_at = '2027-04-10T00:00:00.000Z' WHERE username = 'admin';
   ```

#### Products images not loading

**Symptoms**: Broken image icons in product grid

**Solution**:
1. Verify `uploads/` directory exists in backend
2. Check file permissions
3. Ensure static file serving is configured in `server.js`:
   ```javascript
   app.use('/uploads', express.static('uploads'));
   ```

#### Port already in use

**Symptoms**: `EADDRINUSE` error on startup

**Solution**:
1. Find process using port:
   - **Windows**: `netstat -ano | findstr :5000`
   - **Linux/Mac**: `lsof -i :5000`
2. Kill the process or change port in `.env`

#### Drag and drop not working for products

**Symptoms**: Products don't reorder

**Solution**:
1. Check browser console for errors
2. Verify `PUT /api/products/reorder` endpoint is being called
3. Ensure user has admin role

### Performance Optimization

#### Large Database

**Symptoms**: Slow queries with many products/sales

**Solutions**:
1. Add indexes to frequently queried columns
2. Implement pagination for sales history
3. Archive old sales to separate table
4. Regular database maintenance (VACUUM)

```sql
-- Add indexes (run in SQLite client)
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_register_id ON sales(register_id);
CREATE INDEX idx_products_category ON products(category);
```

#### Slow Frontend

**Symptoms**: Laggy UI with many products

**Solutions**:
1. Implement virtual scrolling for product list
2. Add pagination or infinite scroll
3. Use React.memo for product cards
4. Lazy load images

### Migration from MongoDB

If you have an old MongoDB backup, use the migration tool:

```bash
cd backend
node migrate_mongo_to_sqlite.js data.json
```

**Note**: This is a one-time migration. After successful migration, you can delete the MongoDB data file.

---

## Additional Notes

### Timezone Handling

The application uses **America/Bogota (UTC-5)** timezone for all date operations:

```javascript
// Set at startup in server.js
process.env.TZ = 'America/Bogota';
```

**Date helpers** in multiple files:
- `getBogotaDateTime()` - Returns current datetime in Bogota timezone
- `getBogotaDateRange(dateStr)` - Converts date string to Bogota start/end of day
- `getBogotaToday()` - Returns start of current day in Bogota timezone

This ensures consistent date handling regardless of server timezone.

### Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production to a strong random value
2. **Default Passwords**: Change default user passwords after first login
3. **HTTPS**: Use HTTPS in production (reverse proxy with nginx/Caddy)
4. **Input Validation**: Add input validation/sanitization for all endpoints
5. **Rate Limiting**: Consider adding rate limiting for login endpoint
6. **SQL Injection**: Using parameterized queries (better-sqlite3 does this by default)

### Future Enhancements

Potential features to add:
- Multi-language support (i18n)
- Receipt generation and printing
- Barcode generation for products
- Sales reports and analytics
- Export to CSV/PDF
- Customer management
- Inventory alerts (low stock)
- Multi-store support
- Cloud backup integration
- Real-time sync across devices
- Offline mode with local storage
- Employee scheduling and attendance
- Loyalty program and discounts

---

## Version History

### v3.0 - SQLite (Current)
- Migrated from MongoDB to SQLite
- Improved performance and simpler deployment
- All existing features maintained

### v2.x - MongoDB
- Original version with MongoDB
- Required separate MongoDB installation
- Migrated to v3.0 via `migrate_mongo_to_sqlite.js`

---

## Support & Contributing

For issues, questions, or contributions:
- **Repository**: https://github.com/jhonsu01/Pos-Tiendas-Negocios
- **Issues**: GitHub Issues tab

---

**Last Updated**: April 10, 2026  
**Version**: 3.0 (SQLite)  
**License**: See LICENSE file
