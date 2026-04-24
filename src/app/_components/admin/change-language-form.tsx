"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const LANGUAGES = [
	{ value: "en", label: "English" },
	{ value: "it", label: "Italiano" },
] as const;

export function ChangeLanguageForm({
	currentLanguage,
}: {
	currentLanguage: string;
}) {
	const t = useTranslations("settings");
	const [language, setLanguage] = useState(currentLanguage);
	const [success, setSuccess] = useState(false);

	const changeLanguage = api.user.changeLanguage.useMutation({
		onSuccess: () => {
			setSuccess(true);
		},
		onError: () => {
			setSuccess(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSuccess(false);
		changeLanguage.mutate({
			language: language as "en" | "it",
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
			<p className="text-sm text-muted-foreground">{t("languageNotice")}</p>
			<div className="space-y-1">
				<label className="text-sm font-medium">{t("preferredLanguage")}</label>
				<select
					value={language}
					onChange={(e) => {
						setLanguage(e.target.value);
						setSuccess(false);
					}}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
				>
					{LANGUAGES.map((l) => (
						<option key={l.value} value={l.value}>
							{l.label}
						</option>
					))}
				</select>
			</div>
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					{t("languageUpdated")}
				</p>
			)}
			<LoadingButton type="submit" isLoading={changeLanguage.isPending}>
				{t("changeLanguageButton")}
			</LoadingButton>
		</form>
	);
}
