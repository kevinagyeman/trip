"use client";

import { CopyLinkCard } from "@/app/_components/ui/copy-link-card";
import { useTranslations } from "next-intl";

export function BookingLinkCard({ url }: { url: string }) {
	const t = useTranslations("settings");

	return (
		<CopyLinkCard
			url={url}
			title={t("bookingLinkTitle")}
			subtitle={t("bookingLinkDesc")}
		/>
	);
}
