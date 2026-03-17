import { createServerClient } from "./supabase";

export interface CategoryRow {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

export async function getCategories(): Promise<CategoryRow[]> {
    const supabase = createServerClient();
    if (!supabase) return [];

    const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    return data ?? [];
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
    const supabase = createServerClient();
    if (!supabase) return null;

    const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

    return data;
}
