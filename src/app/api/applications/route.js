import { listJobApplications } from "@/lib/job-applications";

export async function GET(request) {
  try {
    const applications = await listJobApplications(100);
    return new Response(JSON.stringify(applications), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch applications" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
