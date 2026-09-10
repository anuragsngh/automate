# ⚡ Automate - Distributed Event-Driven Workflow Platform

A full-stack, distributed, event-driven workflow automation platform built with **Next.js (App Router)**, **Express.js**, **PostgreSQL**, **Prisma ORM**, and **Apache Kafka** using the **Transactional Outbox Pattern**.

---

## 🏗️ Architecture & Flow

```mermaid
flowchart LR
    User[User / Client] -->|1. Setup Zap| UI[Next.js Frontend :3001]
    UI -->|2. Create Zap API| PB[Primary Backend :3000]
    PB -->|Stores Zap config| DB[(PostgreSQL)]

    External[External Webhook] -->|3. POST /hooks/catch/:userId/:zapId| H[Hooks Service :3002]
    H -->|4. Atomic Tx: ZapRun + ZapRunOutbox| DB

    P[Outbox Processor] -->|5. Polls ZapRunOutbox| DB
    P -->|6. Pushes Stage 0 Event| KAFKA[[Kafka: automate-events]]
    P -->|7. Deletes Outbox row| DB

    W[Worker] -->|8. Consumes Stage 0| KAFKA
    W -->|9. Executes Action & Parses {vars}| Ext[Email / Webhooks]
    W -->|10. Re-queues Stage + 1| KAFKA
```

### Microservices Breakdown

1. **`primary-backend` (Port 3000)**:
   - User authentication (`/api/v1/user/signup`, `/api/v1/user/signin`, `/api/v1/user`) with bcrypt password hashing & JWT tokens.
   - Zap workflow management (`POST /api/v1/zap`, `GET /api/v1/zap`, `GET /api/v1/zap/:zapId`, `DELETE /api/v1/zap/:zapId`).
   - Catalog endpoints for available triggers and available actions.

2. **`hooks` (Port 3002)**:
   - High-throughput public webhook ingestion service.
   - Handles `POST /hooks/catch/:userId/:zapId`.
   - Uses an atomic Prisma transaction to insert `ZapRun` (with payload metadata) and `ZapRunOutbox` to guarantee no dropped events.

3. **`processor` (Background Service)**:
   - Transactional outbox polling daemon.
   - Queries batches from `ZapRunOutbox`, publishes `{ zapRunId, stage: 0 }` to Kafka topic `automate-events`, and cleans up processed outbox records.

4. **`worker` (Kafka Consumer)**:
   - Consumes events from `automate-events`.
   - Sequentially executes actions defined by `sortingOrder`.
   - Resolves template variables like `{comment.amount}` or `{comment.email}` from trigger metadata.
   - Dispatches Email (via Nodemailer) with dynamic templating.
   - Re-queues subsequent workflow steps until completion, then commits Kafka offsets.

5. **`frontend` (Port 3001)**:
   - Modern Next.js application (App Router, TailwindCSS, Lucide icons).
   - Visual drag-and-drop / node workflow builder canvas.
   - User dashboard with 1-click webhook copying and live execution run inspection.

---

## 🚀 Quick Start Guide

### 1. Start Infrastructure (Postgres + Kafka + Zookeeper)

Run with Docker Compose:
```bash
docker compose up -d
```

*(Alternatively, you can provide any external PostgreSQL or Kafka connection string in `.env`)*

---

### 2. Install Dependencies

You can install all dependencies from the root:
```bash
npm run install:all
```

Or individually:
```bash
cd primary-backend && npm install
cd ../hooks && npm install
cd ../processor && npm install
cd ../worker && npm install
cd ../frontend && npm install
```

---

### 3. Database Migration & Seeding

Generate Prisma client, migrate schemas, and seed default triggers & actions:
```bash
# In primary-backend
cd primary-backend
npx prisma migrate dev --name init
npm run db:seed
```

*(Generate Prisma client in other packages as well)*:
```bash
cd ../hooks && npx prisma generate
cd ../processor && npx prisma generate
cd ../worker && npx prisma generate
```

---

### 4. Start the Services

Open terminal windows or tabs for each service:

| Service | Command | Port / Target |
| :--- | :--- | :--- |
| **Primary Backend** | `cd primary-backend && npm run dev` | `http://localhost:3000` |
| **Hooks Ingestion** | `cd hooks && npm run dev` | `http://localhost:3002` |
| **Outbox Processor** | `cd processor && npm run dev` | Polls DB & Kafka |
| **Event Worker** | `cd worker && npm run dev` | Consumes Kafka events |
| **Frontend UI** | `cd frontend && npm run dev` | `http://localhost:3001` |

---

## 🧪 Testing the Pipeline with Webhooks

1. Open `http://localhost:3001` in your browser.
2. Sign up and log in.
3. Click **Create Zap** and configure:
   - **Trigger**: Webhook
   - **Action 1**: Send Email (`To: {comment.email}`, `Body: Received payment confirmation of ${comment.amount}`)
4. Click **Publish Zap**.
5. Copy your Zap's Webhook URL from the dashboard (e.g. `http://localhost:3002/hooks/catch/1/<zapId>`).
6. Trigger the workflow via `curl` or Postman:

```bash
curl -X POST http://localhost:3002/hooks/catch/1/<zapId> \
  -H "Content-Type: application/json" \
  -d '{
    "comment": {
      "email": "receiver@example.com",
      "amount": "100"
    }
  }'
```

7. Observe the logs in `hooks`, `processor`, and `worker` as the message is ingested, queued, parsed, and executed!

