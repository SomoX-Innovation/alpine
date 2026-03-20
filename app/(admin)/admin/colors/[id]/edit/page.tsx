import { getColorById } from "@/lib/colors-db";
import { notFound } from "next/navigation";
import EditColorForm from "../../components/EditColorForm";

export default async function EditColorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const color = await getColorById(id);

    if (!color) {
        notFound();
    }

    return <EditColorForm color={color} />;
}
