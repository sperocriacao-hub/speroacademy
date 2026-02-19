"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

export const MarketingHeroButtons = () => {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const t = useTranslations("Marketing");

    const onGetStarted = () => {
        if (isSignedIn) {
            router.push("/search");
        } else {
            router.push("/sign-up");
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={onGetStarted} size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all font-semibold bg-sky-600 hover:bg-sky-700">
                {t("buttonStartLearning")}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/pricing">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full font-medium border-slate-300 text-slate-700 hover:bg-slate-50 relative bg-white/80 backdrop-blur-sm shadow z-10">
                    {t("buttonInstructor")}
                </Button>
            </Link>
        </div>
    );
};
