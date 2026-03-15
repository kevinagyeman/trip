"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";
import { AlertBanner } from "@/app/_components/ui/alert-banner";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
	const [newEmail, setNewEmail] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const changeEmail = api.user.changeEmail.useMutation({
		onSuccess: () => {
			setSuccess(true);
			setNewEmail("");
			setCurrentPassword("");
			setError("");
		},
		onError: (e) => {
			setError(e.message);
			setSuccess(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);
		changeEmail.mutate({ newEmail, currentPassword });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
			<AlertBanner
				variant="info"
				description="This is the address where all notifications are sent — new trip requests, quotation responses, and booking confirmations."
			/>
			<p className="text-sm text-muted-foreground">
				Current email:{" "}
				<span className="font-medium text-foreground">{currentEmail}</span>
			</p>
			<CustomInput
				labelText="New Email"
				inputType="email"
				placeholder="new@email.com"
				inputProps={{
					value: newEmail,
					onChange: (e) => setNewEmail(e.target.value),
					required: true,
				}}
			/>
			<CustomInput
				labelText="Current Password"
				inputType="password"
				inputProps={{
					value: currentPassword,
					onChange: (e) => setCurrentPassword(e.target.value),
					required: true,
				}}
			/>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					Email updated successfully. Please sign in again.
				</p>
			)}
			<Button type="submit" disabled={changeEmail.isPending}>
				{changeEmail.isPending ? "Saving..." : "Change Email"}
			</Button>
		</form>
	);
}
