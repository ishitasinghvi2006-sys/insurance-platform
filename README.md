# Insurance Management Platform

A full-stack, enterprise-style web application for digitizing and managing insurance operations — built as an internship project to demonstrate real-world software development practices used in the insurance and financial services industry.

---

## Introduction

The Insurance Management Platform is a comprehensive web-based application designed to simplify and digitize the management of insurance operations. It enables insurance companies, agents, and customers to manage policies, claims, premium payments, and related documents from a single centralized platform.

Traditional insurance processes often involve manual paperwork, lengthy approval cycles, and difficulty tracking customer policies. This project automates those workflows by providing a secure, role-based, and user-friendly system for managing customers, insurance policies, claim requests, premium payments, and business reporting — end to end.

The application models the complete lifecycle of an insurance policy: an administrator or agent registers a customer and issues a policy; the customer logs in to view their policy, pay premiums, upload documents, and submit claims; agents review and verify submitted claims, approving or rejecting them; and administrators monitor overall business performance through an interactive reports dashboard.

This project was built to gain hands-on, practical experience with the concepts used in real enterprise software: role-based authentication, workflow-driven systems, secure file handling, relational database design, REST API development, and full-stack deployment — closely mirroring what a junior developer would encounter working on production insurance or fintech software.

---

## Key Features

- **Role-based authentication** — separate access levels for Admin, Agent, and Customer, enforced on both the backend (JWT + middleware) and frontend (protected routes)
- **Customer management** — create, view, search, and update customer records with pagination
- **Policy management** — issue new policies, track status (active / expired / cancelled), renew and cancel policies
- **Premium tracking** — record and view a full payment history per policy
- **Claim management** — customers submit claims on active policies; agents/admins review, approve, or reject them
- **Document management** — upload and download supporting documents (ID proofs, claim evidence) with file-type and size restrictions
- **Reports dashboard** — visual insights into policy status, claims breakdown, and premium collection trends using Chart.js
- **Search, filters & pagination** — across customers, policies, and claims
- **Input validation & error handling** — schema-based validation (Zod) on every write endpoint, with a global error handler and toast notifications on the frontend
- **Secure by design** — hashed passwords (bcrypt), signed JWTs, and ownership checks so customers can only access their own data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Charts | Chart.js (react-chartjs-2) |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| File Upload | Multer |
| Validation | Zod |
| Version Control | Git & GitHub |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## Live Demo

