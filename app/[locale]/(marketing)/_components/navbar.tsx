"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export const Navbar = () => {
    const t = useTranslations("Navbar");

    return (
        <div className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center z-50">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <div className="flex items-center gap-x-2">
                    <Link href="/">
                        <p className="font-bold text-xl text-neutral-700">
                            {t("title")}
                        </p>
                    </Link>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto space-x-4">
                    <LanguageSwitcher />
                    <div className="hidden md:block">
                        <Button size="sm" variant="ghost" asChild>
                            <Link href="/pricing">{t("pricing")}</Link>
                        </Button>
                    </div>
                    <SignedOut>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/sign-in">{t("login")}</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/sign-up">{t("getStarted")}</Link>
                        </Button>
                    </SignedOut>
                    <SignedIn>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href="/dashboard">{t("dashboard")}</Link>
                        </Button>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </div>
    );
};
