
```markdown
# InventoryOS — Inventory & Warehouse Management System

InventoryOS is a full-stack inventory and warehouse management system designed to manage products, stock, customer orders, suppliers, purchase orders, and inventory across multiple warehouses.

The system provides two main interfaces: a Customer Portal for browsing products and placing orders, and a Warehouse Management Portal for managing inventory and fulfilling orders. Both interfaces work with the same centralized MySQL database through a Node.js and Express.js backend.

## Features

- Customer product browsing and ordering
- Real-time inventory availability
- Multi-warehouse inventory management
- Smart warehouse allocation for customer orders
- Stock-in and stock-out operations
- Low-stock detection
- Customer order management and fulfillment
- Inter-warehouse stock transfers
- Supplier management
- Purchase order management
- Stock movement tracking and traceability
- Transaction-based inventory updates

## System Architecture

```text
Customer Portal              Warehouse Management Portal
     React                           React
       │                               │
       └──────────────┬────────────────┘
                      │
                REST API / JSON
                      │
                      ▼
              Node.js + Express
                  Backend
                      │
                    mysql2
                      │
                      ▼
               MySQL Database
          inventory_warehouse_db
```

The frontend does not connect directly to MySQL. React communicates with the Express REST API, and the backend handles database operations using `mysql2`.

## Order Workflow

When a customer places an order:

```text
Customer places order
        ↓
POST /api/orders
        ↓
Backend validates the order
        ↓
Warehouse allocation
        ↓
Database transaction
        ↓
Create order + order items
        ↓
Update inventory
        ↓
Record stock movement
        ↓
Commit transaction
        ↓
Order appears in Warehouse Portal
```

Inventory is deducted when the order is created. When the warehouse fulfills the order, the status is updated without deducting the inventory again.

## Database

InventoryOS uses a relational MySQL database with 12 main tables:

- `users` — customers, warehouse managers, and administrators
- `warehouses` — warehouse information
- `products` — product details
- `inventory` — product quantity at each warehouse
- `suppliers` — supplier information
- `product_suppliers` — product and supplier relationships
- `orders` — customer orders
- `order_items` — products included in orders
- `purchase_orders` — supplier purchase orders
- `purchase_order_items` — products included in purchase orders
- `stock_movements` — inventory movement history
- `warehouse_transfers` — transfers between warehouses

The `inventory` table connects products and warehouses and stores the quantity available for each product at each warehouse.

The database structure is provided in `schema.sql`, and the initial project data is provided in `seed_data.sql`.

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios

### Backend
- Node.js
- Express.js
- REST APIs
- mysql2
- CORS

### Database
- MySQL
- MySQL Workbench

### Development
- Visual Studio Code
- Git
- GitHub

## Project Structure

```text
InventoryOS/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── schema.sql
├── seed_data.sql
├── .gitignore
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/bhavanakondakrindi/InventoryOS-Inventory-Warehouse-Management-System-DBMS-.git
cd InventoryOS-Inventory-Warehouse-Management-System-DBMS-
```

### 2. Set up the database

Create the MySQL database and run:

```text
schema.sql
```

Then populate the database using:

```text
seed_data.sql
```

The application uses:

```text
Database: inventory_warehouse_db
Host: 127.0.0.1
Port: 3307
```

### 3. Start the backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Then start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5001
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Testing

The system was tested for:

- Product retrieval
- Inventory operations
- Customer order creation
- Smart warehouse allocation
- Inventory updates
- Stock movement tracking
- Low-stock detection
- Warehouse transfers
- Purchase order operations
- Order status updates
- API validation
- Database connectivity
- Transaction handling

## Project Documentation

The project presentation is available in:

`DBMS PRESENTATION.pdf`

## Team

| Roll Number | Name |
|---|---|
| 2520030601 | Siri Billakanti |
| 2520030082 | Bhavana Kondakrindi |
| 2520030184 | Aniketh Pani |

**Course:** Database Systems Engineering and Distributed Backend Development

**Project:** Inventory & Warehouse Management System
```
