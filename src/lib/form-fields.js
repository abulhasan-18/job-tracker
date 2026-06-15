// Form field configuration - CLIENT SIDE ONLY
// This file should only be imported in client components

export const professionOptions = [
  "Data Analyst",
  "Flutter Developer",
  "Software Engineer",
  "Marketing",
  "Sales",
  "Logistics",
  "Cyber Security",
  "AML Analyst",
  "Telesales",
  "Customer Service",
  "Call Center",
  "Others",
];

export const jobTitleOptions = [
  "Intern",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
  "Senior Manager",
  "Director",
  "VP",
  "C-Level",
];

export const industrySectorOptions = [
  "Real Estate & Property Management",
  "Construction",
  "Hospitality",
  "Airlines",
  "Insurance",
  "Retail",
  "E-commerce",
  "Telecommunications",
  "Oil & Gas",
  "Energy",
  "Healthcare",
  "Education",
  "Government",
  "Ports & Maritime",
  "Manufacturing",
  "Technology",
  "Consulting",
  "Media",
  "FMCG",
  "Others",
];

export const sourceOptions = [
  "LinkedIn",
  "NaukriGulf",
  "Indeed",
  "Referral",
  "GulfTalent",
  "Others",
];

export const applicationStatusOptions = [
  "Applied",
  "Recruiter Contacted",
  "HR Screening",
  "Interviewed",
  "Final Interview",
  "Offer Received",
  "Rejected",
  "Hold",
];

export const jobApplicationFormFields = [
  {
    name: "application_date",
    label: "Application Date",
    type: "date",
    required: true,
    helpText: "Date cannot be in the future.",
  },
  {
    name: "company_name",
    label: "Company Name",
    type: "text",
    placeholder: "Al Futtaim LLC",
    required: true,
  },
  {
    name: "profession_applied",
    label: "Profession Applied",
    type: "select",
    options: professionOptions,
    placeholder: "Select profession",
    required: true,
  },
  {
    name: "job_title",
    label: "Job Title",
    type: "select",
    options: jobTitleOptions,
    placeholder: "Select job title",
    required: true,
  },
  {
    name: "industry_sector",
    label: "Industry Sector",
    type: "select",
    options: industrySectorOptions,
    placeholder: "Select sector",
    required: true,
  },
  {
    name: "source",
    label: "Source",
    type: "select",
    options: sourceOptions,
    placeholder: "Select source",
    required: true,
  },
  {
    name: "job_link",
    label: "Job Link",
    type: "text",
    placeholder: "https://...",
    required: true,
  },
  {
    name: "recruiter_name",
    label: "Recruiter Name",
    type: "text",
    placeholder: "David",
  },
  {
    name: "recruiter_contact",
    label: "Recruiter Contact",
    type: "text",
    placeholder: "Email or phone",
  },
  {
    name: "referral_names",
    label: "Referral Names",
    type: "dynamic",
    maxCount: 5,
    placeholder: "Name",
    helpText: "Up to 5 referral names",
  },
  {
    name: "application_status",
    label: "Application Status",
    type: "select",
    options: applicationStatusOptions,
    placeholder: "Select status",
    required: true,
    defaultValue: "Applied",
  },
];
