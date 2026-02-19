"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(password: string) {
    if (password === "Admin123") {
        cookies().set("master_admin_session", "true", {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });
        return { success: true };
    }
    return { success: false, error: "Senha incorreta." };
}

export async function logoutAdmin(locale: string = "pt-BR") {
    cookies().delete("master_admin_session");
    redirect(`/${locale}/admin/login`);
}
