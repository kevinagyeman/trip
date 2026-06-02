"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PageCenter } from "@/app/_components/ui/page-center";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
	forgotPasswordSchema,
	type ForgotPasswordFormValues,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
	const t = useTranslations("auth");
	const [submitted, setSubmitted] = useState(false);
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (values: ForgotPasswordFormValues) => {
		setServerError("");
		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setServerError(data.error ?? t("somethingWentWrong"));
			} else {
				setSubmitted(true);
			}
		} catch {
			setServerError(t("somethingWentWrong"));
		}
	};

	return (
		<PageCenter>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						{t("forgotPasswordTitle")}
					</CardTitle>
					<CardDescription className="text-center">
						{t("forgotPasswordSubtitle")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{submitted ? (
						<div className="space-y-4">
							<div className="rounded-md border border-green-200 bg-green-50 p-3">
								<p className="text-sm text-green-800">
									{t("forgotPasswordEmailSent", { email: getValues("email") })}
								</p>
							</div>
							<div className="text-center text-sm">
								<Link
									href="/auth/signin"
									className="text-blue-600 hover:underline"
								>
									{t("backToSignIn")}
								</Link>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<CustomInput
								labelText={t("email")}
								inputType="email"
								placeholder="your@email.com"
								error={errors.email?.message}
								inputProps={{ ...register("email"), disabled: isSubmitting }}
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
								{t("sendResetLink")}
							</LoadingButton>
							<div className="text-center text-sm">
								<Link
									href="/auth/signin"
									className="text-blue-600 hover:underline"
								>
									{t("backToSignIn")}
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</PageCenter>
	);
}
