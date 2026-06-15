import { query } from "@/lib/postgres";
import { calculateDaysSinceApplied } from "@/lib/job-applications";

/**
 * Cron job to update days_since_applied for all job applications
 * Should be called at 6 AM and 6 PM daily
 * 
 * Example Vercel Cron Config in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-days",
 *     "schedule": "0 6,18 * * *"
 *   }]
 * }
 */
export async function GET(request) {
  // Verify the request is from Vercel Cron or internal source
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  // For Vercel, the header is "x-vercel-cron-secret"
  const vercelCron = request.headers.get("x-vercel-cron-secret");
  
  if (!expectedToken || (!vercelCron && authHeader !== `Bearer ${expectedToken}`)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Get all job applications
    const { rows: applications } = await query(
      `SELECT id, application_date FROM job_applications ORDER BY id ASC`
    );

    if (applications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No applications to update", count: 0 }),
        { status: 200 }
      );
    }

    // Update days_since_applied for each application
    let updatedCount = 0;
    for (const app of applications) {
      const daysSince = calculateDaysSinceApplied(app.application_date);
      await query(
        `UPDATE job_applications SET days_since_applied = $1 WHERE id = $2`,
        [daysSince, app.id]
      );
      updatedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} job application(s)`,
        count: updatedCount,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to update days",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Also handle POST requests for manual triggering
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Same logic as GET
    const { rows: applications } = await query(
      `SELECT id, application_date FROM job_applications ORDER BY id ASC`
    );

    let updatedCount = 0;
    for (const app of applications) {
      const daysSince = calculateDaysSinceApplied(app.application_date);
      await query(
        `UPDATE job_applications SET days_since_applied = $1 WHERE id = $2`,
        [daysSince, app.id]
      );
      updatedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} job application(s)`,
        count: updatedCount,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Manual cron job error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to update days",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
