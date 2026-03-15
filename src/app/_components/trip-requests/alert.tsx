"use client";

import { useTranslations } from "next-intl";
import { AlertBanner } from "@/app/_components/ui/alert-banner";

export function TripRequestAlert() {
	const t = useTranslations("tripRequest");

	return (
		<AlertBanner
			variant="info"
			title={t("helpAlertTitle")}
			description={t("helpAlertBody")}
		/>
	);
}
