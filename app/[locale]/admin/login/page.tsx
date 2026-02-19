"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const { success, error } = await loginAdmin(password);

            if (success) {
                toast.success("Login do administrativo completo.");
                router.push("/pt-BR/admin/courses"); // Force map to dashboard overview
                router.refresh();
            } else {
                toast.error(error || "Senha incorreta.");
            }
        } catch (error) {
            toast.error("Ocorreu um erro ao tentar fazer login.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col space-y-4">
            <h1 className="text-3xl font-bold text-sky-700">Spero Academy</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border">
                <h2 className="text-xl font-semibold mb-6 flex items-center justify-center">Acesso MASTER</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Input
                        disabled={isLoading}
                        type="password"
                        placeholder="Insira a senha de mestre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button disabled={isLoading} type="submit" className="w-full">
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    );
}
