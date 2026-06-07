"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Switch } from "@/components/ui/switch";
import type { EmailPreferences } from "@/server/email-preferences";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const KEYS: {
	key: keyof EmailPreferences;
	labelKey: string;
	descKey: string;
}[] = [
	{
		key: "newTripRequest",
		labelKey: "emailPrefNewTripRequest",
		descKey: "emailPrefNewTripRequestDesc",
	},
	{
		key: "quotationAccepted",
		labelKey: "emailPrefQuotationAccepted",
		descKey: "emailPrefQuotationAcceptedDesc",
	},
	{
		key: "quotationRejected",
		labelKey: "emailPrefQuotationRejected",
		descKey: "emailPrefQuotationRejectedDesc",
	},
	{
		key: "customerMessage",
		labelKey: "emailPrefCustomerMessage",
		descKey: "emailPrefCustomerMessageDesc",
	},
	{
		key: "tripDetailsUpdated",
		labelKey: "emailPrefTripDetailsUpdated",
		descKey: "emailPrefTripDetailsUpdatedDesc",
	},
];

export function EmailPreferencesForm() {
	const t = useTranslations("settings");
	const { data: prefs, isLoading } = api.company.getEmailPreferences.useQuery();
	const update = api.company.updateEmailPreferences.useMutation();
	const utils = api.useUtils();

	const [local, setLocal] = useState<EmailPreferences | null>(null);
	const current = local ?? prefs;

	function toggle(key: keyof EmailPreferences, value: boolean) {
		if (!current) return;
		setLocal({ ...(local ?? prefs!), [key]: value });
	}

	function save() {
		if (!current) return;
		update.mutate(current, {
			onSuccess: () => {
				void utils.company.getEmailPreferences.invalidate();
				setLocal(null);
			},
		});
	}

	if (isLoading || !current) {
		return <div className="py-4 text-sm text-muted-foreground">Loading…</div>;
	}

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				{t("emailPreferencesDesc")}
			</p>
			<div className="space-y-3">
				{KEYS.map(({ key, labelKey, descKey }) => (
					<div key={key} className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-medium">
								{t(labelKey as Parameters<typeof t>[0])}
							</p>
							<p className="text-xs text-muted-foreground">
								{t(descKey as Parameters<typeof t>[0])}
							</p>
						</div>
						<Switch
							checked={current[key]}
							onCheckedChange={(val) => toggle(key, val)}
						/>
					</div>
				))}
			</div>
			<LoadingButton isLoading={update.isPending} onClick={save} />
		</div>
	);
}
