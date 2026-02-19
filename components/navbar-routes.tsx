"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAdmin } from "@/app/actions/admin";
import { useTranslations } from "next-intl";

export const NavbarRoutes = () => {
    const pathname = usePathname();
    const t = useTranslations("Navbar");

    const isTeacherPage = pathname?.includes("/teacher");
    const isPlayerPage = pathname?.includes("/chapter");
    const isAdminPage = pathname?.includes("/admin");

    if (isAdminPage) {
        return (
            <div className="flex gap-x-2 ml-auto">
                <Button size="sm" variant="ghost" onClick={() => logoutAdmin()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                </Button>
            </div>
        );
    }

    return (
        <div className="flex gap-x-2 ml-auto">
            {isTeacherPage || isPlayerPage ? (
                <Link href="/">
                    <Button size="sm" variant="ghost">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("exit")}
                    </Button>
                </Link>
            ) : (
                <Link href="/pt-BR/teacher/courses">
                    <Button size="sm" variant="ghost">
                        {t("teacherMode")}
                    </Button>
                </Link>
            )}
            <UserButton afterSignOutUrl="/" />
        </div>
    )
}
