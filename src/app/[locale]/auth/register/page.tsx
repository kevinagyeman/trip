"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import CustomInput from "@/app/_components/ui/custom-input";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth";

export default function RegisterPage() {
	const router = useRouter();
	const t = useTranslations("auth");
	const [serverError, setServerError] = useState("");
	const [success, setSuccess] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (values: RegisterFormValues) => {
		setServerError("");
		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: values.email,
					password: values.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setServerError(data.error || t("registrationFailed"));
			} else {
				setRegisteredEmail(values.email);
				setSuccess(true);
				setTimeout(() => {
					router.push("/auth/signin?registered=true");
				}, 5000);
			}
		} catch {
			setServerError(t("unexpectedError"));
		}
	};

	if (success) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-center text-2xl font-bold text-green-600">
							{t("registrationSuccessTitle")}
						</CardTitle>
						<CardDescription className="text-center">
							{t("verifyEmailSubtitle")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-md border border-green-200 bg-green-50 p-4">
							<p className="text-sm text-green-800">
								{t("verificationEmailSent")} <strong>{registeredEmail}</strong>
							</p>
							<p className="mt-2 text-sm text-green-800">{t("checkEmail")}</p>
						</div>
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								{t("redirectingSignIn")}
							</p>
							<Link
								href="/auth/signin"
								className="mt-2 block text-sm text-blue-600 hover:underline"
							>
								{t("clickToSignIn")}
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						{t("createAccount")}
					</CardTitle>
					<CardDescription className="text-center">
						{t("registerSubtitle")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<CustomInput
							labelText={`${t("email")} *`}
							inputType="email"
							placeholder="your@email.com"
							error={errors.email?.message}
							inputProps={{ ...register("email"), disabled: isSubmitting }}
						/>

						<CustomInput
							labelText={t("passwordRequired")}
							inputType="password"
							error={errors.password?.message}
							inputProps={{ ...register("password"), disabled: isSubmitting }}
						/>

						<CustomInput
							labelText={t("confirmPassword")}
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

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? t("registering") : t("createAccount")}
						</Button>

						<div className="text-center text-sm">
							<span className="text-muted-foreground">
								{t("alreadyHaveAccount")}{" "}
							</span>
							<Link
								href="/auth/signin"
								className="text-blue-600 hover:underline"
							>
								{t("signIn")}
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
