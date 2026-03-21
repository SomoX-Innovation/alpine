"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { SHIPPING_COUNTRY } from "@/lib/currency";

export type CustomerProfile = {
  first_name: string;
  last_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code: string;
  country: string;
};

export type ProfileSaveState = { ok?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("customer_profiles")
    .select(
      "first_name, last_name, phone, address_line, city, postal_code, country"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[account] getCustomerProfile", error.message);
    return {
      first_name: "",
      last_name: "",
      phone: "",
      address_line: "",
      city: "",
      postal_code: "",
      country: SHIPPING_COUNTRY,
    };
  }

  if (!data) {
    return {
      first_name: "",
      last_name: "",
      phone: "",
      address_line: "",
      city: "",
      postal_code: "",
      country: SHIPPING_COUNTRY,
    };
  }

  return {
    first_name: String(data.first_name ?? ""),
    last_name: String(data.last_name ?? ""),
    phone: String(data.phone ?? ""),
    address_line: String(data.address_line ?? ""),
    city: String(data.city ?? ""),
    postal_code: String(data.postal_code ?? ""),
    country: String(data.country ?? SHIPPING_COUNTRY) || SHIPPING_COUNTRY,
  };
}

export async function saveProfile(
  _prev: ProfileSaveState | null,
  formData: FormData
): Promise<ProfileSaveState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = {
    user_id: user.id,
    first_name: str(formData, "first_name"),
    last_name: str(formData, "last_name"),
    phone: str(formData, "phone"),
    address_line: String(existing?.address_line ?? ""),
    city: String(existing?.city ?? ""),
    postal_code: String(existing?.postal_code ?? ""),
    country: String(existing?.country ?? SHIPPING_COUNTRY) || SHIPPING_COUNTRY,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("customer_profiles").upsert(row, {
    onConflict: "user_id",
  });

  if (error) return { error: error.message };
  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function saveShippingAddress(
  _prev: ProfileSaveState | null,
  formData: FormData
): Promise<ProfileSaveState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = {
    user_id: user.id,
    first_name: String(existing?.first_name ?? ""),
    last_name: String(existing?.last_name ?? ""),
    phone: String(existing?.phone ?? ""),
    address_line: str(formData, "address_line"),
    city: str(formData, "city"),
    postal_code: str(formData, "postal_code"),
    country: str(formData, "country") || SHIPPING_COUNTRY,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("customer_profiles").upsert(row, {
    onConflict: "user_id",
  });

  if (error) return { error: error.message };
  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true };
}
