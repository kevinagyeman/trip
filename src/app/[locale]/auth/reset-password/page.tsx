"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import {
	resetPasswordSchema,
	type ResetPasswordFormValues,
} from "@/lib/schemas/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

function ResetPasswordForm() {
	const t = useTranslations("auth");
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";
	const [done, setDone] = useState(false);
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
	});

	if (!token) {
		return (
			<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{t("invalidResetLink")}
			</div>
		);
	}

	const onSubmit = async (values: ResetPasswordFormValues) => {
		setServerError("");
		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password: values.password }),
			});
			const data = (await res.json()) as { error?: string };
			if (!res.ok) {
				setServerError(data.error ?? t("somethingWentWrong"));
			} else {
				setDone(true);
			}
		} catch {
			setServerError(t("somethingWentWrong"));
		}
	};

	return (
		<>
			{done ? (
				<div className="space-y-4">
					<div className="rounded-md border border-green-200 bg-green-50 p-3">
						<p className="text-sm text-green-800">
							{t("passwordResetSuccess")}
						</p>
					</div>
					<div className="text-center text-sm">
						<Link href="/auth/signin" className="text-blue-600 hover:underline">
							{t("signIn")}
						</Link>
					</div>
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<CustomInput
						labelText={t("newPassword")}
						inputType="password"
						error={errors.password?.message}
						inputProps={{ ...register("password"), disabled: isSubmitting }}
					/>
					<CustomInput
						labelText={t("confirmNewPassword")}
						inputType="password"
						error={errors.confirmPassword?.message}
						inputProps={{
							...register("confirmPassword"),
							disabled: isSubmitting,
						}}
					/>
					{serverError && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{serverError}
						</div>
					)}
					<LoadingButton
						type="submit"
						className="w-full"
						isLoading={isSubmitting}
					>
						{t("resetPasswordButton")}
					</LoadingButton>
				</form>
			)}
		</>
	);
}

export default function ResetPasswordPage() {
	const t = useTranslations("auth");
	return (
		<div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						{t("resetPasswordTitle")}
					</CardTitle>
					<CardDescription className="text-center">
						{t("resetPasswordSubtitle")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense>
						<ResetPasswordForm />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
