"use client";

import { useState, useEffect } from "react";
import { uploadProductImage } from "../actions/products";
import { updateHeroImage, updateFaq, updateDtfImages, updateNewDesignImage, updateSizeChartImages } from "../actions/settings";
import { createClient } from "@/lib/supabase";

export default function AdminContentPage() {
    const [heroImage, setHeroImage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [heroError, setHeroError] = useState<string | null>(null);
    const [heroSuccess, setHeroSuccess] = useState(false);

    const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);
    const [faqError, setFaqError] = useState<string | null>(null);
    const [faqSuccess, setFaqSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const [dtfImages, setDtfImages] = useState<string[]>([]);
    const [dtfError, setDtfError] = useState<string | null>(null);
    const [dtfSuccess, setDtfSuccess] = useState(false);
    const [newDesignImage, setNewDesignImage] = useState("");
    const [newDesignError, setNewDesignError] = useState<string | null>(null);
    const [newDesignSuccess, setNewDesignSuccess] = useState(false);
    const [sizeChartRegular, setSizeChartRegular] = useState("");
    const [sizeChartOversized, setSizeChartOversized] = useState("");
    const [sizeChartError, setSizeChartError] = useState<string | null>(null);
    const [sizeChartSuccess, setSizeChartSuccess] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const supabase = createClient();

            const { data: heroData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "hero_image")
                .single();

            if (heroData?.value) {
                setHeroImage(heroData.value);
            } else {
                setHeroImage("/1771954158424.jpg.jpeg");
            }

            const { data: faqData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "faq_json")
                .single();

            if (faqData?.value) {
                try {
                    const parsed = JSON.parse(faqData.value);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setFaqs(parsed);
                    }
                } catch { }
            } else {
                        setFaqs([
                    { q: "What is your return policy?", a: "You can return unworn, unwashed items with tags attached within 7 days of delivery. We'll refund the purchase price to your original payment method. Sale items may have different terms." }
                ]);
            }

            const { data: dtfData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "dtf_images")
                .single();
            if (dtfData?.value) {
                try {
                    const parsed = JSON.parse(dtfData.value);
                    if (Array.isArray(parsed)) {
                        setDtfImages(parsed.filter((u: unknown) => typeof u === "string" && String(u).trim()));
                    }
                } catch { }
            }

            const { data: newDesignData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "new_designs_image")
                .single();
            if (newDesignData?.value) {
                setNewDesignImage(newDesignData.value);
            }

            const { data: regularChartData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "size_chart_regular_image")
                .single();
            if (regularChartData?.value) {
                setSizeChartRegular(regularChartData.value);
            }

            const { data: oversizedChartData } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "size_chart_oversized_image")
                .single();
            if (oversizedChartData?.value) {
                setSizeChartOversized(oversizedChartData.value);
            }
            setLoading(false);
        }
        fetchSettings();
    }, []);

    async function handleHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setHeroError(null);
        setHeroSuccess(false);

        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadProductImage(formData);

        setUploading(false);
        if (result.error) {
            setHeroError(result.error);
            return;
        }
        if (result.url) {
            setHeroImage(result.url);
        }
    }

    async function saveHeroImage() {
        setHeroError(null);
        setHeroSuccess(false);
        const res = await updateHeroImage(heroImage);
        if (res.error) setHeroError(res.error);
        else setHeroSuccess(true);
    }

    async function saveFaqs() {
        setFaqError(null);
        setFaqSuccess(false);
        const res = await updateFaq(faqs);
        if (res.error) setFaqError(res.error);
        else setFaqSuccess(true);
    }

    function addFaq() {
        setFaqs([...faqs, { q: "", a: "" }]);
    }

    function updateFaqItem(index: number, field: "q" | "a", value: string) {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    }

    function removeFaq(index: number) {
        const newFaqs = [...faqs];
        newFaqs.splice(index, 1);
        setFaqs(newFaqs);
    }

    function addDtfImage() {
        setDtfImages([...dtfImages, ""]);
    }
    function updateDtfImage(index: number, value: string) {
        const next = [...dtfImages];
        next[index] = value;
        setDtfImages(next);
    }
    function removeDtfImage(index: number) {
        setDtfImages(dtfImages.filter((_, i) => i !== index));
    }
    async function saveDtfImages() {
        setDtfError(null);
        setDtfSuccess(false);
        const urls = dtfImages.map((u) => u.trim()).filter(Boolean);
        const res = await updateDtfImages(urls);
        if (res.error) setDtfError(res.error);
        else setDtfSuccess(true);
    }

    async function handleNewDesignImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setNewDesignError(null);
        setNewDesignSuccess(false);
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadProductImage(formData);
        setUploading(false);
        if (result.error) {
            setNewDesignError(result.error);
            return;
        }
        if (result.url) setNewDesignImage(result.url);
    }

    async function saveNewDesignImage() {
        setNewDesignError(null);
        setNewDesignSuccess(false);
        const res = await updateNewDesignImage(newDesignImage);
        if (res.error) setNewDesignError(res.error);
        else setNewDesignSuccess(true);
    }

    async function handleSizeChartChange(kind: "regular" | "oversized", e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setSizeChartError(null);
        setSizeChartSuccess(false);
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadProductImage(formData);
        setUploading(false);
        if (result.error) {
            setSizeChartError(result.error);
            return;
        }
        if (result.url) {
            if (kind === "regular") setSizeChartRegular(result.url);
            else setSizeChartOversized(result.url);
        }
    }

    async function saveSizeCharts() {
        setSizeChartError(null);
        setSizeChartSuccess(false);
        const res = await updateSizeChartImages(sizeChartRegular, sizeChartOversized);
        if (res.error) setSizeChartError(res.error);
        else setSizeChartSuccess(true);
    }

    if (loading) {
        return <div className="p-4 text-[var(--muted)]">Loading settings...</div>;
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
                    Content & Settings
                </h1>
                <p className="mt-1 text-sm text-[var(--muted)]">
                    Manage homepage hero sections, FAQ, and global settings.
                </p>
            </div>

            {/* Hero Section */}
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                    Homepage Hero Image
                </h2>
                <div className="mt-6 space-y-4 max-w-xl">
                    {heroError && (
                        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {heroError}
                        </p>
                    )}
                    {heroSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                            Hero image updated successfully.
                        </p>
                    )}

                    {heroImage && (
                        <div className="mb-4">
                            <img src={heroImage} alt="Hero" className="h-48 w-auto rounded border border-[var(--border)] object-cover" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)]">
                            Upload new image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageChange}
                            disabled={uploading}
                            className="mt-1 block w-full text-sm text-[var(--muted)]"
                        />
                        {uploading && <p className="mt-1 text-sm text-[var(--muted)]">Uploading…</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={saveHeroImage}
                            disabled={uploading}
                            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
                        >
                            Save Hero Image
                        </button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                    FAQ Content
                </h2>

                <div className="mt-6 space-y-6 max-w-3xl">
                    {faqError && (
                        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {faqError}
                        </p>
                    )}
                    {faqSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                            FAQ updated successfully.
                        </p>
                    )}

                    {faqs.map((faq, i) => (
                        <div key={i} className="flex gap-4 items-start border-b border-[var(--border)] pb-4">
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
                                        Question
                                    </label>
                                    <input
                                        type="text"
                                        value={faq.q}
                                        onChange={(e) => updateFaqItem(i, "q", e.target.value)}
                                        className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
                                        Answer
                                    </label>
                                    <textarea
                                        value={faq.a}
                                        onChange={(e) => updateFaqItem(i, "a", e.target.value)}
                                        rows={2}
                                        className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="pt-6">
                                <button
                                    type="button"
                                    onClick={() => removeFaq(i)}
                                    className="text-red-500 hover:text-red-400 p-2"
                                    title="Remove this question"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={addFaq}
                            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                        >
                            + Add Question
                        </button>
                        <button
                            type="button"
                            onClick={saveFaqs}
                            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                        >
                            Save FAQ
                        </button>
                    </div>
                </div>
            </section>

            {/* DTF Page Images */}
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                    DTF Page Images
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                    Image URLs shown on the DTF page. Add full image links (e.g. from your CDN or Supabase Storage).
                </p>
                <div className="mt-6 space-y-4 max-w-2xl">
                    {dtfError && (
                        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {dtfError}
                        </p>
                    )}
                    {dtfSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                            DTF images updated successfully.
                        </p>
                    )}
                    {dtfImages.map((url, i) => (
                        <div key={i} className="flex gap-3 items-center">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => updateDtfImage(i, e.target.value)}
                                placeholder="https://…"
                                className="flex-1 rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => removeDtfImage(i)}
                                className="shrink-0 rounded p-2 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500"
                                title="Remove"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="button"
                            onClick={addDtfImage}
                            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                        >
                            + Add image link
                        </button>
                        <button
                            type="button"
                            onClick={saveDtfImages}
                            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                        >
                            Save DTF images
                        </button>
                    </div>
                </div>
            </section>

            {/* New Designs Card Image */}
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                    New Designs Card Image
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                    Image used for the "New Designs" card in the Shop by style section.
                </p>
                <div className="mt-6 space-y-4 max-w-xl">
                    {newDesignError && (
                        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {newDesignError}
                        </p>
                    )}
                    {newDesignSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                            New Designs image updated successfully.
                        </p>
                    )}
                    {newDesignImage && (
                        <div className="mb-4">
                            <img src={newDesignImage} alt="New Designs" className="h-40 w-auto rounded border border-[var(--border)] object-cover" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)]">
                            Upload new image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewDesignImageChange}
                            disabled={uploading}
                            className="mt-1 block w-full text-sm text-[var(--muted)]"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={saveNewDesignImage}
                            disabled={uploading}
                            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
                        >
                            Save New Designs Image
                        </button>
                    </div>
                </div>
            </section>

            {/* Size Guide Images */}
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                    Size Guide Images
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                    Upload Regular and Oversized size chart images for the Size Guide page.
                </p>
                <div className="mt-6 space-y-5 max-w-2xl">
                    {sizeChartError && (
                        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                            {sizeChartError}
                        </p>
                    )}
                    {sizeChartSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                            Size chart images updated successfully.
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)]">
                            Regular size chart
                        </label>
                        {sizeChartRegular && (
                            <img src={sizeChartRegular} alt="Regular size chart" className="mt-2 h-32 w-auto rounded border border-[var(--border)] object-cover" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSizeChartChange("regular", e)}
                            disabled={uploading}
                            className="mt-2 block w-full text-sm text-[var(--muted)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)]">
                            Oversized size chart
                        </label>
                        {sizeChartOversized && (
                            <img src={sizeChartOversized} alt="Oversized size chart" className="mt-2 h-32 w-auto rounded border border-[var(--border)] object-cover" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSizeChartChange("oversized", e)}
                            disabled={uploading}
                            className="mt-2 block w-full text-sm text-[var(--muted)]"
                        />
                    </div>

                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={saveSizeCharts}
                            disabled={uploading}
                            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
                        >
                            Save Size Charts
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
