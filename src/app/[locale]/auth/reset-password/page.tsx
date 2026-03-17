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
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
	const t = useTranslations("auth");
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [done, setDone] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (!token) {
		return (
			<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
				{t("invalidResetLink")}
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (password !== confirm) {
			setError(t("passwordMismatch"));
			return;
		}
		if (password.length < 6) {
			setError(t("passwordTooShort"));
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});
			const data = (await res.json()) as { error?: string };
			if (!res.ok) {
				setError(data.error ?? t("somethingWentWrong"));
			} else {
				setDone(true);
			}
		} catch {
			setError(t("somethingWentWrong"));
		} finally {
			setLoading(false);
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
				<form onSubmit={handleSubmit} className="space-y-4">
					<CustomInput
						labelText={t("newPassword")}
						inputType="password"
						placeholder="At least 6 characters"
						inputProps={{
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true,
							disabled: loading,
						}}
					/>
					<CustomInput
						labelText={t("confirmNewPassword")}
						inputType="password"
						placeholder="Repeat password"
						inputProps={{
							value: confirm,
							onChange: (e) => setConfirm(e.target.value),
							required: true,
							disabled: loading,
						}}
					/>
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</div>
					)}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? t("saving") : t("resetPasswordButton")}
					</Button>
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
