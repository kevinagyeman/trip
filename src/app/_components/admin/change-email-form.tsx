"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AlertBanner } from "@/app/_components/ui/alert-banner";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
	const t = useTranslations("settings");
	const [newEmail, setNewEmail] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const changeEmail = api.user.changeEmail.useMutation({
		onSuccess: () => {
			setSuccess(true);
			setNewEmail("");
			setCurrentPassword("");
			setError("");
		},
		onError: (e) => {
			setError(e.message);
			setSuccess(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);
		changeEmail.mutate({ newEmail, currentPassword });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
			<AlertBanner variant="info" description={t("emailNotice")} />
			<p className="text-sm text-muted-foreground">
				{t("currentEmail")}:{" "}
				<span className="font-medium text-foreground">{currentEmail}</span>
			</p>
			<CustomInput
				labelText={t("newEmail")}
				inputType="email"
				placeholder="new@email.com"
				inputProps={{
					value: newEmail,
					onChange: (e) => setNewEmail(e.target.value),
					required: true,
				}}
			/>
			<CustomInput
				labelText={t("currentPassword")}
				inputType="password"
				inputProps={{
					value: currentPassword,
					onChange: (e) => setCurrentPassword(e.target.value),
					required: true,
				}}
			/>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					{t("emailUpdated")}
				</p>
			)}
			<Button type="submit" disabled={changeEmail.isPending}>
				{changeEmail.isPending ? t("saving") : t("changeEmailButton")}
			</Button>
		</form>
	);
}
