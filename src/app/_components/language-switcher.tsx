"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LANGUAGES } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const current = LANGUAGES.find((l) => l.value === locale);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" size="sm" className="gap-1 font-light">
					{current?.label ?? locale.toUpperCase()}
					<ChevronDown className="h-3 w-3 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{LANGUAGES.map((l) => (
					<DropdownMenuItem
						key={l.value}
						onClick={() => router.replace(pathname, { locale: l.value })}
						className="font-light cursor-pointer"
					>
						{l.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
