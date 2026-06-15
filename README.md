# Job Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel" alt="Vercel"/>
</p>

A full-stack **job application tracking dashboard** built with Next.js 16 (App Router) and PostgreSQL. Manage, search, filter, and export your job applications — all in one place.

---

## Architecture

```mermaid
flowchart LR
    subgraph Client
        A[Navigation Bar]
        B[Dashboard Page]
        C[View All Page]
        D[Create Page]
        E[Edit Page]
        F[Job App Form]
    end

    subgraph Server
        G[Server Actions<br/>create / update / delete]
        H[API Routes<br/>applications / search / export]
        I[Cron Route<br/>update-days]
    end

    subgraph Data
        J[PostgreSQL<br/>job_applications]
        K[lib/job-applications.js]
        L[lib/postgres.js<br/>Connection Pool]
    end

    A --> C
    A --> D
    C --> H
    C --> B
    D --> F
    E --> F
    F --> G
    G --> K
    H --> K
    I --> K
    K --> L
    L --> J
```

---

## Features

- **Dashboard** — Metrics cards (total apps, unique companies, status breakdown) and a pipeline visualization
- **Full CRUD** — Create, read, update, and delete job applications via server actions
- **Search & Filter** — Search across company, role, profession, recruiter, and referral names
- **Excel Export** — One-click download of all applications as `.xlsx`
- **Referral Management** — Add up to 5 referral names per application
- **Status Tracking** — 8 statuses from Applied through to Offer Received / Rejected
- **Cron Jobs** — Automatic daily recalculation of days since applied (Vercel Cron)
- **Responsive UI** — Clean, light-themed interface with BEM-style CSS

---

## Tech Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Framework  | Next.js 16 (App Router)               |
| UI         | React 19, CSS (BEM methodology)       |
| Database   | PostgreSQL                            |
| Driver     | `pg` (node-postgres)                  |
| Export     | `xlsx` (SheetJS)                      |
| Deployment | Vercel                                |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally or remotely)

### Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Create the database
psql -U postgres -f sql/create-job-tracker-database.sql

# 3. Create the schema
psql -U postgres -d "job tracker" -f sql/create-job-applications.sql

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local with your connection string:
# DATABASE_URL=postgres://user:password@localhost:5432/job%20tracker

# 5. Run the dev server
npm run dev
```

> The schema is also auto-created on first query via `ensureJobApplicationsTable()` in `src/lib/job-applications.js`, so step 3 is optional.

### Importing CSV Data

Two import scripts are available under `scripts/`:

```bash
node scripts/import-csv.js                     # incremental import (legacy)
node scripts/import-new-data.js                # fresh import (deletes existing)
```

Update the CSV path inside the script to match your file location.

---

## Database Schema

```mermaid
erDiagram
    job_applications {
        int id PK "auto-increment"
        int s_no "sequential number"
        date application_date "required"
        text company_name "required"
        text profession_applied
        text job_title
        text industry_sector
        text source
        text job_link
        text recruiter_name
        text recruiter_contact
        text[] referral_name "PostgreSQL array"
        text application_status "default: Applied"
    }
```

| Column              | Type     | Notes                        |
| ------------------- | -------- | ---------------------------- |
| `id`                | `INT`    | Primary key, auto-increment  |
| `s_no`              | `INT`    | Sequential serial number     |
| `application_date`  | `DATE`   | Defaults to current date     |
| `company_name`      | `TEXT`   | Required                     |
| `profession_applied`| `TEXT`   | Mapped from option list      |
| `job_title`         | `TEXT`   | Mapped from option list      |
| `industry_sector`   | `TEXT`   | Mapped from option list      |
| `source`            | `TEXT`   | LinkedIn, NaukriGulf, etc.   |
| `job_link`          | `TEXT`   | Application URL              |
| `recruiter_name`    | `TEXT`   | Optional                     |
| `recruiter_contact` | `TEXT`   | Optional                     |
| `referral_name`     | `TEXT[]` | Up to 5 names, PostgreSQL array |
| `application_status`| `TEXT`   | Default: `Applied`           |

---

## Project Structure

```
├── scripts/
│   ├── import-csv.js              # Legacy CSV import
│   └── import-new-data.js         # Fresh CSV import
├── sql/
│   ├── create-job-applications.sql
│   └── create-job-tracker-database.sql
└── src/
    ├── app/
    │   ├── actions.js              # Server actions (CRUD)
    │   ├── layout.js               # Root layout
    │   ├── page.js                 # Redirects to /view-all
    │   ├── globals.css             # Global styles
    │   ├── api/
    │   │   ├── applications/route.js   # GET all applications
    │   │   ├── cron/update-days/route.js
    │   │   ├── export/excel/route.js
    │   │   └── search/route.js
    │   ├── create/page.js          # New application form
    │   ├── dashboard/page.js       # Analytics dashboard
    │   ├── edit/page.js            # Edit application
    │   └── view-all/page.js        # Full table view
    ├── components/
    │   ├── JobApplicationForm.jsx  # Reusable form component
    │   └── Navigation.jsx          # Top navigation bar
    └── lib/
        ├── form-fields.js          # Field definitions & options
        ├── job-applications.js     # Data access layer
        └── postgres.js             # pg Pool singleton
```

---

## API Reference

| Endpoint                     | Method | Description                     |
| ---------------------------- | ------ | ------------------------------- |
| `/api/applications`          | GET    | List all applications (max 100) |
| `/api/search?q=term`         | GET    | Full-text search                |
| `/api/export/excel`          | GET    | Download all apps as `.xlsx`    |
| `/api/cron/update-days`      | GET/POST | Recalculate days since applied  |

### Server Actions (form actions)

| Action                          | Description          |
| ------------------------------- | -------------------- |
| `createJobApplicationAction`    | Create application   |
| `updateJobApplicationAction`    | Update application   |
| `deleteJobApplicationAction`    | Delete application   |

---

## Deployment

The project is pre-configured for **Vercel** via `vercel.json`:

```json
{
  "framework": "nextjs",
  "crons": [
    { "path": "/api/cron/update-days", "schedule": "0 6 * * *" },
    { "path": "/api/cron/update-days", "schedule": "0 18 * * *" }
  ]
}
```

Set the `DATABASE_URL` environment variable in your Vercel project dashboard. The cron secret can be configured with `CRON_SECRET` and passed via the `Authorization: Bearer <token>` header.

---

## Environment Variables

| Variable        | Required | Description                         |
| --------------- | -------- | ----------------------------------- |
| `DATABASE_URL`  | Yes      | PostgreSQL connection string        |
| `POSTGRES_SSL`  | No       | Set to `true` for SSL connections   |
| `CRON_SECRET`   | No       | Bearer token for cron authentication |
