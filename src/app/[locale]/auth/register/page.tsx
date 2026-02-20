"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
	const router = useRouter();
	const t = useTranslations("auth");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [verificationToken, setVerificationToken] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess(false);

		if (password !== confirmPassword) {
			setError(t("passwordMismatch"));
			setIsLoading(false);
			return;
		}

		if (password.length < 6) {
			setError(t("passwordTooShort"));
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || t("registrationFailed"));
			} else {
				setSuccess(true);
				setVerificationToken(data.verificationToken || "");
				setTimeout(() => {
					router.push("/auth/signin?registered=true");
				}, 5000);
			}
		} catch {
			setError(t("unexpectedError"));
		} finally {
			setIsLoading(false);
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
								{t("verificationEmailSent")} <strong>{email}</strong>
							</p>
							<p className="mt-2 text-sm text-green-800">{t("checkEmail")}</p>
						</div>

						{verificationToken && (
							<div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
								<p className="mb-1 text-xs font-semibold text-yellow-800">
									{t("verificationLinkDev")}
								</p>
								<a
									href={`/api/auth/verify-email?token=${verificationToken}`}
									className="break-all text-xs text-blue-600 underline"
								>
									{t("clickToVerify")}
								</a>
								<p className="mt-2 text-xs text-yellow-600">{t("productionNote")}</p>
							</div>
						)}

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
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">{t("email")} *</Label>
							<Input
								id="email"
								type="email"
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">{t("passwordRequired")}</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								minLength={6}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={isLoading}
								minLength={6}
							/>
						</div>

						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? t("registering") : t("createAccount")}
						</Button>

						<div className="text-center text-sm">
							<span className="text-muted-foreground">
								{t("alreadyHaveAccount")}{" "}
							</span>
							<Link href="/auth/signin" className="text-blue-600 hover:underline">
								{t("signIn")}
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
