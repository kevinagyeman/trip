"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/quick-fill";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const DEFAULTS: Record<string, string> = {
	en: "Please note that this is an estimate based on the information provided. The final price may vary depending on the departure time — night or early morning transfers may incur a surcharge.",
	it: "Ti informiamo che questo è un preventivo indicativo. Il prezzo finale potrebbe variare in base all'orario di partenza — i trasferimenti notturni o nelle prime ore del mattino potrebbero prevedere un supplemento.",
};

function parseNotices(raw: string): Record<string, string> {
	try {
		return JSON.parse(raw) as Record<string, string>;
	} catch {
		return {};
	}
}

export function EstimateNoticeForm({ currentValue }: { currentValue: string }) {
	const t = useTranslations("settings");
	const parsed = parseNotices(currentValue);
	const [notices, setNotices] = useState<Record<string, string>>(
		Object.fromEntries(
			LANGUAGES.map((l) => [
				l.value,
				parsed[l.value] ?? DEFAULTS[l.value] ?? "",
			]),
		),
	);
	const update = api.user.updateEstimateNotice.useMutation();

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">{t("estimateNoticeDesc")}</p>

			{LANGUAGES.map((lang) => (
				<div key={lang.value} className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{lang.label}
					</p>
					<Textarea
						value={notices[lang.value] ?? ""}
						onChange={(e) =>
							setNotices((prev) => ({ ...prev, [lang.value]: e.target.value }))
						}
						rows={3}
						className="resize-none"
					/>
				</div>
			))}

			<LoadingButton
				type="button"
				isLoading={update.isPending}
				onClick={() => update.mutate({ notices })}
			>
				{t("save")}
			</LoadingButton>
		</div>
	);
}
