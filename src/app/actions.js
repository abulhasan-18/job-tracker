"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteJobApplication,
  insertJobApplication,
  parseJobApplicationFormData,
  updateJobApplication,
  getJobApplicationById,
} from "@/lib/job-applications";

function assertNumericId(id, message) {
  if (!/^\d+$/.test(id)) {
    throw new Error(message);
  }
}

function refreshDashboard() {
  revalidatePath("/");
  revalidatePath("/view-all");
  revalidatePath("/dashboard");
  revalidatePath("/api/applications");
  redirect("/");
}

export async function createJobApplicationAction(formData) {
  const payload = parseJobApplicationFormData(formData);
  await insertJobApplication(payload);
  refreshDashboard();
}

export async function updateJobApplicationAction(formData) {
  const payload = parseJobApplicationFormData(formData);

  if (!payload.id) {
    throw new Error("Application id is required to update a row.");
  }

  assertNumericId(payload.id, "Application id must be numeric to update a row.");

  await updateJobApplication(payload.id, payload);
  refreshDashboard();
}

export async function deleteJobApplicationAction(formData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Application id is required to delete a row.");
  }

  assertNumericId(id, "Application id must be numeric to delete a row.");

  await deleteJobApplication(id);
  refreshDashboard();
}
