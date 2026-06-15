import { searchJobApplications } from "@/lib/job-applications";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const applications = await searchJobApplications(query, limit);
    return new Response(JSON.stringify(applications), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error searching applications:", error);
    return new Response(
      JSON.stringify({ error: "Failed to search applications" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
