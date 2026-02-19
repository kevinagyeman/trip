"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [verificationToken, setVerificationToken] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess(false);

		// Validate passwords match
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		// Validate password length
		if (password.length < 6) {
			setError("Password must be at least 6 characters long");
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
					name: name || undefined,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Registration failed");
			} else {
				setSuccess(true);
				setVerificationToken(data.verificationToken || "");
				// Redirect to sign-in after 3 seconds
				setTimeout(() => {
					router.push("/auth/signin?registered=true");
				}, 5000);
			}
		} catch (err) {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center text-green-600">
							Registration Successful!
						</CardTitle>
						<CardDescription className="text-center">
							Please verify your email address
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-green-50 border border-green-200 rounded-md p-4">
							<p className="text-sm text-green-800">
								A verification email has been sent to <strong>{email}</strong>
							</p>
							<p className="text-sm text-green-800 mt-2">
								Please check your email and click the verification link to
								activate your account.
							</p>
						</div>

						{verificationToken && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
								<p className="text-xs text-yellow-800 font-semibold mb-1">
									DEVELOPMENT MODE - Verification Link:
								</p>
								<a
									href={`/api/auth/verify-email?token=${verificationToken}`}
									className="text-xs text-blue-600 underline break-all"
								>
									Click here to verify your email
								</a>
								<p className="text-xs text-yellow-600 mt-2">
									(In production, this link would be sent via email)
								</p>
							</div>
						)}

						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								Redirecting to sign-in page in a few seconds...
							</p>
							<Link href="/auth/signin" className="text-sm text-blue-600 hover:underline mt-2 block">
								Or click here to sign in now
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Create an Account
					</CardTitle>
					<CardDescription className="text-center">
						Enter your details to register for Trip Manager
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email *</Label>
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
							<Label htmlFor="name">Name (Optional)</Label>
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password *</Label>
							<Input
								id="password"
								type="password"
								placeholder="At least 6 characters"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
								minLength={6}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password *</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Re-enter your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={isLoading}
								minLength={6}
							/>
						</div>

						{error && (
							<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating Account..." : "Register"}
						</Button>

						<div className="text-center text-sm">
							<span className="text-muted-foreground">
								Already have an account?{" "}
							</span>
							<Link
								href="/auth/signin"
								className="text-blue-600 hover:underline"
							>
								Sign In
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
