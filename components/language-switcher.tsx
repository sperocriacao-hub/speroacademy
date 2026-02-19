"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onLocaleChange = (newLocale: string) => {
        router.replace(
            pathname,
            { locale: newLocale }
        );
    };

    return (
        <Select defaultValue={locale} onValueChange={onLocaleChange}>
            <SelectTrigger className="w-fit bg-transparent border-none shadow-none focus:ring-0">
                <Globe className="h-4 w-4 mr-2 text-slate-600" />
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="pt-BR">Português (BR)</SelectItem>
                <SelectItem value="pt-PT">Português (PT)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
            </SelectContent>
        </Select>
    );
};
