"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import {
	changeEmailSchema,
	type ChangeEmailFormValues,
} from "@/lib/schemas/auth";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
	const t = useTranslations("settings");
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ChangeEmailFormValues>({
		resolver: zodResolver(changeEmailSchema),
	});

	const changeEmail = api.user.changeEmail.useMutation({
		onSuccess: () => {
			setSuccess(true);
			reset();
		},
		onError: () => setSuccess(false),
	});

	const onSubmit = (values: ChangeEmailFormValues) => {
		setSuccess(false);
		changeEmail.mutate(values);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
			<p className="text-sm text-muted-foreground">
				{t("currentEmail")}:{" "}
				<span className="font-medium text-foreground">{currentEmail}</span>
			</p>
			<CustomInput
				labelText={t("newEmail")}
				inputType="email"
				placeholder="new@email.com"
				error={errors.newEmail?.message}
				inputProps={{ ...register("newEmail") }}
			/>
			<CustomInput
				labelText={t("currentPassword")}
				inputType="password"
				error={errors.currentPassword?.message}
				inputProps={{ ...register("currentPassword") }}
			/>
			{changeEmail.error && (
				<p className="text-sm text-destructive">{changeEmail.error.message}</p>
			)}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					{t("emailUpdated")}
				</p>
			)}
			<LoadingButton type="submit" isLoading={changeEmail.isPending}>
				{t("changeEmailButton")}
			</LoadingButton>
		</form>
	);
}
