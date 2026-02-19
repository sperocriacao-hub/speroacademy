import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

const AdminCoursesPage = async () => {
    const { userId } = auth();

    if (!userId) {
        return redirect("/");
    }

    // In a real app, implement isTeacher / isAdmin check here
    // const authorized = isAdmin(userId);

    const courses = await db.course.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            category: true,
            // Include instructor details if needed?
        }
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">All Courses (Admin)</h1>
            <DataTable columns={columns} data={courses} />
        </div>
    );
}

export default AdminCoursesPage;
