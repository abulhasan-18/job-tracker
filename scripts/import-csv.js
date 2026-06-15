#!/usr/bin/env node

/**
 * CSV Import Script for Job Tracker
 * Cleans, organizes, and imports job application data from CSV to PostgreSQL
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://mohammedabulhasan:root@localhost:5432/job%20tracker",
  ssl: false,
});

// Mapping dictionaries for cleaning data
const professionMapping = {
  "data analyst": "Data Analyst",
  "junior financial analyst": "Data Analyst",
  "analyst": "Data Analyst",
  "junior data analyst": "Data Analyst",
  "business intelligence analyst": "Data Analyst",
  "data analytics & business support specialist": "Data Analyst",
  "data analyst intern": "Data Analyst",
  "data analyst & visualization specialist": "Data Analyst",
  "data amalyst": "Data Analyst",
  "data analayst": "Data Analyst",
  "user content": "Data Analyst",
  "junior developer": "Flutter Developer",
  "junior oracle developer": "Flutter Developer",
  "software developer": "Flutter Developer",
  "customer service executive": "Customer Service",
  "business support specialist": "Customer Service",
  "freshers & experienced candidates": "Others",
  "not mentioned": "Others",
};

const sectorMapping = {
  "real estate & property management": "Real Estate & Property Management",
  "talent acquisition and recruitment partner": "Consulting",
  "manufacturing company": "Manufacturing",
  "ai company": "Technology",
  "global company": "Technology",
  "it": "Technology",
  "it & technology": "Technology",
  "oil and gas": "Oil & Gas",
  "oil & gas": "Oil & Gas",
  "aviation and aerospace sector": "Airlines",
  "aviation and aerospace": "Airlines",
  "aviation": "Airlines",
  "aerospace": "Airlines",
  "career": "Others",
  "recruiting company": "Consulting",
  "banking sector": "Consulting",
  "not available": "Others",
};

const sourceMapping = {
  "linkedin": "LinkedIn",
  "indeed": "Indeed",
  "nakuri gulf": "NaukriGulf",
  "naukri gulf": "NaukriGulf",
  "carears": "Others",
  "referral": "Referral",
};

const statusMapping = {
  "applied": "Applied",
  "recruiter contacted": "Recruiter Contacted",
  "hr screening": "HR Screening",
  "interviewed": "Interviewed",
  "final interview": "Final Interview",
  "offer received": "Offer Received",
  "offer extended": "Offer Received",
  "offer accepted": "Offer Received",
  "rejected": "Rejected",
  "hold": "Hold",
};

function cleanValue(value) {
  if (!value || value === "N/A" || value === "Not Available" || value === "Not available" || value === "not available" || value === "Searching" || value === "searching" || value === "Not found" || value === "Not mentioned" || value === "not mentioned") {
    return null;
  }
  return String(value).trim() || null;
}

function mapToDictionary(value, mapping) {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  for (const [key, mappedValue] of Object.entries(mapping)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mappedValue;
    }
  }
  return Object.values(mapping)[0] || null;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    // Handle formats like "02-Jun-26"
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

function calculateDaysSince(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return 0;
  const start = new Date(`${date}T00:00:00Z`);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.max(0, diff);
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];

  // Skip first data row (S.No 1 - Al Futtaim, which is a sample)
  for (let i = 2; i < lines.length; i++) {
    // Simple CSV parsing - handles most cases
    const values = lines[i].split(",");
    const row = {};
    
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() || "";
    }
    
    // Only include rows with valid S.No (numeric)
    if (row["S.No"] && /^\d+$/.test(row["S.No"].trim())) {
      rows.push(row);
    }
  }

  return rows;
}

async function getMaxSerialNo() {
  try {
    const result = await pool.query("SELECT COALESCE(MAX(s_no), 0) AS max_sno FROM job_applications");
    return result.rows[0]?.max_sno || 0;
  } catch {
    return 0;
  }
}

async function importCSV(filePath) {
  console.log("Starting CSV import...\n");

  try {
    const rows = parseCSV(filePath);
    console.log(`Found ${rows.length} records in CSV\n`);

    const maxSerialNo = await getMaxSerialNo();
    let currentSerialNo = maxSerialNo + 1;

    const cleanedData = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        let companyName = cleanValue(row["Company Name"]);
        const applicationDate = parseDate(row["Application Date"]);

        // If company is "Not Available", use a placeholder
        if (!companyName) {
          companyName = "Unnamed Company";
        }

        if (!applicationDate) {
          errors.push(`Row ${i + 2}: Missing application date`);
          continue;
        }

        const professionApplied = mapToDictionary(row["Profession Applied"], professionMapping) || "Data Analyst";
        const jobTitle = cleanValue(row["Job Title"]) || "Junior";
        const industrySector = mapToDictionary(row["Industry Sector"], sectorMapping) || "Technology";
        const source = mapToDictionary(row["Source"], sourceMapping) || "LinkedIn";
        const jobLink = cleanValue(row["Job Link"]);
        const recruiterName = cleanValue(row["Recruiter Name"]);
        const recruiterContact = cleanValue(row["Recruiter Contact"]);
        const referralName = cleanValue(row["Referral Name"]);
        const applicationStatus = mapToDictionary(row["Application Status"], statusMapping) || "Applied";
        const daysSinceApplied = calculateDaysSince(applicationDate);

        cleanedData.push({
          s_no: currentSerialNo++,
          application_date: applicationDate,
          company_name: companyName,
          profession_applied: professionApplied,
          job_title: jobTitle,
          industry_sector: industrySector,
          source: source,
          job_link: jobLink,
          recruiter_name: recruiterName,
          recruiter_contact: recruiterContact,
          referral_name: referralName ? JSON.stringify([referralName]) : null,
          application_status: applicationStatus,
          days_since_applied: daysSinceApplied,
        });
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    console.log(`Cleaned ${cleanedData.length} records successfully\n`);

    if (errors.length > 0) {
      console.log("⚠️  Import errors (skipped):");
      errors.forEach((err) => console.log(`  - ${err}`));
      console.log();
    }

    // Insert into database
    console.log("Inserting data into database...\n");
    let insertedCount = 0;

    for (const data of cleanedData) {
      try {
        await pool.query(
          `INSERT INTO job_applications (
            s_no, application_date, company_name, profession_applied,
            job_title, industry_sector, source, job_link, recruiter_name,
            recruiter_contact, referral_name, application_status, days_since_applied
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            data.s_no,
            data.application_date,
            data.company_name,
            data.profession_applied,
            data.job_title,
            data.industry_sector,
            data.source,
            data.job_link,
            data.recruiter_name,
            data.recruiter_contact,
            data.referral_name,
            data.application_status,
            data.days_since_applied,
          ]
        );
        insertedCount++;
      } catch (err) {
        console.error(`Failed to insert: ${data.company_name}`, err.message);
      }
    }

    console.log(`\n✅ Successfully imported ${insertedCount} records!\n`);

    // Print summary
    console.log("📊 Import Summary:");
    console.log(`  Total records processed: ${rows.length}`);
    console.log(`  Successfully imported: ${insertedCount}`);
    console.log(`  Skipped/Failed: ${rows.length - insertedCount}`);
    console.log(`  Serial numbers: ${maxSerialNo + 1} to ${currentSerialNo - 1}\n`);

    // Print data sample
    console.log("📝 Sample of imported data:");
    cleanedData.slice(0, 3).forEach((data) => {
      console.log(`  - ${data.s_no}. ${data.company_name} (${data.profession_applied}) - ${data.application_status}`);
    });

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    await pool.end();
    process.exit(1);
  }
}

// Run import
const csvFile = process.argv[2] || "/Users/mohammedabulhasan/Downloads/Job Tracker(Sheet1) (1).csv";

if (!fs.existsSync(csvFile)) {
  console.error(`CSV file not found: ${csvFile}`);
  process.exit(1);
}

importCSV(csvFile);
