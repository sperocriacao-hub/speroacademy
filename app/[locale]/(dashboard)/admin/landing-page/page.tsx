import { db } from "@/lib/db";
import { LandingPageForm } from "./_components/landing-page-form";

const LandingPageAdmin = async () => {
    // Fetch existing settings or null
    const settings = await db.systemSettings.findFirst();

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Configurar Landing Page (Home)</h1>
                <p className="text-slate-500">Edite as informações exibidas na página principal da plataforma.</p>
            </div>
            <LandingPageForm initialData={settings} />
        </div>
    );
}

export default LandingPageAdmin;
