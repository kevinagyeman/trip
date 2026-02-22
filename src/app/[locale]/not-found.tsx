"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	const t = useTranslations("notFound");

	return (
		<div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center gap-6 p-8 text-center">
			<p className="text-9xl font-black tracking-tighter text-primary">404</p>
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{t("heading")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>
			<Link href="/">
				<Button size="lg">{t("backHome")}</Button>
			</Link>
		</div>
	);
}
