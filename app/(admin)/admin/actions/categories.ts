"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";

const BUCKET = "category-images";

export async function uploadCategoryImage(formData: FormData): Promise<{ url?: string; error?: string }> {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
        return { error: "No file provided." };
    }
    const supabase = createServerClient();
    if (!supabase) {
        return { error: "Storage not configured." };
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: file.type,
        upsert: false,
    });
    if (error) {
        return { error: error.message };
    }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { url: urlData.publicUrl };
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData): Promise<{ error?: string; id?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const name = (formData.get("name") as string)?.trim();
    let slug = (formData.get("slug") as string)?.trim();

    if (!name) return { error: "Name is required." };
    if (!slug) slug = generateSlug(name);
    const image = (formData.get("image") as string)?.trim() || null;

    const { data, error } = await supabase
        .from("categories")
        .insert({ name, slug, image })
        .select("id")
        .single();

    if (error) {
        if (error.code === "23505") return { error: "A category with this slug already exists." };
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
    return { id: data.id };
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();

    if (!name || !slug) return { error: "Name and slug are required." };
    const image = (formData.get("image") as string)?.trim() || null;

    const { error } = await supabase
        .from("categories")
        .update({ name, slug, image, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        if (error.code === "23505") return { error: "A category with this slug already exists." };
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
    return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/categories");
    return {};
}
