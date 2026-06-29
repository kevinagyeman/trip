"use client";

import CustomSelect from "@/app/_components/ui/custom-select";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { LANGUAGES, type Locale } from "@/lib/constants";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ChangeLanguageForm({
	currentLanguage,
}: {
	currentLanguage: string;
}) {
	const t = useTranslations("settings");
	const [language, setLanguage] = useState<Locale>(currentLanguage as Locale);
	const [success, setSuccess] = useState(false);

	const changeLanguage = api.user.changeLanguage.useMutation({
		onSuccess: () => setSuccess(true),
		onError: () => setSuccess(false),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSuccess(false);
		changeLanguage.mutate({ language });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<p className="text-sm text-muted-foreground">{t("languageNotice")}</p>
			<CustomSelect
				labelText={t("preferredLanguage")}
				options={LANGUAGES}
				value={language}
				onValueChange={(v) => {
					setLanguage(v as Locale);
					setSuccess(false);
				}}
			/>
			<LoadingButton type="submit" isLoading={changeLanguage.isPending} />
		</form>
	);
}
