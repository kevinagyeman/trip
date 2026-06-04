"use client";

import CustomSelect from "@/app/_components/ui/custom-select";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const LANGUAGES = [
	{ value: "en", label: "en" },
	{ value: "it", label: "it" },
];

export function ChangeLanguageForm({
	currentLanguage,
}: {
	currentLanguage: string;
}) {
	const t = useTranslations("settings");
	const [language, setLanguage] = useState(currentLanguage);
	const [success, setSuccess] = useState(false);

	const changeLanguage = api.user.changeLanguage.useMutation({
		onSuccess: () => setSuccess(true),
		onError: () => setSuccess(false),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSuccess(false);
		changeLanguage.mutate({ language: language as "en" | "it" });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<p className="text-sm text-muted-foreground">{t("languageNotice")}</p>
			<CustomSelect
				labelText={t("preferredLanguage")}
				options={LANGUAGES}
				value={language}
				onValueChange={(v) => {
					setLanguage(v);
					setSuccess(false);
				}}
			/>
			<LoadingButton type="submit" isLoading={changeLanguage.isPending} />
		</form>
	);
}
