import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { SettingsForm } from "./_components/settings-form";

const SettingsPage = async () => {
    // Skipped Clerk auth explicitly since `/admin` relies on cookies

    // Fetch existing settings or null
    const settings = await db.systemSettings.findFirst();

    return (
        <div className="p-6">
            <SettingsForm initialData={settings} />
        </div>
    );
}

export default SettingsPage;
