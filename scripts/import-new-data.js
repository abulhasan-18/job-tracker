import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

const client = new Client({
  connectionString: 'postgres://mohammedabulhasan:root@localhost:5432/job%20tracker',
  ssl: false,
});

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Simple CSV parsing (handles basic cases)
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }

  return records;
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Delete all existing records
    await client.query('DELETE FROM job_applications');
    console.log('Deleted all existing records');

    // Read CSV file
    const csvPath = '/Users/mohammedabulhasan/Downloads/Job Tracker(Sheet1) (2).csv';
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parseCSV(fileContent);
    console.log(`Found ${records.length} records in CSV`);

    // Parse and sort by date
    const parsedRecords = records
      .filter(r => r['Application Date'] && r['Company Name'])
      .map(r => {
        const dateStr = r['Application Date'].trim();
        let date;
        
        // Parse date - handle both DD/MM/YYYY and DD-MMM-YY formats
        if (dateStr.includes('-')) {
          // Format: 09-Jun-26
          date = new Date(dateStr);
        } else {
          // Format: DD/MM/YYYY
          const [day, month, year] = dateStr.split('/');
          date = new Date(`${year}-${month}-${day}`);
        }

        return {
          ...r,
          parsedDate: date,
        };
      })
      .sort((a, b) => a.parsedDate - b.parsedDate); // Sort ascending by date

    console.log('Sorted records by date (ascending)');

    // Re-assign S.No from 1 to length
    const finalRecords = parsedRecords.map((r, index) => ({
      ...r,
      's_no': index + 1,
    }));

    // Insert records with new S.No
    for (let i = 0; i < finalRecords.length; i++) {
      const r = finalRecords[i];
      
      const applicationDate = r.parsedDate.toISOString().split('T')[0];
      
      // Parse referral names
      let referralNames = [];
      if (r['Referral Names'] && r['Referral Names'].trim()) {
        referralNames = [r['Referral Names'].trim()];
      }

      const daysSinceApplied = parseInt(r['Days Since Applied']?.toString().replace(/[^\d]/g, '') || '0', 10);

      const query = `
        INSERT INTO job_applications (
          s_no,
          application_date,
          company_name,
          profession_applied,
          job_title,
          industry_sector,
          source,
          job_link,
          recruiter_name,
          recruiter_contact,
          referral_name,
          application_status,
          days_since_applied
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      const values = [
        r['s_no'],
        applicationDate,
        r['Company Name']?.trim() || '',
        r['Profession Applied']?.trim() || '',
        r['Job Title']?.trim() || '',
        r['Industry Sector']?.trim() || '',
        r['Source']?.trim() || '',
        r['Job Link']?.trim() || '',
        r['Recruiter Name']?.trim() || '',
        r['Recruiter Contact']?.trim() || '',
        JSON.stringify(referralNames),
        r['Application Status']?.trim() || 'Applied',
        daysSinceApplied,
      ];

      await client.query(query, values);
      console.log(`Inserted record ${r['s_no']}: ${r['Company Name']} (${applicationDate})`);
    }

    console.log(`\n✅ Successfully imported ${finalRecords.length} records`);
    console.log('Records sorted by date (ascending) and re-numbered S.No 1-17');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