- **Frontend:** [https://insurance-platform-pied.vercel.app](https://insurance-platform-pied.vercel.app)
- **Backend API:** [https://insurance-platform-2m26.onrender.com](https://insurance-platform-2m26.onrender.com)

> **Note:** Both the backend (Render) and database (Neon) run on free tiers, which sleep after a period of inactivity. The first request after idle time may take 30–50 seconds while the services "wake up" — this is expected behavior, not a bug.

---

## User Roles & Responsibilities

### Administrator
- Manage employees and customers
- Create and oversee insurance policies
- Assign and monitor claims
- Access the full reports dashboard
- Manage system-wide settings

### Insurance Agent
- Register customers
- Create and update policies
- Verify customer documents
- Review, approve, or reject claims

### Customer
- Register and log in
- View their own policies
- Download policy documents
- Pay premiums and track payment history
- Submit claims and track claim status

---

## Project Modules

1. **Customer Management** — register, view, edit, search, and list customers
2. **Policy Management** — create, view, renew, and cancel insurance policies
3. **Claim Management** — submit claims, upload supporting documents, verify, and approve/reject
4. **Premium Tracking** — record payments, view history, track payment status
5. **Document Management** — upload, view, and download identity and policy documents
6. **Reports Dashboard** — active/expired policies, claim statistics, premium collection, customer growth

---

## Database Schema (Overview)

| Table | Key Fields |
|---|---|
| `User` | id, name, email, password, role |
| `Customer` | id, name, dob, phone, address, email |
| `Policy` | id, customerId, policyType, policyNumber, premiumAmount, startDate, endDate, status |
| `Claim` | id, policyId, claimAmount, reason, status, submissionDate |
| `PremiumPayment` | id, policyId, paymentDate, amount, paymentStatus |
| `Document` | id, customerId, fileName, filePath, uploadedAt |

Schema is managed via Prisma (`backend/prisma/schema.prisma`) with relational foreign keys linking Customers → Policies → Claims/Payments, and Customers → Documents.

---

## API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT | Public |
| POST | `/api/customers` | Create a customer | Admin, Agent |
| GET | `/api/customers` | List/search customers (paginated) | Admin, Agent |
| GET | `/api/customers/:id` | Get customer profile | Admin, Agent |
| PUT | `/api/customers/:id` | Update customer | Admin, Agent |
| DELETE | `/api/customers/:id` | Delete customer | Admin |
| POST | `/api/policies` | Create a policy | Admin, Agent |
| GET | `/api/policies` | List/search/filter policies (paginated) | Admin, Agent |
| GET | `/api/policies/:id` | Get policy details | Admin, Agent, Customer (own only) |
| PUT | `/api/policies/:id` | Update/renew a policy | Admin, Agent |
| PUT | `/api/policies/:id/cancel` | Cancel a policy | Admin, Agent |
| POST | `/api/policies/:policyId/payments` | Record a premium payment | Admin, Agent, Customer |
| GET | `/api/policies/:policyId/payments` | View payment history | Admin, Agent, Customer |
| GET | `/api/overdue` | List overdue/pending payments | Admin, Agent |
| POST | `/api/policies/:policyId/claims` | Submit a claim | Admin, Agent, Customer |
| GET | `/api/claims` | List/filter all claims (paginated) | Admin, Agent |
| GET | `/api/claims/:id` | Get claim details | Admin, Agent, Customer |
| PUT | `/api/claims/:id/status` | Approve/reject a claim | Admin, Agent |
| POST | `/api/customers/:customerId/documents` | Upload a document | Admin, Agent, Customer |
| GET | `/api/customers/:customerId/documents` | List documents | Admin, Agent, Customer |
| GET | `/api/documents/:id/download` | Download a document | Admin, Agent, Customer |
| DELETE | `/api/documents/:id` | Delete a document | Admin, Agent |
| GET | `/api/reports/policies-summary` | Policy status breakdown | Admin |
| GET | `/api/reports/claims-stats` | Claims status breakdown | Admin |
| GET | `/api/reports/premium-collection` | Monthly premium totals | Admin |
| GET | `/api/reports/customer-growth` | Total customer count | Admin |

---

## Local Setup Instructions

### Prerequisites
- Node.js (LTS version)
- A PostgreSQL database (local or a free instance on [Neon](https://neon.tech))
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/insurance-platform.git
cd insurance-platform
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_long_random_secret_string"
PORT=5000
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start the backend server:
```bash
npm run dev
```
The API will run at `http://localhost:5000`.

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` with:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
```
The app will run at `http://localhost:5173`.

### 4. Create your first user
Since there's no public sign-up flow beyond the API, register your first admin user via a tool like Thunder Client or Postman:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "yourpassword",
  "role": "admin"
}
```
Then log in through the app UI with those credentials.

---

## Deployment

- **Backend** is deployed on [Render](https://render.com) as a Web Service, with `DATABASE_URL` and `JWT_SECRET` set as environment variables.
- **Frontend** is deployed on [Vercel](https://vercel.com), with `VITE_API_URL` pointed at the live Render backend URL.
- **Database** is hosted on [Neon](https://neon.tech), a serverless PostgreSQL provider.

---

## Learning Outcomes

Building this project provided hands-on experience with:

- React.js component architecture and Context API for state management
- Building secure REST APIs with Express.js
- JWT-based authentication and role-based authorization
- Relational database design and schema modeling with Prisma ORM
- Handling file uploads securely with Multer
- Search, filtering, and pagination patterns
- Dashboard and data visualization development with Chart.js
- Centralized validation and error handling (Zod + Express middleware)
- Full-stack deployment across separate frontend/backend/database providers
- Debugging real-world issues: environment configuration, CORS, database connectivity, authentication flows, and dependency version mismatches

---

## Future Enhancements

- Email notifications for premium due dates
- SMS reminders (mock implementation)
- QR code–based policy verification
- OCR for extracting details from uploaded documents
- Advanced admin analytics filters
- Multi-language support and dark mode
- Export reports to PDF/Excel
- Audit logs for policy and claim changes

---

## Author

Built as an internship project — Insurance Management Platform.