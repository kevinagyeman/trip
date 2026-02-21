"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const locales = [
	{ code: "en", label: "EN" },
	{ code: "fr", label: "FR" },
	{ code: "de", label: "DE" },
	{ code: "it", label: "IT" },
] as const;

export function LanguageSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	return (
		<Select
			value={locale}
			onValueChange={(value) => router.replace(pathname, { locale: value })}
		>
			<SelectTrigger className="w-17.5">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{locales.map((l) => (
					<SelectItem key={l.code} value={l.code} className="cursor-pointer">
						{l.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
