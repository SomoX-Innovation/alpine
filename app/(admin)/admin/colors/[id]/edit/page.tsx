import { getColorById } from "@/lib/colors-db";
import { notFound } from "next/navigation";
import EditColorForm from "../../components/EditColorForm";

export default async function EditColorPage({ params }: { params: { id: string } }) {
    const color = await getColorById(params.id);

    if (!color) {
        notFound();
    }

    return <EditColorForm color={color} />;
}
