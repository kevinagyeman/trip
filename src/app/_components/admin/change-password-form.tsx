"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ChangePasswordForm() {
	const t = useTranslations("settings");
	const tAuth = useTranslations("auth");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const changePassword = api.user.changePassword.useMutation({
		onSuccess: () => {
			setSuccess(true);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
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

		if (newPassword !== confirmPassword) {
			setError(tAuth("passwordMismatch"));
			return;
		}
		if (newPassword.length < 6) {
			setError(tAuth("passwordTooShort"));
			return;
		}

		changePassword.mutate({ currentPassword, newPassword });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
			<CustomInput
				labelText={t("currentPassword")}
				inputType="password"
				inputProps={{
					value: currentPassword,
					onChange: (e) => setCurrentPassword(e.target.value),
					required: true,
				}}
			/>
			<CustomInput
				labelText={t("newPassword")}
				inputType="password"
				inputProps={{
					value: newPassword,
					onChange: (e) => setNewPassword(e.target.value),
					required: true,
				}}
			/>
			<CustomInput
				labelText={t("confirmNewPassword")}
				inputType="password"
				inputProps={{
					value: confirmPassword,
					onChange: (e) => setConfirmPassword(e.target.value),
					required: true,
				}}
			/>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					{t("passwordChanged")}
				</p>
			)}
			<Button type="submit" disabled={changePassword.isPending}>
				{changePassword.isPending ? t("saving") : t("changePasswordButton")}
			</Button>
		</form>
	);
}
