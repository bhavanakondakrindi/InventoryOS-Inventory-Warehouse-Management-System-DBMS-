
```markdown
# InventoryOS — Inventory & Warehouse Management System

InventoryOS is a full-stack inventory and warehouse management system built for managing products, stock, customer orders, suppliers, purchase orders, and inventory across multiple warehouses.

The system has two main interfaces: a Customer Portal for browsing products and placing orders, and a Warehouse Management Portal for managing inventory and fulfilling orders. Both interfaces use the same backend and centralized MySQL database.

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
- Stock movement history and traceability
- Transaction-based inventory updates

## How It Works

The application follows a simple three-layer architecture:

```text
React Frontend
      |
      | REST API / JSON
      ↓
Node.js + Express Backend
      |
      | mysql2
      ↓
MySQL Database
```

The Customer Portal and Warehouse Management Portal both communicate with the Express backend. The backend handles business logic and database operations, while MySQL stores the centralized application data.

When a customer places an order, the backend checks which warehouse can fulfill the complete order, creates the order, updates the inventory, and records the stock movement within a database transaction.

## Database

The project uses MySQL with 12 main tables:

- `users`
- `warehouses`
- `products`
- `inventory`
- `suppliers`
- `product_suppliers`
- `orders`
- `order_items`
- `purchase_orders`
- `purchase_order_items`
- `stock_movements`
- `warehouse_transfers`

The `inventory` table connects products and warehouses and stores the quantity available for each product at each warehouse.

The database structure is available in `schema.sql`, while `seed_data.sql` contains the initial project data.

## Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios

**Backend**
- Node.js
- Express.js
- REST APIs
- mysql2
- CORS

**Database**
- MySQL
- MySQL Workbench

**Tools**
- Visual Studio Code
- Git
- GitHub

## Project Structure

```text
InventoryOS/
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

### 2. Set up MySQL

Create the database and run:

```text
schema.sql
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

Create a `.env` file based on `.env.example`, then start the server:

```bash
npm start
```

Backend:

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

Frontend:

```text
http://localhost:5173
```

## Testing

The system has been tested for product retrieval, inventory operations, customer order creation, warehouse allocation, stock movement tracking, low-stock detection, warehouse transfers, purchase orders, order status updates, API validation, database connectivity, and transaction handling.

## Project Documentation

The DBMS project presentation is included in:

`DBMS PRESENTATION.pdf`

## Team

| Roll Number | Name |
|---|---|
| 2520030601 | Siri Billakanti |
| 2520030082 | Bhavana Kondakrindi |
| 2520030184 | Aniketh Pani |

## Future Enhancements

- Barcode-based product scanning
- Advanced inventory analytics
- Role-based authentication
- Automated purchase order generation
- Enhanced reporting
- Cloud deployment

**Course:** Database Systems Engineering and Distributed Backend Development

**Project:** Inventory & Warehouse Management System
```
