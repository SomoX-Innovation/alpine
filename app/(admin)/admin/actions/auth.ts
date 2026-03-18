"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { headers } from "next/headers"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/admin")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim()
  if (!email) {
    return { error: "Email is required." }
  }

  const supabase = await createClient()
  const origin = (await headers()).get("origin")
  if (!origin) {
    return { error: "Unable to determine site URL." }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/admin/login?reset=1`,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/login")
  return { success: true }
}

