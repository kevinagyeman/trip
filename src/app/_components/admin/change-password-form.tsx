"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import {
	changePasswordSchema,
	type ChangePasswordFormValues,
} from "@/lib/schemas/auth";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function ChangePasswordForm() {
	const t = useTranslations("settings");
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
	});

	const changePassword = api.user.changePassword.useMutation({
		onSuccess: () => {
			setSuccess(true);
			reset();
		},
		onError: () => setSuccess(false),
	});

	const onSubmit = (values: ChangePasswordFormValues) => {
		setSuccess(false);
		changePassword.mutate({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
			<CustomInput
				labelText={t("currentPassword")}
				inputType="password"
				error={errors.currentPassword?.message}
				inputProps={{ ...register("currentPassword") }}
			/>
			<CustomInput
				labelText={t("newPassword")}
				inputType="password"
				error={errors.newPassword?.message}
				inputProps={{ ...register("newPassword") }}
			/>
			<CustomInput
				labelText={t("confirmNewPassword")}
				inputType="password"
				error={errors.confirmPassword?.message}
				inputProps={{ ...register("confirmPassword") }}
			/>
			{changePassword.error && (
				<p className="text-sm text-destructive">
					{changePassword.error.message}
				</p>
			)}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					{t("passwordChanged")}
				</p>
			)}
			<LoadingButton type="submit" isLoading={changePassword.isPending} />
		</form>
	);
}
