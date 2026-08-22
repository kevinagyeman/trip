"use client";

import { AlertBanner } from "@/app/_components/ui/alert-banner";
import { useLocale } from "next-intl";

export function BannerDisplay({ bannerMessage }: { bannerMessage: string }) {
	const locale = useLocale();

	let text = "";
	try {
		const msgs = JSON.parse(bannerMessage) as Record<string, string>;
		text = msgs[locale] || msgs.en || "";
	} catch {
		// ignore
	}

	if (!text) return null;
	return <AlertBanner variant="info" description={text} />;
}
