"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Users, FileText, Mail, Globe } from "lucide-react";

export function CompanyDetail({ id }: { id: string }) {
	const t = useTranslations("superAdmin");
	const utils = api.useUtils();
	const { data: company, isLoading } = api.company.getById.useQuery({ id });
	const [assignEmail, setAssignEmail] = useState("");
	const [assignRole, setAssignRole] = useState<"USER" | "ADMIN">("ADMIN");
	const [assignError, setAssignError] = useState<string | null>(null);

	const updateCompany = api.company.update.useMutation({
		onSuccess: () => void utils.company.getById.invalidate({ id }),
	});

	const removeUser = api.company.removeUser.useMutation({
		onSuccess: () => void utils.company.getById.invalidate({ id }),
	});

	if (isLoading) {
		return <p className="text-muted-foreground">{t("loading")}</p>;
	}

	if (!company) {
		return <p className="text-muted-foreground">{t("notFound")}</p>;
	}

	async function handleAssignUser(e: React.FormEvent) {
		e.preventDefault();
		setAssignError(null);
		// Find user by email, then assign
		try {
			const res = await fetch(`/api/super-admin/find-user?email=${encodeURIComponent(assignEmail)}`);
			if (!res.ok) {
				const data = await res.json() as { error?: string };
				setAssignError(data.error ?? t("userNotFound"));
				return;
			}
			const data = await res.json() as { id: string };
			await utils.client.company.assignUser.mutate({
				userId: data.id,
				companyId: id,
				role: assignRole,
			});
			void utils.company.getById.invalidate({ id });
			setAssignEmail("");
		} catch {
			setAssignError(t("assignError"));
		}
	}

	return (
		<div className="space-y-6">
			{/* Company header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold">{company.name}</h1>
					<p className="font-mono text-muted-foreground">/{company.slug}</p>
				</div>
				<div className="flex gap-2">
					<Badge variant={company.isActive ? "default" : "secondary"}>
						{company.isActive ? t("active") : t("inactive")}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							updateCompany.mutate({ id, isActive: !company.isActive })
						}
					>
						{company.isActive ? t("deactivate") : t("activate")}
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 pt-6">
						<Users className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-2xl font-bold">{company.users.length}</p>
							<p className="text-sm text-muted-foreground">{t("users")}</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 pt-6">
						<FileText className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-2xl font-bold">{company._count.tripRequests}</p>
							<p className="text-sm text-muted-foreground">{t("requests")}</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 pt-6">
						<Globe className="h-8 w-8 text-muted-foreground" />
						<div>
							<p className="text-sm font-mono text-muted-foreground">/{company.slug}</p>
							<p className="text-sm text-muted-foreground">{t("bookingPortal")}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Company details */}
			{company.adminEmail && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">{t("companyInfo")}</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center gap-2 text-sm">
						<Mail className="h-4 w-4 text-muted-foreground" />
						<span>{company.adminEmail}</span>
					</CardContent>
				</Card>
			)}

			{/* Users */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">{t("companyUsers")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{company.users.length === 0 ? (
						<p className="text-sm text-muted-foreground">{t("noUsers")}</p>
					) : (
						<div className="divide-y">
							{company.users.map((user) => (
								<div key={user.id} className="flex items-center justify-between py-2">
									<div>
										<p className="text-sm font-medium">{user.name ?? user.email}</p>
										<p className="text-xs text-muted-foreground">{user.email}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline">{user.role}</Badge>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => removeUser.mutate({ userId: user.id })}
											className="text-destructive hover:text-destructive"
										>
											{t("removeUser")}
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Assign user form */}
					<form onSubmit={handleAssignUser} className="flex gap-2 pt-2">
						<input
							type="email"
							value={assignEmail}
							onChange={(e) => setAssignEmail(e.target.value)}
							required
							placeholder={t("assignUserEmail")}
							className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
						/>
						<select
							value={assignRole}
							onChange={(e) => setAssignRole(e.target.value as "USER" | "ADMIN")}
							className="rounded-md border bg-background px-3 py-2 text-sm"
						>
							<option value="ADMIN">ADMIN</option>
							<option value="USER">USER</option>
						</select>
						<Button type="submit" size="sm">
							{t("assignUser")}
						</Button>
					</form>
					{assignError && (
						<p className="text-sm text-destructive">{assignError}</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
