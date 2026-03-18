"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";

function getRequiredString(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  return v.length ? v : null;
}

export async function register(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const confirmPassword = getRequiredString(formData, "confirm_password");

  if (!email) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (confirmPassword !== password) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "client" },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/account");

  // If email confirmation isn't required, Supabase may create a session immediately.
  if (data?.session) {
    redirect("/account");
  }

  return { success: true };
}

export async function login(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");

  if (!email) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/account");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = getRequiredString(formData, "email");
  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  if (!origin) {
    return { error: "Unable to determine site URL." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login?reset=1`,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/login");
  return { success: true };
}

