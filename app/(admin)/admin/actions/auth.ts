"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { getSiteUrl } from "@/lib/site-url"
import { isUserInAdminTable } from "@/lib/admin-auth"

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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAdmin = user ? await isUserInAdminTable(supabase, user.id) : false
  if (!isAdmin) {
    await supabase.auth.signOut()
    return {
      error:
        "This account does not have admin access. Use the store sign-in for customer accounts.",
    }
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

  const siteUrl = await getSiteUrl()
  if (!siteUrl) {
    return {
      error:
        "Unable to determine site URL. Set NEXT_PUBLIC_SITE_URL (e.g. https://yourdomain.com).",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/reset-password?redirect=/admin/login")}`,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/login")
  return { success: true }
}

