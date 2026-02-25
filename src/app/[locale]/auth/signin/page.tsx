"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { signInSchema, type SignInFormValues } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
	const verified = searchParams.get("verified") === "true";
	const registered = searchParams.get("registered") === "true";
	const t = useTranslations("auth");
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (values: SignInFormValues) => {
		setServerError("");
		try {
			const result = await signIn("credentials", {
				email: values.email,
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				setServerError(
					result.error.includes("verify")
						? t("verifyEmail")
						: t("invalidCredentials"),
				);
			} else if (result?.ok) {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setServerError(t("unexpectedError"));
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						{t("welcomeBack")}
					</CardTitle>
					<CardDescription className="text-center">
						{t("signInSubtitle")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{verified && (
						<div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
							<p className="text-sm text-green-800">{t("emailVerified")}</p>
						</div>
					)}
					{registered && (
						<div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
							<p className="text-sm text-blue-800">
								{t("registrationSuccess")}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<CustomInput
							labelText={t("email")}
							inputType="email"
							placeholder="your@email.com"
							error={errors.email?.message}
							inputProps={{ ...register("email"), disabled: isSubmitting }}
						/>

						<CustomInput
							labelText={t("password")}
							inputType="password"
							placeholder="Password"
							error={errors.password?.message}
							inputProps={{ ...register("password"), disabled: isSubmitting }}
						/>

						{serverError && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{serverError}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? t("signingIn") : t("signIn")}
						</Button>

						<div className="text-center text-sm">
							<span className="text-muted-foreground">{t("noAccount")} </span>
							<Link
								href="/auth/register"
								className="text-blue-600 hover:underline"
							>
								{t("register")}
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default function SignInPage() {
	return (
		<Suspense>
			<SignInForm />
		</Suspense>
	);
}
