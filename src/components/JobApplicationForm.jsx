"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { jobApplicationFormFields } from "@/lib/form-fields";

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFieldValue(application, field) {
  const value = application?.[field.name];

  if (value === null || value === undefined) {
    return field.defaultValue ?? "";
  }

  if (field.name === "application_date") {
    // Handle different date formats from the database
    if (value instanceof Date) {
      // If it's a Date object, convert to YYYY-MM-DD
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      // If it's already a string, extract YYYY-MM-DD part
      const strValue = String(value);
      const match = strValue.match(/(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : strValue.slice(0, 10);
    }
  }

  return String(value);
}

function getReferralNames(application) {
  if (!application?.referral_name) return [];
  
  // Handle PostgreSQL text[] array (returns as JS array)
  if (Array.isArray(application.referral_name)) {
    return application.referral_name.filter(name => name && String(name).trim() !== "");
  }
  
  // Handle legacy JSON string format (for backward compatibility)
  const trimmed = String(application.referral_name).trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      // Filter out empty strings and null values
      return Array.isArray(parsed) 
        ? parsed.filter(name => name && String(name).trim() !== "")
        : [];
    } catch {
      // Fallback to empty array
      return [];
    }
  }
  
  // Handle plain text value
  if (trimmed !== "" && trimmed !== "[]") {
    return [trimmed];
  }
  
  return [];
}

function Field({ field, application, referralNames, setReferralNames }) {

  if (field.type === "select") {
    const value = getFieldValue(application, field);
    return (
      <label className={`field field--${field.name}`}>
        <span className="field__label">
          {field.label}
          {field.required ? <span className="field__required">*</span> : null}
        </span>
        <select
          name={field.name}
          defaultValue={value}
          required={field.required}
          disabled={field.readOnly}
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {field.helpText ? <span className="field__help">{field.helpText}</span> : null}
      </label>
    );
  }

  if (field.type === "dynamic") {
    // Dynamic referral names field
    return (
      <div className={`field field--${field.name}`}>
        <span className="field__label">
          {field.label}
          {field.required ? <span className="field__required">*</span> : null}
        </span>
        <div className="dynamic-fields">
          {referralNames.map((name, idx) => (
            <div key={idx} className="dynamic-field-row">
              <input
                type="text"
                name={`referral_name_${idx}`}
                defaultValue={name}
                placeholder={field.placeholder}
                className="dynamic-input"
              />
              {referralNames.length > 1 && (
                <button
                  type="button"
                  onClick={() => setReferralNames(referralNames.filter((_, i) => i !== idx))}
                  className="button button--icon"
                  title="Remove referral name"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {referralNames.length < field.maxCount && (
            <button
              type="button"
              onClick={() => setReferralNames([...referralNames, ""])}
              className="button button--secondary button--small"
            >
              + Add Name
            </button>
          )}
        </div>
        {field.helpText ? <span className="field__help">{field.helpText}</span> : null}
        {/* Hidden input to serialize referral names */}
        <input type="hidden" name="referral_name" value={JSON.stringify(referralNames)} />
      </div>
    );
  }

  let value = getFieldValue(application, field);
  
  // Set default value to today for application_date on create (new record)
  if (field.name === "application_date" && !application) {
    value = getTodayDate();
  }
  
  const maxDate = field.type === "date" ? getTodayDate() : undefined;

  return (
    <label className={`field field--${field.name}`}>
      <span className="field__label">
        {field.label}
        {field.required ? <span className="field__required">*</span> : null}
      </span>
      <input
        name={field.name}
        type={field.type}
        defaultValue={value}
        placeholder={field.placeholder}
        required={field.required}
        step={field.step}
        min={field.min}
        max={maxDate}
        inputMode={field.inputMode}
        disabled={field.readOnly}
      />
      {field.helpText ? <span className="field__help">{field.helpText}</span> : null}
    </label>
  );
}

export default function JobApplicationForm({
  action,
  application,
  submitLabel,
  cancelHref,
}) {
  const editing = Boolean(application);
  const resolvedSubmitLabel = submitLabel ?? (editing ? "Update application" : "Add application");
  
  const [referralNames, setReferralNames] = useState(() => getReferralNames(application));

  // Update referral names when the application prop changes (e.g., when editing a different record)
  useEffect(() => {
    setReferralNames(getReferralNames(application));
  }, [application?.id]);

  return (
    <form action={action} className="job-form" id="application-form">
      {editing ? <input type="hidden" name="id" value={application.id} /> : null}

      <div className="job-form__header">
        <div>
          <p className="eyebrow">Job entry form</p>
          <h2>{editing ? `Edit application #${application.id}` : "Add a job application"}</h2>
          <p className="job-form__intro">
            Insert a new row or update an existing one directly in Postgres.
          </p>
        </div>
        <span className="panel-meta">{editing ? "Edit mode" : "Create mode"}</span>
      </div>

      <div className="job-form__grid">
        {jobApplicationFormFields.map((field) => (
          <Field key={field.name} field={field} application={application} referralNames={referralNames} setReferralNames={setReferralNames} />
        ))}
      </div>

      <div className="job-form__actions">
        {cancelHref ? (
          <Link href={cancelHref} className="button button--ghost">
            Cancel edit
          </Link>
        ) : (
          <p className="job-form__hint">
            Fields marked * are required. Date and days are auto-managed.
          </p>
        )}

        <button type="submit" className="button button--primary">
          {resolvedSubmitLabel}
        </button>
      </div>
    </form>
  );
}
