"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function Footer() {
	const t = useTranslations("footer");

	return (
		<footer className="mt-auto border-t bg-background">
			<div className="container mx-auto flex flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
				<p>
					© {new Date().getFullYear()} dantrip.com. {t("allRightsReserved")}
				</p>
				<div className="flex gap-2">
					<Button variant="ghost" size="sm">
						{t("privacyPolicy")}
					</Button>
					<Button variant="ghost" size="sm">
						{t("termsOfService")}
					</Button>
				</div>
			</div>
		</footer>
	);
}
