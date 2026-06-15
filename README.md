# Job Tracker

Next.js + Postgres app for tracking job applications from `Job Tracker(Sheet1) (1).csv`.

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local` from `.env.example`
3. Create a database named `job tracker`
4. Set the Postgres password to `root`
5. Set `DATABASE_URL` to your Postgres connection string
6. Run the app: `npm run dev`

Example:

```bash
DATABASE_URL=postgres://mohammedabulhasan:root@localhost:5432/job%20tracker
```

If your Postgres user is not `postgres`, replace it with the username shown in your client.

## Database

The app stores records in `job_applications` and the schema lives in `sql/create-job-applications.sql`.

To create the database in PostgreSQL, run `sql/create-job-tracker-database.sql` once as an admin user.

## CRUD

- Use the form on `/` to create or update an application.
- Use the `Edit` link in the table to load a row into the form.
- Use the `Delete` button in the table to remove a row from Postgres.
