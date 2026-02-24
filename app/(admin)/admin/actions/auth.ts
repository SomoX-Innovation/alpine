"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = formData.get("password") as string ?? "";
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return { error: "Admin login not configured." };
  }
  if (email !== adminEmail || password !== adminPassword) {
    return { error: "Invalid email or password." };
  }
  await createSession(email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
