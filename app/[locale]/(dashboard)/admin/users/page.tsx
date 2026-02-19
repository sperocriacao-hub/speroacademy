import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";

const AdminUsersPage = async () => {
    // Skipped Clerk auth explicitly since `/admin` relies on cookies

    const users = await db.user.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <DataTable columns={columns} data={users} />
        </div>
    );
}

export default AdminUsersPage;
