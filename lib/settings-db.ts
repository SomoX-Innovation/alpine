import { createServerClient } from "@/lib/supabase";

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
    const supabase = createServerClient();
    if (!supabase) return defaultValue;
    const { data, error } = await supabase.from("settings").select("value").eq("key", key).single();
    if (error || !data) return defaultValue;
    return data.value;
}

export async function getHeroImage(): Promise<string> {
    return getSetting("hero_image", "/1771954158424.jpg.jpeg");
}

export async function getNewDesignImage(): Promise<string> {
    return getSetting("new_designs_image", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80");
}

export async function getSizeChartImages(): Promise<{ regular: string; oversized: string }> {
    const regular = await getSetting("size_chart_regular_image", "");
    const oversized = await getSetting("size_chart_oversized_image", "");
    return { regular, oversized };
}

export async function getFaqData(): Promise<{ q: string; a: string }[]> {
    const defaultFaq = [
        {
            q: "What is your return policy?",
            a: "You can return unworn, unwashed items with tags attached within 7 days of delivery. We'll refund the purchase price to your original payment method. Sale items may have different terms.",
        },
        {
            q: "How long does shipping take?",
            a: "Standard delivery is 3–5 business days within the EU. Express options are available at checkout. You'll receive tracking once your order ships.",
        },
        {
            q: "Do you ship internationally?",
            a: "We currently ship to addresses in the European Union. We're working on expanding to more countries.",
        },
        {
            q: "How do I know my size?",
            a: "Check our Size guide (link in footer) for measurements. If you're between sizes, we recommend sizing up for a relaxed fit or down for a tailored look.",
        },
        {
            q: "How can I track my order?",
            a: "After your order ships, you'll get an email with a tracking link. You can also log into your account and view order history.",
        },
    ];

    const faqStr = await getSetting("faq_json", "");
    if (!faqStr) return defaultFaq;
    try {
        const parsed = JSON.parse(faqStr);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        return defaultFaq;
    } catch {
        return defaultFaq;
    }
}

export async function getDtfImages(): Promise<string[]> {
    const raw = await getSetting("dtf_images", "[]");
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
        }
    } catch {
        // ignore
    }
    return [];
}

export type DtfGender = "Male" | "Female" | "Unisex";

export type DtfItem = {
    code: string;
    url: string;
    genders: DtfGender[];
};

export async function getDtfItems(): Promise<DtfItem[]> {
    const raw = await getSetting("dtf_items", "[]");
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => {
                    if (!item || typeof item !== "object") return null;
                    const code = String((item as any).code ?? "").trim();
                    const url = String((item as any).url ?? "").trim();

                    const rawGender = (item as any).gender;
                    const rawGenders = (item as any).genders;
                    const allValues: string[] = Array.isArray(rawGenders)
                        ? rawGenders.map((g: any) => String(g ?? "").trim())
                        : typeof rawGender === "string"
                            ? [rawGender.trim()]
                            : [];

                    const gendersSet = new Set<DtfGender>();
                    for (const g of allValues) {
                        if (g === "Male" || g === "Female" || g === "Unisex") {
                            gendersSet.add(g);
                        }
                    }
                    if (gendersSet.size === 0) {
                        gendersSet.add("Unisex");
                    }

                    if (!code && !url) return null;
                    return { code, url, genders: Array.from(gendersSet) } as DtfItem;
                })
                .filter((x): x is DtfItem => !!x);
        }
    } catch {
        // ignore
    }
    return [];
}
