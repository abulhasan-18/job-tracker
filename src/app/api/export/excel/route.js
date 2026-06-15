import { listJobApplications } from "@/lib/job-applications";

export async function GET(request) {
  try {
    // Import xlsx with correct destructuring
    const XLSX = await import("xlsx");

    // Fetch all applications
    const applications = await listJobApplications(1000);

    if (applications.length === 0) {
      return new Response(
        JSON.stringify({ error: "No applications to export" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sort applications by S.No ascending
    const sortedApplications = [...applications].sort((a, b) => {
      const sNoA = a.s_no || 0;
      const sNoB = b.s_no || 0;
      return sNoA - sNoB;
    });

    // Prepare data for Excel
    const data = sortedApplications.map((app) => {
      let referralNames = [];
      try {
        if (app.referral_name && app.referral_name.startsWith("[")) {
          referralNames = JSON.parse(app.referral_name);
        } else if (app.referral_name) {
          referralNames = [app.referral_name];
        }
      } catch {
        referralNames = app.referral_name ? [app.referral_name] : [];
      }

      return {
        "S.No": app.s_no,
        "Application Date": app.application_date,
        "Company Name": app.company_name,
        "Profession Applied": app.profession_applied,
        "Job Title": app.job_title,
        "Industry Sector": app.industry_sector,
        "Source": app.source,
        "Job Link": app.job_link || "",
        "Recruiter Name": app.recruiter_name || "",
        "Recruiter Contact": app.recruiter_contact || "",
        "Referral Names": referralNames.join(", "),
        "Application Status": app.application_status,
        "Days Since Applied": app.days_since_applied,
      };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Applications");

    // Set column widths for better readability
    const columnWidths = [
      { wch: 6 },  // S.No
      { wch: 14 }, // Application Date
      { wch: 20 }, // Company Name
      { wch: 18 }, // Profession Applied
      { wch: 16 }, // Job Title
      { wch: 26 }, // Industry Sector
      { wch: 14 }, // Source
      { wch: 35 }, // Job Link
      { wch: 16 }, // Recruiter Name
      { wch: 16 }, // Recruiter Contact
      { wch: 24 }, // Referral Names
      { wch: 18 }, // Application Status
      { wch: 16 }, // Days Since Applied
    ];
    worksheet["!cols"] = columnWidths;

    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Return file as response
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Job-Applications-${timestamp}.xlsx`;

    return new Response(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate Excel file", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
