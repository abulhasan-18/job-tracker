import Link from "next/link";
import Navigation from "@/components/Navigation";
import { listJobApplications } from "@/lib/job-applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function isMissing(value) {
  return value === null || value === undefined || value === "" || value === "�";
}

function formatText(value) {
  return isMissing(value) ? "—" : String(value);
}

function formatDate(value) {
  if (isMissing(value)) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return dateFormatter.format(date);
}

function formatDays(value) {
  if (isMissing(value)) {
    return "—";
  }

  const number = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${number}d`;
}

function statusClass(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized.includes("offer")) return "status-pill status-pill--success";
  if (normalized.includes("interview")) return "status-pill status-pill--info";
  if (normalized.includes("reject")) return "status-pill status-pill--danger";
  return "status-pill status-pill--neutral";
}

function getStatusBucket(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized.includes("offer")) return "offer";
  if (normalized.includes("interview")) return "interview";
  if (normalized.includes("reject")) return "rejected";
  if (normalized.includes("applied") || normalized === "") return "applied";

  return "other";
}

function summarizeStatuses(applications) {
  return applications.reduce(
    (summary, application) => {
      summary[getStatusBucket(application.application_status)] += 1;
      return summary;
    },
    {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      other: 0,
    },
  );
}

export default async function Dashboard() {
  let applications = [];
  let error = null;

  try {
    applications = await listJobApplications(25);
  } catch (dbError) {
    error = dbError instanceof Error ? dbError.message : "Unable to read the database.";
  }

  const totalApplications = applications.length;
  const uniqueCompanies = new Set(
    applications.map((application) => application.company_name).filter(Boolean),
  ).size;
  const statusSummary = summarizeStatuses(applications);
  const maxStatusCount = Math.max(1, ...Object.values(statusSummary));

  return (
    <>
      <Navigation />
      <main className="app-shell">
        <section className="dashboard-header-section">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your job applications</p>
          </div>
          <Link href="/create" className="button button--primary">
            + New Application
          </Link>
        </section>

        {error ? (
          <section className="panel panel--alert">
            <p className="eyebrow">Database connection</p>
            <h2>Connection Error</h2>
            <p>{error}</p>
          </section>
        ) : null}

        <section className="metric-grid">
          <article className="metric-card">
            <p className="metric-label">Total Applications</p>
            <p className="metric-value">{totalApplications}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Companies</p>
            <p className="metric-value">{uniqueCompanies}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Applied</p>
            <p className="metric-value">{statusSummary.applied}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Offers</p>
            <p className="metric-value">{statusSummary.offer}</p>
          </article>
        </section>

        <section className="panel panel--pipeline">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2>Status distribution</h2>
            </div>
          </div>

          <div className="pipeline-list">
            {[
              { key: "applied", label: "Applied", note: "Awaiting response" },
              { key: "interview", label: "Interview", note: "In discussion" },
              { key: "offer", label: "Offer", note: "Positive outcome" },
              { key: "rejected", label: "Rejected", note: "Closed or declined" },
              { key: "other", label: "Other", note: "Custom status" },
            ].map((item) => {
              const count = statusSummary[item.key];
              const width = Math.max(8, Math.round((count / maxStatusCount) * 100));

              return (
                <div key={item.key} className="pipeline-item">
                  <div className="pipeline-item__header">
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </div>
                    <span className="pipeline-count">{count}</span>
                  </div>
                  <div className="pipeline-track" aria-hidden="true">
                    <span className={`pipeline-fill pipeline-fill--${item.key}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
