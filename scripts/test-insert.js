import pkg from 'pg';

const { Client } = pkg;

const client = new Client({
  connectionString: 'postgres://mohammedabulhasan:root@localhost:5432/job%20tracker',
  ssl: false,
});

async function test() {
  try {
    await client.connect();
    
    // Insert a test record with referral names
    const result = await client.query(
      `INSERT INTO job_applications (
        s_no, application_date, company_name, profession_applied, job_title,
        industry_sector, source, job_link, recruiter_name, recruiter_contact,
        referral_name, application_status, days_since_applied
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        18,
        '2026-06-10',
        'Test Company',
        'Data Analyst',
        'Junior',
        'Technology',
        'LinkedIn',
        'https://test.com',
        'John Doe',
        '123456789',
        JSON.stringify(['Ahmed Ali', 'Sara Khan']),
        'Applied',
        0
      ]
    );
    
    console.log('Inserted:', result.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

test();
