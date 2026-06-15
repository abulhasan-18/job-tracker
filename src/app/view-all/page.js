"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

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

  // Handle YYYY-MM-DD string format
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    // Create a date at noon UTC to avoid timezone issues
    const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
    return dateFormatter.format(date);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return dateFormatter.format(date);
}

function formatDays(applicationDateStr) {
  if (isMissing(applicationDateStr)) {
    return "—";
  }

  // Parse YYYY-MM-DD format
  if (typeof applicationDateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(applicationDateStr)) {
    const [year, month, day] = applicationDateStr.split("-");
    const appDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    
    // Get today's date in UTC
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    // Calculate days difference
    const diff = Math.floor((todayUTC.getTime() - appDate.getTime()) / 86400000);
    return `${Math.max(0, diff)}d`;
  }

  return "—";
}

function statusClass(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized.includes("offer")) return "status-pill status-pill--success";
  if (normalized.includes("interview")) return "status-pill status-pill--info";
  if (normalized.includes("reject")) return "status-pill status-pill--danger";
  return "status-pill status-pill--neutral";
}

export default function ViewAll() {
  const [applications, setApplications] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/applications");
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to read the database.");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // Filter applications based on search term
  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Check if any referral name matches (referral_name is now text[] array)
    const referralMatch = Array.isArray(app.referral_name)
      ? app.referral_name.some(name => name?.toLowerCase().includes(searchLower))
      : app.referral_name?.toLowerCase().includes(searchLower);
    
    return (
      (app.company_name?.toLowerCase().includes(searchLower)) ||
      (app.profession_applied?.toLowerCase().includes(searchLower)) ||
      (app.job_title?.toLowerCase().includes(searchLower)) ||
      (app.recruiter_name?.toLowerCase().includes(searchLower)) ||
      referralMatch
    );
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const idA = a.id || 0;
    const idB = b.id || 0;
    return sortOrder === "asc" ? idA - idB : idB - idA;
  });

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="app-shell">
          <section className="dashboard-header-section">
            <h1 className="page-title">All Applications</h1>
          </section>
          <section className="panel panel--alert">
            <p>Loading...</p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="app-shell">
        <section className="dashboard-header-section">
          <div>
            <h1 className="page-title">All Applications</h1>
            <p className="page-subtitle">
              View and manage {filteredApplications.length === applications.length 
                ? applications.length 
                : `${filteredApplications.length} of ${applications.length}`} job applications
            </p>
          </div>
          <div className="header-actions-group">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="button button--secondary"
            >
              {sortOrder === "asc" ? "# Lowest First (ASC)" : "# Highest First (DESC)"}
            </button>
            <a href="/api/export/excel" className="button button--secondary">
              📥 Download Excel
            </a>
            <Link href="/create" className="button button--primary">
              + New Application
            </Link>
          </div>
        </section>

        {/* Search Bar */}
        <section className="panel" style={{ marginBottom: "0.5rem" }}>
          <input
            type="text"
            placeholder="🔍 Search by Company, Position, Recruiter, or Referral..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              margin: 0,
            }}
          />
        </section>

        {error ? (
          <section className="panel panel--alert">
            <p className="eyebrow">Database Error</p>
            <h2>Unable to load applications</h2>
            <p>{error}</p>
          </section>
        ) : (
          <section className="panel panel--table">
            <div className="table-wrap">
              <table className="applications-table">
                <thead>
                  <tr>
                     <th>ID</th>
                     <th>Company</th>
                     <th>Role</th>
                     <th>Profession</th>
                     <th>Sector</th>
                     <th>Status</th>
                     <th>Source</th>
                     <th>Applied</th>
                     <th>Days</th>
                     <th>Recruiter</th>
                     <th>Referral</th>
                     <th>Link</th>
                     <th>Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sortedApplications.length > 0 ? (
                     sortedApplications.map((application) => (
                       <tr key={application.id}>
                         <td className="table-cell-number">{formatText(application.id)}</td>
                         <td className="table-cell-company">
                           <strong>{formatText(application.company_name)}</strong>
                         </td>
                         <td>{formatText(application.job_title)}</td>
                         <td>{formatText(application.profession_applied)}</td>
                         <td>{formatText(application.industry_sector)}</td>
                         <td>
                           <span className={statusClass(application.application_status)}>
                             {formatText(application.application_status)}
                           </span>
                         </td>
                         <td>{formatText(application.source)}</td>
                         <td className="table-cell-date">{formatDate(application.application_date)}</td>
                         <td className="table-cell-number">{formatDays(application.application_date)}</td>
                         <td>
                           <div className="table-cell-recruiter">
                             <strong>{formatText(application.recruiter_name)}</strong>
                             {!isMissing(application.recruiter_contact) ? (
                               <span className="table-subtext">{formatText(application.recruiter_contact)}</span>
                             ) : null}
                           </div>
                         </td>
                         <td>
                           {(() => {
                             let referralNames = [];
                             try {
                               if (application.referral_name) {
                                 // Handle PostgreSQL text[] array
                                 if (Array.isArray(application.referral_name)) {
                                   referralNames = application.referral_name.filter(name => name && String(name).trim() !== "");
                                 } else {
                                   // Handle legacy JSON array string
                                   const trimmed = String(application.referral_name).trim();
                                   if (trimmed.startsWith("[")) {
                                     const parsed = JSON.parse(trimmed);
                                     referralNames = Array.isArray(parsed) 
                                       ? parsed.filter(name => name && String(name).trim() !== "")
                                       : [];
                                   } else if (trimmed !== "") {
                                     // Plain text value
                                     referralNames = [trimmed];
                                   }
                                 }
                               }
                             } catch (err) {
                               console.error("Error parsing referral names:", err);
                             }
                             return referralNames.length > 0 ? referralNames.join(", ") : "—";
                           })()}
                         </td>
                         <td>
                           {isMissing(application.job_link) ? (
                             "—"
                           ) : (
                             <a href={application.job_link} target="_blank" rel="noreferrer" className="link-button">
                               Open
                             </a>
                           )}
                         </td>
                         <td>
                           <Link
                            href={`/edit?id=${encodeURIComponent(application.id)}`}
                            className="button button--ghost button--compact"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13}>
                        <div className="empty-state">
                          <h3>No applications yet</h3>
                          <p>Start adding job applications to track your progress.</p>
                          <Link href="/create" className="button button--primary">
                            + Create First Application
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
