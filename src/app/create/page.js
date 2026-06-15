import Link from "next/link";
import Navigation from "@/components/Navigation";
import JobApplicationForm from "@/components/JobApplicationForm";
import { createJobApplicationAction } from "@/app/actions";

export const runtime = "nodejs";

export default async function CreateApplication() {
  return (
    <>
      <Navigation />
      <main className="app-shell">
        <div className="page-header">
          <Link href="/" className="button button--ghost">
            ← Back
          </Link>
          <div>
            <h1 className="page-title">New Application</h1>
            <p className="page-subtitle">Add a new job application to your tracker</p>
          </div>
        </div>

        <section className="panel panel--form panel--form-full">
          <JobApplicationForm
            action={createJobApplicationAction}
            submitLabel="Create Application"
            cancelHref="/"
          />
        </section>
      </main>
    </>
  );
}
