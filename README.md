       # WorkMate EMS — Employee Management System

A full-stack Employee Management System built with **Next.js 16** (frontend) and **Node.js / Express** (backend), backed by **MongoDB Atlas** and deployed to **Vercel**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Running Tests](#running-tests)
- [Deploying to Vercel](#deploying-to-vercel)
- [Roles & Permissions](#roles--permissions)

---

## Tech Stack

| Layer      | Technology                                                                 |
|------------|---------------------------------------------------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Shadcn UI, GSAP       |
| Backend    | Node.js, Express 4, Mongoose 8                                            |
| Database   | MongoDB Atlas                                                             |
| Auth       | JSON Web Tokens (JWT), bcryptjs                                           |
| Validation | Zod (both frontend and backend)                                           |
| Forms      | React Hook Form + `@hookform/resolvers`                                   |
| Charts     | Recharts                                                                  |
| HTTP       | Axios                                                                     |
| Testing    | Vitest + Testing Library (frontend), Jest + Supertest (backend)           |
| Deployment | Vercel (serverless for backend, Next.js for frontend)                     |

---

## Project Structure

```
EMS/
├── backend/
│   ├── api/
│   │   ├── index.js            # Vercel serverless entry point
│   │   └── [...vercel].js      # Catch-all Vercel route
│   ├── src/
│   │   ├── index.js            # Express app (local dev entry / exported for Vercel)
│   │   ├── lib/
│   │   │   ├── db.js           # MongoDB connection + Mongoose models (User, Employee)
│   │   │   ├── auth.js         # JWT helpers + requireAuth / requireRole middleware
│   │   │   └── schemas.js      # Zod validation schemas
│   │   ├── middleware/
│   │   │   └── errorHandler.js # Global error handler (Zod + generic)
│   │   └── routes/
│   │       ├── auth.js         # /api/auth/* endpoints
│   │       └── employees.js    # /api/employees/* endpoints
│   ├── tests/
│   │   └── employees.test.js
│   ├── seed-mongo.js           # Script to seed MongoDB with demo data
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Login page
    │   │   ├── layout.tsx            # Root layout
    │   │   ├── globals.css           # Global styles + Tailwind config
    │   │   ├── dashboard/            # Dashboard page (metrics, charts)
    │   │   ├── employee-list/        # Employee CRUD list page
    │   │   └── register/             # Registration page
    │   ├── components/
    │   │   ├── ui/                   # Shadcn UI base components
    │   │   └── SplitText.jsx         # GSAP text animation component
    │   ├── hooks/                    # Custom React hooks
    │   └── lib/                     # Shared utilities / API helpers
    ├── .env.example
    ├── package.json
    ├── vercel.json
    └── next.config.ts
```

---

## Features

- 🔐 **Authentication** — Register / Login with JWT; tokens stored in `localStorage`
- 👤 **Profile Management** — Edit name, phone, location, avatar; change password
- 📊 **Dashboard** — Live KPIs (total, active, inactive employees), monthly hire trend chart, recent hires list
- 👥 **Employee List** — Full CRUD (create, read, update, delete) with:
  - Search by name, email, role, or department
  - Filter by status (`Active` / `Inactive`)
  - Pagination (up to 50 per page) and multi-field sorting
- 🛡️ **Role-Based Access Control** — Three roles: `admin`, `hr`, `viewer` (see [Roles & Permissions](#roles--permissions))
- ✅ **Validation** — Zod schemas on both client and server side
- 🚀 **Vercel-ready** — Serverless-compatible backend with cached MongoDB connection

---

## API Reference

Base URL (local): `http://localhost:5000/api`

### Auth

| Method | Endpoint              | Auth? | Description               |
|--------|-----------------------|-------|---------------------------|
| `POST` | `/auth/register`      | ❌    | Create a new user account |
| `POST` | `/auth/login`         | ❌    | Login, returns JWT token  |
| `PUT`  | `/auth/profile`       | ✅    | Update profile details    |
| `PUT`  | `/auth/password`      | ✅    | Change password           |

#### `POST /auth/register` body
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "Secret1234",
  "role": "viewer"
}
```

#### `POST /auth/login` body
```json
{
  "email": "john@example.com",
  "password": "Secret1234"
}
```

---

### Employees

| Method   | Endpoint              | Auth? | Description                      |
|----------|-----------------------|-------|----------------------------------|
| `GET`    | `/employees`          | ❌    | List employees (with filters)    |
| `GET`    | `/employees/stats`    | ❌    | Dashboard statistics             |
| `GET`    | `/employees/:id`      | ❌    | Get single employee              |
| `POST`   | `/employees`          | ❌    | Create new employee              |
| `PUT`    | `/employees/:id`      | ❌    | Update employee                  |
| `DELETE` | `/employees/:id`      | ❌    | Delete employee                  |

#### `GET /employees` query parameters

| Param        | Default      | Description                                   |
|--------------|--------------|-----------------------------------------------|
| `search`     | `""`         | Search name, email, role, or department       |
| `status`     | `"All"`      | `"Active"` \| `"Inactive"` \| `"All"`         |
| `department` | `""`         | Exact department filter                       |
| `page`       | `1`          | Page number                                   |
| `limit`      | `10`         | Records per page (max 50)                     |
| `sortBy`     | `joinedDate` | `name` \| `joinedDate` \| `role` \| `status` \| `department` |
| `sortOrder`  | `desc`       | `asc` \| `desc`                               |

#### `POST /employees` body
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "role": "Frontend Developer",
  "department": "Engineering",
  "status": "Active",
  "joinedDate": "2026-01-15"
}
```

#### Health check
```
GET /api/health  →  { "status": "ok", "message": "WorkMate EMS API is running" }
```

---

## Local Development Setup

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A **MongoDB Atlas** cluster (free tier works fine) — or a local MongoDB instance

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd EMS
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create your environment file:

```bash
copy .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at **http://localhost:5000**

---

### 3. Set up the Frontend

Open a **new terminal**, then:

```bash
cd frontend
npm install
```

Create your environment file:

```bash
copy .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Required | Description                                      |
|---------------|----------|--------------------------------------------------|
| `MONGODB_URI` | ✅       | MongoDB Atlas connection string                  |
| `JWT_SECRET`  | ✅       | Secret key for signing JWTs (use a long random string) |
| `PORT`        | ❌       | Port for local dev server (default: `5000`)      |

### Frontend (`frontend/.env.local`)

| Variable               | Required | Description                       |
|------------------------|----------|-----------------------------------|
| `NEXT_PUBLIC_API_URL`  | ✅       | Base URL of the backend API       |

> **Tip:** For local dev use `http://localhost:5000/api`. For production, set this to your deployed Vercel backend URL (e.g. `https://ems-backend.vercel.app/api`).

---

## Database Seeding

To populate your MongoDB database with 10 sample employees, run from the `backend` directory:

```bash
node seed-mongo.js
```

Make sure your `backend/.env` file is configured with a valid `MONGODB_URI` before running this command.

---

## Running Tests

### Backend

```bash
cd backend
npm test
```

Uses **Jest** + **Supertest**.

### Frontend

```bash
cd frontend
npm test
```

Uses **Vitest** + **Testing Library**.

---


## Scripts Reference

### Backend

| Script        | Command            | Description                          |
|---------------|--------------------|--------------------------------------|
| `dev`         | `npm run dev`      | Start dev server with nodemon        |
| `start`       | `npm start`        | Start production server              |
| `test`        | `npm test`         | Run Jest test suite                  |
| *(seed)*      | `node seed-mongo.js` | Seed MongoDB with demo employees   |

### Frontend

| Script  | Command         | Description                       |
|---------|-----------------|-----------------------------------|
| `dev`   | `npm run dev`   | Start Next.js dev server          |
| `build` | `npm run build` | Build for production              |
| `start` | `npm start`     | Start production Next.js server   |
| `lint`  | `npm run lint`  | Run ESLint                        |
| `test`  | `npm test`      | Run Vitest test suite             |

---
