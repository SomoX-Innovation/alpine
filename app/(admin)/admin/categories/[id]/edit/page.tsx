import { getCategoryById } from "@/lib/categories-db";
import { redirect } from "next/navigation";
import EditCategoryForm from "../../components/EditCategoryForm";

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const category = await getCategoryById(id);

    if (!category) {
        redirect("/admin/categories");
    }

    return <EditCategoryForm category={category} />;
}
