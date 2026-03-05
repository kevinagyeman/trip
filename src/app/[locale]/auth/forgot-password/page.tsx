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
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setError(data.error ?? "Something went wrong");
			} else {
				setSubmitted(true);
			}
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						Forgot Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email to receive a reset link
					</CardDescription>
				</CardHeader>
				<CardContent>
					{submitted ? (
						<div className="space-y-4">
							<div className="rounded-md border border-green-200 bg-green-50 p-3">
								<p className="text-sm text-green-800">
									If an account exists for <strong>{email}</strong>, a password
									reset link has been sent. Check your inbox and spam folder.
								</p>
							</div>
							<div className="text-center text-sm">
								<Link
									href="/auth/signin"
									className="text-blue-600 hover:underline"
								>
									Back to Sign In
								</Link>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<CustomInput
								labelText="Email"
								inputType="email"
								placeholder="your@email.com"
								inputProps={{
									value: email,
									onChange: (e) => setEmail(e.target.value),
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
								{loading ? "Sending..." : "Send Reset Link"}
							</Button>
							<div className="text-center text-sm">
								<Link
									href="/auth/signin"
									className="text-blue-600 hover:underline"
								>
									Back to Sign In
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
