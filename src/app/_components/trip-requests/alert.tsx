"use client";

import { useTranslations } from "next-intl";

export function TripRequestAlert() {
	const t = useTranslations("tripRequest");

	return (
		<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-950/30">
			<p className="font-semibold text-blue-900 dark:text-blue-200">
				{t("helpAlertTitle")}
			</p>
			<p className="mt-2 whitespace-pre-line text-blue-800 dark:text-blue-300">
				{t("helpAlertBody")}
			</p>
		</div>
	);
}
