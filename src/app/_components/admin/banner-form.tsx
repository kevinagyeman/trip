"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/constants";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

function parseMessages(raw: string): Record<string, string> {
	try {
		return JSON.parse(raw) as Record<string, string>;
	} catch {
		return {};
	}
}

export function BannerForm({ currentValue }: { currentValue: string }) {
	const t = useTranslations("settings");
	const parsed = parseMessages(currentValue);
	const [messages, setMessages] = useState<Record<string, string>>(
		Object.fromEntries(LANGUAGES.map((l) => [l.value, parsed[l.value] ?? ""])),
	);

	const update = api.company.updateBanner.useMutation({
		onSuccess: () => toast.success(t("saved")),
	});

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">{t("bannerDesc")}</p>

			{LANGUAGES.map((lang) => (
				<div key={lang.value} className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{lang.label}
					</p>
					<Textarea
						value={messages[lang.value] ?? ""}
						onChange={(e) =>
							setMessages((prev) => ({ ...prev, [lang.value]: e.target.value }))
						}
						placeholder={t("bannerPlaceholder")}
						rows={3}
						className="resize-none"
					/>
				</div>
			))}

			<LoadingButton
				type="button"
				isLoading={update.isPending}
				onClick={() => update.mutate({ messages })}
			/>
		</div>
	);
}
