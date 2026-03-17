import { getCategoryById } from "@/lib/categories-db";
import { notFound } from "next/navigation";
import EditCategoryForm from "../../components/EditCategoryForm";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    const category = await getCategoryById(params.id);

    if (!category) {
        notFound();
    }

    return <EditCategoryForm category={category} />;
}
