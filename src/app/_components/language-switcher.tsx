"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
		<div className="flex items-center rounded-md border p-0.5">
			{locales.map((l) => (
				<button
					key={l.code}
					type="button"
					onClick={() => router.replace(pathname, { locale: l.code })}
					className={cn(
						"rounded px-2 py-0.5 text-xs font-medium transition-colors",
						locale === l.code
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					{l.label}
				</button>
			))}
		</div>
	);
}
