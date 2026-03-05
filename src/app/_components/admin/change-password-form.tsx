"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useState } from "react";

export function ChangePasswordForm() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const changePassword = api.user.changePassword.useMutation({
		onSuccess: () => {
			setSuccess(true);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
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

		if (newPassword !== confirmPassword) {
			setError("New passwords do not match");
			return;
		}
		if (newPassword.length < 6) {
			setError("New password must be at least 6 characters");
			return;
		}

		changePassword.mutate({ currentPassword, newPassword });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
			<div className="space-y-1">
				<Label htmlFor="currentPassword">Current Password</Label>
				<Input
					id="currentPassword"
					type="password"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					required
				/>
			</div>
			<div className="space-y-1">
				<Label htmlFor="newPassword">New Password</Label>
				<Input
					id="newPassword"
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					required
				/>
			</div>
			<div className="space-y-1">
				<Label htmlFor="confirmPassword">Confirm New Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
			{success && (
				<p className="text-sm text-green-600 dark:text-green-400">
					Password changed successfully.
				</p>
			)}
			<Button type="submit" disabled={changePassword.isPending}>
				{changePassword.isPending ? "Saving..." : "Change Password"}
			</Button>
		</form>
	);
}
