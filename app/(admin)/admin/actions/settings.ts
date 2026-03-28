"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";

export async function updateSetting(key: string, value: string): Promise<{ error?: string }> {
    const supabase = createServerClient();
    if (!supabase) return { error: "Database not configured." };

    const { error } = await supabase
        .from("settings")
        .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) {
        return { error: error.message };
    }

    return {};
}

export async function updateHeroImage(imageUrl: string): Promise<{ error?: string }> {
    const res = await updateSetting("hero_image", imageUrl);
    if (!res.error) {
        revalidatePath("/");
        revalidatePath("/admin/content");
    }
    return res;
}

export async function updateFaq(faqItems: { q: string; a: string }[]): Promise<{ error?: string }> {
    const res = await updateSetting("faq_json", JSON.stringify(faqItems));
    if (!res.error) {
        revalidatePath("/faq");
        revalidatePath("/admin/content");
    }
    return res;
}

export async function updateDtfImages(urls: string[]): Promise<{ error?: string }> {
    const res = await updateSetting("dtf_images", JSON.stringify(urls));
    if (!res.error) {
        revalidatePath("/dtf");
        revalidatePath("/admin/content");
    }
    return res;
}

export async function updateDtfItems(
    items: { code: string; url: string; genders?: ("Male" | "Female" | "Unisex")[] }[]
): Promise<{ error?: string }> {
    const res = await updateSetting("dtf_items", JSON.stringify(items));
    if (!res.error) {
        revalidatePath("/dtf");
        revalidatePath("/admin/dtf");
    }
    return res;
}

export async function updateNewDesignImage(imageUrl: string): Promise<{ error?: string }> {
    const res = await updateSetting("new_designs_image", imageUrl);
    if (!res.error) {
        revalidatePath("/");
        revalidatePath("/admin/content");
    }
    return res;
}

const ORDER_NOTIFY_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Who receives “New order” emails when a customer checks out. */
export async function updateOrderNotifyEmails(emails: string[]): Promise<{ error?: string }> {
    const cleaned = [
        ...new Set(
            emails
                .map((e) => e.trim().toLowerCase())
                .filter((e) => e.length > 0 && ORDER_NOTIFY_EMAIL.test(e))
        ),
    ];
    const res = await updateSetting("order_notify_emails", JSON.stringify(cleaned));
    if (!res.error) {
        revalidatePath("/admin/content");
    }
    return res;
}

export async function updateSizeChartImages(regularImageUrl: string, oversizedImageUrl: string): Promise<{ error?: string }> {
    const a = await updateSetting("size_chart_regular_image", regularImageUrl);
    if (a.error) return a;
    const b = await updateSetting("size_chart_oversized_image", oversizedImageUrl);
    if (b.error) return b;

    revalidatePath("/size-guide");
    revalidatePath("/admin/content");
    return {};
}
