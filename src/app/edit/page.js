import Link from "next/link";
import Navigation from "@/components/Navigation";
import JobApplicationForm from "@/components/JobApplicationForm";
import { updateJobApplicationAction } from "@/app/actions";
import { getJobApplicationById } from "@/lib/job-applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditApplication({ searchParams }) {
  const resolvedParams = await searchParams;
  const id = resolvedParams?.id;

  let application = null;
  let error = null;

  if (!id || !/^\d+$/.test(id)) {
    error = "Invalid application ID";
  } else {
    try {
      console.log(`[EDIT PAGE] Fetching application with id: ${id}`);
      application = await getJobApplicationById(id);
      console.log(`[EDIT PAGE] Result:`, application);
      if (!application) {
        error = "Application not found";
      }
    } catch (err) {
      console.error(`[EDIT PAGE] Error fetching application:`, err);
      error = err instanceof Error ? err.message : "Failed to load application";
    }
  }

  return (
    <>
      <Navigation />
      <main className="app-shell">
        <div className="page-header">
          <Link href="/view-all" className="button button--ghost">
            ← Back
          </Link>
          <div>
            <h1 className="page-title">Edit Application</h1>
            <p className="page-subtitle">
              {application ? `${application.company_name} - #${application.id}` : "Edit job application"}
            </p>
          </div>
        </div>

        {error ? (
          <section className="panel panel--alert">
            <p className="eyebrow">Error</p>
            <h2>Cannot load application</h2>
            <p>{error}</p>
            <Link href="/view-all" className="button button--primary">
              Go back to all applications
            </Link>
          </section>
        ) : application ? (
          <section className="panel panel--form panel--form-full">
            <JobApplicationForm
              action={updateJobApplicationAction}
              application={application}
              submitLabel="Update Application"
              cancelHref="/view-all"
            />
          </section>
        ) : null}
      </main>
    </>
  );
}
