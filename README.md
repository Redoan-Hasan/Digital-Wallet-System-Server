# 💳 Digital Wallet System API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.11.1-339933?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express.js-5.1.0-000000?style=for-the-badge&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-8.18.2-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/code_style-ESLint-4B32C3?style=for-the-badge&logo=eslint" alt="Code Style: ESLint">
  <img src="https://img.shields.io/badge/license-ISC-lightgrey?style=for-the-badge" alt="License">
</p>

> **A secure, scalable, and feature-rich backend for a modern digital wallet application, built with Node.js, Express, and TypeScript.**

---

## 📖Table of Contents
* [Overview](#overview)
* [Project Structure](#️project-structure)
* [Key Features](#key-features)
* [Core Technologies](#️core-technologies)
* [All Dependencies](#-all-dependencies)
* [API Endpoints](#api-endpoints)
* [Setup and Installation](#️setup-and-installation)
* [Environment Variables](#environment-variables)

---

## 📝Overview

This project provides the complete backend infrastructure for a **Digital Wallet System**. It's more than just a simple API; it's a robust platform designed to handle financial transactions securely and efficiently. The system is built with a clean, modular architecture that separates concerns, making it easy to maintain and scale.

The core goal is to provide a multi-tenant environment supporting three distinct roles:
- **Users:** The primary consumers who send and receive money.
- **Agents:** Intermediaries who facilitate cash-in and cash-out operations.
- **Admins:** Superusers who oversee the health and security of the entire system.

> **Note:** All transactions are atomic and logged for traceability, ensuring data integrity and a reliable audit trail.

---

## 🏗️Project Structure

The project follows a modular, feature-first architecture to ensure a clean and scalable codebase.

```
src/
├── app/
│   ├── modules/
│   │   ├── auth/         # Handles authentication, login, token generation
│   │   ├── user/         # Handles user registration and management
│   │   ├── wallet/       # Core wallet logic (transactions, balance, etc.)
│   │   └── transaction/  # Logic for viewing transaction history
│   │   └── stats/        # Logic for admin statistics
│   ├── middlewares/      # Global middlewares (error handling, auth checks)
│   ├── config/           # Environment variable configuration
│   ├── utils/            # Reusable utility functions (JWT, QueryBuilder, etc.)
│   └── routes/           # Combines all module routes
├── app.ts                # Express app configuration
└── server.ts             # Server initialization
```

---

## ✨Key Features

### 👤 **User Features**
*   **Become an Agent:** Users can request to have their account upgraded to an `AGENT` account.
*   **Send Money:** Instantly send money to any other registered user.
*   **Add & Withdraw Money:** Add money to or withdraw money from their own wallet.
*   **View Wallet & History:** Check current wallet balance and view a paginated list of all past transactions.

### 👨‍💼 **Agent Features**
*   **Cash-In & Cash-Out:** Add money to a user's wallet (cash-in) or facilitate cash withdrawals (cash-out).
*   **Wallet & History:** View their own wallet balance and transaction history.

### 👑 **Admin Features**
*   **Agent Management:** Admins can approve pending agent requests and view all approved agents.
*   **Complete Oversight:** A dashboard-ready API to view system-wide statistics.
*   **User & Wallet Management:** View all users, and wallets, and block/unblock any user's wallet.
*   **View All Transactions:** Access a complete, auditable log of all system transactions.

---

## 🛠️Core Technologies

This project leverages a modern and powerful stack to ensure scalability, security, and maintainability.

| Technology | Purpose | Why it's a good choice |
| :--- | :--- | :--- |
| **Node.js & Express.js** | Backend Framework | Provides a high-performance, non-blocking I/O model perfect for handling many concurrent financial transactions efficiently. |
| **MongoDB & Mongoose** | Database & ODM | Offers a flexible, schema-less design that is easy to scale. Mongoose provides robust validation and business logic hooks. |
| **TypeScript** | Language | Ensures code quality and developer productivity by adding static types, which helps prevent common bugs in a financial application. |
| **JWT & bcryptjs** | Security | Implements a strong security foundation. JWT provides stateless authentication, and bcryptjs ensures that user credentials are securely hashed. |
| **Zod** | Validation | Provides a simple and powerful way to enforce data validation at the runtime level, ensuring data integrity before it hits the database. |

---

## 📦All Dependencies

### Production Dependencies
| Package | Version | Description |
| :--- | :--- | :--- |
| `bcryptjs` | `^3.0.2` | For securely hashing user passwords and PINs. |
| `cookie-parser`| `^1.4.7` | Middleware to parse `Cookie` header and populate `req.cookies`. |
| `cors` | `^2.8.5` | Middleware to enable Cross-Origin Resource Sharing. |
| `dotenv` | `^17.2.2` | Loads environment variables from a `.env` file. |
| `express` | `^5.1.0` | Fast, unopinionated, minimalist web framework for Node.js. |
| `http-status-codes` | `^2.3.0` | Constants for HTTP status codes. |
| `jsonwebtoken` | `^9.0.2` | For generating and verifying JSON Web Tokens. |
| `mongoose` | `^8.18.2` | Elegant MongoDB object modeling for Node.js. |
| `zod` | `^4.1.11` | TypeScript-first schema declaration and validation library. |

### Development Dependencies
| Package | Version | Description |
| :--- | :--- | :--- |
| `@eslint/js` | `^9.36.0` | Core ESLint rules. |
| `@types/cookie-parser` | `^1.4.9` | TypeScript definitions for `cookie-parser`. |
| `@types/cors` | `^2.8.19` | TypeScript definitions for `cors`. |
| `@types/dotenv` | `^6.1.1` | TypeScript definitions for `dotenv`. |
| `@types/express` | `^5.0.3` | TypeScript definitions for `express`. |
| `@types/jsonwebtoken` | `^9.0.10`| TypeScript definitions for `jsonwebtoken`. |
| `eslint` | `^9.36.0` | For identifying and reporting on patterns in JavaScript. |
| `ts-node-dev` | `^2.0.0` | Compiles TypeScript and restarts the node process on file changes. |
| `typescript` | `^5.9.2` | Superset of JavaScript that adds static types. |
| `typescript-eslint` | `^8.44.1` | ESLint plugin for TypeScript. |

---

## 🚀API Endpoints

Here is a summary of the available API endpoints.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/user/register` | Register a new user or agent. | Public |
| `POST` | `/api/v1/auth/login` | Log in to the system. | Public |
| `GET` | `/api/v1/user` | Get all users. | `ADMIN` |
| `GET` | `/api/v1/user/all-pending-agents` | Get all users with pending agent requests. | `ADMIN` |
| `GET` | `/api/v1/user/all-approved-agents`| Get all approved agents. | `ADMIN` |
| `PATCH`| `/api/v1/user/make-me-agent` | Request to become an agent. | `USER` |
| `PATCH`| `/api/v1/user/make-agent/:id` | Approve a user's agent request. | `ADMIN` |
| `PATCH`| `/api/v1/user/:id` | Update user status (block/unblock, approve/suspend). | `ADMIN` |
| `POST` | `/api/v1/wallet/add-money` | Add money to your own wallet. | `USER`, `AGENT` |
| `POST` | `/api/v1/wallet/withdraw-money` | Withdraw money from your own wallet. | `USER`, `AGENT` |
| `POST` | `/api/v1/wallet/send-money` | Send money to another user. | `USER` |
| `POST` | `/api/v1/wallet/cash-in-money` | Add money to a user's wallet. | `AGENT` |
| `POST` | `/api/v1/wallet/cash-out-money`| Facilitate a cash withdrawal for a user. | `AGENT` |
| `GET` | `/api/v1/wallet/my-wallet` | Get your own wallet details. | `USER`, `AGENT` |
| `GET` | `/api/v1/wallet/get-all-wallets`| Get all wallets in the system. | `ADMIN` |
| `GET` | `/api/v1/transaction/get-my-transactions` | Get your own transaction history. | `USER`, `AGENT` |
| `GET` | `/api/v1/transaction/get-all-transactions` | Get all transactions in the system. | `ADMIN` |
| `GET` | `/api/v1/stats/user` | Get statistics about users. | `ADMIN` |
| `GET` | `/api/v1/stats/transaction` | Get statistics about transactions. | `ADMIN` |

---

## ⚙️Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/digital-wallet-system-server.git
    cd digital-wallet-system-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the root of the project and add the environment variables (see below).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server will start on the port specified in your `.env` file.

---

## 🔑Environment Variables

Create a `.env` file in the project root and add the following variables.

```env
# Port for the server to run on
PORT=5000

# Your MongoDB connection string
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/digital-wallet

# JWT secrets and expiration times
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_REFRESH_TOKEN_EXPIRES_IN=30d

# Bcrypt salt rounds for hashing
BCRYPT_SALT_ROUNDS=12

# Default Admin Credentials (for initial seeding)
DEFAULT_ADMIN_EMAIL=admin@wallet.com
DEFAULT_ADMIN_PASSWORD=adminpass
DEFAULT_ADMIN_PIN=1234
```