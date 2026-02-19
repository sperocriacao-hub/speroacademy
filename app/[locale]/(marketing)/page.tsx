import { BookOpen, CheckCircle, Video, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { db } from "@/lib/db";
import { MarketingHeroButtons } from "./_components/marketing-hero-buttons";

export default async function MarketingPage() {
    const t = await getTranslations("Marketing");
    const settings = await db.systemSettings.findFirst();

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-sky-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium text-slate-800 shadow-sm transition-all hover:shadow-md">
                    <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    {t("heroBadge")}
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl relative z-10">
                    {settings?.heroTitle || t("heroTitle1") + " " + t("heroTitleHighlight")}
                </h1>

                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
                    {settings?.heroSubtitle || t("heroSubtitle")}
                </p>

                <MarketingHeroButtons />

                {settings?.heroImage && (
                    <div className="mt-16 w-full max-w-5xl mx-auto relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-200">
                        <Image
                            src={settings.heroImage}
                            alt="Hero Image"
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {!settings?.heroImage && (
                    <div className="mt-16 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            {t("featureLifetime")}
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            {t("featureHD")}
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            {t("featureExpert")}
                        </div>
                    </div>
                )}
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("whyChoose")}</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("whyChooseSubtitle")}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6 text-sky-600">
                                <Video className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("feat1Title")}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {t("feat1Desc")}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("feat2Title")}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {t("feat2Desc")}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{t("feat3Title")}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {t("feat3Desc")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
