"use client";

import { NotFoundView } from "@/app/_components/ui/not-found-view";
import { useTranslations } from "next-intl";

export default function NotFound() {
	const t = useTranslations("notFound");

	return (
		<NotFoundView
			heading={t("heading")}
			description={t("description")}
			backHome={t("backHome")}
		/>
	);
}
