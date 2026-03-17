import { createServerClient } from "./supabase";

export interface ColorRow {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export async function getColors(): Promise<ColorRow[]> {
    const supabase = createServerClient();
    if (!supabase) return [];

    const { data } = await supabase
        .from("colors")
        .select("*")
        .order("name", { ascending: true });

    return data ?? [];
}

export async function getColorById(id: string): Promise<ColorRow | null> {
    const supabase = createServerClient();
    if (!supabase) return null;

    const { data } = await supabase
        .from("colors")
        .select("*")
        .eq("id", id)
        .single();

    return data;
}
