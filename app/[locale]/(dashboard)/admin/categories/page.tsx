// Skipped Clerk Auth explicitly since `/admin` relies on cookies
import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

const AdminCategoriesPage = async () => {
    const categories = await db.category.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            _count: {
                select: { courses: true }
            }
        }
    });

    // Process data for columns
    const formattedCategories = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        courseCount: cat._count.courses,
    }));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gerir Categorias</h1>
            <DataTable columns={columns} data={formattedCategories} />
        </div>
    );
}

export default AdminCategoriesPage;
