"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function createColor(formData: FormData): Promise<{ error?: string; id?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const name = (formData.get("name") as string)?.trim();
    let slug = (formData.get("slug") as string)?.trim();

    if (!name) return { error: "Name is required." };
    if (!slug) slug = generateSlug(name);

    const { data, error } = await supabase
        .from("colors")
        .insert({ name, slug })
        .select("id")
        .single();

    if (error) {
        if (error.code === "23505") return { error: "A color with this slug already exists." };
        return { error: error.message };
    }

    revalidatePath("/admin/colors");
    return { id: data.id };
}

export async function updateColor(id: string, formData: FormData): Promise<{ error?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();

    if (!name || !slug) return { error: "Name and slug are required." };

    const { error } = await supabase
        .from("colors")
        .update({ name, slug, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        if (error.code === "23505") return { error: "A color with this slug already exists." };
        return { error: error.message };
    }

    revalidatePath("/admin/colors");
    return {};
}

export async function deleteColor(id: string): Promise<{ error?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const { error } = await supabase.from("colors").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/colors");
    return {};
}
